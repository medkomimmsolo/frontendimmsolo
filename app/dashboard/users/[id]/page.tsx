'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getUserFacingErrorMessage } from '@/lib/errorMessage';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function EditUser({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  const isSuperAdmin = currentUser?.roles?.some((role: any) => role.name === 'super-admin') ?? false;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [dataAccessSaving, setDataAccessSaving] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<any[]>([]);
  const [dataAccessUsers, setDataAccessUsers] = useState<any[]>([]);
  const [dataAccessUserIds, setDataAccessUserIds] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'komisariat',
  });

  useEffect(() => {
    const fetchUserAndRoles = async () => {
      try {
        const [userRes, rolesRes, dataAccessRes] = await Promise.all([
          api.get(`/users/${id}`),
          api.get('/roles').catch(() => null),
          isSuperAdmin ? api.get(`/users/${id}/data-access`) : Promise.resolve(null),
        ]);
        const data = userRes.data.data;
        if (rolesRes?.data?.data?.roles) {
          setAvailableRoles(rolesRes.data.data.roles);
        }
        if (dataAccessRes?.data?.data) {
          setDataAccessUsers(dataAccessRes.data.data.users || []);
          setDataAccessUserIds((dataAccessRes.data.data.user_ids || []).map(Number));
        }
        
        setFormData({
          name: data.name || '',
          username: data.username || '',
          email: data.email || '',
          password: '',
          role: data.roles?.[0]?.name || 'komisariat',
        });
      } catch (err: any) {
        console.error(err);
        toast.error(getUserFacingErrorMessage(err, 'Gagal memuat data pengguna'));
        router.push('/dashboard/users');
      } finally {
        setIsFetching(false);
      }
    };
    
    fetchUserAndRoles();
  }, [id, router, isSuperAdmin]);

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

  const saveDataAccess = async () => {
    setDataAccessSaving(true);
    try {
      await api.put(`/users/${id}/data-access`, { user_ids: dataAccessUserIds });
      toast.success('Akses data lintas pengguna berhasil diperbarui');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan akses data');
    } finally {
      setDataAccessSaving(false);
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
                className="w-full bg-white border border-[#0f172a]/10 rounded-sm px-4 py-2.5 text-[#0f172a] focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#0f172a]/90">Username</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-mono">@</span>
                <input 
                  type="text" 
                  name="username"
                  placeholder="nama_pengguna"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full bg-white border border-[#0f172a]/10 rounded-sm pl-8 pr-4 py-2.5 text-[#0f172a] focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] transition-colors font-mono text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#0f172a]/90">Alamat Email</label>
              <input 
                type="email" 
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-white border border-[#0f172a]/10 rounded-sm px-4 py-2.5 text-[#0f172a] focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#0f172a]/90">Password Baru <span className="text-slate-400 font-normal">(Opsional)</span></label>
              <input 
                type="password" 
                name="password"
                minLength={8}
                value={formData.password}
                onChange={handleChange}
                placeholder="Kosongkan jika tidak ingin mengubah password"
                className="w-full bg-white border border-[#0f172a]/10 rounded-sm px-4 py-2.5 text-[#0f172a] focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#0f172a]/90">Hak Akses (Role)</label>
              <select 
                name="role"
                required
                value={formData.role}
                onChange={handleChange}
                className="w-full bg-white border border-[#0f172a]/10 rounded-sm px-4 py-2.5 text-[#0f172a] focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] transition-colors capitalize"
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

      {isSuperAdmin && (
        <Card className="border-[#0f172a]/10 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div>
              <h2 className="text-base font-bold text-[#0f172a]">Akses Data Pengguna Lain</h2>
              <p className="text-sm text-slate-500 mt-1">
                Berikan izin untuk melihat data milik pengguna lain. Izin ini tidak memberi hak mengubah atau memindahkan data.
              </p>
            </div>
            {dataAccessUsers.length === 0 ? (
              <p className="text-sm text-slate-400">Tidak ada pengguna lain untuk dipilih.</p>
            ) : (
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-sm">
                {dataAccessUsers.map((owner) => {
                  const checked = dataAccessUserIds.includes(Number(owner.id));
                  return (
                    <label key={owner.id} className="flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => setDataAccessUserIds((previous) => (
                          checked
                            ? previous.filter((ownerId) => ownerId !== Number(owner.id))
                            : [...previous, Number(owner.id)]
                        ))}
                        className="w-4 h-4 accent-[#c20000]"
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-slate-700">{owner.name}</span>
                        <span className="block text-xs text-slate-400">{owner.username ? `@${owner.username} · ` : ''}{owner.email}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={saveDataAccess}
                disabled={dataAccessSaving}
                className="bg-[#c20000] hover:bg-[#a30000] text-white rounded-sm px-5"
              >
                {dataAccessSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Simpan Akses Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
