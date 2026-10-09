'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Plus, Search, Edit, Trash2, Loader2, ClipboardList, ExternalLink, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useConfirm } from '@/components/providers/ConfirmProvider';
import { useAuth } from '@/hooks/useAuth';
import TransferOwnershipModal from '@/components/ui/TransferOwnershipModal';
import { useDebounce } from 'use-debounce';

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
  const [formData, setFormData] = useState({ title: '', slug: '', description: '', success_message: '', starts_at: '', ends_at: '', max_responses: '', is_active: true });
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
    setFormData(item ? {
      title: item.title, slug: item.slug, description: item.description || '', success_message: item.success_message || '',
      starts_at: toLocalInput(item.starts_at), ends_at: toLocalInput(item.ends_at),
      max_responses: item.max_responses ? String(item.max_responses) : '', is_active: item.is_active,
    } : { title: '', slug: '', description: '', success_message: '', starts_at: '', ends_at: '', max_responses: '', is_active: true });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload: any = {
        title: formData.title,
        slug: formData.slug || undefined,
        description: formData.description || undefined,
        success_message: formData.success_message || undefined,
        starts_at: formData.starts_at || undefined,
        ends_at: formData.ends_at || undefined,
        max_responses: formData.max_responses ? parseInt(formData.max_responses) : undefined,
        is_active: formData.is_active,
      };
      if (editing) {
        await api.put(`/form-admin/${editing.id}`, payload);
        toast.success('Formulir diperbarui');
      } else {
        await api.post('/form-admin', payload);
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

  const inputClass = "w-full border border-slate-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000]";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-sm shadow-sm border border-[#0f172a]/5">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>Formulir Pendaftaran</h1>
          <p className="text-[#0f172a]/70 text-sm mt-1">Buat formulir online di immsolo.or.id/form/... dan kelola data pendaftar</p>
        </div>
        <Button onClick={() => openModal()} className="h-10 px-5 bg-[#c20000] hover:bg-[#a30000] text-white rounded-sm text-sm font-semibold shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> Buat Formulir
        </Button>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); setCurrentPage(1); fetchForms(1, searchQuery); }} className="bg-white border border-[#0f172a]/10 rounded-sm p-4 sm:p-6 shadow-sm">
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
                <th className="p-4 pl-6">Formulir</th>
                <th className="p-4 text-center">Kolom</th>
                <th className="p-4 text-center">Pendaftar</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 pr-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr><td colSpan={5} className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[#c20000]" /></td></tr>
              ) : forms.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-slate-500">Belum ada formulir</td></tr>
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
                        <span className="text-[11px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
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
                      <Link href={`/dashboard/forms/${f.id}`} title="Kelola kolom & data" className="h-9 w-9 inline-flex items-center justify-center text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 rounded-sm transition-colors">
                        <ClipboardList className="w-4 h-4" />
                      </Link>
                      {isSuperAdmin && (
                        <button
                          onClick={() => setTransferItem(f)}
                          title="Transfer Pemilik"
                          className="h-9 w-9 inline-flex items-center justify-center text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-sm transition-colors"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => openModal(f)} title="Edit" className="h-9 w-9 inline-flex items-center justify-center text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-sm transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(f.id)} title="Hapus" className="h-9 w-9 inline-flex items-center justify-center text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-sm transition-colors">
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
            <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="px-3 py-1.5 text-sm rounded-sm border border-slate-200 disabled:opacity-40 hover:bg-slate-50">Prev</button>
            <span className="text-sm text-slate-600 font-semibold">{currentPage} / {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-1.5 text-sm rounded-sm border border-slate-200 disabled:opacity-40 hover:bg-slate-50">Next</button>
          </div>
        </div>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/50 backdrop-blur-sm p-4 overflow-y-auto" onClick={() => setIsModalOpen(false)}>
          <form onSubmit={handleSave} className="bg-white rounded-sm shadow-xl max-w-lg w-full p-6 my-8" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-slate-800 mb-5">{editing ? 'Edit Formulir' : 'Buat Formulir'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Judul Formulir</label>
                <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Pendaftaran DAD 2026" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Slug Kustom <span className="text-slate-400 font-normal">(kosongkan = otomatis)</span></label>
                <div className="flex items-center border border-slate-200 rounded-sm overflow-hidden focus-within:border-[#c20000] focus-within:ring-1 focus-within:ring-[#c20000]">
                  <span className="px-3 py-2 text-sm text-slate-400 bg-slate-50 border-r border-slate-200">/form/</span>
                  <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '') })}
                    placeholder="dad-2026" className="flex-1 px-3 py-2 text-sm focus:outline-none font-mono" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2}
                  placeholder="Penjelasan singkat formulir..." className={`${inputClass} resize-none`} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pesan Setelah Submit <span className="text-slate-400 font-normal">(opsional)</span></label>
                <textarea value={formData.success_message} onChange={(e) => setFormData({ ...formData, success_message: e.target.value })} rows={2}
                  placeholder="Default: Terima kasih! Data Anda sudah kami terima." className={`${inputClass} resize-none`} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Dibuka</label>
                  <input type="datetime-local" value={formData.starts_at} onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ditutup</label>
                  <input type="datetime-local" value={formData.ends_at} onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kuota Pendaftar <span className="text-slate-400 font-normal">(kosongkan = tanpa batas)</span></label>
                <input type="number" min={1} value={formData.max_responses} onChange={(e) => setFormData({ ...formData, max_responses: e.target.value })} placeholder="cth: 100" className={inputClass} />
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4 accent-[#c20000]" />
                Tampilkan formulir ke publik
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
            await api.put(`/form-admin/${transferItem.id}`, { user_id: newUserId });
            fetchForms();
          }}
        />
      )}
    </div>
  );
}
