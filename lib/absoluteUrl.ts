import { backendOrigin, siteUrl } from '@/lib/env';

/**
 * Ubah path media backend (mis. `/storage/events/abc.webp`) menjadi URL absolut.
 * Wajib untuk OpenGraph/Twitter images — crawler tidak bisa resolve URL relatif.
 */
export function toAbsoluteMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const origin = backendOrigin();
  if (!origin) return path.startsWith('/') ? path : `/${path}`;
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`;
}

/** URL absolut untuk aset statis frontend (dipakai sebagai fallback OG image). */
export function toAbsoluteSiteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${siteUrl()}${path.startsWith('/') ? path : `/${path}`}`;
}
