import { cache } from 'react';
import { getApiBase, normalizeSettings, type Settings } from '@/lib/settings';

/**
 * Server-side settings loader for the root layout.
 *
 * Wrapped in React `cache()` so `generateMetadata` and the `RootLayout` body —
 * which both need settings — share one fetch per render pass instead of
 * issuing two. `next: { revalidate: 60 }` keeps the response cached across requests.
 *
 * Note: passing an `AbortSignal` opts out of Next's automatic fetch memoization,
 * which is exactly why React `cache()` is needed here.
 */
export const getSiteSettings = cache(async (): Promise<Settings> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(`${getApiBase()}/settings`, {
      next: { revalidate: 60 },
      signal: controller.signal,
    });
    if (!res.ok) return {};
    const json = await res.json();
    return normalizeSettings(json?.data);
  } catch (error) {
    console.error('Failed to fetch site settings', error);
    return {};
  } finally {
    clearTimeout(timeoutId);
  }
});