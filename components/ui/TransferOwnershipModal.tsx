'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { UserCheck, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface TransferOwnershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemTitle: string;
  currentOwnerName?: string | null;
  onTransfer: (newUserId: number) => Promise<void>;
}

export function TransferOwnershipModal({
  isOpen,
  onClose,
  itemTitle,
  currentOwnerName,
  onTransfer,
}: TransferOwnershipModalProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchUsers = async () => {
        setIsLoadingUsers(true);
        try {
          const res = await api.get('/users', { params: { per_page: 100 } });
          const list = res.data?.data?.data || res.data?.data || [];
          setUsers(Array.isArray(list) ? list : []);
          if (list.length > 0) {
            setSelectedUserId(String(list[0].id));
          }
        } catch {
          toast.error('Gagal memuat daftar pengguna');
        } finally {
          setIsLoadingUsers(false);
        }
      };
      fetchUsers();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    setIsSubmitting(true);
    try {
      await onTransfer(Number(selectedUserId));
      toast.success('Kepemilikan data berhasil dialihkan');
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal mengalihkan kepemilikan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-sm shadow-xl max-w-md w-full p-6 space-y-5 border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-50 text-[#c20000] rounded-sm">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Transfer Kepemilikan</h2>
              <p className="text-xs text-slate-500">Alihkan data ke user / pengurus lain</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-sm hover:bg-slate-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 bg-slate-50 rounded-sm border border-slate-200 text-xs space-y-1">
          <div className="text-slate-500 font-medium">Data yang dialihkan:</div>
          <div className="font-bold text-slate-800 line-clamp-2">{itemTitle}</div>
          <div className="pt-1 text-slate-500">
            Pemilik saat ini: <span className="font-semibold text-slate-700">{currentOwnerName || 'Belum ada (Sistem)'}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Pilih Pemilik Baru</label>
            {isLoadingUsers ? (
              <div className="flex items-center gap-2 py-2 text-xs text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin text-[#c20000]" />
                Memuat daftar pengguna...
              </div>
            ) : (
              <select
                required
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-sm px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#c20000] capitalize"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.roles?.[0]?.name || 'user'}) - {u.email}
                  </option>
                ))}
              </select>
            )}
            <p className="text-[11px] text-slate-400">
              User baru akan dapat melihat, mengedit, dan mengelola data ini di dashboard mereka.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="rounded-sm">
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || isLoadingUsers}
              className="bg-[#c20000] hover:bg-[#a30000] text-white rounded-sm font-semibold"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
              Transfer Sekarang
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TransferOwnershipModal;

