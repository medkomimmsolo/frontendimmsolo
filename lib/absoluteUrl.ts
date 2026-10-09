const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://immsolo.or.id').replace(/\/+$/, '');

function getBackendOrigin(): string {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();
  if (backend) return backend.replace(/\/+$/, '');
  const api = process.env.NEXT_PUBLIC_API_URL?.trim() || '';
  return api.replace(/\/api\/v1\/?$/, '').replace(/\/+$/, '');
}

/**
 * Ubah path media backend (mis. `/storage/events/abc.webp`) menjadi URL absolut.
 * Wajib untuk OpenGraph/Twitter images — crawler tidak bisa resolve URL relatif.
 */
export function toAbsoluteMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const origin = getBackendOrigin();
  if (!origin) return path.startsWith('/') ? path : `/${path}`;
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`;
}

/** URL absolut untuk aset statis frontend (dipakai sebagai fallback OG image). */
export function toAbsoluteSiteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
