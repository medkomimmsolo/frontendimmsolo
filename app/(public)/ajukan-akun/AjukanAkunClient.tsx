'use client';

import { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Loader2, CheckCircle2, UserPlus, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AjukanAkunClient() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', passwordConfirm: '', requested_role: 'komisariat', reason: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password.length < 8) {
      toast.error('Password minimal 8 karakter');
      return;
    }
    if (formData.password !== formData.passwordConfirm) {
      toast.error('Konfirmasi password tidak cocok');
      return;
    }
    setIsLoading(true);
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8010/api/v1';
      await axios.post(`${base}/account-requests`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        requested_role: formData.requested_role,
        reason: formData.reason || undefined,
      });
      setIsSuccess(true);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Gagal mengirim pengajuan';
      const errs = err.response?.data?.errors;
      toast.error(errs ? Object.values(errs).flat().join(', ') : msg);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full border border-slate-200 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000]";

  if (isSuccess) {
    return (
      <main className="min-h-screen bg-slate-50 pt-32 pb-20 px-4 flex items-start justify-center">
        <Card className="max-w-md w-full border-slate-200 shadow-lg">
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-[#0f172a] mb-2" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
              Pengajuan Terkirim
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              Pengajuan akun Anda sudah diterima dan menunggu persetujuan Super Admin. Silakan cek email atau coba login kembali nanti.
            </p>
            <Link href="/login">
              <Button className="bg-[#c20000] hover:bg-[#a30000] text-white">Kembali ke Login</Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pt-28 pb-20 px-4">
      <div className="max-w-lg mx-auto">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#c20000] mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Login
        </Link>
        <Card className="border-slate-200 shadow-lg overflow-hidden">
          <div className="bg-[#0f172a] px-6 py-6 text-center">
            <UserPlus className="w-10 h-10 text-white mx-auto mb-2" />
            <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
              Pengajuan Akun
            </h1>
            <p className="text-xs text-white/60 mt-1">PC IMM Kota Surakarta</p>
          </div>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="Nama lengkap" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="email@contoh.id" className={inputClass} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                  <input type="password" name="password" required value={formData.password} onChange={handleChange} placeholder="Min. 8 karakter" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Konfirmasi Password</label>
                  <input type="password" name="passwordConfirm" required value={formData.passwordConfirm} onChange={handleChange} placeholder="Ulangi password" className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role yang Diajukan</label>
                <select name="requested_role" value={formData.requested_role} onChange={handleChange} className={inputClass}>
                  <option value="komisariat">Komisariat (Kontributor Lokal)</option>
                  <option value="bidang">Bidang (Cabang)</option>
                  <option value="admin">Admin</option>
                </select>
                <p className="text-xs text-slate-400 mt-1">Keputusan akhir tetap di tangan Super Admin.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Alasan / Keterangan <span className="text-slate-400 font-normal">(opsional)</span></label>
                <textarea name="reason" value={formData.reason} onChange={handleChange} rows={3} placeholder="Contoh: Kader komisariat UMS, butuh akses publikasi..." className={`${inputClass} resize-none`} />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full h-11 bg-[#c20000] hover:bg-[#a30000] text-white font-bold">
                {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Kirim Pengajuan
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
