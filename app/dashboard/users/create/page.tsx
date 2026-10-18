'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';

const inputClass = "w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[#0f172a] focus:outline-none focus:border-[#c20000] focus:ring-2 focus:ring-[#c20000]/20 transition-all text-sm shadow-2xs";
const labelClass = "block text-xs font-bold text-slate-700 uppercase tracking-wider";
const helperClass = "text-xs text-slate-500 leading-relaxed";

export default function CreateUser() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'komisariat',
  });

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await api.get('/roles');
        if (res.data?.data?.roles) {
          setAvailableRoles(res.data.data.roles);
        }
      } catch (err) {
        console.error('Gagal memuat roles', err);
      }
    };
    fetchRoles();
  }, []);

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
    <form onSubmit={handleSubmit} className="w-full space-y-6">

      {/* Page Header dengan Aksi */}
      <PageHeader
        title="Tambah Pengguna"
        description="Buat akun untuk pengelola website PC IMM Kota Surakarta"
        badge="Pengguna"
      >
        <Link href="/dashboard/users">
          <Button type="button" variant="outline" size="sm" className="h-10 px-4 rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs">
            Batal
          </Button>
        </Link>
        <Button type="submit" disabled={isLoading} className="h-10 px-5 bg-[#c20000] hover:bg-[#a30000] text-white rounded-xl text-xs font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]">
          {isLoading ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
          {isLoading ? 'Menyimpan...' : 'Simpan Akun'}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* ─────────────── KIRI: Data Akun ─────────────── */}
        <div className="lg:col-span-2">
          <Card className="border border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden bg-white">
            <div className="bg-slate-50/70 px-6 py-4 border-b border-slate-200/80">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Data Akun Pengguna</h3>
            </div>
            <CardContent className="p-6 sm:p-7 space-y-5">
              <div className="space-y-1.5">
                <label className={labelClass}>Nama Lengkap <span className="text-[#c20000]">*</span></label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="cth. Ahmad Fauzi"
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className={labelClass}>Username <span className="text-slate-400 font-semibold normal-case tracking-normal">(opsional — dibuat otomatis jika kosong)</span></label>
                </div>
                <input
                  type="text"
                  name="username"
                  placeholder="contoh: kader_solo"
                  value={formData.username}
                  onChange={handleChange}
                  className={`${inputClass} font-mono`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className={labelClass}>Alamat Email <span className="text-[#c20000]">*</span></label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="cth. kader@immsolo.or.id"
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={labelClass}>Password <span className="text-[#c20000]">*</span></label>
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={8}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimal 8 karakter"
                    className={inputClass}
                  />
                  <p className={helperClass}>Gunakan kombinasi huruf, angka, dan simbol.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ─────────────── KANAN: Hak Akses ─────────────── */}
        <div>
          <Card className="border border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden bg-white">
            <div className="bg-slate-50/70 px-5 py-4 border-b border-slate-200/80">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Hak Akses (Role)</h3>
            </div>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className={labelClass}>Tingkat Akses <span className="text-[#c20000]">*</span></label>
                <select
                  name="role"
                  required
                  value={formData.role}
                  onChange={handleChange}
                  className={`${inputClass} capitalize`}
                >
                  {availableRoles.length > 0 ? (
                    availableRoles.map((r: any) => (
                      <option key={r.id} value={r.name}>
                        {r.name.replace(/-/g, ' ')} {r.name === 'super-admin' ? '(Akses Penuh)' : ''}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="komisariat">Komisariat (Kontributor Lokal)</option>
                      <option value="bidang">Bidang (Cabang)</option>
                      <option value="admin">Admin (Pengelola Konten)</option>
                      <option value="super-admin">Super Admin (Akses Penuh)</option>
                    </>
                  )}
                </select>
                <p className={helperClass}>Menentukan modul dashboard yang dapat diakses oleh akun ini.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
