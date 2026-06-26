'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function EditUser({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'komisariat',
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(`/users/${id}`);
        const data = response.data.data;
        
        setFormData({
          name: data.name,
          email: data.email,
          password: '',
          role: data.roles?.[0]?.name || 'komisariat',
        });
      } catch (err: any) {
        console.error(err);
        toast.error('Gagal memuat data pengguna');
        router.push('/dashboard/users');
      } finally {
        setIsFetching(false);
      }
    };
    
    fetchUser();
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Only send password if it's not empty
    const payload = { ...formData };
    if (!payload.password) {
      delete (payload as any).password;
    }
    
    try {
      await api.put(`/users/${id}`, payload);
      toast.success('Pengguna berhasil diperbarui');
      router.push('/dashboard/users');
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Gagal menyimpan perubahan');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-64 text-[#0f172a]/70">
        <Loader2 className="w-8 h-8 animate-spin mr-3 text-[#c20000]" />
        Memuat data pengguna...
      </div>
    );
  }

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
            Edit Pengguna
          </h1>
          <p className="text-[#0f172a]/70 text-sm mt-1">Perbarui akses dan data identitas pengguna.</p>
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
              <label className="text-sm font-medium text-[#0f172a]/90">Password Baru <span className="text-white/70 font-normal">(Opsional)</span></label>
              <input 
                type="password" 
                name="password"
                minLength={8}
                value={formData.password}
                onChange={handleChange}
                placeholder="Kosongkan jika tidak ingin mengubah password"
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
                {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
