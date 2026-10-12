import { apiUrl } from '@/lib/env';

export type Settings = Record<string, string>;

// Presisi: jangan hardcode URL di sini lagi — resolusi terpusat di lib/env.ts
// (fallback-nya peka NODE_ENV, bukan selalu 127.0.0.1).
export function getApiBase(): string {
  return apiUrl();
}

/**
 * Backend `GET /settings` returns `{ success, data: { key: value, ... }, message }`
 * (flat map, see SettingController::index). Older/alternative payloads return an
 * array of `{ key, value }`. Both shapes are accepted here; junk is ignored and
 * an object is always returned so callers can index safely.
 */
export function normalizeSettings(payload: unknown): Settings {
  const settings: Settings = {};

  if (Array.isArray(payload)) {
    for (const entry of payload) {
      if (!entry || typeof entry !== 'object') continue;
      const { key, value } = entry as { key?: unknown; value?: unknown };
      if (typeof key !== 'string' || key.length === 0) continue;
      if (value === null || value === undefined) continue;
      settings[key] = typeof value === 'string' ? value : String(value);
    }
    return settings;
  }

  if (payload && typeof payload === 'object') {
    for (const [key, value] of Object.entries(payload as Record<string, unknown>)) {
      if (value === null || value === undefined) continue;
      settings[key] = typeof value === 'string' ? value : String(value);
    }
  }

  return settings;
}

/** Settings booleans are persisted as the strings "true" / "false". */
export function isSettingEnabled(settings: Settings, key: string): boolean {
  return settings[key] === 'true';
}