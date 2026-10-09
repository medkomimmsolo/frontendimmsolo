'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Check, X, Loader2, UserPlus, Clock, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useConfirm } from '@/components/providers/ConfirmProvider';

type StatusFilter = 'pending' | 'approved' | 'rejected';

export default function AccountRequestsPage() {
  const { confirm } = useConfirm();
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [approveId, setApproveId] = useState<number | null>(null);
  const [approveRole, setApproveRole] = useState('komisariat');
  const [isSaving, setIsSaving] = useState(false);

  const fetchRequests = useCallback(async (status = filter, page = currentPage) => {
    setIsLoading(true);
    try {
      const res = await api.get('/account-requests', { params: { status, page, per_page: 15 } });
      const payload = res.data.data;
      if (payload && payload.data) {
        setRequests(payload.data);
        setTotalPages(payload.last_page || 1);
        setTotalItems(payload.total || 0);
      } else {
        setRequests(Array.isArray(payload) ? payload : []);
      }
    } catch {
      toast.error('Gagal memuat pengajuan akun');
    } finally {
      setIsLoading(false);
    }
  }, [filter, currentPage]);

  const fetchCounts = useCallback(async () => {
    try {
      const [p, a, r] = await Promise.all([
        api.get('/account-requests', { params: { status: 'pending', per_page: 1 } }),
        api.get('/account-requests', { params: { status: 'approved', per_page: 1 } }),
        api.get('/account-requests', { params: { status: 'rejected', per_page: 1 } }),
      ]);
      setCounts({
        pending: p.data.data?.total ?? 0,
        approved: a.data.data?.total ?? 0,
        rejected: r.data.data?.total ?? 0,
      });
    } catch {
      /* abaikan */
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);
  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  const changeFilter = (s: StatusFilter) => {
    setFilter(s);
    setCurrentPage(1);
  };

  const openApprove = (item: any) => {
    setApproveId(item.id);
    setApproveRole(item.requested_role || 'komisariat');
  };

  const handleApprove = async () => {
    if (!approveId) return;
    setIsSaving(true);
    try {
      await api.post(`/account-requests/${approveId}/approve`, { role: approveRole });
      toast.success('Akun disetujui dan sudah aktif');
      setApproveId(null);
      fetchRequests();
      fetchCounts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menyetujui');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReject = async (id: number, name: string) => {
    if (!(await confirm({ message: `Tolak pengajuan akun "${name}"?`, tone: 'danger' }))) return;
    try {
      await api.post(`/account-requests/${id}/reject`);
      toast.success('Pengajuan ditolak');
      fetchRequests();
      fetchCounts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menolak');
    }
  };

  const statusBadge = (s: string) =>
    s === 'approved' ? (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5" /> Disetujui</span>
    ) : s === 'rejected' ? (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200"><XCircle className="w-3.5 h-3.5" /> Ditolak</span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200"><Clock className="w-3.5 h-3.5" /> Menunggu</span>
    );

  const tabs: { key: StatusFilter; label: string; count: number }[] = [
    { key: 'pending', label: 'Menunggu', count: counts.pending },
    { key: 'approved', label: 'Disetujui', count: counts.approved },
    { key: 'rejected', label: 'Ditolak', count: counts.rejected },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-sm shadow-sm border border-[#0f172a]/5">
        <h1 className="text-2xl font-bold text-[#0f172a]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
          Pengajuan Akun
        </h1>
        <p className="text-[#0f172a]/70 text-sm mt-1">Tinjau dan setujui permohonan akun pengelola website.</p>
      </div>

      <div className="flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => changeFilter(t.key)}
            className={`px-4 py-2 rounded-sm text-sm font-semibold border transition-colors ${filter === t.key ? 'bg-[#c20000] text-white border-[#c20000]' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      <Card className="border-[#0f172a]/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-[#0f172a]/5 text-[#0f172a]/70 text-sm font-semibold uppercase tracking-wider">
                <th className="p-4 pl-6">Pemohon</th>
                <th className="p-4">Role Diajukan</th>
                <th className="p-4">Alasan</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 pr-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr><td colSpan={5} className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[#c20000]" /></td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-slate-500">Tidak ada pengajuan {filter === 'pending' ? 'menunggu' : filter === 'approved' ? 'yang disetujui' : 'yang ditolak'}</td></tr>
              ) : requests.map((r: any) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 pl-6">
                    <div className="font-bold text-[#0f172a]">{r.name}</div>
                    <div className="text-[#0f172a]/70 text-xs mt-1">{r.email}</div>
                    <div className="text-slate-400 text-xs mt-0.5">{new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  </td>
                  <td className="p-4"><span className="capitalize text-slate-700 font-medium">{r.requested_role}</span></td>
                  <td className="p-4"><span className="text-slate-600 text-xs line-clamp-2 max-w-xs block">{r.reason || '-'}</span></td>
                  <td className="p-4 text-center">{statusBadge(r.status)}</td>
                  <td className="p-4 pr-6">
                    {r.status === 'pending' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openApprove(r)} title="Setujui" className="h-9 w-9 inline-flex items-center justify-center text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-sm transition-colors">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleReject(r.id, r.name)} title="Tolak" className="h-9 w-9 inline-flex items-center justify-center text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-sm transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-right text-xs text-slate-400">oleh {r.reviewer?.name || '-'}</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
          <p className="text-xs text-slate-500 font-medium">Menampilkan {(currentPage - 1) * 15 + 1}–{Math.min(currentPage * 15, totalItems)} dari {totalItems} pengajuan</p>
          <div className="flex items-center gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="px-3 py-1.5 text-sm rounded-sm border border-slate-200 disabled:opacity-40 hover:bg-slate-50">Prev</button>
            <span className="text-sm text-slate-600 font-semibold">{currentPage} / {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-1.5 text-sm rounded-sm border border-slate-200 disabled:opacity-40 hover:bg-slate-50">Next</button>
          </div>
        </div>
      </Card>

      {approveId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/50 backdrop-blur-sm p-4" onClick={() => setApproveId(null)}>
          <div className="bg-white rounded-sm shadow-xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2"><UserPlus className="w-5 h-5 text-emerald-600" /> Setujui Akun</h2>
            <p className="text-xs text-slate-500 mb-4">Pilih role final untuk akun ini.</p>
            <select value={approveRole} onChange={(e) => setApproveRole(e.target.value)}
              className="w-full border border-slate-200 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000]">
              <option value="komisariat">Komisariat (Kontributor Lokal)</option>
              <option value="bidang">Bidang (Cabang)</option>
              <option value="admin">Admin</option>
            </select>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setApproveId(null)}>Batal</Button>
              <Button onClick={handleApprove} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {isSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Setujui & Aktifkan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
