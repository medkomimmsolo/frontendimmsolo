'use client';

import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { LinkIcon, Loader2, ArrowRight, ShieldCheck, CheckCircle2, Copy, Key, Search, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PengajuanShortlink() {
  const [activeTab, setActiveTab] = useState<'pengajuan' | 'aktivasi' | 'status'>('pengajuan');
  
  // Pengajuan State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    slug: '',
    target_url: '',
    phone_number: '',
  });

  // Aktivasi State
  const [isActivating, setIsActivating] = useState(false);
  const [activationData, setActivationData] = useState({
    slug: '',
    phone_number: '',
    token: ''
  });

  // Check Status State
  const [isChecking, setIsChecking] = useState(false);
  const [statusQuery, setStatusQuery] = useState('');
  const [statusResult, setStatusResult] = useState<any>(null);

  const generateSlug = () => {
    const randomString = Math.random().toString(36).substring(2, 8);
    setFormData({ ...formData, slug: randomString });
  };

  const copyToClipboard = () => {
    const text = `immsolo.or.id/${formData.slug}`;
    navigator.clipboard.writeText(text);
    toast.success('Link disalin ke clipboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    let finalUrl = formData.target_url;
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl;
    }

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/shortlinks/public`, {
        slug: formData.slug,
        target_url: finalUrl,
        phone_number: formData.phone_number,
      });

      setIsSuccess(true);
      toast.success('Pengajuan berhasil dikirim!');

      const waNumber = '6282226252923';
      const text = `Halo Admin PC IMM Kota Surakarta,%0A%0ASaya telah mengajukan pembuatan tautan pendek (Shortlink) baru dengan rincian berikut:%0A%0A- *Tautan Akhir*: immsolo.or.id/${formData.slug}%0A- *URL Tujuan*: ${finalUrl}%0A- *No. HP Pengaju*: ${formData.phone_number}%0A%0AMohon bantuannya untuk mengecek dan memberikan token aktivasi untuk tautan tersebut. Terima kasih!`;
      
      setTimeout(() => {
        window.open(`https://wa.me/${waNumber}?text=${text}`, '_blank');
      }, 1500);

    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Terjadi kesalahan, silakan coba lagi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsActivating(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/shortlinks/activate`, activationData);
      toast.success(res.data.message);
      setActivationData({ slug: '', phone_number: '', token: '' });
      setActiveTab('status');
      setStatusQuery(activationData.slug);
      handleCheckStatus(null, activationData.slug);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengaktifkan shortlink');
    } finally {
      setIsActivating(false);
    }
  };

  const handleCheckStatus = async (e: React.FormEvent | null, specificSlug?: string) => {
    if (e) e.preventDefault();
    const slugToCheck = specificSlug || statusQuery;
    if (!slugToCheck) return;
    
    setIsChecking(true);
    setStatusResult(null);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/shortlinks/status/${slugToCheck}`);
      setStatusResult(res.data.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setStatusResult({ not_found: true });
      } else {
        toast.error('Gagal mengecek status');
      }
    } finally {
      setIsChecking(false);
    }
  };

  if (isSuccess) {
    return (
      <main className="min-h-screen bg-[#f8f9fa] pt-24 pb-20 flex flex-col items-center justify-center">
        <div className="max-w-lg w-full px-4">
          <div className="bg-white rounded-sm shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-10 text-center space-y-6">
            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#0f172a] mb-3" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>Pengajuan Berhasil!</h1>
              <p className="text-slate-600 leading-relaxed">
                Tautan pendek Anda <span className="font-bold text-[#0f172a] bg-slate-100 px-2 py-0.5 rounded-sm">immsolo.or.id/{formData.slug}</span> telah kami terima dan berstatus <span className="text-yellow-600 font-bold bg-yellow-50 px-2 py-0.5 rounded-sm">Pending</span>.
              </p>
            </div>
            
            <div className="p-5 bg-blue-50 border border-blue-100 rounded-sm text-sm text-left">
              <div className="font-bold text-blue-900 mb-1">Tindakan Selanjutnya:</div>
              <p className="text-blue-800 leading-relaxed">
                Silakan hubungi Admin untuk meminta <strong>Token Aktivasi</strong>. Setelah Anda mendapatkan Token, masukkan Token tersebut di halaman <strong>Aktivasi</strong> untuk menghidupkan tautan Anda.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Button 
                className="w-full h-14 text-base font-bold bg-[#25D366] hover:bg-[#1da851] text-white shadow-md shadow-[#25D366]/20 rounded-sm"
                onClick={() => {
                  const text = `Halo Admin PC IMM Kota Surakarta,%0A%0ASaya telah mengajukan pembuatan tautan pendek (Shortlink) baru dengan rincian berikut:%0A%0A- *Tautan Akhir*: immsolo.or.id/${formData.slug}%0A- *URL Tujuan*: ${formData.target_url}%0A- *No. HP Pengaju*: ${formData.phone_number}%0A%0AMohon bantuannya untuk mengecek dan memberikan token aktivasi untuk tautan tersebut. Terima kasih!`;
                  window.open(`https://wa.me/6282226252923?text=${text}`, '_blank');
                }}
              >
                Minta Token via WhatsApp
              </Button>

              <Button variant="outline" className="w-full h-14 rounded-sm font-semibold border-slate-200 text-slate-600 hover:bg-slate-50" onClick={() => { setIsSuccess(false); setActiveTab('aktivasi'); }}>
                Lanjut ke Halaman Aktivasi
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f9fa] pt-24 pb-20">
      
      {/* Breadcrumb & Title Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pt-4 pb-6">
        <nav aria-label="breadcrumb" className="mb-4">
          <ul className="flex items-center text-sm text-[#0f172a]/60 space-x-2">
            <li>
              <Link href="/" className="hover:text-[#c20000] transition-colors flex items-center">
                Home
              </Link>
            </li>
            <li>
              <span className="text-[#0f172a]/40 mx-1">/</span>
            </li>
            <li className="text-[#0f172a] font-medium" aria-current="page">Layanan Shortlink</li>
          </ul>
        </nav>
        <div className="flex flex-col border-b border-[#0f172a]/10 pb-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-[#0f172a]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
            Layanan Tautan Pendek (Shortlink)
          </h1>
          <p className="text-[#0f172a]/60 mt-2">
            Pemendek URL resmi menggunakan domain <span className="font-semibold text-[#c20000]">immsolo.or.id</span>.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form Column */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-sm bg-white overflow-hidden">
              
              {/* Tabs */}
              <div className="flex border-b border-slate-200 bg-slate-50">
                <button 
                  className={`flex-1 py-4 text-sm font-bold text-center transition-colors ${activeTab === 'pengajuan' ? 'bg-white text-[#c20000] border-b-2 border-[#c20000]' : 'text-slate-500 hover:text-slate-800'}`}
                  onClick={() => setActiveTab('pengajuan')}
                >
                  <ShieldCheck className="w-4 h-4 inline-block mr-2" />
                  Pengajuan Baru
                </button>
                <button 
                  className={`flex-1 py-4 text-sm font-bold text-center transition-colors ${activeTab === 'aktivasi' ? 'bg-white text-[#c20000] border-b-2 border-[#c20000]' : 'text-slate-500 hover:text-slate-800'}`}
                  onClick={() => setActiveTab('aktivasi')}
                >
                  <Key className="w-4 h-4 inline-block mr-2" />
                  Aktivasi
                </button>
                <button 
                  className={`flex-1 py-4 text-sm font-bold text-center transition-colors ${activeTab === 'status' ? 'bg-white text-[#c20000] border-b-2 border-[#c20000]' : 'text-slate-500 hover:text-slate-800'}`}
                  onClick={() => setActiveTab('status')}
                >
                  <Search className="w-4 h-4 inline-block mr-2" />
                  Cek Status
                </button>
              </div>

              <CardContent className="p-6 sm:p-10">
                
                {/* TAB: PENGAJUAN */}
                {activeTab === 'pengajuan' && (
                  <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-3">
                      <label className="flex items-center text-sm font-bold text-slate-800">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-[#c20000] mr-2 text-xs">1</span>
                        Tautan Akhir (Custom Link) <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="flex rounded-sm overflow-hidden border border-slate-200 focus-within:border-[#c20000] bg-slate-50 group">
                        <span className="flex items-center px-4 bg-slate-50 text-slate-500 font-semibold border-r border-slate-200 select-none group-focus-within:bg-red-50 group-focus-within:text-[#c20000] group-focus-within:border-[#c20000] transition-colors">
                          immsolo.or.id/
                        </span>
                        <input 
                          type="text"
                          required
                          value={formData.slug}
                          onChange={(e) => setFormData({...formData, slug: e.target.value.replace(/[^a-zA-Z0-9-_]/g, '')})}
                          placeholder="contoh: RegisPIDNAS26"
                          className="flex-1 w-full px-4 py-3 bg-transparent focus:outline-none font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal"
                        />
                        <button 
                          type="button" 
                          onClick={generateSlug}
                          className="px-5 text-sm font-bold text-[#0f172a] hover:bg-slate-200 border-l border-slate-200 group-focus-within:border-[#c20000] transition-colors"
                        >
                          Acak
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 font-medium ml-8">
                        Tidak membedakan huruf besar/kecil. Kombinasi huruf, angka, strip (-), dan garis bawah (_).
                      </p>
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center text-sm font-bold text-slate-800">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-[#c20000] mr-2 text-xs">2</span>
                        URL Tujuan / Tautan Asli <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="relative group ml-8">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <LinkIcon className="h-5 w-5 text-slate-400 group-focus-within:text-[#c20000] transition-colors" />
                        </div>
                        <input 
                          type="url"
                          required
                          value={formData.target_url}
                          onChange={(e) => setFormData({...formData, target_url: e.target.value})}
                          placeholder="https://docs.google.com/forms/d/e/..."
                          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-sm focus:outline-none focus:border-[#c20000] font-medium text-slate-900 placeholder:font-normal transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center text-sm font-bold text-slate-800">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-[#c20000] mr-2 text-xs">3</span>
                        Nomor WhatsApp Pengaju <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="ml-8">
                        <input 
                          type="tel"
                          required
                          value={formData.phone_number}
                          onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                          placeholder="Contoh: 081234567890"
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-sm focus:outline-none focus:border-[#c20000] font-medium text-slate-900 placeholder:font-normal transition-colors"
                        />
                      </div>
                    </div>

                    <div className="pt-8 border-t border-slate-100">
                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full h-14 text-base font-bold bg-[#0f172a] hover:bg-[#c20000] text-white rounded-sm shadow-md transition-colors"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                            Memproses Pengajuan...
                          </>
                        ) : (
                          <>
                            Ajukan Pembuatan Tautan
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                )}

                {/* TAB: AKTIVASI */}
                {activeTab === 'aktivasi' && (
                  <form onSubmit={handleActivate} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-sm text-sm text-blue-800 mb-6">
                      Masukkan rincian data pengajuan Anda dan <strong>Token</strong> yang telah diberikan oleh Admin untuk mengaktifkan tautan Anda.
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-800">Slug Tautan <span className="text-red-500">*</span></label>
                      <input 
                        type="text"
                        required
                        value={activationData.slug}
                        onChange={(e) => setActivationData({...activationData, slug: e.target.value.replace(/[^a-zA-Z0-9-_]/g, '')})}
                        placeholder="RegisPIDNAS26"
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-sm focus:outline-none focus:border-[#c20000] font-medium"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-800">Nomor WhatsApp Pengaju <span className="text-red-500">*</span></label>
                      <input 
                        type="tel"
                        required
                        value={activationData.phone_number}
                        onChange={(e) => setActivationData({...activationData, phone_number: e.target.value})}
                        placeholder="Sesuai saat mendaftar"
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-sm focus:outline-none focus:border-[#c20000] font-medium"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-800">Token Aktivasi <span className="text-red-500">*</span></label>
                      <input 
                        type="text"
                        required
                        value={activationData.token}
                        onChange={(e) => setActivationData({...activationData, token: e.target.value})}
                        placeholder="Contoh: A8F9K2J1"
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-sm focus:outline-none focus:border-[#c20000] font-bold text-center tracking-[0.3em] uppercase"
                      />
                    </div>

                    <div className="pt-4">
                      <Button 
                        type="submit" 
                        disabled={isActivating}
                        className="w-full h-14 text-base font-bold bg-[#c20000] hover:bg-[#a30000] text-white rounded-sm shadow-md transition-colors"
                      >
                        {isActivating ? (
                          <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                        ) : (
                          <Key className="w-5 h-5 mr-3" />
                        )}
                        Aktifkan Tautan Sekarang
                      </Button>
                    </div>
                  </form>
                )}

                {/* TAB: CEK STATUS */}
                {activeTab === 'status' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <form onSubmit={handleCheckStatus} className="flex gap-2">
                      <div className="flex-1 rounded-sm overflow-hidden border border-slate-200 focus-within:border-[#c20000] bg-white flex">
                        <span className="flex items-center px-4 bg-slate-50 text-slate-500 font-semibold border-r border-slate-200">
                          immsolo.or.id/
                        </span>
                        <input 
                          type="text"
                          required
                          value={statusQuery}
                          onChange={(e) => setStatusQuery(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
                          placeholder="Masukkan slug"
                          className="flex-1 w-full px-4 py-3 bg-transparent focus:outline-none font-semibold"
                        />
                      </div>
                      <Button 
                        type="submit" 
                        disabled={isChecking || !statusQuery}
                        className="h-auto bg-[#0f172a] hover:bg-[#c20000] px-6 rounded-sm"
                      >
                        {isChecking ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Cek'}
                      </Button>
                    </form>

                    {statusResult && (
                      <div className="mt-8 border-t border-slate-100 pt-8">
                        {statusResult.not_found ? (
                          <div className="text-center p-6 bg-red-50 rounded-sm border border-red-100">
                            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                            <h4 className="font-bold text-red-800 text-lg mb-1">Tautan Tidak Ditemukan</h4>
                            <p className="text-red-600 text-sm">Pastikan slug yang Anda masukkan sudah benar.</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-sm bg-slate-50">
                              <span className="text-sm font-bold text-slate-500">Status Aktif:</span>
                              {statusResult.is_active ? (
                                <span className="px-3 py-1 bg-green-100 text-green-700 font-bold text-sm rounded-full flex items-center gap-1.5">
                                  <CheckCircle2 className="w-4 h-4" /> AKTIF
                                </span>
                              ) : (
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 font-bold text-sm rounded-full flex items-center gap-1.5">
                                  <ShieldCheck className="w-4 h-4" /> MENUNGGU AKTIVASI
                                </span>
                              )}
                            </div>
                            
                            <div className="p-4 border border-slate-200 rounded-sm bg-slate-50">
                              <span className="text-sm font-bold text-slate-500 block mb-1">Tautan Anda:</span>
                              <div className="font-mono text-[#c20000] font-bold text-lg">immsolo.or.id/{statusResult.slug}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-sm p-8 shadow-lg shadow-slate-200/50 border border-slate-100">
              
              <div className="flex items-center gap-4 mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-sm bg-red-100 text-[#c20000] shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 text-xl" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
                  Mekanisme Layanan
                </h3>
              </div>
              
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center mt-0.5">1</div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Ajukan tautan di tab <strong>Pengajuan Baru</strong>. Tautan akan berstatus Pending.
                  </p>
                </li>
                <li className="flex gap-3">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center mt-0.5">2</div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Minta <strong>Token Aktivasi</strong> kepada Admin melalui WhatsApp.
                  </p>
                </li>
                <li className="flex gap-3">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-[#c20000]/10 text-[#c20000] font-bold text-xs flex items-center justify-center mt-0.5">3</div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Gunakan Token di tab <strong>Aktivasi</strong>. Tautan akan langsung menyala!
                  </p>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
