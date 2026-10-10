'use client';

import { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Button } from '@/components/ui/Button';
import { Loader2, CheckCircle2, Lock, ArrowLeft, ArrowRight, RotateCcw, AlertCircle, FileUp, Mail, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { getApiBase } from '@/lib/settings';

export default function FormFillClient({ form, preview = false }: { form: any; preview?: boolean }) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [respondentEmail, setRespondentEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
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
      setRespondentEmail('');
      setSectionIdx(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (preview) {
      toast.success('Ini pratinjau — data tidak dikirim');
      return;
    }

    // Validasi email wajib jika require_email aktif
    if (form.require_email) {
      const cleanEmail = respondentEmail.trim();
      if (!cleanEmail) {
        toast.error('Alamat email wajib diisi untuk verifikasi');
        setFocusedField('email');
        const el = document.getElementById('form-card-email');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        toast.error('Format alamat email tidak valid');
        setFocusedField('email');
        return;
      }
    }

    // Validasi field pertanyaan wajib
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

    // Validasi ukuran file di sisi klien (maks 10MB)
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
        if (respondentEmail) {
          fd.append('email', respondentEmail.trim().toLowerCase());
        }
        if (honeypot) {
          fd.append('_hp', honeypot);
        }
        await axios.post(`${base}/forms/${form.slug}/submit`, fd);
      } else {
        await axios.post(`${base}/forms/${form.slug}/submit`, {
          data: answers,
          email: respondentEmail ? respondentEmail.trim().toLowerCase() : undefined,
          _hp: honeypot || undefined,
        });
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
                setRespondentEmail('');
                setIsSuccess(false);
                setSectionIdx(0);
              }}
              className="text-sm font-medium text-[#c20000] hover:underline"
            >
              Kirim jawaban lain
            </button>
            <span className="text-slate-300">•</span>
            <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Kembali ke Beranda
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
            href="/"
            className="inline-flex items-center px-5 py-2.5 rounded-sm bg-[#c20000] text-white text-sm font-semibold hover:bg-[#a30000] transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
      {/* Honeypot field tersembunyi untuk anti-bot */}
      <input
        type="text"
        name="_hp"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      {/* ── HEADER IMAGE (Google Form Banner Cover) ── */}
      {form.header_image && (
        <div className="w-full h-44 sm:h-56 md:h-64 rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
          <img
            src={form.header_image}
            alt={form.title}
            className="w-full h-full object-cover object-center"
          />
        </div>
      )}

      {/* ── HEADER CARD (Google Form Style Top Card) ── */}
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

      {/* ── EMAIL VERIFICATION / ANTI-SPAM CARD (Google Form Collect Email) ── */}
      {form.require_email && (
        <div
          id="form-card-email"
          onFocus={() => setFocusedField('email')}
          className={`bg-white rounded-lg border p-6 transition-all duration-200 shadow-sm ${
            focusedField === 'email'
              ? 'border-l-4 border-l-[#c20000] border-slate-300 ring-1 ring-[#c20000]/10'
              : 'border-slate-200'
          }`}
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <label htmlFor="form-email-input" className="block text-base font-medium text-[#0f172a] cursor-pointer">
                Email <span className="text-red-500 font-bold">*</span>
              </label>
              <p className="text-xs text-slate-500 mt-1">
                Alamat email aktif untuk verifikasi identitas pendaftar & mencegah spam.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold shrink-0">
              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Wajib Email
            </span>
          </div>

          <div className="mt-3">
            <input
              id="form-email-input"
              type="email"
              required
              autoComplete="email"
              value={respondentEmail}
              onChange={(e) => setRespondentEmail(e.target.value)}
              placeholder="nama@email.com"
              className="w-full sm:max-w-md bg-transparent border-b-2 border-slate-200 focus:border-[#c20000] py-2 text-sm text-slate-800 focus:outline-none transition-colors placeholder:text-slate-400"
            />
          </div>

          <p className="text-[11px] text-slate-400 mt-2 italic">
            {form.limit_one_response
              ? '● Formulir ini dibatasi 1 kali pengisian untuk setiap alamat email.'
              : '● Tanggapan formulir ini akan tercatat atas nama email Anda.'}
          </p>
        </div>
      )}

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

              {/* Dropdown Select */}
              {field.type === 'select' && (
                <select
                  id={`form-field-${field.id}`}
                  value={answers[field.id] || ''}
                  onChange={(e) => setAnswer(field.id, e.target.value)}
                  required={field.required}
                  className="w-full sm:max-w-md border border-slate-200 rounded-sm px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-[#c20000] bg-white cursor-pointer"
                >
                  <option value="">Pilih opsi</option>
                  {(field.options || []).map((opt: string, i: number) => (
                    <option key={i} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              )}

              {/* Radio (Pilihan Ganda ala Google Form) */}
              {field.type === 'radio' && (
                <div className="space-y-3 pt-1">
                  {(field.options || []).map((opt: string, i: number) => {
                    const checked = answers[field.id] === opt;
                    return (
                      <label
                        key={i}
                        className="flex items-center gap-3 cursor-pointer group py-1 text-sm text-slate-800"
                      >
                        <input
                          type="radio"
                          name={`field_${field.id}`}
                          value={opt}
                          checked={checked}
                          onChange={() => setAnswer(field.id, opt)}
                          required={field.required && !answers[field.id]}
                          className="w-5 h-5 accent-[#c20000] text-[#c20000] cursor-pointer"
                        />
                        <span className="group-hover:text-black leading-snug">{opt}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Checkboxes (Centang Banyak) */}
              {field.type === 'checkbox' && (
                <div className="space-y-3 pt-1">
                  {(field.options || []).map((opt: string, i: number) => {
                    const checked = (answers[field.id] || []).includes(opt);
                    return (
                      <label
                        key={i}
                        className="flex items-center gap-3 cursor-pointer group py-1 text-sm text-slate-800"
                      >
                        <input
                          type="checkbox"
                          value={opt}
                          checked={checked}
                          onChange={() => toggleCheckbox(field.id, opt)}
                          className="w-5 h-5 rounded accent-[#c20000] text-[#c20000] cursor-pointer"
                        />
                        <span className="group-hover:text-black leading-snug">{opt}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Linear Scale (Skala 1-5 / 1-10) */}
              {field.type === 'linear_scale' && (
                <div className="pt-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span>{field.settings?.minLabel || `Nilai ${field.settings?.min ?? 1}`}</span>
                    <span>{field.settings?.maxLabel || `Nilai ${field.settings?.max ?? 5}`}</span>
                  </div>
                  <div className="flex items-center justify-between gap-1 sm:gap-2">
                    {Array.from({ length: (field.settings?.max ?? 5) - (field.settings?.min ?? 1) + 1 }).map((_, idx) => {
                      const val = (field.settings?.min ?? 1) + idx;
                      const selected = answers[field.id] === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setAnswer(field.id, val)}
                          className={`flex-1 py-3 text-center rounded text-sm font-semibold border transition-all ${
                            selected
                              ? 'bg-[#c20000] text-white border-[#c20000] shadow-sm'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* File Upload (Unggah Dokumen / Foto) */}
              {field.type === 'file' && (
                <div className="pt-1">
                  {answers[field.id] instanceof File ? (
                    <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="flex items-center gap-2 text-xs text-slate-700 truncate">
                        <FileUp className="w-4 h-4 text-[#c20000] shrink-0" />
                        <span className="font-semibold truncate">{answers[field.id].name}</span>
                        <span className="text-slate-400">
                          ({(answers[field.id].size / (1024 * 1024)).toFixed(1)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAnswer(field.id, null)}
                        className="text-xs text-red-600 hover:underline font-semibold ml-2"
                      >
                        Ganti Berkas
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-[#c20000] hover:bg-red-50/20 transition-all text-center">
                      <FileUp className="w-8 h-8 text-slate-400 mb-2" />
                      <span className="text-sm font-semibold text-slate-700">Pilih berkas dari perangkat Anda</span>
                      <span className="text-xs text-slate-400 mt-1">
                        Format didukung: {(field.options || []).join(', ') || 'Semua format'} (maks 10MB)
                      </span>
                      <input
                        id={`form-field-${field.id}`}
                        type="file"
                        required={field.required && !answers[field.id]}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) setAnswer(field.id, f);
                        }}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* ── FOOTER ACTIONS (Navigasi Section, Kirim & Reset) ── */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {hasSections && sectionIdx > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setSectionIdx((idx) => Math.max(0, idx - 1))}
              className="border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Sebelumnya
            </Button>
          )}

          {hasSections && sectionIdx < sections.length - 1 ? (
            <Button
              type="button"
              onClick={() => setSectionIdx((idx) => Math.min(sections.length - 1, idx + 1))}
              className="bg-[#c20000] hover:bg-[#a30000] text-white font-semibold text-sm"
            >
              Berikutnya <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#c20000] hover:bg-[#a30000] text-white font-semibold text-sm px-6 shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Mengirimkan...
                </>
              ) : (
                'Kirim Tanggapan'
              )}
            </Button>
          )}
        </div>

        <button
          type="button"
          onClick={clearForm}
          className="text-xs font-medium text-slate-500 hover:text-red-600 transition-colors inline-flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Kosongkan formulir
        </button>
      </div>

      <p className="text-center text-[11px] text-slate-400 pt-6">
        Formulir resmi ini dibuat dan dikelola oleh PC IMM Kota Surakarta.
      </p>
    </form>
  );
}

