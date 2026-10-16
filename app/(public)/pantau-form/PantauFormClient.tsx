'use client';

import { FormEvent, useState } from 'react';
import { getApiBase } from '@/lib/settings';
import { resolveMediaUrl } from '@/lib/imageUtils';
import { Button } from '@/components/ui/Button';
import { AlertCircle, ArrowLeft, ChevronLeft, ChevronRight, FileText, KeyRound, Loader2, RefreshCw, ShieldCheck } from 'lucide-react';

interface Field {
  id: number;
  label: string;
  type: string;
  options: string[] | null;
}

type Answer = string | number | boolean | string[] | null;

interface ResponseItem {
  id: number;
  email: string | null;
  data: Record<string, Answer>;
  created_at: string;
}

interface MonitorData {
  form: { title: string };
  fields: Field[];
  responses: {
    data: ResponseItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export function PantauFormClient() {
  const [tokenInput, setTokenInput] = useState('');
  const [activeToken, setActiveToken] = useState('');
  const [monitorData, setMonitorData] = useState<MonitorData | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchResponses = async (token: string, pageNumber: number) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${getApiBase()}/form-monitor/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ token, page: pageNumber, per_page: 50 }),
      });
      const json = await response.json();
      if (!response.ok || !json.success) {
        if (response.status === 404 || response.status === 422) {
          throw new Error('Token tidak valid atau akses pemantau sudah dicabut.');
        }
        throw new Error(json.message || 'Gagal memuat respons formulir.');
      }
      setActiveToken(token);
      setTokenInput(token);
      setPage(pageNumber);
      setMonitorData(json.data);
    } catch (fetchError) {
      setError((fetchError as Error).message || 'Koneksi gagal. Silakan coba lagi.');
      setMonitorData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitToken = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = tokenInput.trim();
    if (token.length !== 64) {
      setError('Token harus terdiri dari 64 karakter.');
      return;
    }
    void fetchResponses(token, 1);
  };

  const renderAnswer = (value: Answer, field: Field) => {
    if (value === null || value === '') return <span className="text-slate-300">—</span>;
    const values = Array.isArray(value) ? value : [value];
    if (field.type === 'file' && typeof values[0] === 'string') {
      const fileUrl = resolveMediaUrl(values[0]);
      return (
        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-700 underline">
          <FileText className="h-3.5 w-3.5" /> Buka berkas
        </a>
      );
    }
    return values.map(String).join(', ');
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 rounded-2xl bg-[#0f172a] p-6 text-white sm:p-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
            <ShieldCheck className="h-4 w-4 text-emerald-300" /> Akses Pemantau
          </div>
          <h1 className="text-2xl font-bold sm:text-3xl">Pantau Respons Formulir</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/70">
            Masukkan token yang diberikan pengelola untuk melihat respons pendaftar. Halaman ini hanya menyediakan akses baca.
          </p>
        </header>

        {!monitorData ? (
          <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-red-50 p-2.5 text-[#c20000]"><KeyRound className="h-5 w-5" /></div>
              <div>
                <h2 className="font-bold text-slate-900">Masukkan Token Pemantau</h2>
                <p className="mt-0.5 text-xs text-slate-500">Token diberikan oleh admin/pengelola formulir.</p>
              </div>
            </div>
            <form onSubmit={handleSubmitToken} className="space-y-3">
              <label htmlFor="monitor-token" className="block text-xs font-semibold text-slate-600">Token (64 karakter)</label>
              <input
                id="monitor-token"
                value={tokenInput}
                onChange={(event) => { setTokenInput(event.target.value); setError(''); }}
                maxLength={64}
                autoComplete="off"
                spellCheck={false}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-3 font-mono text-sm text-slate-800 outline-none focus:border-[#c20000] focus:ring-2 focus:ring-[#c20000]/15"
                placeholder="Tempel token di sini"
                required
              />
              {error && (
                <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
                </div>
              )}
              <Button type="submit" disabled={isLoading} className="h-11 w-full rounded-xl bg-[#c20000] font-bold text-white hover:bg-[#a30000]">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                Akses Respons
              </Button>
            </form>
          </section>
        ) : (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{monitorData.form.title}</h2>
                <p className="mt-1 text-xs text-slate-500">
                  {monitorData.responses.total} respons · halaman {monitorData.responses.current_page} dari {monitorData.responses.last_page}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => void fetchResponses(activeToken, page)}
                  disabled={isLoading}
                  variant="outline"
                  className="h-9 rounded-lg text-xs font-semibold"
                >
                  {isLoading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-1.5 h-4 w-4" />}
                  Segarkan
                </Button>
                <Button
                  onClick={() => { setMonitorData(null); setActiveToken(''); setTokenInput(''); setError(''); }}
                  variant="outline"
                  className="h-9 rounded-lg text-xs font-semibold"
                >
                  <ArrowLeft className="mr-1.5 h-4 w-4" /> Ganti Token
                </Button>
              </div>
            </div>

            {error && (
              <div role="alert" className="m-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full min-w-max border-collapse text-left text-xs">
                <thead className="sticky top-0 bg-slate-50 text-slate-600">
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-3 font-bold">No.</th>
                    <th className="px-4 py-3 font-bold">ID Pendaftar</th>
                    <th className="px-4 py-3 font-bold">Waktu Kirim</th>
                    <th className="px-4 py-3 font-bold">Email</th>
                    {monitorData.fields.map((field) => <th key={field.id} className="px-4 py-3 font-bold">{field.label}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {monitorData.responses.data.length === 0 ? (
                    <tr>
                      <td colSpan={monitorData.fields.length + 4} className="px-4 py-12 text-center text-slate-500">
                        Belum ada respons pendaftar.
                      </td>
                    </tr>
                  ) : monitorData.responses.data.map((item, index) => (
                    <tr key={item.id} className="align-top hover:bg-slate-50/70">
                      <td className="px-4 py-3 text-slate-400">{(page - 1) * monitorData.responses.per_page + index + 1}</td>
                      <td className="px-4 py-3 font-mono text-slate-600">#{item.id}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                        {new Date(item.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{item.email || '—'}</td>
                      {monitorData.fields.map((field) => (
                        <td key={field.id} className="max-w-xs whitespace-pre-wrap px-4 py-3 text-slate-700">
                          {renderAnswer(item.data?.[String(field.id)] ?? item.data?.[field.id], field)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <footer className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3">
              <span className="text-xs text-slate-500">Hanya-baca · akses menggunakan token</span>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => void fetchResponses(activeToken, Math.max(1, page - 1))}
                  disabled={isLoading || page <= 1}
                  variant="outline"
                  className="h-8 rounded-lg px-2.5 text-xs"
                  aria-label="Halaman sebelumnya"
                >
                  <ChevronLeft className="h-4 w-4" /> Sebelumnya
                </Button>
                <Button
                  onClick={() => void fetchResponses(activeToken, Math.min(monitorData.responses.last_page, page + 1))}
                  disabled={isLoading || page >= monitorData.responses.last_page}
                  variant="outline"
                  className="h-8 rounded-lg px-2.5 text-xs"
                  aria-label="Halaman berikutnya"
                >
                  Berikutnya <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </footer>
          </section>
        )}
        <p className="mt-6 text-center text-xs text-slate-400">PC IMM Kota Surakarta · Akses pemantau formulir</p>
      </div>
    </main>
  );
}
