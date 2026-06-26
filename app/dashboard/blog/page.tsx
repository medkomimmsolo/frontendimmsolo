'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { 
  Plus, 
  Search, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  FileText,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '@/lib/utils';
import { Blog, Category } from '@/types';
import Link from 'next/link';
import { useDebounce } from 'use-debounce';

export default function BlogManagement() {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch] = useDebounce(searchQuery, 800);
  const [statusFilter, setStatusFilter] = useState('all');
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
    setIsLoading(true);
    try {
      const params: any = {
        admin: 1,
        search: debouncedSearch || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        page: currentPage,
        per_page: 15
      };
      
      if (categoryFilter) {
        params.category_id = categoryFilter;
      }

      const response = await api.get('/blogs', { params });
      
      const payload = response.data.data;
      if (payload && payload.data) {
        setBlogs(payload.data);
        setTotalPages(payload.last_page || 1);
        setTotalItems(payload.total || 0);
      } else {
        setBlogs(payload || []);
      }
      setSelectedBlogs([]); // Reset selections on fetch
    } catch (error) {
      console.error('Failed to fetch blogs', error);
      toast.error('Gagal memuat data post');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, statusFilter, categoryFilter, currentPage]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, categoryFilter]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin memindahkan post ini ke tempat sampah?')) {
      try {
        await api.delete(`/blogs/${id}`);
        toast.success('Post berhasil dihapus');
        fetchBlogs();
      } catch (error) {
        console.error('Failed to delete', error);
        toast.error('Gagal menghapus post');
      }
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
      if (window.confirm(`Apakah Anda yakin ingin menghapus ${selectedBlogs.length} post?`)) {
        setIsBulkLoading(true);
        try {
          // Send bulk delete request or delete one by one
          await Promise.all(selectedBlogs.map(id => api.delete(`/blogs/${id}`)));
          toast.success(`${selectedBlogs.length} post berhasil dihapus`);
          fetchBlogs();
          setBulkAction('');
        } catch (error) {
          console.error('Failed to delete some blogs', error);
          toast.error('Gagal menghapus beberapa post');
        } finally {
          setIsBulkLoading(false);
        }
      }
    } else if (selectedBlogs.length === 0) {
      toast.error('Pilih setidaknya satu post');
    }
  };

  // Helper for Pagination controls
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
            title="Halaman Pertama"
          >
            «
          </button>
          <button 
            disabled={currentPage === 1 || isLoading}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-50 hover:text-[#c20000] disabled:opacity-50 text-slate-600 transition-colors"
            title="Halaman Sebelumnya"
          >
            ‹
          </button>
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
            title="Halaman Berikutnya"
          >
            ›
          </button>
          <button 
            disabled={currentPage === totalPages || isLoading}
            onClick={() => setCurrentPage(totalPages)}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-50 hover:text-[#c20000] disabled:opacity-50 text-slate-600 transition-colors"
            title="Halaman Terakhir"
          >
            »
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 w-full">
      
      {/* IMM-Style Header but WP Layout */}
      <div className="flex items-center gap-4 mb-2">
        <h1 className="text-2xl font-bold text-[#0f172a]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
          Posts
        </h1>
        <Link href="/dashboard/blog/create">
          <Button variant="outline" size="sm" className="h-8 border-[#c20000] text-[#c20000] hover:bg-[#c20000]/10 bg-white rounded-md text-sm font-medium px-4">
            Add New Post
          </Button>
        </Link>
      </div>

      {/* WP-Style Status Links with IMM Colors */}
      <ul className="flex flex-wrap gap-2 text-sm text-slate-500 mb-6 font-medium">
        <li>
          <button 
            onClick={() => setStatusFilter('all')} 
            className={`transition-colors pb-1 ${statusFilter === 'all' ? 'text-[#c20000] border-b-2 border-[#c20000]' : 'hover:text-[#c20000]'}`}
          >
            All
          </button>
          <span className="text-slate-300 mx-2">|</span>
        </li>
        <li>
          <button 
            onClick={() => setStatusFilter('published')} 
            className={`transition-colors pb-1 ${statusFilter === 'published' ? 'text-[#c20000] border-b-2 border-[#c20000]' : 'hover:text-[#c20000]'}`}
          >
            Published
          </button>
          <span className="text-slate-300 mx-2">|</span>
        </li>
        <li>
          <button 
            onClick={() => setStatusFilter('draft')} 
            className={`transition-colors pb-1 ${statusFilter === 'draft' ? 'text-[#c20000] border-b-2 border-[#c20000]' : 'hover:text-[#c20000]'}`}
          >
            Drafts
          </button>
        </li>
      </ul>

      {/* Search and Filters Bar */}
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
          
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="ml-2 bg-white border border-slate-200 rounded-md px-3 py-1.5 text-sm text-slate-700 focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] outline-none h-9 shadow-sm"
          >
            <option value="">All categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-6">
          <PaginationControls />
          <div className="flex items-center gap-2 relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search posts..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 bg-white border border-slate-200 rounded-md pl-9 pr-3 text-sm text-slate-700 focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] outline-none shadow-sm w-48 transition-all"
            />
          </div>
        </div>
      </div>

      {/* WP-Style Data Table with IMM Theme */}
      <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <th className="p-3 pl-4 w-10">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={blogs.length > 0 && selectedBlogs.length === blogs.length}
                    className="rounded border-slate-300 text-[#c20000] focus:ring-[#c20000]" 
                  />
                </th>
                <th className="p-3">Title</th>
                <th className="p-3 w-36">Author</th>
                <th className="p-3 w-48">Categories</th>
                <th className="p-3 w-24 text-center">
                  <MessageSquare className="w-4 h-4 text-slate-400 mx-auto" />
                </th>
                <th className="p-3 w-40 pr-4">Date</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-100 text-sm bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin text-[#c20000] mb-2" />
                      <span className="text-sm">Memuat data...</span>
                    </div>
                  </td>
                </tr>
              ) : blogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-slate-500 text-center">
                    Tidak ada post yang ditemukan.
                  </td>
                </tr>
              ) : (
                blogs.map((blog) => (
                  <tr key={blog.id} className="group hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 pl-4 align-top">
                      <input 
                        type="checkbox" 
                        checked={selectedBlogs.includes(blog.id)}
                        onChange={() => handleSelectOne(blog.id)}
                        className="rounded border-slate-300 text-[#c20000] focus:ring-[#c20000] mt-1" 
                      />
                    </td>
                    <td className="p-3 align-top">
                      <div className="flex items-center gap-2">
                        <Link href={`/dashboard/blog/${blog.id}`} className="font-semibold text-[#0f172a] hover:text-[#c20000] transition-colors text-base">
                          {blog.title}
                        </Link>
                        {blog.status === 'draft' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-600 border border-amber-200">
                            Draft
                          </span>
                        )}
                      </div>
                      
                      {/* Hover Actions */}
                      <div className="flex items-center gap-3 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium">
                        <Link href={`/dashboard/blog/${blog.id}`} className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1">
                          <Edit className="w-3 h-3" /> Edit
                        </Link>
                        <span className="text-slate-300">|</span>
                        <button onClick={() => handleDelete(blog.id)} className="text-red-600 hover:text-red-800 transition-colors flex items-center gap-1">
                          <Trash2 className="w-3 h-3" /> Trash
                        </button>
                        <span className="text-slate-300">|</span>
                        <Link href={`/post/${blog.slug}`} target="_blank" className="text-emerald-600 hover:text-emerald-800 transition-colors flex items-center gap-1">
                          <Eye className="w-3 h-3" /> View
                        </Link>
                      </div>
                    </td>
                    <td className="p-3 align-top text-slate-600 hover:text-[#c20000] transition-colors cursor-pointer">
                      {blog.user?.name || 'Admin'}
                    </td>
                    <td className="p-3 align-top text-slate-600 hover:text-[#c20000] transition-colors cursor-pointer">
                      {blog.category?.name || 'Uncategorized'}
                    </td>
                    <td className="p-3 align-top text-center text-slate-600">
                      <div className="inline-flex items-center justify-center bg-slate-100 border border-slate-200 rounded-full px-2.5 py-0.5 text-xs font-medium group-hover:bg-white group-hover:border-[#c20000]/30 transition-all" title={`${blog.views_count} Views`}>
                        {blog.views_count || 0}
                      </div>
                    </td>
                    <td className="p-3 align-top pr-4">
                      <div className="text-[#0f172a] font-medium text-xs">
                        {blog.status === 'published' ? 'Published' : 'Last Modified'}
                      </div>
                      <div className="text-slate-500 text-xs mt-0.5">
                        {new Date(blog.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            
            <tfoot>
              <tr className="bg-slate-50 border-t border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <th className="p-3 pl-4 w-10">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={blogs.length > 0 && selectedBlogs.length === blogs.length}
                    className="rounded border-slate-300 text-[#c20000] focus:ring-[#c20000]" 
                  />
                </th>
                <th className="p-3">Title</th>
                <th className="p-3">Author</th>
                <th className="p-3">Categories</th>
                <th className="p-3 text-center">
                  <MessageSquare className="w-4 h-4 text-slate-400 mx-auto" />
                </th>
                <th className="p-3 pr-4">Date</th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      
      {/* Bottom Pagination */}
      <div className="flex justify-end mt-4">
        <PaginationControls />
      </div>

    </div>
  );
}
