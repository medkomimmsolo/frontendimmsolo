'use client';

import { use, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { RowActions } from '@/components/ui/RowActions';
import { Loader2, Users, QrCode, ClipboardCheck, Settings, Upload, Download, Plus, Trash2, Search, ArrowLeft, Save, Layers, RefreshCw, History, ChevronDown, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { getUserFacingErrorMessage } from '@/lib/errorMessage';
import { useConfirm } from '@/components/providers/ConfirmProvider';
import { Presensi, PresensiPeserta, PresensiStats, PresensiKehadiran, PresensiSesi } from '@/types';
import Link from 'next/link';
import { useDebounce } from 'use-debounce';
import { formatDateTime } from '@/lib/utils';
import { statusBadgeClass, statusLabel, methodBadgeClass, methodLabel, methodHint } from '@/lib/presensi';
import { PresensiQrPanel } from '@/components/presensi/PresensiQrPanel';
import { PresensiImportModal } from '@/components/presensi/PresensiImportModal';
import { PresensiSesiPanel } from '@/components/presensi/PresensiSesiPanel';
import { PresensiManualModal } from '@/components/presensi/PresensiManualModal';
import { PresensiExportModal } from '@/components/presensi/PresensiExportModal';
import { PresensiHistoryPanel } from '@/components/presensi/PresensiHistoryPanel';
import { PresensiFormFieldBuilder } from '@/components/presensi/PresensiFormFieldBuilder';
import { DEFAULT_PRESENSI_FORM_FIELDS } from '@/lib/presensi';

const inputCls =
  'w-full bg-white border border-slate-200 rounded-sm px-3.5 py-2.5 text-sm text-slate-700 focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] outline-none shadow-sm transition-all';

const STATUS_SELECT_STYLE: Record<string, string> = {
  hadir: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  telat: 'border-amber-200 bg-amber-50 text-amber-700',
  izin: 'border-blue-200 bg-blue-50 text-blue-700',
  tidak_hadir: 'border-red-200 bg-red-50 text-red-700',
};

function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('');
}

type Tab = 'peserta' | 'qr' | 'kehadiran' | 'riwayat' | 'sesi' | 'settings';

export default function PresensiDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { confirm } = useConfirm();

  const [tab, setTab] = useState<Tab>('peserta');
  const [presensi, setPresensi] = useState<Presensi | null>(null);
  const [stats, setStats] = useState<PresensiStats | null>(null);
  const [sesiStats, setSesiStats] = useState<PresensiStats | null>(null);
  const [sesis, setSesis] = useState<PresensiSesi[]>([]);
  const [activeSesiId, setActiveSesiId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showImport, setShowImport] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Peserta
  const [peserta, setPeserta] = useState<PresensiPeserta[]>([]);
  const [pesertaLoading, setPesertaLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch] = useDebounce(searchQuery, 500);
  const [statusFilter, setStatusFilter] = useState<'all' | 'hadir' | 'belum'>('all');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalPeserta, setTotalPeserta] = useState(0);

  // Peserta untuk tab QR — tidak terpengaruh filter pencarian/status di tab Peserta.
  const [qrPeserta, setQrPeserta] = useState<PresensiPeserta[]>([]);
  const [qrPage, setQrPage] = useState(1);
  const [qrLastPage, setQrLastPage] = useState(1);
  const [qrTotal, setQrTotal] = useState(0);
  const [qrLoading, setQrLoading] = useState(false);

  // Kehadiran
  const [kehadiran, setKehadiran] = useState<PresensiKehadiran[]>([]);

  // Settings form
  const [sForm, setSForm] = useState<Partial<Presensi>>({});
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const fetchDetail = useCallback(async () => {
    try {
      const res = await api.get(`/presensi/${id}`, {
        params: activeSesiId ? { sesi_id: activeSesiId } : undefined,
      });
      setPresensi(res.data.data.presensi);
      setStats(res.data.data.stats);
      if (res.data.data.sesi_stats) {
        setSesiStats(res.data.data.sesi_stats);
      } else {
        setSesiStats(null);
      }
      const list: PresensiSesi[] = res.data.data.sesis || res.data.data.presensi?.sesis || [];
      setSesis(list);
      setSForm({
        title: res.data.data.presensi.title,
        location: res.data.data.presensi.location,
        description: res.data.data.presensi.description,
        starts_at: res.data.data.presensi.starts_at?.slice(0, 16),
        ends_at: res.data.data.presensi.ends_at?.slice(0, 16),
        mode: res.data.data.presensi.mode,
        late_after_minutes: res.data.data.presensi.late_after_minutes,
        allow_manual_add: res.data.data.presensi.allow_manual_add,
        enforce_device_limit: res.data.data.presensi.enforce_device_limit ?? true,
        form_fields: res.data.data.presensi.form_fields?.length
          ? res.data.data.presensi.form_fields
          : DEFAULT_PRESENSI_FORM_FIELDS,
      });
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error, 'Gagal memuat detail presensi'));
      router.push('/dashboard/presensi');
    } finally {
      setIsLoading(false);
    }
  }, [id, router, activeSesiId]);

  const didInitSesi = useRef(false);

  // Pilih sesi pertama sekali saat daftar sesi termuat. Setelah itu hormati
  // pilihan pengguna — termasuk "Semua Sesi" (null) — saat data disegarkan.
  useEffect(() => {
    if (!didInitSesi.current) {
      if (sesis.length === 0) return;
      didInitSesi.current = true;
      setActiveSesiId(sesis[0].id);
      return;
    }
    setActiveSesiId((prev) => {
      if (prev === null) return null;
      return sesis.some((s) => s.id === prev) ? prev : (sesis[0]?.id ?? null);
    });
  }, [sesis]);

  const fetchPeserta = useCallback(async () => {
    setPesertaLoading(true);
    try {
      const res = await api.get(`/presensi/${id}/peserta`, {
        params: { page, per_page: 25, search: debouncedSearch || undefined, status: statusFilter === 'all' ? undefined : statusFilter, sesi_id: activeSesiId ?? undefined },
      });
      const payload = res.data.data;
      setPeserta(payload.data || []);
      setLastPage(payload.last_page || 1);
      setTotalPeserta(payload.total || 0);
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error, 'Gagal memuat daftar peserta'));
    } finally {
      setPesertaLoading(false);
    }
  }, [id, page, debouncedSearch, statusFilter, activeSesiId]);

  const fetchQrPeserta = useCallback(async () => {
    setQrLoading(true);
    try {
      const res = await api.get(`/presensi/${id}/peserta`, {
        params: { page: qrPage, per_page: 24 },
      });
      const payload = res.data.data;
      setQrPeserta(payload.data || []);
      setQrLastPage(payload.last_page || 1);
      setQrTotal(payload.total || 0);
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error, 'Gagal memuat daftar peserta QR'));
    } finally {
      setQrLoading(false);
    }
  }, [id, qrPage]);

  const fetchKehadiran = useCallback(async () => {
    try {
      const res = await api.get(`/presensi/${id}/kehadiran`, {
        params: activeSesiId ? { sesi_id: activeSesiId } : undefined,
      });
      setKehadiran(res.data.data.items || []);
      // Endpoint ini mengembalikan statistik sesuai cakupan permintaan:
      // sesi aktif bila ada, atau seluruh kegiatan bila tanpa sesi.
      if (activeSesiId) {
        setSesiStats(res.data.data.stats);
      } else {
        setStats(res.data.data.stats);
      }
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error, 'Gagal memuat kehadiran'));
    }
  }, [id, activeSesiId]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);
  useEffect(() => {
    if (tab === 'peserta') fetchPeserta();
    if (tab === 'qr') fetchQrPeserta();
    if (tab === 'kehadiran') fetchKehadiran();
  }, [tab, fetchPeserta, fetchQrPeserta, fetchKehadiran]);
  useEffect(() => { setPage(1); }, [debouncedSearch, statusFilter, activeSesiId]);
  useEffect(() => { setQrPage(1); }, [id]);

  // Auto-refresh hanya berjalan saat tab yang datanya perlu diperbarui aktif.
  // Sengaja TIDAK memanggil fetchDetail — agar isian form Pengaturan yang
  // belum disimpan tidak tertimpa.
  useEffect(() => {
    if (!autoRefresh || !presensi?.is_open) return;
    const poll = setInterval(() => {
      if (tab === 'peserta') fetchPeserta();
      if (tab === 'qr') fetchQrPeserta();
      if (tab === 'kehadiran') fetchKehadiran();
    }, 10_000);

    return () => clearInterval(poll);
  }, [autoRefresh, presensi?.is_open, tab, fetchPeserta, fetchQrPeserta, fetchKehadiran]);

  useEffect(() => {
    if (!presensi?.is_open) setAutoRefresh(false);
  }, [presensi?.is_open]);

  const refreshAll = () => { fetchDetail(); fetchPeserta(); fetchQrPeserta(); };

  const activeSesi = sesis.find((s) => s.id === activeSesiId) || null;

  // Statistik yang ditampilkan mengikuti cakupan sesi aktif bila tersedia,
  // agar angka pada kartu konsisten dengan tabel peserta/kehadiran di bawahnya.
  const scopeStats = activeSesi && sesiStats ? sesiStats : stats;

  const handleToggleOpen = async () => {
    if (!presensi) return;
    try {
      await api.put(`/presensi/${id}/toggle-open`, { is_open: !presensi.is_open });
      toast.success(presensi.is_open ? 'Presensi berhasil ditutup.' : 'Presensi berhasil dibuka.');
      fetchDetail();
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error, 'Gagal mengubah status'));
    }
  };

  const handleDeletePeserta = async (pid: number) => {
    if (await confirm({ title: 'Hapus peserta?', message: 'Peserta ini beserta catatan kehadirannya akan dihapus.', confirmText: 'Hapus peserta', tone: 'danger' })) {
      try {
        await api.delete(`/presensi-peserta/${pid}`);
        toast.success('Peserta dihapus');
        refreshAll();
      } catch (error) {
        toast.error(getUserFacingErrorMessage(error, 'Gagal menghapus peserta'));
      }
    }
  };

  const handleDeleteKehadiran = async (kid: number) => {
    if (await confirm({ title: 'Hapus catatan kehadiran?', message: 'Catatan kehadiran ini akan dihapus.', confirmText: 'Hapus catatan', tone: 'danger' })) {
      try {
        await api.delete(`/presensi-kehadiran/${kid}`);
        toast.success('Catatan kehadiran dihapus');
        fetchKehadiran();
        fetchDetail();
      } catch (error) {
        toast.error(getUserFacingErrorMessage(error, 'Gagal menghapus kehadiran'));
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
        enforce_device_limit: sForm.enforce_device_limit,
        form_fields: sForm.mode === 'self' ? sForm.form_fields : undefined,
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

  const exportExcel = () => setShowExportModal(true);

  const handleMarkStatus = async (peserta: PresensiPeserta, status: 'hadir' | 'telat' | 'izin' | 'tidak_hadir'): Promise<boolean> => {
    const label: Record<string, string> = { hadir: 'Hadir', telat: 'Telat', izin: 'Izin', tidak_hadir: 'Tidak Hadir' };
    if (peserta.kehadiran?.status === status) return false;
    try {
      await api.post(`/presensi/${id}/peserta/${peserta.id}/mark`, { status, sesi_id: activeSesiId ?? undefined });
      toast.success(`${peserta.nama} ditandai ${label[status]}`);
      fetchPeserta();
      fetchDetail();
      return true;
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Gagal menandai kehadiran');
      return false;
    }
  };

  const handleAddManual = () => {
    if (presensi?.allow_manual_add === false) {
      toast.error('Tambah peserta manual dinonaktifkan pada pengaturan kegiatan ini.');
      return;
    }
    setShowManualModal(true);
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
    { key: 'kehadiran', label: 'Kehadiran', icon: <ClipboardCheck className="w-4 h-4" /> },
    { key: 'riwayat', label: 'Riwayat', icon: <History className="w-4 h-4" /> },
    { key: 'sesi', label: 'Sesi & Kamera', icon: <Layers className="w-4 h-4" /> },
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

      {/* Sesi aktif */}
      {sesis.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 font-bold text-slate-600">
            <Layers className="w-3.5 h-3.5" /> Sesi aktif:
          </span>
          <button
            type="button"
            aria-pressed={activeSesiId === null}
            onClick={() => setActiveSesiId(null)}
            className={`px-3 py-1 rounded-full border font-semibold transition-colors ${
              activeSesiId === null
                ? 'bg-slate-700 text-white border-slate-700'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-800'
            }`}
          >
            Semua Sesi
          </button>
          {sesis.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-pressed={activeSesiId === s.id}
              onClick={() => setActiveSesiId(s.id)}
              className={`px-3 py-1 rounded-full border font-semibold transition-colors ${
                activeSesiId === s.id
                  ? 'bg-[#c20000] text-white border-[#c20000]'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-[#c20000] hover:text-[#c20000]'
              }`}
            >
              {s.name}{!s.is_open && ' · tutup'}
            </button>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200">
        <div role="tablist" aria-label="Bagian presensi" className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${tab === t.key ? 'border-[#c20000] text-[#c20000]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        {['peserta', 'qr', 'kehadiran'].includes(tab) && (
          <label
            className={`ml-auto mb-1 inline-flex items-center gap-2 text-xs font-semibold select-none ${presensi.is_open ? 'text-slate-600 cursor-pointer' : 'text-slate-400 cursor-not-allowed'}`}
            title={presensi.is_open ? 'Muat ulang data tiap 10 detik' : 'Buka presensi untuk mengaktifkan auto-refresh'}
          >
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-slate-300 text-[#c20000] focus:ring-[#c20000] disabled:cursor-not-allowed"
              checked={autoRefresh}
              disabled={!presensi.is_open}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <RefreshCw className={`w-3.5 h-3.5 ${autoRefresh && presensi.is_open ? 'text-emerald-500' : 'text-slate-400'}`} />
            Auto-refresh {autoRefresh && presensi.is_open ? '(aktif)' : ''}
          </label>
        )}
      </div>

      {/* Peserta */}
      {tab === 'peserta' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="flex items-center gap-2">
              {presensi.mode !== 'self' && (
                <>
                  <Button onClick={() => setShowImport(true)} className="h-10 px-4 bg-[#c20000] hover:bg-[#a30000] text-white rounded-xl text-xs font-bold">
                    <Upload className="w-4 h-4 mr-1.5" /> Impor Peserta
                  </Button>
                  <Button
                    onClick={handleAddManual}
                    variant="outline"
                    disabled={presensi.allow_manual_add === false}
                    title={presensi.allow_manual_add === false ? 'Diaktifkan lewat tab Pengaturan' : 'Tambah satu peserta'}
                    className="h-10 px-4 rounded-xl text-xs font-bold"
                  >
                    <Plus className="w-4 h-4 mr-1.5" /> Tambah Manual
                  </Button>
                </>
              )}
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
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-3.5">
              <h3 className="text-sm font-bold text-slate-800">Daftar Peserta</h3>
              <span className="text-xs font-medium text-slate-400">{totalPeserta} peserta</span>
            </div>
            <div className="overflow-x-auto">
              <table className={`admin-panel-table w-full text-left border-collapse ${presensi.mode === 'self' ? 'min-w-[760px]' : 'min-w-[560px]'}`}>
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 text-2xs font-bold uppercase tracking-wider">
                    <th className="py-3 px-3 pl-6 w-12 text-center">No</th>
                    <th className="py-3 px-4">Peserta</th>
                    {presensi.mode === 'self' && <th className="py-3 px-4">Jawaban Form</th>}
                    <th className="py-3 px-4 w-52">Status Kehadiran</th>
                    <th className="py-3 px-3 pr-6 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm bg-white">
                  {pesertaLoading ? (
                    <tr>
                      <td colSpan={presensi.mode === 'self' ? 5 : 4} className="py-16 text-center">
                        <Loader2 className="w-7 h-7 animate-spin text-[#c20000] mx-auto" />
                      </td>
                    </tr>
                  ) : peserta.length === 0 ? (
                    <tr>
                      <td colSpan={presensi.mode === 'self' ? 5 : 4} className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3 text-slate-300">
                            <Users className="w-6 h-6" />
                          </div>
                          <p className="text-sm font-semibold text-slate-700">
                            {presensi.mode === 'self' ? 'Belum ada peserta yang mengisi form' : 'Belum ada peserta'}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            {presensi.mode === 'self'
                              ? 'Peserta akan muncul otomatis setelah mengisi form presensi.'
                              : 'Impor dari Excel atau tambah manual untuk memulai.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    peserta.map((p, i) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-3 pl-6 text-center text-xs font-medium text-slate-400">
                          {(page - 1) * 25 + i + 1}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-red-100 bg-red-50 text-xs font-bold text-[#c20000]">
                              {initials(p.nama)}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-800 truncate" title={p.nama}>{p.nama}</div>
                              {p.email && (
                                <a href={`mailto:${p.email}`} className="mt-0.5 flex max-w-[220px] items-center gap-1.5 text-2xs text-slate-500 truncate transition-colors hover:text-[#c20000]" title={p.email}>
                                  <Mail className="w-3 h-3 shrink-0 text-slate-400" />
                                  <span className="truncate">{p.email}</span>
                                </a>
                              )}
                            </div>
                          </div>
                        </td>
                        {presensi.mode === 'self' && (
                          <td className="py-3.5 px-4 align-top">
                            {(() => {
                              const answers = (presensi.form_fields || [])
                                .filter((field) => !['nama', 'email', 'phone', 'asal'].includes(field.key))
                                .map((field) => {
                                  const answer = p.form_data?.[field.key];
                                  const display = Array.isArray(answer) ? answer.join(', ') : answer;
                                  return display ? (
                                    <div key={field.key} className="flex max-w-[240px] items-baseline gap-1 text-2xs">
                                      <span className="shrink-0 text-slate-400">{field.label}:</span>
                                      <span className="truncate font-medium text-slate-700" title={String(display)}>{display}</span>
                                    </div>
                                  ) : null;
                                })
                                .filter(Boolean);
                              return answers.length ? <div className="space-y-1">{answers}</div> : <span className="text-slate-300">—</span>;
                            })()}
                          </td>
                        )}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col items-start gap-1.5">
                            <div className="relative">
                              <select
                                value={p.kehadiran?.status ?? ''}
                                onChange={async (e) => {
                                  const next = e.target.value as 'hadir' | 'telat' | 'izin' | 'tidak_hadir';
                                  if (!next) return;
                                  const changed = await handleMarkStatus(p, next);
                                  if (!changed) e.target.value = p.kehadiran?.status ?? '';
                                }}
                                title="Ubah status kehadiran"
                                className={`h-8 min-w-[132px] cursor-pointer appearance-none rounded-lg border pl-3 pr-8 text-xs font-semibold outline-none transition-colors focus:ring-2 focus:ring-[#c20000]/20 ${p.kehadiran ? STATUS_SELECT_STYLE[p.kehadiran.status] : 'border-dashed border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}
                              >
                                <option value="" disabled>Belum hadir</option>
                                <option value="hadir">Hadir</option>
                                <option value="telat">Telat</option>
                                <option value="izin">Izin</option>
                                <option value="tidak_hadir">Tidak Hadir</option>
                              </select>
                              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 opacity-70" />
                            </div>
                            {p.kehadiran && (
                              <div className="flex items-center gap-1.5 text-2xs text-slate-400">
                                <span
                                  className={`inline-flex items-center rounded border px-1.5 py-0.5 font-semibold ${methodBadgeClass(p.kehadiran.method)}`}
                                  title={methodHint(p.kehadiran.method)}
                                >
                                  {methodLabel(p.kehadiran.method)}
                                </span>
                                <span>{new Date(p.kehadiran.checked_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-3 pr-6 text-right">
                          <button
                            onClick={() => handleDeletePeserta(p.id)}
                            title="Hapus peserta"
                            aria-label={`Hapus ${p.nama}`}
                            className="h-8 w-8 inline-flex items-center justify-center text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {totalPeserta > 0 && (
              <PaginationControls
                currentPage={page}
                totalPages={lastPage}
                totalItems={totalPeserta}
                pageSize={25}
                unit="peserta"
                onPageChange={setPage}
              />
            )}
          </div>
        </div>
      )}

      {/* QR */}
      {tab === 'qr' && presensi && (
        <PresensiQrPanel
          presensi={presensi}
          peserta={qrPeserta}
          activeSesi={activeSesi}
          stats={scopeStats}
          isLoading={qrLoading}
          page={qrPage}
          lastPage={qrLastPage}
          total={qrTotal}
          onPageChange={setQrPage}
          onRefreshPeserta={fetchQrPeserta}
        />
      )}

      {/* Kehadiran */}
      {tab === 'kehadiran' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold text-slate-500">
              {kehadiran.length} kehadiran tercatat{activeSesi ? ` · ${activeSesi.name}` : ''}
            </p>
            <Button onClick={exportExcel} variant="outline" className="h-9 px-3 rounded-xl text-xs font-bold">
              <Download className="w-4 h-4 mr-1.5" /> Export Excel
            </Button>
          </div>
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="admin-panel-table w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 pl-6">Nama</th>
                  <th className="py-3 px-4 w-32">Sesi</th>
                  <th className="py-3 px-4 w-28">Status</th>
                  <th className="py-3 px-4 w-28">Metode</th>
                  <th className="py-3 px-4 w-48">Waktu</th>
                  <th className="py-3 px-4 w-40">Petugas</th>
                  <th className="py-3 px-4 w-16 pr-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm bg-white">
                {kehadiran.length === 0 ? (
                  <tr><td colSpan={7} className="py-14 text-center text-slate-400 text-sm">Belum ada kehadiran tercatat.</td></tr>
                ) : (
                  kehadiran.map((k) => (
                    <tr key={k.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 pl-6">
                        <div className="font-semibold text-slate-800">{k.peserta?.nama}</div>
                        {k.peserta?.asal && <div className="text-xs text-slate-400">{k.peserta.asal}</div>}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600">{k.sesi?.name || '—'}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${statusBadgeClass(k.status)}`}>{statusLabel(k.status)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-2xs font-semibold border ${methodBadgeClass(k.method)}`}
                          title={methodHint(k.method)}
                        >
                          {methodLabel(k.method)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600">{formatDateTime(k.checked_at)}</td>
                      <td className="py-3 px-4 text-xs text-slate-600">{k.checkedBy?.name || (k.method === 'self' ? 'Form presensi' : '—')}</td>
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
        </div>
      )}

      {/* Riwayat perubahan kehadiran (audit trail) */}
      {tab === 'riwayat' && (
        <PresensiHistoryPanel presensiId={Number(id)} activeSesiId={activeSesiId} sesis={sesis} />
      )}

      {/* Sesi */}
      {tab === 'sesi' && (
        <PresensiSesiPanel
          presensiId={Number(id)}
          sesis={sesis}
          activeSesiId={activeSesiId}
          onSelect={(sid) => { setActiveSesiId(sid); setPage(1); }}
          onChanged={fetchDetail}
        />
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
                    {sForm.mode === 'both' && <option value="both">Form + Scan (sesi lama)</option>}
                    <option value="self">Form Presensi</option>
                    <option value="scan">Scan Peserta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-1.5">Toleransi Telat (menit)</label>
                  <input type="number" min={0} className={inputCls} value={sForm.late_after_minutes ?? ''} onChange={(e) => setSForm({ ...sForm, late_after_minutes: e.target.value === '' ? null : Number(e.target.value) })} />
                </div>
              </div>
              {sForm.mode === 'self' && (
                <div className="rounded-xl border border-slate-200 p-4">
                  <PresensiFormFieldBuilder
                    fields={sForm.form_fields || []}
                    onChange={(form_fields) => setSForm({ ...sForm, form_fields })}
                  />
                </div>
              )}
              {sForm.mode !== 'self' && <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#c20000] focus:ring-[#c20000]" checked={!!sForm.allow_manual_add} onChange={(e) => setSForm({ ...sForm, allow_manual_add: e.target.checked })} />
                    <span className="text-sm text-slate-700">Izinkan tambah peserta manual</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#c20000] focus:ring-[#c20000]" checked={sForm.enforce_device_limit !== false} onChange={(e) => setSForm({ ...sForm, enforce_device_limit: e.target.checked })} />
                    <span className="text-sm text-slate-700">Batasi 1 perangkat = 1 peserta</span>
                  </label>
              </div>}
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

      <PresensiManualModal
        isOpen={showManualModal}
        presensiId={Number(id)}
        onClose={() => setShowManualModal(false)}
        onCreated={() => { setShowManualModal(false); refreshAll(); }}
      />

      <PresensiExportModal
        isOpen={showExportModal}
        presensiId={Number(id)}
        presensiTitle={presensi.title}
        presensiSlug={presensi.slug || String(id)}
        sesis={sesis}
        activeSesiId={activeSesiId}
        formFields={presensi.form_fields}
        onClose={() => setShowExportModal(false)}
      />
    </div>
  );
}
