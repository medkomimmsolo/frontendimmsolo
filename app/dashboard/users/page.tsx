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
  Users as UsersIcon,
  ShieldCheck,
  Shield,
  Power,
  PowerOff,
  X,
  Lock,
  Ban,
  Zap,
  Tag,
  Newspaper,
  CalendarDays,
  Network,
  FolderOpen,
  Link2,
  Image as ImageIcon,
  Settings,
  UserPlus,
  ScrollText,
  Inbox,
  ClipboardList,
  Megaphone,
  Share2,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getUserFacingErrorMessage } from '@/lib/errorMessage';
import { useConfirm } from '@/components/providers/ConfirmProvider';
import { User } from '@/types';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';

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
  'manage-forms': 'Formulir Pendaftaran',
  'manage-announcements': 'Pengumuman Internal',
};

const PERM_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'manage-blog': Newspaper,
  'manage-event': CalendarDays,
  'manage-struktural': Network,
  'manage-document': FolderOpen,
  'manage-shortlinks': Link2,
  'manage-media': ImageIcon,
  'manage-settings': Settings,
  'manage-users': UsersIcon,
  'manage-links': Share2,
  'manage-account-requests': UserPlus,
  'manage-audit-logs': ScrollText,
  'manage-messages': Inbox,
  'manage-forms': ClipboardList,
  'manage-announcements': Megaphone,
};

const filterPerms = (perms: string[], query: string) => {
  const q = query.trim().toLowerCase();
  if (!q) return perms;
  return perms.filter((perm) => (PERM_LABELS[perm] ?? perm).toLowerCase().includes(q) || perm.toLowerCase().includes(q));
};

