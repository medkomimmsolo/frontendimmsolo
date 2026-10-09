'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Loader2, Search, History } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDebounce } from 'use-debounce';

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
      <div className="bg-white p-6 rounded-sm shadow-sm border border-[#0f172a]/5">
        <h1 className="text-2xl font-bold text-[#0f172a] flex items-center gap-2" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
          <History className="w-6 h-6 text-[#c20000]" /> Log Aktivitas
        </h1>
        <p className="text-[#0f172a]/70 text-sm mt-1">Catatan siapa membuat, mengubah, dan menghapus data di sistem.</p>
      </div>

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

      <Card className="border-[#0f172a]/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-[#0f172a]/5 text-[#0f172a]/70 text-sm font-semibold uppercase tracking-wider">
                <th className="p-4 pl-6">Waktu</th>
                <th className="p-4">Pengguna</th>
                <th className="p-4 text-center">Aksi</th>
                <th className="p-4">Keterangan</th>
                <th className="p-4 pr-6">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr><td colSpan={5} className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[#c20000]" /></td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-slate-500">Belum ada aktivitas tercatat</td></tr>
              ) : logs.map((l: any) => (
                <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 pl-6 whitespace-nowrap text-slate-600 text-xs">
                    {new Date(l.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-4 font-semibold text-[#0f172a]">{l.user?.name || <span className="text-slate-400 font-normal">sistem</span>}</td>
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
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
          <p className="text-xs text-slate-500 font-medium">Menampilkan {(currentPage - 1) * 15 + 1}–{Math.min(currentPage * 15, totalItems)} dari {totalItems} log</p>
          <div className="flex items-center gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="px-3 py-1.5 text-sm rounded-sm border border-slate-200 disabled:opacity-40 hover:bg-slate-50">Prev</button>
            <span className="text-sm text-slate-600 font-semibold">{currentPage} / {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-1.5 text-sm rounded-sm border border-slate-200 disabled:opacity-40 hover:bg-slate-50">Next</button>
          </div>
        </div>
      </Card>
    </div>
  );
}
