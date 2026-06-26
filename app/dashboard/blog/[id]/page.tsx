'use client';

import { useState, useEffect, useMemo, use } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ArrowLeft, Save, Loader2, Image as ImageIcon, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Category, Blog } from '@/types';
import dynamic from 'next/dynamic';

// Import React Quill dynamically to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), { 
  ssr: false,
  loading: () => <div className="h-96 w-full flex items-center justify-center bg-gray-50 border border-gray-200 rounded-sm">Memuat Editor...</div>
});
import 'react-quill-new/dist/quill.snow.css';

export default function EditBlog({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    excerpt: '',
    content: '',
    status: 'draft',
    author_name: '',
    editor_name: '',
    author_role: '',
    editor_role: '',
    keywords: '',
  });
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  const convertToWebP = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
              if (blob) {
                const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                  type: 'image/webp',
                });
                resolve(newFile);
              } else {
                reject(new Error("Canvas to Blob failed"));
              }
            }, 'image/webp', 0.8);
          } else {
            reject(new Error("Canvas context failed"));
          }
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const webpFile = await convertToWebP(file);

      if (webpFile.size > 2 * 1024 * 1024) {
        toast.error('Setelah dikonversi, ukuran gambar masih lebih dari 2MB. Silakan pilih gambar dengan resolusi lebih kecil.');
        return;
      }
        setFeaturedImage(webpFile);
      } catch (error) {
        console.error("Gagal konversi ke WebP", error);
        toast.error("Gagal memproses gambar");
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, blogRes] = await Promise.all([
          api.get('/categories'),
          api.get(`/blogs/${id}`)
        ]);
        
        setCategories(catRes.data.data || []);
        
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
          author_name: blog.author_name || '',
          editor_name: blog.editor_name || '',
          author_role: blog.author_role || '',
          editor_role: blog.editor_role || '',
          keywords: blog.keywords || '',
        });
        if (blog.featured_image) {
          setCurrentImage(blog.featured_image);
        }
      } catch (err: any) {
        console.error(err);
        toast.error('Gagal memuat data');
        router.push('/dashboard/blog');
      } finally {
        setIsFetching(false);
      }
    };
    
    fetchData();
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleContentChange = (value: string) => {
    setFormData({ ...formData, content: value });
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const res = await api.post('/categories', { name: newCategoryName });
      const newCategory = res.data.data || res.data;
      setCategories([...categories, newCategory]);
      setFormData({ ...formData, category_id: newCategory.id });
      setIsAddingCategory(false);
      setNewCategoryName('');
      toast.success('Kategori berhasil ditambahkan');
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Gagal menambahkan kategori');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content || formData.content === '<p><br></p>') {
      toast.error('Isi post tidak boleh kosong');
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
      }
      data.append('_method', 'PUT');

      await api.post(`/blogs/${id}`, data);
      toast.success('Post berhasil diperbarui');
      router.push('/dashboard/blog');
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Gagal menyimpan perubahan');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Rich Text Editor Modules ---
  const quillModules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image', 'video'],
      ['clean']
    ],
  }), []);

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'indent',
    'link', 'image', 'video'
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
    <div className="space-y-6 w-full pb-12">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/dashboard/blog">
          <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-md border-slate-200 hover:text-[#c20000]">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-[22px] font-bold text-[#0f172a]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
            Edit Post
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-6 items-start">
        {/* LEFT COLUMN: Title, Content, Excerpt, Author, SEO */}
        <div className="w-full lg:w-[70%] space-y-6">
          
          {/* WordPress-style Title Input */}
          <div>
            <input 
              type="text" 
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="Add title" 
              className="w-full bg-white border border-slate-300 rounded-sm px-4 py-3 text-xl font-medium text-[#0f172a] focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] transition-shadow shadow-sm placeholder:text-slate-400"
            />
          </div>

          {/* Editor Box */}
          <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
            {/* React Quill Editor Container */}
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
                }
                .quill-editor-container .ql-editor.ql-blank::before {
                  color: #94a3b8;
                  font-style: normal;
                }
              `}} />
              <ReactQuill 
                theme="snow"
                value={formData.content}
                onChange={handleContentChange}
                modules={quillModules}
                formats={quillFormats}
                placeholder="Start writing or type / to choose a block..."
              />
            </div>
          </div>

          {/* Excerpt Meta Box */}
          <Card className="border-slate-200 shadow-sm rounded-sm">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50 px-4 py-3">
              <CardTitle className="text-sm font-semibold text-[#0f172a]">Excerpt</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <textarea 
                name="excerpt"
                required
                rows={3}
                value={formData.excerpt}
                onChange={handleChange}
                placeholder="Write a short summary or meta description..." 
                className="w-full bg-white border border-slate-300 rounded-sm px-3 py-2 text-[#0f172a] focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] transition-colors resize-none text-sm shadow-sm"
              />
              <p className="text-xs text-slate-500 mt-2">Excerpts are optional hand-crafted summaries of your content that can be used in your theme.</p>
            </CardContent>
          </Card>

          {/* Author/Editor Meta Box */}
          <Card className="border-slate-200 shadow-sm rounded-sm">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50 px-4 py-3">
              <CardTitle className="text-sm font-semibold text-[#0f172a]">Author & Editor Data</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Author Name</label>
                    <input 
                      type="text" 
                      name="author_name"
                      value={formData.author_name}
                      onChange={handleChange}
                      placeholder="Leave blank if Admin" 
                      className="w-full bg-white border border-slate-300 rounded-sm px-3 py-2 text-[#0f172a] text-sm focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Author Role</label>
                    <input 
                      type="text" 
                      name="author_role"
                      value={formData.author_role}
                      onChange={handleChange}
                      placeholder="e.g. Ketua Umum, Anggota..." 
                      className="w-full bg-white border border-slate-300 rounded-sm px-3 py-2 text-[#0f172a] text-sm focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Editor Name</label>
                    <input 
                      type="text" 
                      name="editor_name"
                      value={formData.editor_name}
                      onChange={handleChange}
                      placeholder="Name of editor..." 
                      className="w-full bg-white border border-slate-300 rounded-sm px-3 py-2 text-[#0f172a] text-sm focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Editor Role</label>
                    <input 
                      type="text" 
                      name="editor_role"
                      value={formData.editor_role}
                      onChange={handleChange}
                      placeholder="e.g. Pimpinan Redaksi..." 
                      className="w-full bg-white border border-slate-300 rounded-sm px-3 py-2 text-[#0f172a] text-sm focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO Analyzer Card */}
          <Card className="border-slate-200 shadow-sm rounded-sm">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50 px-4 py-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold text-[#0f172a]">SEO Analysis</CardTitle>
              <div className={`px-2 py-0.5 rounded text-xs font-bold ${
                seoStats.score >= 80 ? 'bg-emerald-100 text-emerald-700' : 
                seoStats.score >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
              }`}>
                Score: {seoStats.score}/100
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {seoStats.checks.map((check, index) => (
                <div key={index} className="flex items-start gap-3 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                  <div className="mt-0.5">
                    {check.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : check.warning ? (
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-[#0f172a]">{check.label}</p>
                      <span className="text-xs font-semibold text-slate-500">{check.value}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{check.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Sidebar (Publish, Categories, Keywords, Image) */}
        <div className="w-full lg:w-[30%] space-y-5 sticky top-6">
          
          {/* Publish Box */}
          <Card className="border-slate-200 shadow-sm rounded-sm">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50 px-4 py-3">
              <CardTitle className="text-sm font-semibold text-[#0f172a]">Publish</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Status:</span>
                <select 
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="bg-white border border-slate-300 rounded-sm px-2 py-1 text-sm text-[#0f172a] focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] font-medium"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <Button type="button" onClick={() => router.push('/dashboard/blog')} variant="outline" className="flex-1 rounded-sm text-sm border-slate-300 hover:text-[#c20000]">
                  Batal
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1 rounded-sm text-sm bg-[#c20000] hover:bg-[#a30000] text-white shadow-sm transition-colors">
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  {formData.status === 'published' ? 'Update' : 'Save Draft'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Categories Box */}
          <Card className="border-slate-200 shadow-sm rounded-sm">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50 px-4 py-3">
              <CardTitle className="text-sm font-semibold text-[#0f172a]">Categories</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <select 
                name="category_id"
                required
                value={formData.category_id}
                onChange={handleChange}
                className="w-full bg-white border border-slate-300 rounded-sm px-3 py-2 text-[#0f172a] text-sm focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] shadow-sm"
              >
                <option value="" disabled>Pilih Kategori</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <div>
                <button 
                  type="button" 
                  onClick={() => setIsAddingCategory(!isAddingCategory)}
                  className="text-sm text-[#c20000] hover:underline focus:outline-none"
                >
                  {isAddingCategory ? 'Batal menambahkan' : '+ Add New Category'}
                </button>
                
                {isAddingCategory && (
                  <div className="flex gap-2 mt-2">
                    <input 
                      type="text" 
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Category name" 
                      className="flex-1 bg-white border border-slate-300 rounded-sm px-3 py-1.5 text-sm focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] shadow-sm"
                    />
                    <Button type="button" onClick={handleAddCategory} size="sm" className="bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-sm h-8 px-3">
                      Add
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Keywords Box */}
          <Card className="border-slate-200 shadow-sm rounded-sm">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50 px-4 py-3">
              <CardTitle className="text-sm font-semibold text-[#0f172a]">Keywords</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <input 
                type="text" 
                name="keywords"
                value={formData.keywords}
                onChange={handleChange}
                placeholder="e.g. pelantikan, musyda, kader" 
                className="w-full bg-white border border-slate-300 rounded-sm px-3 py-2 text-[#0f172a] text-sm focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] shadow-sm"
              />
              <p className="text-xs text-slate-500 mt-2">Separate tags with commas.</p>
            </CardContent>
          </Card>

          {/* Featured Image Box */}
          <Card className="border-slate-200 shadow-sm rounded-sm">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50 px-4 py-3">
              <CardTitle className="text-sm font-semibold text-[#0f172a]">Featured image</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {(featuredImage || currentImage) ? (
                <div className="space-y-2">
                  <div className="relative w-full aspect-video rounded-sm overflow-hidden border border-slate-200 bg-slate-50 group">
                    <img 
                      src={featuredImage ? URL.createObjectURL(featuredImage) : (currentImage?.startsWith('http') ? currentImage : `/storage/${currentImage?.replace(/^\/?storage\//, '')}`)} 
                      alt="Preview" 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        type="button" 
                        onClick={() => {
                          setFeaturedImage(null);
                          setCurrentImage(null);
                        }}
                        className="text-white hover:text-red-400 bg-black/50 hover:bg-black/80 px-3 py-1.5 rounded-sm text-sm font-medium transition-colors"
                      >
                        Remove image
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">Click the image to remove it. (Max 2MB)</p>
                </div>
              ) : (
                <label className="w-full aspect-video rounded-sm bg-slate-50 border border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors">
                  <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-sm text-[#c20000] hover:underline font-medium">Set featured image</span>
                  <input 
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </CardContent>
          </Card>

        </div>
      </form>
    </div>
  );
}