const countArrayDiff = (a: unknown[], b: unknown[]) => {
  const setA = new Set(a);
  const setB = new Set(b);
  let diff = 0;
  new Set([...a, ...b]).forEach((v) => {
    if (setA.has(v) !== setB.has(v)) diff += 1;
  });
  return diff;
};

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
  const [accessTab, setAccessTab] = useState<'modules' | 'categories'>('modules');
  const [accessSearch, setAccessSearch] = useState('');
  const [accessInitialDirect, setAccessInitialDirect] = useState<string[]>([]);
  const [accessInitialDenied, setAccessInitialDenied] = useState<string[]>([]);
  const [accessInitialCats, setAccessInitialCats] = useState<number[]>([]);

  // Role Management State
  const [isRolesModalOpen, setIsRolesModalOpen] = useState(false);
  const [rolesList, setRolesList] = useState<any[]>([]);
  const [allPermissionsList, setAllPermissionsList] = useState<string[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRolePerms, setNewRolePerms] = useState<string[]>([]);
  const [creatingRole, setCreatingRole] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
  const [editingRolePerms, setEditingRolePerms] = useState<string[]>([]);
  const [savingRoleId, setSavingRoleId] = useState<number | null>(null);

  const isSuperAdmin = user?.roles?.some((r: any) => r.name === 'super-admin');

  const openAccessModal = async (u: User) => {
    setAccessModalUser(u);
    setAccessTab('modules');
    setAccessSearch('');
    setAccessLoading(true);
    try {
      const [permRes, rolesRes, catsRes, userCatsRes] = await Promise.all([
        api.get(`/users/${u.id}/permissions`),
        api.get('/roles'),
        api.get('/categories'),
        api.get(`/users/${u.id}/categories`),
      ]);
      const catList = catsRes.data.data?.data || catsRes.data.data || [];
      const allowedCats = userCatsRes.data.data?.allowed || [];
      setAccessAllCats(Array.isArray(catList) ? catList : []);
      setAccessAllowedCats(allowedCats);
      setAccessAllPerms(rolesRes.data.data.permissions || []);
      const isSuper = u.roles?.some((r: any) => r.name === 'super-admin');
      const direct = permRes.data.data.direct || [];
      const viaRoleList = isSuper ? (rolesRes.data.data.permissions || []) : (permRes.data.data.via_role || []);
      const deniedList = isSuper ? [] : (permRes.data.data.denied || []);
      setAccessDirect(direct);
      setAccessViaRole(viaRoleList);
      setAccessDenied(deniedList);
      setAccessInitialDirect(direct);
      setAccessInitialDenied(deniedList);
      setAccessInitialCats(allowedCats);
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error, 'Gagal memuat hak akses'));
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
    const action = u.is_active ? 'Nonaktifkan' : 'Aktifkan';
    if (!(await confirm({
      title: `${action} pengguna?`,
      message: `Pengguna "${u.name}" akan ${u.is_active ? 'dinonaktifkan' : 'diaktifkan'}.`,
      confirmText: `${action} akun`,
      tone: u.is_active ? 'danger' : 'default',
    }))) return;
    try {
      await api.put(`/users/${u.id}/toggle-active`);
      toast.success(`Status "${u.name}" diperbarui`);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal mengubah status');
    }
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
      toast.error(getUserFacingErrorMessage(error, 'Gagal memuat data pengguna'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  useEffect(() => {
    if (!accessModalUser) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAccessModalUser(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [accessModalUser]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers(1, searchQuery);
  };

  const handleDelete = async (id: number) => {
    if (await confirm({ title: 'Hapus pengguna?', message: 'Akun pengguna ini akan dihapus.', confirmText: 'Hapus pengguna', tone: 'danger' })) {
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

  const openRolesModal = async () => {
    setIsRolesModalOpen(true);
    setEditingRoleId(null);
    setRolesLoading(true);
    try {
      const res = await api.get('/roles');
      if (res.data?.data) {
        setRolesList(res.data.data.roles || []);
        setAllPermissionsList(res.data.data.permissions || []);
      }
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error, 'Gagal memuat daftar role'));
    } finally {
      setRolesLoading(false);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    setCreatingRole(true);
    try {
      await api.post('/roles', {
        name: newRoleName.trim().toLowerCase(),
        permissions: newRolePerms,
      });
      toast.success(`Role "${newRoleName.trim().toLowerCase()}" berhasil dibuat`);
      setNewRoleName('');
      setNewRolePerms([]);
      const res = await api.get('/roles');
      if (res.data?.data) {
        setRolesList(res.data.data.roles || []);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal membuat role');
    } finally {
      setCreatingRole(false);
    }
  };

  const handleDeleteRole = async (role: any) => {
    if (['super-admin', 'admin', 'bidang', 'komisariat'].includes(role.name)) {
      toast.error('Role sistem bawaan tidak dapat dihapus');
      return;
    }
    if (!(await confirm({ title: 'Hapus role?', message: `Role "${role.name}" akan dihapus. Pengguna yang memakai role ini dapat kehilangan hak akses terkait.`, confirmText: 'Hapus role', tone: 'danger' }))) return;
    try {
      await api.delete(`/roles/${role.id}`);
      toast.success(`Role "${role.name}" berhasil dihapus`);
      setRolesList((prev) => prev.filter((r) => r.id !== role.id));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menghapus role');
    }
  };

  const handleEditRolePermissions = (role: any) => {
    setEditingRoleId(role.id);
    setEditingRolePerms(role.permissions || []);
  };

  const handleSaveRolePermissions = async (role: any) => {
    setSavingRoleId(role.id);
    try {
      await api.put(`/roles/${role.id}`, { permissions: editingRolePerms });
      const res = await api.get('/roles');
      setRolesList(res.data.data.roles || []);
      setEditingRoleId(null);
      toast.success(`Hak akses role "${role.name}" diperbarui`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui hak akses role');
    } finally {
      setSavingRoleId(null);
    }
  };

  const isSuperAccess = accessModalUser?.roles?.some((r: any) => r.name === 'super-admin') ?? false;
  const accessQuery = accessSearch.trim().toLowerCase();
  const visiblePerms = filterPerms(accessAllPerms, accessSearch);
  const enabledCount = accessAllPerms.filter((perm) => !accessDenied.includes(perm) && (accessViaRole.includes(perm) || accessDirect.includes(perm))).length;
  const accessChangeCount = accessModalUser
    ? countArrayDiff(accessDirect, accessInitialDirect) + countArrayDiff(accessDenied, accessInitialDenied) + countArrayDiff(accessAllowedCats, accessInitialCats)
    : 0;

  const applyAllPerms = (enable: boolean) => {
    const deniedSet = new Set(accessDenied);
    const directSet = new Set(accessDirect);
    filterPerms(accessAllPerms, accessSearch).forEach((perm) => {
      if (accessViaRole.includes(perm)) {
        if (enable) deniedSet.delete(perm);
        else deniedSet.add(perm);
      } else {
        if (enable) directSet.add(perm);
        else directSet.delete(perm);
      }
    });
    setAccessDenied(Array.from(deniedSet));
    setAccessDirect(Array.from(directSet));
  };

  const applyAllCats = (enable: boolean) => {
    setAccessAllowedCats(enable ? accessAllCats.map((c: any) => c.id) : []);
  };

  return (
    <div className="space-y-6">
      {/* Modern Page Header */}
      <PageHeader
        title="Kelola Pengguna"
        description="Sistem manajemen akun admin, hak akses, dan kontributor website PC IMM Kota Surakarta"
        badge="Pengguna"
      >
        {isSuperAdmin && (
          <Button
            type="button"
            variant="outline"
            onClick={openRolesModal}
            className="h-10 px-4 border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs"
          >
            <Shield className="w-4 h-4 mr-1.5 text-[#c20000]" />
            Kelola Role
          </Button>
        )}
        <Link href="/dashboard/users/create">
          <Button className="h-10 px-5 bg-[#c20000] hover:bg-[#a30000] text-white rounded-xl text-xs font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]">
            <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
            Tambah Pengguna
          </Button>
        </Link>
      </PageHeader>

      {/* Search and Filters Bar Konsisten */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <form onSubmit={handleSearch}>
            <input 
              type="text" 
              placeholder="Cari nama, username, atau email... (Enter)" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] shadow-2xs transition-all"
            />
          </form>
        </div>
      </div>

      {/* Tabel Data Konsisten */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="admin-panel-table w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4 pl-6">Nama & Email</th>
                <th className="py-3.5 px-4">Peran (Role)</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 pr-6 text-right">Aksi</th>
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
                      <div className="flex items-center gap-2 mt-1">
                        {u.username && (
                          <span className="text-2xs font-mono font-semibold text-[#c20000] bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                            @{u.username}
                          </span>
                        )}
                        <span className="text-[#0f172a]/70 text-xs">{u.email}</span>
                      </div>
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
                        <Link href={`/dashboard/users/${u.id}`} className="h-9 w-9 inline-flex items-center justify-center text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-sm transition-colors" title="Edit">
                          <Edit className="w-4 h-4" />
                        </Link>
                        {isSuperAdmin && (
                          <button
                            onClick={() => openAccessModal(u)}
                            className="h-9 w-9 inline-flex items-center justify-center text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 rounded-sm transition-colors"
                            title="Hak Akses Modul"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                        )}
                        {isSuperAdmin && user?.id !== u.id && (
                          <button
                            onClick={() => handleToggleActive(u)}
                            className={`h-9 w-9 inline-flex items-center justify-center rounded-sm transition-colors ${u.is_active ? 'text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100' : 'text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100'}`}
                            title={u.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                          >
                            {u.is_active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                          </button>
                        )}
                        {user?.id !== u.id && (
                          <button 
                            onClick={() => handleDelete(u.id)}
                            className="h-9 w-9 inline-flex items-center justify-center text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-sm transition-colors" 
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
            <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors">Prev</button>
            <span className="text-xs text-slate-600 font-semibold">{currentPage} / {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors">Next</button>
          </div>
        </div>
      </div>

      {accessModalUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0f172a]/60 backdrop-blur-sm p-4 sm:p-6" onClick={() => setAccessModalUser(null)}>
          <div
            className="mx-auto flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white p-5 sm:px-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#c20000] to-[#900000] text-white shadow-sm">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-bold tracking-tight text-slate-800 sm:text-lg" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
                    Hak Akses Modul
                  </h2>
                  {accessModalUser.roles?.map((r: any) => (
                    <span key={r.id} className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-2xs font-semibold uppercase tracking-wide text-slate-600">
                      {r.name.replace(/-/g, ' ')}
                    </span>
                  ))}
                </div>
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  Atur modul yang dapat diakses oleh{" "}
                  <span className="font-semibold text-slate-700">{accessModalUser.name}</span>
                </p>
              </div>
              <button
                onClick={() => setAccessModalUser(null)}
                title="Tutup"
                className="-m-1 shrink-0 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto custom-scrollbar">
              {accessLoading ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-[#c20000]" />
                  <p className="text-xs font-medium text-slate-500">Memuat konfigurasi hak akses...</p>
                </div>
              ) : (
                <>
                  {isSuperAccess && (
                    <div className="mx-5 mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3.5 sm:mx-6 sm:p-4">
                      <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                      <div>
                        <p className="text-xs font-bold text-amber-800">Akun Super Admin</p>
                        <p className="mt-0.5 text-xs leading-relaxed text-amber-700/90">
                          Pengguna ini memiliki akses penuh ke seluruh modul dan tidak dapat diubah.
                        </p>
                      </div>
                    </div>
                  )}

                  {!isSuperAccess && (
                    <div className="flex gap-2 px-5 pt-4 sm:px-6">
                      <button
                        onClick={() => setAccessTab('modules')}
                        className={`inline-flex h-9 items-center gap-2 rounded-lg px-4 text-xs font-bold transition-colors ${accessTab === 'modules' ? 'bg-[#c20000] text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                      >
                        <ShieldCheck className="h-4 w-4" />
                        Modul Akses
                        <span className={`rounded-full px-1.5 text-2xs font-semibold ${accessTab === 'modules' ? 'bg-white/25 text-white' : 'border border-slate-200 bg-white text-slate-500'}`}>
                          {enabledCount}/{accessAllPerms.length}
                        </span>
                      </button>
                      <button
                        onClick={() => setAccessTab('categories')}
                        className={`inline-flex h-9 items-center gap-2 rounded-lg px-4 text-xs font-bold transition-colors ${accessTab === 'categories' ? 'bg-[#c20000] text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                      >
                        <Tag className="h-4 w-4" />
                        Kategori Post
                        <span className={`rounded-full px-1.5 text-2xs font-semibold ${accessTab === 'categories' ? 'bg-white/25 text-white' : 'border border-slate-200 bg-white text-slate-500'}`}>
                          {accessAllowedCats.length}/{accessAllCats.length}
                        </span>
                      </button>
                    </div>
                  )}

                  {isSuperAccess ? (
                    <div className="grid grid-cols-1 gap-2.5 p-5 sm:grid-cols-2 sm:px-6">
                      {accessAllPerms.map((perm) => {
                        const Icon = PERM_ICONS[perm] ?? Shield;
                        return (
                          <div key={perm} className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-semibold text-slate-800">
                                {PERM_LABELS[perm] ?? perm}
                              </div>
                              <div className="mt-0.5 text-2xs font-semibold text-emerald-600">Akses penuh</div>
                            </div>
                            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                          </div>
                        );
                      })}
                    </div>
                  ) : accessTab === 'modules' ? (
                    <section className="space-y-4 p-5 sm:px-6 sm:pb-6">
                      <div className="flex items-center gap-2 sm:flex-wrap">
                        <div className="relative flex-1 min-w-0">
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Cari modul..."
                            value={accessSearch}
                            onChange={(e) => setAccessSearch(e.target.value)}
                            className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-800 shadow-2xs placeholder:text-slate-400 focus:border-[#c20000] focus:outline-none focus:ring-1 focus:ring-[#c20000]"
                          />
                        </div>
                        <button
                          onClick={() => applyAllPerms(true)}
                          className="h-9 shrink-0 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 shadow-2xs transition-colors hover:border-slate-300 hover:bg-slate-50"
                        >
                          Pilih semua
                        </button>
                        <button
                          onClick={() => applyAllPerms(false)}
                          className="h-9 shrink-0 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 shadow-2xs transition-colors hover:border-slate-300 hover:bg-slate-50"
                        >
                          Kosongkan
                        </button>
                      </div>
                      {visiblePerms.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-10 text-slate-400">
                          <Search className="h-8 w-8 text-slate-200" />
                          <p className="text-xs font-medium">Tidak ada modul yang cocok dengan pencarian</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                          {visiblePerms.map((perm) => {
                            const fromRole = accessViaRole.includes(perm);
                            const isDenied = accessDenied.includes(perm);
                            const isDirect = accessDirect.includes(perm) && !isDenied;
                            const isOn = !isDenied && (fromRole || accessDirect.includes(perm));
                            const Icon = PERM_ICONS[perm] ?? Shield;
                            return (
                              <label
                                key={perm}
                                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all ${isDenied ? 'border-red-200 bg-red-50/50' : isOn ? 'border-[#c20000]/30 bg-[#c20000]/[0.04]' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                              >
                                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${isOn ? 'bg-[#c20000]/10 text-[#c20000]' : isDenied ? 'bg-red-100 text-red-500' : 'bg-slate-100 text-slate-400'}`}>
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="truncate text-sm font-semibold text-slate-800">
                                    {PERM_LABELS[perm] ?? perm}
                                  </div>
                                  <div className="mt-0.5 flex items-center gap-1 text-2xs font-semibold">
                                    {fromRole && !isDenied && (
                                      <span className="inline-flex items-center gap-0.5 text-violet-600">
                                        <Lock className="h-3 w-3" />
                                        Via role
                                      </span>
                                    )}
                                    {isDenied && (
                                      <span className="inline-flex items-center gap-0.5 text-red-500">
                                        <Ban className="h-3 w-3" />
                                        Diblokir
                                      </span>
                                    )}
                                    {isDirect && !fromRole && (
                                      <span className="inline-flex items-center gap-0.5 text-amber-600">
                                        <Zap className="h-3 w-3" />
                                        Akses khusus
                                      </span>
                                    )}
                                    {!isOn && !isDenied && (
                                      <span className="text-slate-400">Nonaktif</span>
                                    )}
                                  </div>
                                </div>
                                <input type="checkbox" className="sr-only peer" checked={isOn} onChange={() => toggleAccessPerm(perm)} />
                                <span className="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full bg-slate-200 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:bg-[#c20000] peer-checked:after:translate-x-4" />
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </section>
                  ) : (
                    <section className="space-y-4 p-5 sm:px-6 sm:pb-6">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-2xs text-slate-400">
                          Kosongkan untuk mengizinkan semua kategori.
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => applyAllCats(true)}
                            className="h-9 shrink-0 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 shadow-2xs transition-colors hover:border-slate-300 hover:bg-slate-50"
                          >
                            Pilih semua
                          </button>
                          <button
                            onClick={() => applyAllCats(false)}
                            className="h-9 shrink-0 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 shadow-2xs transition-colors hover:border-slate-300 hover:bg-slate-50"
                          >
                            Kosongkan
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                        {accessAllCats.map((c: any) => {
                          const checked = accessAllowedCats.includes(c.id);
                          return (
                            <label
                              key={c.id}
                              className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all ${checked ? 'border-[#c20000]/30 bg-[#c20000]/[0.04]' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                            >
                              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${checked ? 'bg-[#c20000]/10 text-[#c20000]' : 'bg-slate-100 text-slate-400'}`}>
                                <Tag className="h-4 w-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-semibold text-slate-800">{c.name}</div>
                                {c.slug && <div className="mt-0.5 truncate text-2xs text-slate-400">{c.slug}</div>}
                              </div>
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={checked}
                                onChange={() =>
                                  setAccessAllowedCats((prev) => (prev.includes(c.id) ? prev.filter((x: number) => x !== c.id) : [...prev, c.id]))
                                }
                              />
                              <span className="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full bg-slate-200 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:bg-[#c20000] peer-checked:after:translate-x-4" />
                            </label>
                          );
                        })}
                      </div>
                    </section>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
              {isSuperAccess ? (
                <p className="text-2xs text-slate-500">Akses penuh, tidak dapat diubah.</p>
              ) : (
                <p className="text-2xs text-slate-500">
                  {accessChangeCount > 0 ? (
                    <span className="font-semibold text-amber-600">{accessChangeCount} perubahan belum disimpan</span>
                  ) : (
                    'Tidak ada perubahan'
                  )}
                </p>
              )}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setAccessModalUser(null)} className="rounded-lg">
                  Batal
                </Button>
                {!isSuperAccess && (
                  <Button
                    size="sm"
                    onClick={saveAccess}
                    disabled={accessSaving || accessChangeCount === 0}
                    className="rounded-lg bg-[#c20000] text-white hover:bg-[#a30000]"
                  >
                    {accessSaving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-1.5 h-4 w-4" />}
                    Simpan Perubahan
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Management Modal */}
      {isRolesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/50 backdrop-blur-sm p-4" onClick={() => setIsRolesModalOpen(false)}>
          <div className="bg-white rounded-sm shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#c20000]" />
                  Kelola Role & Hak Akses
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Hak akses role bawaan dapat diubah atau dinonaktifkan oleh Super Admin.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsRolesModalOpen(false)} className="rounded-sm">
                Tutup
              </Button>
            </div>

            {rolesLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-[#c20000]" />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Form Tambah Role Baru */}
                <div className="lg:col-span-5 bg-slate-50 p-5 rounded-sm border border-slate-200 space-y-4">
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-[#c20000]" />
                    Tambah Role Baru
                  </h3>
                  <form onSubmit={handleCreateRole} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Nama Role</label>
                      <input
                        type="text"
                        required
                        placeholder="contoh: humas, editor-media"
                        value={newRoleName}
                        onChange={(e) => setNewRoleName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                        className="w-full bg-white border border-slate-200 rounded-sm px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#c20000]"
                      />
                      <p className="text-2xs text-slate-400">Gunakan huruf kecil dan tanda hubung (-).</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-700 block">Pilih Hak Akses (Permissions)</label>
                      <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 border border-slate-200 bg-white p-2 rounded-sm">
                        {allPermissionsList.map((perm) => {
                          const checked = newRolePerms.includes(perm);
                          return (
                            <label key={perm} className="flex items-center gap-2 text-xs p-1.5 hover:bg-slate-50 rounded-sm cursor-pointer">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() =>
                                  setNewRolePerms((prev) =>
                                    checked ? prev.filter((p) => p !== perm) : [...prev, perm]
                                  )
                                }
                                className="w-3.5 h-3.5 accent-[#c20000]"
                              />
                              <span className="text-slate-700">{PERM_LABELS[perm] ?? perm}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={creatingRole || !newRoleName.trim()}
                      className="w-full bg-[#c20000] hover:bg-[#a30000] text-white rounded-sm text-sm"
                    >
                      {creatingRole && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                      Buat Role Baru
                    </Button>
                  </form>
                </div>

                {/* Daftar Role Aktif */}
                <div className="lg:col-span-7 space-y-3">
                  <h3 className="text-base font-bold text-slate-800">Daftar Role Aktif</h3>
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                    {rolesList.map((r) => {
                      const isSystemRole = ['super-admin', 'admin', 'bidang', 'komisariat'].includes(r.name);
                      return (
                        <div key={r.id} className="p-4 rounded-sm border border-slate-200 bg-white hover:border-slate-300 transition-colors space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800 capitalize text-sm">{r.name.replace(/-/g, ' ')}</span>
                              <Badge variant="outline" className={isSystemRole ? 'bg-slate-100 text-slate-600 border-slate-300 text-2xs' : 'bg-emerald-50 text-emerald-700 border-emerald-200 text-2xs'}>
                                {isSystemRole ? 'Sistem Bawaan' : 'Custom Role'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              {r.name !== 'super-admin' && (
                                <button
                                  type="button"
                                  onClick={() => editingRoleId === r.id ? setEditingRoleId(null) : handleEditRolePermissions(r)}
                                  className="text-blue-600 hover:text-blue-700 p-1 rounded-sm hover:bg-blue-50 text-xs transition-colors"
                                >
                                  {editingRoleId === r.id ? 'Batal' : 'Ubah Hak Akses'}
                                </button>
                              )}
                              {!isSystemRole && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRole(r)}
                                  className="text-red-500 hover:text-red-700 p-1 rounded-sm hover:bg-red-50 text-xs flex items-center gap-1 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Hapus
                                </button>
                              )}
                            </div>
                          </div>
                          {editingRoleId === r.id ? (
                            <div className="space-y-3 pt-2">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {allPermissionsList.map((perm) => (
                                  <label key={perm} className="flex items-center gap-2 text-xs p-2 border border-slate-100 rounded-sm cursor-pointer hover:bg-slate-50">
                                    <input
                                      type="checkbox"
                                      checked={editingRolePerms.includes(perm)}
                                      onChange={() => setEditingRolePerms((prev) => (
                                        prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
                                      ))}
                                      className="w-3.5 h-3.5 accent-[#c20000]"
                                    />
                                    <span className="text-slate-700">{PERM_LABELS[perm] ?? perm}</span>
                                  </label>
                                ))}
                              </div>
                              <div className="flex justify-end">
                                <Button
                                  type="button"
                                  onClick={() => handleSaveRolePermissions(r)}
                                  disabled={savingRoleId === r.id}
                                  className="bg-[#c20000] hover:bg-[#a30000] text-white rounded-sm text-xs"
                                >
                                  {savingRoleId === r.id && <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />}
                                  Simpan Hak Akses
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {r.permissions && r.permissions.length > 0 ? (
                                r.permissions.map((p: string) => (
                                  <span key={p} className="px-2 py-0.5 rounded-sm bg-slate-100 text-slate-600 text-2xs">
                                    {PERM_LABELS[p] ?? p}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-slate-400 italic">Tidak ada permission</span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
