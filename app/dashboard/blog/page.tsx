'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { 
  Plus, 
  Search, 
  Loader2,
  MessageSquare,
  FileText,
  Edit,
  Trash2,
  Eye, Check, X, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { getUserFacingErrorMessage } from '@/lib/errorMessage';
import { useConfirm } from '@/components/providers/ConfirmProvider';
import { Blog, Category } from '@/types';
import Link from 'next/link';
import { useDebounce } from 'use-debounce';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { TransferOwnershipModal } from '@/components/ui/TransferOwnershipModal';
import { PageHeader } from '@/components/ui/PageHeader';
import { RowActions } from '@/components/ui/RowActions';

export default function BlogManagement() {
  const { user } = useAuth();
  const { confirm } = useConfirm();
  const isSuperAdmin = user?.roles?.some((r: any) => r.name === 'super-admin');
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [transferItem, setTransferItem] = useState<any>(null);
  const requestId = useRef(0);
  
  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch] = useDebounce(searchQuery, 800);
  const [statusFilter, setStatusFilter] = useState('all');
  const [reviewFilter, setReviewFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Bulk Actions
  const [selectedBlogs, setSelectedBlogs] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState('');
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  };

  const fetchBlogs = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setIsLoading(true);
    setLoadError(false);
    try {
      const params: any = {
        admin: 1,
        search: debouncedSearch || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        review_status: reviewFilter || undefined,
        page: currentPage,
        per_page: 15
      };
      
      if (categoryFilter) {
        params.category = categoryFilter;
      }

      const response = await api.get('/blogs', { params });
      if (currentRequest !== requestId.current) return;
      
      const payload = response.data.data;
      if (payload && payload.data) {
        setBlogs(payload.data);
        setTotalPages(payload.last_page || 1);
        setTotalItems(payload.total || 0);
      } else {
        setBlogs(payload || []);
        setTotalPages(1);
        setTotalItems(Array.isArray(payload) ? payload.length : 0);
      }
      setSelectedBlogs([]); // Reset selections on fetch
    } catch (error) {
      if (currentRequest !== requestId.current) return;
      console.error('Failed to fetch blogs', error);
      setLoadError(true);
      toast.error(getUserFacingErrorMessage(error, 'Gagal memuat data post'));
    } finally {
      if (currentRequest === requestId.current) setIsLoading(false);
    }
  }, [debouncedSearch, statusFilter, reviewFilter, categoryFilter, currentPage]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, reviewFilter, categoryFilter]);

  useEffect(() => () => {
    requestId.current += 1;
  }, []);

  const handleDelete = async (id: number) => {
    if (await confirm({ title: 'Hapus post secara permanen?', message: 'Post dan gambar unggulannya akan dihapus permanen dan tidak dapat dipulihkan.', confirmText: 'Hapus permanen', tone: 'danger' })) {
      try {
        await api.delete(`/blogs/${id}`);
        toast.success('Post berhasil dihapus');
        if (blogs.length === 1 && currentPage > 1) {
          setCurrentPage((page) => page - 1);
        } else {
          await fetchBlogs();
        }
      } catch (error) {
        console.error('Failed to delete', error);
        toast.error(getUserFacingErrorMessage(error, 'Gagal menghapus post'));
      }
    }
  };

  const isAdmin = user?.roles?.some((r: any) => ['super-admin', 'admin'].includes(r.name));

  const handleApprove = async (id: number) => {
    try {
      await api.post(`/blogs/${id}/approve`);
      toast.success('Post disetujui dan diterbitkan');
      fetchBlogs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menyetujui');
    }
  };

  const handleReject = async (id: number) => {
    const noteInput = window.prompt('Catatan revisi untuk penulis (opsional, maks 2000 karakter):');
    if (noteInput === null) return; // batal
    if (!(await confirm({ title: 'Tolak post?', message: 'Post akan dikembalikan kepada penulis bersama catatan revisi.', confirmText: 'Tolak post', tone: 'danger' }))) return;
    try {
      await api.post(`/blogs/${id}/reject`, noteInput ? { review_note: noteInput } : {});
      toast.success('Post ditolak dengan catatan revisi');
      fetchBlogs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menolak');
    }
  };

  // --- Bulk Action Handlers ---
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedBlogs(blogs.map(b => b.id));
    } else {
      setSelectedBlogs([]);
    }
  };

  const handleSelectOne = (id: number) => {
    if (selectedBlogs.includes(id)) {
      setSelectedBlogs(selectedBlogs.filter(bId => bId !== id));
    } else {
      setSelectedBlogs([...selectedBlogs, id]);
    }
  };

  const applyBulkAction = async () => {
    if (bulkAction === 'trash' && selectedBlogs.length > 0) {
      if (await confirm({ title: `Hapus ${selectedBlogs.length} post secara permanen?`, message: 'Post terpilih dan gambar unggulannya akan dihapus permanen dan tidak dapat dipulihkan.', confirmText: 'Hapus permanen', tone: 'danger' })) {
        setIsBulkLoading(true);
        try {
          const results = await Promise.allSettled(selectedBlogs.map((id) => api.delete(`/blogs/${id}`)));
          const deletedIds = selectedBlogs.filter((_, index) => results[index].status === 'fulfilled');
          const failedCount = results.length - deletedIds.length;
          if (deletedIds.length > 0) toast.success(`${deletedIds.length} post berhasil dihapus`);
          if (failedCount > 0) toast.error(`${failedCount} post gagal dihapus. Periksa izin akses dan coba lagi.`);
          setSelectedBlogs((current) => current.filter((id) => !deletedIds.includes(id)));
          const allVisiblePostsDeleted = blogs.length > 0 && blogs.every((blog) => deletedIds.includes(blog.id));
          if (allVisiblePostsDeleted && currentPage > 1) {
            setCurrentPage((page) => page - 1);
          } else {
            await fetchBlogs();
          }
          setBulkAction('');
        } catch (error) {
          console.error('Failed to delete some blogs', error);
          toast.error(getUserFacingErrorMessage(error, 'Gagal menghapus beberapa post'));
        } finally {
          setIsBulkLoading(false);
        }
      }
    } else if (selectedBlogs.length === 0) {
      toast.error('Pilih setidaknya satu post');
    }
  };

  return (
    <div className="space-y-6 w-full">
      
      {/* Modern Page Header */}
      <PageHeader
        title="Post & Artikel"
        description="Kelola berita, artikel, dan publikasi website PC IMM Kota Surakarta"
        badge="Publikasi"
      >
        <Link href="/dashboard/blog/create">
          <Button className="h-10 px-5 bg-[#c20000] hover:bg-[#a30000] text-white rounded-xl text-xs font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]">
            <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
            Tulis Post
          </Button>
        </Link>
      </PageHeader>

      {/* WP-Style Status Links with IMM Colors */}
      <ul className="flex flex-wrap gap-2 text-sm text-slate-500 mb-6 font-medium">
        <li>
          <button 
            onClick={() => { setStatusFilter('all'); setReviewFilter(''); }}
            className={`transition-colors pb-1 ${statusFilter === 'all' ? 'text-[#c20000] border-b-2 border-[#c20000]' : 'hover:text-[#c20000]'}`}
          >
            Semua
          </button>
          <span className="text-slate-300 mx-2">|</span>
        </li>
        <li>
          <button 
            onClick={() => { setStatusFilter('published'); setReviewFilter(''); }}
            className={`transition-colors pb-1 ${statusFilter === 'published' ? 'text-[#c20000] border-b-2 border-[#c20000]' : 'hover:text-[#c20000]'}`}
          >
            Terbit
          </button>
          <span className="text-slate-300 mx-2">|</span>
        </li>
        <li>
          <button 
            onClick={() => { setStatusFilter('draft'); setReviewFilter(''); }}
            className={`transition-colors pb-1 ${statusFilter === 'draft' ? 'text-[#c20000] border-b-2 border-[#c20000]' : 'hover:text-[#c20000]'}`}
          >
            Draf
          </button>
          <span className="text-slate-300 mx-2">|</span>
        </li>
        <li>
          <button 
            onClick={() => { setReviewFilter(reviewFilter === 'pending' ? '' : 'pending'); setStatusFilter('all'); }} 
            className={`transition-colors pb-1 ${reviewFilter === 'pending' ? 'text-[#c20000] border-b-2 border-[#c20000]' : 'hover:text-[#c20000]'}`}
          >
            Menunggu Review
          </button>
          <span className="text-slate-300 mx-2">|</span>
        </li>
        <li>
          <button
            onClick={() => { setStatusFilter('archived'); setReviewFilter(''); }}
            className={`transition-colors pb-1 ${statusFilter === 'archived' ? 'text-[#c20000] border-b-2 border-[#c20000]' : 'hover:text-[#c20000]'}`}
          >
            Arsip
          </button>
        </li>
      </ul>

      {/* Search and Filters Bar */}
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
          
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="ml-2 bg-white border border-slate-200 rounded-sm px-3 py-1.5 text-sm text-slate-700 focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] outline-none h-9 shadow-sm"
          >
            <option value="">Semua kategori</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>{category.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari post..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-slate-200 rounded-sm pl-10 pr-3 py-2.5 text-sm text-slate-700 focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] outline-none shadow-sm w-48 transition-all"
            />
          </div>
        </div>
      </div>

      {/* WP-Style Data Table with IMM Theme */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="admin-panel-table w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4 pl-6 w-10">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    aria-label="Pilih semua post di halaman ini"
                    checked={blogs.length > 0 && blogs.every((blog) => selectedBlogs.includes(blog.id))}
                    className="rounded border-slate-300 text-[#c20000] focus:ring-[#c20000]" 
                  />
                </th>
                <th className="py-3.5 px-4">Judul</th>
                <th className="py-3.5 px-4 w-36">Penulis</th>
                <th className="py-3.5 px-4 w-48">Kategori</th>
                <th className="py-3.5 px-4 w-24 text-center">
                  <MessageSquare className="w-4 h-4 text-slate-400 mx-auto" />
                </th>
                <th className="py-3.5 px-4 w-40">Tanggal</th>
                <th className="py-3.5 px-4 pr-6 text-right">Aksi</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-100 text-sm bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <Loader2 className="w-8 h-8 animate-spin text-[#c20000] mb-2" />
                      <span className="text-sm font-medium">Memuat data artikel...</span>
                    </div>
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <p className="text-sm font-semibold text-slate-800">Berita gagal dimuat</p>
                    <p className="mt-1 text-xs text-slate-500">Periksa koneksi, lalu coba muat ulang daftar berita.</p>
                    <Button type="button" variant="outline" onClick={() => void fetchBlogs()} className="mt-4 rounded-xl">
                      Coba lagi
                    </Button>
                  </td>
                </tr>
              ) : blogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3 text-slate-300">
                        <FileText className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">Tidak ada post ditemukan</p>
                      <p className="text-xs text-slate-400 mt-1">Coba ubah kata kunci atau filter kategori dan status.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                blogs.map((blog) => (
                  <tr key={blog.id} className="group hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 pl-6 align-top">
                      <input 
                        type="checkbox" 
                        checked={selectedBlogs.includes(blog.id)}
                        onChange={() => handleSelectOne(blog.id)}
                        className="rounded border-slate-200 text-[#c20000] focus:ring-[#c20000] mt-1" 
                      />
                    </td>
                    <td className="p-4 align-top">
                      <div className="flex items-center gap-2">
                        <Link href={`/dashboard/blog/${blog.id}`} className="font-semibold text-[#0f172a] hover:text-[#c20000] transition-colors text-base">
                          {blog.title}
                        </Link>
                        {blog.status === 'draft' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-600 border border-amber-200">
                            Draft
                          </span>
                        )}
                        {blog.review_status === 'pending' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-violet-50 text-violet-600 border border-violet-200">
                            Menunggu Review
                          </span>
                        )}
                        {blog.review_status === 'rejected' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-600 border border-red-200">
                            Ditolak
                          </span>
                        )}
                        {blog.status === 'published' && blog.published_at && new Date(blog.published_at) > new Date() && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200" title={`Tayang ${new Date(blog.published_at).toLocaleString('id-ID')}`}>
                            Terjadwal
                          </span>
                        )}
                      </div>
                      {(blog as any).review_note && (
                        <p className="mt-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-sm px-2 py-1 max-w-xl">
                          <span className="font-semibold">Catatan revisi:</span> {(blog as any).review_note}
                        </p>
                      )}
                    </td>
                    <td className="p-4 align-top text-slate-600">
                      {blog.user?.name || 'Admin'}
                    </td>
                    <td className="p-4 align-top text-slate-600">
                      {blog.category?.name || 'Tanpa Kategori'}
                    </td>
                    <td className="p-4 align-top text-center text-slate-600">
                      <div className="inline-flex items-center justify-center bg-slate-100 border border-slate-200 rounded-full px-2.5 py-0.5 text-xs font-medium group-hover:bg-white group-hover:border-[#c20000]/30 transition-all" title={`${blog.views_count} Views`}>
                        {blog.views_count || 0}
                      </div>
                    </td>
                    <td className="p-4 align-top pr-4">
                      <div className="text-[#0f172a] font-medium text-xs">
                        {blog.status === 'published' ? 'Terbit' : 'Terakhir Diubah'}
                      </div>
                      <div className="text-slate-500 text-xs mt-0.5">
                        {new Date(blog.status === 'published' ? blog.published_at ?? blog.updated_at : blog.updated_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                    </td>
                    <td className="p-4 align-top pr-6">
                      <div className="flex justify-end">
                        <RowActions
                          label={`Aksi untuk ${blog.title}`}
                          actions={[
                            { label: 'Edit', icon: <Edit className="w-4 h-4" />, href: `/dashboard/blog/${blog.id}` },
                            { label: 'Lihat', icon: <Eye className="w-4 h-4" />, href: `/post/${blog.slug}`, external: true },
                            {
                              label: 'Setujui',
                              icon: <Check className="w-4 h-4" />,
                              tone: 'success',
                              hidden: !(isAdmin && blog.review_status === 'pending'),
                              onClick: () => handleApprove(blog.id),
                            },
                            {
                              label: 'Tolak',
                              icon: <X className="w-4 h-4" />,
                              tone: 'warning',
                              hidden: !(isAdmin && blog.review_status === 'pending'),
                              onClick: () => handleReject(blog.id),
                            },
                            {
                              label: 'Transfer Pemilik',
                              icon: <UserCheck className="w-4 h-4" />,
                              tone: 'violet',
                              hidden: !isSuperAdmin,
                              onClick: () => setTransferItem(blog),
                            },
                            {
                              label: 'Hapus',
                              icon: <Trash2 className="w-4 h-4" />,
                              tone: 'danger',
                              dividerBefore: true,
                              onClick: () => handleDelete(blog.id),
                            },
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            
            <tfoot>
              <tr className="bg-slate-50/80 border-t border-slate-200/80 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="py-3 px-4 pl-6 w-10">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    aria-label="Pilih semua post di halaman ini"
                    checked={blogs.length > 0 && blogs.every((blog) => selectedBlogs.includes(blog.id))}
                    className="rounded border-slate-300 text-[#c20000] focus:ring-[#c20000]" 
                  />
                </th>
                <th className="py-3 px-4">Judul</th>
                <th className="py-3 px-4">Penulis</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4 text-center">
                  <MessageSquare className="w-4 h-4 text-slate-400 mx-auto" />
                </th>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4 pr-6 text-right">Aksi</th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      
      {/* Bottom Pagination */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs mt-4 overflow-hidden">
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          unit="post"
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
            await api.put(`/blogs/${transferItem.id}`, { user_id: newUserId });
            fetchBlogs();
          }}
        />
      )}
    </div>
  );
}
