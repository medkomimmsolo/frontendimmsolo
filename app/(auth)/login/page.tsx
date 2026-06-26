'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Loader2, ArrowLeft, Mail, Lock, ShieldCheck, Eye, EyeOff, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'motion/react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [siteLogo, setSiteLogo] = useState<string | null>(null);
  const [siteLogoWhite, setSiteLogoWhite] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`);
        const data = await response.json();
        if (data.success && data.data) {
          if (data.data.site_logo) setSiteLogo(data.data.site_logo);
          if (data.data.site_logo_white) setSiteLogoWhite(data.data.site_logo_white);
          else if (data.data.site_logo) setSiteLogoWhite(data.data.site_logo);
        }
      } catch (e) {
        console.error('Failed to fetch site settings', e);
      }
    };
    fetchSettings();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await api.post('/login', { email, password });

      if (response.data.success) {
        localStorage.setItem('auth_token', response.data.data.token);
        toast.success('Login berhasil!');
        setTimeout(() => {
          router.push('/dashboard');
        }, 500);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const msg = error.response?.data?.message || 'Login gagal. Periksa kembali email dan password Anda.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans selection:bg-[#c20000]/20 selection:text-[#c20000]">
      
      {/* LEFT PANEL - BRANDING (Dark Mode) */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-[#0f172a] flex-col justify-between p-14 overflow-hidden border-r border-slate-800">
        
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]"></div>
          {/* Glowing Orbs */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#c20000]/20 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#0f172a] shadow-[inset_0_0_150px_rgba(194,0,0,0.1)] rounded-full translate-x-1/3 translate-y-1/3"></div>
        </div>

        {/* Top Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            {siteLogoWhite ? (
              <img src={`${siteLogoWhite}`} alt="PC IMM Logo" className="h-12 w-auto object-contain transition-transform group-hover:scale-105" />
            ) : (
              <div className="w-12 h-12 rounded-sm bg-[#c20000] flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-[#c20000]/20 group-hover:bg-[#a30000] transition-colors">
                I
              </div>
            )}
          </Link>
        </div>

        {/* Center Content */}
        <div className="relative z-10 w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-[#c20000]" />
              <span className="text-white/80 font-medium text-xs tracking-wide">Sistem Informasi Terpusat</span>
            </div>
            
            <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-[1.15]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
              Manajemen Data<br />
              & <span className="text-[#c20000]">Publikasi Digital</span>
            </h1>
            
            <p className="text-lg text-white/80 leading-relaxed font-light mb-12">
              Portal khusus pengurus untuk mengelola konten, agenda, dan struktur organisasi Pimpinan Cabang Ikatan Mahasiswa Muhammadiyah Kota Surakarta.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-white/90">
                <div className="w-10 h-10 rounded-sm bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                  <svg className="w-5 h-5 text-[#c20000]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                </div>
                <span className="font-medium">Kelola Publikasi & Artikel</span>
              </div>
              <div className="flex items-center gap-4 text-white/90">
                <div className="w-10 h-10 rounded-sm bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                  <svg className="w-5 h-5 text-[#c20000]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <span className="font-medium">Manajemen Agenda & Event</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Tagline */}
        <div className="relative z-10">
          <p className="text-white/60 text-sm font-medium">
            © {new Date().getFullYear()} PC IMM Kota Surakarta.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL - LOGIN FORM (Light Mode) */}
      <div className="w-full lg:w-[55%] bg-white flex flex-col justify-center items-center px-6 py-12 relative">
        
        <Link href="/" className="absolute top-8 left-8 sm:top-12 sm:left-12 text-slate-500 hover:text-[#c20000] flex items-center gap-2 font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Kembali</span>
        </Link>
        
        <div className="w-full max-w-[400px]">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Mobile Logo Only */}
            <div className="lg:hidden flex justify-center mb-8">
              {siteLogo ? (
                <img src={`${siteLogo}`} alt="PC IMM Logo" className="h-14 w-auto object-contain" />
              ) : (
                <div className="w-14 h-14 rounded-sm bg-[#c20000] flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-[#c20000]/20">
                  I
                </div>
              )}
            </div>

            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
                Selamat Datang
              </h2>
              <p className="text-slate-500 text-base">Silakan masuk ke akun Anda</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              
              {/* Pesan Error Inline untuk visibilitas status yang lebih baik (HCI) */}
              {errorMessage && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-sm flex items-start gap-3 text-sm font-medium"
                >
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </motion.div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-[#c20000] transition-colors" />
                  </div>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-sm pl-12 pr-4 py-3.5 text-slate-900 placeholder:text-slate-400/60 placeholder:font-normal focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] transition-all font-medium shadow-sm"
                    placeholder="admin@immsurakarta.org"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-[#c20000] transition-colors" />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-sm pl-12 pr-12 py-3.5 text-slate-900 placeholder:text-slate-400/60 placeholder:font-normal focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] transition-all font-medium shadow-sm"
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" className="peer w-4 h-4 rounded-sm border-slate-300 text-[#c20000] focus:ring-[#c20000] transition-all cursor-pointer bg-white" />
                  </div>
                  <span className="text-sm text-slate-600 font-medium group-hover:text-slate-900 transition-colors">Ingat Perangkat Ini</span>
                </label>
                <button type="button" className="text-sm font-bold text-[#c20000] hover:text-[#a30000] transition-colors">
                  Lupa Password?
                </button>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-bold shadow-md shadow-red-500/10 hover:shadow-lg hover:shadow-red-500/20 transition-all rounded-sm mt-4"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Memverifikasi...
                  </>
                ) : (
                  'Masuk ke Sistem'
                )}
              </Button>
            </form>

          </motion.div>
        </div>
      </div>

    </div>
  );
}
