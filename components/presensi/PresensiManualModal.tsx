'use client';

import { useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Loader2, Plus, UserPlus, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  presensiId: number;
  onClose: () => void;
  onCreated: () => void;
}

const inputCls =
  'w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-700 focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] outline-none shadow-xs transition-all';

export function PresensiManualModal({ isOpen, presensiId, onClose, onCreated }: Props) {
  const [nama, setNama] = useState('');
  const [asal, setAsal] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [kode, setKode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) {
      toast.error('Nama peserta wajib diisi');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/presensi/${presensiId}/peserta`, {
        nama: nama.trim(),
        asal: asal.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
        kode: kode.trim() || null,
      });

      toast.success(`Peserta "${nama.trim()}" berhasil ditambahkan`);
      setNama('');
      setAsal('');
      setPhone('');
      setEmail('');
      setKode('');
      onCreated();
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Gagal menambahkan peserta');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="manual-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-[#c20000] flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <h3 id="manual-modal-title" className="text-base font-bold text-slate-900">
              Tambah Peserta Manual
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="manual-nama" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              id="manual-nama"
              type="text"
              required
              placeholder="cth. Ahmad Dahlan"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className={inputCls}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="manual-asal" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Asal / Instansi
              </label>
              <input
                id="manual-asal"
                type="text"
                placeholder="cth. PK IMM AR Fakhruddin"
                value={asal}
                onChange={(e) => setAsal(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="manual-kode" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Kode / NIM (Opsional)
              </label>
              <input
                id="manual-kode"
                type="text"
                placeholder="cth. 042 atau L-01"
                value={kode}
                onChange={(e) => setKode(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="manual-phone" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                No. WhatsApp / HP
              </label>
              <input
                id="manual-phone"
                type="tel"
                placeholder="cth. 08123456789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="manual-email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email (Opsional)
              </label>
              <input
                id="manual-email"
                type="email"
                placeholder="cth. ahmad@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <Button type="button" onClick={onClose} variant="outline" className="h-10 px-4 rounded-xl text-xs font-bold">
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !nama.trim()}
              className="h-10 px-5 bg-[#c20000] hover:bg-[#a30000] text-white rounded-xl text-xs font-bold"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-1.5" />
              )}
              Simpan Peserta
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
