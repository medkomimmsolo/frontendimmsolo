'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { 
  Search, 
  Loader2,
  CalendarDays,
  MapPin,
  Edit,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDateTime } from '@/lib/utils';
import { Event } from '@/types';
import Link from 'next/link';
import { useDebounce } from 'use-debounce';

export default function EventsManagement() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
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
      // In a real WP scenario, pagination params would be passed
      // But the current backend endpoint /events might not support pagination like blogs.
      // Assuming it does:
      const params: any = {
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
    if (window.confirm('Apakah Anda yakin ingin memindahkan agenda ini ke tempat sampah?')) {
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
      if (window.confirm(`Apakah Anda yakin ingin menghapus ${selectedEvents.length} agenda?`)) {
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

  const PaginationControls = () => {
    if (totalPages <= 1) return <div className="text-xs text-[#0f172a]/60 font-medium">{totalItems} items</div>;
    return (
      <div className="flex items-center gap-3 text-sm text-[#0f172a]/60 font-medium">
        <span>{totalItems} items</span>
        <div className="flex items-center gap-1">
          <button 
            disabled={currentPage === 1 || isLoading}
            onClick={() => setCurrentPage(1)}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-50 hover:text-[#c20000] disabled:opacity-50 text-slate-600 transition-colors"
          >«</button>
          <button 
            disabled={currentPage === 1 || isLoading}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-50 hover:text-[#c20000] disabled:opacity-50 text-slate-600 transition-colors"
          >‹</button>
          <span className="mx-1 flex items-center gap-2">
            <input 
              type="text" 
              value={currentPage} 
              readOnly 
              className="w-10 text-center border border-slate-200 rounded-md py-1 px-2 text-sm outline-none bg-white focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000]" 
            />
            <span className="text-sm">dari {totalPages}</span>
          </span>
          <button 
            disabled={currentPage === totalPages || isLoading}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-50 hover:text-[#c20000] disabled:opacity-50 text-slate-600 transition-colors"
          >›</button>
          <button 
            disabled={currentPage === totalPages || isLoading}
            onClick={() => setCurrentPage(totalPages)}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-50 hover:text-[#c20000] disabled:opacity-50 text-slate-600 transition-colors"
          >»</button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 w-full">
      
      {/* IMM-Style Header but WP Layout */}
      <div className="flex items-center gap-4 mb-2">
        <h1 className="text-2xl font-bold text-[#0f172a]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
          Agendas
        </h1>
        <Link href="/dashboard/events/create">
          <Button variant="outline" size="sm" className="h-8 border-[#c20000] text-[#c20000] hover:bg-[#c20000]/10 bg-white rounded-md text-sm font-medium px-4">
            Add New Agenda
          </Button>
        </Link>
      </div>

      {/* WP-Style Status Links with IMM Colors */}
      <ul className="flex flex-wrap gap-2 text-sm text-slate-500 mb-6 font-medium">
        <li>
          <button 
            onClick={() => setStatusFilter('all')} 
            className={`transition-colors pb-1 ${statusFilter === 'all' ? 'text-[#c20000] border-b-2 border-[#c20000]' : 'hover:text-[#c20000]'}`}
          >
            All
          </button>
          <span className="text-slate-300 mx-2">|</span>
        </li>
        <li>
          <button 
            onClick={() => setStatusFilter('upcoming')} 
            className={`transition-colors pb-1 ${statusFilter === 'upcoming' ? 'text-[#c20000] border-b-2 border-[#c20000]' : 'hover:text-[#c20000]'}`}
          >
            Upcoming
          </button>
          <span className="text-slate-300 mx-2">|</span>
        </li>
        <li>
          <button 
            onClick={() => setStatusFilter('ongoing')} 
            className={`transition-colors pb-1 ${statusFilter === 'ongoing' ? 'text-[#c20000] border-b-2 border-[#c20000]' : 'hover:text-[#c20000]'}`}
          >
            Ongoing
          </button>
          <span className="text-slate-300 mx-2">|</span>
        </li>
        <li>
          <button 
            onClick={() => setStatusFilter('completed')} 
            className={`transition-colors pb-1 ${statusFilter === 'completed' ? 'text-[#c20000] border-b-2 border-[#c20000]' : 'hover:text-[#c20000]'}`}
          >
            Completed
          </button>
        </li>
      </ul>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <select 
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
            className="bg-white border border-slate-200 rounded-md px-3 py-1.5 text-sm text-slate-700 focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] outline-none h-9 min-w-[140px] shadow-sm"
          >
            <option value="">Bulk actions</option>
            <option value="trash">Move to Trash</option>
          </select>
          <button 
            onClick={applyBulkAction}
            disabled={!bulkAction || isBulkLoading}
            className="h-9 px-4 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:text-[#c20000] disabled:opacity-50 rounded-md text-sm font-medium shadow-sm transition-colors"
          >
            {isBulkLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Apply'}
          </button>
        </div>

        <div className="flex items-center gap-6">
          <PaginationControls />
          <div className="flex items-center gap-2 relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search agendas..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 bg-white border border-slate-200 rounded-md pl-9 pr-3 text-sm text-slate-700 focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] outline-none shadow-sm w-48 transition-all"
            />
          </div>
        </div>
      </div>

      {/* WP-Style Data Table with IMM Theme */}
      <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <th className="p-3 pl-4 w-10">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={events.length > 0 && selectedEvents.length === events.length}
                    className="rounded border-slate-300 text-[#c20000] focus:ring-[#c20000]" 
                  />
                </th>
                <th className="p-3">Agenda</th>
                <th className="p-3 w-48">Location</th>
                <th className="p-3 w-32">Status</th>
                <th className="p-3 w-48 pr-4">Event Date</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-100 text-sm bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin text-[#c20000] mb-2" />
                      <span className="text-sm">Memuat data...</span>
                    </div>
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-slate-500 text-center">
                    Tidak ada agenda yang ditemukan.
                  </td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr key={event.id} className="group hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 pl-4 align-top">
                      <input 
                        type="checkbox" 
                        checked={selectedEvents.includes(event.id)}
                        onChange={() => handleSelectOne(event.id)}
                        className="rounded border-slate-300 text-[#c20000] focus:ring-[#c20000] mt-1" 
                      />
                    </td>
                    <td className="p-3 align-top">
                      <div className="flex items-center gap-2">
                        <Link href={`/dashboard/events/${event.id}`} className="font-semibold text-[#0f172a] hover:text-[#c20000] transition-colors text-base line-clamp-1">
                          {event.title}
                        </Link>
                      </div>
                      
                      {/* Hover Actions */}
                      <div className="flex items-center gap-3 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium">
                        <Link href={`/dashboard/events/${event.id}`} className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1">
                          <Edit className="w-3 h-3" /> Edit
                        </Link>
                        <span className="text-slate-300">|</span>
                        <button onClick={() => handleDelete(event.id)} className="text-red-600 hover:text-red-800 transition-colors flex items-center gap-1">
                          <Trash2 className="w-3 h-3" /> Trash
                        </button>
                      </div>
                    </td>
                    <td className="p-3 align-top text-slate-600">
                      <div className="flex items-start text-xs mt-0.5">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{event.location}</span>
                      </div>
                    </td>
                    <td className="p-3 align-top">
                      {event.status === 'upcoming' && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200">Upcoming</span>}
                      {event.status === 'ongoing' && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-600 border border-amber-200">Ongoing</span>}
                      {event.status === 'completed' && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-200">Completed</span>}
                      {event.status === 'cancelled' && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-600 border border-red-200">Cancelled</span>}
                    </td>
                    <td className="p-3 align-top pr-4">
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
              <tr className="bg-slate-50 border-t border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <th className="p-3 pl-4 w-10">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={events.length > 0 && selectedEvents.length === events.length}
                    className="rounded border-slate-300 text-[#c20000] focus:ring-[#c20000]" 
                  />
                </th>
                <th className="p-3">Agenda</th>
                <th className="p-3">Location</th>
                <th className="p-3">Status</th>
                <th className="p-3 pr-4">Event Date</th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      
      {/* Bottom Pagination */}
      <div className="flex justify-end mt-4">
        <PaginationControls />
      </div>

    </div>
  );
}
