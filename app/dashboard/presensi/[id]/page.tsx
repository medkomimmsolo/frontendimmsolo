'use client';

import { use, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Loader2, Users, QrCode, ClipboardCheck, Settings, Upload, Download, Plus, Trash2, Search, ArrowLeft, Save, ScanLine, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useConfirm } from '@/components/providers/ConfirmProvider';
import { Presensi, PresensiPeserta, PresensiStats, PresensiKehadiran } from '@/types';
import Link from 'next/link';
import { useDebounce } from 'use-debounce';
import { formatDateTime } from '@/lib/utils';
import { PresensiQrPanel } from '@/components/presensi/PresensiQrPanel';
import { PresensiScanPanel } from '@/components/presensi/PresensiScanPanel';
import { PresensiImportModal } from '@/components/presensi/PresensiImportModal';

const inputCls =
  'w-full bg-white border border-slate-200 rounded-sm px-3.5 py-2.5 text-sm text-slate-700 focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] outline-none shadow-sm transition-all';

const STATUS_BADGE: Record<string, string> = {
  hadir: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  telat: 'bg-amber-50 text-amber-600 border-amber-200',
  izin: 'bg-blue-50 text-blue-600 border-blue-200',
  tidak_hadir: 'bg-slate-100 text-slate-500 border-slate-200',
};

type Tab = 'peserta' | 'qr' | 'scan' | 'kehadiran' | 'settings';

