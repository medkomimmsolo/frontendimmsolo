/**
 * Ekspor QR (SVG di DOM) menjadi PNG resolusi tinggi, dengan opsi
 * menyisipkan logo di tengah dan keterangan (nama/kode) di bawah QR.
 *
 * Dipakai untuk membuat kartu peserta / ID card yang siap dicetak.
 * Catatan: saat logo dipasang di tengah, QR WAJIB memakai level koreksi
 * error "H" (30%) agar tetap terbaca meski sebagian modul tertutup.
 */

export interface QrPngOptions {
  /** id elemen <svg> QR di DOM. */
  svgId: string;
  /** Nama file tanpa ekstensi. */
  fileName: string;
  /** Ukuran sisi QR (px) di PNG. Default 1000 (cukup untuk cetak). */
  size?: number;
  /** Logo (data URL) yang digambar di tengah QR. */
  logoDataUrl?: string | null;
  /** Keterangan opsional di bawah QR. */
  caption?: { title?: string; subtitle?: string };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Gagal memuat gambar'));
    img.src = src;
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/** Ubah nama menjadi slug nama file yang aman. */
export function safeFileName(input: string): string {
  return (
    input
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'qr'
  );
}

/**
 * Render QR dari <svg> di DOM → PNG (Blob), lalu unduh.
 * Mengembalikan Promise yang resolve setelah file terunduh.
 */
export async function exportQrPng(opts: QrPngOptions): Promise<void> {
  const source = document.getElementById(opts.svgId) as SVGSVGElement | null;
  if (!source) {
    throw new Error('Elemen QR tidak ditemukan');
  }

  const size = opts.size ?? 1000;
  const hasCaption = Boolean(opts.caption?.title || opts.caption?.subtitle);

  // Klon SVG agar bisa di-set ukuran eksplisit tanpa mengubah tampilan DOM.
  const clone = source.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', String(size));
  clone.setAttribute('height', String(size));
  if (!clone.getAttribute('viewBox')) {
    clone.setAttribute('viewBox', `0 0 ${size} ${size}`);
  }

  const xml = new XMLSerializer().serializeToString(clone);
  const svgUrl = URL.createObjectURL(new Blob([xml], { type: 'image/svg+xml;charset=utf-8' }));

  let qrImg: HTMLImageElement;
  try {
    qrImg = await loadImage(svgUrl);
  } finally {
    URL.revokeObjectURL(svgUrl);
  }

  const padding = Math.round(size * 0.07);
  const captionH = hasCaption ? Math.round(size * 0.26) : 0;

  const canvas = document.createElement('canvas');
  canvas.width = size + padding * 2;
  canvas.height = size + padding * 2 + captionH;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas tidak didukung browser ini');
  }

  // Latar putih penuh (aman untuk cetak & scanning).
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // QR: matikan smoothing agar modul tetap tajam.
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(qrImg, padding, padding, size, size);

  // Logo di tengah (opsional) dengan alas putih + sudut membulat.
  if (opts.logoDataUrl) {
    const logo = await loadImage(opts.logoDataUrl);
    const logoBox = Math.round(size * 0.22);
    const boxX = padding + (size - logoBox) / 2;
    const boxY = padding + (size - logoBox) / 2;
    const pad = Math.round(logoBox * 0.14);

    ctx.imageSmoothingEnabled = true;
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, boxX - pad, boxY - pad, logoBox + pad * 2, logoBox + pad * 2, Math.round(logoBox * 0.2));
    ctx.fill();

    const ratio = Math.min(logoBox / logo.width, logoBox / logo.height);
    const w = logo.width * ratio;
    const h = logo.height * ratio;
    ctx.drawImage(logo, boxX + (logoBox - w) / 2, boxY + (logoBox - h) / 2, w, h);
  }

  // Keterangan di bawah QR.
  if (hasCaption) {
    const cx = canvas.width / 2;
    let cy = padding + size + Math.round(captionH * 0.34);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#0f172a';
    ctx.font = `bold ${Math.round(size * 0.075)}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
    if (opts.caption?.title) {
      ctx.fillText(opts.caption.title, cx, cy, canvas.width - padding * 2);
      cy += Math.round(size * 0.11);
    }
    if (opts.caption?.subtitle) {
      ctx.fillStyle = '#64748b';
      ctx.font = `${Math.round(size * 0.05)}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
      ctx.fillText(opts.caption.subtitle, cx, cy, canvas.width - padding * 2);
    }
  }

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) {
    throw new Error('Gagal membuat PNG');
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeFileName(opts.fileName)}.png`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Simpan/ambil logo tengah QR dari localStorage (per-browser). */
const LOGO_KEY = 'imm_presensi_qr_logo';

export function getStoredQrLogo(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(LOGO_KEY);
  } catch {
    return null;
  }
}

export function storeQrLogo(dataUrl: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (dataUrl) localStorage.setItem(LOGO_KEY, dataUrl);
    else localStorage.removeItem(LOGO_KEY);
  } catch {
    /* localStorage bisa diblokir; abaikan. */
  }
}
