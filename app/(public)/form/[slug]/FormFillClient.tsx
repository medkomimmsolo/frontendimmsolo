'use client';

import { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Button } from '@/components/ui/Button';
import { Loader2, CheckCircle2, Lock, ArrowLeft, ArrowRight, RotateCcw, AlertCircle, FileUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { getApiBase } from '@/lib/settings';

export default function FormFillClient({ form, preview = false }: { form: any; preview?: boolean }) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [sectionIdx, setSectionIdx] = useState(0);
  const [focusedField, setFocusedField] = useState<number | string | null>(null);

  const sections = (() => {
    const list: { title: string; description?: string; fields: any[] }[] = [];
    let current = { title: '', description: '', fields: [] as any[] };
    for (const f of form.fields || []) {
      if (f.type === 'section') {
        if (current.fields.length > 0 || current.title) list.push(current);
        current = { title: f.label, description: f.description || '', fields: [] };
      } else {
        current.fields.push(f);
      }
    }
    list.push(current);
    return list.filter((s, i) => s.fields.length > 0 || i === 0);
  })();

  const hasSections = (form.fields || []).some((f: any) => f.type === 'section');
  const activeSection = sections[Math.min(sectionIdx, sections.length - 1)] || { title: '', fields: [] };

  const setAnswer = (id: number | string, value: any) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const toggleCheckbox = (id: number | string, option: string) => {
    const current: string[] = answers[id] || [];
    setAnswers((prev) => ({
      ...prev,
      [id]: current.includes(option) ? current.filter((o) => o !== option) : [...current, option],
    }));
  };

  const clearForm = () => {
    if (window.confirm('Kosongkan semua jawaban yang sudah diisi?')) {
      setAnswers({});
      setSectionIdx(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (preview) {
      toast.success('Ini pratinjau — data tidak dikirim');
      return;
    }
    for (const field of form.fields || []) {
      const v = answers[field.id];
      if (field.required && (v === undefined || v === '' || (Array.isArray(v) && v.length === 0))) {
        toast.error(`Kolom "${field.label}" wajib diisi`);
        setFocusedField(field.id);
        const el = document.getElementById(`form-card-${field.id}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
    }
    // validasi ukuran file di sisi klien (maks 10MB)
    for (const field of form.fields || []) {
      const v = answers[field.id];
      if (v instanceof File && v.size > 10 * 1024 * 1024) {
        toast.error(`File "${field.label}" maksimal 10MB`);
        return;
      }
    }
    setIsLoading(true);
    try {
      const base = getApiBase();
      const hasFile = Object.values(answers).some((v) => v instanceof File);
      if (hasFile) {
        const fd = new FormData();
        const data: Record<string, any> = {};
        for (const [k, v] of Object.entries(answers)) {
          if (v instanceof File) {
            fd.append(`file_${k}`, v);
          } else {
            data[k] = v;
          }
        }
        fd.append('data', JSON.stringify(data));
        await axios.post(`${base}/forms/${form.slug}/submit`, fd);
      } else {
        await axios.post(`${base}/forms/${form.slug}/submit`, { data: answers });
      }
      setIsSuccess(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal mengirim pendaftaran');
    } finally {
      setIsLoading(false);
    }
  };

  /** Tebak atribut autocomplete dari tipe & label kolom agar autofill browser/HP berfungsi. */
  const guessAutocomplete = (field: any): string | undefined => {
    if (field.type === 'email') return 'email';
    if (field.type === 'phone') return 'tel';
    if (field.type === 'date' || field.type === 'time') return undefined;
    const label = String(field.label || '').toLowerCase();
    if (label.includes('nama')) return 'name';
    if (label.includes('email')) return 'email';
    if (label.includes('tel') || label.includes('hp') || label.includes('whatsapp') || label.includes('ponsel')) return 'tel';
    if (label.includes('alamat')) return 'street-address';
    if (label.includes('kampus') || label.includes('universitas') || label.includes('sekolah')) return 'organization';
    return undefined;
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="bg-white rounded-lg border-t-8 border-t-[#c20000] border-x border-b border-slate-200 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 shrink-0" />
            <h1 className="text-2xl font-bold text-[#0f172a]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
              {form.title}
            </h1>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed mb-6">
            {form.success_message || 'Jawaban Anda telah berhasil dicatat. Terima kasih atas partisipasi Anda.'}
          </p>
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-4">
            <button
              onClick={() => {
                setAnswers({});
                setIsSuccess(false);
                setSectionIdx(0);
              }}
              className="text-sm font-medium text-[#c20000] hover:underline"
            >
              Kirim jawaban lain
            </button>
            <span className="text-slate-300">•</span>
            <Link href="/form" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Lihat formulir lainnya
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!form.is_open) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg border-t-8 border-t-slate-400 border-x border-b border-slate-200 p-8 text-center shadow-sm">
          <Lock className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h1 className="text-xl font-bold text-[#0f172a] mb-2">{form.title}</h1>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            Formulir ini tidak lagi menerima tanggapan. Silakan hubungi pengurus jika menurut Anda ini adalah sebuah kesalahan.
          </p>
          <Link
            href="/kontak"
            className="inline-flex items-center px-5 py-2.5 rounded-sm bg-[#c20000] text-white text-sm font-semibold hover:bg-[#a30000] transition-colors"
          >
            Hubungi Panitia
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
      {/* ── HEADER CARD (Google Form Style Top Banner) ── */}
      <div className="bg-white rounded-lg border-t-8 border-t-[#c20000] border-x border-b border-slate-200 p-6 sm:p-8 shadow-sm">
        <h1
          className="text-2xl sm:text-3xl font-bold text-[#0f172a] tracking-tight leading-snug"
          style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
        >
          {form.title}
        </h1>

        {form.description && (
          <p className="text-sm text-slate-600 mt-3 whitespace-pre-wrap leading-relaxed border-t border-slate-100 pt-3">
            {form.description}
          </p>
        )}

        {(form.ends_at || form.max_responses) && (
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
            {form.ends_at && (
              <span className="px-2.5 py-1 bg-slate-100 rounded-sm">
                Batas:{' '}
                {new Date(form.ends_at).toLocaleString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                WIB
              </span>
            )}
            {form.max_responses && (
              <span className="px-2.5 py-1 bg-slate-100 rounded-sm">
                Kuota: {form.max_responses} peserta
              </span>
            )}
          </div>
        )}

        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-red-500 font-semibold">* Menunjukkan pertanyaan yang wajib diisi</span>
          {preview && (
            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded-sm">MODE PRATINJAU</span>
          )}
        </div>
      </div>

      {/* Progress Bar Multi Section */}
      {hasSections && sections.length > 1 && (
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm flex items-center gap-4">
          <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#c20000] h-full transition-all duration-300"
              style={{
                width: `${((Math.min(sectionIdx, sections.length - 1) + 1) / sections.length) * 100}%`,
              }}
            />
          </div>
          <span className="text-xs font-bold text-slate-600 whitespace-nowrap">
            Bagian {Math.min(sectionIdx, sections.length - 1) + 1} dari {sections.length}
          </span>
        </div>
      )}

      {/* Section Title Banner jika ada */}
      {activeSection.title && (
        <div className="bg-white rounded-lg border-l-8 border-l-[#0f172a] border-y border-r border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#0f172a]">{activeSection.title}</h2>
          {activeSection.description && (
            <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{activeSection.description}</p>
          )}
        </div>
      )}

      {/* ── QUESTION CARDS (1 Card Per Field) ── */}
      {activeSection.fields.map((field: any) => {
        const isFocused = focusedField === field.id;
        return (
          <div
            id={`form-card-${field.id}`}
            key={field.id}
            onFocus={() => setFocusedField(field.id)}
            className={`bg-white rounded-lg border p-6 transition-all duration-200 shadow-sm ${
              isFocused
                ? 'border-l-4 border-l-[#c20000] border-slate-300 ring-1 ring-[#c20000]/10'
                : 'border-slate-200'
            }`}
          >
            {/* Question Label */}
            <label
              htmlFor={`form-field-${field.id}`}
              className="block text-base font-medium text-[#0f172a] mb-1 leading-snug cursor-pointer"
            >
              {field.label} {field.required && <span className="text-red-500 font-bold">*</span>}
            </label>

            {field.description && (
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">{field.description}</p>
            )}

            {/* Input types */}
            <div className="mt-3">
              {/* Short Text */}
              {(field.type === 'text' || field.type === 'email' || field.type === 'number' || field.type === 'phone') && (
                <div className="relative">
                  <input
                    id={`form-field-${field.id}`}
                    type={field.type === 'phone' ? 'tel' : field.type}
                    inputMode={field.type === 'phone' || field.type === 'number' ? 'numeric' : undefined}
                    autoComplete={guessAutocomplete(field)}
                    value={answers[field.id] || ''}
                    onChange={(e) => setAnswer(field.id, e.target.value)}
                    required={field.required}
                    placeholder="Jawaban Anda"
                    className="w-full sm:max-w-md bg-transparent border-b-2 border-slate-200 focus:border-[#c20000] py-2 text-sm text-slate-800 focus:outline-none transition-colors placeholder:text-slate-400"
                  />
                </div>
              )}

              {/* Long Text (Textarea) */}
              {field.type === 'textarea' && (
                <textarea
                  id={`form-field-${field.id}`}
                  value={answers[field.id] || ''}
                  onChange={(e) => setAnswer(field.id, e.target.value)}
                  required={field.required}
                  rows={3}
                  placeholder="Jawaban Anda"
                  className="w-full bg-transparent border-b-2 border-slate-200 focus:border-[#c20000] py-2 text-sm text-slate-800 focus:outline-none transition-colors resize-y placeholder:text-slate-400"
                />
              )}

              {/* Date */}
              {field.type === 'date' && (
                <input
                  id={`form-field-${field.id}`}
                  type="date"
                  value={answers[field.id] || ''}
                  onChange={(e) => setAnswer(field.id, e.target.value)}
                  required={field.required}
                  className="w-full sm:max-w-xs border border-slate-200 rounded-sm px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-[#c20000]"
                />
              )}

              {/* Time */}
              {field.type === 'time' && (
                <input
                  id={`form-field-${field.id}`}
                  type="time"
                  value={answers[field.id] || ''}
                  onChange={(e) => setAnswer(field.id, e.target.value)}
                  required={field.required}
                  className="w-full sm:max-w-xs border border-slate-200 rounded-sm px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-[#c20000]"
                />
              )}

              {/* Linear Scale (Rating) */}
              {field.type === 'linear_scale' && (() => {
                const min = field.settings?.min ?? 1;
                const max = field.settings?.max ?? 5;
                const nums: number[] = [];
                for (let n = min; n <= max; n++) nums.push(n);
                return (
                  <div className="pt-2">
                    <div className="flex items-center gap-3 sm:gap-6 overflow-x-auto pb-2">
                      {field.settings?.minLabel && (
                        <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                          {field.settings.minLabel}
                        </span>
                      )}
                      <div className="flex items-center gap-3 sm:gap-5">
                        {nums.map((n) => (
                          <label key={n} className="flex flex-col items-center gap-2 cursor-pointer group">
                            <span className="text-xs text-slate-600 font-semibold">{n}</span>
                            <input
                              type="radio"
                              name={`field-${field.id}`}
                              checked={answers[field.id] === n || answers[field.id] === String(n)}
                              onChange={() => setAnswer(field.id, n)}
                              required={field.required && answers[field.id] === undefined}
                              className="w-5 h-5 accent-[#c20000] cursor-pointer"
                            />
                          </label>
                        ))}
                      </div>
                      {field.settings?.maxLabel && (
                        <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                          {field.settings.maxLabel}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* File Upload */}
              {field.type === 'file' && (
                <div className="pt-1">
                  <label
                    htmlFor={`form-field-${field.id}`}
                    className="border-2 border-dashed border-slate-200 hover:border-[#c20000] rounded-lg p-5 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-red-50/20 transition-all text-center"
                  >
                    <FileUp className="w-8 h-8 text-[#c20000]/70 mb-2" />
                    <span className="text-sm font-semibold text-slate-700">Pilih atau Seret File ke Sini</span>
                    <span className="text-xs text-slate-400 mt-1">
                      Maksimal 10MB • Format: {(field.options || []).join(', ') || 'Semua file'}
                    </span>
                    <input
                      id={`form-field-${field.id}`}
                      type="file"
                      accept={(field.options || []).map((e: string) => `.${e}`).join(',')}
                      onChange={(e) => setAnswer(field.id, e.target.files?.[0] || null)}
                      required={field.required && !answers[field.id]}
                      className="sr-only"
                    />
                  </label>
                  {answers[field.id]?.name && (
                    <div className="mt-2.5 p-3 bg-emerald-50 border border-emerald-200 rounded-sm flex items-center justify-between text-xs text-emerald-800">
                      <span className="font-semibold truncate">File terpilih: {answers[field.id].name}</span>
                      <span className="shrink-0 ml-2">({((answers[field.id].size || 0) / 1024).toFixed(0)} KB)</span>
                    </div>
                  )}
                </div>
              )}

              {/* Dropdown Select */}
              {field.type === 'select' && (
                <div className="relative sm:max-w-xs">
                  <select
                    id={`form-field-${field.id}`}
                    value={answers[field.id] || ''}
                    onChange={(e) => setAnswer(field.id, e.target.value)}
                    required={field.required}
                    className="w-full bg-white border border-slate-200 rounded-sm px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-[#c20000] cursor-pointer"
                  >
                    <option value="">Pilih</option>
                    {(field.options || []).map((o: string) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Radio (Multiple Choice) */}
              {field.type === 'radio' && (
                <div className="space-y-3 pt-1">
                  {(field.options || []).map((o: string, idx: number) => (
                    <label
                      key={idx}
                      className="flex items-center gap-3 text-sm text-slate-700 cursor-pointer group"
                    >
                      <input
                        type="radio"
                        name={`field-${field.id}`}
                        checked={answers[field.id] === o}
                        onChange={() => setAnswer(field.id, o)}
                        required={field.required && !answers[field.id]}
                        className="w-4 h-4 accent-[#c20000] cursor-pointer"
                      />
                      <span className="group-hover:text-slate-900 leading-tight">{o}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Checkboxes (Multiple Answers) */}
              {field.type === 'checkbox' && (
                <div className="space-y-3 pt-1">
                  {(field.options || []).map((o: string, idx: number) => (
                    <label
                      key={idx}
                      className="flex items-center gap-3 text-sm text-slate-700 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={(answers[field.id] || []).includes(o)}
                        onChange={() => toggleCheckbox(field.id, o)}
                        className="w-4 h-4 accent-[#c20000] rounded cursor-pointer"
                      />
                      <span className="group-hover:text-slate-900 leading-tight">{o}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* ── FOOTER ACTIONS (Kirim / Lanjut / Kosongkan) ── */}
      <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {hasSections && sections.length > 1 ? (
          <div className="flex items-center gap-3">
            {sectionIdx > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSectionIdx((i) => Math.max(0, i - 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="h-10 px-6 font-semibold border-slate-300 text-slate-700 hover:bg-slate-50 rounded-sm"
              >
                Kembali
              </Button>
            )}
            {sectionIdx < sections.length - 1 ? (
              <Button
                type="button"
                onClick={() => {
                  for (const field of activeSection.fields) {
                    const v = answers[field.id];
                    if (field.required && (v === undefined || v === '' || (Array.isArray(v) && v.length === 0))) {
                      toast.error(`Kolom "${field.label}" wajib diisi`);
                      setFocusedField(field.id);
                      const el = document.getElementById(`form-card-${field.id}`);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      return;
                    }
                  }
                  setSectionIdx((i) => Math.min(sections.length - 1, i + 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="h-10 px-7 bg-[#c20000] hover:bg-[#a30000] text-white font-bold rounded-sm shadow-sm"
              >
                Berikutnya
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isLoading}
                className="h-10 px-8 bg-[#c20000] hover:bg-[#a30000] text-white font-bold rounded-sm shadow-sm"
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Kirim
              </Button>
            )}
          </div>
        ) : (
          <Button
            type="submit"
            disabled={isLoading}
            className="h-10 px-8 bg-[#c20000] hover:bg-[#a30000] text-white font-bold rounded-sm shadow-sm"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Kirim
          </Button>
        )}

        {/* Clear Form Button */}
        <button
          type="button"
          onClick={clearForm}
          className="text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors self-center sm:self-auto"
        >
          Kosongkan formulir
        </button>
      </div>

      {/* Google Forms Style Footer Note */}
      <div className="pt-6 text-center text-xs text-slate-400">
        <p>Konten ini dibuat oleh Pimpinan Cabang IMM Kota Surakarta.</p>
        <p className="mt-1">Jangan pernah mengirimkan sandi atau password melalui Formulir ini.</p>
      </div>
    </form>
  );
}
