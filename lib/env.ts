/**
 * Pusat resolusi URL environment untuk frontend.
 *
 * Masalah yang dipecahkan: beberapa halaman (SSR/ISR, sitemap, rewrites) membaca
 * `process.env.NEXT_PUBLIC_*` secara langsung. Bila variabel itu tidak di-set di
 * Vercel, nilainya `undefined` sehingga fetch menembak `undefined/...` atau jatuh
 * ke `http://127.0.0.1` — yang tidak ada di server build Vercel dan membuat
 * prerender gagal. Helper ini memberi fallback production yang benar.
 */

const DEV_API_BASE = 'http://127.0.0.1:8010/api/v1';
const DEV_BACKEND_ORIGIN = 'http://127.0.0.1:8010';
const PROD_API_BASE = 'https://api-web.immsolo.or.id/api/v1';
const PROD_BACKEND_ORIGIN = 'https://api-web.immsolo.or.id';
const PROD_SITE_URL = 'https://immsolo.or.id';

const isProduction = process.env.NODE_ENV === 'production';

/** Hilangkan trailing slash berulang. */
function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

/** Base API lengkap dengan `/api/v1`. */
export function apiUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configured) return stripTrailingSlash(configured);
  return isProduction ? PROD_API_BASE : DEV_API_BASE;
}

/** Origin backend (tanpa `/api/v1`) — untuk media /storage & rewrites. */
export function backendOrigin(): string {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();
  if (backend) return stripTrailingSlash(backend);
  const api = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (api) return stripTrailingSlash(api.replace(/\/api\/v1\/?$/, ''));
  return isProduction ? PROD_BACKEND_ORIGIN : DEV_BACKEND_ORIGIN;
}

/** URL kanonik situs frontend (untuk OG image / sitemap). */
export function siteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return stripTrailingSlash(configured);
  return isProduction ? PROD_SITE_URL : 'http://localhost:3000';
}
