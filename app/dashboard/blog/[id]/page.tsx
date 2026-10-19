'use client';

import { useState, useEffect, useMemo, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Save, Loader2, CheckCircle2, XCircle, AlertCircle, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getUserFacingErrorMessage } from '@/lib/errorMessage';
import Link from 'next/link';
import { Category } from '@/types';
import { uploadInlineImage } from '@/lib/imageUtils';
import ImageUploadPicker from '@/components/dashboard/ImageUploadPicker';
import dynamic from 'next/dynamic';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader } from '@/components/ui/PageHeader';
import { hasMeaningfulBlogContent } from '@/lib/blogContent';

// Import Rich Text Editor (dengan dukungan tabel) secara dinamis agar tidak error SSR
const RichTextEditor = dynamic(() => import('@/components/post/RichTextEditor'), {
  ssr: false,
  loading: () => <div className="h-96 w-full flex items-center justify-center bg-gray-50 border border-gray-200 rounded-sm">Memuat Editor...</div>
});

const toLocalDateTimeInput = (value: string | null): string => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
};

const inputClass = "w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[#0f172a] focus:outline-none focus:border-[#c20000] focus:ring-2 focus:ring-[#c20000]/20 transition-all text-sm shadow-2xs";
const labelClass = "block text-xs font-bold text-slate-700 uppercase tracking-wider";
const helperClass = "text-xs text-slate-500 leading-relaxed";

