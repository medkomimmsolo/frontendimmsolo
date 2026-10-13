import { NextRequest, NextResponse } from 'next/server';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

// Proxy gambar ini dipakai crop tool di dashboard untuk mengambil gambar
// (media library / URL eksternal) lalu menggambarnya ke <canvas>. Karena
// berjalan di server, ia berisiko SSRF: tanpa validasi, penyerang bisa memakai
// endpoint ini untuk menembak alamat internal (127.0.0.1, 169.254.169.254
// metadata cloud, dst). Proteksi di bawah: hanya http/https, host harus resolve
// ke IP publik, tanpa redirect, ada timeout, dan hanya konten gambar.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const FETCH_TIMEOUT_MS = 8000;
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_REDIRECTS = 0; // gambar media library tidak butuh redirect

/** Apakah IPv4 termasuk rentang privat/reserved yang tidak boleh diakses. */
function isBlockedIPv4(ip: string): boolean {
  const parts = ip.split('.').map((p) => Number(p));
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) {
    return true; // tidak bisa diparse -> anggap berbahaya
  }
  const [a, b] = parts;
  return (
    a === 0 || // 0.0.0.0/8 "this network"
    a === 10 || // 10.0.0.0/8 privat
    a === 127 || // 127.0.0.0/8 loopback
    (a === 100 && b >= 64 && b <= 127) || // 100.64.0.0/10 CGNAT
    (a === 169 && b === 254) || // 169.254.0.0/16 link-local (metadata cloud)
    (a === 172 && b >= 16 && b <= 31) || // 172.16.0.0/12 privat
    (a === 192 && b === 0) || // 192.0.0.0/24 IETF protocol assignments
    (a === 192 && b === 168) || // 192.168.0.0/16 privat
    (a === 198 && (b === 18 || b === 19)) || // 198.18.0.0/15 benchmarking
    a >= 224 // 224.0.0.0/4 multicast + 240.0.0.0/4 reserved
  );
}

/** Apakah IPv6 termasuk rentang privat/reserved. */
function isBlockedIPv6(ip: string): boolean {
  const addr = ip.toLowerCase().split('%')[0]; // buang zone id

  // IPv4-mapped (::ffff:1.2.3.4) & IPv4-compatible -> periksa sebagai IPv4.
  const mapped = addr.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isBlockedIPv4(mapped[1]);

  if (addr === '::' || addr === '::1') return true; // unspecified / loopback
  if (addr.startsWith('fe8') || addr.startsWith('fe9') || addr.startsWith('fea') || addr.startsWith('feb')) {
    return true; // fe80::/10 link-local
  }
  if (addr.startsWith('fc') || addr.startsWith('fd')) return true; // fc00::/7 unique-local
  if (addr.startsWith('ff')) return true; // ff00::/8 multicast
  if (addr.startsWith('2001:db8')) return true; // dokumentasi
  return false;
}

function isBlockedAddress(ip: string): boolean {
  const family = isIP(ip);
  if (family === 4) return isBlockedIPv4(ip);
  if (family === 6) return isBlockedIPv6(ip);
  return true;
}

/**
 * Validasi URL & pastikan host-nya tidak menunjuk ke jaringan internal.
 * Mengembalikan URL bila aman, atau alasan penolakan.
 */
async function assertSafeUrl(raw: string): Promise<{ ok: true; url: URL } | { ok: false; reason: string }> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { ok: false, reason: 'URL tidak valid' };
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return { ok: false, reason: 'Protokol URL tidak valid' };
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, ''); // IPv6 literal tanpa bracket

  // Jika host adalah literal IP, periksa langsung.
  if (isIP(hostname)) {
    return isBlockedAddress(hostname)
      ? { ok: false, reason: 'Alamat tujuan tidak diizinkan' }
      : { ok: true, url };
  }

  // Resolve semua alamat (A & AAAA) dan tolak bila ada yang internal.
  let addresses: { address: string }[];
  try {
    addresses = await lookup(hostname, { all: true });
  } catch {
    return { ok: false, reason: 'Host tidak dapat diresolusi' };
  }

  if (addresses.length === 0) {
    return { ok: false, reason: 'Host tidak dapat diresolusi' };
  }

  if (addresses.some((a) => isBlockedAddress(a.address))) {
    return { ok: false, reason: 'Alamat tujuan tidak diizinkan' };
  }

  return { ok: true, url };
}

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get('url');

  if (!raw) {
    return new NextResponse('Parameter url diperlukan', { status: 400 });
  }

  const check = await assertSafeUrl(raw);
  if (!check.ok) {
    return new NextResponse(check.reason, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(check.url, {
      cache: 'no-store',
      redirect: 'manual', // jangan ikuti redirect (bisa menuju alamat internal)
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; IMMProxy/1.0)',
        Accept: 'image/*',
      },
    });

    if (response.status >= 300 && response.status < 400) {
      return new NextResponse('Redirect tidak diizinkan', { status: 502 });
    }

    if (!response.ok) {
      return new NextResponse(`Gagal mengambil gambar: ${response.statusText}`, { status: response.status });
    }

    // Hanya teruskan konten gambar — mencegah endpoint jadi open proxy.
    const contentType = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    if (!contentType.startsWith('image/')) {
      return new NextResponse('Konten bukan gambar', { status: 415 });
    }

    const declaredLength = Number(response.headers.get('content-length') || '0');
    if (declaredLength > MAX_BYTES) {
      return new NextResponse('Ukuran gambar terlalu besar', { status: 413 });
    }

    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_BYTES) {
      return new NextResponse('Ukuran gambar terlalu besar', { status: 413 });
    }

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(arrayBuffer.byteLength),
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      return new NextResponse('Waktu pengambilan gambar habis', { status: 504 });
    }
    return new NextResponse('Proxy error: gagal mengambil gambar', { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}
