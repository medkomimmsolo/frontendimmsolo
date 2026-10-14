import type {
  PresensiKehadiranMethod,
  PresensiKehadiranStatus,
  PresensiKehadiranLogAction,
} from '@/types';

/** Label + gaya badge untuk status kehadiran. */
export const STATUS_LABEL: Record<PresensiKehadiranStatus, string> = {
  hadir: 'Hadir',
  telat: 'Telat',
  izin: 'Izin',
  tidak_hadir: 'Tidak Hadir',
};

export const STATUS_BADGE_CLASS: Record<PresensiKehadiranStatus, string> = {
  hadir: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  telat: 'bg-amber-50 text-amber-600 border-amber-200',
  izin: 'bg-blue-50 text-blue-600 border-blue-200',
  tidak_hadir: 'bg-slate-100 text-slate-500 border-slate-200',
};

/**
 * Label + gaya badge untuk metode pencatatan kehadiran.
 * self = peserta scan QR kegiatan sendiri, scan = petugas scan QR peserta,
 * manual = petugas menandai langsung.
 */
export const METHOD_LABEL: Record<PresensiKehadiranMethod, string> = {
  self: 'Self',
  scan: 'Scan',
  manual: 'Manual',
};

export const METHOD_BADGE_CLASS: Record<PresensiKehadiranMethod, string> = {
  self: 'bg-sky-50 text-sky-600 border-sky-200',
  scan: 'bg-violet-50 text-violet-600 border-violet-200',
  manual: 'bg-amber-50 text-amber-600 border-amber-200',
};

/** Keterangan panjang metode, untuk tooltip. */
export const METHOD_HINT: Record<PresensiKehadiranMethod, string> = {
  self: 'Diisi sendiri oleh peserta via QR kegiatan',
  scan: 'Dipindai petugas dari QR peserta',
  manual: 'Ditandai manual oleh petugas',
};

export function statusLabel(status: string | null | undefined): string {
  if (!status) return '—';
  return STATUS_LABEL[status as PresensiKehadiranStatus] ?? status;
}

export function statusBadgeClass(status: string | null | undefined): string {
  if (!status) return STATUS_BADGE_CLASS.tidak_hadir;
  return STATUS_BADGE_CLASS[status as PresensiKehadiranStatus] ?? STATUS_BADGE_CLASS.tidak_hadir;
}

export function methodLabel(method: string | null | undefined): string {
  if (!method) return '—';
  return METHOD_LABEL[method as PresensiKehadiranMethod] ?? method;
}

export function methodBadgeClass(method: string | null | undefined): string {
  if (!method) return 'bg-slate-100 text-slate-500 border-slate-200';
  return METHOD_BADGE_CLASS[method as PresensiKehadiranMethod] ?? 'bg-slate-100 text-slate-500 border-slate-200';
}

export function methodHint(method: string | null | undefined): string {
  if (!method) return '';
  return METHOD_HINT[method as PresensiKehadiranMethod] ?? '';
}

/** Kalimat ringkas riwayat perubahan, mis. "Hadir → Telat". */
export function describeLogChange(
  action: PresensiKehadiranLogAction,
  before: string | null,
  after: string | null,
): string {
  if (action === 'created') return `Dicatat: ${statusLabel(after)}`;
  if (action === 'deleted') return `Dihapus (sebelumnya ${statusLabel(before)})`;
  return `${statusLabel(before)} → ${statusLabel(after)}`;
}
