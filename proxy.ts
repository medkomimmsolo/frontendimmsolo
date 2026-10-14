import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware proteksi route.
 *
 * Catatan penting: token API disimpan di localStorage (Bearer), yang TIDAK
 * dapat dibaca oleh proxy. Karena itu kita memakai cookie
 * penanda sesi non-sensitif `imm_session` yang di-set saat login dan dihapus
 * saat logout. Cookie ini:
 *   - TIDAK berisi token/kredensial (hanya penanda "1"), aman dari pencurian.
 *   - Dipakai HANYA untuk redirect lebih awal (UX + mengurangi render
 *     dashboard ke pengguna anonim).
 *   - BUKAN pengganti otorisasi: setiap request data tetap divalidasi oleh
 *     token Bearer di backend. Cookie ini bisa saja dipalsukan, maka JANGAN
 *     pernah dijadikan satu-satunya dasar keamanan data.
 *
 * Untuk migrasi penuh ke cookie HttpOnly, lihat catatan di README/komentar
 * lib/api.ts.
 */
const SESSION_COOKIE = 'imm_session';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.get(SESSION_COOKIE)?.value === '1';

  // Lindungi area dashboard: jika tak ada penanda sesi, alihkan ke login.
  if (pathname.startsWith('/dashboard') && !hasSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Jika sudah login dan membuka /login, alihkan ke dashboard.
  if (pathname === '/login' && hasSession) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const isDev = process.env.NODE_ENV !== 'production';
  const devHosts = isDev
    ? ' http://127.0.0.1:8010 http://localhost:8010 http://127.0.0.1:3000 http://localhost:3000 ws://127.0.0.1:3000 ws://localhost:3000'
    : '';
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://*.sentry.io https://browser.sentry-cdn.com${isDev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    `img-src 'self' data: blob: https://*.immsolo.or.id https://immsolo.or.id https://placehold.co https://*.vercel.app${devHosts}`,
    `connect-src 'self' https://*.sentry.io https://*.immsolo.or.id https://immsolo.or.id${devHosts}`,
    "frame-src 'self' https://www.google.com https://maps.google.com",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    ...(isDev ? [] : ['upgrade-insecure-requests']),
  ].join('; ');

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set('Content-Security-Policy', csp);
  return response;
}

export const config = {
  matcher: ['/((?!api/|_next/static|_next/image|favicon.ico).*)'],
};
