'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Loader2, Search, History } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDebounce } from 'use-debounce';
import { PageHeader } from '@/components/ui/PageHeader';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch] = useDebounce(searchQuery, 800);
  const [actionFilter, setActionFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchLogs = useCallback(async (page = currentPage, search = debouncedSearch, action = actionFilter) => {
    setIsLoading(true);
    try {
      const res = await api.get('/audit-logs', { params: { page, per_page: 15, search: search || undefined, action: action || undefined } });
      const payload = res.data.data;
      if (payload && payload.data) {
        setLogs(payload.data);
        setTotalPages(payload.last_page || 1);
        setTotalItems(payload.total || 0);
      } else {
        setLogs([]);
      }
    } catch {
      toast.error('Gagal memuat log aktivitas');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch, actionFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs, currentPage]);

  const actionBadge = (a: string) =>
    a === 'membuat' ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
    : a === 'menghapus' ? 'bg-red-50 text-red-600 border-red-200'
    : a === 'login' ? 'bg-teal-50 text-teal-600 border-teal-200'
    : a === 'logout' ? 'bg-slate-100 text-slate-500 border-slate-200'
    : a === 'menyetujui' ? 'bg-green-50 text-green-700 border-green-200'
    : a === 'menolak' ? 'bg-orange-50 text-orange-600 border-orange-200'
    : a === 'menonaktifkan' ? 'bg-red-50 text-red-600 border-red-200'
    : a === 'mengaktifkan' ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
    : 'bg-blue-50 text-blue-600 border-blue-200';

  return (
    <div className="space-y-6">
      {/* Modern Page Header */}
      <PageHeader
        title="Log Aktivitas"
        description="Catatan rekam jejak transparansi siapa membuat, mengubah, dan menghapus data di portal"
        badge="Audit"
      />

      <div className="bg-white border border-[#0f172a]/10 rounded-sm p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row gap-3">
        <form onSubmit={(e) => { e.preventDefault(); setCurrentPage(1); fetchLogs(1, searchQuery, actionFilter); }} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Cari aktivitas... (Enter)" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-slate-200 rounded-sm pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000]" />
        </form>
        <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setCurrentPage(1); }}
          className="border border-slate-200 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#c20000]">
          <option value="">Semua aksi</option>
          <option value="membuat">Membuat</option>
          <option value="mengubah">Mengubah</option>
          <option value="menghapus">Menghapus</option>
          <option value="login">Login</option>
          <option value="logout">Logout</option>
          <option value="menyetujui">Menyetujui</option>
          <option value="menolak">Menolak</option>
          <option value="mengaktifkan">Mengaktifkan</option>
          <option value="menonaktifkan">Menonaktifkan</option>
        </select>
      </div>

      <Card className="border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4 pl-6">Waktu</th>
                <th className="py-3.5 px-4">Pengguna</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
                <th className="py-3.5 px-4">Keterangan</th>
                <th className="py-3.5 px-4 pr-6">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#c20000] mb-2" />
                    <span className="text-sm font-medium text-slate-500">Memuat log aktivitas...</span>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3 text-slate-300">
                        <History className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">Belum ada aktivitas tercatat</p>
                      <p className="text-xs text-slate-400 mt-1">Aktivitas sistem dan pengguna akan muncul di sini</p>
                    </div>
                  </td>
                </tr>
              ) : logs.map((l: any) => (
                <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4 pl-6 whitespace-nowrap text-slate-600 text-xs font-mono">
                    {new Date(l.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-4">
                    {l.user?.name || l.user_name ? (
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-red-50 text-[#c20000] font-bold text-xs flex items-center justify-center shrink-0 border border-red-100">
                          {(l.user?.name || l.user_name).charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#0f172a] text-xs leading-tight truncate">
                            {l.user?.name || l.user_name}
                          </p>
                          {l.user?.username && (
                            <p className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                              @{l.user.username}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-500">
                        Sistem
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${actionBadge(l.action)}`}>{l.action}</span>
                  </td>
                  <td className="p-4 text-slate-600">{l.description}</td>
                  <td className="p-4 pr-6 text-xs text-slate-400 font-mono">{l.ip || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50/40">
          <p className="text-xs text-slate-500 font-medium">Menampilkan {(currentPage - 1) * 15 + 1}–{Math.min(currentPage * 15, totalItems)} dari {totalItems} log</p>
          <div className="flex items-center gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors">Prev</button>
            <span className="text-xs text-slate-600 font-bold px-2">{currentPage} / {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors">Next</button>
          </div>
        </div>
      </Card>
    </div>
  );
}
