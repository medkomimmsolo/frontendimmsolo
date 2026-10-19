'use client';

import { useCallback, useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { getUserFacingErrorMessage } from '@/lib/errorMessage';
import { Badge } from '@/components/ui/Badge';
import { History, Loader2, RefreshCw, UserRound } from 'lucide-react';
import { PresensiKehadiranLog, PresensiSesi } from '@/types';
import { formatDateTime } from '@/lib/utils';
import { describeLogChange, methodHint, methodLabel, statusBadgeClass, statusLabel } from '@/lib/presensi';

interface Props {
  presensiId: number;
  activeSesiId: number | null;
  sesis: PresensiSesi[];
}

const ACTION_STYLE: Record<string, string> = {
  created: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  updated: 'bg-amber-50 text-amber-600 border-amber-200',
  deleted: 'bg-red-50 text-red-600 border-red-200',
};

const ACTION_LABEL: Record<string, string> = {
  created: 'Dibuat',
  updated: 'Diubah',
  deleted: 'Dihapus',
};

export function PresensiHistoryPanel({ presensiId, activeSesiId, sesis }: Props) {
  const [items, setItems] = useState<PresensiKehadiranLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sesiId, setSesiId] = useState<number | null>(activeSesiId);

  useEffect(() => {
    setSesiId(activeSesiId);
  }, [activeSesiId]);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/presensi/${presensiId}/kehadiran-logs`, {
        params: { sesi_id: sesiId ?? undefined },
      });
      setItems(res.data.data.items || []);
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error, 'Gagal memuat riwayat kehadiran'));
    } finally {
      setIsLoading(false);
    }
  }, [presensiId, sesiId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const activeSesi = sesis.find((s) => s.id === sesiId) || null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <History className="w-4 h-4" />
          Jejak perubahan kehadiran{activeSesi ? ` — ${activeSesi.name}` : ' — seluruh kegiatan'}.
        </div>
        <div className="flex items-center gap-2">
          {sesis.length > 0 && (
            <select
              value={sesiId ?? ''}
              onChange={(e) => setSesiId(e.target.value ? Number(e.target.value) : null)}
              className="h-9 bg-white border border-slate-200 rounded-lg px-3 text-xs font-bold text-slate-700 outline-none focus:border-[#c20000]"
              title="Filter sesi"
            >
              <option value="">Semua sesi</option>
              {sesis.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          )}
          <button
            onClick={fetchLogs}
            disabled={isLoading}
            className="h-9 w-9 inline-flex items-center justify-center text-slate-500 hover:text-[#c20000] border border-slate-200 rounded-lg transition-colors"
            title="Muat ulang"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-panel-table w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="py-3 px-4 pl-6 w-44">Waktu</th>
                <th className="py-3 px-4">Peserta</th>
                <th className="py-3 px-4 w-28">Aksi</th>
                <th className="py-3 px-4 w-44">Perubahan</th>
                <th className="py-3 px-4 w-28">Metode</th>
                <th className="py-3 px-4 w-40">Pelaku</th>
                <th className="py-3 px-4 w-48 pr-6">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm bg-white">
              {isLoading ? (
                <tr><td colSpan={7} className="py-14 text-center"><Loader2 className="w-7 h-7 animate-spin text-[#c20000] mx-auto" /></td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={7} className="py-14 text-center text-slate-400 text-sm">Belum ada riwayat perubahan kehadiran.</td></tr>
              ) : (
                items.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 pl-6 text-xs text-slate-500">{formatDateTime(log.created_at)}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{log.peserta?.nama || '—'}</div>
                      {log.sesi?.name && <div className="text-xs text-slate-400">{log.sesi.name}</div>}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${ACTION_STYLE[log.action] || 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                        {ACTION_LABEL[log.action] || log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <div className="flex items-center gap-1.5">
                        {log.status_before && (
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-2xs font-medium border ${statusBadgeClass(log.status_before)}`}>
                            {statusLabel(log.status_before)}
                          </span>
                        )}
                        {log.action === 'updated' && <span className="text-slate-400">→</span>}
                        {log.status_after && (
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-2xs font-medium border ${statusBadgeClass(log.status_after)}`}>
                            {statusLabel(log.status_after)}
                          </span>
                        )}
                      </div>
                      <span className="sr-only">{describeLogChange(log.action, log.status_before, log.status_after)}</span>
                    </td>
                    <td className="py-3 px-4">
                      {log.method ? (
                        <Badge className="bg-slate-100 text-slate-600 border-slate-200" title={methodHint(log.method)}>
                          {methodLabel(log.method)}
                        </Badge>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      {log.changed_by_name ? (
                        <span className="inline-flex items-center gap-1.5"><UserRound className="w-3.5 h-3.5 text-slate-400" /> {log.changed_by_name}</span>
                      ) : (
                        <span className="text-slate-400">Form presensi</span>
                      )}
                    </td>
                    <td className="py-3 px-4 pr-6 text-xs text-slate-500">{log.note || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
