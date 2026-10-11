'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  FileSpreadsheet,
  Search,
  ShieldCheck,
  ExternalLink,
  FileText,
  X,
  ArrowLeft,
  Loader2,
  Eye,
  Users,
} from 'lucide-react';
import { resolveMediaUrl } from '@/lib/imageUtils';
import { getApiBase } from '@/lib/settings';

function getColLetter(colIndex: number): string {
  let temp = colIndex;
  let letter = '';
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter;
    temp = Math.floor(temp / 26) - 1;
  }
  return letter;
}

interface PublicResponsesClientProps {
  initialData: {
    form: {
      id: number;
      title: string;
      slug: string;
      description?: string | null;
      header_image?: string | null;
      header_image_size?: string | null;
      is_open?: boolean;
      require_email?: boolean;
      total_responses?: number;
    };
    fields: any[];
    responses: {
      data: any[];
      current_page: number;
      last_page: number;
      total: number;
      per_page: number;
    };
  };
}

export default function PublicResponsesClient({ initialData }: PublicResponsesClientProps) {
  const [form] = useState(initialData.form);
  const [fields] = useState(initialData.fields || []);
  const [responsesData, setResponsesData] = useState(initialData.responses);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResponse, setSelectedResponse] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filter out section types for table columns
  const answerFields = useMemo(
    () => fields.filter((f) => f.type !== 'section'),
    [fields]
  );

  const hasEmail = form.require_email || responsesData.data.some((r) => Boolean(r.email));

  const fetchPage = async (page: number, search = searchQuery) => {
    setIsLoading(true);
    try {
      const apiBase = getApiBase();
      const params = new URLSearchParams({ page: String(page) });
      if (search.trim()) {
        params.set('search', search.trim());
      }
      const res = await fetch(`${apiBase}/forms/${form.slug}/responses?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.responses) {
          setResponsesData(json.data.responses);
        }
      }
    } catch (err) {
      console.error('Gagal memuat halaman data responden', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPage(1, searchQuery);
  };

  const handleResetSearch = () => {
    setSearchQuery('');
    fetchPage(1, '');
  };

  const responsesList = responsesData.data || [];
  const currentPage = responsesData.current_page || 1;
  const lastPage = responsesData.last_page || 1;
  const totalResponses = responsesData.total ?? form.total_responses ?? responsesList.length;

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* ── HEADER IMAGE (Banner Gambar Formulir) ── */}
      {form.header_image && (() => {
        const size = form.header_image_size || 'banner';
        const styles = (() => {
          switch (size) {
            case 'medium':
              return {
                wrapper: 'w-full aspect-[21/9] rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 flex items-center justify-center',
                img: 'w-full h-full object-cover object-center',
              };
            case 'wide':
              return {
                wrapper: 'w-full aspect-video rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 flex items-center justify-center',
                img: 'w-full h-full object-cover object-center',
              };
            case 'natural':
              return {
                wrapper: 'w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 flex items-center justify-center',
                img: 'w-full h-auto max-h-[480px] object-contain sm:object-cover object-center',
              };
            case 'banner':
            default:
              return {
                wrapper: 'w-full aspect-[4/1] rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 flex items-center justify-center',
                img: 'w-full h-full object-cover object-center',
              };
          }
        })();

        return (
          <div className={styles.wrapper}>
            <img
              src={resolveMediaUrl(form.header_image)}
              alt={form.title}
              className={styles.img}
              onError={(e) => {
                if (typeof form.header_image === 'string' && !form.header_image.startsWith('blob:')) {
                  (e.target as HTMLImageElement).src = form.header_image;
                }
              }}
            />
          </div>
        );
      })()}

      {/* ── HEADER CARD ── */}
      <div className="bg-white rounded-2xl border-t-8 border-t-[#c20000] border-x border-b border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>Spreadsheet Publik (Hanya Lihat)</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/form/${form.slug}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-[#c20000] border border-red-200 text-xs font-bold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{form.is_open ? 'Isi Formulir Pendaftaran' : 'Lihat Info Formulir'}</span>
            </Link>
          </div>
        </div>

        <h1
          className="text-2xl sm:text-3xl font-bold text-[#0f172a] tracking-tight leading-snug"
          style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
        >
          {form.title}
        </h1>

        {form.description && (
          <p className="text-sm text-slate-600 mt-2.5 whitespace-pre-wrap leading-relaxed border-t border-slate-100 pt-3">
            {form.description}
          </p>
        )}

        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-slate-800">{totalResponses} Responden Terdaftar</span>
          </div>
          <span className="text-slate-400">Data diperbarui secara real-time &bull; Mode baca publik</span>
        </div>
      </div>

      {/* ── SPREADSHEET CARD ── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
        {/* Spreadsheet Toolbar */}
        <div className="bg-slate-50/80 border-b border-slate-200/80 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-semibold">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Spreadsheet View</span>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {totalResponses} responden terdaftar
            </span>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari dalam sheet..."
                className="pl-8 pr-7 py-1.5 text-xs bg-white border border-slate-300 rounded-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 w-48 sm:w-64"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleResetSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-sm text-xs font-medium transition-colors"
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Cari'}
            </button>
          </form>
        </div>

        {/* Spreadsheet fx Status Bar */}
        <div className="bg-[#f1f3f4] border-b border-slate-300 px-4 py-1.5 flex items-center justify-between text-[11px] text-slate-600 font-mono select-none">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-700">fx</span>
            <span className="text-slate-500">
              {selectedResponse
                ? `Baris terpilih: Pendaftar #${selectedResponse.id}`
                : `Formulir: ${form.title} | Kolom: ${answerFields.length + (hasEmail ? 3 : 2)}`}
            </span>
          </div>
          <span className="text-slate-400 hidden sm:inline">
            Klik baris atau tombol detail untuk melihat seluruh jawaban responden
          </span>
        </div>

        {/* Spreadsheet Table Container */}
        <div className="overflow-x-auto max-h-[680px] overflow-y-auto border-b border-slate-300 select-text">
          <table className="w-full text-left border-collapse text-xs border border-slate-300 bg-white min-w-max">
            <thead>
              {/* Row 1: Spreadsheet Column Letters (A, B, C, D...) */}
              <tr className="bg-[#e9ecef] border-b border-slate-300 text-slate-600 font-mono text-[11px] font-bold">
                <th className="w-12 text-center p-1 border-r border-slate-300 bg-[#dee2e6] text-slate-500 select-none">
                  #
                </th>
                <th className="p-1 px-3 border-r border-slate-300 text-center uppercase tracking-wider">
                  {getColLetter(0)}
                </th>
                <th className="p-1 px-3 border-r border-slate-300 text-center uppercase tracking-wider">
                  {getColLetter(1)}
                </th>
                {hasEmail && (
                  <th className="p-1 px-3 border-r border-slate-300 text-center uppercase tracking-wider">
                    {getColLetter(2)}
                  </th>
                )}
                {answerFields.map((_, idx) => (
                  <th
                    key={idx}
                    className="p-1 px-3 border-r border-slate-300 text-center uppercase tracking-wider"
                  >
                    {getColLetter(idx + (hasEmail ? 3 : 2))}
                  </th>
                ))}
                <th className="p-1 px-3 text-center uppercase tracking-wider bg-[#dee2e6] text-slate-500">
                  DETAIL
                </th>
              </tr>

              {/* Row 2: Real Field Headers */}
              <tr className="bg-[#f8f9fa] border-b border-slate-300 text-slate-700 font-semibold text-xs sticky top-0 z-10 shadow-sm">
                <th className="w-12 text-center p-2.5 border-r border-slate-300 bg-[#e9ecef] text-slate-500 font-mono select-none">
                  No
                </th>
                <th className="p-2.5 px-3 border-r border-slate-300 whitespace-nowrap min-w-[80px]">
                  ID Pendaftar
                </th>
                <th className="p-2.5 px-3 border-r border-slate-300 whitespace-nowrap min-w-[150px]">
                  Waktu Submit
                </th>
                {hasEmail && (
                  <th className="p-2.5 px-3 border-r border-slate-300 whitespace-nowrap min-w-[190px]">
                    <div className="flex items-center gap-1.5 text-emerald-800">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Email Responden</span>
                    </div>
                  </th>
                )}
                {answerFields.map((f: any) => (
                  <th
                    key={f.id}
                    className="p-2.5 px-3 border-r border-slate-300 whitespace-nowrap min-w-[180px] max-w-[280px]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate" title={f.label}>
                        {f.label}
                      </span>
                      <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-slate-200 text-slate-600 uppercase shrink-0">
                        {f.type}
                      </span>
                    </div>
                  </th>
                ))}
                <th className="p-2.5 px-4 text-center whitespace-nowrap min-w-[80px] bg-[#f1f3f4]">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 font-sans">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={answerFields.length + (hasEmail ? 4 : 3)}
                    className="p-12 text-center text-slate-500 bg-slate-50/50"
                  >
                    <Loader2 className="w-7 h-7 text-emerald-600 mx-auto mb-2 animate-spin" />
                    <p className="text-xs font-semibold text-slate-600">Memuat data spreadsheet...</p>
                  </td>
                </tr>
              ) : responsesList.length === 0 ? (
                <tr>
                  <td
                    colSpan={answerFields.length + (hasEmail ? 4 : 3)}
                    className="p-14 text-center text-slate-500 bg-slate-50/50"
                  >
                    <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">
                      {searchQuery
                        ? 'Tidak ada data yang sesuai dengan pencarian'
                        : 'Belum ada data pendaftar pada formulir ini'}
                    </p>
                    {searchQuery && (
                      <button
                        onClick={handleResetSearch}
                        className="mt-2 text-xs text-emerald-600 hover:underline"
                      >
                        Reset filter pencarian
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                responsesList.map((r: any, rIdx: number) => {
                  const rowNumber = (currentPage - 1) * (responsesData.per_page || 25) + rIdx + 1;
                  return (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedResponse(r)}
                      className={`hover:bg-emerald-50/40 cursor-pointer transition-colors ${
                        selectedResponse?.id === r.id
                          ? 'bg-emerald-100/50 font-medium'
                          : rIdx % 2 === 1
                          ? 'bg-slate-50/40'
                          : 'bg-white'
                      }`}
                    >
                      {/* Row Index */}
                      <td className="w-12 text-center p-2 border-r border-slate-300 bg-[#f8f9fa] text-slate-500 font-mono text-[11px] select-none">
                        {rowNumber}
                      </td>

                      {/* Col A: ID */}
                      <td className="p-2 px-3 border-r border-slate-200 font-mono text-slate-600 whitespace-nowrap">
                        #{r.id}
                      </td>

                      {/* Col B: Waktu */}
                      <td className="p-2 px-3 border-r border-slate-200 text-slate-600 whitespace-nowrap text-[11px]">
                        {new Date(r.created_at).toLocaleString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      {/* Col Email (jika ada) */}
                      {hasEmail && (
                        <td className="p-2 px-3 border-r border-slate-200 text-slate-800 whitespace-nowrap text-[11px] font-mono">
                          {r.email ? (
                            <span className="inline-flex items-center gap-1.5 text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              {r.email}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                      )}

                      {/* Col Answer Fields */}
                      {answerFields.map((f: any) => {
                        const v = r.data?.[f.id] ?? r.data?.[String(f.id)];
                        const isFile =
                          f.type === 'file' || (typeof v === 'string' && v.startsWith('/storage/'));

                        return (
                          <td
                            key={f.id}
                            className="p-2 px-3 border-r border-slate-200 text-slate-800 max-w-[280px] truncate"
                            title={Array.isArray(v) ? v.join(', ') : String(v ?? '')}
                          >
                            {isFile && v ? (
                              <a
                                href={v}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-medium transition-colors"
                                title="Klik untuk membuka file"
                              >
                                <ExternalLink className="w-3 h-3 shrink-0" />
                                <span className="truncate max-w-[150px]">
                                  {v.split('/').pop() || 'Lihat File'}
                                </span>
                              </a>
                            ) : isFile ? (
                              <span className="text-slate-300 italic text-[11px]">
                                - tidak ada file -
                              </span>
                            ) : Array.isArray(v) ? (
                              <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                                {v.join(', ')}
                              </span>
                            ) : v != null && v !== '' ? (
                              <span>{String(v)}</span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                        );
                      })}

                      {/* Col Detail Action */}
                      <td
                        className="p-2 px-3 text-center whitespace-nowrap bg-slate-50/50"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => setSelectedResponse(r)}
                          title="Lihat detail lengkap jawaban"
                          className="px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:text-emerald-700 bg-white hover:bg-emerald-50 border border-slate-200 rounded-sm transition-colors inline-flex items-center gap-1 shadow-2xs"
                        >
                          <FileText className="w-3 h-3 text-emerald-600" /> Detail
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Status Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 bg-[#f8f9fa] text-xs">
          <span className="text-slate-500 font-mono">
            Halaman {currentPage} dari {lastPage} &bull; Total {totalResponses} responden
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1 || isLoading}
              onClick={() => fetchPage(currentPage - 1)}
              className="px-3 py-1 text-xs rounded-sm border border-slate-300 bg-white disabled:opacity-40 hover:bg-slate-50 transition-colors font-medium text-slate-700"
            >
              ← Prev
            </button>
            <span className="text-slate-700 font-mono font-semibold px-2">
              {currentPage} / {lastPage}
            </span>
            <button
              disabled={currentPage >= lastPage || isLoading}
              onClick={() => fetchPage(currentPage + 1)}
              className="px-3 py-1 text-xs rounded-sm border border-slate-300 bg-white disabled:opacity-40 hover:bg-slate-50 transition-colors font-medium text-slate-700"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* ── DETAIL MODAL (HANYA BACA / READ ONLY - TANPA TOMBOL HAPUS) ── */}
      {selectedResponse && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => setSelectedResponse(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 sm:p-7 my-8 max-h-[90vh] overflow-y-auto border border-slate-200/90"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-200 pb-4 mb-5">
              <div>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold uppercase">
                  Data Responden #{selectedResponse.id}
                </span>
                <h3 className="text-lg font-bold text-[#0f172a] mt-2">
                  Rincian Jawaban Responden
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Disubmit pada:{' '}
                  {new Date(selectedResponse.created_at).toLocaleString('id-ID', {
                    dateStyle: 'full',
                    timeStyle: 'medium',
                  })}
                </p>
              </div>
              <button
                onClick={() => setSelectedResponse(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedResponse.email && (
              <div className="mb-4 p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-semibold text-emerald-950">
                    Email Responden:
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-900 bg-white px-2.5 py-1 rounded-lg border border-emerald-300">
                  {selectedResponse.email}
                </span>
              </div>
            )}

            <div className="space-y-4">
              {answerFields.map((f: any, idx: number) => {
                const val =
                  selectedResponse.data?.[f.id] ?? selectedResponse.data?.[String(f.id)];
                const isFile =
                  f.type === 'file' || (typeof val === 'string' && val.startsWith('/storage/'));

                return (
                  <div key={f.id} className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-xl">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-bold text-slate-700">
                        {idx + 1}. {f.label}
                      </span>
                      <span className="text-[10px] font-mono uppercase text-slate-500 bg-white px-2 py-0.5 border border-slate-200 rounded-md">
                        {f.type}
                      </span>
                    </div>

                    {isFile && val ? (
                      <div className="mt-2 flex items-center justify-between p-3 bg-white border border-blue-200 rounded-xl">
                        <div className="flex items-center gap-2 text-xs text-blue-900 truncate">
                          <ExternalLink className="w-4 h-4 text-blue-600 shrink-0" />
                          <span className="truncate font-medium">{val.split('/').pop()}</span>
                        </div>
                        <a
                          href={val}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shrink-0 shadow-2xs transition-colors"
                        >
                          Buka / Unduh Berkas
                        </a>
                      </div>
                    ) : isFile ? (
                      <p className="text-xs text-slate-400 italic">Tidak ada berkas diunggah</p>
                    ) : Array.isArray(val) ? (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {val.map((item: string, i: number) => (
                          <span
                            key={i}
                            className="px-2.5 py-0.5 bg-white border border-slate-200 rounded-md text-xs text-slate-800"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    ) : val != null && val !== '' ? (
                      <p className="text-xs text-slate-800 font-medium whitespace-pre-wrap mt-0.5">
                        {String(val)}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 italic">Tidak diisi / kosong</p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-end">
              <button
                onClick={() => setSelectedResponse(null)}
                className="bg-slate-800 hover:bg-slate-900 text-white text-xs px-5 py-2 rounded-xl transition-colors font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

