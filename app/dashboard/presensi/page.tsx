'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import {
  Plus,
  Search,
  Loader2,
  CalendarDays,
  MapPin,
  Edit,
  Trash2,
  Eye,
  QrCode,
  ToggleLeft,
  ToggleRight,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getUserFacingErrorMessage } from '@/lib/errorMessage';
import { useConfirm } from '@/components/providers/ConfirmProvider';
import { formatDateTime } from '@/lib/utils';
import { Presensi } from '@/types';
import Link from 'next/link';
import { useDebounce } from 'use-debounce';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { PageHeader } from '@/components/ui/PageHeader';

const MODE_LABEL: Record<string, string> = {
  self: 'Form Presensi',
  scan: 'Scan Peserta',
  both: 'Form + Scan (Lama)',
};

export default function PresensiManagement() {
  const { user } = useAuth();
  const { confirm } = useConfirm();
  const [items, setItems] = useState<Presensi[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch] = useDebounce(searchQuery, 800);
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, unknown> = {
        search: debouncedSearch || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        page: currentPage,
        per_page: 15,
      };
      const response = await api.get('/presensi', { params });
      const payload = response.data.data;
      setItems(payload?.data || []);
      setTotalPages(payload?.last_page || 1);
      setTotalItems(payload?.total || 0);
    } catch (error) {
      console.error('Failed to fetch presensi', error);
      toast.error(getUserFacingErrorMessage(error, 'Gagal memuat data presensi'));
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, statusFilter, currentPage]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter]);

  const handleDelete = async (id: number) => {
    if (await confirm({ title: 'Hapus sesi presensi?', message: 'Sesi ini beserta seluruh peserta dan catatan kehadirannya akan dihapus.', confirmText: 'Hapus sesi', tone: 'danger' })) {
      try {
        await api.delete(`/presensi/${id}`);
        toast.success('Sesi presensi berhasil dihapus');
        fetchItems();
      } catch (error) {
        console.error(error);
        toast.error(getUserFacingErrorMessage(error, 'Gagal menghapus sesi presensi'));
      }
    }
  };

  const handleToggle = async (item: Presensi) => {
    try {
      await api.put(`/presensi/${item.id}/toggle-open`, { is_open: !item.is_open });
      toast.success(item.is_open ? 'Presensi ditutup' : 'Presensi dibuka');
      fetchItems();
    } catch (error) {
      console.error(error);
      toast.error(getUserFacingErrorMessage(error, 'Gagal mengubah status presensi'));
    }
  };

  return (
    <div className="space-y-6 w-full">
      <PageHeader
        title="Presensi Kegiatan"
        description="Kelola kehadiran melalui form publik dengan QR langsung ke form, atau scan QR peserta oleh petugas"
        badge="Presensi"
      >
        <Link href="/dashboard/presensi/create">
          <Button className="h-10 px-5 bg-[#c20000] hover:bg-[#a30000] text-white rounded-xl text-xs font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]">
            <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
            Buat Sesi Presensi
          </Button>
        </Link>
      </PageHeader>

      <ul className="flex flex-wrap gap-2 text-sm text-slate-500 mb-2 font-medium">
        {([
          ['all', 'Semua'],
          ['open', 'Dibuka'],
          ['closed', 'Ditutup'],
        ] as const).map(([key, label], idx) => (
          <li key={key}>
            <button
              onClick={() => setStatusFilter(key)}
              className={`transition-colors pb-1 ${statusFilter === key ? 'text-[#c20000] border-b-2 border-[#c20000]' : 'hover:text-[#c20000]'}`}
            >
              {label}
            </button>
            {idx < 2 && <span className="text-slate-300 mx-2">|</span>}
          </li>
        ))}
      </ul>

      <div className="flex justify-end mb-4">
        <div className="flex items-center gap-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari sesi presensi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white border border-slate-200 rounded-sm pl-10 pr-3 py-2.5 text-sm text-slate-700 focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] outline-none shadow-sm w-56 transition-all"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="admin-panel-table w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4 pl-6">Sesi Presensi</th>
                <th className="py-3.5 px-4 w-40">Jadwal</th>
                <th className="py-3.5 px-4 w-32">Mode</th>
                <th className="py-3.5 px-4 w-28">Peserta</th>
                <th className="py-3.5 px-4 w-28">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <Loader2 className="w-8 h-8 animate-spin text-[#c20000] mb-2" />
                      <span className="text-sm font-medium">Memuat data presensi...</span>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3 text-slate-300">
                        <QrCode className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">Belum ada sesi presensi</p>
                      <p className="text-xs text-slate-400 mt-1">Buat sesi baru untuk mulai mencatat kehadiran</p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="group hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 pl-6 align-top">
                      <Link href={`/dashboard/presensi/${item.id}`} className="font-semibold text-[#0f172a] hover:text-[#c20000] transition-colors text-base line-clamp-1">
                        {item.title}
                      </Link>
                      {item.location && (
                        <div className="text-xs text-slate-500 mt-1 flex items-center">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" /> {item.location}
                        </div>
                      )}
                      {item.user?.name && (
                        <div className="text-xs text-slate-500 mt-1">
                          Pembuat: <span className="font-medium text-slate-700">{item.user.name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Link href={`/dashboard/presensi/${item.id}`} title="Kelola" className="h-9 w-9 inline-flex items-center justify-center text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-sm transition-colors">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleToggle(item)} title={item.is_open ? 'Tutup' : 'Buka'} className={`h-9 w-9 inline-flex items-center justify-center rounded-sm transition-colors ${item.is_open ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'}`}>
                          {item.is_open ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                        </button>
                        <button onClick={() => handleDelete(item.id)} title="Hapus" className="h-9 w-9 inline-flex items-center justify-center text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-sm transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="p-4 align-top text-slate-600">
                      <div className="text-[#0f172a] font-medium text-xs flex items-center">
                        <CalendarDays className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                        {item.starts_at ? formatDateTime(item.starts_at).split(' ').slice(0, 2).join(' ') : '-'}
                      </div>
                      {item.ends_at && (
                        <div className="text-slate-500 text-xs mt-0.5">
                          s.d. {formatDateTime(item.ends_at).split(' ').slice(0, 2).join(' ')}
                        </div>
                      )}
                    </td>
                    <td className="p-4 align-top">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        {MODE_LABEL[item.mode]}
                      </span>
                    </td>
                    <td className="p-4 align-top">
                      <div className="flex items-center gap-1 text-slate-700 text-sm font-semibold">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {item.pesertas_count ?? 0}
                      </div>
                      <div className="text-2xs text-emerald-600 mt-0.5">
                        {item.kehadirans_count ?? 0} hadir
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      {item.is_open ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-200">Dibuka</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">Ditutup</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs mt-4 overflow-hidden">
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          unit="sesi"
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
