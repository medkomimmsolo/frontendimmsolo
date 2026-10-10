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
  UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useConfirm } from '@/components/providers/ConfirmProvider';
import Link from 'next/link';
import { useDebounce } from 'use-debounce';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { TransferOwnershipModal } from '@/components/ui/TransferOwnershipModal';

export default function DocumentsManagement() {
  const { user } = useAuth();
  const { confirm } = useConfirm();
  const isSuperAdmin = user?.roles?.some((r: any) => r.name === 'super-admin');
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [transferItem, setTransferItem] = useState<any>(null);
  
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
      toast.error('Gagal memuat data dokumen');
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
    if (await confirm({ message: 'Apakah Anda yakin ingin memindahkan dokumen ini ke tempat sampah?', tone: 'danger' })) {
      try {
        await api.delete(`/documents/${id}`);
        toast.success('Dokumen berhasil dihapus');
        fetchDocuments();
      } catch (error) {
        console.error('Failed to delete', error);
        toast.error('Gagal menghapus dokumen');
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
      if (await confirm({ message: `Apakah Anda yakin ingin menghapus ${selectedDocuments.length} dokumen?`, tone: 'danger' })) {
        setIsBulkLoading(true);
        try {
          await Promise.all(selectedDocuments.map(id => api.delete(`/documents/${id}`)));
          toast.success(`${selectedDocuments.length} dokumen berhasil dihapus`);
          fetchDocuments();
          setBulkAction('');
        } catch (error) {
          console.error('Failed to delete some documents', error);
          toast.error('Gagal menghapus beberapa dokumen');
        } finally {
          setIsBulkLoading(false);
        }
      }
    } else if (selectedDocuments.length === 0) {
      toast.error('Pilih setidaknya satu dokumen');
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-sm shadow-sm border border-[#0f172a]/5">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
            Dokumen
          </h1>
          <p className="text-[#0f172a]/70 text-sm mt-1">Kelola dokumen, materi, dan berkas unduhan publik</p>
        </div>
        <Link href="/dashboard/documents/create">
          <Button className="h-10 px-5 bg-[#c20000] hover:bg-[#a30000] text-white rounded-sm text-sm font-semibold shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            Tambah Dokumen
          </Button>
        </Link>
      </div>

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
          <table className="w-full text-left border-collapse">
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
                    <td className="p-4\1align-top">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#c20000]" />
                        <span className="font-semibold text-[#0f172a] text-base line-clamp-1">
                          {doc.title}
                        </span>
                      </div>
                      {doc.file_name ? (
                        <div className="text-xs text-slate-500 mt-1 line-clamp-1">{doc.file_name}</div>
                      ) : (
                        <a href={doc.file_url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline mt-1 line-clamp-1 block">
                          {doc.file_url}
                        </a>
                      )}
                      {doc.user?.name && (
                        <div className="text-xs text-slate-500 mt-0.5">
                          Pemilik: <span className="font-medium text-slate-700">{doc.user.name}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 mt-2">
                        <a href={`${process.env.NEXT_PUBLIC_API_URL}/documents/${doc.id}/download`} target="_blank" rel="noreferrer" title="Unduh" className="h-9 w-9 inline-flex items-center justify-center text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-sm transition-colors">
                          <Download className="w-4 h-4" />
                        </a>
                        {isSuperAdmin && (
                          <button
                            onClick={() => setTransferItem(doc)}
                            title="Transfer Pemilik"
                            className="h-9 w-9 inline-flex items-center justify-center text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-sm transition-colors"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => handleDelete(doc.id)} title="Hapus" className="h-9 w-9 inline-flex items-center justify-center text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-sm transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="p-4\1align-top">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600 uppercase border border-slate-200">{doc.file_type}</span>
                    </td>
                    <td className="p-4\1align-top text-slate-600 font-medium">
                      {doc.file_size ? doc.file_size : '-'}
                    </td>
                    <td className="p-4\1align-top text-slate-600 font-medium">
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
