'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Loader2, CheckCircle2, UserPlus, ArrowLeft, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getApiBase, normalizeSettings } from '@/lib/settings';

export default function AjukanAkunClient() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', passwordConfirm: '', requested_role: 'komisariat', reason: '' });
  const [submittedData, setSubmittedData] = useState({ name: '', email: '', requested_role: 'komisariat' });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [adminWa, setAdminWa] = useState('6282226252923');

  useEffect(() => {
    axios.get(`${getApiBase()}/settings`)
      .then((res) => {
        const settings = normalizeSettings(res.data?.data);
        const wa = settings.shortlink_admin_wa || settings.contact_phone;
        if (wa) {
          const cleaned = wa.replace(/[^0-9]/g, '');
          setAdminWa(cleaned.startsWith('0') ? `62${cleaned.slice(1)}` : cleaned);
        }
      })
      .catch(() => {});
  }, []);
  
  // Real-time validation state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newData = { ...formData, [name]: value };
    setFormData(newData);
    
    // Clear error for this field when typing
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Real-time password match check
    if (name === 'password' || name === 'passwordConfirm') {
      if (name === 'passwordConfirm' && value !== newData.password) {
        setValidationErrors(prev => ({ ...prev, passwordConfirm: 'Password tidak cocok' }));
      } else {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.passwordConfirm;
          return newErrors;
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const errors: Record<string, string> = {};
    if (formData.password.length < 8) {
      errors.password = 'Password minimal 8 karakter';
    }
    if (formData.password !== formData.passwordConfirm) {
      errors.passwordConfirm = 'Konfirmasi password tidak cocok';
    }
    if (errors.password || errors.passwordConfirm) {
      setValidationErrors(errors);
      return;
    }
    
    setIsLoading(true);
    try {
      const base = getApiBase();
      await axios.post(`${base}/account-requests`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        requested_role: formData.requested_role,
        reason: formData.reason || undefined,
      });
      setSubmittedData({
        name: formData.name,
        email: formData.email,
        requested_role: formData.requested_role,
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

  const inputClass = "w-full border border-slate-200 rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000]";

  if (isSuccess) {
    const roleLabels: Record<string, string> = {
      komisariat: 'Komisariat (Kontributor Lokal)',
      bidang: 'Bidang (Cabang)',
      admin: 'Admin',
    };
    const roleText = roleLabels[submittedData.requested_role] || submittedData.requested_role;
    const waText = `Halo Admin PC IMM Kota Surakarta,%0A%0ASaya telah mengajukan pendaftaran akun di website immsolo.or.id dengan rincian berikut:%0A%0A- *Nama Lengkap*: ${encodeURIComponent(submittedData.name)}%0A- *Email*: ${encodeURIComponent(submittedData.email)}%0A- *Role*: ${encodeURIComponent(roleText)}%0A%0AMohon bantuannya untuk verifikasi dan persetujuan akun saya. Terima kasih!`;

    return (
      <main className="min-h-screen bg-slate-50 pt-32 pb-20 px-4 flex items-start justify-center">
        <Card className="max-w-md w-full border-slate-200 shadow-lg">
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-[#0f172a] mb-2" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
              Pengajuan Terkirim
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              Pengajuan akun Anda sudah diterima dan menunggu persetujuan Super Admin. Anda dapat mengonfirmasi langsung ke Admin agar akun lebih cepat diverifikasi.
            </p>
            <div className="space-y-3">
              <Button
                asChild
                className="w-full h-11 bg-[#25D366] hover:bg-[#1da851] text-white font-bold flex items-center justify-center gap-2 shadow-sm"
              >
                <a
                  href={`https://wa.me/${adminWa}?text=${waText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="w-4 h-4" /> Konfirmasi via WhatsApp
                </a>
              </Button>
              <Link href="/login" className="block">
                <Button variant="outline" className="w-full h-11 border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold">
                  Kembali ke Login
                </Button>
              </Link>
            </div>
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
                <label htmlFor="ajnama" className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                <input id="ajnama" type="text" name="name" autoComplete="name" required value={formData.name} onChange={handleChange} placeholder="Nama lengkap" className={inputClass} />
              </div>
              <div>
                <label htmlFor="ajemail" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input id="ajemail" type="email" name="email" autoComplete="email" required value={formData.email} onChange={handleChange} placeholder="email@contoh.id" className={inputClass} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ajpassword" className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                  <input id="ajpassword" type="password" name="password" autoComplete="new-password" minLength={8} required aria-invalid={formData.password.length > 0 && formData.password.length < 8} aria-describedby="ajpassword-hint ajpassword-error" value={formData.password} onChange={handleChange} placeholder="Min. 8 karakter" className={inputClass} />
                  <p id="ajpassword-hint" className="text-xs text-slate-400 mt-1">Minimal 8 karakter.</p>
                  {validationErrors.password && <p id="ajpassword-error" role="alert" className="text-xs text-red-600 font-medium mt-1">{validationErrors.password}</p>}
                </div>
                <div>
                  <label htmlFor="ajpasswordconfirm" className="block text-sm font-medium text-slate-700 mb-1">Konfirmasi Password</label>
                  <input id="ajpasswordconfirm" type="password" name="passwordConfirm" autoComplete="new-password" required aria-invalid={formData.passwordConfirm.length > 0 && formData.passwordConfirm !== formData.password} aria-describedby="ajpasswordconfirm-error" value={formData.passwordConfirm} onChange={handleChange} placeholder="Ulangi password" className={inputClass} />
                  {validationErrors.passwordConfirm && <p id="ajpasswordconfirm-error" role="alert" className="text-xs text-red-600 font-medium mt-1">{validationErrors.passwordConfirm}</p>}
                </div>
              </div>
              <div>
                <label htmlFor="ajrole" className="block text-sm font-medium text-slate-700 mb-1">Role yang Diajukan</label>
                <select id="ajrole" name="requested_role" value={formData.requested_role} onChange={handleChange} className={inputClass}>
                  <option value="komisariat">Komisariat (Kontributor Lokal)</option>
                  <option value="bidang">Bidang (Cabang)</option>
                  <option value="admin">Admin</option>
                </select>
                <p className="text-xs text-slate-400 mt-1">Keputusan akhir tetap di tangan Super Admin.</p>
              </div>
              <div>
                <label htmlFor="ajalasan" className="block text-sm font-medium text-slate-700 mb-1">Alasan / Keterangan <span className="text-slate-400 font-normal">(opsional)</span></label>
                <textarea id="ajalasan" name="reason" value={formData.reason} onChange={handleChange} rows={3} placeholder="Contoh: Kader komisariat UMS, butuh akses publikasi..." className={`${inputClass} resize-none`} />
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
