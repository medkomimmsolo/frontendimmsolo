'use client';

import { FormEvent, useState } from 'react';
import { getApiBase } from '@/lib/settings';
import { resolveMediaUrl } from '@/lib/imageUtils';
import { backendOrigin } from '@/lib/env';
import { Button } from '@/components/ui/Button';
import { AlertCircle, ArrowLeft, ChevronLeft, ChevronRight, ExternalLink, FileText, KeyRound, Loader2, RefreshCw, Search, ShieldCheck, X } from 'lucide-react';

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
  form: { title: string; require_email: boolean };
  fields: Field[];
  responses: {
    data: ResponseItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

function getColumnLetter(index: number): string {
  let current = index;
  let result = '';
  while (current >= 0) {
    result = String.fromCharCode((current % 26) + 65) + result;
    current = Math.floor(current / 26) - 1;
  }
  return result;
}

function getFileName(path: string): string {
  return decodeURIComponent(path.split('/').pop()?.split('?')[0] || 'Lihat berkas');
}

function isPreviewableFile(path: string): boolean {
  const extension = getFileName(path).split('.').pop()?.toLowerCase();
  return ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'].includes(extension || '');
}

function getFilePreviewUrl(path: string): string {
  const mediaUrl = resolveMediaUrl(path);

  try {
    const url = new URL(mediaUrl, window.location.origin);
    if (url.origin === new URL(backendOrigin()).origin && url.pathname.startsWith('/storage/')) {
      return `${url.pathname}${url.search}`;
    }
  } catch {
    return mediaUrl;
  }

  return mediaUrl;
}

export function PantauFormClient() {
  const [tokenInput, setTokenInput] = useState('');
  const [activeToken, setActiveToken] = useState('');
  const [monitorData, setMonitorData] = useState<MonitorData | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedResponse, setSelectedResponse] = useState<ResponseItem | null>(null);
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  const fetchResponses = async (token: string, pageNumber: number, search = activeSearch) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${getApiBase()}/form-monitor/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ token, page: pageNumber, per_page: 50, search }),
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
      setActiveSearch(search);
      setSearchInput(search);
      setMonitorData(json.data);
    } catch (fetchError) {
      setError((fetchError as Error).message || 'Koneksi gagal. Silakan coba lagi.');
      if (!activeToken) setMonitorData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitToken = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = tokenInput.trim();
    if (!/^(?:[A-Za-z0-9]{8}|[A-Za-z0-9]{64})$/.test(token)) {
      setError('Masukkan token 8 karakter. Token lama 64 karakter yang sudah diterbitkan tetap dapat digunakan.');
      return;
    }
    void fetchResponses(token, 1);
  };

  const getAnswer = (response: ResponseItem, field: Field): Answer => (
    response.data?.[String(field.id)] ?? response.data?.[field.id] ?? null
  );

  const renderAnswer = (value: Answer, field: Field) => {
    if (value === null || value === '') return <span className="text-slate-300">-</span>;
    const values = Array.isArray(value) ? value : [value];
    if (field.type === 'file' && typeof values[0] === 'string') {
      return (
        <button
          type="button"
          onClick={(event) => { event.stopPropagation(); setPreviewFile(values[0] as string); }}
          className="inline-flex max-w-[220px] items-center gap-1.5 truncate rounded border border-blue-200 bg-blue-50 px-2 py-1 text-left text-[11px] font-medium text-blue-700 transition-colors hover:bg-blue-100"
          title="Pratinjau berkas"
        >
          <FileText className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{getFileName(values[0] as string)}</span>
        </button>
      );
    }
    return values.map(String).join(', ');
  };

  const hasEmail = Boolean(monitorData?.form.require_email || monitorData?.responses.data.some((response) => response.email));
  const columnCount = (monitorData?.fields.length || 0) + (hasEmail ? 3 : 2);

  return (
    <main className="min-h-screen bg-slate-50/70 pt-28 pb-20">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <header className="mb-8 border-b border-slate-200/80 pb-6 sm:mb-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#c20000]">
            <ShieldCheck className="h-3.5 w-3.5" /> Akses Pemantau · Hanya Baca
          </div>
          <h1
            className="text-3xl font-extrabold tracking-tight text-[#0f172a] md:text-4xl"
            style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
          >
            Pantau Respons Formulir
          </h1>
          {!monitorData && (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 md:text-base">
              Masukkan token dari pengelola formulir untuk melihat respons pendaftar.
            </p>
          )}
        </header>

        {!monitorData ? (
          <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-red-50 p-2.5 text-[#c20000]"><KeyRound className="h-5 w-5" /></div>
              <div>
                <h2 className="font-bold text-slate-900">Masukkan Token Pemantau</h2>
                <p className="mt-0.5 text-xs text-slate-500">Token baru terdiri dari 8 karakter. Token lama 64 karakter tetap dapat digunakan.</p>
              </div>
            </div>
            <form onSubmit={handleSubmitToken} className="space-y-3">
              <label htmlFor="monitor-token" className="block text-xs font-semibold text-slate-600">Token Pemantau (8 karakter)</label>
              <input
                id="monitor-token"
                value={tokenInput}
                onChange={(event) => { setTokenInput(event.target.value.replace(/[^a-z0-9]/gi, '').slice(0, 64)); setError(''); }}
                maxLength={64}
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-3 font-mono text-lg font-bold uppercase tracking-[0.3em] text-slate-800 outline-none focus:border-[#c20000] focus:ring-2 focus:ring-[#c20000]/15"
                placeholder="AB12CD34"
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
          <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
            <div className="flex flex-col gap-4 border-b border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold text-slate-900">{monitorData.form.title}</h2>
                <p className="mt-1 text-xs text-slate-500">
                  {monitorData.responses.total} {activeSearch ? 'hasil ditemukan' : 'responden'} {page > 1 || monitorData.responses.last_page > 1 ? `· halaman ${page} dari ${monitorData.responses.last_page}` : ''}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => void fetchResponses(activeToken, page, activeSearch)}
                  disabled={isLoading}
                  variant="outline"
                  className="h-9 rounded-lg text-xs font-semibold"
                >
                  {isLoading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-1.5 h-4 w-4" />}
                  Segarkan
                </Button>
                <Button
                  onClick={() => { setMonitorData(null); setActiveToken(''); setTokenInput(''); setError(''); setSearchInput(''); setActiveSearch(''); }}
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

            <div className="flex items-center justify-between border-b border-slate-300 bg-[#f1f3f4] px-4 py-2 text-[11px] font-mono text-slate-600">
              <span><strong className="mr-3 text-slate-700">fx</strong>Formulir: {monitorData.form.title} | Total Kolom: {monitorData.fields.length + (hasEmail ? 2 : 1)}</span>
              <span className="hidden sm:inline">Geser tabel untuk melihat seluruh kolom</span>
            </div>

            <form
              onSubmit={(event) => { event.preventDefault(); void fetchResponses(activeToken, 1, searchInput.trim()); }}
              className="flex flex-col gap-2 border-b border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between sm:px-4"
            >
              <label htmlFor="public-response-search" className="sr-only">Cari respons</label>
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="public-response-search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  maxLength={100}
                  placeholder="Cari nama, email, atau jawaban..."
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-800 outline-none transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading} className="h-10 flex-1 rounded-lg bg-emerald-700 px-4 text-xs font-semibold text-white hover:bg-emerald-800 sm:flex-none">
                  {isLoading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Search className="mr-1.5 h-4 w-4" />}
                  Cari
                </Button>
                {activeSearch && (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isLoading}
                    onClick={() => { setSearchInput(''); void fetchResponses(activeToken, 1, ''); }}
                    className="h-10 rounded-lg px-3 text-xs font-semibold"
                  >
                    Hapus
                  </Button>
                )}
              </div>
            </form>

            <div className="max-h-[70vh] overflow-auto border-b border-slate-300">
              <table className="w-full min-w-max border-collapse border border-slate-300 bg-white text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-300 bg-[#e9ecef] font-mono text-[11px] font-bold text-slate-600">
                    <th className="w-12 border-r border-slate-300 bg-[#dee2e6] p-1 text-center text-slate-500">#</th>
                    <th className="border-r border-slate-300 px-3 py-1 text-center">{getColumnLetter(0)}</th>
                    {hasEmail && <th className="border-r border-slate-300 px-3 py-1 text-center">{getColumnLetter(1)}</th>}
                    {monitorData.fields.map((_, index) => (
                      <th key={index} className="border-r border-slate-300 px-3 py-1 text-center">
                        {getColumnLetter(index + (hasEmail ? 2 : 1))}
                      </th>
                    ))}
                  </tr>
                  <tr className="sticky top-0 z-10 border-b border-slate-300 bg-[#f8f9fa] text-xs font-semibold text-slate-700 shadow-sm">
                    <th className="w-12 border-r border-slate-300 bg-[#e9ecef] p-2.5 text-center font-mono text-slate-500">No</th>
                    <th className="min-w-[150px] whitespace-nowrap border-r border-slate-300 px-3 py-2.5">Waktu Submit</th>
                    {hasEmail && <th className="min-w-[190px] whitespace-nowrap border-r border-slate-300 px-3 py-2.5">Email Responden</th>}
                    {monitorData.fields.map((field) => (
                      <th key={field.id} className="min-w-[180px] max-w-[280px] border-r border-slate-300 px-3 py-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate" title={field.label}>{field.label}</span>
                          <span className="shrink-0 rounded bg-slate-200 px-1 py-0.5 text-[9px] font-mono uppercase text-slate-600">{field.type}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {monitorData.responses.data.length === 0 ? (
                    <tr>
                      <td colSpan={columnCount} className="bg-slate-50/50 p-14 text-center text-slate-500">
                        <FileText className="mx-auto mb-2 h-10 w-10 text-slate-300" />
                        <p className="font-semibold text-slate-700">{activeSearch ? 'Tidak ada respons yang cocok dengan pencarian.' : 'Belum ada data pendaftar pada formulir ini'}</p>
                      </td>
                    </tr>
                  ) : monitorData.responses.data.map((item, index) => (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedResponse(item)}
                      className={`cursor-pointer align-top transition-colors hover:bg-emerald-50/40 ${index % 2 ? 'bg-slate-50/40' : 'bg-white'}`}
                    >
                      <td className="w-12 select-none border-r border-slate-300 bg-[#f8f9fa] p-2 text-center font-mono text-[11px] text-slate-500">
                        {(page - 1) * monitorData.responses.per_page + index + 1}
                      </td>
                      <td className="whitespace-nowrap border-r border-slate-200 px-3 py-2 text-[11px] text-slate-600">
                        {new Date(item.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      {hasEmail && (
                        <td className="whitespace-nowrap border-r border-slate-200 px-3 py-2 font-mono text-[11px] text-slate-800">
                          {item.email ? <span className="inline-flex items-center gap-1.5 rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-emerald-900"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />{item.email}</span> : <span className="text-slate-300">-</span>}
                        </td>
                      )}
                      {monitorData.fields.map((field) => (
                        <td key={field.id} className="max-w-[280px] truncate border-r border-slate-200 px-3 py-2 text-slate-800" title={String(getAnswer(item, field) ?? '')}>
                          {renderAnswer(getAnswer(item, field), field)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <footer className="flex flex-col gap-3 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs text-slate-500">Hanya-baca · akses menggunakan token</span>
              <div className="flex items-center justify-between gap-2 sm:justify-end">
                <span className="text-xs text-slate-500">Halaman {page} / {monitorData.responses.last_page}</span>
                <Button
                  onClick={() => void fetchResponses(activeToken, Math.max(1, page - 1), activeSearch)}
                  disabled={isLoading || page <= 1}
                  variant="outline"
                  className="h-9 rounded-lg px-2.5 text-xs"
                  aria-label="Halaman sebelumnya"
                >
                  <ChevronLeft className="h-4 w-4 sm:mr-1" /><span className="hidden sm:inline">Sebelumnya</span>
                </Button>
                <Button
                  onClick={() => void fetchResponses(activeToken, Math.min(monitorData.responses.last_page, page + 1), activeSearch)}
                  disabled={isLoading || page >= monitorData.responses.last_page}
                  variant="outline"
                  className="h-9 rounded-lg px-2.5 text-xs"
                  aria-label="Halaman berikutnya"
                >
                  <span className="hidden sm:inline">Berikutnya</span><ChevronRight className="h-4 w-4 sm:ml-1" />
                </Button>
              </div>
            </footer>
          </section>
        )}
        <p className="mt-6 text-center text-xs text-slate-400">PC IMM Kota Surakarta · Akses pemantau formulir</p>
      </div>

      {selectedResponse && monitorData && (
        <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-slate-900/60 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={() => setSelectedResponse(null)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="response-detail-title"
            className="my-0 max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl border border-slate-200/90 bg-white p-4 shadow-2xl sm:my-8 sm:max-h-[90vh] sm:max-w-2xl sm:rounded-2xl sm:p-7"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-mono font-semibold uppercase text-emerald-800">Data Responden #{selectedResponse.id}</span>
                <h2 id="response-detail-title" className="mt-2 text-lg font-bold text-[#0f172a]">Rincian Jawaban Formulir</h2>
                <p className="mt-0.5 text-xs text-slate-500">Disubmit pada: {new Date(selectedResponse.created_at).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}</p>
              </div>
              <button type="button" onClick={() => setSelectedResponse(null)} aria-label="Tutup detail" className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            {selectedResponse.email && (
              <div className="mb-4 flex flex-col gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 sm:flex-row sm:items-center sm:justify-between">
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-950"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Email Responden</span>
                <span className="break-all rounded-lg border border-emerald-300 bg-white px-2.5 py-1 font-mono text-xs font-bold text-emerald-900">{selectedResponse.email}</span>
              </div>
            )}
            <div className="space-y-3">
              {monitorData.fields.map((field, index) => {
                const value = getAnswer(selectedResponse, field);
                const hasFile = field.type === 'file' && typeof value === 'string' && value.length > 0;
                return (
                  <div key={field.id} className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4">
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-700">{index + 1}. {field.label}</span>
                      <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-mono uppercase text-slate-500">{field.type}</span>
                    </div>
                    {hasFile ? (
                      <button
                        type="button"
                        onClick={() => setPreviewFile(value as string)}
                        className="mt-2 inline-flex min-h-10 max-w-full items-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-2 text-left text-xs font-semibold text-blue-800 hover:bg-blue-50"
                      >
                        <FileText className="h-4 w-4 shrink-0 text-blue-600" />
                        <span className="truncate">{getFileName(value as string)}</span>
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                      </button>
                    ) : Array.isArray(value) ? (
                      <div className="mt-1 flex flex-wrap gap-1.5">{value.map((answer, answerIndex) => <span key={answerIndex} className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-800">{answer}</span>)}</div>
                    ) : value != null && value !== '' ? (
                      <p className="mt-0.5 whitespace-pre-wrap break-words text-xs font-medium text-slate-800">{String(value)}</p>
                    ) : (
                      <p className="text-xs italic text-slate-400">Tidak diisi / kosong</p>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-5 flex justify-end border-t border-slate-200 pt-4">
              <Button type="button" onClick={() => setSelectedResponse(null)} className="h-10 w-full rounded-xl bg-slate-800 text-xs font-bold text-white hover:bg-slate-900 sm:w-auto sm:px-5">Tutup</Button>
            </div>
          </section>
        </div>
      )}

      {previewFile && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/80 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={() => setPreviewFile(null)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="file-preview-title"
            className="flex h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:h-[min(88vh,900px)] sm:max-w-5xl sm:rounded-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-5">
              <div className="flex min-w-0 items-center gap-2">
                <FileText className="h-5 w-5 shrink-0 text-blue-600" />
                <h2 id="file-preview-title" className="truncate text-sm font-bold text-slate-800">{getFileName(previewFile)}</h2>
              </div>
              <button type="button" onClick={() => setPreviewFile(null)} aria-label="Tutup pratinjau" className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800">
                <X className="h-5 w-5" />
              </button>
            </header>
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-slate-100 p-2 sm:p-4">
              {isPreviewableFile(previewFile) ? (
                getFileName(previewFile).toLowerCase().endsWith('.pdf') ? (
                  <iframe title={`Pratinjau ${getFileName(previewFile)}`} src={getFilePreviewUrl(previewFile)} className="h-full w-full rounded-lg border-0 bg-white" />
                ) : (
                  <img src={resolveMediaUrl(previewFile)} alt={`Pratinjau ${getFileName(previewFile)}`} className="max-h-full max-w-full rounded-lg object-contain" />
                )
              ) : (
                <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                  <FileText className="mx-auto mb-3 h-10 w-10 text-slate-400" />
                  <h3 className="font-bold text-slate-800">Pratinjau tidak didukung browser</h3>
                  <p className="mt-2 break-words text-sm leading-relaxed text-slate-500">
                    Berkas {getFileName(previewFile)} tersimpan, tetapi format ini belum dapat ditampilkan langsung. PDF dan gambar dapat dipratinjau di halaman ini.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
