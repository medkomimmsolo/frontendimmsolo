'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Loader2, Download, FileSpreadsheet, X } from 'lucide-react';
import { PresensiSesi, PresensiStats, PresensiKehadiranStatus } from '@/types';

interface Props {
  isOpen: boolean;
  presensiId: number;
  presensiTitle: string;
  presensiSlug: string;
  sesis: PresensiSesi[];
  activeSesiId: number | null;
  onClose: () => void;
}

type Row = {
  kode: string | null;
  nama: string;
  email: string | null;
  phone: string | null;
  asal: string | null;
  sesi: string | null;
  status: string;
  method: string | null;
  checked_at: string | null;
  checked_by: string | null;
  note: string | null;
};

const STATUS_OPTIONS: { value: PresensiKehadiranStatus | 'belum'; label: string }[] = [
  { value: 'hadir', label: 'Hadir' },
  { value: 'telat', label: 'Telat' },
  { value: 'izin', label: 'Izin' },
  { value: 'tidak_hadir', label: 'Tidak Hadir' },
  { value: 'belum', label: 'Belum Hadir' },
];

/** Kolom ekspor yang bisa dipilih user. `key` = field pada baris data. */
const COLUMN_OPTIONS: { key: string; label: string }[] = [
  { key: 'no', label: 'No' },
  { key: 'kode', label: 'Kode' },
  { key: 'nama', label: 'Nama' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Telepon' },
  { key: 'asal', label: 'Asal' },
  { key: 'sesi', label: 'Sesi' },
  { key: 'status', label: 'Status' },
  { key: 'method', label: 'Metode' },
  { key: 'checked_at', label: 'Waktu Hadir' },
  { key: 'checked_by', label: 'Petugas' },
  { key: 'note', label: 'Catatan' },
];

const DEFAULT_COLUMNS = COLUMN_OPTIONS.map((c) => c.key);

const METHOD_LABEL: Record<string, string> = { self: 'Self', scan: 'Scan', manual: 'Manual' };

export function PresensiExportModal({
  isOpen,
  presensiId,
  presensiTitle,
  presensiSlug,
  sesis,
  activeSesiId,
  onClose,
}: Props) {
  const [sesiId, setSesiId] = useState<number | null>(activeSesiId);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [columns, setColumns] = useState<string[]>(DEFAULT_COLUMNS);
  const [isExporting, setIsExporting] = useState(false);

  // Sinkronkan sesi terpilih dengan sesi aktif saat modal dibuka.
  useEffect(() => {
    if (isOpen) setSesiId(activeSesiId);
  }, [isOpen, activeSesiId]);

  if (!isOpen) return null;

  const toggle = (list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const activeSesi = sesis.find((s) => s.id === sesiId) || null;

  const handleExport = async () => {
    if (columns.length === 0) {
      toast.error('Pilih minimal satu kolom untuk diekspor');
      return;
    }
    setIsExporting(true);
    const toastId = toast.loading('Menyiapkan file Excel...');
    try {
      const params: Record<string, unknown> = {};
      if (sesiId) params.sesi_id = sesiId;
      if (statuses.length > 0) params.status = statuses;

      const res = await api.get(`/presensi/${presensiId}/export`, { params });
      const payload = res.data.data;
      const all: Row[] = payload.rows || [];
      const stats = payload.stats as PresensiStats | undefined;
      const title = payload.presensi?.title || presensiTitle;
      const scopeLabel = activeSesi ? ` — ${activeSesi.name}` : '';

      const XLSX = await import('@e965/xlsx');

      const selected = COLUMN_OPTIONS.filter((c) => columns.includes(c.key));
      const header = selected.map((c) => c.label);
      const rows = all.map((p, idx) =>
        selected.map((c) => {
          switch (c.key) {
            case 'no':
              return idx + 1;
            case 'checked_at':
              return p.checked_at ? new Date(p.checked_at).toLocaleString('id-ID') : '';
            case 'method':
              return p.method ? METHOD_LABEL[p.method] || p.method : '';
            case 'sesi':
              return p.sesi || activeSesi?.name || '';
            default:
              return (p as Record<string, unknown>)[c.key] ?? '';
          }
        }),
      );

      const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
      ws['!cols'] = selected.map((c) => ({ wch: c.key === 'nama' || c.key === 'email' ? 28 : c.key === 'no' ? 5 : 18 }));

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Peserta Presensi');

      if (stats) {
        const summary = XLSX.utils.aoa_to_sheet([
          ['Ringkasan Presensi', `${title}${scopeLabel}`],
          ['Total Peserta', stats.total_peserta],
          ['Hadir', stats.hadir],
          ['Telat', stats.telat],
          ['Izin', stats.izin],
          ['Belum Hadir', stats.belum_hadir],
          ['Persentase Hadir', `${stats.persen_hadir}%`],
          ['Baris Diekspor', all.length],
        ]);
        summary['!cols'] = [{ wch: 20 }, { wch: 40 }];
        XLSX.utils.book_append_sheet(wb, summary, 'Ringkasan');
      }

      const statusTag = statuses.length > 0 ? `-${statuses.join('_')}` : '';
      XLSX.writeFile(wb, `presensi-${presensiSlug}${activeSesi ? `-${activeSesi.name}` : ''}${statusTag}.xlsx`);
      toast.success(`${all.length} baris diekspor`, { id: toastId });
      onClose();
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Gagal mengekspor Excel', { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-[#c20000] flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <h3 id="export-modal-title" className="text-base font-bold text-slate-900">
              Ekspor Data Presensi
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors" aria-label="Tutup">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Sesi */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Sesi</label>
            <select
              value={sesiId ?? ''}
              onChange={(e) => setSesiId(e.target.value ? Number(e.target.value) : null)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-700 focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] outline-none"
            >
              <option value="">Semua sesi (seluruh kegiatan)</option>
              {sesis.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Status Kehadiran
            </label>
            <p className="text-xs text-slate-400 mb-2">Kosongkan untuk mengekspor semua status.</p>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((opt) => {
                const active = statuses.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggle(statuses, setStatuses, opt.value)}
                    className={`px-3 py-1 rounded-full border text-xs font-semibold transition-colors ${
                      active
                        ? 'bg-[#c20000] text-white border-[#c20000]'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-[#c20000] hover:text-[#c20000]'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Kolom */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Kolom</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setColumns(DEFAULT_COLUMNS)} className="text-[11px] font-semibold text-[#c20000] hover:underline">
                  Semua
                </button>
                <button type="button" onClick={() => setColumns([])} className="text-[11px] font-semibold text-slate-400 hover:underline">
                  Kosongkan
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COLUMN_OPTIONS.map((col) => (
                <label key={col.key} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-[#c20000] focus:ring-[#c20000]"
                    checked={columns.includes(col.key)}
                    onChange={() => toggle(columns, setColumns, col.key)}
                  />
                  {col.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button type="button" onClick={onClose} variant="outline" className="h-10 px-4 rounded-xl text-xs font-bold">
            Batal
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="h-10 px-5 bg-[#c20000] hover:bg-[#a30000] text-white rounded-xl text-xs font-bold"
          >
            {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-1.5" />}
            Unduh Excel
          </Button>
        </div>
      </div>
    </div>
  );
}
