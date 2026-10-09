'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Megaphone,
  Plus,
  Loader2,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  Calendar,
  X,
  UserCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useConfirm } from '@/components/providers/ConfirmProvider';
import { useAuth } from '@/hooks/useAuth';
import TransferOwnershipModal from '@/components/ui/TransferOwnershipModal';

interface AnnouncementItem {
  id: number;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'urgent' | 'success';
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  user?: {
    id: number;
    name: string;
  };
}

const typeBadges = {
  info: { label: 'Info', class: 'bg-blue-100 text-blue-700', icon: <Info className="w-3.5 h-3.5" /> },
  warning: { label: 'Peringatan', class: 'bg-amber-100 text-amber-700', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  urgent: { label: 'Penting / Urgent', class: 'bg-red-100 text-[#c20000]', icon: <AlertCircle className="w-3.5 h-3.5" /> },
  success: { label: 'Sukses', class: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
};

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.roles?.some((r: any) => r.name === 'super-admin');
  const { confirm } = useConfirm();
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<AnnouncementItem | null>(null);
  const [transferItem, setTransferItem] = useState<AnnouncementItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info' as 'info' | 'warning' | 'urgent' | 'success',
    is_active: true,
    expires_at: '',
  });

  const fetchAnnouncements = useCallback(async (page = currentPage) => {
    setIsLoading(true);
    try {
      const res = await api.get('/announcements', { params: { page, per_page: 10 } });
      const payload = res.data.data;
      if (payload && payload.data) {
        setAnnouncements(payload.data);
        setTotalPages(payload.last_page || 1);
      } else {
        setAnnouncements([]);
      }
    } catch {
      toast.error('Gagal memuat daftar pengumuman');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements, currentPage]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      content: '',
      type: 'info',
      is_active: true,
      expires_at: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: AnnouncementItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      content: item.content,
      type: item.type,
      is_active: item.is_active,
      expires_at: item.expires_at ? item.expires_at.slice(0, 16) : '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Judul dan isi pengumuman wajib diisi');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
      };

      if (editingItem) {
        await api.put(`/announcements/${editingItem.id}`, payload);
        toast.success('Pengumuman berhasil diperbarui');
      } else {
        await api.post('/announcements', payload);
        toast.success('Pengumuman berhasil dibuat');
      }

      setIsModalOpen(false);
      fetchAnnouncements();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal menyimpan pengumuman');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!(await confirm({ message: 'Apakah Anda yakin ingin menghapus pengumuman ini?', tone: 'danger' }))) {
      return;
    }

    try {
      await api.delete(`/announcements/${id}`);
      toast.success('Pengumuman dihapus');
      fetchAnnouncements();
    } catch {
      toast.error('Gagal menghapus pengumuman');
    }
  };

  const handleToggleActive = async (item: AnnouncementItem) => {
    try {
      await api.put(`/announcements/${item.id}`, {
        title: item.title,
        content: item.content,
        type: item.type,
        is_active: !item.is_active,
        expires_at: item.expires_at,
      });
      toast.success(`Pengumuman di${!item.is_active ? 'aktifkan' : 'nonaktifkan'}`);
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === item.id ? { ...a, is_active: !a.is_active } : a))
      );
    } catch {
      toast.error('Gagal mengubah status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-sm shadow-sm border border-[#0f172a]/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold text-[#0f172a] flex items-center gap-2"
            style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
          >
            <Megaphone className="w-6 h-6 text-[#c20000]" />
            Pengumuman Internal
          </h1>
          <p className="text-[#0f172a]/70 text-sm mt-1">
            Siarkan pengumuman atau instruksi penting kepada seluruh pengurus & kader yang login di dashboard.
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-[#c20000] hover:bg-[#a30000] text-white flex items-center gap-2 self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          Buat Pengumuman
        </Button>
      </div>

      {/* List */}
      <Card className="border-[#0f172a]/10 shadow-sm overflow-hidden bg-white">
        {isLoading ? (
          <div className="p-16 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#c20000]" />
            <p className="text-sm text-slate-500 mt-2">Memuat pengumuman...</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-700">Belum ada pengumuman</p>
            <p className="text-sm text-slate-500 mt-1">
              Klik &quot;Buat Pengumuman&quot; untuk menambahkan banner baru bagi anggota yang login.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {announcements.map((item) => {
              const badge = typeBadges[item.type] || typeBadges.info;
              const isExpired = item.expires_at && new Date(item.expires_at) < new Date();

              return (
                <div key={item.id} className="p-5 sm:px-6 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded ${badge.class}`}>
                        {badge.icon}
                        {badge.label}
                      </span>
                      {item.is_active && !isExpired ? (
                        <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                          Aktif
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                          {isExpired ? 'Kedaluwarsa' : 'Nonaktif'}
                        </span>
                      )}
                      <h3 className="text-base font-bold text-[#0f172a] truncate">{item.title}</h3>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                      {item.content}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                      <span>Oleh: {item.user?.name || 'Admin'}</span>
                      {item.expires_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Kedaluwarsa: {new Date(item.expires_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(item)}
                      className={`text-xs h-8 ${item.is_active ? 'border-amber-200 text-amber-700 hover:bg-amber-50' : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'}`}
                    >
                      {item.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                    </Button>
                    {isSuperAdmin && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setTransferItem(item)}
                        className="w-8 h-8 text-purple-600 hover:bg-purple-50 hover:border-purple-200"
                        title="Transfer Pemilik"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleOpenEdit(item)}
                      className="w-8 h-8 text-slate-600 hover:text-slate-900"
                      title="Edit pengumuman"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(item.id)}
                      className="w-8 h-8 text-red-600 hover:bg-red-50 hover:border-red-200"
                      title="Hapus pengumuman"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Halaman {currentPage} dari {totalPages}</span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0f172a]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-sm shadow-2xl max-w-lg w-full p-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-[#0f172a] mb-4" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
              {editingItem ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Judul Pengumuman
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: Rapat Pleno Cabang, Jadwal LKTM, dll"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-sm focus:outline-none focus:border-[#c20000]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tipe & Warna Banner
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-sm focus:outline-none focus:border-[#c20000] bg-white"
                >
                  <option value="info">Info (Biru)</option>
                  <option value="warning">Peringatan (Kuning/Oranye)</option>
                  <option value="urgent">Penting / Darurat (Merah)</option>
                  <option value="success">Sukses / Pengumuman Bahagia (Hijau)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Isi Pengumuman
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Tuliskan detail informasi, instruksi, atau link yang ingin disampaikan..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-sm focus:outline-none focus:border-[#c20000]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tanggal Berakhir (Opsional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-sm focus:outline-none focus:border-[#c20000]"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Kosongkan jika ingin pengumuman tayang selamanya sampai dinonaktifkan secara manual.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded text-[#c20000] focus:ring-[#c20000]"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-slate-700 cursor-pointer">
                  Langsung aktifkan pengumuman ini
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-[#c20000] hover:bg-[#a30000] text-white"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                      Menyimpan...
                    </>
                  ) : (
                    'Simpan'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Transfer Pemilik */}
      {transferItem && (
        <TransferOwnershipModal
          isOpen={!!transferItem}
          onClose={() => setTransferItem(null)}
          itemTitle={transferItem.title}
          currentOwnerName={transferItem.user?.name}
          onTransfer={async (newUserId) => {
            await api.put(`/announcements/${transferItem.id}`, {
              title: transferItem.title,
              content: transferItem.content,
              type: transferItem.type,
              user_id: newUserId,
            });
            fetchAnnouncements();
          }}
        />
      )}
    </div>
  );
}
