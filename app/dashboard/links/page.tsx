'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Plus, Search, Edit, Trash2, Loader2, Layers, ExternalLink, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useConfirm } from '@/components/providers/ConfirmProvider';
import { useAuth } from '@/hooks/useAuth';
import TransferOwnershipModal from '@/components/ui/TransferOwnershipModal';
import { useDebounce } from 'use-debounce';

export default function LinksManagement() {
  const { user } = useAuth();
  const isSuperAdmin = user?.roles?.some((r: any) => r.name === 'super-admin');
  const { confirm } = useConfirm();
  const [pages, setPages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch] = useDebounce(searchQuery, 800);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [transferItem, setTransferItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    is_active: true,
    bg_color: '',
    accent_color: '',
    text_color: '',
    btn_bg_color: '',
    btn_text_color: '',
  });

  const THEME_PRESETS = [
    { name: 'Midnight', bg: '#0b1120', accent: '#c20000', text: '#ffffff', btnBg: '', btnText: '#ffffff' },
    { name: 'Crimson', bg: '#1a0505', accent: '#e11d48', text: '#ffffff', btnBg: '#e11d48', btnText: '#ffffff' },
    { name: 'Ocean', bg: '#082f49', accent: '#0ea5e9', text: '#ffffff', btnBg: '#0284c7', btnText: '#ffffff' },
    { name: 'Forest', bg: '#052e1b', accent: '#10b981', text: '#ffffff', btnBg: '#059669', btnText: '#ffffff' },
    { name: 'Royal', bg: '#1e1b4b', accent: '#8b5cf6', text: '#ffffff', btnBg: '#7c3aed', btnText: '#ffffff' },
    { name: 'Sand Light', bg: '#fef3c7', accent: '#b45309', text: '#78350f', btnBg: '#ffffff', btnText: '#92400e' },
    { name: 'Clean White', bg: '#ffffff', accent: '#c20000', text: '#0f172a', btnBg: '#0f172a', btnText: '#ffffff' },
  ];
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchPages = useCallback(async (page = currentPage, search = debouncedSearch) => {
    setIsLoading(true);
    try {
      const res = await api.get('/link-pages', { params: { page, per_page: 15, search: search || undefined } });
      const payload = res.data.data;
      if (payload && payload.data) {
        setPages(payload.data);
        setTotalPages(payload.last_page || 1);
        setTotalItems(payload.total || 0);
      } else {
        setPages(Array.isArray(payload) ? payload : []);
      }
    } catch {
      toast.error('Gagal memuat halaman link');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages, currentPage]);

  const openModal = (item: any = null) => {
    setEditing(item);
    setFormData(
      item
        ? {
            title: item.title,
            slug: item.slug,
            description: item.description || '',
            is_active: item.is_active,
            bg_color: item.bg_color || '',
            accent_color: item.accent_color || '',
            text_color: item.text_color || '',
            btn_bg_color: item.btn_bg_color || '',
            btn_text_color: item.btn_text_color || '',
          }
        : {
            title: '',
            slug: '',
            description: '',
            is_active: true,
            bg_color: '',
            accent_color: '',
            text_color: '',
            btn_bg_color: '',
            btn_text_color: '',
          }
    );
    setAvatarFile(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      if (formData.slug) data.append('slug', formData.slug);
      if (formData.description) data.append('description', formData.description);
      data.append('is_active', formData.is_active ? '1' : '0');
      if (formData.bg_color) data.append('bg_color', formData.bg_color);
      if (formData.accent_color) data.append('accent_color', formData.accent_color);
      if (formData.text_color) data.append('text_color', formData.text_color);
      if (formData.btn_bg_color) data.append('btn_bg_color', formData.btn_bg_color);
      if (formData.btn_text_color) data.append('btn_text_color', formData.btn_text_color);
      if (avatarFile) data.append('avatar', avatarFile);
      if (editing) {
        data.append('_method', 'PUT');
        await api.post(`/link-pages/${editing.id}`, data);
        toast.success('Halaman link diperbarui');
      } else {
        await api.post('/link-pages', data);
        toast.success('Halaman link dibuat');
      }
      setIsModalOpen(false);
      fetchPages();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!(await confirm({ message: 'Hapus halaman link ini beserta semua tautannya?', tone: 'danger' }))) return;
    try {
      await api.delete(`/link-pages/${id}`);
      toast.success('Halaman link dihapus');
      fetchPages();
    } catch {
      toast.error('Gagal menghapus');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-sm shadow-sm border border-[#0f172a]/5">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>Linktree</h1>
          <p className="text-[#0f172a]/70 text-sm mt-1">Kelola halaman tautan ala Linktree di immsolo.or.id/links</p>
        </div>
        <Button onClick={() => openModal()} className="h-10 px-5 bg-[#c20000] hover:bg-[#a30000] text-white rounded-sm text-sm font-semibold shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> Buat Halaman
        </Button>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); setCurrentPage(1); fetchPages(1, searchQuery); }} className="bg-white border border-[#0f172a]/10 rounded-sm p-4 sm:p-6 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Cari judul atau slug... (Enter)" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-slate-200 rounded-sm pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000]" />
        </div>
      </form>

      <Card className="border-[#0f172a]/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-[#0f172a]/5 text-[#0f172a]/70 text-sm font-semibold uppercase tracking-wider">
                <th className="p-4 pl-6">Halaman</th>
                <th className="p-4">Slug / URL</th>
                <th className="p-4 text-center">Tautan</th>
                <th className="p-4 text-center">Total Klik</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 pr-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr><td colSpan={6} className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[#c20000]" /></td></tr>
              ) : pages.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-slate-500">Belum ada halaman link</td></tr>
              ) : pages.map((p: any) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 pl-6">
                    <Link href={`/dashboard/links/${p.id}`} className="font-bold text-[#0f172a] hover:text-[#c20000]">{p.title}</Link>
                    {p.description && <div className="text-xs text-slate-500 mt-1 line-clamp-1">{p.description}</div>}
                    {p.user?.name && (
                      <div className="text-xs text-slate-500 mt-1">
                        <span className="text-[11px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                          Oleh: {p.user.name}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <a href={`/links/${p.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-mono text-blue-600 hover:text-[#c20000]">
                      /links/{p.slug} <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                  <td className="p-4 text-center"><span className="font-semibold text-slate-700">{p.items_count ?? '-'}</span></td>
                  <td className="p-4 text-center"><span className="inline-flex items-center justify-center min-w-[3rem] px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">{p.items_clicks_sum ?? 0}</span></td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${p.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      {p.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="p-4 pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/dashboard/links/${p.id}`} title="Kelola tautan" className="h-9 w-9 inline-flex items-center justify-center text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 rounded-sm transition-colors">
                        <Layers className="w-4 h-4" />
                      </Link>
                      {isSuperAdmin && (
                        <button
                          onClick={() => setTransferItem(p)}
                          title="Transfer Pemilik"
                          className="h-9 w-9 inline-flex items-center justify-center text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-sm transition-colors"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => openModal(p)} title="Edit" className="h-9 w-9 inline-flex items-center justify-center text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-sm transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} title="Hapus" className="h-9 w-9 inline-flex items-center justify-center text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-sm transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
          <p className="text-xs text-slate-500 font-medium">Menampilkan {(currentPage - 1) * 15 + 1}–{Math.min(currentPage * 15, totalItems)} dari {totalItems} halaman</p>
          <div className="flex items-center gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="px-3 py-1.5 text-sm rounded-sm border border-slate-200 disabled:opacity-40 hover:bg-slate-50">Prev</button>
            <span className="text-sm text-slate-600 font-semibold">{currentPage} / {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-1.5 text-sm rounded-sm border border-slate-200 disabled:opacity-40 hover:bg-slate-50">Next</button>
          </div>
        </div>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/50 backdrop-blur-sm p-4" onClick={() => setIsModalOpen(false)}>
          <form onSubmit={handleSave} className="bg-white rounded-sm shadow-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-slate-800 mb-5">{editing ? 'Edit Halaman' : 'Buat Halaman Link'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Judul Halaman</label>
                <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Link Resmi PC IMM" className="w-full border border-slate-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Slug Kustom <span className="text-slate-400 font-normal">(kosongkan = otomatis dari judul)</span></label>
                <div className="flex items-center border border-slate-200 rounded-sm overflow-hidden focus-within:border-[#c20000] focus-within:ring-1 focus-within:ring-[#c20000]">
                  <span className="px-3 py-2 text-sm text-slate-400 bg-slate-50 border-r border-slate-200">/links/</span>
                  <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '') })}
                    placeholder="resmi" className="flex-1 px-3 py-2 text-sm focus:outline-none font-mono" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2}
                  placeholder="Semua tautan resmi PC IMM Kota Surakarta" className="w-full border border-slate-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Avatar / Logo</label>
                <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-sm file:border-0 file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tema Warna</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {THEME_PRESETS.map((t) => {
                    const active = formData.bg_color === t.bg && formData.accent_color === t.accent;
                    return (
                      <button
                        key={t.name}
                        type="button"
                        onClick={() => setFormData({ ...formData, bg_color: t.bg, accent_color: t.accent })}
                        title={t.name}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${active ? 'border-[#c20000] bg-[#c20000]/5 text-[#c20000]' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                      >
                        <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ background: `linear-gradient(135deg, ${t.bg} 50%, ${t.accent} 50%)` }} />
                        {t.name}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, bg_color: '', accent_color: '' })}
                    className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${!formData.bg_color && !formData.accent_color ? 'border-[#c20000] bg-[#c20000]/5 text-[#c20000]' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                  >
                    Default
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <label className="flex items-center gap-2 text-xs text-slate-600 border border-slate-200 rounded-sm px-3 py-2">
                    <input type="color" value={formData.bg_color || '#0b1120'} onChange={(e) => setFormData({ ...formData, bg_color: e.target.value })} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0" />
                    Latar Halaman
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-600 border border-slate-200 rounded-sm px-3 py-2">
                    <input type="color" value={formData.accent_color || '#c20000'} onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0" />
                    Aksen Cahaya
                  </label>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <label className="flex flex-col gap-1 text-[11px] font-medium text-slate-600 border border-slate-200 rounded-sm p-2">
                    <span>Warna Teks</span>
                    <div className="flex items-center gap-1.5">
                      <input type="color" value={formData.text_color || '#ffffff'} onChange={(e) => setFormData({ ...formData, text_color: e.target.value })} className="w-7 h-7 rounded cursor-pointer bg-transparent border-0 p-0" />
                      <span className="text-[10px] font-mono text-slate-400 truncate">{formData.text_color || 'Default'}</span>
                    </div>
                  </label>
                  <label className="flex flex-col gap-1 text-[11px] font-medium text-slate-600 border border-slate-200 rounded-sm p-2">
                    <span>Latar Tombol</span>
                    <div className="flex items-center gap-1.5">
                      <input type="color" value={formData.btn_bg_color || '#ffffff'} onChange={(e) => setFormData({ ...formData, btn_bg_color: e.target.value })} className="w-7 h-7 rounded cursor-pointer bg-transparent border-0 p-0" />
                      <span className="text-[10px] font-mono text-slate-400 truncate">{formData.btn_bg_color || 'Transparan'}</span>
                    </div>
                  </label>
                  <label className="flex flex-col gap-1 text-[11px] font-medium text-slate-600 border border-slate-200 rounded-sm p-2">
                    <span>Teks Tombol</span>
                    <div className="flex items-center gap-1.5">
                      <input type="color" value={formData.btn_text_color || '#ffffff'} onChange={(e) => setFormData({ ...formData, btn_text_color: e.target.value })} className="w-7 h-7 rounded cursor-pointer bg-transparent border-0 p-0" />
                      <span className="text-[10px] font-mono text-slate-400 truncate">{formData.btn_text_color || '#ffffff'}</span>
                    </div>
                  </label>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4 accent-[#c20000]" />
                Tampilkan halaman ini ke publik
              </label>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
              <Button type="submit" disabled={isSaving} className="bg-[#c20000] hover:bg-[#a30000] text-white">
                {isSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Simpan
              </Button>
            </div>
          </form>
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
            await api.put(`/link-pages/${transferItem.id}`, { user_id: newUserId });
            fetchPages();
          }}
        />
      )}
    </div>
  );
}
