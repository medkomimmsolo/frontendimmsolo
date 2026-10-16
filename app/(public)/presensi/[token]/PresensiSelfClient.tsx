'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getApiBase } from '@/lib/settings';
import { getDeviceFingerprint } from '@/lib/deviceFingerprint';
import { Button } from '@/components/ui/Button';
import type { PresensiFormField } from '@/types';
import { AlertCircle, CalendarDays, CheckCircle2, Loader2, MapPin, ShieldCheck, UserCheck } from 'lucide-react';

interface SesiItem {
  id: number;
  name: string;
  starts_at: string | null;
  ends_at: string | null;
  is_open: boolean;
  is_receiving: boolean;
}

interface Session {
  id: number;
  title: string;
  slug: string;
  location: string | null;
  starts_at: string | null;
  ends_at: string | null;
  is_receiving: boolean;
  is_open: boolean;
  total_peserta: number;
  form_fields: PresensiFormField[];
  sesis?: SesiItem[];
  active_sesi_id?: number | null;
  active_sesi_name?: string | null;
}

interface Props {
  token: string;
}

type FormData = Record<string, string | string[]>;

export function PresensiSelfClient({ token }: Props) {
  const base = getApiBase();
  const searchParams = useSearchParams();
  const sesiParam = searchParams.get('sesi');
  const sesiId = sesiParam ? Number(sesiParam) : null;
  const [session, setSession] = useState<Session | null>(null);
  const [formData, setFormData] = useState<FormData>({});
  const [loadError, setLoadError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState<{ nama: string; status: string; already: boolean } | null>(null);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const query = sesiId ? `?sesi_id=${sesiId}` : '';
        const response = await fetch(`${base}/presensi-public/${token}${query}`);
        const json = await response.json();
        if (!response.ok || !json.success) throw new Error(json.message || 'Sesi tidak ditemukan');
        setSession(json.data);
        setFormData(Object.fromEntries(
          (json.data.form_fields as PresensiFormField[]).map((field) => [field.key, field.type === 'checkbox' ? [] : '']),
        ));
      } catch (error) {
        setLoadError((error as Error).message || 'Sesi tidak ditemukan');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [base, token, sesiId]);

  const updateValue = (key: string, value: string | string[]) => {
    setFormData((current) => ({ ...current, [key]: value }));
    setSubmitError('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session?.is_receiving) return;
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const response = await fetch(`${base}/presensi-public/${token}/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          data: formData,
          device: getDeviceFingerprint(),
          sesi_id: sesiId ?? undefined,
        }),
      });
      const json = await response.json();
      if (!response.ok || !json.success) {
        const validationMessage = json.errors
          ? Object.values(json.errors as Record<string, string[]>).flat().join(' ')
          : '';
        setSubmitError(validationMessage || json.message || 'Gagal mencatat kehadiran');
        return;
      }
      setDone({ nama: json.data.peserta.nama, status: json.data.status, already: json.data.already });
    } catch {
      setSubmitError('Terjadi kesalahan jaringan. Periksa koneksi Anda lalu coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50"><Loader2 className="h-8 w-8 animate-spin text-[#c20000]" /></div>;
  }

  if (loadError || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-3 h-12 w-12 text-red-400" />
          <h1 className="mb-1 text-lg font-bold text-slate-800">Sesi Tidak Ditemukan</h1>
          <p className="text-sm text-slate-500">{loadError || 'Tautan presensi mungkin tidak valid atau sudah kedaluwarsa.'}</p>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md animate-in rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm zoom-in-95 duration-200">
          <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-emerald-500" />
          <h1 className="mb-1 text-xl font-bold text-slate-800">{done.already ? 'Anda Sudah Tercatat' : 'Kehadiran Tercatat!'}</h1>
          <p className="mt-1 text-base font-semibold text-slate-700">{done.nama}</p>
          {session.active_sesi_name && <p className="mt-1 text-xs text-slate-500">Sesi: <strong>{session.active_sesi_name}</strong></p>}
          <div className={`mt-4 inline-flex rounded-full border px-3.5 py-1 text-xs font-bold ${done.status === 'telat' ? 'border-amber-200 bg-amber-50 text-amber-600' : 'border-emerald-200 bg-emerald-50 text-emerald-600'}`}>
            {done.status === 'telat' ? 'Status: Telat' : 'Status: Hadir Tepat Waktu'}
          </div>
          <p className="mt-6 text-xs text-slate-400">Terima kasih telah melakukan presensi. Anda boleh menutup halaman ini.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-lg">
        <header className="mb-4 rounded-2xl bg-[#0f172a] p-6 text-white">
          <div className="mb-3 inline-flex items-center rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium">
            <UserCheck className="mr-1.5 h-3.5 w-3.5 text-[#c20000]" /> Form Presensi
          </div>
          <h1 className="mb-2 text-xl font-bold">{session.title}</h1>
          {session.active_sesi_name && <div className="mb-2 inline-flex rounded-full bg-[#c20000] px-2.5 py-0.5 text-xs font-bold">{session.active_sesi_name}</div>}
          <div className="space-y-1 text-sm text-white/70">
            {session.location && <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-white/50" />{session.location}</div>}
            {session.starts_at && <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-white/50" />{new Date(session.starts_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}</div>}
          </div>
        </header>

        <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs text-emerald-700">
          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>Isi data diri untuk mencatat kehadiran. Tidak perlu login.</span>
        </div>

        {!session.is_receiving && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <span>Presensi sedang ditutup. Silakan hubungi petugas.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <h2 className="text-base font-bold text-slate-900">Data Kehadiran</h2>
            <p className="mt-1 text-xs text-slate-500">Kolom bertanda * wajib diisi.</p>
          </div>
          {session.form_fields.map((field) => {
            const commonClass = 'mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000]';
            const value = formData[field.key];

            return (
              <div key={field.key}>
                <label htmlFor={`field-${field.key}`} className="block text-sm font-semibold text-slate-700">
                  {field.label}{field.required && <span className="text-[#c20000]"> *</span>}
                </label>
                {field.type === 'textarea' ? (
                  <textarea id={`field-${field.key}`} value={typeof value === 'string' ? value : ''} onChange={(event) => updateValue(field.key, event.target.value)} required={field.required} rows={3} className={commonClass} />
                ) : field.type === 'select' ? (
                  <select id={`field-${field.key}`} value={typeof value === 'string' ? value : ''} onChange={(event) => updateValue(field.key, event.target.value)} required={field.required} className={commonClass}>
                    <option value="">Pilih jawaban</option>
                    {(field.options || []).map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                ) : field.type === 'checkbox' ? (
                  <div className="mt-2 space-y-2">
                    {(field.options || []).map((option) => {
                      const checkedValues = Array.isArray(value) ? value : [];
                      return (
                        <label key={option} className="flex items-center gap-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={checkedValues.includes(option)}
                            onChange={(event) => updateValue(field.key, event.target.checked ? [...checkedValues, option] : checkedValues.filter((item) => item !== option))}
                            className="h-4 w-4 accent-[#c20000]"
                          />
                          {option}
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <input
                    id={`field-${field.key}`}
                    type={field.type === 'phone' ? 'tel' : field.type}
                    value={typeof value === 'string' ? value : ''}
                    onChange={(event) => updateValue(field.key, event.target.value)}
                    required={field.required}
                    className={commonClass}
                  />
                )}
              </div>
            );
          })}

          {submitError && (
            <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <p>{submitError}</p>
            </div>
          )}

          <Button type="submit" disabled={isSubmitting || !session.is_receiving} className="h-12 w-full rounded-xl bg-[#c20000] font-bold text-white hover:bg-[#a30000] disabled:opacity-50">
            {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
            Kirim Presensi
          </Button>
        </form>
        <p className="mt-6 text-center text-xs text-slate-400">PC IMM Kota Surakarta — Sistem Presensi Digital</p>
      </div>
    </div>
  );
}
