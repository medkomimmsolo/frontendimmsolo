'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import {
  Plus,
  Search, 
  Loader2,
  FileText,
  Edit,
  Trash2,
  Download,
  UserCheck,
  Copy,
  Check,
  ExternalLink,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getUserFacingErrorMessage } from '@/lib/errorMessage';
import { useConfirm } from '@/components/providers/ConfirmProvider';
import Link from 'next/link';
import { useDebounce } from 'use-debounce';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { TransferOwnershipModal } from '@/components/ui/TransferOwnershipModal';
import { PageHeader } from '@/components/ui/PageHeader';

export default function DocumentsManagement() {
  const { user } = useAuth();
  const { confirm } = useConfirm();
  const isSuperAdmin = user?.roles?.some((r: any) => r.name === 'super-admin');
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [transferItem, setTransferItem] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Edit Modal State
  const [editingDoc, setEditingDoc] = useState<any>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    slug: '',
    description: '',
    status: 'published',
  });
  
  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch] = useDebounce(searchQuery, 800);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Bulk Actions
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState('');
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: any = {
        search: debouncedSearch || undefined,
        page: currentPage,
        per_page: 15
      };

      const response = await api.get('/documents', { params });
      
      const payload = response.data.data;
      if (payload && payload.data) {
        setDocuments(payload.data);
        setTotalPages(payload.last_page || 1);
        setTotalItems(payload.total || 0);
      } else {
        let filtered = Array.isArray(payload) ? payload : [];
        if (debouncedSearch) {
          filtered = filtered.filter((d: any) => d.title.toLowerCase().includes(debouncedSearch.toLowerCase()));
        }
        
        const itemsPerPage = 15;
        const total = filtered.length;
        setTotalItems(total);
        setTotalPages(Math.ceil(total / itemsPerPage) || 1);
        
        const start = (currentPage - 1) * itemsPerPage;
        setDocuments(filtered.slice(start, start + itemsPerPage));
      }
      setSelectedDocuments([]);
    } catch (error) {
      console.error('Failed to fetch documents', error);
      toast.error(getUserFacingErrorMessage(error, 'Gagal memuat data dokumen'));
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, currentPage]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const handleDelete = async (id: number) => {
    if (await confirm({ title: 'Pindahkan dokumen ke sampah?', message: 'Dokumen tidak lagi tampil di halaman publik dan dapat dipulihkan dari tempat sampah.', confirmText: 'Pindahkan ke sampah', tone: 'danger' })) {
      try {
        await api.delete(`/documents/${id}`);
        toast.success('Dokumen berhasil dihapus');
        fetchDocuments();
      } catch (error) {
        console.error('Failed to delete', error);
        toast.error(getUserFacingErrorMessage(error, 'Gagal menghapus dokumen'));
      }
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedDocuments(documents.map(d => d.id));
    } else {
      setSelectedDocuments([]);
    }
  };

  const handleSelectOne = (id: number) => {
    if (selectedDocuments.includes(id)) {
      setSelectedDocuments(selectedDocuments.filter(dId => dId !== id));
    } else {
      setSelectedDocuments([...selectedDocuments, id]);
    }
  };

  const applyBulkAction = async () => {
    if (bulkAction === 'trash' && selectedDocuments.length > 0) {
      if (await confirm({ title: `Hapus ${selectedDocuments.length} dokumen?`, message: 'Dokumen yang dipilih akan dihapus.', confirmText: 'Hapus dokumen', tone: 'danger' })) {
        setIsBulkLoading(true);
        try {
          await Promise.all(selectedDocuments.map(id => api.delete(`/documents/${id}`)));
          toast.success(`${selectedDocuments.length} dokumen berhasil dihapus`);
          fetchDocuments();
          setBulkAction('');
        } catch (error) {
          console.error('Failed to delete some documents', error);
          toast.error(getUserFacingErrorMessage(error, 'Gagal menghapus beberapa dokumen'));
        } finally {
          setIsBulkLoading(false);
        }
      }
    } else if (selectedDocuments.length === 0) {
      toast.error('Pilih setidaknya satu dokumen');
    }
  };

  const copyLink = async (doc: any) => {
    let url = '';
    if (doc.slug) {
      url = `${window.location.origin}/files/${doc.slug}`;
    } else if (doc.file_url) {
      url = doc.file_url;
    } else {
      url = `${window.location.origin}/dokumen`;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(doc.id);
      toast.success('Tautan dokumen berhasil disalin.');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error, 'Tautan belum tersalin. Periksa izin clipboard browser, lalu coba lagi.'));
    }
  };

  const openEditModal = (doc: any) => {
    setEditingDoc(doc);
    setEditForm({
      title: doc.title || '',
      slug: doc.slug || '',
      description: doc.description || '',
      status: doc.status || 'published',
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc) return;
    setIsSavingEdit(true);
    try {
      const cleanSlug = editForm.slug ? editForm.slug.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-') : undefined;
      await api.put(`/documents/${editingDoc.id}`, {
        title: editForm.title,
        slug: cleanSlug,
        description: editForm.description,
        file_url: editingDoc.file_url,
        file_type: editingDoc.file_type,
        status: editForm.status,
      });
      toast.success('Dokumen berhasil diperbarui');
      setEditingDoc(null);
      fetchDocuments();
    } catch (error: any) {
      console.error('Failed to update document', error);
      toast.error(error.response?.data?.message || 'Gagal memperbarui dokumen');
    } finally {
      setIsSavingEdit(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Modern Page Header */}
      <PageHeader
        title="Dokumen & Materi"
        description="Kelola dokumen, materi perkaderan, dan berkas unduhan publik PC IMM Kota Surakarta"
        badge="Dokumen"
      >
        <Link href="/dashboard/documents/create">
          <Button className="h-10 px-5 bg-[#c20000] hover:bg-[#a30000] text-white rounded-xl text-xs font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]">
            <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
            Tambah Dokumen
          </Button>
        </Link>
      </PageHeader>

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
              placeholder="Cari dokumen..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-slate-200 rounded-sm pl-10 pr-3 py-2.5 text-sm text-slate-700 focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] outline-none shadow-sm w-48 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="admin-panel-table w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4 pl-6 w-10">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={documents.length > 0 && selectedDocuments.length === documents.length}
                    className="rounded border-slate-300 text-[#c20000] focus:ring-[#c20000]" 
                  />
                </th>
                <th className="py-3.5 px-4">Detail Dokumen</th>
                <th className="py-3.5 px-4 w-40">Tipe File</th>
                <th className="py-3.5 px-4 w-32">Ukuran</th>
                <th className="py-3.5 px-4 w-32 pr-6">Unduhan</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-100 text-sm bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <Loader2 className="w-8 h-8 animate-spin text-[#c20000] mb-2" />
                      <span className="text-sm font-medium">Memuat data dokumen...</span>
                    </div>
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3 text-slate-300">
                        <FileText className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">Tidak ada dokumen ditemukan</p>
                      <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci atau filter tipe</p>
                    </div>
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id} className="group hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 pl-6 align-top">
                      <input 
                        type="checkbox" 
                        checked={selectedDocuments.includes(doc.id)}
                        onChange={() => handleSelectOne(doc.id)}
                        className="rounded border-slate-200 text-[#c20000] focus:ring-[#c20000] mt-1" 
                      />
                    </td>
                    <td className="p-4 align-top">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#c20000] shrink-0" />
                        <span className="font-semibold text-[#0f172a] text-base line-clamp-1">
                          {doc.title}
                        </span>
                        {doc.status === 'draft' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 uppercase">
                            Draft
                          </span>
                        )}
                      </div>

                      {/* Public Link / Slug badge */}
                      {doc.slug ? (
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-xs font-mono text-emerald-700 bg-emerald-50 border border-emerald-200/80 rounded px-2 py-0.5 max-w-md truncate">
                            /files/{doc.slug}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyLink(doc)}
                            title="Salin link publik /files/slug"
                            className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                          >
                            {copiedId === doc.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-[11px] font-medium text-emerald-600">Tersalin</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-slate-500" />
                                <span className="text-[11px] font-medium">Salin Link</span>
                              </>
                            )}
                          </button>
                          <a
                            href={`/files/${doc.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Buka halaman publik berkas"
                            className="p-1 text-slate-400 hover:text-slate-700 transition-colors inline-flex items-center"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      ) : doc.file_url ? (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <a href={doc.file_url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline line-clamp-1 block max-w-sm">
                            {doc.file_url}
                          </a>
                          <button
                            type="button"
                            onClick={() => copyLink(doc)}
                            title="Salin link"
                            className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                          >
                            {copiedId === doc.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      ) : null}

                      {doc.file_name && (
                        <div className="text-xs text-slate-500 mt-1 line-clamp-1 font-mono">
                          Berkas: {doc.file_name}
                        </div>
                      )}

                      {doc.user?.name && (
                        <div className="text-xs text-slate-500 mt-0.5">
                          Pemilik: <span className="font-medium text-slate-700">{doc.user.name}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 mt-2.5">
                        <a 
                          href={`${process.env.NEXT_PUBLIC_API_URL}/documents/${doc.id}/download`} 
                          target="_blank" 
                          rel="noreferrer" 
                          title="Unduh Berkas" 
                          className="h-8 px-2.5 inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-sm transition-colors font-medium"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Unduh
                        </a>
                        <button
                          type="button"
                          onClick={() => openEditModal(doc)}
                          title="Edit Dokumen"
                          className="h-8 px-2.5 inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-sm transition-colors font-medium"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        {isSuperAdmin && (
                          <button
                            type="button"
                            onClick={() => setTransferItem(doc)}
                            title="Transfer Pemilik"
                            className="h-8 w-8 inline-flex items-center justify-center text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-sm transition-colors"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button 
                          type="button"
                          onClick={() => handleDelete(doc.id)} 
                          title="Hapus" 
                          className="h-8 w-8 inline-flex items-center justify-center text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-sm transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600 uppercase border border-slate-200">{doc.file_type}</span>
                    </td>
                    <td className="p-4 align-top text-slate-600 font-medium">
                      {doc.file_size ? doc.file_size : '-'}
                    </td>
                    <td className="p-4 align-top text-slate-600 font-medium">
                      {doc.downloads_count}
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
          unit="dokumen"
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Edit Document Modal */}
      {editingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg">Edit Dokumen / Berkas</h3>
              <button
                type="button"
                onClick={() => setEditingDoc(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Judul Dokumen <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-sm focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Slug URL Publik <span className="text-xs text-slate-400 font-normal">(/files/slug)</span>
                </label>
                <div className="flex items-center rounded-sm border border-slate-200 overflow-hidden focus-within:border-[#c20000] focus-within:ring-1 focus-within:ring-[#c20000]">
                  <span className="px-3 py-2 bg-slate-50 text-slate-500 text-xs font-mono border-r border-slate-200 select-none">
                    /files/
                  </span>
                  <input
                    type="text"
                    value={editForm.slug}
                    onChange={(e) => setEditForm({ ...editForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    placeholder="nama-file-atau-foto"
                    className="flex-1 px-3 py-2 text-sm text-slate-800 outline-none font-mono"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Huruf kecil dan tanda hubung (-). Mengubah slug akan mengubah link publik berkas ini.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Deskripsi
                </label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-sm focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] text-sm resize-none"
                  placeholder="Deskripsi singkat..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-sm focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] text-sm bg-slate-50"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingDoc(null)}
                  disabled={isSavingEdit}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSavingEdit}
                  className="bg-[#c20000] hover:bg-[#a30000] text-white"
                >
                  {isSavingEdit ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {transferItem && (
        <TransferOwnershipModal
          isOpen={!!transferItem}
          onClose={() => setTransferItem(null)}
          itemTitle={transferItem.title}
          currentOwnerName={transferItem.user?.name}
          onTransfer={async (newUserId) => {
            await api.put(`/documents/${transferItem.id}`, {
              title: transferItem.title,
              file_type: transferItem.file_type,
              status: transferItem.status,
              user_id: newUserId,
            });
            fetchDocuments();
          }}
        />
      )}
    </div>
  );
}