export default function PresensiDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { confirm } = useConfirm();

  const [tab, setTab] = useState<Tab>('peserta');
  const [presensi, setPresensi] = useState<Presensi | null>(null);
  const [stats, setStats] = useState<PresensiStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showImport, setShowImport] = useState(false);

  // Peserta
  const [peserta, setPeserta] = useState<PresensiPeserta[]>([]);
  const [pesertaLoading, setPesertaLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch] = useDebounce(searchQuery, 500);
  const [statusFilter, setStatusFilter] = useState<'all' | 'hadir' | 'belum'>('all');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // Kehadiran
  const [kehadiran, setKehadiran] = useState<PresensiKehadiran[]>([]);

  // Settings form
  const [sForm, setSForm] = useState<Partial<Presensi>>({});
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const fetchDetail = useCallback(async () => {
    try {
      const res = await api.get(`/presensi/${id}`);
      setPresensi(res.data.data.presensi);
      setStats(res.data.data.stats);
      setSForm({
        title: res.data.data.presensi.title,
        location: res.data.data.presensi.location,
        description: res.data.data.presensi.description,
        starts_at: res.data.data.presensi.starts_at?.slice(0, 16),
        ends_at: res.data.data.presensi.ends_at?.slice(0, 16),
        mode: res.data.data.presensi.mode,
        late_after_minutes: res.data.data.presensi.late_after_minutes,
        allow_manual_add: res.data.data.presensi.allow_manual_add,
        qr_refresh_seconds: res.data.data.presensi.qr_refresh_seconds ?? 15,
        enforce_device_limit: res.data.data.presensi.enforce_device_limit ?? true,
      });
    } catch {
      toast.error('Gagal memuat detail presensi');
      router.push('/dashboard/presensi');
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  const fetchPeserta = useCallback(async () => {
    setPesertaLoading(true);
    try {
      const res = await api.get(`/presensi/${id}/peserta`, {
        params: { page, per_page: 25, search: debouncedSearch || undefined, status: statusFilter === 'all' ? undefined : statusFilter },
      });
      const payload = res.data.data;
      setPeserta(payload.data || []);
      setLastPage(payload.last_page || 1);
    } catch {
      toast.error('Gagal memuat daftar peserta');
    } finally {
      setPesertaLoading(false);
    }
  }, [id, page, debouncedSearch, statusFilter]);

  const fetchKehadiran = useCallback(async () => {
    try {
      const res = await api.get(`/presensi/${id}/kehadiran`);
      setKehadiran(res.data.data.items || []);
      setStats(res.data.data.stats);
    } catch {
      toast.error('Gagal memuat kehadiran');
    }
  }, [id]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);
  useEffect(() => {
    if (tab === 'peserta' || tab === 'scan') fetchPeserta();
    if (tab === 'kehadiran') fetchKehadiran();
  }, [tab, fetchPeserta, fetchKehadiran]);
  useEffect(() => { setPage(1); }, [debouncedSearch, statusFilter]);

  const refreshAll = () => { fetchDetail(); fetchPeserta(); };

  const handleToggleOpen = async () => {
    if (!presensi) return;
    try {
      await api.put(`/presensi/${id}/toggle-open`, { is_open: !presensi.is_open });
      toast.success(presensi.is_open ? 'Presensi ditutup' : 'Presensi dibuka');
      fetchDetail();
    } catch {
      toast.error('Gagal mengubah status');
    }
  };

  const handleDeletePeserta = async (pid: number) => {
    if (await confirm({ message: 'Hapus peserta ini beserta catatan kehadirannya?', tone: 'danger' })) {
      try {
        await api.delete(`/presensi-peserta/${pid}`);
        toast.success('Peserta dihapus');
        refreshAll();
      } catch {
        toast.error('Gagal menghapus peserta');
      }
    }
  };

  const handleDeleteKehadiran = async (kid: number) => {
    if (await confirm({ message: 'Hapus catatan kehadiran ini?', tone: 'danger' })) {
      try {
        await api.delete(`/presensi-kehadiran/${kid}`);
        toast.success('Catatan kehadiran dihapus');
        fetchKehadiran();
        fetchDetail();
      } catch {
        toast.error('Gagal menghapus kehadiran');
      }
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      await api.put(`/presensi/${id}`, {
        title: sForm.title,
        location: sForm.location || null,
        description: sForm.description || null,
        starts_at: sForm.starts_at || null,
        ends_at: sForm.ends_at || null,
        mode: sForm.mode,
        late_after_minutes: sForm.late_after_minutes || null,
        allow_manual_add: sForm.allow_manual_add,
        qr_refresh_seconds: sForm.qr_refresh_seconds || 15,
        enforce_device_limit: sForm.enforce_device_limit,
      });
      toast.success('Pengaturan disimpan');
      fetchDetail();
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Gagal menyimpan pengaturan');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const exportExcel = async () => {
    const toastId = toast.loading('Menyiapkan file Excel...');
    try {
      // Ambil seluruh data lewat endpoint ekspor (satu request).
      const res = await api.get(`/presensi/${id}/export`);
      const payload = res.data.data;
      const all: Array<{
        kode: string | null; nama: string; email: string | null; phone: string | null;
        asal: string | null; status: string; method: string | null;
        checked_at: string | null; checked_by: string | null; note: string | null;
      }> = payload.rows || [];
      const stats = payload.stats as PresensiStats | undefined;
      const title = payload.presensi?.title || presensi?.slug || id;

      const XLSX = await import('xlsx');
      const header = ['No', 'Kode', 'Nama', 'Email', 'Telepon', 'Asal', 'Status', 'Waktu Hadir', 'Metode', 'Petugas', 'Catatan'];
      const rows = all.map((p, idx) => [
        idx + 1, p.kode || '', p.nama, p.email || '', p.phone || '', p.asal || '',
        p.status,
        p.checked_at ? new Date(p.checked_at).toLocaleString('id-ID') : '',
        p.method || '',
        p.checked_by || '',
        p.note || '',
      ]);
      const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
      ws['!cols'] = [{ wch: 5 }, { wch: 10 }, { wch: 28 }, { wch: 28 }, { wch: 18 }, { wch: 24 }, { wch: 12 }, { wch: 22 }, { wch: 10 }, { wch: 18 }, { wch: 24 }];

      // Ringkasan di sheet kedua.
      if (stats) {
        const summary = XLSX.utils.aoa_to_sheet([
          ['Ringkasan Presensi', title],
          ['Total Peserta', stats.total_peserta],
          ['Hadir', stats.hadir],
          ['Telat', stats.telat],
          ['Izin', stats.izin],
          ['Belum Hadir', stats.belum_hadir],
          ['Persentase Hadir', `${stats.persen_hadir}%`],
        ]);
        summary['!cols'] = [{ wch: 20 }, { wch: 40 }];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Peserta Presensi');
        XLSX.utils.book_append_sheet(wb, summary, 'Ringkasan');
        XLSX.writeFile(wb, `presensi-${presensi?.slug || id}.xlsx`);
      } else {
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Peserta Presensi');
        XLSX.writeFile(wb, `presensi-${presensi?.slug || id}.xlsx`);
      }
      toast.success('File Excel diunduh', { id: toastId });
    } catch {
      toast.error('Gagal mengekspor Excel', { id: toastId });
    }
  };

  const handleMarkStatus = async (peserta: PresensiPeserta, status: 'hadir' | 'telat' | 'izin' | 'tidak_hadir') => {
    const label: Record<string, string> = { hadir: 'Hadir', telat: 'Telat', izin: 'Izin', tidak_hadir: 'Tidak Hadir' };
    if (peserta.kehadiran?.status === status) return;
    if (await confirm({ message: `Tandai ${peserta.nama} sebagai "${label[status]}"?`, tone: status === 'tidak_hadir' ? 'danger' : 'default' })) {
      try {
        await api.post(`/presensi/${id}/peserta/${peserta.id}/mark`, { status });
        toast.success(`${peserta.nama} ditandai ${label[status]}`);
        fetchPeserta();
        fetchDetail();
      } catch (error) {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(err.response?.data?.message || 'Gagal menandai kehadiran');
      }
    }
  };

  const handleAddManual = async () => {
    if (!presensi?.allow_manual_add) {
      toast.error('Tambah manual dinonaktifkan untuk sesi ini');
      return;
    }
    const nama = window.prompt('Nama peserta:');
    if (!nama || !nama.trim()) return;
    try {
      await api.post(`/presensi/${id}/peserta`, { nama: nama.trim() });
      toast.success('Peserta ditambahkan');
      refreshAll();
    } catch {
      toast.error('Gagal menambah peserta');
    }
  };

  if (isLoading || !presensi) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-[#c20000]" />
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'peserta', label: 'Peserta', icon: <Users className="w-4 h-4" /> },
    { key: 'qr', label: 'QR Code', icon: <QrCode className="w-4 h-4" /> },
    { key: 'scan', label: 'Scan', icon: <ScanLine className="w-4 h-4" /> },
    { key: 'kehadiran', label: 'Kehadiran', icon: <ClipboardCheck className="w-4 h-4" /> },
    { key: 'settings', label: 'Pengaturan', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 w-full">
      <PageHeader title={presensi.title} description={presensi.location || 'Sesi presensi'} badge={presensi.is_open ? 'Dibuka' : 'Ditutup'}>
        <div className="flex items-center gap-2">
          <Button onClick={handleToggleOpen} variant="outline" className="h-10 px-4 rounded-xl text-xs font-bold">
            {presensi.is_open ? 'Tutup Presensi' : 'Buka Presensi'}
          </Button>
          <Link href="/dashboard/presensi">
            <Button variant="outline" className="h-10 px-4 rounded-xl text-xs font-bold">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Kembali
            </Button>
          </Link>
        </div>
      </PageHeader>

      {/* Statistik */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            ['Total Peserta', stats.total_peserta, 'text-slate-700'],
            ['Hadir', stats.hadir, 'text-emerald-600'],
            ['Telat', stats.telat, 'text-amber-600'],
            ['Izin', stats.izin, 'text-blue-600'],
            ['Belum Hadir', stats.belum_hadir, 'text-slate-500'],
          ].map(([label, value, color]) => (
            <Card key={label as string} className="border-slate-200/90 rounded-xl shadow-2xs">
              <CardContent className="pt-5 pb-4">
                <div className={`text-2xl font-bold ${color}`}>{value as number}</div>
                <div className="text-xs text-slate-500 mt-0.5">{label as string}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${tab === t.key ? 'border-[#c20000] text-[#c20000]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Peserta */}
      {tab === 'peserta' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button onClick={() => setShowImport(true)} className="h-10 px-4 bg-[#c20000] hover:bg-[#a30000] text-white rounded-xl text-xs font-bold">
                <Upload className="w-4 h-4 mr-1.5" /> Impor Peserta
              </Button>
              <Button onClick={handleAddManual} variant="outline" className="h-10 px-4 rounded-xl text-xs font-bold">
                <Plus className="w-4 h-4 mr-1.5" /> Tambah Manual
              </Button>
              <Button onClick={exportExcel} variant="outline" className="h-10 px-4 rounded-xl text-xs font-bold">
                <Download className="w-4 h-4 mr-1.5" /> Export Excel
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className={`${inputCls} h-10 w-32`}>
                <option value="all">Semua</option>
                <option value="hadir">Sudah Hadir</option>
                <option value="belum">Belum Hadir</option>
              </select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input className={`${inputCls} pl-9 h-10 w-48`} placeholder="Cari peserta..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <th className="py-3 px-4 pl-6 w-16">No</th>
                    <th className="py-3 px-4">Nama</th>
                    <th className="py-3 px-4 w-56">Kontak</th>
                    <th className="py-3 px-4 w-40">Asal</th>
                    <th className="py-3 px-4 w-32">Status</th>
                    <th className="py-3 px-4 w-16 pr-6"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm bg-white">
                  {pesertaLoading ? (
                    <tr><td colSpan={6} className="py-14 text-center"><Loader2 className="w-7 h-7 animate-spin text-[#c20000] mx-auto" /></td></tr>
                  ) : peserta.length === 0 ? (
                    <tr><td colSpan={6} className="py-14 text-center text-slate-400 text-sm">Belum ada peserta. Impor dari Excel/Form atau tambah manual.</td></tr>
                  ) : (
                    peserta.map((p, i) => (
                      <tr key={p.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 pl-6 text-slate-400 text-xs">{(page - 1) * 25 + i + 1}</td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">{p.nama}</div>
                          {p.kode && <div className="text-xs text-slate-400">Kode: {p.kode}</div>}
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-xs">
                          {p.email && <div>{p.email}</div>}
                          {p.phone && <div>{p.phone}</div>}
                          {!p.email && !p.phone && <span className="text-slate-300">—</span>}
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-xs">{p.asal || '—'}</td>
                        <td className="py-3 px-4">
                          {p.kehadiran ? (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${STATUS_BADGE[p.kehadiran.status]}`}>
                              {p.kehadiran.status}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">Belum hadir</span>
                          )}
                          <div className="flex flex-wrap items-center gap-1 mt-1.5">
                            {(['hadir', 'telat', 'izin'] as const).map((st) => (
                              <button
                                key={st}
                                onClick={() => handleMarkStatus(p, st)}
                                disabled={p.kehadiran?.status === st}
                                className="px-2 py-0.5 text-[11px] font-semibold rounded border border-slate-200 text-slate-600 hover:border-[#c20000] hover:text-[#c20000] transition-colors disabled:opacity-40 disabled:cursor-default disabled:hover:border-slate-200 disabled:hover:text-slate-600"
                                title={`Tandai ${st}`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 pr-6 text-right">
                          <button onClick={() => handleDeletePeserta(p.id)} className="h-8 w-8 inline-flex items-center justify-center text-red-500 hover:bg-red-50 rounded-sm transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {lastPage > 1 && (
            <div className="flex items-center justify-center gap-3">
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="h-9 px-4 text-xs rounded-lg">Sebelumnya</Button>
              <span className="text-xs text-slate-500">Halaman {page} / {lastPage}</span>
              <Button variant="outline" disabled={page >= lastPage} onClick={() => setPage((p) => p + 1)} className="h-9 px-4 text-xs rounded-lg">Berikutnya</Button>
            </div>
          )}
        </div>
      )}

      {/* QR */}
      {tab === 'qr' && presensi && (
        <PresensiQrPanel presensi={presensi} peserta={peserta} onRefreshPeserta={fetchPeserta} />
      )}

      {/* Scan */}
      {tab === 'scan' && presensi && (
        <PresensiScanPanel presensi={presensi} onChecked={refreshAll} />
      )}

      {/* Kehadiran */}
      {tab === 'kehadiran' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 pl-6">Nama</th>
                  <th className="py-3 px-4 w-28">Status</th>
                  <th className="py-3 px-4 w-28">Metode</th>
                  <th className="py-3 px-4 w-48">Waktu</th>
                  <th className="py-3 px-4 w-40">Petugas</th>
                  <th className="py-3 px-4 w-16 pr-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm bg-white">
                {kehadiran.length === 0 ? (
                  <tr><td colSpan={6} className="py-14 text-center text-slate-400 text-sm">Belum ada kehadiran tercatat.</td></tr>
                ) : (
                  kehadiran.map((k) => (
                    <tr key={k.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 pl-6">
                        <div className="font-semibold text-slate-800">{k.peserta?.nama}</div>
                        {k.peserta?.asal && <div className="text-xs text-slate-400">{k.peserta.asal}</div>}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${STATUS_BADGE[k.status]}`}>{k.status}</span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600">{k.method}</td>
                      <td className="py-3 px-4 text-xs text-slate-600">{formatDateTime(k.checked_at)}</td>
                      <td className="py-3 px-4 text-xs text-slate-600">{k.checked_by_user?.name || (k.method === 'self' ? 'Self check-in' : '—')}</td>
                      <td className="py-3 px-4 pr-6 text-right">
                        <button onClick={() => handleDeleteKehadiran(k.id)} className="h-8 w-8 inline-flex items-center justify-center text-red-500 hover:bg-red-50 rounded-sm transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Settings */}
      {tab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="max-w-2xl">
          <Card className="border-slate-200/90 rounded-2xl shadow-2xs">
            <CardHeader><CardTitle className="text-base">Pengaturan Sesi</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-1.5">Judul</label>
                <input className={inputCls} value={sForm.title || ''} onChange={(e) => setSForm({ ...sForm, title: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-1.5">Lokasi</label>
                <input className={inputCls} value={sForm.location || ''} onChange={(e) => setSForm({ ...sForm, location: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-1.5">Deskripsi</label>
                <textarea className={`${inputCls} min-h-[90px]`} value={sForm.description || ''} onChange={(e) => setSForm({ ...sForm, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-1.5">Mulai</label>
                  <input type="datetime-local" className={inputCls} value={sForm.starts_at || ''} onChange={(e) => setSForm({ ...sForm, starts_at: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-1.5">Selesai</label>
                  <input type="datetime-local" className={inputCls} value={sForm.ends_at || ''} onChange={(e) => setSForm({ ...sForm, ends_at: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-1.5">Mode</label>
                  <select className={inputCls} value={sForm.mode} onChange={(e) => setSForm({ ...sForm, mode: e.target.value as Presensi['mode'] })}>
                    <option value="both">Keduanya</option>
                    <option value="self">QR Kegiatan</option>
                    <option value="scan">Scan Peserta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-1.5">Toleransi Telat (menit)</label>
                  <input type="number" min={0} className={inputCls} value={sForm.late_after_minutes ?? ''} onChange={(e) => setSForm({ ...sForm, late_after_minutes: e.target.value === '' ? null : Number(e.target.value) })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-1.5">Rotasi QR (detik)</label>
                  <input type="number" min={5} max={300} className={inputCls} value={sForm.qr_refresh_seconds ?? 15} onChange={(e) => setSForm({ ...sForm, qr_refresh_seconds: e.target.value === '' ? 15 : Number(e.target.value) })} />
                  <p className="text-xs text-slate-400 mt-1">QR kegiatan berputar tiap N detik (5–300).</p>
                </div>
                <div className="flex flex-col justify-center gap-3">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#c20000] focus:ring-[#c20000]" checked={!!sForm.allow_manual_add} onChange={(e) => setSForm({ ...sForm, allow_manual_add: e.target.checked })} />
                    <span className="text-sm text-slate-700">Izinkan tambah peserta manual</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#c20000] focus:ring-[#c20000]" checked={sForm.enforce_device_limit !== false} onChange={(e) => setSForm({ ...sForm, enforce_device_limit: e.target.checked })} />
                    <span className="text-sm text-slate-700">Batasi 1 perangkat = 1 peserta</span>
                  </label>
                </div>
              </div>
              <Button type="submit" disabled={isSavingSettings} className="h-11 px-6 bg-[#c20000] hover:bg-[#a30000] text-white rounded-xl font-bold">
                {isSavingSettings ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Simpan Perubahan
              </Button>
            </CardContent>
          </Card>
        </form>
      )}

      <PresensiImportModal
        isOpen={showImport}
        presensiId={Number(id)}
        onClose={() => setShowImport(false)}
        onImported={() => { setShowImport(false); refreshAll(); }}
      />
    </div>
  );
}
