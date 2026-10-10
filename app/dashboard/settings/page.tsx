'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Save, Loader2, Settings as SettingsIcon, Image as ImageIcon, MapPin, Link as LinkIcon, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { convertToWebP } from '@/lib/imageUtils';
import ImageUploadPicker from '@/components/dashboard/ImageUploadPicker';
import { PageHeader } from '@/components/ui/PageHeader';

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
    shortlink_admin_wa: '',
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

  const handleLogoChange = async (fileOrUrl: File | string | null, type: 'color' | 'white' | 'icon' | 'chairman_photo') => {
    const settingKey = type === 'white' ? 'site_logo_white' : type === 'icon' ? 'site_icon' : type === 'chairman_photo' ? 'chairman_photo' : 'site_logo';
    
    if (!fileOrUrl) {
      setSettings(prev => ({ ...prev, [settingKey]: '' }));
      try {
        await api.post('/settings', { settings: [{ key: settingKey, value: '' }] });
        toast.success('Gambar dihapus');
      } catch {
        toast.error('Gagal menghapus gambar');
      }
      return;
    }

    const formData = new FormData();
    formData.append('logo', fileOrUrl);
    formData.append('type', type);

    const toastId = toast.loading('Menyimpan gambar...');
    try {
      const res = await api.post('/settings/logo', formData);
      const updatedSettings = res.data.data;
      setSettings(prev => ({ 
        ...prev, 
        site_logo: updatedSettings.site_logo ?? prev.site_logo,
        site_logo_white: updatedSettings.site_logo_white ?? prev.site_logo_white,
        site_icon: updatedSettings.site_icon ?? prev.site_icon,
        chairman_photo: updatedSettings.chairman_photo ?? prev.chairman_photo,
      }));
      toast.success('Gambar berhasil diperbarui', { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Gagal memperbarui gambar', { id: toastId });
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

  const inputClass = "w-full bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-sm px-4 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:border-[#c20000] focus:ring-4 focus:ring-[#c20000]/10 transition-all text-sm font-medium placeholder:text-slate-400";
  const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2";

  return (
    <div className="w-full pb-20">
      {/* Modern Page Header */}
      <PageHeader
        title="Pengaturan Sistem"
        description="Kelola identitas utama, logo portal, meta SEO, dan kontak resmi PC IMM Kota Surakarta"
        badge="Konfigurasi"
      >
        <Button 
          type="button" 
          onClick={handleSubmit} 
          disabled={isLoading}
          className="h-10 px-5 bg-[#c20000] hover:bg-[#a30000] text-white rounded-xl text-xs font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Save className="w-4 h-4 mr-1.5" />}
          Simpan Perubahan
        </Button>
      </PageHeader>

      <form onSubmit={handleSubmit} className="space-y-12">
        
        {/* Section 1: Identitas Utama */}
        <div 
         
         
         
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
            <Card className="rounded-sm border-slate-200 shadow-sm overflow-hidden bg-white">
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
                  <div className="p-5 rounded-sm border border-slate-100 bg-slate-50/50">
                    <ImageUploadPicker
                      label="Logo Berwarna (Header/Terang)"
                      value={settings.site_logo}
                      onChange={(val) => handleLogoChange(val, 'color')}
                      aspectRatio="square"
                      allowedFolder="logos"
                      description="Logo standar IMM Surakarta untuk background terang."
                    />
                  </div>

                  <div className="p-5 rounded-sm border border-slate-100 bg-slate-50/50">
                    <ImageUploadPicker
                      label="Logo Putih (Footer/Gelap)"
                      value={settings.site_logo_white}
                      onChange={(val) => handleLogoChange(val, 'white')}
                      aspectRatio="square"
                      allowedFolder="logos"
                      description="Logo versi monokrom putih untuk footer atau latar gelap."
                    />
                  </div>
                  
                  <div className="p-5 rounded-sm border border-slate-100 bg-slate-50/50">
                    <ImageUploadPicker
                      label="Icon Web (Favicon)"
                      value={settings.site_icon}
                      onChange={(val) => handleLogoChange(val, 'icon')}
                      aspectRatio="square"
                      allowedFolder="logos"
                      description="Icon logo kecil untuk favicon tab browser."
                    />
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>
        </div>

        <div className="h-px bg-slate-200 w-full"></div>

        {/* Section 2: Kontak & Sosial Media */}
        <div 
         
         
         
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
            <Card className="rounded-sm border-slate-200 shadow-sm overflow-hidden bg-white">
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
                  <label className={labelClass}>Nomor WhatsApp Admin Shortlink</label>
                  <input 
                    type="text" 
                    name="shortlink_admin_wa"
                    pattern="62[0-9]{8,13}"
                    title="Format: 628xxxxxxxxxx"
                    value={settings.shortlink_admin_wa}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="628xxxxxxxxxx"
                  />
                  <p className="text-xs text-slate-400 mt-1">Nomor tujuan pengajuan token shortlink dari halaman publik (format: 628...).</p>
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
        </div>

        <div className="h-px bg-slate-200 w-full"></div>

        {/* Section 3: Statistik Beranda */}
        <div 
         
         
         
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
            <Card className="rounded-sm border-slate-200 shadow-sm overflow-hidden bg-white">
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
        </div>

        {/* Section 4: Sambutan Ketua Umum */}
        <div 
         
         
         
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
            <Card className="rounded-sm border-slate-200 shadow-sm overflow-hidden bg-white">
              <CardContent className="p-6 sm:p-8 space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1 p-5 rounded-sm border border-slate-100 bg-slate-50/50">
                    <ImageUploadPicker
                      label="Foto Ketua Umum"
                      value={settings.chairman_photo}
                      onChange={(val) => handleLogoChange(val, 'chairman_photo')}
                      aspectRatio="square"
                      allowedFolder="struktural"
                      description="Foto resmi Ketua Umum (rasio 1:1 persegi)."
                    />
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
        </div>

        {/* Section 5: Mode Maintenance */}
        <div 
         
         
         
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
            <Card className="rounded-sm border-slate-200 shadow-sm overflow-hidden bg-white">
              <CardContent className="p-6 sm:p-8 space-y-6">
                
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-sm bg-slate-50">
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
                      <div className="flex items-center justify-between p-4 border border-slate-200 rounded-sm bg-white hover:bg-slate-50 transition-colors">
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
                      <div className="flex items-center justify-between p-4 border border-slate-200 rounded-sm bg-white hover:bg-slate-50 transition-colors">
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
                      <div className="flex items-center justify-between p-4 border border-slate-200 rounded-sm bg-white hover:bg-slate-50 transition-colors">
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
                      <div className="flex items-center justify-between p-4 border border-slate-200 rounded-sm bg-white hover:bg-slate-50 transition-colors">
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
                      <div className="flex items-center justify-between p-4 border border-slate-200 rounded-sm bg-white hover:bg-slate-50 transition-colors">
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
                      <div className="flex items-center justify-between p-4 border border-slate-200 rounded-sm bg-white hover:bg-slate-50 transition-colors">
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
                      <div className="flex items-center justify-between p-4 border border-slate-200 rounded-sm bg-white hover:bg-slate-50 transition-colors">
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
        </div>

      </form>
    </div>
  );
}
