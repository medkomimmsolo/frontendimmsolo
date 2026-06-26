'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Save, Loader2, Settings as SettingsIcon, Image as ImageIcon, MapPin, Link as LinkIcon, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { convertToWebP } from '@/lib/imageUtils';
import { motion } from 'motion/react';

export default function SettingsManagement() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  
  const [settings, setSettings] = useState({
    site_name: '',
    site_description: '',
    site_logo: '',
    site_logo_white: '',
    site_icon: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    social_instagram: '',
    social_youtube: '',
    social_tiktok: '',
    stat_kader: '',
    stat_komisariat: '',
    stat_lembaga: '',
    stat_universitas: '',
    chairman_name: '',
    chairman_period: '',
    chairman_message: '',
    chairman_photo: '',
    maintenance_mode: 'false',
    maintenance_beranda: 'false',
    maintenance_profil: 'false',
    maintenance_berita: 'false',
    maintenance_agenda: 'false',
    maintenance_dokumen: 'false',
    maintenance_kontak: 'false',
    maintenance_shortlink: 'false',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings');
        const data = response.data.data;
        const newSettings = { ...settings };
        
        if (Array.isArray(data)) {
          data.forEach((item: any) => {
            if (item.key in newSettings) {
              (newSettings as any)[item.key] = item.value || '';
            }
          });
        } else if (typeof data === 'object' && data !== null) {
          Object.keys(data).forEach((key) => {
            if (key in newSettings) {
              (newSettings as any)[key] = data[key] || '';
            }
          });
        }
        
        setSettings(newSettings);
      } catch (err: any) {
        console.error(err);
        toast.error('Gagal memuat pengaturan sistem');
      } finally {
        setIsFetching(false);
      }
    };
    
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'color' | 'white' | 'icon') => {
      if (!e.target.files || e.target.files.length === 0) return;
      let file = e.target.files[0];

      if (!file.type.startsWith('image/')) {
        toast.error('File harus berupa gambar');
        return;
      }

      try {
        file = await convertToWebP(file);
      } catch (err) {
        console.error('WebP conversion failed', err);
        toast.error('Gagal memproses gambar');
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        toast.error('Setelah dikonversi, ukuran gambar masih lebih dari 2MB. Silakan pilih gambar dengan resolusi lebih kecil.');
        return;
      }
    const formData = new FormData();
    formData.append('logo', file);
    formData.append('type', type);
    
    const toastId = toast.loading(`Mengunggah logo ${type === 'icon' ? 'ikon' : (type === 'white' ? 'putih' : 'warna')}...`);
    try {
      const res = await api.post('/settings/logo', formData);
      const updatedSettings = res.data.data;
      setSettings(prev => ({ 
        ...prev, 
        site_logo: updatedSettings.site_logo || prev.site_logo,
        site_logo_white: updatedSettings.site_logo_white || prev.site_logo_white,
        site_icon: updatedSettings.site_icon || prev.site_icon
      }));
      toast.success('Logo berhasil diunggah', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengunggah logo', { id: toastId });
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0) return;
      let file = e.target.files[0];

      if (!file.type.startsWith('image/')) {
        toast.error('File harus berupa gambar');
        return;
      }

      try {
        file = await convertToWebP(file);
      } catch (err) {
        console.error('WebP conversion failed', err);
        toast.error('Gagal memproses gambar');
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        toast.error('Setelah dikonversi, ukuran gambar masih lebih dari 2MB. Silakan pilih gambar dengan resolusi lebih kecil.');
        return;
      }
    const formData = new FormData();
    formData.append('logo', file);
    formData.append('type', 'chairman_photo');
    
    const toastId = toast.loading('Mengunggah foto...');
    try {
      const res = await api.post('/settings/logo', formData);
      const updatedSettings = res.data.data;
      setSettings(prev => ({ 
        ...prev, 
        chairman_photo: updatedSettings.chairman_photo || prev.chairman_photo
      }));
      toast.success('Foto berhasil diunggah', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengunggah foto', { id: toastId });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const formattedSettings = Object.entries(settings).map(([key, value]) => ({
        key,
        value
      }));
      
      await api.put('/settings', { settings: formattedSettings });
      toast.success('Pengaturan sistem berhasil disimpan');
    } catch (error: any) {
      console.error(error);
      toast.error('Gagal menyimpan pengaturan');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#c20000]" />
        <p className="font-medium">Memuat konfigurasi sistem...</p>
      </div>
    );
  }

  const inputClass = "w-full bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:border-[#c20000] focus:ring-4 focus:ring-[#c20000]/10 transition-all text-sm font-medium placeholder:text-slate-400";
  const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2";

  return (
    <div className="w-full pb-20">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-200"
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/20">
          <SettingsIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Pengaturan Sistem</h1>
          <p className="text-slate-500 mt-1 font-medium">Kelola identitas utama, logo, dan kontak resmi organisasi.</p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-12">
        
        {/* Section 1: Identitas Utama */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col lg:flex-row gap-8"
        >
          <div className="lg:w-80 xl:w-96 shrink-0">
            <div>
              <div className="flex items-center gap-2 mb-2 text-slate-900">
                <Building2 className="w-5 h-5 text-[#c20000]" />
                <h2 className="text-lg font-bold">Identitas Organisasi</h2>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Informasi dasar mengenai organisasi yang akan ditampilkan di beranda, header, footer, serta pengaturan SEO pencarian Google.
              </p>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden bg-white">
              <CardContent className="p-6 sm:p-8 space-y-6">
                
                <div>
                  <label className={labelClass}>Nama Situs Web</label>
                  <input 
                    type="text" 
                    name="site_name"
                    value={settings.site_name}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Contoh: PC IMM Kota Surakarta"
                  />
                </div>

                <div>
                  <label className={labelClass}>Deskripsi Web (SEO & Meta)</label>
                  <textarea 
                    name="site_description"
                    rows={4}
                    value={settings.site_description}
                    onChange={handleChange}
                    className={`${inputClass} resize-none`}
                    placeholder="Tuliskan deskripsi singkat organisasi untuk keperluan pencarian Google..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                  <div className="p-5 rounded-xl border border-slate-100 bg-slate-50/50">
                    <label className={labelClass}>Logo Berwarna (Header/Terang)</label>
                    <div className="mt-4 flex flex-col items-center gap-4">
                      {settings.site_logo ? (
                        <div className="w-24 h-24 rounded-lg bg-white border border-slate-200 p-2 shadow-sm flex items-center justify-center">
                          <img src={`${settings.site_logo}`} alt="Logo" className="max-w-full max-h-full object-contain" />
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-lg bg-slate-100 border border-slate-200 border-dashed flex flex-col items-center justify-center text-slate-400">
                          <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
                          <span className="text-[10px] uppercase font-bold tracking-wider">Kosong</span>
                        </div>
                      )}
                      <label className="cursor-pointer group relative">
                        <input type="file" accept="image/*" onChange={(e) => handleLogoUpload(e, 'color')} className="hidden" />
                        <span className="inline-block px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 group-hover:border-slate-300 group-hover:bg-slate-50 transition-colors shadow-sm text-center">
                          Ubah Logo
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="p-5 rounded-xl border border-slate-100 bg-slate-50/50">
                    <label className={labelClass}>Logo Putih (Footer/Gelap)</label>
                    <div className="mt-4 flex flex-col items-center gap-4">
                      {settings.site_logo_white ? (
                        <div className="w-24 h-24 rounded-lg bg-slate-900 border border-slate-800 p-2 shadow-sm flex items-center justify-center relative overflow-hidden">
                          {/* Chessboard pattern to show transparency clearly */}
                          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(45deg, #808080 25%, transparent 25%), linear-gradient(-45deg, #808080 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #808080 75%), linear-gradient(-45deg, transparent 75%, #808080 75%)', backgroundSize: '10px 10px', backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px' }}></div>
                          <img src={`${settings.site_logo_white}`} alt="Logo Putih" className="max-w-full max-h-full object-contain relative z-10" />
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-lg bg-slate-900 border border-slate-800 border-dashed flex flex-col items-center justify-center text-white/40">
                          <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
                          <span className="text-[10px] uppercase font-bold tracking-wider">Kosong</span>
                        </div>
                      )}
                      <label className="cursor-pointer group relative">
                        <input type="file" accept="image/*" onChange={(e) => handleLogoUpload(e, 'white')} className="hidden" />
                        <span className="inline-block px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 group-hover:border-slate-300 group-hover:bg-slate-50 transition-colors shadow-sm text-center">
                          Ubah Logo Putih
                        </span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="p-5 rounded-xl border border-slate-100 bg-slate-50/50">
                    <label className={labelClass}>Icon Web (Favicon/Tab)</label>
                    <div className="mt-4 flex flex-col items-center gap-4">
                      {settings.site_icon ? (
                        <div className="w-24 h-24 rounded-lg bg-white border border-slate-200 p-2 shadow-sm flex items-center justify-center">
                          <img src={`${settings.site_icon}`} alt="Web Icon" className="max-w-full max-h-full object-contain" />
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-lg bg-slate-100 border border-slate-200 border-dashed flex flex-col items-center justify-center text-slate-400">
                          <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
                          <span className="text-[10px] uppercase font-bold tracking-wider">Kosong</span>
                        </div>
                      )}
                      <label className="cursor-pointer group relative">
                        <input type="file" accept="image/*" onChange={(e) => handleLogoUpload(e, 'icon')} className="hidden" />
                        <span className="inline-block px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 group-hover:border-slate-300 group-hover:bg-slate-50 transition-colors shadow-sm text-center">
                          Ubah Icon
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>
        </motion.div>

        <div className="h-px bg-slate-200 w-full"></div>

        {/* Section 2: Kontak & Sosial Media */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col lg:flex-row gap-8"
        >
          <div className="lg:w-80 xl:w-96 shrink-0">
            <div>
              <div className="flex items-center gap-2 mb-2 text-slate-900">
                <MapPin className="w-5 h-5 text-[#c20000]" />
                <h2 className="text-lg font-bold">Kontak & Lokasi</h2>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Tentukan alamat surel, nomor telepon, alamat sekretariat, dan tautan jejaring sosial untuk mempermudah komunikasi publik.
              </p>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden bg-white">
              <CardContent className="p-6 sm:p-8 space-y-6">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Email Resmi</label>
                    <input 
                      type="email" 
                      name="contact_email"
                      value={settings.contact_email}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="contoh@immsurakarta.or.id"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Nomor Telepon / WA</label>
                    <input 
                      type="text" 
                      name="contact_phone"
                      value={settings.contact_phone}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="+62 8..."
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Alamat Sekretariat</label>
                  <textarea 
                    name="address"
                    rows={3}
                    value={settings.address}
                    onChange={handleChange}
                    className={`${inputClass} resize-none`}
                    placeholder="Masukkan alamat lengkap sekretariat..."
                  />
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 mb-4">
                    <LinkIcon className="w-4 h-4 text-slate-400" />
                    <h3 className="text-sm font-bold text-slate-700">Jejaring Sosial</h3>
                  </div>
                  <div>
                    <label className={labelClass}>Instagram URL</label>
                    <div className="relative flex items-center">
                      <span className="absolute left-4 text-slate-400 font-medium select-none">instagram.com/</span>
                      <input 
                        type="text" 
                        name="social_instagram"
                        value={settings.social_instagram.replace('https://instagram.com/', '')}
                        onChange={(e) => setSettings({...settings, social_instagram: e.target.value ? `https://instagram.com/${e.target.value}` : ''})}
                        className={`${inputClass} pl-[125px]`}
                        placeholder="username"
                      />
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>
        </motion.div>

        <div className="h-px bg-slate-200 w-full"></div>

        {/* Section 3: Statistik Beranda */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col lg:flex-row gap-8"
        >
          <div className="lg:w-80 xl:w-96 shrink-0">
            <div>
              <div className="flex items-center gap-2 mb-2 text-slate-900">
                <Building2 className="w-5 h-5 text-[#c20000]" />
                <h2 className="text-lg font-bold">Statistik Beranda</h2>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Ubah nilai statistik yang tampil pada halaman utama (Kader Aktif, Komisariat, Lembaga, dll).
              </p>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden bg-white">
              <CardContent className="p-6 sm:p-8 space-y-6">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Jumlah Kader Aktif</label>
                    <input 
                      type="text" 
                      name="stat_kader"
                      value={settings.stat_kader}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Contoh: 2.000+"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Jumlah Komisariat</label>
                    <input 
                      type="text" 
                      name="stat_komisariat"
                      value={settings.stat_komisariat}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Contoh: 14"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Jumlah Lembaga</label>
                    <input 
                      type="text" 
                      name="stat_lembaga"
                      value={settings.stat_lembaga}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Contoh: 5"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Jumlah Perguruan Tinggi</label>
                    <input 
                      type="text" 
                      name="stat_universitas"
                      value={settings.stat_universitas}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Contoh: 4"
                    />
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Section 4: Sambutan Ketua Umum */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col lg:flex-row gap-8"
        >
          <div className="lg:w-80 xl:w-96 shrink-0">
            <div>
              <div className="flex items-center gap-2 mb-2 text-slate-900">
                <Building2 className="w-5 h-5 text-[#c20000]" />
                <h2 className="text-lg font-bold">Sambutan Ketua Umum</h2>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Kelola pesan sambutan dan foto Ketua Umum yang tampil pada halaman utama.
              </p>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden bg-white">
              <CardContent className="p-6 sm:p-8 space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1 p-5 rounded-xl border border-slate-100 bg-slate-50/50">
                    <label className={labelClass}>Foto Ketua Umum</label>
                    <div className="mt-4 flex flex-col items-center gap-4">
                      {settings.chairman_photo ? (
                        <div className="w-32 h-32 rounded-full bg-white border border-slate-200 p-1 shadow-sm flex items-center justify-center overflow-hidden">
                          <img src={`${settings.chairman_photo}`} alt="Foto Ketua Umum" className="w-full h-full object-cover rounded-full" />
                        </div>
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-slate-100 border border-slate-200 border-dashed flex flex-col items-center justify-center text-slate-400">
                          <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
                          <span className="text-[10px] uppercase font-bold tracking-wider">Kosong</span>
                        </div>
                      )}
                      <label className="cursor-pointer group relative mt-2">
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                        <span className="inline-block px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 group-hover:border-slate-300 group-hover:bg-slate-50 transition-colors shadow-sm text-center">
                          Ubah Foto
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className={labelClass}>Nama Ketua Umum</label>
                        <input 
                          type="text" 
                          name="chairman_name"
                          value={settings.chairman_name}
                          onChange={handleChange}
                          className={inputClass}
                          placeholder="Contoh: Fulan bin Fulan"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Periodisasi</label>
                        <input 
                          type="text" 
                          name="chairman_period"
                          value={settings.chairman_period}
                          onChange={handleChange}
                          className={inputClass}
                          placeholder="Contoh: Periode 2024 - 2025"
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Pesan Sambutan</label>
                      <textarea 
                        name="chairman_message"
                        rows={6}
                        value={settings.chairman_message}
                        onChange={handleChange}
                        className={`${inputClass} resize-none`}
                        placeholder="Masukkan pesan sambutan..."
                      />
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Section 5: Mode Maintenance */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col lg:flex-row gap-8 pb-10"
        >
          <div className="lg:w-80 xl:w-96 shrink-0">
            <div>
              <div className="flex items-center gap-2 mb-2 text-slate-900">
                <SettingsIcon className="w-5 h-5 text-[#c20000]" />
                <h2 className="text-lg font-bold">Status Sistem</h2>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Kelola status Maintenance (Perbaikan) pada website publik. Jika diaktifkan, hanya Super Admin yang bisa masuk melalui halaman login.
              </p>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden bg-white">
              <CardContent className="p-6 sm:p-8 space-y-6">
                
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Maintenance Keseluruhan (Global)</h3>
                    <p className="text-xs text-slate-500 mt-1">Aktifkan untuk memblokir seluruh halaman publik.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={settings.maintenance_mode === 'true'}
                      onChange={(e) => setSettings({...settings, maintenance_mode: e.target.checked ? 'true' : 'false'})}
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c20000]"></div>
                  </label>
                </div>

                {! (settings.maintenance_mode === 'true') && (
                  <>
                    <div className="h-px bg-slate-100 w-full my-2"></div>
                    <h3 className="font-bold text-slate-700 text-sm mb-2">Maintenance Parsial (Per Halaman)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Beranda */}
                      <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors">
                        <div>
                          <h3 className="font-bold text-slate-800 text-sm">Halaman Beranda</h3>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={settings.maintenance_beranda === 'true'}
                            onChange={(e) => setSettings({...settings, maintenance_beranda: e.target.checked ? 'true' : 'false'})}
                          />
                          <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                        </label>
                      </div>

                      {/* Profil */}
                      <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors">
                        <div>
                          <h3 className="font-bold text-slate-800 text-sm">Halaman Profil</h3>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={settings.maintenance_profil === 'true'}
                            onChange={(e) => setSettings({...settings, maintenance_profil: e.target.checked ? 'true' : 'false'})}
                          />
                          <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                        </label>
                      </div>

                      {/* Berita */}
                      <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors">
                        <div>
                          <h3 className="font-bold text-slate-800 text-sm">Halaman Berita</h3>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={settings.maintenance_berita === 'true'}
                            onChange={(e) => setSettings({...settings, maintenance_berita: e.target.checked ? 'true' : 'false'})}
                          />
                          <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                        </label>
                      </div>

                      {/* Agenda */}
                      <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors">
                        <div>
                          <h3 className="font-bold text-slate-800 text-sm">Halaman Agenda</h3>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={settings.maintenance_agenda === 'true'}
                            onChange={(e) => setSettings({...settings, maintenance_agenda: e.target.checked ? 'true' : 'false'})}
                          />
                          <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                        </label>
                      </div>

                      {/* Dokumen */}
                      <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors">
                        <div>
                          <h3 className="font-bold text-slate-800 text-sm">Halaman Dokumen</h3>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={settings.maintenance_dokumen === 'true'}
                            onChange={(e) => setSettings({...settings, maintenance_dokumen: e.target.checked ? 'true' : 'false'})}
                          />
                          <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                        </label>
                      </div>

                      {/* Kontak */}
                      <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors">
                        <div>
                          <h3 className="font-bold text-slate-800 text-sm">Halaman Kontak</h3>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={settings.maintenance_kontak === 'true'}
                            onChange={(e) => setSettings({...settings, maintenance_kontak: e.target.checked ? 'true' : 'false'})}
                          />
                          <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                        </label>
                      </div>

                      {/* Shortlink */}
                      <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors">
                        <div>
                          <h3 className="font-bold text-slate-800 text-sm">Halaman Shortlink</h3>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={settings.maintenance_shortlink === 'true'}
                            onChange={(e) => setSettings({...settings, maintenance_shortlink: e.target.checked ? 'true' : 'false'})}
                          />
                          <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                        </label>
                      </div>

                    </div>
                  </>
                )}

              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Floating Save Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="fixed bottom-8 right-8 z-40"
        >
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="bg-[#c20000] hover:bg-[#a30000] text-white rounded-full px-8 py-6 shadow-xl shadow-[#c20000]/30 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#c20000]/40 text-base font-bold flex items-center gap-3"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </motion.div>

      </form>
    </div>
  );
}
