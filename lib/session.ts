/**
 * Helper sesi sisi-klien.
 *
 * Token API tetap disimpan di localStorage (Bearer), sedangkan cookie
 * `imm_session` hanya penanda non-sensitif agar middleware dapat melakukan
 * redirect lebih awal. Lihat middleware.ts.
 */
export const SESSION_COOKIE = 'imm_session';

/** Set penanda sesi (dipanggil setelah login sukses). */
export function markSessionActive(): void {
  if (typeof document === 'undefined') return;
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${SESSION_COOKIE}=1; Path=/; Max-Age=604800; SameSite=Lax${secure}`;
}

/** Hapus penanda sesi (dipanggil saat logout / token invalid). */
export function clearSession(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}
