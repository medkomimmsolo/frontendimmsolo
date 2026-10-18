'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getUserFacingErrorMessage } from '@/lib/errorMessage';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader } from '@/components/ui/PageHeader';

const inputClass = "w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[#0f172a] focus:outline-none focus:border-[#c20000] focus:ring-2 focus:ring-[#c20000]/20 transition-all text-sm shadow-2xs";
const labelClass = "block text-xs font-bold text-slate-700 uppercase tracking-wider";
const helperClass = "text-xs text-slate-500 leading-relaxed";

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
      <div className="flex items-center justify-center h-64 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mr-3 text-[#c20000]" />
        Memuat data pengguna...
      </div>
    );
  }

  const roleSelect = (
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
  );

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">

      {/* Page Header dengan Aksi */}
      <PageHeader
        title="Edit Pengguna"
        description="Perbarui akses dan data identitas pengguna"
        badge="Pengguna"
      >
        <Link href="/dashboard/users">
          <Button type="button" variant="outline" size="sm" className="h-10 px-4 rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs">
            Batal
          </Button>
        </Link>
        <Button type="submit" disabled={isLoading} className="h-10 px-5 bg-[#c20000] hover:bg-[#a30000] text-white rounded-xl text-xs font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]">
          {isLoading ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
          {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
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
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}>Username</label>
                <input
                  type="text"
                  name="username"
                  placeholder="nama_pengguna"
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
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={labelClass}>Password Baru <span className="text-slate-400 font-semibold normal-case tracking-normal">(opsional)</span></label>
                  <input
                    type="password"
                    name="password"
                    minLength={8}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Kosongkan jika tidak ingin mengubah password"
                    className={inputClass}
                  />
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
                {roleSelect}
                <p className={helperClass}>Menentukan modul dashboard yang dapat diakses oleh akun ini.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {isSuperAdmin && (
        <Card className="border border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden bg-white">
          <div className="bg-slate-50/70 px-6 py-4 border-b border-slate-200/80">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Akses Data Pengguna Lain</h3>
          </div>
          <CardContent className="p-6 sm:p-7 space-y-4">
            <p className={helperClass}>
              Berikan izin untuk melihat data milik pengguna lain. Izin ini tidak memberi hak mengubah atau memindahkan data.
            </p>
            {dataAccessUsers.length === 0 ? (
              <p className="text-sm text-slate-400">Tidak ada pengguna lain untuk dipilih.</p>
            ) : (
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
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
                className="h-10 px-5 bg-[#c20000] hover:bg-[#a30000] text-white rounded-xl text-xs font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {dataAccessSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Simpan Akses Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </form>
  );
}