export default function EditBlog({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user } = useAuth();
  const isSuperAdmin = user?.roles?.some((role) => role.name === 'super-admin') ?? false;
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;

  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    excerpt: '',
    content: '',
    status: 'draft',
    published_at: '',
    author_name: '',
    editor_name: '',
    author_role: '',
    editor_role: '',
    keywords: '',
    meta_title: '',
    meta_description: '',
  });
  const [featuredImage, setFeaturedImage] = useState<File | string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, blogRes] = await Promise.all([
          api.get('/categories'),
          api.get(`/blogs/${id}/edit`)
        ]);

        let list = catRes.data.data || [];
        const isSuper = user?.roles?.some((r: any) => r.name === 'super-admin');
        if (user && !isSuper) {
          try {
            const allowed = await api.get(`/users/${user.id}/categories`);
            const ids: number[] = allowed.data.data?.allowed || [];
            if (ids.length > 0) list = list.filter((c: any) => ids.includes(c.id));
          } catch { /* abaikan, tampilkan semua */ }
        }
        setCategories(list);

        const blog = blogRes.data.data;
        // Fix malformed image URLs from the backend before displaying them in the Quill editor
        const fixedContent = (blog.content || '')
          .replace(/src="[^"]*\/storage\/(blogs\/[^"]+)"/g, 'src="/storage/$1"');

        setFormData({
          title: blog.title || '',
          category_id: blog.category_id || '',
          excerpt: blog.excerpt || '',
          content: fixedContent,
          status: blog.status || 'draft',
          published_at: toLocalDateTimeInput(blog.published_at),
          author_name: blog.author_name || '',
          editor_name: blog.editor_name || '',
          author_role: blog.author_role || '',
          editor_role: blog.editor_role || '',
          keywords: blog.keywords || '',
          meta_title: blog.meta_title || '',
          meta_description: blog.meta_description || '',
        });
        if (blog.featured_image) {
          setFeaturedImage(blog.featured_image);
        }
      } catch (err: any) {
        console.error(err);
        toast.error(getUserFacingErrorMessage(err, 'Gagal memuat data'));
        router.push('/dashboard/blog');
      } finally {
        setIsFetching(false);
      }
    };

    fetchData();
  }, [id, router, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((previous) => ({ ...previous, [e.target.name]: e.target.value }));
  };

  const handleContentChange = (value: string) => {
    setFormData((previous) => ({ ...previous, content: value }));
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim() || isSavingCategory) return;
    setIsSavingCategory(true);
    try {
      const res = await api.post('/categories', { name: newCategoryName });
      const newCategory = res.data.data || res.data;
      setCategories((previous) => [...previous, newCategory]);
      setFormData((previous) => ({ ...previous, category_id: newCategory.id }));
      setIsAddingCategory(false);
      setNewCategoryName('');
      toast.success('Kategori berhasil ditambahkan');
    } catch (error: any) {
      console.error(error);
      toast.error(getUserFacingErrorMessage(error, 'Gagal menambahkan kategori'));
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasMeaningfulBlogContent(formData.content)) {
      toast.error('Isi artikel harus berisi teks atau media.');
      return;
    }
    if (!formData.excerpt.trim()) {
      toast.error('Ringkasan artikel tidak boleh kosong.');
      return;
    }
    if (!formData.category_id) {
      toast.error('Pilih kategori artikel terlebih dahulu.');
      return;
    }

    setIsLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value.toString());
      });
      if (featuredImage) {
        data.append('featured_image', featuredImage);
      } else {
        data.append('featured_image', '');
      }
      data.append('_method', 'PUT');

      await api.post(`/blogs/${id}`, data);
      toast.success(isSuperAdmin ? 'Artikel berhasil diperbarui.' : 'Perubahan artikel berhasil dikirim untuk ditinjau admin.');
      router.push('/dashboard/blog');
    } catch (error: any) {
      console.error(error);
      toast.error(getUserFacingErrorMessage(error, 'Gagal menyimpan perubahan artikel.'));
    } finally {
      setIsLoading(false);
    }
  };

  // --- Rich Text Editor Modules ---
  const quillRef = useRef<HTMLDivElement>(null);

  const quillModules = useMemo(() => ({
    toolbar: {
      container: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image', 'video'],
      ['clean']
      ],
      handlers: {
      image: () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async () => {
          const file = input.files?.[0];
          if (!file) return;
          try {
            const url = await uploadInlineImage(file);
            const { Quill } = await import('react-quill-new');
            const container = quillRef.current?.querySelector('.ql-container');
            const quill = container ? (Quill as any).find(container) : null;
            if (quill) {
              const range = quill.getSelection(true) || { index: quill.getLength(), length: 0 };
              quill.insertEmbed(range.index, 'image', url);
              quill.setSelection(range.index + 1);
            }
          } catch (err) {
            console.error(err);
            toast.error(getUserFacingErrorMessage(err, 'Gagal mengunggah gambar'));
          }
        };
        input.click();
      },
    },
    },
  }), []);

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'indent',
    'link', 'image', 'video',
    // Format tabel dari quill-table-up
    'table-up', 'table-up-main', 'table-up-col', 'table-up-colgroup',
    'table-up-cell', 'table-up-cell-inner', 'table-up-row',
    'table-up-head', 'table-up-body', 'table-up-foot', 'table-up-caption',
  ];

  // --- SEO Analysis Logic ---
  const seoStats = useMemo(() => {
    const textContent = formData.content.replace(/<[^>]*>?/gm, '');
    const words = textContent.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    const titleLength = formData.title.length;
    const excerptLength = formData.excerpt.length;
    const hasHeadings = /<h[1-6]>/i.test(formData.content);
    const hasLinks = /<a /i.test(formData.content);

    const checks = [
      {
        label: "Panjang Judul",
        desc: "Idealnya 40-60 karakter.",
        passed: titleLength >= 40 && titleLength <= 60,
        warning: titleLength > 0 && titleLength < 40,
        value: `${titleLength} karakter`
      },
      {
        label: "Panjang Ringkasan",
        desc: "Idealnya 120-160 karakter untuk meta description.",
        passed: excerptLength >= 120 && excerptLength <= 160,
        warning: excerptLength > 0 && excerptLength < 120,
        value: `${excerptLength} karakter`
      },
      {
        label: "Jumlah Kata",
        desc: "Minimal 300 kata agar SEO optimal.",
        passed: wordCount >= 300,
        warning: wordCount > 0 && wordCount < 300,
        value: `${wordCount} kata`
      },
      {
        label: "Penggunaan Heading",
        desc: "Konten sebaiknya memiliki subjudul (H2/H3).",
        passed: hasHeadings,
        warning: false,
        value: hasHeadings ? "Ada" : "Tidak Ada"
      },
      {
        label: "Tautan (Link)",
        desc: "Konten sebaiknya menyertakan link internal/eksternal.",
        passed: hasLinks,
        warning: false,
        value: hasLinks ? "Ada" : "Tidak Ada"
      }
    ];

    const score = Math.round((checks.filter(c => c.passed).length / checks.length) * 100);

    return { checks, score };
  }, [formData]);

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-64 text-[#0f172a]/70">
        <Loader2 className="w-8 h-8 animate-spin mr-3 text-[#c20000]" />
        Memuat data post...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      {/* Page Header dengan Aksi */}
      <PageHeader
        title="Edit Artikel"
        description="Perbarui isi konten, gambar sampul, jadwal tayang, dan optimasi SEO artikel"
        badge="Artikel"
      >
        <Link href="/dashboard/blog">
          <Button type="button" variant="outline" size="sm" className="h-10 px-4 rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs">
            Batal
          </Button>
        </Link>
        <Button type="submit" disabled={isLoading} className="h-10 px-5 bg-[#c20000] hover:bg-[#a30000] text-white rounded-xl text-xs font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]">
          {isLoading ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
          {isLoading ? 'Menyimpan...' : formData.status === 'published' ? 'Perbarui Artikel' : 'Simpan Draf'}
        </Button>
      </PageHeader>

      {!isSuperAdmin && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          Setelah disimpan, perubahan akan dikirim ke admin untuk ditinjau sebelum tampil kembali di halaman publik.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* ─────────────── KA: Konten Utama ─────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Judul & Isi Artikel */}
          <Card className="border border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden bg-white">
            <div className="bg-slate-50/70 px-6 py-4 border-b border-slate-200/80">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Judul &amp; Isi Artikel</h3>
            </div>
            <CardContent className="p-0">
              <div className="p-6 sm:p-7 space-y-5">
                <div className="space-y-1.5">
                  <label className={labelClass}>Judul Artikel <span className="text-[#c20000]">*</span></label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Tulis judul artikel..."
                    className={inputClass}
                  />
                  <p className="text-xs text-slate-400">URL artikel tetap mengikuti slug yang tersimpan.</p>
                </div>

                <div className="space-y-1.5">
                  <label className={labelClass}>Isi Artikel <span className="text-[#c20000]">*</span></label>
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <div className="quill-editor-container">
                      <style dangerouslySetInnerHTML={{__html: `
                        .quill-editor-container .ql-container {
                          font-size: 1rem;
                          min-height: 450px;
                          border: none !important;
                        }
                        .quill-editor-container .ql-toolbar {
                          border: none !important;
                          border-bottom: 1px solid #e2e8f0 !important;
                          background-color: #f8fafc;
                          padding: 10px 15px !important;
                        }
                        .quill-editor-container .ql-editor {
                          min-height: 450px;
                          padding: 1.5rem;
                          color: #0f172a;
                          overflow-x: auto;
                        }
                        .quill-editor-container .ql-editor.ql-blank::before {
                          color: #94a3b8;
                          font-style: normal;
                        }
                        /* ── Tabel ─────────────────────────────────────────── */
                        .quill-editor-container .ql-editor table {
                          border-collapse: collapse;
                          table-layout: fixed;
                          width: auto;
                          min-width: 200px;
                          margin: 0.5rem 0;
                        }
                        .quill-editor-container .ql-editor td,
                        .quill-editor-container .ql-editor th {
                          border: 1px solid #cbd5e1;
                          padding: 6px 10px;
                          min-width: 40px;
                          word-break: break-word;
                          vertical-align: top;
                        }
                        .quill-editor-container .ql-editor th {
                          background: #f1f5f9;
                          font-weight: 600;
                        }
                        /* Tombol sisipkan tabel di toolbar */
                        .quill-editor-container .ql-table-insert-btn {
                          border: none;
                          background: transparent;
                          border-radius: 3px;
                          color: #444;
                          line-height: 1;
                        }
                        .quill-editor-container .ql-table-insert-btn:hover {
                          background: #e2e8f0;
                          color: #0f172a;
                        }
                        /* Handle resize kolom (TableResizeBox) */
                        .table-up-resize-box-col-separator {
                          background-color: #3b82f6 !important;
                          width: 3px !important;
                          opacity: 0.7;
                        }
                        /* Handle resize scale tabel (TableResizeScale) */
                        .table-up-resize-scale-handle {
                          background-color: #3b82f6 !important;
                          border-radius: 2px !important;
                        }
                        /* Selection multi-sel */
                        .table-up-selection-line {
                          border-color: #3b82f6 !important;
                        }
                      `}} />
                      <RichTextEditor
                        value={formData.content}
                        onChange={handleContentChange}
                        modules={quillModules}
                        formats={quillFormats}
                        containerRef={quillRef}
                        placeholder="Mulai tulis isi artikel..."
                      />
                    </div>
                  </div>
                  <p className={helperClass}>Gunakan toolbar untuk format teks, tautan, gambar, dan tabel.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ringkasan Artikel */}
          <Card className="border border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden bg-white">
            <div className="bg-slate-50/70 px-6 py-4 border-b border-slate-200/80">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Ringkasan Artikel</h3>
            </div>
            <CardContent className="p-6 sm:p-7">
              <div className="space-y-1.5">
                <label className={labelClass}>Ringkasan <span className="text-[#c20000]">*</span></label>
                <textarea
                  name="excerpt"
                  required
                  rows={3}
                  value={formData.excerpt}
                  onChange={handleChange}
                  placeholder="Tulis ringkasan singkat artikel..."
                  className={`${inputClass} resize-none`}
                />
                <div className="flex items-center justify-between gap-4">
                  <p className={helperClass}>Ditampilkan pada kartu berita dan dipakai sebagai deskripsi mesin pencari.</p>
                  <span className="text-2xs text-slate-400 font-medium shrink-0">{formData.excerpt.length} karakter</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Penulis & Editor */}
          <Card className="border border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden bg-white">
            <div className="bg-slate-50/70 px-6 py-4 border-b border-slate-200/80">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Penulis &amp; Editor</h3>
            </div>
            <CardContent className="p-6 sm:p-7">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className={labelClass}>Nama Penulis</label>
                    <input
                      type="text"
                      name="author_name"
                      value={formData.author_name}
                      onChange={handleChange}
                      placeholder="Kosongkan jika Admin"
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass}>Jabatan Penulis</label>
                    <input
                      type="text"
                      name="author_role"
                      value={formData.author_role}
                      onChange={handleChange}
                      placeholder="cth. Ketua Umum, Anggota..."
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className={labelClass}>Nama Editor</label>
                    <input
                      type="text"
                      name="editor_name"
                      value={formData.editor_name}
                      onChange={handleChange}
                      placeholder="Nama editor..."
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass}>Jabatan Editor</label>
                    <input
                      type="text"
                      name="editor_role"
                      value={formData.editor_role}
                      onChange={handleChange}
                      placeholder="cth. Pimpinan Redaksi..."
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
              <p className={`${helperClass} mt-4`}>Data penulis dan editor ditampilkan pada halaman artikel publik (opsional).</p>
            </CardContent>
          </Card>

          {/* Analisis SEO */}
          <Card className="border border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden bg-white">
            <div className="bg-slate-50/70 px-6 py-4 border-b border-slate-200/80 flex flex-row justify-between items-center gap-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Analisis SEO</h3>
              <div className={`inline-flex px-2.5 py-1 rounded-full text-2xs font-semibold border ${
                seoStats.score >= 80
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                  : seoStats.score >= 40
                    ? 'bg-amber-50 text-amber-600 border-amber-200'
                    : 'bg-red-50 text-[#c20000] border-red-200'
              }`}>
                Skor {seoStats.score}/100
              </div>
            </div>
            <CardContent className="p-6 sm:p-7">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5">
                {seoStats.checks.map((check, index) => (
                  <div key={index} className="flex items-start gap-2.5 py-1.5">
                    <div className="mt-0.5 shrink-0">
                      {check.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : check.warning ? (
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="text-xs font-bold text-slate-700">{check.label}</p>
                        <span className="text-2xs text-slate-400 font-medium shrink-0">{check.value}</span>
                      </div>
                      <p className="text-2xs text-slate-400 mt-0.5">{check.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ─────────────── KANAN: Sidebar Meta ─────────────── */}
        <div className="space-y-6">

          {/* Publikasi */}
          <Card className="border border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden bg-white">
            <div className="bg-slate-50/70 px-5 py-4 border-b border-slate-200/80">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Publikasi</h3>
            </div>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className={labelClass}>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Terbitkan</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}>Jadwal Tayang <span className="text-slate-400 font-semibold normal-case tracking-normal">(opsional)</span></label>
                <input
                  type="datetime-local"
                  name="published_at"
                  value={formData.published_at}
                  onChange={handleChange}
                  className={inputClass}
                />
                <p className={helperClass}>Kosongkan untuk tayang langsung. Isi untuk tayang otomatis sesuai jadwal.</p>
              </div>
            </CardContent>
          </Card>

          {/* Kategori */}
          <Card className="border border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden bg-white">
            <div className="bg-slate-50/70 px-5 py-4 border-b border-slate-200/80">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Kategori</h3>
            </div>
            <CardContent className="p-5 space-y-3">
              <div className="space-y-1.5">
                <label className={labelClass}>Pilih Kategori <span className="text-[#c20000]">*</span></label>
                <select
                  name="category_id"
                  required
                  value={formData.category_id}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="" disabled>Pilih kategori</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(!isAddingCategory)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#c20000] hover:underline focus:outline-none"
                >
                  {isAddingCategory ? <Trash2 className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                  {isAddingCategory ? 'Batal menambahkan' : 'Tambah kategori baru'}
                </button>

                {isAddingCategory && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Nama kategori"
                    maxLength={100}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#c20000] focus:ring-2 focus:ring-[#c20000]/20 transition-all shadow-2xs"
                  />
                  <Button type="button" onClick={handleAddCategory} disabled={!newCategoryName.trim() || isSavingCategory} size="sm" className="bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl h-8 px-3 text-xs shrink-0">
                    {isSavingCategory ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Tambah'}
                  </Button>
                </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Meta SEO */}
          <Card className="border border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden bg-white">
            <div className="bg-slate-50/70 px-5 py-4 border-b border-slate-200/80">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Meta SEO</h3>
            </div>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className={labelClass}>Meta Title</label>
                <input
                  type="text"
                  name="meta_title"
                  value={formData.meta_title}
                  onChange={handleChange}
                  placeholder="Default: judul artikel"
                  maxLength={255}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Meta Description</label>
                <textarea
                  name="meta_description"
                  value={formData.meta_description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Default: ringkasan artikel"
                  className={`${inputClass} resize-none`}
                />
                <p className={helperClass}>Kosongkan untuk memakai judul &amp; ringkasan secara otomatis.</p>
              </div>
            </CardContent>
          </Card>

          {/* Kata Kunci */}
          <Card className="border border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden bg-white">
            <div className="bg-slate-50/70 px-5 py-4 border-b border-slate-200/80">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Kata Kunci</h3>
            </div>
            <CardContent className="p-5">
              <div className="space-y-1.5">
                <label className={labelClass}>Keywords</label>
                <input
                  type="text"
                  name="keywords"
                  value={formData.keywords}
                  onChange={handleChange}
                  placeholder="cth. pelantikan, musyda, kader"
                  className={inputClass}
                />
                <p className={helperClass}>Pisahkan setiap kata kunci dengan koma.</p>
              </div>
            </CardContent>
          </Card>

          {/* Gambar Utama */}
          <Card className="border border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden bg-white">
            <div className="bg-slate-50/70 px-5 py-4 border-b border-slate-200/80">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Gambar Utama</h3>
            </div>
            <CardContent className="p-5">
              <ImageUploadPicker
                value={featuredImage}
                onChange={(val) => setFeaturedImage(val)}
                aspectRatio="video"
                allowedFolder="blogs"
                description="Pilih foto dari Media Library atau unggah file baru dari perangkat (resolusi bebas — rasio 16:9 disarankan, rasio pas tidak terpotong)."
              />
            </CardContent>
          </Card>

        </div>
      </div>
    </form>
  );
}
