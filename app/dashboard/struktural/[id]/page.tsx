'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { ArrowLeft, Save, Loader2, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getUserFacingErrorMessage } from '@/lib/errorMessage';
import { convertToWebP } from '@/lib/imageUtils';
import ImageUploadPicker from '@/components/dashboard/ImageUploadPicker';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';

interface SocialMedia {
  icon: string;
  url: string;
}

export default function EditStruktural({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    jabatan: '',
    periode: '',
    kategori: 'BPH',
    kelompok_bidang: '',
    urutan: 0,
  });
  const [foto, setFoto] = useState<File | string | null>(null);
  const [socialMedia, setSocialMedia] = useState<SocialMedia[]>([]);

  useEffect(() => {
    const fetchStruktural = async () => {
      try {
        const response = await api.get(`/struktural/${id}`);
        const data = response.data.data;
        
        setFormData({
          name: data.name,
          jabatan: data.jabatan,
          periode: data.periode,
          kategori: data.kategori || 'BPH',
          kelompok_bidang: data.kelompok_bidang || '',
          urutan: data.urutan || 0,
        });
        if (data.foto) {
          setFoto(data.foto);
        }
        if (data.social_media && Array.isArray(data.social_media)) {
          setSocialMedia(data.social_media);
        } else if (data.instagram_url) {
          // Fallback if there's old instagram_url
          setSocialMedia([{ icon: 'https://thesvg.org/icons/instagram/default.svg', url: data.instagram_url }]);
        }
      } catch (err: any) {
        console.error(err);
        toast.error(getUserFacingErrorMessage(err, 'Gagal memuat data'));
        router.push('/dashboard/struktural');
      } finally {
        setIsFetching(false);
      }
    };
    
    fetchStruktural();
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      } else {
        data.append('social_media', JSON.stringify([])); // Explicitly send empty array to clear
      }

      data.append('_method', 'PUT'); // Laravel accepts PUT via _method in FormData
      
      await api.post(`/struktural/${id}`, data);
      toast.success('Data pengurus berhasil diperbarui');
      router.push('/dashboard/struktural');
    } catch (error: any) {
      console.error(error);
      if (error.response?.status === 422) {
        const validationErrors = error.response.data.errors;
        const firstErrorKey = Object.keys(validationErrors)[0];
        const firstErrorMessage = validationErrors[firstErrorKey][0];
        toast.error(`Validasi Gagal: ${firstErrorMessage}`);
      } else {
        toast.error(error.response?.data?.message || 'Gagal menyimpan data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-64 text-[#0f172a]/70">
        <Loader2 className="w-8 h-8 animate-spin mr-3 text-[#c20000]" />
        Memuat data pengurus...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      {/* Modern Page Header */}
      <PageHeader
        title="Edit Data Pengurus"
        description="Perbarui informasi profil, nama, jabatan, foto, dan akun sosial media pengurus"
        badge="Struktural"
      >
        <Link href="/dashboard/struktural">
          <Button type="button" variant="outline" size="sm" className="h-10 px-4 rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs">
            Batal
          </Button>
        </Link>
        <Button type="submit" disabled={isLoading} className="h-10 px-5 bg-[#c20000] hover:bg-[#a30000] text-white rounded-xl text-xs font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]">
          {isLoading ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
          {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden bg-white">
            <CardContent className="p-0">
              <div className="p-6 sm:p-7 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Nama Lengkap</label>
                  <input 
                    type="text" 
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Masukkan nama lengkap beserta gelar..." 
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[#0f172a] focus:outline-none focus:border-[#c20000] focus:ring-2 focus:ring-[#c20000]/20 transition-all text-sm shadow-2xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Jabatan</label>
                  <input 
                    type="text" 
                    name="jabatan"
                    required
                    value={formData.jabatan}
                    onChange={handleChange}
                    placeholder="Contoh: Ketua Umum"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[#0f172a] focus:outline-none focus:border-[#c20000] focus:ring-2 focus:ring-[#c20000]/20 transition-all text-sm shadow-2xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Media Card */}
          <Card className="border border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden bg-white">
            <div className="bg-slate-50/70 px-6 py-4 border-b border-slate-200/80 flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Sosial Media</h3>
              {socialMedia.length < 4 && (
                <Button type="button" onClick={handleAddSocialMedia} variant="outline" size="sm" className="h-8 text-xs font-semibold rounded-xl border-dashed border-[#c20000] text-[#c20000] hover:bg-red-50">
                  <Plus className="w-3 h-3 mr-1" /> Tambah Sosmed
                </Button>
              )}
            </div>
            <CardContent className="p-6">
              <div className="space-y-4">
                {socialMedia.length === 0 && (
                  <p className="text-xs text-slate-400 italic">Belum ada akun sosial media yang ditambahkan.</p>
                )}
                {socialMedia.map((sm, idx) => (
                  <div key={idx} className="flex gap-3.5 items-start bg-slate-50/80 p-4 rounded-xl border border-slate-200/80">
                    <div className="flex-1 space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600">Ikon Sosial Media (URL)</label>
                        <input 
                          type="url" 
                          placeholder="Link Logo (CDN SVG) contoh: https://thesvg.org/..."
                          value={sm.icon}
                          onChange={(e) => handleSocialMediaChange(idx, 'icon', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#c20000] focus:ring-2 focus:ring-[#c20000]/20 transition-all shadow-2xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-600">URL Profil</label>
                        <input 
                          type="url" 
                          placeholder="URL Profil Sosial Media"
                          value={sm.url}
                          onChange={(e) => handleSocialMediaChange(idx, 'url', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#c20000] focus:ring-2 focus:ring-[#c20000]/20 transition-all shadow-2xs"
                        />
                      </div>
                    </div>
                    <Button type="button" onClick={() => handleRemoveSocialMedia(idx)} variant="outline" size="icon" className="h-8 w-8 shrink-0 text-red-500 border-red-200 hover:bg-red-50 rounded-xl mt-6">
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
          <Card className="border border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden bg-white">
            <div className="bg-slate-50/70 px-5 py-4 border-b border-slate-200/80">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Foto Profil</h3>
            </div>
            <CardContent className="p-5">
              <ImageUploadPicker
                value={foto}
                onChange={(val) => setFoto(val)}
                aspectRatio="square"
                allowedFolder="struktural"
                description="Pilih dari Media Library atau unggah dari perangkat. Rasio 1:1 (persegi) disarankan."
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
