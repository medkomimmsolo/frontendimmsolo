'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function CreateUser() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'komisariat',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await api.post('/users', formData);
      toast.success('Pengguna berhasil ditambahkan');
      router.push('/dashboard/users');
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Gagal menyimpan pengguna');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/users">
          <Button variant="outline" size="sm" className="h-10 w-10 p-0 rounded-sm">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
            Tambah Pengguna
          </h1>
          <p className="text-[#0f172a]/70 text-sm mt-1">Buat akun untuk pengelola website.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-[#0f172a]/10 shadow-sm">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#0f172a]/90">Nama Lengkap</label>
              <input 
                type="text" 
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-white border border-[#0f172a]/10 rounded-sm px-4 py-2.5 text-[#0f172a] focus:outline-none focus:border-imm-red-500 focus:ring-1 focus:ring-imm-red-500 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#0f172a]/90">Alamat Email</label>
              <input 
                type="email" 
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-white border border-[#0f172a]/10 rounded-sm px-4 py-2.5 text-[#0f172a] focus:outline-none focus:border-imm-red-500 focus:ring-1 focus:ring-imm-red-500 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#0f172a]/90">Password</label>
              <input 
                type="password" 
                name="password"
                required
                minLength={8}
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-white border border-[#0f172a]/10 rounded-sm px-4 py-2.5 text-[#0f172a] focus:outline-none focus:border-imm-red-500 focus:ring-1 focus:ring-imm-red-500 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#0f172a]/90">Hak Akses (Role)</label>
              <select 
                name="role"
                required
                value={formData.role}
                onChange={handleChange}
                className="w-full bg-white border border-[#0f172a]/10 rounded-sm px-4 py-2.5 text-[#0f172a] focus:outline-none focus:border-imm-red-500 focus:ring-1 focus:ring-imm-red-500 transition-colors"
              >
                <option value="komisariat">Komisariat (Kontributor Lokal)</option>
                <option value="bidang">Bidang (Cabang)</option>
                <option value="admin">Admin (Pengelola Konten)</option>
                <option value="super-admin">Super Admin (Akses Penuh)</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#0f172a]/5">
              <Link href="/dashboard/users">
                <Button type="button" variant="outline" className="rounded-sm px-6">
                  Batal
                </Button>
              </Link>
              <Button type="submit" disabled={isLoading} className="bg-[#c20000] hover:bg-[#a30000] text-white rounded-sm px-6 shadow-md">
                {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                {isLoading ? 'Menyimpan...' : 'Simpan Akun'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
