'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { ArrowLeft, Plus, Edit, Trash2, Loader2, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react';
import LinkItemIcon from '@/components/post/LinkItemIcon';
import { LINK_ICON_OPTIONS } from '@/lib/linkIcons';
import toast from 'react-hot-toast';
import { useConfirm } from '@/components/providers/ConfirmProvider';

export default function LinkItemsPage({ params }: { params: Promise<{ id: string }> }) {
  const { confirm } = useConfirm();
  const [pageId, setPageId] = useState<string>('');
  const [page, setPage] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [formData, setFormData] = useState({ title: '', url: '', icon: '', is_active: true });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    params.then((p) => setPageId(p.id));
  }, [params]);

  const fetchPage = useCallback(async () => {
    if (!pageId) return;
    setIsLoading(true);
    try {
      const res = await api.get(`/link-pages/${pageId}`);
      setPage(res.data.data);
      setItems(res.data.data.items || []);
    } catch {
      toast.error('Gagal memuat data');
    } finally {
      setIsLoading(false);
    }
  }, [pageId]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  const openModal = (item: any = null) => {
    setEditing(item);
    setFormData(item ? { title: item.title, url: item.url, icon: item.icon || '', is_active: item.is_active } : { title: '', url: '', icon: '', is_active: true });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload: any = { ...formData };
      if (editing) {
        await api.put(`/link-items/${editing.id}`, payload);
        toast.success('Tautan diperbarui');
      } else {
        await api.post(`/link-pages/${pageId}/items`, payload);
        toast.success('Tautan ditambahkan');
      }
      setIsModalOpen(false);
      fetchPage();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!(await confirm({ message: 'Hapus tautan ini?', tone: 'danger' }))) return;
    try {
      await api.delete(`/link-items/${id}`);
      toast.success('Tautan dihapus');
      fetchPage();
    } catch {
      toast.error('Gagal menghapus');
    }
  };

  const moveItem = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const reordered = [...items];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setItems(reordered);
    try {
      await api.put(`/link-pages/${pageId}/reorder`, {
        items: reordered.map((it, i) => ({ id: it.id, order: i + 1 })),
      });
    } catch {
      toast.error('Gagal menyimpan urutan');
      fetchPage();
    }
  };

  const toggleActive = async (item: any) => {
    try {
      await api.put(`/link-items/${item.id}`, { is_active: !item.is_active });
      fetchPage();
    } catch {
      toast.error('Gagal mengubah status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/links">
          <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-md border-slate-200 hover:text-[#c20000]">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1 bg-white p-6 rounded-sm shadow-sm border border-[#0f172a]/5">
          <h1 className="text-2xl font-bold text-[#0f172a]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
            {page?.title || 'Memuat...'}
          </h1>
          <a href={page ? `/links/${page.slug}` : '#'} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-mono text-blue-600 hover:text-[#c20000] mt-1">
            {page ? `/links/${page.slug}` : ''} <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <Button onClick={() => openModal()} className="h-11 bg-[#c20000] hover:bg-[#a30000] text-white rounded-md px-6 shadow-sm shrink-0">
          <Plus className="w-4 h-4 mr-2" /> Tambah Tautan
        </Button>
      </div>

      <Card className="border-[#0f172a]/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-[#0f172a]/5 text-[#0f172a]/70 text-sm font-semibold uppercase tracking-wider">
                <th className="p-4 pl-6 w-24">Urutan</th>
                <th className="p-4">Tautan</th>
                <th className="p-4 text-center">Klik</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 pr-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr><td colSpan={5} className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[#c20000]" /></td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-slate-500">Belum ada tautan. Tambahkan yang pertama.</td></tr>
              ) : items.map((item: any, idx: number) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-1">
                      <span className="w-7 h-7 inline-flex items-center justify-center rounded-md bg-slate-100 text-slate-600 text-xs font-bold mr-1">{idx + 1}</span>
                      <button onClick={() => moveItem(idx, -1)} disabled={idx === 0} title="Naik" className="p-1.5 text-slate-500 hover:text-[#c20000] hover:bg-slate-100 rounded disabled:opacity-30">
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => moveItem(idx, 1)} disabled={idx === items.length - 1} title="Turun" className="p-1.5 text-slate-500 hover:text-[#c20000] hover:bg-slate-100 rounded disabled:opacity-30">
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-[#0f172a]">{item.title}</div>
                    <div className="text-xs text-slate-500 truncate max-w-md mt-0.5 font-mono">{item.url?.startsWith('/s/') ? `immsolo.or.id/${item.url.replace(/^\/s\//, '')}` : item.url}</div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center justify-center min-w-[3rem] px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">{item.clicks ?? 0}</span>
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={() => toggleActive(item)} title="Klik untuk ubah status"
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${item.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      {item.is_active ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </td>
                  <td className="p-4 pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openModal(item)} title="Edit" className="h-9 w-9 inline-flex items-center justify-center text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-sm transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} title="Hapus" className="h-9 w-9 inline-flex items-center justify-center text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-sm transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setIsModalOpen(false)}>
          <form onSubmit={handleSave} className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-slate-800 mb-5">{editing ? 'Edit Tautan' : 'Tambah Tautan'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Judul Tautan</label>
                <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Pendaftaran Anggota Baru" className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">URL Tujuan</label>
                <input type="url" required value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://..." className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000]" />
                <p className="text-xs text-slate-500 mt-1.5">
                  Tempel URL tujuan di sini — klik pengunjung tercatat otomatis.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Icon <span className="text-slate-400 font-normal">(opsional, tinggal pilih)</span></label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto border border-slate-200 rounded-md p-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: '' })}
                    title="Tanpa icon"
                    className={`flex flex-col items-center gap-1 p-2 rounded-md border text-[10px] font-medium transition-colors ${!formData.icon ? 'border-[#c20000] bg-[#c20000]/5 text-[#c20000]' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                  >
                    <span className="w-5 h-5 inline-flex items-center justify-center font-bold">–</span>
                    Tanpa
                  </button>
                  {LINK_ICON_OPTIONS.map((opt) => {
                    const active = formData.icon === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: opt.id })}
                        title={opt.label}
                        className={`flex flex-col items-center gap-1 p-2 rounded-md border text-[10px] font-medium transition-colors ${active ? 'border-[#c20000] bg-[#c20000]/5 text-[#c20000]' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                      >
                        <LinkItemIcon id={opt.id} className="w-5 h-5" />
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4 accent-[#c20000]" />
                Tampilkan tautan ini ke publik
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
    </div>
  );
}
