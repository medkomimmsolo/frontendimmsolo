'use client';

import { use, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { siteUrl } from '@/lib/env';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { QRCodeSVG } from 'qrcode.react';
import { Badge } from '@/components/ui/Badge';
import { Loader2, Users, QrCode, ClipboardCheck, Settings, Upload, Download, Plus, Trash2, Search, ArrowLeft, Save, ScanLine, Layers, RefreshCw, History, Copy, ExternalLink } from 'lucide-react';
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

type Tab = 'peserta' | 'qr' | 'scan' | 'kehadiran' | 'riwayat' | 'sesi' | 'settings';

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
  const [cameraLinkCopied, setCameraLinkCopied] = useState(false);

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

  // Pilih sesi pertama secara otomatis saat daftar sesi termuat / berubah.
  useEffect(() => {
    setActiveSesiId((prev) => {
      if (prev !== null && sesis.some((s) => s.id === prev)) return prev;
      return sesis.length > 0 ? sesis[0].id : null;
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
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error, 'Gagal memuat daftar peserta'));
    } finally {
      setPesertaLoading(false);
    }
  }, [id, page, debouncedSearch, statusFilter, activeSesiId]);

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
    if (tab === 'peserta' || tab === 'scan') fetchPeserta();
    if (tab === 'kehadiran') fetchKehadiran();
  }, [tab, fetchPeserta, fetchKehadiran]);
  useEffect(() => { setPage(1); }, [debouncedSearch, statusFilter, activeSesiId]);

  // Auto-refresh saat presensi berlangsung: tarik ulang peserta & kehadiran
  // tiap 10 detik agar petugas melihat kehadiran masuk tanpa reload manual.
  // Sengaja TIDAK memanggil fetchDetail — agar isian form Pengaturan yang
  // belum disimpan tidak tertimpa.
  useEffect(() => {
    if (!autoRefresh || !presensi?.is_open) return;
    const poll = setInterval(() => {
      fetchPeserta();
      fetchKehadiran(); // sekaligus menyegarkan kartu statistik
    }, 10_000);

    return () => clearInterval(poll);
  }, [autoRefresh, presensi?.is_open, fetchPeserta, fetchKehadiran]);

  const refreshAll = () => { fetchDetail(); fetchPeserta(); };

  const activeSesi = sesis.find((s) => s.id === activeSesiId) || null;

  const copyPublicCameraLink = async (token: string | null | undefined) => {
    if (!token) {
      toast.error('Token kamera sesi belum tersedia. Muat ulang halaman presensi terlebih dahulu.');
      return;
    }
    try {
      await navigator.clipboard.writeText(token);
      setCameraLinkCopied(true);
      toast.success('Token kamera disalin');
      setTimeout(() => setCameraLinkCopied(false), 2000);
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error, 'Tidak dapat menyalin token kamera'));
    }
  };

  const cameraSiteUrl = siteUrl();

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

  const handleMarkStatus = async (peserta: PresensiPeserta, status: 'hadir' | 'telat' | 'izin' | 'tidak_hadir') => {
    const label: Record<string, string> = { hadir: 'Hadir', telat: 'Telat', izin: 'Izin', tidak_hadir: 'Tidak Hadir' };
    if (peserta.kehadiran?.status === status) return;
    const scope = activeSesi ? ` pada sesi "${activeSesi.name}"` : '';
    if (await confirm({
      title: 'Ubah status kehadiran?',
      message: `Status kehadiran ${peserta.nama} akan diubah menjadi "${label[status]}"${scope}.`,
      confirmText: `Tandai ${label[status]}`,
      tone: status === 'tidak_hadir' ? 'danger' : 'default',
    })) {
      try {
        await api.post(`/presensi/${id}/peserta/${peserta.id}/mark`, { status, sesi_id: activeSesiId ?? undefined });
        toast.success(`${peserta.nama} ditandai ${label[status]}`);
        fetchPeserta();
        fetchDetail();
      } catch (error) {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(err.response?.data?.message || 'Gagal menandai kehadiran');
      }
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
    ...(presensi.mode === 'scan' || presensi.mode === 'both'
      ? [{ key: 'scan' as const, label: 'Scan', icon: <ScanLine className="w-4 h-4" /> }]
      : []),
    { key: 'kehadiran', label: 'Kehadiran', icon: <ClipboardCheck className="w-4 h-4" /> },
    { key: 'riwayat', label: 'Riwayat', icon: <History className="w-4 h-4" /> },
    { key: 'sesi', label: 'Sesi', icon: <Layers className="w-4 h-4" /> },
    { key: 'settings', label: 'Pengaturan', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 w-full">
      <PageHeader title={presensi.title} description={presensi.location || 'Sesi presensi'} badge={presensi.is_open ? 'Dibuka' : 'Ditutup'}>
        <div className="flex items-center gap-2">
          {sesis.length > 0 && (
            <select
              value={activeSesiId ?? ''}
              onChange={(e) => setActiveSesiId(e.target.value ? Number(e.target.value) : null)}
              className={`${inputCls} h-10 w-44 text-xs font-bold`}
              title="Pilih sesi aktif"
            >
              {sesis.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}{s.is_open ? '' : ' (tutup)'}
                </option>
              ))}
            </select>
          )}
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

      {/* Statistik — cakupan mengikuti sesi aktif bila ada. */}
      {scopeStats && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-600">
              Statistik {activeSesi ? `Sesi: ${activeSesi.name}` : 'Seluruh Kegiatan'}
            </span>
            <span className="text-slate-400">
              · {activeSesi ? 'angka dihitung untuk sesi yang dipilih' : 'angka dihitung untuk seluruh sesi'}
            </span>
            {activeSesi && <span className="ml-auto font-bold text-emerald-600">{scopeStats.persen_hadir}% kehadiran</span>}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              ['Total Peserta', scopeStats.total_peserta, 'text-slate-700'],
              ['Hadir', scopeStats.hadir, 'text-emerald-600'],
              ['Telat', scopeStats.telat, 'text-amber-600'],
              ['Izin', scopeStats.izin, 'text-blue-600'],
              ['Belum Hadir', scopeStats.belum_hadir, 'text-slate-500'],
            ].map(([label, value, color]) => (
              <Card key={label as string} className="border-slate-200/90 rounded-xl shadow-2xs">
                <CardContent className="pt-5 pb-4">
                  <div className={`text-2xl font-bold ${color}`}>{value as number}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{label as string}</div>
                </CardContent>
              </Card>
            ))}
          </div>
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
        <label className="ml-auto mb-1 inline-flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer select-none">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-slate-300 text-[#c20000] focus:ring-[#c20000]"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
          />
          <RefreshCw className={`w-3.5 h-3.5 ${autoRefresh ? 'text-emerald-500' : 'text-slate-400'}`} />
          Auto-refresh {autoRefresh && presensi.is_open ? '(aktif)' : ''}
        </label>
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
            <div className="overflow-x-auto">
              <table className="admin-panel-table w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <th className="py-3 px-4 pl-6 w-16">No</th>
                    <th className="py-3 px-4">Nama</th>
                    <th className="py-3 px-4 w-56">Kontak</th>
                    <th className="py-3 px-4 w-40">Asal</th>
                    {presensi.mode === 'self' && <th className="py-3 px-4">Jawaban Form</th>}
                    <th className="py-3 px-4 w-32">Status</th>
                    <th className="py-3 px-4 w-16 pr-6"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm bg-white">
                  {pesertaLoading ? (
                    <tr><td colSpan={presensi.mode === 'self' ? 7 : 6} className="py-14 text-center"><Loader2 className="w-7 h-7 animate-spin text-[#c20000] mx-auto" /></td></tr>
                  ) : peserta.length === 0 ? (
                    <tr><td colSpan={presensi.mode === 'self' ? 7 : 6} className="py-14 text-center text-slate-400 text-sm">{presensi.mode === 'self' ? 'Belum ada peserta yang mengisi form presensi.' : 'Belum ada peserta. Impor dari Excel atau tambah manual.'}</td></tr>
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
                        {presensi.mode === 'self' && (
                          <td className="py-3 px-4 text-xs text-slate-600">
                            {(() => {
                              const answers = (presensi.form_fields || [])
                                .filter((field) => !['nama', 'email', 'phone', 'asal'].includes(field.key))
                                .map((field) => {
                                const answer = p.form_data?.[field.key];
                                const display = Array.isArray(answer) ? answer.join(', ') : answer;
                                return display ? <div key={field.key}><span className="font-semibold">{field.label}:</span> {display}</div> : null;
                                }).filter(Boolean);
                              return answers.length ? answers : '—';
                            })()}
                          </td>
                        )}
                        <td className="py-3 px-4">
                          {p.kehadiran ? (
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${statusBadgeClass(p.kehadiran.status)}`}>
                                {statusLabel(p.kehadiran.status)}
                              </span>
                              <span
                                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold border ${methodBadgeClass(p.kehadiran.method)}`}
                                title={methodHint(p.kehadiran.method)}
                              >
                                {methodLabel(p.kehadiran.method)}
                              </span>
                            </div>
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
        <PresensiQrPanel presensi={presensi} peserta={peserta} activeSesi={activeSesi} onRefreshPeserta={fetchPeserta} stats={scopeStats} />
      )}

      {/* Scan — halaman khusus agar kamera punya ruang penuh. */}
      {tab === 'scan' && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs sm:p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-red-50 p-2.5 text-[#c20000]"><ScanLine className="h-5 w-5" /></div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">QR Kamera per Sesi</h2>
                <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-500">
                  Setiap QR membuka kamera langsung untuk sesi terkait. Tampilkan atau bagikan QR sesi yang sesuai; seluruh sesi tersedia di bawah ini.
                </p>
              </div>
            </div>
          </div>
          {sesis.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {sesis.map((sesi) => {
                const cameraUrl = sesi.scan_token ? `${cameraSiteUrl}/camera/${sesi.scan_token}` : '';
                return (
                  <Card key={sesi.id} className="overflow-hidden rounded-2xl border-slate-200/90 shadow-2xs">
                    <CardHeader className="border-b border-slate-100 bg-slate-50/80 p-4">
                      <CardTitle className="flex items-center justify-between gap-2 text-sm">
                        <span className="truncate">{sesi.name}</span>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${sesi.is_open ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                          {sesi.is_open ? 'Dibuka' : 'Ditutup'}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-3 p-5">
                      {cameraUrl ? (
                        <>
                          <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                            <QRCodeSVG value={cameraUrl} size={200} level="M" marginSize={3} />
                          </div>
                          <div className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-center">
                            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Token Sesi</div>
                            <code className="mt-0.5 block font-mono text-lg font-bold tracking-[0.2em] text-slate-800">{sesi.scan_token}</code>
                          </div>
                          <div className="flex w-full flex-wrap justify-center gap-2">
                            <Link href={`/camera/${sesi.scan_token}`} target="_blank" rel="noopener noreferrer">
                              <Button className="h-9 rounded-lg bg-[#c20000] px-3 text-xs font-bold text-white hover:bg-[#a30000]">
                                <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Buka Kamera
                              </Button>
                            </Link>
                            <Button onClick={() => copyPublicCameraLink(sesi.scan_token)} variant="outline" className="h-9 rounded-lg px-3 text-xs font-bold">
                              <Copy className="mr-1.5 h-3.5 w-3.5" /> {cameraLinkCopied ? 'Disalin' : 'Salin Token'}
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="flex h-[280px] items-center justify-center text-center text-sm text-amber-700">
                          Token sesi belum tersedia. Muat ulang halaman untuk memperbarui data.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
              Belum ada sesi presensi dengan token kamera.
            </div>
          )}
        </div>
      )}

      {/* Kehadiran */}
      {tab === 'kehadiran' && (
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
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold border ${methodBadgeClass(k.method)}`}
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
