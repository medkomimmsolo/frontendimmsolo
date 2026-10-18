'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import {
  Save,
  Loader2,
  MapPin,
  Link as LinkIcon,
  Building2,
  ChartNoAxesColumnIncreasing,
  UserRound,
  ShieldCheck,
  Globe2,
  Home,
  Newspaper,
  CalendarDays,
  FileText,
  Link2,
  ClipboardList,
  Camera,
  UserPlus,
  type LucideIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getUserFacingErrorMessage } from '@/lib/errorMessage';
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
    maintenance_links: 'false',
    maintenance_form: 'false',
    maintenance_presensi: 'false',
    maintenance_ajukan_akun: 'false',
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
        toast.error(getUserFacingErrorMessage(err, 'Gagal memuat pengaturan sistem'));
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
        if (type === 'icon') {
          window.dispatchEvent(new CustomEvent('site-icon-updated', { detail: null }));
        }
        toast.success('Gambar dihapus');
      } catch (error) {
        toast.error(getUserFacingErrorMessage(error, 'Gagal menghapus gambar'));
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
      if (type === 'icon') {
        window.dispatchEvent(new CustomEvent('site-icon-updated', { detail: updatedSettings.site_icon ?? null }));
      }
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
      toast.error(getUserFacingErrorMessage(error, 'Gagal menyimpan pengaturan'));
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

  const inputClass = "w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-[#c20000] focus:ring-2 focus:ring-[#c20000]/20 transition-all text-sm font-medium placeholder:text-slate-400 shadow-2xs";
  const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2";
  const maintenanceModuleOptions: {
    key: keyof typeof settings;
    label: string;
    description: string;
    icon: LucideIcon;
  }[] = [
    { key: 'maintenance_beranda', label: 'Beranda', description: 'Halaman utama website.', icon: Home },
    { key: 'maintenance_profil', label: 'Profil organisasi', description: 'Tentang, sejarah, struktur, dan lembaga.', icon: Building2 },
    { key: 'maintenance_berita', label: 'Berita', description: 'Daftar berita dan halaman detail artikel.', icon: Newspaper },
    { key: 'maintenance_agenda', label: 'Agenda kegiatan', description: 'Daftar agenda dan halaman detail kegiatan.', icon: CalendarDays },
    { key: 'maintenance_dokumen', label: 'Dokumen & berkas', description: 'Pusat dokumen dan halaman detail berkas.', icon: FileText },
    { key: 'maintenance_kontak', label: 'Kontak', description: 'Halaman kontak dan formulir pesan.', icon: MapPin },
    { key: 'maintenance_shortlink', label: 'Shortlink', description: 'Pengajuan shortlink dan tautan pendek aktif.', icon: LinkIcon },
    { key: 'maintenance_links', label: 'Halaman tautan', description: 'Direktori tautan dan halaman Linktree.', icon: Link2 },
    { key: 'maintenance_form', label: 'Formulir & pantau respons', description: 'Daftar formulir, pengisian publik, dan pemantauan respons.', icon: ClipboardList },
    { key: 'maintenance_presensi', label: 'Presensi & kamera', description: 'Form presensi publik dan akses kamera sesi.', icon: Camera },
    { key: 'maintenance_ajukan_akun', label: 'Pengajuan akun', description: 'Formulir permintaan akun pengelola.', icon: UserPlus },
  ];
  const enabledMaintenanceModules = maintenanceModuleOptions.filter(
    ({ key }) => settings[key] === 'true',
  ).length;

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

      <nav
        aria-label="Navigasi bagian pengaturan"
        className="mb-8 flex gap-2 overflow-x-auto rounded-2xl border border-slate-200/90 bg-white p-2 shadow-2xs"
      >
        {[
          { id: 'identitas', label: 'Identitas', icon: Globe2 },
          { id: 'kontak', label: 'Kontak & Sosial', icon: MapPin },
          { id: 'statistik', label: 'Statistik', icon: ChartNoAxesColumnIncreasing },
          { id: 'sambutan', label: 'Sambutan Ketua', icon: UserRound },
          { id: 'status-sistem', label: 'Status Sistem', icon: ShieldCheck },
        ].map(({ id, label, icon: Icon }) => (
          <a
            key={id}
            href={`#${id}`}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-red-50 hover:text-[#c20000] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c20000]/30"
          >
            <Icon className="h-4 w-4" />
            {label}
          </a>
        ))}
      </nav>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Identitas Utama */}
        <section id="identitas" className="flex scroll-mt-6 flex-col gap-4 lg:flex-row lg:gap-8">
          <div className="shrink-0 lg:w-64 lg:pt-5 xl:w-72">
            <div>
              <div className="mb-2 flex items-center gap-3 text-slate-900">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-[#c20000]">
                  <Building2 className="h-5 w-5" />
                </span>
                <h2 className="text-base font-bold sm:text-lg">Identitas Organisasi</h2>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Informasi dasar mengenai organisasi yang akan ditampilkan di beranda, header, footer, serta pengaturan SEO pencarian Google.
              </p>
            </div>
          </div>
          
          <div className="min-w-0 flex-1">
            <Card className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
              <CardContent className="space-y-6 p-5 sm:p-7">
                
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
                  <div className="p-5 rounded-xl border border-slate-200/80 bg-slate-50/60">
                    <ImageUploadPicker
                      label="Logo Berwarna (Header/Terang)"
                      value={settings.site_logo}
                      onChange={(val) => handleLogoChange(val, 'color')}
                      aspectRatio="square"
                      allowedFolder="logos"
                      description="Logo standar IMM Surakarta untuk background terang."
                    />
                  </div>

                  <div className="p-5 rounded-xl border border-slate-200/80 bg-slate-50/60">
                    <ImageUploadPicker
                      label="Logo Putih (Footer/Gelap)"
                      value={settings.site_logo_white}
                      onChange={(val) => handleLogoChange(val, 'white')}
                      aspectRatio="square"
                      allowedFolder="logos"
                      description="Logo versi monokrom putih untuk footer atau latar gelap."
                    />
                  </div>
                  
                  <div className="p-5 rounded-xl border border-slate-200/80 bg-slate-50/60">
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
        </section>

        {/* Section 2: Kontak & Sosial Media */}
        <section id="kontak" className="flex scroll-mt-6 flex-col gap-4 lg:flex-row lg:gap-8">
          <div className="shrink-0 lg:w-64 lg:pt-5 xl:w-72">
            <div>
              <div className="mb-2 flex items-center gap-3 text-slate-900">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-[#c20000]">
                  <MapPin className="h-5 w-5" />
                </span>
                <h2 className="text-base font-bold sm:text-lg">Kontak & Lokasi</h2>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Tentukan alamat surel, nomor telepon, alamat sekretariat, dan tautan jejaring sosial untuk mempermudah komunikasi publik.
              </p>
            </div>
          </div>
          
          <div className="min-w-0 flex-1">
            <Card className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
              <CardContent className="space-y-6 p-5 sm:p-7">
                
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
        </section>

        {/* Section 3: Statistik Beranda */}
        <section id="statistik" className="flex scroll-mt-6 flex-col gap-4 lg:flex-row lg:gap-8">
          <div className="shrink-0 lg:w-64 lg:pt-5 xl:w-72">
            <div>
              <div className="mb-2 flex items-center gap-3 text-slate-900">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-[#c20000]">
                  <ChartNoAxesColumnIncreasing className="h-5 w-5" />
                </span>
                <h2 className="text-base font-bold sm:text-lg">Statistik Beranda</h2>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Ubah nilai statistik yang tampil pada halaman utama (Kader Aktif, Komisariat, Lembaga, dll).
              </p>
            </div>
          </div>
          
          <div className="min-w-0 flex-1">
            <Card className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
              <CardContent className="space-y-6 p-5 sm:p-7">
                
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
        </section>

        {/* Section 4: Sambutan Ketua Umum */}
        <section id="sambutan" className="flex scroll-mt-6 flex-col gap-4 lg:flex-row lg:gap-8">
          <div className="shrink-0 lg:w-64 lg:pt-5 xl:w-72">
            <div>
              <div className="mb-2 flex items-center gap-3 text-slate-900">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-[#c20000]">
                  <UserRound className="h-5 w-5" />
                </span>
                <h2 className="text-base font-bold sm:text-lg">Sambutan Ketua Umum</h2>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Kelola pesan sambutan dan foto Ketua Umum yang tampil pada halaman utama.
              </p>
            </div>
          </div>
          
          <div className="min-w-0 flex-1">
            <Card className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
              <CardContent className="space-y-6 p-5 sm:p-7">
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1 p-5 rounded-xl border border-slate-200/80 bg-slate-50/60">
                    <ImageUploadPicker
                      label="Foto Ketua Umum"
                      value={settings.chairman_photo}
                      onChange={(val) => handleLogoChange(val, 'chairman_photo')}
                      aspectRatio="square"
                      allowedFolder="struktural"
                      description="Resolusi bebas — rasio wajib 1:1 (persegi), rasio pas tidak terpotong."
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
        </section>

        {/* Section 5: Mode Maintenance */}
        <section id="status-sistem" className="flex scroll-mt-6 flex-col gap-4 pb-4 lg:flex-row lg:gap-8">
          <div className="shrink-0 lg:w-64 lg:pt-5 xl:w-72">
            <div>
              <div className="mb-2 flex items-center gap-3 text-slate-900">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-[#c20000]">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <h2 className="text-base font-bold sm:text-lg">Status Sistem</h2>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Jadwalkan penutupan sementara seluruh situs atau pilih modul publik yang sedang diperbaiki.
              </p>
            </div>
          </div>
          
          <div className="min-w-0 flex-1">
            <Card className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
              <CardContent className="space-y-6 p-5 sm:p-7">
                
                <div className={`flex items-center justify-between gap-4 rounded-xl border p-4 transition-colors ${settings.maintenance_mode === 'true' ? 'border-red-200 bg-red-50/70' : 'border-slate-200/80 bg-slate-50/60'}`}>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">Mode maintenance global</h3>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${settings.maintenance_mode === 'true' ? 'bg-red-100 text-[#a30000]' : 'bg-emerald-50 text-emerald-700'}`}>
                        {settings.maintenance_mode === 'true' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">Saat aktif, seluruh halaman publik dialihkan ke halaman perbaikan dan hanya Super Admin yang dapat masuk.</p>
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

                <div className="h-px bg-slate-100 w-full my-2"></div>
                    <div className="flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Maintenance per modul</h3>
                        <p className="mt-1 text-xs text-slate-500">Atur modul satu per satu tanpa menutup bagian website lainnya.</p>
                      </div>
                      <span className="w-fit rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                        {enabledMaintenanceModules} dari {maintenanceModuleOptions.length} modul aktif
                      </span>
                    </div>
                    {settings.maintenance_mode === 'true' && (
                      <p className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-xs leading-relaxed text-amber-800">
                        Mode global sedang aktif. Sakelar modul tetap dapat diatur, tetapi halaman publik baru tersedia kembali setelah mode global dinonaktifkan.
                      </p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Beranda */}
                      <div className="flex items-center justify-between p-4 border border-slate-200/80 rounded-xl bg-white hover:bg-slate-50 transition-colors shadow-2xs">
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
                      <div className="flex items-center justify-between p-4 border border-slate-200/80 rounded-xl bg-white hover:bg-slate-50 transition-colors shadow-2xs">
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
                      <div className="flex items-center justify-between p-4 border border-slate-200/80 rounded-xl bg-white hover:bg-slate-50 transition-colors shadow-2xs">
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
                      <div className="flex items-center justify-between p-4 border border-slate-200/80 rounded-xl bg-white hover:bg-slate-50 transition-colors shadow-2xs">
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
                      <div className="flex items-center justify-between p-4 border border-slate-200/80 rounded-xl bg-white hover:bg-slate-50 transition-colors shadow-2xs">
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
                      <div className="flex items-center justify-between p-4 border border-slate-200/80 rounded-xl bg-white hover:bg-slate-50 transition-colors shadow-2xs">
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
                      <div className="flex items-center justify-between p-4 border border-slate-200/80 rounded-xl bg-white hover:bg-slate-50 transition-colors shadow-2xs">
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

                      {maintenanceModuleOptions
                        .filter(({ key }) => ['maintenance_links', 'maintenance_form', 'maintenance_presensi', 'maintenance_ajukan_akun'].includes(key))
                        .map(({ key, label, description, icon: Icon }) => {
                          const enabled = settings[key] === 'true';
                          return (
                            <label
                              key={key}
                              className={`flex min-h-[92px] cursor-pointer items-start justify-between gap-3 rounded-xl border p-4 transition-colors ${enabled ? 'border-orange-200 bg-orange-50/50' : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/70'}`}
                            >
                              <span className="flex min-w-0 items-start gap-3">
                                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${enabled ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'}`}>
                                  <Icon className="h-4 w-4" />
                                </span>
                                <span className="min-w-0">
                                  <span className="block text-sm font-semibold text-slate-800">{label}</span>
                                  <span className="mt-1 block text-xs leading-relaxed text-slate-500">{description}</span>
                                  <span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${enabled ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-500'}`}>
                                    {enabled ? 'Maintenance aktif' : 'Tersedia'}
                                  </span>
                                </span>
                              </span>
                              <span className="relative mt-1 inline-flex shrink-0">
                                <input
                                  type="checkbox"
                                  className="peer sr-only"
                                  checked={enabled}
                                  onChange={(e) => setSettings((prev) => ({ ...prev, [key]: e.target.checked ? 'true' : 'false' }))}
                                />
                                <span className="h-6 w-11 rounded-full bg-slate-300 transition-colors peer-checked:bg-orange-500 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#c20000] after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-transform peer-checked:after:translate-x-5 peer-checked:after:border-white" />
                              </span>
                            </label>
                          );
                        })}

                    </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <div className="flex justify-end border-t border-slate-200 pt-5">
          <Button
            type="submit"
            disabled={isLoading}
            className="h-11 w-full rounded-xl bg-[#c20000] px-6 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#a30000] disabled:opacity-50 sm:w-auto"
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Simpan Semua Pengaturan
          </Button>
        </div>
      </form>
    </div>
  );
}
