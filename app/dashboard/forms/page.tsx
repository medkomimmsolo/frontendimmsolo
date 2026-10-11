'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Plus, Search, Edit, Trash2, Loader2, ClipboardList, ExternalLink, UserCheck, X, Calendar, Users, ShieldCheck, ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useConfirm } from '@/components/providers/ConfirmProvider';
import { useAuth } from '@/hooks/useAuth';
import TransferOwnershipModal from '@/components/ui/TransferOwnershipModal';
import { useDebounce } from 'use-debounce';
import ImageUploadPicker from '@/components/dashboard/ImageUploadPicker';
import { PageHeader } from '@/components/ui/PageHeader';

export default function FormsManagement() {
  const { user } = useAuth();
  const isSuperAdmin = user?.roles?.some((r: any) => r.name === 'super-admin');
  const { confirm } = useConfirm();
  const [forms, setForms] = useState<any[]>([]);
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
    header_image: '',
    header_image_size: 'banner',
    success_message: '',
    starts_at: '',
    ends_at: '',
    max_responses: '',
    require_email: false,
    limit_one_response: false,
    is_active: true,
  });
  const [headerImageValue, setHeaderImageValue] = useState<File | string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchForms = useCallback(async (page = currentPage, search = debouncedSearch) => {
    setIsLoading(true);
    try {
      const res = await api.get('/form-admin', { params: { page, per_page: 15, search: search || undefined } });
      const payload = res.data.data;
      if (payload && payload.data) {
        setForms(payload.data);
        setTotalPages(payload.last_page || 1);
        setTotalItems(payload.total || 0);
      } else {
        setForms(Array.isArray(payload) ? payload : []);
      }
    } catch {
      toast.error('Gagal memuat formulir');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch]);

  useEffect(() => {
    fetchForms();
  }, [fetchForms, currentPage]);

  const toLocalInput = (iso?: string | null) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const openModal = (item: any = null) => {
    setEditing(item);
    setHeaderImageValue(item?.header_image || null);
    setFormData(item ? {
      title: item.title,
      slug: item.slug,
      description: item.description || '',
      header_image: item.header_image || '',
      header_image_size: item.header_image_size || 'banner',
      success_message: item.success_message || '',
      starts_at: toLocalInput(item.starts_at),
      ends_at: toLocalInput(item.ends_at),
      max_responses: item.max_responses ? String(item.max_responses) : '',
      require_email: !!item.require_email,
      limit_one_response: !!item.limit_one_response,
      is_active: item.is_active,
    } : {
      title: '',
      slug: '',
      description: '',
      header_image: '',
      header_image_size: 'banner',
      success_message: '',
      starts_at: '',
      ends_at: '',
      max_responses: '',
      require_email: false,
      limit_one_response: false,
      is_active: true,
    });
    setHeaderImageValue(item?.header_image || null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', formData.title);
      if (formData.slug) fd.append('slug', formData.slug);
      if (formData.description) fd.append('description', formData.description);
      if (formData.success_message) fd.append('success_message', formData.success_message);
      if (formData.starts_at) fd.append('starts_at', formData.starts_at);
      if (formData.ends_at) fd.append('ends_at', formData.ends_at);
      fd.append('max_responses', formData.max_responses || '');
      fd.append('require_email', formData.require_email ? '1' : '0');
      fd.append('limit_one_response', formData.limit_one_response ? '1' : '0');
      fd.append('is_active', formData.is_active ? '1' : '0');
      fd.append('header_image_size', formData.header_image_size || 'banner');

      if (headerImageValue instanceof File) {
        fd.append('header_image', headerImageValue);
      } else if (typeof headerImageValue === 'string') {
        fd.append('header_image', headerImageValue);
      } else if (!headerImageValue && editing?.header_image) {
        fd.append('header_image', '');
      }

      if (editing) {
        fd.append('_method', 'PUT');
        await api.post(`/form-admin/${editing.id}`, fd);
        toast.success('Formulir diperbarui');
      } else {
        await api.post('/form-admin', fd);
        toast.success('Formulir dibuat');
      }
      setIsModalOpen(false);
      fetchForms();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!(await confirm({ message: 'Hapus formulir ini beserta semua kolom dan data pendaftar?', tone: 'danger' }))) return;
    try {
      await api.delete(`/form-admin/${id}`);
      toast.success('Formulir dihapus');
      fetchForms();
    } catch {
      toast.error('Gagal menghapus');
    }
  };

  const inputClass = "w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-[#c20000] focus:ring-2 focus:ring-[#c20000]/20 transition-all";

  return (
    <div className="space-y-6">
      {/* Modern Page Header */}
      <PageHeader
        title="Formulir Pendaftaran"
        description="Buat formulir kustom dan kelola data respon/pendaftar kegiatan PC IMM Kota Surakarta"
        badge="Layanan"
      >
        <Button 
          onClick={() => openModal()} 
          className="h-10 px-5 bg-[#c20000] hover:bg-[#a30000] text-white rounded-xl text-xs font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
          Buat Formulir
        </Button>
      </PageHeader>

      {/* Search Bar Konsisten */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <form onSubmit={(e) => { e.preventDefault(); setCurrentPage(1); fetchForms(1, searchQuery); }}>
            <input 
              type="text" 
              placeholder="Cari judul atau slug... (Enter)" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] shadow-2xs transition-all"
            />
          </form>
        </div>
      </div>

      {/* Tabel Data Konsisten */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4 pl-6">Formulir</th>
                <th className="py-3.5 px-4 text-center">Kolom</th>
                <th className="py-3.5 px-4 text-center">Pendaftar</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 pr-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#c20000] mb-2" />
                    <span className="text-sm font-medium text-slate-500">Memuat data formulir...</span>
                  </td>
                </tr>
              ) : forms.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3 text-slate-300">
                        <ClipboardList className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">Belum ada formulir</p>
                      <p className="text-xs text-slate-400 mt-1">Buat formulir baru untuk pendaftaran atau survei</p>
                    </div>
                  </td>
                </tr>
              ) : forms.map((f: any) => (
                <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 pl-6">
                    <Link href={`/dashboard/forms/${f.id}`} className="font-bold text-[#0f172a] hover:text-[#c20000]">{f.title}</Link>
                    <div>
                      <a href={`/form/${f.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-mono text-blue-600 hover:text-[#c20000] mt-1">
                        /form/{f.slug} <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    {f.user?.name && (
                      <div className="text-xs text-slate-500 mt-1">
                        <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                          Oleh: {f.user.name}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-center font-semibold text-slate-700">{f.fields_count ?? '-'}</td>
                  <td className="p-4 text-center font-semibold text-slate-700">{f.responses_count ?? '-'}</td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${f.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      {f.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="p-4 pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/dashboard/forms/${f.id}`} title="Kelola kolom & data" className="h-9 w-9 inline-flex items-center justify-center text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 rounded-xl transition-colors">
                        <ClipboardList className="w-4 h-4" />
                      </Link>
                      {isSuperAdmin && (
                        <button
                          onClick={() => setTransferItem(f)}
                          title="Transfer Pemilik"
                          className="h-9 w-9 inline-flex items-center justify-center text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => openModal(f)} title="Edit" className="h-9 w-9 inline-flex items-center justify-center text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(f.id)} title="Hapus" className="h-9 w-9 inline-flex items-center justify-center text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">
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
          <p className="text-xs text-slate-500 font-medium">Menampilkan {(currentPage - 1) * 15 + 1}–{Math.min(currentPage * 15, totalItems)} dari {totalItems} formulir</p>
          <div className="flex items-center gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors">Prev</button>
            <span className="text-xs text-slate-600 font-semibold">{currentPage} / {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors">Next</button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-3 sm:p-5 animate-in fade-in duration-200" onClick={() => setIsModalOpen(false)}>
          <form 
            onSubmit={handleSave} 
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-100" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Modern */}
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-100 text-[#c20000] flex items-center justify-center shrink-0 shadow-2xs">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {editing ? 'Edit Formulir Pendaftaran' : 'Buat Formulir Pendaftaran Baru'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Atur identitas, jadwal, banner, kuota, dan validasi formulir online
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Scrollable */}
            <div className="p-6 sm:p-7 overflow-y-auto space-y-6 custom-scrollbar flex-1">
              {/* Bagian 1: Informasi Dasar */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Judul Formulir <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    required 
                    value={formData.title} 
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Contoh: Pendaftaran Darul Arqam Dasar (DAD) 2026" 
                    className={inputClass} 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Slug URL Kustom <span className="text-slate-400 font-normal lowercase">(kosongkan = otomatis dari judul)</span>
                  </label>
                  <div className="flex items-center border border-slate-200/90 rounded-xl overflow-hidden focus-within:border-[#c20000] focus-within:ring-2 focus-within:ring-[#c20000]/20 shadow-2xs transition-all bg-white">
                    <span className="px-3.5 py-2.5 text-xs font-mono font-bold text-slate-500 bg-slate-50 border-r border-slate-200/90 select-none">
                      /form/
                    </span>
                    <input 
                      type="text" 
                      value={formData.slug} 
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '') })}
                      placeholder="dad-2026" 
                      className="flex-1 px-3.5 py-2.5 text-sm focus:outline-none font-mono text-slate-800" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Deskripsi / Petunjuk Pengisian
                  </label>
                  <textarea 
                    value={formData.description} 
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                    rows={2}
                    placeholder="Tuliskan petunjuk umum atau pengantar sebelum peserta mengisi formulir..." 
                    className={`${inputClass} resize-none`} 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Pesan Sukses Setelah Pengiriman <span className="text-slate-400 font-normal lowercase">(opsional)</span>
                  </label>
                  <textarea 
                    value={formData.success_message} 
                    onChange={(e) => setFormData({ ...formData, success_message: e.target.value })} 
                    rows={2}
                    placeholder="Default: Jawaban Anda telah berhasil dicatat. Terima kasih atas partisipasi Anda." 
                    className={`${inputClass} resize-none`} 
                  />
                </div>
              </div>

              {/* Bagian 2: Jadwal & Kuota Responden */}
              <div className="p-4 sm:p-5 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#c20000]" /> Jadwal & Batas Kuota
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Waktu Dibuka <span className="text-slate-400 font-normal">(opsional)</span>
                    </label>
                    <input 
                      type="datetime-local" 
                      value={formData.starts_at} 
                      onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })} 
                      className={inputClass} 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Waktu Ditutup <span className="text-slate-400 font-normal">(opsional)</span>
                    </label>
                    <input 
                      type="datetime-local" 
                      value={formData.ends_at} 
                      onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })} 
                      className={inputClass} 
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-500" /> Kuota Pendaftar
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, max_responses: '' })}
                      className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                    >
                      Set Unlimited (Tanpa Batas)
                    </button>
                  </div>
                  <input
                    type="number"
                    min={1}
                    value={formData.max_responses}
                    onChange={(e) => setFormData({ ...formData, max_responses: e.target.value })}
                    placeholder="Kosongkan untuk Unlimited (Tanpa Batas Kuota)"
                    className={inputClass}
                  />
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    {formData.max_responses ? (
                      <span className="text-amber-700 font-semibold">
                        Pendaftaran otomatis tertutup setelah mencapai {formData.max_responses} responden.
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-medium">
                        Status: Bebas kuota (Unlimited). Pendaftaran menerima tanggapan tanpa batasan kuota.
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Bagian 3: Banner Gambar Header Formulir */}
              <div className="p-4 sm:p-5 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-[#c20000]" /> Banner Gambar Header Formulir
                </h3>

                <ImageUploadPicker
                  label=""
                  value={headerImageValue}
                  onChange={(val) => setHeaderImageValue(val)}
                  aspectRatio={formData.header_image_size as any || 'banner'}
                  allowedFolder="forms"
                  description="Pilih dari Media Library atau unggah gambar banner header dari perangkat."
                />

                <div className="pt-2 border-t border-slate-200/60">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Format Frame Banner di Halaman Publik
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'banner', label: 'Banner 4:1', desc: 'Google Form (1600×400)' },
                      { id: 'medium', label: 'Sedang 21:9', desc: 'Proporsi sistem (1600×680)' },
                      { id: 'wide', label: 'Lebar 16:9', desc: 'Standar video (1600×900)' },
                      { id: 'natural', label: 'Proporsional', desc: 'Tinggi utuh asli (Auto)' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, header_image_size: opt.id })}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          formData.header_image_size === opt.id
                            ? 'bg-red-50/90 border-[#c20000] ring-1 ring-[#c20000] text-[#c20000] font-bold shadow-2xs'
                            : 'bg-white border-slate-200/90 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div className="text-xs flex items-center justify-between">
                          <span>{opt.label}</span>
                          {formData.header_image_size === opt.id && <span className="w-1.5 h-1.5 rounded-full bg-[#c20000]"></span>}
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal mt-0.5 leading-tight">
                          {opt.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bagian 4: Pengaturan Email, Keamanan & Status */}
              <div className="p-4 sm:p-5 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Keamanan, Validasi & Publikasi
                </h3>
                
                <label className="flex items-start gap-3 text-xs text-slate-700 cursor-pointer p-3 bg-white border border-slate-200/80 rounded-xl hover:border-slate-300 transition-colors shadow-2xs">
                  <input
                    type="checkbox"
                    checked={formData.require_email}
                    onChange={(e) => setFormData({ ...formData, require_email: e.target.checked })}
                    className="w-4 h-4 mt-0.5 accent-[#c20000] cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block text-xs">Wajibkan Pengisian Email (Anti-Spam)</span>
                    <p className="text-slate-500 mt-0.5 text-[11px] leading-relaxed">
                      Memerlukan alamat email aktif pendaftar yang diverifikasi otomatis untuk mencegah bot dan respon spam.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 text-xs text-slate-700 cursor-pointer p-3 bg-white border border-slate-200/80 rounded-xl hover:border-slate-300 transition-colors shadow-2xs">
                  <input
                    type="checkbox"
                    checked={formData.limit_one_response}
                    disabled={!formData.require_email}
                    onChange={(e) => setFormData({ ...formData, limit_one_response: e.target.checked })}
                    className="w-4 h-4 mt-0.5 accent-[#c20000] cursor-pointer disabled:opacity-40"
                  />
                  <div>
                    <span className={`font-bold block text-xs ${!formData.require_email ? 'text-slate-400' : 'text-slate-800'}`}>
                      Batasi 1 Tanggapan per Email
                    </span>
                    <p className="text-slate-500 mt-0.5 text-[11px] leading-relaxed">
                      Mencegah pengisian berulang kali dengan alamat email yang sama.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 text-xs text-slate-700 cursor-pointer p-3 bg-white border border-slate-200/80 rounded-xl hover:border-slate-300 transition-colors shadow-2xs">
                  <input 
                    type="checkbox" 
                    checked={formData.is_active} 
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} 
                    className="w-4 h-4 mt-0.5 accent-[#c20000] cursor-pointer" 
                  />
                  <div>
                    <span className="font-bold text-slate-800 block text-xs">Buka Pendaftaran (Terima Tanggapan)</span>
                    <p className="text-slate-500 mt-0.5 text-[11px] leading-relaxed">
                      Aktifkan untuk membuka formulir ke publik. Nonaktifkan jika formulir masih draf atau pendaftaran ditutup.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Modal Actions Footer Sticky */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-end gap-3 shrink-0">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsModalOpen(false)} 
                className="rounded-xl h-10 px-4 text-xs font-semibold border-slate-200 hover:bg-slate-100"
              >
                Batal
              </Button>
              <Button 
                type="submit" 
                disabled={isSaving} 
                className="bg-[#c20000] hover:bg-[#a30000] text-white rounded-xl h-10 px-5 text-xs font-bold shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {editing ? 'Simpan Perubahan Formulir' : 'Buat Formulir Sekarang'}
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
            await api.put(`/form-admin/${transferItem.id}`, { user_id: newUserId });
            fetchForms();
          }}
        />
      )}
    </div>
  );
}
