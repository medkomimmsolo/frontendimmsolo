'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Loader2, Link as LinkIcon, FileText, UploadCloud, Link2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getUserFacingErrorMessage } from '@/lib/errorMessage';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';

const inputClass = "w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[#0f172a] focus:outline-none focus:border-[#c20000] focus:ring-2 focus:ring-[#c20000]/20 transition-all text-sm shadow-2xs";
const labelClass = "block text-xs font-bold text-slate-700 uppercase tracking-wider";
const helperClass = "text-xs text-slate-500 leading-relaxed";

export default function CreateDocument() {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadMode, setUploadMode] = useState<'file' | 'link'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    file_url: '',
    file_type: 'link', // default for link
    status: 'published',
  });
  const [isSlugManual, setIsSlugManual] = useState(false);

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    if (!isSlugManual) {
      setFormData(prev => ({ ...prev, title, slug: slugify(title) }));
    } else {
      setFormData(prev => ({ ...prev, title }));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    if (selected) {
      const maxBytes = 10 * 1024 * 1024; // 10MB limit
      if (selected.size > maxBytes) {
        toast.error(`Ukuran file (${(selected.size / 1024 / 1024).toFixed(2)} MB) melebihi batas 10 MB. Silakan gunakan tab "Link URL" (Google Drive) untuk file berukuran besar.`);
        e.target.value = '';
        setFile(null);
        return;
      }
    }
    setFile(selected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (uploadMode === 'file' && !file) {
      toast.error('File dokumen harus diunggah');
      return;
    }

    if (uploadMode === 'link' && !formData.file_url) {
      toast.error('URL dokumen harus diisi');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      if (formData.slug.trim()) {
        data.append('slug', slugify(formData.slug));
      }
      data.append('description', formData.description);
      data.append('status', formData.status);

      if (uploadMode === 'file' && file) {
        data.append('file', file);
        data.append('file_type', 'file'); // The backend will auto-detect exact type from extension
      } else {
        data.append('file_url', formData.file_url);
        data.append('file_type', formData.file_type);
      }

      await api.post('/documents', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Dokumen berhasil ditambahkan');
      router.push('/dashboard/documents');
      router.refresh();
    } catch (error: any) {
      console.error('Failed to add document', error);
      if (error.response?.status === 413) {
        toast.error(getUserFacingErrorMessage(error, 'Ukuran berkas melebihi batas upload web server (Error 413: Payload Too Large). Silakan gunakan tab "Link URL" (Google Drive) atau hubungi admin server untuk menaikkan post_max_size / client_max_body_size.'), { duration: 7000 });
      } else {
        toast.error(error.response?.data?.message || 'Gagal menambahkan dokumen');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">

      {/* Page Header dengan Aksi */}
      <PageHeader
        title="Tambah Dokumen Baru"
        description="Unggah berkas atau tautkan dokumen agar mudah diakses publik"
        badge="Dokumen"
      >
        <Link href="/dashboard/documents">
          <Button type="button" variant="outline" size="sm" className="h-10 px-4 rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs">
            Batal
          </Button>
        </Link>
        <Button type="submit" disabled={isSubmitting} className="h-10 px-5 bg-[#c20000] hover:bg-[#a30000] text-white rounded-xl text-xs font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]">
          {isSubmitting ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : null}
          {isSubmitting ? 'Menyimpan...' : 'Terbitkan Dokumen'}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* ─────────────── KIRI: Konten Utama ─────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Judul & Deskripsi */}
          <Card className="border border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden bg-white">
            <div className="bg-slate-50/70 px-6 py-4 border-b border-slate-200/80">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Judul &amp; Deskripsi Dokumen</h3>
            </div>
            <CardContent className="p-6 sm:p-7 space-y-5">
              <div className="space-y-1.5">
                <label className={labelClass}>Judul Dokumen <span className="text-[#c20000]">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleTitleChange}
                  className={inputClass}
                  placeholder="cth. Program Kerja Bidang Kajian Islam 2025"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className={labelClass}>Slug URL Berkas {uploadMode === 'file' ? <span className="text-slate-400 font-semibold normal-case tracking-normal">(Link Publik /files/slug)</span> : <span className="text-slate-400 font-semibold normal-case tracking-normal">(opsional)</span>}</label>
                  {isSlugManual && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsSlugManual(false);
                        setFormData(prev => ({ ...prev, slug: slugify(prev.title) }));
                      }}
                      className="text-xs text-[#c20000] hover:underline font-semibold"
                    >
                      Reset dari Judul
                    </button>
                  )}
                </div>
                <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden bg-white focus-within:border-[#c20000] focus-within:ring-2 focus-within:ring-[#c20000]/20 transition-all shadow-2xs">
                  <span className="px-3 py-2.5 bg-slate-50 text-slate-500 text-xs font-mono border-r border-slate-200 select-none">
                    immsolo.or.id/files/
                  </span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => {
                      setIsSlugManual(true);
                      setFormData({ ...formData, slug: slugify(e.target.value) });
                    }}
                    placeholder="nama-file-atau-foto"
                    className="flex-1 px-3 py-2.5 text-sm text-slate-800 outline-none font-mono"
                  />
                </div>
                <p className={helperClass}>
                  Gunakan huruf kecil dan tanda hubung (-). Format link ini netral untuk dokumen maupun foto.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}>Deskripsi</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className={`${inputClass} resize-none`}
                  placeholder="Tulis keterangan singkat mengenai dokumen ini..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Berkas / Tautan */}
          <Card className="border border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden bg-white">
            <div className="bg-slate-50/70 px-6 py-4 border-b border-slate-200/80">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Berkas atau Tautan Dokumen</h3>
            </div>
            <div className="flex border-b border-slate-200/80 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setUploadMode('file')}
                className={`flex-1 py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${
                  uploadMode === 'file'
                    ? 'bg-slate-50 text-[#c20000] border-b-2 border-[#c20000]'
                    : 'bg-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <UploadCloud className="w-4 h-4" />
                Unggah Berkas
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('link')}
                className={`flex-1 py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${
                  uploadMode === 'link'
                    ? 'bg-slate-50 text-[#c20000] border-b-2 border-[#c20000]'
                    : 'bg-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Link2 className="w-4 h-4" />
                Tautan URL
              </button>
            </div>

            <CardContent className="p-6 sm:p-7 space-y-5">
              {uploadMode === 'file' ? (
                <div>
                  <label className={labelClass}>Unggah Berkas <span className="text-[#c20000]">*</span></label>
                  <div className="mt-3 flex justify-center rounded-xl border border-dashed border-slate-300 px-6 py-10 bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="text-center">
                      <UploadCloud className="mx-auto h-12 w-12 text-slate-300" aria-hidden="true" />
                      <div className="mt-4 flex justify-center text-sm leading-6 text-slate-600">
                        <label htmlFor="file-upload" className="relative cursor-pointer rounded-lg bg-white font-semibold text-[#c20000] focus-within:outline-none focus-within:ring-2 focus-within:ring-[#c20000] focus-within:ring-offset-2 hover:text-[#a30000] px-3 py-1 border border-slate-200 shadow-2xs">
                          <span>Pilih Berkas</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.jpg,.jpeg,.png,.webp,.svg"
                            className="sr-only"
                            onChange={handleFileSelect}
                          />
                        </label>
                      </div>
                      {file ? (
                        <p className="text-sm leading-5 text-slate-600 mt-2 font-medium">
                          Berkas terpilih: <span className="text-[#0f172a] font-semibold">{file.name}</span> ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      ) : (
                        <p className="text-xs leading-5 text-slate-500 mt-2">
                          PDF, DOC, XLS, PPT, ZIP, JPG, PNG, WebP hingga 10MB
                        </p>
                      )}
                      <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto">
                        Semua jenis file dan foto didukung. Nama file akan otomatis diformat rapi dengan slug.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className={`${labelClass} flex items-center gap-2`}>
                      <LinkIcon className="w-3.5 h-3.5 text-slate-400" /> URL / Tautan Dokumen <span className="text-[#c20000]">*</span>
                    </label>
                    <input
                      type="url"
                      required={uploadMode === 'link'}
                      value={formData.file_url}
                      onChange={(e) => setFormData({...formData, file_url: e.target.value})}
                      className={inputClass}
                      placeholder="https://drive.google.com/..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className={`${labelClass} flex items-center gap-2`}>
                      <FileText className="w-3.5 h-3.5 text-slate-400" /> Format / Tipe File <span className="text-[#c20000]">*</span>
                    </label>
                    <select
                      value={formData.file_type}
                      onChange={(e) => setFormData({...formData, file_type: e.target.value})}
                      className={inputClass}
                    >
                      <option value="drive">Google Drive Link</option>
                      <option value="link">External Link / Web</option>
                      <option value="image">Gambar / Foto</option>
                      <option value="pdf">PDF Document</option>
                      <option value="word">Word Document</option>
                      <option value="excel">Excel Document</option>
                      <option value="ppt">PowerPoint</option>
                      <option value="zip">ZIP Archive</option>
                    </select>
                  </div>
                </>
              )}
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
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className={inputClass}
                >
                  <option value="published">Terbitkan</option>
                  <option value="draft">Draf</option>
                </select>
                <p className={helperClass}>Dokumen dengan status Draf hanya bisa dilihat oleh pengelola dashboard.</p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </form>
  );
}
