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
  UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useConfirm } from '@/components/providers/ConfirmProvider';
import { formatDateTime } from '@/lib/utils';
import { Event } from '@/types';
import Link from 'next/link';
import { useDebounce } from 'use-debounce';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { TransferOwnershipModal } from '@/components/ui/TransferOwnershipModal';
import { PageHeader } from '@/components/ui/PageHeader';

export default function EventsManagement() {
  const { user } = useAuth();
  const { confirm } = useConfirm();
  const isSuperAdmin = user?.roles?.some((r: any) => r.name === 'super-admin');
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [transferItem, setTransferItem] = useState<any>(null);
  
  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch] = useDebounce(searchQuery, 800);
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Bulk Actions
  const [selectedEvents, setSelectedEvents] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState('');
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: any = {
        admin: 1,
        search: debouncedSearch || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        page: currentPage,
        per_page: 15
      };

      const response = await api.get('/events', { params });
      
      const payload = response.data.data;
      if (payload && payload.data) {
        // Handle paginated response
        setEvents(payload.data);
        setTotalPages(payload.last_page || 1);
        setTotalItems(payload.total || 0);
      } else {
        // Handle unpaginated array response from current backend
        let filtered = Array.isArray(payload) ? payload : [];
        if (debouncedSearch) {
          filtered = filtered.filter((e: any) => e.title.toLowerCase().includes(debouncedSearch.toLowerCase()));
        }
        if (statusFilter !== 'all') {
          filtered = filtered.filter((e: any) => e.status === statusFilter);
        }
        
        // Manual pagination
        const itemsPerPage = 15;
        const total = filtered.length;
        setTotalItems(total);
        setTotalPages(Math.ceil(total / itemsPerPage) || 1);
        
        const start = (currentPage - 1) * itemsPerPage;
        setEvents(filtered.slice(start, start + itemsPerPage));
      }
      setSelectedEvents([]);
    } catch (error) {
      console.error('Failed to fetch events', error);
      toast.error('Gagal memuat data agenda');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, statusFilter, currentPage]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter]);

  const handleDelete = async (id: number) => {
    if (await confirm({ message: 'Apakah Anda yakin ingin memindahkan agenda ini ke tempat sampah?', tone: 'danger' })) {
      try {
        await api.delete(`/events/${id}`);
        toast.success('Agenda berhasil dihapus');
        fetchEvents();
      } catch (error) {
        console.error('Failed to delete', error);
        toast.error('Gagal menghapus agenda');
      }
    }
  };

  // --- Bulk Action Handlers ---
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedEvents(events.map(ev => ev.id));
    } else {
      setSelectedEvents([]);
    }
  };

  const handleSelectOne = (id: number) => {
    if (selectedEvents.includes(id)) {
      setSelectedEvents(selectedEvents.filter(eId => eId !== id));
    } else {
      setSelectedEvents([...selectedEvents, id]);
    }
  };

  const applyBulkAction = async () => {
    if (bulkAction === 'trash' && selectedEvents.length > 0) {
      if (await confirm({ message: `Apakah Anda yakin ingin menghapus ${selectedEvents.length} agenda?`, tone: 'danger' })) {
        setIsBulkLoading(true);
        try {
          await Promise.all(selectedEvents.map(id => api.delete(`/events/${id}`)));
          toast.success(`${selectedEvents.length} agenda berhasil dihapus`);
          fetchEvents();
          setBulkAction('');
        } catch (error) {
          console.error('Failed to delete some events', error);
          toast.error('Gagal menghapus beberapa agenda');
        } finally {
          setIsBulkLoading(false);
        }
      }
    } else if (selectedEvents.length === 0) {
      toast.error('Pilih setidaknya satu agenda');
    }
  };

  return (
    <div className="space-y-6 w-full">
      
      {/* Modern Page Header */}
      <PageHeader
        title="Agenda Kegiatan"
        description="Kelola jadwal, lokasi, dan informasi kegiatan PC IMM Kota Surakarta"
        badge="Kegiatan"
      >
        <Link href="/dashboard/events/create">
          <Button className="h-10 px-5 bg-[#c20000] hover:bg-[#a30000] text-white rounded-xl text-xs font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]">
            <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
            Buat Agenda
          </Button>
        </Link>
      </PageHeader>

      {/* WP-Style Status Links with IMM Colors */}
      <ul className="flex flex-wrap gap-2 text-sm text-slate-500 mb-6 font-medium">
        <li>
          <button 
            onClick={() => setStatusFilter('all')} 
            className={`transition-colors pb-1 ${statusFilter === 'all' ? 'text-[#c20000] border-b-2 border-[#c20000]' : 'hover:text-[#c20000]'}`}
          >
            Semua
          </button>
          <span className="text-slate-300 mx-2">|</span>
        </li>
        <li>
          <button 
            onClick={() => setStatusFilter('upcoming')} 
            className={`transition-colors pb-1 ${statusFilter === 'upcoming' ? 'text-[#c20000] border-b-2 border-[#c20000]' : 'hover:text-[#c20000]'}`}
          >
            Mendatang
          </button>
          <span className="text-slate-300 mx-2">|</span>
        </li>
        <li>
          <button 
            onClick={() => setStatusFilter('ongoing')} 
            className={`transition-colors pb-1 ${statusFilter === 'ongoing' ? 'text-[#c20000] border-b-2 border-[#c20000]' : 'hover:text-[#c20000]'}`}
          >
            Berlangsung
          </button>
          <span className="text-slate-300 mx-2">|</span>
        </li>
        <li>
          <button 
            onClick={() => setStatusFilter('completed')} 
            className={`transition-colors pb-1 ${statusFilter === 'completed' ? 'text-[#c20000] border-b-2 border-[#c20000]' : 'hover:text-[#c20000]'}`}
          >
            Selesai
          </button>
        </li>
      </ul>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <select 
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
            className="bg-white border border-slate-200 rounded-sm px-3 py-1.5 text-sm text-slate-700 focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] outline-none h-10 min-w-[140px] shadow-sm"
          >
            <option value="">Aksi massal</option>
            <option value="trash">Pindah ke sampah</option>
          </select>
          <button 
            onClick={applyBulkAction}
            disabled={!bulkAction || isBulkLoading}
            className="h-10 px-4 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:text-[#c20000] disabled:opacity-50 rounded-sm text-sm font-medium shadow-sm transition-colors"
          >
            {isBulkLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Terapkan'}
          </button>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari agenda..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-slate-200 rounded-sm pl-10 pr-3 py-2.5 text-sm text-slate-700 focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] outline-none shadow-sm w-48 transition-all"
            />
          </div>
        </div>
      </div>

      {/* WP-Style Data Table with IMM Theme */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4 pl-6 w-10">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={events.length > 0 && selectedEvents.length === events.length}
                    className="rounded border-slate-300 text-[#c20000] focus:ring-[#c20000]" 
                  />
                </th>
                <th className="py-3.5 px-4">Agenda</th>
                <th className="py-3.5 px-4 w-48">Lokasi</th>
                <th className="py-3.5 px-4 w-32">Status</th>
                <th className="py-3.5 px-4 w-48 pr-6">Tanggal</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-100 text-sm bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <Loader2 className="w-8 h-8 animate-spin text-[#c20000] mb-2" />
                      <span className="text-sm font-medium">Memuat data agenda...</span>
                    </div>
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3 text-slate-300">
                        <CalendarDays className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">Tidak ada agenda ditemukan</p>
                      <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci atau filter status</p>
                    </div>
                  </td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr key={event.id} className="group hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 pl-6 align-top">
                      <input 
                        type="checkbox" 
                        checked={selectedEvents.includes(event.id)}
                        onChange={() => handleSelectOne(event.id)}
                        className="rounded border-slate-200 text-[#c20000] focus:ring-[#c20000] mt-1" 
                      />
                    </td>
                    <td className="p-4\1align-top">
                      <div className="flex items-center gap-2">
                        <Link href={`/dashboard/events/${event.id}`} className="font-semibold text-[#0f172a] hover:text-[#c20000] transition-colors text-base line-clamp-1">
                          {event.title}
                        </Link>
                      </div>
                      {(event as any).user?.name && (
                        <div className="text-xs text-slate-500 mt-1">
                          Pembuat: <span className="font-medium text-slate-700">{(event as any).user.name}</span>
                        </div>
                      )}
                      
                      {/* Aksi */}
                      <div className="flex items-center gap-2 mt-2">
                        <Link href={`/dashboard/events/${event.id}`} title="Edit" className="h-9 w-9 inline-flex items-center justify-center text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-sm transition-colors">
                          <Edit className="w-4 h-4" />
                        </Link>
                        {isSuperAdmin && (
                          <button
                            onClick={() => setTransferItem(event)}
                            title="Transfer Pemilik"
                            className="h-9 w-9 inline-flex items-center justify-center text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-sm transition-colors"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => handleDelete(event.id)} title="Hapus" className="h-9 w-9 inline-flex items-center justify-center text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-sm transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <Link href={`/agenda/${event.slug}`} target="_blank" title="Lihat" className="h-9 w-9 inline-flex items-center justify-center text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-sm transition-colors">
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                    <td className="p-4\1align-top text-slate-600">
                      <div className="flex items-start text-xs mt-0.5">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{event.location}</span>
                      </div>
                    </td>
                    <td className="p-4\1align-top">
                      {event.status === 'upcoming' && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200">Mendatang</span>}
                      {event.status === 'ongoing' && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-600 border border-amber-200">Berlangsung</span>}
                      {event.status === 'completed' && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-200">Selesai</span>}
                      {event.status === 'cancelled' && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-600 border border-red-200">Dibatalkan</span>}
                    </td>
                    <td className="p-4\1align-top pr-4">
                      <div className="text-[#0f172a] font-medium text-xs flex items-center">
                         <CalendarDays className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                         {formatDateTime(event.event_date).split(' ')[0]}
                      </div>
                      <div className="text-slate-500 text-xs mt-0.5 ml-5">
                         {formatDateTime(event.event_date).split(' ').slice(1).join(' ')}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            
            <tfoot>
              <tr className="bg-slate-50/80 border-t border-slate-200/80 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="py-3 px-4 pl-6 w-10">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={events.length > 0 && selectedEvents.length === events.length}
                    className="rounded border-slate-300 text-[#c20000] focus:ring-[#c20000]" 
                  />
                </th>
                <th className="py-3 px-4">Agenda</th>
                <th className="py-3 px-4">Lokasi</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 pr-6">Tanggal</th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      
      {/* Bottom Pagination */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs mt-4 overflow-hidden">
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          unit="agenda"
          onPageChange={setCurrentPage}
        />
      </div>

      {transferItem && (
        <TransferOwnershipModal
          isOpen={!!transferItem}
          onClose={() => setTransferItem(null)}
          itemTitle={transferItem.title}
          currentOwnerName={transferItem.user?.name}
          onTransfer={async (newUserId) => {
            await api.put(`/events/${transferItem.id}`, { user_id: newUserId });
            fetchEvents();
          }}
        />
      )}
    </div>
  );
}
