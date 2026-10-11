import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware proteksi route.
 *
 * Catatan penting: token API disimpan di localStorage (Bearer), yang TIDAK
 * dapat dibaca oleh middleware (server/edge). Karena itu kita memakai cookie
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

export function middleware(request: NextRequest) {
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

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
