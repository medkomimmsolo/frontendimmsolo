'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { 
  Search, 
  Loader2,
  FileText,
  Edit,
  Trash2,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useDebounce } from 'use-debounce';

export default function DocumentsManagement() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
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
    if (window.confirm('Apakah Anda yakin ingin memindahkan dokumen ini ke tempat sampah?')) {
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
      if (window.confirm(`Apakah Anda yakin ingin menghapus ${selectedDocuments.length} dokumen?`)) {
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

  const PaginationControls = () => {
    if (totalPages <= 1) return <div className="text-xs text-[#0f172a]/60 font-medium">{totalItems} items</div>;
    return (
      <div className="flex items-center gap-3 text-sm text-[#0f172a]/60 font-medium">
        <span>{totalItems} items</span>
        <div className="flex items-center gap-1">
          <button 
            disabled={currentPage === 1 || isLoading}
            onClick={() => setCurrentPage(1)}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-50 hover:text-[#c20000] disabled:opacity-50 text-slate-600 transition-colors"
          >«</button>
          <button 
            disabled={currentPage === 1 || isLoading}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-50 hover:text-[#c20000] disabled:opacity-50 text-slate-600 transition-colors"
          >‹</button>
          <span className="mx-1 flex items-center gap-2">
            <input 
              type="text" 
              value={currentPage} 
              readOnly 
              className="w-10 text-center border border-slate-200 rounded-md py-1 px-2 text-sm outline-none bg-white focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000]" 
            />
            <span className="text-sm">dari {totalPages}</span>
          </span>
          <button 
            disabled={currentPage === totalPages || isLoading}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-50 hover:text-[#c20000] disabled:opacity-50 text-slate-600 transition-colors"
          >›</button>
          <button 
            disabled={currentPage === totalPages || isLoading}
            onClick={() => setCurrentPage(totalPages)}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-50 hover:text-[#c20000] disabled:opacity-50 text-slate-600 transition-colors"
          >»</button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[#0f172a]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
          Dokumen
        </h1>
        <Link href="/dashboard/documents/create">
          <Button variant="outline" size="sm" className="h-8 border-[#c20000] text-[#c20000] hover:bg-[#c20000]/10 bg-white rounded-md text-sm font-medium px-4">
            Add New Document
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <select 
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
            className="bg-white border border-slate-200 rounded-md px-3 py-1.5 text-sm text-slate-700 focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] outline-none h-9 min-w-[140px] shadow-sm"
          >
            <option value="">Bulk actions</option>
            <option value="trash">Move to Trash</option>
          </select>
          <button 
            onClick={applyBulkAction}
            disabled={!bulkAction || isBulkLoading}
            className="h-9 px-4 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:text-[#c20000] disabled:opacity-50 rounded-md text-sm font-medium shadow-sm transition-colors"
          >
            {isBulkLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Apply'}
          </button>
        </div>

        <div className="flex items-center gap-6">
          <PaginationControls />
          <div className="flex items-center gap-2 relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search documents..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 bg-white border border-slate-200 rounded-md pl-9 pr-3 text-sm text-slate-700 focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] outline-none shadow-sm w-48 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <th className="p-3 pl-4 w-10">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={documents.length > 0 && selectedDocuments.length === documents.length}
                    className="rounded border-slate-300 text-[#c20000] focus:ring-[#c20000]" 
                  />
                </th>
                <th className="p-3">Document Details</th>
                <th className="p-3 w-40">Type</th>
                <th className="p-3 w-32">Size</th>
                <th className="p-3 w-32">Downloads</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-100 text-sm bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin text-[#c20000] mb-2" />
                      <span className="text-sm">Memuat data...</span>
                    </div>
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-slate-500 text-center">
                    Tidak ada dokumen yang ditemukan.
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id} className="group hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 pl-4 align-top">
                      <input 
                        type="checkbox" 
                        checked={selectedDocuments.includes(doc.id)}
                        onChange={() => handleSelectOne(doc.id)}
                        className="rounded border-slate-300 text-[#c20000] focus:ring-[#c20000] mt-1" 
                      />
                    </td>
                    <td className="p-3 align-top">
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
                      
                      <div className="flex items-center gap-3 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium">
                        <a href={`${process.env.NEXT_PUBLIC_API_URL}/documents/${doc.id}/download`} target="_blank" rel="noreferrer" className="text-slate-600 hover:text-slate-800 transition-colors flex items-center gap-1">
                          <Download className="w-3 h-3" /> Track & Open
                        </a>
                        <span className="text-slate-300">|</span>
                        <button onClick={() => handleDelete(doc.id)} className="text-red-600 hover:text-red-800 transition-colors flex items-center gap-1">
                          <Trash2 className="w-3 h-3" /> Trash
                        </button>
                      </div>
                    </td>
                    <td className="p-3 align-top">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600 uppercase border border-slate-200">{doc.file_type}</span>
                    </td>
                    <td className="p-3 align-top text-slate-600 font-medium">
                      {doc.file_size ? doc.file_size : '-'}
                    </td>
                    <td className="p-3 align-top text-slate-600 font-medium">
                      {doc.downloads_count}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="flex justify-end mt-4">
        <PaginationControls />
      </div>

    </div>
  );
}
