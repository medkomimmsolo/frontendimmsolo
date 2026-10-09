'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Loader2, Search, Inbox, Trash2, MailOpen, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { useConfirm } from '@/components/providers/ConfirmProvider';

export default function MessagesPage() {
  const { confirm } = useConfirm();
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [expanded, setExpanded] = useState<number | null>(null);

  const fetchMessages = useCallback(async (page = currentPage, unread = unreadOnly) => {
    setIsLoading(true);
    try {
      const res = await api.get('/messages', { params: { page, per_page: 15, unread: unread ? 1 : undefined } });
      const payload = res.data.data;
      if (payload && payload.data) {
        setMessages(payload.data);
        setTotalPages(payload.last_page || 1);
        setTotalItems(payload.total || 0);
      } else {
        setMessages([]);
      }
    } catch {
      toast.error('Gagal memuat pesan');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, unreadOnly]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages, currentPage]);

  const toggleRead = async (m: any) => {
    if (!m.is_read) {
      try {
        await api.put(`/messages/${m.id}/read`);
        setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, is_read: true } : x)));
      } catch {
        /* abaikan */
      }
    }
    setExpanded((prev) => (prev === m.id ? null : m.id));
  };

  const handleDelete = async (id: number) => {
    if (!(await confirm({ message: 'Hapus pesan ini?', tone: 'danger' }))) return;
    try {
      await api.delete(`/messages/${id}`);
      toast.success('Pesan dihapus');
      fetchMessages();
    } catch {
      toast.error('Gagal menghapus');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-sm shadow-sm border border-[#0f172a]/5">
        <h1 className="text-2xl font-bold text-[#0f172a] flex items-center gap-2" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
          <Inbox className="w-6 h-6 text-[#c20000]" /> Kotak Masuk
        </h1>
        <p className="text-[#0f172a]/70 text-sm mt-1">Pesan dari formulir kontak website.</p>
      </div>

      <div className="flex gap-2">
        <button onClick={() => { setUnreadOnly(false); setCurrentPage(1); }}
          className={`px-4 py-2 rounded-sm text-sm font-semibold border transition-colors ${!unreadOnly ? 'bg-[#c20000] text-white border-[#c20000]' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
          Semua
        </button>
        <button onClick={() => { setUnreadOnly(true); setCurrentPage(1); }}
          className={`px-4 py-2 rounded-sm text-sm font-semibold border transition-colors ${unreadOnly ? 'bg-[#c20000] text-white border-[#c20000]' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
          Belum dibaca
        </button>
      </div>

      <Card className="border-[#0f172a]/10 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {isLoading ? (
            <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[#c20000]" /></div>
          ) : messages.length === 0 ? (
            <div className="p-12 text-center text-slate-500">Tidak ada pesan</div>
          ) : messages.map((m: any) => (
            <div key={m.id} className={`${!m.is_read ? 'bg-[#c20000]/[0.03]' : ''}`}>
              <button onClick={() => toggleRead(m)} className="w-full flex items-center gap-4 p-4 sm:px-6 text-left hover:bg-slate-50 transition-colors">
                <span className="text-slate-400">{m.is_read ? <MailOpen className="w-5 h-5" /> : <Mail className="w-5 h-5 text-[#c20000]" />}</span>
                <span className="flex-1 min-w-0">
                  <span className={`block truncate ${!m.is_read ? 'font-bold text-[#0f172a]' : 'font-medium text-slate-700'}`}>{m.subject}</span>
                  <span className="block text-xs text-slate-500 truncate mt-0.5">{m.name} • {m.email}</span>
                </span>
                <span className="text-xs text-slate-400 whitespace-nowrap hidden sm:block">
                  {new Date(m.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <span onClick={(e) => { e.stopPropagation(); handleDelete(m.id); }}
                  className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors" title="Hapus">
                  <Trash2 className="w-4 h-4" />
                </span>
              </button>
              {expanded === m.id && (
                <div className="px-4 sm:px-6 pb-5 pl-[3.75rem]">
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50 border border-slate-100 rounded-sm p-4">{m.message}</p>
                  <a href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject)}`} className="inline-block mt-3 text-xs font-bold text-[#c20000] hover:text-[#a30000]">
                    Balas via Email →
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
          <p className="text-xs text-slate-500 font-medium">Menampilkan {(currentPage - 1) * 15 + 1}–{Math.min(currentPage * 15, totalItems)} dari {totalItems} pesan</p>
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
