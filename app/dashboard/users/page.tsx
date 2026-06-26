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
import { User } from '@/types';
import Link from 'next/link';

export default function UsersManagement() {
  const { user } = useAuth();
  const [usersList, setUsersList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/users');
      const data = response.data.data?.data || response.data.data || [];
      setUsersList(data);
    } catch (error) {
      console.error('Failed to fetch users', error);
      toast.error('Gagal memuat data pengguna');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
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

  const filteredUsers = usersList.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70" />
            <input 
              type="text" 
              placeholder="Cari nama atau email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#0f172a]/10 rounded-sm pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-imm-red-500 focus:ring-1 focus:ring-imm-red-500 transition-colors"
            />
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
                <th className="p-4 pr-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center text-white/70">
                      <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#c20000]" />
                      <p>Memuat data pengguna...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center text-white/70">
                      <UsersIcon className="w-12 h-12 mb-4 text-white/80" />
                      <p className="text-lg font-medium text-[#0f172a] mb-1">Belum ada pengguna</p>
                      <p>Tambahkan akun untuk kontributor atau pengurus.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-white/50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-bold text-[#0f172a]">{u.name}</div>
                      <div className="text-[#0f172a]/70 text-xs mt-1">{u.email}</div>
                    </td>
                    <td className="p-4">
                      {u.roles?.map(r => (
                        <Badge key={r.id} className={
                          r.name === 'super-admin' ? 'bg-red-50 text-red-600 border-red-200' :
                          r.name === 'admin' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                          'bg-white text-[#0f172a]/90 border-[#0f172a]/10'
                        }>
                          {r.name.replace('-', ' ').toUpperCase()}
                        </Badge>
                      ))}
                    </td>
                    <td className="p-4 pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/dashboard/users/${u.id}`} className="p-2 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-sm transition-colors" title="Edit">
                          <Edit className="w-4 h-4" />
                        </Link>
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
      </Card>
    </div>
  );
}
