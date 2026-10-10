'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Loader2, 
  ExternalLink, 
  GraduationCap, 
  Landmark, 
  Building2, 
  Globe, 
  X,
  Upload
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useConfirm } from '@/components/providers/ConfirmProvider';
import { useAuth } from '@/hooks/useAuth';

interface LembagaItem {
  id: number;
  name: string;
  slug: string;
  tipe: 'komisariat' | 'lso' | 'lembaga';
  sejarah?: string | null;
  visi_misi?: string | null;
  logo?: string | null;
  website_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

const TIPE_OPTIONS = [
  { value: 'komisariat', label: 'Komisariat', icon: GraduationCap, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'lso', label: 'LSO (Semi Otonom)', icon: Landmark, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'lembaga', label: 'Lembaga & Badan Khusus', icon: Building2, color: 'bg-purple-50 text-purple-700 border-purple-200' },
];

export default function LembagaManagementPage() {
  const { user } = useAuth();
  const { confirm } = useConfirm();
  const [items, setItems] = useState<LembagaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTipe, setFilterTipe] = useState<string>('all');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LembagaItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    tipe: 'komisariat',
    website_url: '',
    sejarah: '',
    visi_misi: '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const fetchLembaga = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/lembaga');
      const data = res.data?.data || [];
      setItems(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Gagal memuat data lembaga');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLembaga();
  }, [fetchLembaga]);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      tipe: 'komisariat',
      website_url: '',
      sejarah: '',
      visi_misi: '',
    });
    setLogoFile(null);
    setLogoPreview(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: LembagaItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      tipe: item.tipe,
      website_url: item.website_url || '',
      sejarah: item.sejarah || '',
      visi_misi: item.visi_misi || '',
    });
    setLogoFile(null);
    setLogoPreview(item.logo || null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Nama lembaga wajib diisi');
      return;
    }

    setIsSaving(true);
    try {
      const payload = new FormData();
      payload.append('name', formData.name.trim());
      payload.append('tipe', formData.tipe);
      if (formData.website_url.trim()) payload.append('website_url', formData.website_url.trim());
      if (formData.sejarah.trim()) payload.append('sejarah', formData.sejarah.trim());
      if (formData.visi_misi.trim()) payload.append('visi_misi', formData.visi_misi.trim());
      if (logoFile) payload.append('logo', logoFile);

      if (editingItem) {
        payload.append('_method', 'PUT');
        await api.post(`/lembaga/${editingItem.id}`, payload);
        toast.success('Data lembaga berhasil diperbarui');
      } else {
        await api.post('/lembaga', payload);
        toast.success('Lembaga baru berhasil ditambahkan');
      }

      setIsModalOpen(false);
      fetchLembaga();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan data lembaga');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (item: LembagaItem) => {
    const isConfirmed = await confirm({
      message: `Hapus data "${item.name}"? Data yang dihapus tidak dapat dipulihkan.`,
      tone: 'danger',
    });
    if (!isConfirmed) return;

    try {
      await api.delete(`/lembaga/${item.id}`);
      toast.success('Data lembaga berhasil dihapus');
      fetchLembaga();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menghapus data lembaga');
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesTipe = filterTipe === 'all' || item.tipe === filterTipe;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.sejarah && item.sejarah.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.visi_misi && item.visi_misi.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTipe && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-sm shadow-sm border border-[#0f172a]/5">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
            Komisariat & Lembaga
          </h1>
          <p className="text-[#0f172a]/70 text-sm mt-1">
            Kelola data komisariat kampus, lembaga semi otonom (LSO), dan badan khusus PC IMM Kota Surakarta.
          </p>
        </div>
        <Button 
          onClick={openCreateModal} 
          className="h-10 px-5 bg-[#c20000] hover:bg-[#a30000] text-white rounded-sm text-sm font-semibold shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4 mr-2" /> Tambah Lembaga
        </Button>
      </div>

      {/* Filter dan Pencarian */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-sm border border-[#0f172a]/10 shadow-sm">
        {/* Tab Filter Tipe */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setFilterTipe('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors shrink-0 ${
              filterTipe === 'all'
                ? 'bg-[#c20000] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua ({items.length})
          </button>
          {TIPE_OPTIONS.map((opt) => {
            const count = items.filter((i) => i.tipe === opt.value).length;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFilterTipe(opt.value)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors shrink-0 ${
                  filterTipe === opt.value
                    ? 'bg-[#c20000] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {opt.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Input Pencarian */}
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama lembaga..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-slate-200 rounded-sm pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000]"
          />
        </div>
      </div>

      {/* Tabel Data Lembaga */}
      <Card className="border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4 pl-6">Lembaga / Komisariat</th>
                <th className="py-3.5 px-4">Tipe</th>
                <th className="py-3.5 px-4">Tautan Publik</th>
                <th className="py-3.5 px-4">Website Resmi</th>
                <th className="py-3.5 px-4 pr-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#c20000] mb-2" />
                    <p className="text-sm font-medium text-slate-500">Memuat daftar lembaga...</p>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3 text-slate-300">
                        <GraduationCap className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">Tidak ada lembaga ditemukan</p>
                      <p className="text-xs text-slate-400 mt-1">{searchQuery ? 'Coba gunakan kata kunci pencarian lain' : 'Belum ada data lembaga atau komisariat terdaftar'}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const tipeOpt = TIPE_OPTIONS.find((t) => t.value === item.tipe);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          {item.logo ? (
                            <img
                              src={item.logo}
                              alt={item.name}
                              className="w-10 h-10 object-contain rounded border border-slate-200 bg-white p-0.5 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-red-50 text-[#c20000] flex items-center justify-center font-bold text-xs shrink-0 border border-red-100">
                              IMM
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-[#0f172a] text-sm leading-tight hover:text-[#c20000] transition-colors">
                              {item.name}
                            </p>
                            {item.visi_misi && (
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                                {item.visi_misi}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${tipeOpt?.color || 'bg-slate-100 text-slate-600'}`}>
                          {tipeOpt?.label || item.tipe}
                        </span>
                      </td>
                      <td className="p-4">
                        <Link
                          href={`/lembaga/${item.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-mono text-blue-600 hover:text-[#c20000] transition-colors"
                        >
                          /lembaga/{item.slug}
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                      <td className="p-4">
                        {item.website_url ? (
                          <a
                            href={item.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-[#c20000] transition-colors truncate max-w-[180px]"
                          >
                            <Globe className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                            <span className="truncate">{item.website_url.replace(/^https?:\/\//, '')}</span>
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                      <td className="p-4 pr-6">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            title="Edit Lembaga"
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-sm transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            title="Hapus Lembaga"
                            className="p-2 text-red-600 hover:bg-red-50 rounded-sm transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Tambah / Edit Lembaga */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/50 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white rounded-sm shadow-xl max-w-lg w-full p-6 my-8 space-y-4 border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-800">
                {editingItem ? 'Edit Data Lembaga' : 'Tambah Lembaga / Komisariat Baru'}
              </h2>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lembaga / Komisariat <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Komisariat Moh. Djazman UMS"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-slate-200 rounded-sm px-3 py-2 text-xs focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tipe Lembaga <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.tipe}
                    onChange={(e) => setFormData({ ...formData, tipe: e.target.value as any })}
                    className="w-full border border-slate-200 rounded-sm px-3 py-2 text-xs focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] bg-white"
                  >
                    {TIPE_OPTIONS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Website / Link Resmi <span className="text-slate-400 font-normal">(opsional)</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://komisariat.id"
                    value={formData.website_url}
                    onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                    className="w-full border border-slate-200 rounded-sm px-3 py-2 text-xs focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000]"
                  />
                </div>
              </div>

              {/* Logo Lembaga */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Logo Lembaga <span className="text-slate-400 font-normal">(WebP, PNG, JPG maks 2MB)</span>
                </label>
                <div className="flex items-center gap-3">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Preview Logo"
                      className="w-14 h-14 object-contain rounded border border-slate-200 bg-white p-1 shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded border border-dashed border-slate-300 flex items-center justify-center text-slate-400 shrink-0">
                      <Upload className="w-5 h-5" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setLogoFile(file);
                        setLogoPreview(URL.createObjectURL(file));
                      }
                    }}
                    className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-sm file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Visi & Misi <span className="text-slate-400 font-normal">(opsional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Ringkasan visi dan misi lembaga..."
                  value={formData.visi_misi}
                  onChange={(e) => setFormData({ ...formData, visi_misi: e.target.value })}
                  className="w-full border border-slate-200 rounded-sm px-3 py-2 text-xs focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Sejarah Singkat <span className="text-slate-400 font-normal">(opsional)</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Sejarah berdirinya komisariat / lembaga ini..."
                  value={formData.sejarah}
                  onChange={(e) => setFormData({ ...formData, sejarah: e.target.value })}
                  className="w-full border border-slate-200 rounded-sm px-3 py-2 text-xs focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="h-8 px-4 text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="h-8 px-4 bg-[#c20000] hover:bg-[#a30000] text-white text-xs font-semibold"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                  {editingItem ? 'Simpan Perubahan' : 'Tambah Lembaga'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

