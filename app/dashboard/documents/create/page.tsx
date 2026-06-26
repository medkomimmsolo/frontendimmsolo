'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Loader2, ArrowLeft, Link as LinkIcon, FileText, UploadCloud, Link2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function CreateDocument() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadMode, setUploadMode] = useState<'file' | 'link'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file_url: '',
    file_type: 'link', // default for link
    status: 'published',
  });

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
      toast.error(error.response?.data?.message || 'Gagal menambahkan dokumen');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/dashboard/documents">
          <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-full border-slate-200 text-slate-500 hover:text-[#c20000]">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-[#0f172a]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
          Add New Document
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-md shadow-sm p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Document Title <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-md focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] transition-colors"
                  placeholder="Enter document title here"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea 
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-md focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] transition-colors resize-none"
                  placeholder="Brief description about this document..."
                />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
              <div className="flex border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => setUploadMode('file')}
                  className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                    uploadMode === 'file' 
                      ? 'bg-slate-50 text-[#c20000] border-b-2 border-[#c20000]' 
                      : 'bg-white text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <UploadCloud className="w-4 h-4" />
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('link')}
                  className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                    uploadMode === 'link' 
                      ? 'bg-slate-50 text-[#c20000] border-b-2 border-[#c20000]' 
                      : 'bg-white text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Link2 className="w-4 h-4" />
                  Link URL
                </button>
              </div>

              <div className="p-6 space-y-4">
                {uploadMode === 'file' ? (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Upload File <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-2 flex justify-center rounded-lg border border-dashed border-slate-300 px-6 py-10 bg-slate-50 hover:bg-slate-100 transition-colors">
                      <div className="text-center">
                        <UploadCloud className="mx-auto h-12 w-12 text-slate-300" aria-hidden="true" />
                        <div className="mt-4 flex justify-center text-sm leading-6 text-slate-600">
                          <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-semibold text-[#c20000] focus-within:outline-none focus-within:ring-2 focus-within:ring-[#c20000] focus-within:ring-offset-2 hover:text-[#a30000] px-3 py-1 border border-slate-200 shadow-sm">
                            <span>Upload a file</span>
                            <input 
                              id="file-upload" 
                              name="file-upload" 
                              type="file" 
                              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip"
                              className="sr-only" 
                              onChange={(e) => setFile(e.target.files?.[0] || null)} 
                            />
                          </label>
                        </div>
                        {file ? (
                          <p className="text-sm leading-5 text-slate-500 mt-2 font-medium">
                            Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </p>
                        ) : (
                          <p className="text-xs leading-5 text-slate-500 mt-2">
                            PDF, DOC, XLS, PPT, ZIP up to 10MB
                          </p>
                        )}
                        <p className="text-xs text-orange-500 mt-2 max-w-xs mx-auto">
                          Jika Anda mendapati error "Content Too Large", harap gunakan mode Link URL.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        URL / Link Dokumen <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <LinkIcon className="h-4 w-4 text-slate-400" />
                        </div>
                        <input 
                          type="url" 
                          required={uploadMode === 'link'}
                          value={formData.file_url}
                          onChange={(e) => setFormData({...formData, file_url: e.target.value})}
                          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-md focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] transition-colors"
                          placeholder="https://drive.google.com/..."
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        Format / Tipe File <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FileText className="h-4 w-4 text-slate-400" />
                        </div>
                        <select 
                          value={formData.file_type}
                          onChange={(e) => setFormData({...formData, file_type: e.target.value})}
                          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-md focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] transition-colors appearance-none"
                        >
                          <option value="drive">Google Drive Link</option>
                          <option value="link">External Link / Web</option>
                          <option value="pdf">PDF Document</option>
                          <option value="word">Word Document</option>
                          <option value="excel">Excel Document</option>
                          <option value="ppt">PowerPoint</option>
                          <option value="zip">ZIP Archive</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="md:col-span-1 space-y-6">
            <div className="bg-white border border-slate-200 rounded-md shadow-sm p-5">
              <h3 className="font-semibold text-slate-800 mb-4 pb-3 border-b border-slate-100">Publish</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] text-sm"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                
                <div className="pt-4 border-t border-slate-100 flex gap-2">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="w-full bg-[#c20000] hover:bg-[#a30000] text-white shadow-sm"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Publish Document
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
