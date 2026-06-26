'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Save, Loader2, User as UserIcon, Lock, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';

export default function ProfileSettings() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/me');
        const user = response.data.data;
        setProfile({
          name: user.name || '',
          email: user.email || '',
          password: '',
          password_confirmation: '',
        });
      } catch (err: any) {
        console.error(err);
        toast.error('Gagal memuat profil pengguna');
      } finally {
        setIsFetching(false);
      }
    };
    
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (profile.password && profile.password !== profile.password_confirmation) {
      toast.error('Konfirmasi password tidak cocok');
      setIsLoading(false);
      return;
    }
    
    try {
      await api.put('/profile', {
        name: profile.name,
        email: profile.email,
        password: profile.password || undefined,
        password_confirmation: profile.password_confirmation || undefined,
      });
      
      toast.success('Profil berhasil diperbarui');
      
      // Clear password fields after successful update
      setProfile(prev => ({
        ...prev,
        password: '',
        password_confirmation: '',
      }));
      
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || 'Gagal memperbarui profil';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#c20000]" />
        <p className="font-medium">Memuat data profil...</p>
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
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#c20000] to-red-900 flex items-center justify-center shadow-lg shadow-red-900/20">
          <UserIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Pengaturan Profil</h1>
          <p className="text-slate-500 mt-1 font-medium">Kelola informasi akun Anda seperti nama, email, dan kata sandi.</p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-12 max-w-4xl">
        
        {/* Section 1: Data Diri */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row gap-8"
        >
          <div className="md:w-72 shrink-0">
            <div>
              <div className="flex items-center gap-2 mb-2 text-slate-900">
                <Mail className="w-5 h-5 text-[#c20000]" />
                <h2 className="text-lg font-bold">Data Pribadi</h2>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Informasi identitas dan kontak akun yang Anda gunakan untuk masuk ke panel admin ini.
              </p>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden bg-white">
              <CardContent className="p-6 sm:p-8 space-y-6">
                
                <div>
                  <label className={labelClass}>Nama Lengkap</label>
                  <input 
                    type="text" 
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Nama Anda"
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Alamat Email</label>
                  <input 
                    type="email" 
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="email@contoh.com"
                    required
                  />
                </div>

              </CardContent>
            </Card>
          </div>
        </motion.div>

        <div className="h-px bg-slate-200 w-full"></div>

        {/* Section 2: Keamanan */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col md:flex-row gap-8"
        >
          <div className="md:w-72 shrink-0">
            <div>
              <div className="flex items-center gap-2 mb-2 text-slate-900">
                <Lock className="w-5 h-5 text-[#c20000]" />
                <h2 className="text-lg font-bold">Keamanan</h2>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Ubah kata sandi akun Anda. Kosongkan jika Anda tidak ingin mengubahnya.
              </p>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden bg-white">
              <CardContent className="p-6 sm:p-8 space-y-6">
                
                <div>
                  <label className={labelClass}>Kata Sandi Baru</label>
                  <input 
                    type="password" 
                    name="password"
                    value={profile.password}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Biarkan kosong jika tidak diubah"
                  />
                </div>

                <div>
                  <label className={labelClass}>Konfirmasi Kata Sandi Baru</label>
                  <input 
                    type="password" 
                    name="password_confirmation"
                    value={profile.password_confirmation}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Ketik ulang kata sandi baru"
                  />
                </div>

              </CardContent>
            </Card>
          </div>
        </motion.div>

        <div className="pt-6 flex justify-end">
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="bg-[#c20000] hover:bg-[#a30000] text-white rounded-xl px-8 py-6 shadow-xl shadow-[#c20000]/20 transition-all text-base font-bold flex items-center gap-3 w-full sm:w-auto"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {isLoading ? 'Menyimpan...' : 'Simpan Profil'}
          </Button>
        </div>

      </form>
    </div>
  );
}
