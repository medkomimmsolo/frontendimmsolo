/**
 * Device fingerprint sederhana untuk anti-titip-absen.
 *
 * Menghasilkan string stabil per perangkat/browser dari kombinasi
 * karakteristik + ID acak yang dipersist di localStorage. Bukan
 * fingerprint forensik — tujuannya menaikkan hambatan penyalahgunaan
 * (1 HP = 1 peserta), bukan mengidentifikasi orang secara pasti.
 *
 * Catatan: nilai dikirim mentah ke backend, di sana di-hash dengan APP_KEY
 * sebelum disimpan, sehingga backend tidak menyimpan identitas mentah.
 */
const STORAGE_KEY = 'imm_device_id';

function randomId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getDeviceFingerprint(): string {
  if (typeof window === 'undefined') return '';

  let persisted = localStorage.getItem(STORAGE_KEY);
  if (!persisted) {
    persisted = randomId();
    localStorage.setItem(STORAGE_KEY, persisted);
  }

  const parts = [
    persisted,
    navigator.userAgent || '',
    `${window.screen?.width || 0}x${window.screen?.height || 0}`,
    `${window.screen?.colorDepth || 0}`,
    Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    navigator.language || '',
    `${navigator.hardwareConcurrency || 0}`,
  ];

  return parts.join('|');
}
