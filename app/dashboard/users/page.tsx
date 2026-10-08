'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Loader2,
  Users as UsersIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useConfirm } from '@/components/providers/ConfirmProvider';
import { User } from '@/types';
import { ShieldCheck, Power, PowerOff } from 'lucide-react';
import Link from 'next/link';

export default function UsersManagement() {
  const { user } = useAuth();
  const { confirm } = useConfirm();
  const [usersList, setUsersList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [accessModalUser, setAccessModalUser] = useState<User | null>(null);
  const [accessDirect, setAccessDirect] = useState<string[]>([]);
  const [accessDenied, setAccessDenied] = useState<string[]>([]);
  const [accessViaRole, setAccessViaRole] = useState<string[]>([]);
  const [accessAllPerms, setAccessAllPerms] = useState<string[]>([]);
  const [accessAllCats, setAccessAllCats] = useState<any[]>([]);
  const [accessAllowedCats, setAccessAllowedCats] = useState<number[]>([]);
  const [accessLoading, setAccessLoading] = useState(false);
  const [accessSaving, setAccessSaving] = useState(false);

  const isSuperAdmin = user?.roles?.some((r: any) => r.name === 'super-admin');

  const openAccessModal = async (u: User) => {
    setAccessModalUser(u);
    setAccessLoading(true);
    try {
      const [permRes, rolesRes, catsRes, userCatsRes] = await Promise.all([
        api.get(`/users/${u.id}/permissions`),
        api.get('/roles'),
        api.get('/categories'),
        api.get(`/users/${u.id}/categories`),
      ]);
      const catList = catsRes.data.data?.data || catsRes.data.data || [];
      setAccessAllCats(Array.isArray(catList) ? catList : []);
      setAccessAllowedCats(userCatsRes.data.data?.allowed || []);
      setAccessAllPerms(rolesRes.data.data.permissions || []);
      const isSuper = u.roles?.some((r: any) => r.name === 'super-admin');
      setAccessDirect(permRes.data.data.direct || []);
      setAccessViaRole(isSuper ? (rolesRes.data.data.permissions || []) : (permRes.data.data.via_role || []));
      setAccessDenied(isSuper ? [] : (permRes.data.data.denied || []));
    } catch {
      toast.error('Gagal memuat hak akses');
    } finally {
      setAccessLoading(false);
    }
  };

  const toggleAccessPerm = (perm: string) => {
    if (accessDenied.includes(perm)) {
      setAccessDenied((prev) => prev.filter((x) => x !== perm));
      return;
    }
    if (accessViaRole.includes(perm)) {
      setAccessDenied((prev) => [...prev, perm]);
      return;
    }
    setAccessDirect((prev) => (prev.includes(perm) ? prev.filter((x) => x !== perm) : [...prev, perm]));
  };

  const saveAccess = async () => {
    if (!accessModalUser) return;
    setAccessSaving(true);
    try {
      await api.put(`/users/${accessModalUser.id}/permissions`, { permissions: accessDirect, denied: accessDenied });
      await api.put(`/users/${accessModalUser.id}/categories`, { categories: accessAllowedCats });
      toast.success(`Hak akses modul untuk "${accessModalUser.name}" diperbarui`);
      setAccessModalUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan');
    } finally {
      setAccessSaving(false);
    }
  };

  const handleToggleActive = async (u: User) => {
    if (!(await confirm({ message: `${u.is_active ? 'Nonaktifkan' : 'Aktifkan'} pengguna "${u.name}"?`, tone: 'danger' }))) return;
    try {
      await api.put(`/users/${u.id}/toggle-active`);
      toast.success(`Status "${u.name}" diperbarui`);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal mengubah status');
    }
  };

  const PERM_LABELS: Record<string, string> = {
    'manage-blog': 'Kelola Post',
    'manage-event': 'Agenda Kegiatan',
    'manage-struktural': 'Struktur Organisasi',
    'manage-document': 'Dokumen',
    'manage-shortlinks': 'Tautan Pendek',
    'manage-media': 'Media Library',
    'manage-settings': 'Pengaturan',
    'manage-users': 'Pengguna & Hak Akses',
    'manage-links': 'Linktree',
    'manage-account-requests': 'Pengajuan Akun',
    'manage-audit-logs': 'Log Aktivitas',
    'manage-messages': 'Kotak Masuk',
  };


  const fetchUsers = async (page = currentPage, search = searchQuery) => {
    setIsLoading(true);
    try {
      const response = await api.get('/users', { params: { page, per_page: 15, search: search || undefined } });
      const payload = response.data.data;
      if (payload && payload.data) {
        setUsersList(payload.data);
        setTotalPages(payload.last_page || 1);
        setTotalItems(payload.total || 0);
      } else {
        setUsersList(Array.isArray(payload) ? payload : []);
      }
    } catch (error) {
      console.error('Failed to fetch users', error);
      toast.error('Gagal memuat data pengguna');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers(1, searchQuery);
  };

  const handleDelete = async (id: number) => {
    if (await confirm({ message: 'Apakah Anda yakin ingin menghapus pengguna ini?', tone: 'danger' })) {
      try {
        await api.delete(`/users/${id}`);
        toast.success('Pengguna berhasil dihapus');
        fetchUsers();
      } catch (error: any) {
        console.error('Failed to delete', error);
        toast.error(error.response?.data?.message || 'Gagal menghapus pengguna');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-sm shadow-sm border border-[#0f172a]/5">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
            Kelola Pengguna
          </h1>
          <p className="text-[#0f172a]/70 text-sm mt-1">Sistem manajemen akun admin dan kontributor website.</p>
        </div>
        <Link href="/dashboard/users/create">
          <Button className="bg-[#c20000] hover:bg-[#a30000] text-white rounded-sm shadow-md h-11 px-6">
            <Plus className="w-5 h-5 mr-2" />
            Tambah Pengguna
          </Button>
        </Link>
      </div>

      <Card className="border-[#0f172a]/10 shadow-sm">
        <CardContent className="p-4 sm:p-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <form onSubmit={handleSearch}>
              <input 
                type="text" 
                placeholder="Cari nama atau email... (Enter)" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#0f172a]/10 rounded-sm pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-imm-red-500 focus:ring-1 focus:ring-imm-red-500 transition-colors"
              />
            </form>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#0f172a]/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-[#0f172a]/5 text-[#0f172a]/70 text-sm font-semibold uppercase tracking-wider">
                <th className="p-4 pl-6">Nama & Email</th>
                <th className="p-4">Peran (Role)</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#c20000]" />
                      <p>Memuat data pengguna...</p>
                    </div>
                  </td>
                </tr>
              ) : usersList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <UsersIcon className="w-12 h-12 mb-4 text-slate-300" />
                      <p className="text-lg font-medium text-[#0f172a] mb-1">Belum ada pengguna</p>
                      <p>Tambahkan akun untuk kontributor atau pengurus.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-white/50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-bold text-[#0f172a]">{u.name}</div>
                      <div className="text-[#0f172a]/70 text-xs mt-1">{u.email}</div>
                    </td>
                    <td className="p-4">
                      {u.roles?.map(r => (
                        <Badge key={r.id} variant="outline" className={
                          r.name === 'super-admin' ? 'bg-red-50 text-red-700 border-red-200' :
                          r.name === 'admin' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          r.name === 'bidang' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          r.name === 'komisariat' ? 'bg-violet-50 text-violet-700 border-violet-200' :
                          'bg-slate-50 text-slate-600 border-slate-200'
                        }>
                          {r.name.replace('-', ' ').toUpperCase()}
                        </Badge>
                      ))}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${u.is_active ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                        {u.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="p-4 pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/dashboard/users/${u.id}`} className="p-2 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-sm transition-colors" title="Edit">
                          <Edit className="w-4 h-4" />
                        </Link>
                        {isSuperAdmin && (
                          <button
                            onClick={() => openAccessModal(u)}
                            className="p-2 text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 rounded-sm transition-colors"
                            title="Hak Akses Modul"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                        )}
                        {isSuperAdmin && user?.id !== u.id && (
                          <button
                            onClick={() => handleToggleActive(u)}
                            className={`p-2 rounded-sm transition-colors ${u.is_active ? 'text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100' : 'text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100'}`}
                            title={u.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                          >
                            {u.is_active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                          </button>
                        )}
                        {user?.id !== u.id && (
                          <button 
                            onClick={() => handleDelete(u.id)}
                            className="p-2 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-sm transition-colors" 
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
          <p className="text-xs text-slate-500 font-medium">
            Menampilkan {(currentPage - 1) * 15 + 1}–{Math.min(currentPage * 15, totalItems)} dari {totalItems} pengguna
          </p>
          <div className="flex items-center gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="px-3 py-1.5 text-sm rounded-md border border-slate-200 disabled:opacity-40 hover:bg-slate-50">Prev</button>
            <span className="text-sm text-slate-600 font-semibold">{currentPage} / {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-1.5 text-sm rounded-md border border-slate-200 disabled:opacity-40 hover:bg-slate-50">Next</button>
          </div>
        </div>
      </Card>

      {accessModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setAccessModalUser(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-slate-800 mb-1">Hak Akses Modul — {accessModalUser.name}</h2>
            <p className="text-xs text-slate-500 mb-5">
              Role: <span className="capitalize">{accessModalUser.roles?.[0]?.name || '-'}</span>
              {accessModalUser.roles?.some((r: any) => r.name === 'super-admin') && ' (akses penuh, tidak dapat diubah)'}
            </p>
            {accessLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-[#c20000]" /></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {accessAllPerms.map((perm) => {
                  const fromRole = accessViaRole.includes(perm);
                  const isDenied = accessDenied.includes(perm);
                  const checked = !isDenied && (fromRole || accessDirect.includes(perm));
                  const locked = accessModalUser.roles?.some((r: any) => r.name === 'super-admin');
                  return (
                    <label key={perm} className={`flex items-center gap-3 p-3 border rounded-lg transition-colors ${checked ? 'border-[#c20000]/40 bg-[#c20000]/5' : 'border-slate-200'} ${locked ? 'opacity-60' : 'cursor-pointer hover:bg-slate-50'}`}>
                      <input type="checkbox" checked={checked} disabled={locked} onChange={() => toggleAccessPerm(perm)} className="w-4 h-4 accent-[#c20000]" />
                      <span className="text-sm font-medium text-slate-700">
                        {PERM_LABELS[perm] ?? perm}
                        {fromRole && !isDenied && <span className="ml-2 text-[10px] uppercase tracking-wide text-slate-400">via role</span>}
                        {isDenied && <span className="ml-2 text-[10px] uppercase tracking-wide text-red-400">dimatikan</span>}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
            {!accessModalUser.roles?.some((r: any) => r.name === 'super-admin') && (
              <div className="mt-6 pt-5 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 mb-1">Akses Kategori Post</h3>
                <p className="text-xs text-slate-500 mb-4">Kosongkan untuk mengizinkan semua kategori. Centang untuk membatasi.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {accessAllCats.map((c: any) => {
                    const checked = accessAllowedCats.includes(c.id);
                    return (
                      <label key={c.id} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${checked ? 'border-[#c20000]/40 bg-[#c20000]/5' : 'border-slate-200 hover:bg-slate-50'}`}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => setAccessAllowedCats((prev) => (prev.includes(c.id) ? prev.filter((x) => x !== c.id) : [...prev, c.id]))}
                          className="w-4 h-4 accent-[#c20000]"
                        />
                        <span className="text-sm font-medium text-slate-700">{c.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setAccessModalUser(null)}>Batal</Button>
              {!accessModalUser.roles?.some((r: any) => r.name === 'super-admin') && (
                <Button onClick={saveAccess} disabled={accessSaving} className="bg-[#c20000] hover:bg-[#a30000] text-white">
                  {accessSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Simpan
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
