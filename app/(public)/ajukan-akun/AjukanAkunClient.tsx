'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Loader2, CheckCircle2, UserPlus, ArrowLeft, MessageCircle, UserRound, Mail, LockKeyhole, ShieldCheck, Eye, EyeOff, AtSign, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { getApiBase, normalizeSettings } from '@/lib/settings';
import { getUserFacingErrorMessage } from '@/lib/errorMessage';

export default function AjukanAkunClient() {
  const [formData, setFormData] = useState({ name: '', username: '', email: '', password: '', passwordConfirm: '', requested_role: 'komisariat', reason: '' });
  const [submittedData, setSubmittedData] = useState({ name: '', username: '', email: '', requested_role: 'komisariat' });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
        username: formData.username,
        email: formData.email,
        password: formData.password,
        requested_role: formData.requested_role,
        reason: formData.reason || undefined,
      });
      setSubmittedData({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        requested_role: formData.requested_role,
      });
      setIsSuccess(true);
    } catch (err: any) {
      toast.error(getUserFacingErrorMessage(err, 'Pengajuan belum terkirim. Periksa isian, lalu coba lagi.'));
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#c20000] focus:ring-4 focus:ring-[#c20000]/10";
  const iconInputClass = `${inputClass} pl-11`;

  if (isSuccess) {
    const roleLabels: Record<string, string> = {
      komisariat: 'Komisariat (Kontributor Lokal)',
      bidang: 'Bidang (Cabang)',
      admin: 'Admin',
    };
    const roleText = roleLabels[submittedData.requested_role] || submittedData.requested_role;
    const waText = `Halo Admin PC IMM Kota Surakarta,%0A%0ASaya telah mengajukan pendaftaran akun di website immsolo.or.id dengan rincian berikut:%0A%0A- *Nama Lengkap*: ${encodeURIComponent(submittedData.name)}%0A- *Username*: ${encodeURIComponent(submittedData.username)}%0A- *Email*: ${encodeURIComponent(submittedData.email)}%0A- *Role*: ${encodeURIComponent(roleText)}%0A%0AMohon bantuannya untuk verifikasi dan persetujuan akun saya. Terima kasih!`;

    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 pb-16 pt-28">
        <div className="pointer-events-none absolute -left-24 top-32 h-72 w-72 rounded-full bg-red-100/70 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-amber-100/60 blur-3xl" />
        <Card className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-300/40">
          <CardContent className="p-7 text-center sm:p-10">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/60">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-2xs font-semibold uppercase tracking-wider text-emerald-700">
              <ShieldCheck className="h-3.5 w-3.5" /> Pengajuan diterima
            </span>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
              Terima kasih, <span className="break-words">{submittedData.name.split(' ')[0]}</span>!
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
              Pengajuan akun Anda sedang menunggu verifikasi Super Admin. Kami akan mengaktifkan akun setelah permohonan ditinjau.
            </p>
            <div className="my-6 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-left">
              <p className="mb-3 text-2xs font-semibold uppercase tracking-wider text-slate-500">Ringkasan pengajuan</p>
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="min-w-0"><span className="block text-xs text-slate-500">Username</span><span className="break-all font-semibold text-slate-800">@{submittedData.username}</span></div>
                <div className="min-w-0"><span className="block text-xs text-slate-500">Email</span><span className="break-all font-medium text-slate-800">{submittedData.email}</span></div>
                <div className="sm:col-span-2"><span className="block text-xs text-slate-500">Role diajukan</span><span className="font-medium text-slate-800">{roleText}</span></div>
              </div>
            </div>
            <div className="space-y-3">
              <Button
                asChild
                className="h-12 w-full rounded-xl bg-[#25D366] font-bold text-white shadow-sm hover:bg-[#1da851]"
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
                <Button variant="outline" className="h-12 w-full rounded-xl border-slate-200 font-semibold text-slate-700 hover:bg-slate-50">
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
    <main className="relative min-h-screen overflow-hidden bg-[#f6f7fb] px-4 pb-16 pt-28 sm:pt-32">
      <div className="pointer-events-none absolute -left-28 top-40 h-80 w-80 rounded-full bg-red-100/70 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-amber-100/50 blur-3xl" />
      <div className="relative mx-auto max-w-6xl">
        <Link href="/login" className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-red-200 hover:text-[#c20000]">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Login
        </Link>
        <Card className="grid overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-300/40 lg:grid-cols-[0.82fr_1.18fr]">
          <aside className="relative isolate overflow-hidden bg-[#101a30] px-7 py-8 text-white sm:px-10 sm:py-10 lg:flex lg:flex-col lg:justify-between lg:px-11 lg:py-12">
            <div className="pointer-events-none absolute -right-24 -top-20 -z-10 h-72 w-72 rounded-full bg-red-600/25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-28 -left-20 -z-10 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
            <div>
              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white shadow-lg shadow-black/10">
                <UserPlus className="h-7 w-7" />
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-2xs font-semibold uppercase tracking-[0.18em] text-white/70">
                <span className="h-1.5 w-1.5 rounded-full bg-[#fcd34d]" /> Portal Keanggotaan
              </span>
              <h1 className="mt-5 max-w-sm text-3xl font-bold leading-tight tracking-tight sm:text-4xl" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
                Bergabung dan berkontribusi bersama IMM.
              </h1>
              <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">
                Ajukan akun pengelola untuk mendukung publikasi dan pengelolaan informasi PC IMM Kota Surakarta.
              </p>
            </div>
            <div className="mt-8 grid gap-3 md:grid-cols-2 lg:mt-12 lg:grid-cols-1">
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
                <div><p className="text-sm font-semibold text-white">Verifikasi admin</p><p className="mt-1 text-xs leading-5 text-slate-400">Akun aktif setelah pengajuan ditinjau dan disetujui.</p></div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
                <div><p className="text-sm font-semibold text-white">Kredensial aman</p><p className="mt-1 text-xs leading-5 text-slate-400">Gunakan username unik dan kata sandi minimal 8 karakter.</p></div>
              </div>
            </div>
            <p className="mt-8 hidden text-2xs tracking-wide text-slate-500 lg:block">PC IMM KOTA SURAKARTA</p>
          </aside>

          <section className="px-6 py-7 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
            <div className="mb-7">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#c20000]">Mulai di sini</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>Pengajuan Akun</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Lengkapi data berikut. Pastikan username dan email aktif sebelum mengirim.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="ajnama" className="mb-1.5 block text-xs font-bold text-slate-700">Nama Lengkap</label>
                  <div className="relative"><UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input id="ajnama" type="text" name="name" autoComplete="name" required value={formData.name} onChange={handleChange} placeholder="Nama sesuai identitas" className={iconInputClass} /></div>
                </div>
                <div>
                  <label htmlFor="ajusername" className="mb-1.5 block text-xs font-bold text-slate-700">Username Login</label>
                  <div className="relative"><AtSign className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input id="ajusername" type="text" name="username" autoComplete="username" minLength={3} maxLength={60} pattern="[A-Za-z0-9_-]+" required value={formData.username} onChange={handleChange} placeholder="contoh_username" className={iconInputClass} /></div>
                  <p className="mt-1.5 text-2xs text-slate-400">Huruf, angka, _ atau - (min. 3 karakter).</p>
                </div>
              </div>
              <div>
                <label htmlFor="ajemail" className="mb-1.5 block text-xs font-bold text-slate-700">Alamat Email</label>
                <div className="relative"><Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input id="ajemail" type="email" name="email" autoComplete="email" required value={formData.email} onChange={handleChange} placeholder="nama@email.com" className={iconInputClass} /></div>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="ajpassword" className="mb-1.5 block text-xs font-bold text-slate-700">Kata Sandi</label>
                  <div className="relative"><LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input id="ajpassword" type={showPassword ? 'text' : 'password'} name="password" autoComplete="new-password" minLength={8} required aria-invalid={formData.password.length > 0 && formData.password.length < 8} aria-describedby="ajpassword-hint ajpassword-error" value={formData.password} onChange={handleChange} placeholder="Minimal 8 karakter" className={`${iconInputClass} pr-11`} /><button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-700" aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
                  <p id="ajpassword-hint" className="mt-1.5 text-2xs text-slate-400">Minimal 8 karakter.</p>
                  {validationErrors.password && <p id="ajpassword-error" role="alert" className="mt-1 text-xs font-medium text-red-600">{validationErrors.password}</p>}
                </div>
                <div>
                  <label htmlFor="ajpasswordconfirm" className="mb-1.5 block text-xs font-bold text-slate-700">Konfirmasi Kata Sandi</label>
                  <div className="relative"><LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input id="ajpasswordconfirm" type={showPassword ? 'text' : 'password'} name="passwordConfirm" autoComplete="new-password" required aria-invalid={formData.passwordConfirm.length > 0 && formData.passwordConfirm !== formData.password} aria-describedby="ajpasswordconfirm-error" value={formData.passwordConfirm} onChange={handleChange} placeholder="Ulangi kata sandi" className={iconInputClass} /></div>
                  {validationErrors.passwordConfirm && <p id="ajpasswordconfirm-error" role="alert" className="mt-1 text-xs font-medium text-red-600">{validationErrors.passwordConfirm}</p>}
                </div>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="ajrole" className="mb-1.5 block text-xs font-bold text-slate-700">Role yang Diajukan</label>
                  <select id="ajrole" name="requested_role" value={formData.requested_role} onChange={handleChange} className={inputClass}>
                    <option value="komisariat">Komisariat (Kontributor Lokal)</option>
                    <option value="bidang">Bidang (Cabang)</option>
                    <option value="admin">Admin</option>
                  </select>
                  <p className="mt-1.5 text-2xs text-slate-400">Role final ditentukan oleh admin.</p>
                </div>
                <div>
                  <label htmlFor="ajalasan" className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-700"><FileText className="h-3.5 w-3.5 text-slate-400" /> Alasan / Keterangan <span className="font-normal text-slate-400">(opsional)</span></label>
                  <textarea id="ajalasan" name="reason" value={formData.reason} onChange={handleChange} rows={3} placeholder="Ceritakan kebutuhan akses Anda..." className={`${inputClass} resize-none`} />
                </div>
              </div>
              <div className="border-t border-slate-100 pt-5">
                <Button type="submit" disabled={isLoading} className="h-12 w-full rounded-xl bg-[#c20000] font-bold text-white shadow-lg shadow-red-900/15 hover:bg-[#a00000]">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                  {isLoading ? 'Mengirim pengajuan...' : 'Kirim Pengajuan'}
                </Button>
                <p className="mt-3 text-center text-2xs leading-5 text-slate-400">Dengan mengirim pengajuan, data Anda akan ditinjau oleh administrator portal.</p>
              </div>
            </form>
          </section>
        </Card>
      </div>
    </main>
  );
}
