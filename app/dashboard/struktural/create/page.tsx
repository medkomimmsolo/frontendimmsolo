'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { ArrowLeft, Save, Loader2, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { convertToWebP } from '@/lib/imageUtils';
import Link from 'next/link';

interface SocialMedia {
  icon: string;
  url: string;
}

export default function CreateStruktural() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  
  const hasPeriodeParam = !!searchParams.get('periode');
  const hasBidangParam = !!searchParams.get('bidang');
  const hasKategoriParam = !!searchParams.get('kategori');

  const [formData, setFormData] = useState({
    name: '',
    jabatan: '',
    periode: '',
    kelompok_bidang: '',
    kategori: 'BPH',
    urutan: 0,
  });
  const [foto, setFoto] = useState<File | null>(null);
  const [socialMedia, setSocialMedia] = useState<SocialMedia[]>([]);

  // Sync searchParams into state on client side
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      periode: searchParams.get('periode') || prev.periode,
      kelompok_bidang: searchParams.get('bidang') || prev.kelompok_bidang,
      kategori: searchParams.get('kategori') || prev.kategori,
    }));
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar');
      return;
    }

    try {
      const webpFile = await convertToWebP(file);
      if (webpFile.size > 2 * 1024 * 1024) {
        toast.error('Setelah dikonversi, ukuran gambar masih lebih dari 2MB. Silakan pilih gambar dengan resolusi lebih kecil.');
        return;
      }
      setFoto(webpFile);
    } catch (error) {
      console.error('Failed to process image:', error);
      toast.error('Gagal memproses gambar');
    }
  };

  const handleAddSocialMedia = () => {
    if (socialMedia.length < 4) {
      setSocialMedia([...socialMedia, { icon: '', url: '' }]);
    }
  };

  const handleSocialMediaChange = (index: number, field: keyof SocialMedia, value: string) => {
    const updated = [...socialMedia];
    updated[index][field] = value;
    setSocialMedia(updated);
  };

  const handleRemoveSocialMedia = (index: number) => {
    const updated = [...socialMedia];
    updated.splice(index, 1);
    setSocialMedia(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value.toString());
      });
      if (foto) {
        data.append('foto', foto);
      }
      
      const validSocialMedia = socialMedia.filter(sm => sm.icon && sm.url);
      if (validSocialMedia.length > 0) {
        data.append('social_media', JSON.stringify(validSocialMedia));
      }

      // STRICT FRONTEND VALIDATION
      if (!formData.name) throw new Error('Nama wajib diisi');
      if (!formData.jabatan) throw new Error('Jabatan wajib diisi');
      if (!formData.periode) throw new Error('Periode wajib diisi. Silakan muat ulang (refresh) halaman ini.');

      console.log('Sending payload:', Object.fromEntries(data.entries()));

      await api.post('/struktural', data);
      toast.success('Data pengurus berhasil ditambahkan');
      router.push('/dashboard/struktural');
    } catch (error: any) {
      console.error('Submit Error:', error);
      if (error.response?.status === 422) {
        const validationErrors = error.response.data.errors;
        console.error('Validation Errors:', JSON.stringify(validationErrors, null, 2));
        const firstErrorKey = Object.keys(validationErrors)[0];
        const firstErrorMessage = validationErrors[firstErrorKey][0];
        toast.error(`Validasi Gagal: ${firstErrorMessage}`);
      } else {
        toast.error(error.message || error.response?.data?.message || 'Gagal menyimpan data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/struktural">
            <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-md border-slate-200 hover:text-[#c20000]">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#0f172a] tracking-tight" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
              Tambah Pengurus
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">Masukkan data pengurus baru.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/struktural">
            <Button type="button" variant="ghost" className="text-slate-600 hover:text-slate-900 rounded-sm">
              Batal
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading} className="bg-[#c20000] hover:bg-[#a30000] text-white rounded-sm shadow-sm transition-all px-5">
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {isLoading ? 'Menyimpan...' : 'Simpan Data'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200 shadow-sm rounded-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#0f172a]">Nama Lengkap</label>
                  <input 
                    type="text" 
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Masukkan nama lengkap beserta gelar..." 
                    className="w-full bg-white border border-slate-200 rounded-sm px-4 py-2.5 text-[#0f172a] focus:outline-none focus:border-imm-red-500 focus:ring-1 focus:ring-imm-red-500 transition-colors text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#0f172a]">Jabatan</label>
                  <input 
                    type="text" 
                    name="jabatan"
                    required
                    value={formData.jabatan}
                    onChange={handleChange}
                    placeholder="Contoh: Ketua Umum"
                    className="w-full bg-white border border-slate-200 rounded-sm px-4 py-2.5 text-[#0f172a] focus:outline-none focus:border-imm-red-500 focus:ring-1 focus:ring-imm-red-500 transition-colors text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Media Card */}
          <Card className="border-slate-200 shadow-sm rounded-sm overflow-hidden">
            <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-[#0f172a]">Sosial Media</h3>
              {socialMedia.length < 4 && (
                <Button type="button" onClick={handleAddSocialMedia} variant="outline" size="sm" className="h-8 text-xs border-dashed border-[#c20000] text-[#c20000] hover:bg-[#c20000]/5">
                  <Plus className="w-3 h-3 mr-1" /> Tambah Sosmed
                </Button>
              )}
            </div>
            <CardContent className="p-6">
              <div className="space-y-4">
                {socialMedia.length === 0 && (
                  <p className="text-sm text-slate-500 italic">Belum ada sosial media yang ditambahkan.</p>
                )}
                {socialMedia.map((sm, idx) => (
                  <div key={idx} className="flex gap-4 items-start bg-slate-50 p-4 rounded-sm border border-slate-200">
                    <div className="flex-1 space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-600">Ikon Sosial Media (URL)</label>
                        <input 
                          type="url" 
                          placeholder="Link Logo (CDN SVG) contoh: https://thesvg.org/..."
                          value={sm.icon}
                          onChange={(e) => handleSocialMediaChange(idx, 'icon', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-imm-red-500 focus:ring-1 focus:ring-imm-red-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-600">URL Profil</label>
                        <input 
                          type="url" 
                          placeholder="URL Profil Sosial Media"
                          value={sm.url}
                          onChange={(e) => handleSocialMediaChange(idx, 'url', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-imm-red-500 focus:ring-1 focus:ring-imm-red-500"
                        />
                      </div>
                    </div>
                    <Button type="button" onClick={() => handleRemoveSocialMedia(idx)} variant="outline" size="icon" className="h-8 w-8 shrink-0 text-red-500 border-red-200 hover:bg-red-50 mt-6">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Meta Sidebar */}
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm rounded-sm overflow-hidden">
            <div className="bg-slate-50/50 px-5 py-4 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-[#0f172a]">Foto Profil</h3>
            </div>
            <CardContent className="p-5">
              <div className="space-y-4">
                <label className="flex flex-col items-center justify-center w-full aspect-square border-2 border-slate-200 border-dashed rounded-sm cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors relative overflow-hidden group">
                  <div className="flex flex-col items-center justify-center p-6 text-center">
                    {foto ? (
                      <>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white text-sm font-medium">Ganti Foto</span>
                        </div>
                        <img 
                          src={URL.createObjectURL(foto)} 
                          alt="Preview" 
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-10 h-10 mb-3 text-slate-400 group-hover:text-[#c20000] transition-colors" />
                        <p className="mb-1 text-sm text-slate-600 font-medium">Upload foto</p>
                        <p className="text-xs text-slate-400">PNG, JPG, WEBP (Max. 2MB)</p>
                      </>
                    )}
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
