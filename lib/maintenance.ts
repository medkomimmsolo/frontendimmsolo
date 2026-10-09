import { getApiBase, isSettingEnabled, normalizeSettings, type Settings } from '@/lib/settings';

async function fetchSettings(): Promise<Settings> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(`${getApiBase()}/settings`, {
      // Cache singkat: cukup segar untuk toggle maintenance (maks. 60 dtk),
      // jauh lebih ringan daripada fetch ulang di setiap page view.
      next: { revalidate: 60 },
      signal: controller.signal,
    });
    if (!res.ok) return {};
    const json = await res.json();
    return normalizeSettings(json?.data);
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function checkMaintenance(pageKey: string): Promise<boolean> {
  try {
    const settings = await fetchSettings();

    if (isSettingEnabled(settings, 'maintenance_mode')) return true;
    return isSettingEnabled(settings, pageKey);
  } catch (error) {
    console.error(`Failed to check maintenance mode for ${pageKey}`, error);
    return false;
  }
}