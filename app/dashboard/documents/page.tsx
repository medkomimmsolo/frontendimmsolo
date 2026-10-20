'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  X,
  RefreshCw,
  ClipboardList,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getUserFacingErrorMessage } from '@/lib/errorMessage';
import { useConfirm } from '@/components/providers/ConfirmProvider';
import Link from 'next/link';
import { useDebounce } from 'use-debounce';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { TransferOwnershipModal } from '@/components/ui/TransferOwnershipModal';
import { PageHeader } from '@/components/ui/PageHeader';
import { RowActions } from '@/components/ui/RowActions';
import { getApiBase } from '@/lib/settings';

export default function DocumentsManagement() {
  const { user } = useAuth();
  const { confirm } = useConfirm();
  const isSuperAdmin = user?.roles?.some((r: any) => r.name === 'super-admin');
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const fetchSequence = useRef(0);
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
    const requestSequence = ++fetchSequence.current;
    setIsLoading(true);
    setLoadError(false);
    try {
      const params: any = {
        search: debouncedSearch || undefined,
        page: currentPage,
        per_page: 15
      };

      const response = await api.get('/documents', { params });
      if (requestSequence !== fetchSequence.current) return;
      
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
      if (requestSequence !== fetchSequence.current) return;
      console.error('Failed to fetch documents', error);
      setLoadError(true);
      toast.error(getUserFacingErrorMessage(error, 'Gagal memuat data dokumen'));
    } finally {
      if (requestSequence === fetchSequence.current) setIsLoading(false);
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
        if (documents.length === 1 && currentPage > 1) {
          setCurrentPage((page) => page - 1);
        } else {
          await fetchDocuments();
        }
      } catch (error) {
        console.error('Failed to delete', error);
        toast.error(getUserFacingErrorMessage(error, 'Gagal menghapus dokumen'));
      }
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedDocuments((current) => [...new Set([...current, ...documents.map((document) => document.id)])]);
    } else {
      setSelectedDocuments((current) => current.filter((id) => !documents.some((document) => document.id === id)));
    }
  };

  const handleSelectOne = (id: number) => {
    setSelectedDocuments((current) => current.includes(id)
      ? current.filter((documentId) => documentId !== id)
      : [...current, id]);
  };

  const applyBulkAction = async () => {
    if (bulkAction === 'trash' && selectedDocuments.length > 0) {
      if (await confirm({ title: `Hapus ${selectedDocuments.length} dokumen?`, message: 'Dokumen yang dipilih akan dihapus.', confirmText: 'Hapus dokumen', tone: 'danger' })) {
        setIsBulkLoading(true);
        try {
          const results = await Promise.allSettled(selectedDocuments.map((id) => api.delete(`/documents/${id}`)));
          const deletedIds = selectedDocuments.filter((_, index) => results[index].status === 'fulfilled');
          const failedCount = results.length - deletedIds.length;
          if (deletedIds.length > 0) toast.success(`${deletedIds.length} dokumen berhasil dihapus`);
          if (failedCount > 0) toast.error(`${failedCount} dokumen gagal dihapus. Periksa izin akses dan coba lagi.`);
          setSelectedDocuments((current) => current.filter((id) => !deletedIds.includes(id)));
          const allVisibleDocumentsDeleted = documents.length > 0
            && documents.every((document) => deletedIds.includes(document.id));
          if (allVisibleDocumentsDeleted && currentPage > 1) {
            setCurrentPage((page) => page - 1);
          } else {
            await fetchDocuments();
          }
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

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3" aria-label="Ringkasan dokumen">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200/90 bg-white px-4 py-3 shadow-2xs">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-[#c20000]"><ClipboardList className="h-5 w-5" /></span>
          <div><p className="text-xs font-medium text-slate-500">Total dokumen</p><p className="text-lg font-bold text-slate-900">{totalItems}</p></div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200/90 bg-white px-4 py-3 shadow-2xs">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><FileText className="h-5 w-5" /></span>
          <div><p className="text-xs font-medium text-slate-500">Di halaman ini</p><p className="text-lg font-bold text-slate-900">{documents.length}</p></div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200/90 bg-white px-4 py-3 shadow-2xs">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600"><Check className="h-5 w-5" /></span>
          <div><p className="text-xs font-medium text-slate-500">Dipilih</p><p className="text-lg font-bold text-slate-900">{selectedDocuments.length}</p></div>
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex items-center gap-2">
            <select
              aria-label="Aksi massal"
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="h-10 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] sm:min-w-[180px]"
            >
              <option value="">Aksi massal</option>
              <option value="trash">Pindahkan ke sampah</option>
            </select>
            <Button
              type="button"
              onClick={applyBulkAction}
              disabled={!bulkAction || selectedDocuments.length === 0 || isBulkLoading}
              className="h-10 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
            >
              {isBulkLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Terapkan'}
            </Button>
          </div>
          {selectedDocuments.length > 0 && (
            <button type="button" onClick={() => setSelectedDocuments([])} className="h-10 px-3 text-sm font-medium text-slate-500 hover:text-slate-900">
              Batal pilih
            </button>
          )}
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          <div className="relative min-w-0 flex-1 sm:w-72 sm:flex-none">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              aria-label="Cari dokumen"
              placeholder="Cari judul dokumen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none transition-colors focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000]"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            aria-label="Muat ulang daftar dokumen"
            title="Muat ulang"
            onClick={() => fetchDocuments()}
            disabled={isLoading}
            className="h-10 w-10 shrink-0 rounded-xl p-0"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </section>

      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="admin-panel-table w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4 pl-6 w-10">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    aria-label="Pilih semua dokumen di halaman ini"
                    checked={documents.length > 0 && documents.every((document) => selectedDocuments.includes(document.id))}
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
              ) : loadError ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <p className="text-sm font-semibold text-slate-800">Daftar dokumen gagal dimuat</p>
                    <p className="mt-1 text-xs text-slate-500">Periksa koneksi, lalu muat ulang daftar dokumen.</p>
                    <Button type="button" variant="outline" onClick={() => fetchDocuments()} className="mt-4 rounded-xl">
                      <RefreshCw className="mr-2 h-4 w-4" /> Coba lagi
                    </Button>
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
                      <p className="text-xs text-slate-400 mt-1">Coba ubah kata kunci pencarian atau tambahkan dokumen baru.</p>
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
                          <span className="px-2 py-0.5 rounded text-2xs font-semibold bg-amber-100 text-amber-700 uppercase">
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
                                <span className="text-2xs font-medium text-emerald-600">Tersalin</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-slate-500" />
                                <span className="text-2xs font-medium">Salin Link</span>
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
                      
                      <div className="mt-2.5">
                        <RowActions
                          label={`Aksi untuk ${doc.title}`}
                          actions={[
                            {
                              label: 'Unduh Berkas',
                              icon: <Download className="w-4 h-4" />,
                              tone: 'info',
                              href: `${getApiBase()}/documents/${doc.id}/download`,
                              external: true,
                            },
                            { label: 'Edit Dokumen', icon: <Edit className="w-4 h-4" />, onClick: () => openEditModal(doc) },
                            {
                              label: 'Transfer Pemilik',
                              icon: <UserCheck className="w-4 h-4" />,
                              tone: 'violet',
                              hidden: !isSuperAdmin,
                              onClick: () => setTransferItem(doc),
                            },
                            {
                              label: 'Hapus',
                              icon: <Trash2 className="w-4 h-4" />,
                              tone: 'danger',
                              dividerBefore: true,
                              onClick: () => handleDelete(doc.id),
                            },
                          ]}
                        />
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
          <div role="dialog" aria-modal="true" aria-labelledby="edit-document-title" className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 id="edit-document-title" className="font-bold text-slate-900 text-lg">Edit Dokumen / Berkas</h3>
              <button
                type="button"
                onClick={() => setEditingDoc(null)}
                aria-label="Tutup edit dokumen"
                disabled={isSavingEdit}
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
