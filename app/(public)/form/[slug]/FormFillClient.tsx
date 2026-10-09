'use client';

import { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Button } from '@/components/ui/Button';
import { Loader2, CheckCircle2, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { getApiBase } from '@/lib/settings';

export default function FormFillClient({ form, preview = false }: { form: any; preview?: boolean }) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [sectionIdx, setSectionIdx] = useState(0);

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

  const inputClass = "w-full border border-slate-200 rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000]";

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
      <div className="bg-white border border-slate-200 rounded-sm p-10 text-center shadow-sm">
        <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-[#0f172a] mb-2">Pendaftaran Terkirim</h2>
        <p className="text-sm text-slate-500 mb-6">{form.success_message || 'Terima kasih! Data Anda sudah kami terima.'}</p>
        <Link href="/form" className="inline-flex items-center px-5 py-2.5 rounded-sm border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:border-[#c20000] hover:text-[#c20000] transition-colors">
          Kembali ke Daftar Formulir
        </Link>
      </div>
    );
  }

  if (!form.is_open) {
    return (
      <div className="bg-white border border-slate-200 rounded-sm p-10 text-center shadow-sm">
        <Lock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-[#0f172a] mb-2">Pendaftaran Ditutup</h2>
        <p className="text-sm text-slate-500 mb-6">Mohon maaf, formulir ini sudah ditutup atau kuota sudah penuh.</p>
        <Link href="/kontak" className="inline-flex items-center px-5 py-2.5 rounded-sm border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:border-[#c20000] hover:text-[#c20000] transition-colors">
          Hubungi Kami
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-sm p-6 sm:p-8 shadow-sm space-y-5">
      {hasSections && sections.length > 1 && (
        <div className="flex items-center gap-2 mb-1">
          <div
            className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={sections.length}
            aria-valuenow={Math.min(sectionIdx, sections.length - 1) + 1}
            aria-label={`Bagian ${Math.min(sectionIdx, sections.length - 1) + 1} dari ${sections.length}`}
          >
            <div className="h-full rounded-full bg-[#c20000] transition-all" style={{ width: `${((Math.min(sectionIdx, sections.length - 1) + 1) / sections.length) * 100}%` }} />
          </div>
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap" aria-hidden="true">Bagian {Math.min(sectionIdx, sections.length - 1) + 1}/{sections.length}</span>
        </div>
      )}
      {activeSection.title && (
        <div className="border-l-4 border-[#c20000] pl-4 py-1">
          <h2 className="font-bold text-[#0f172a]">{activeSection.title}</h2>
          {activeSection.description && <p className="text-sm text-slate-500 mt-0.5">{activeSection.description}</p>}
        </div>
      )}
      {activeSection.fields.map((field: any) => (
        <div key={field.id}>
          <label htmlFor={`form-field-${field.id}`} className="block text-sm font-semibold text-[#0f172a] mb-1">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          {field.description && <p className="text-xs text-slate-500 mb-1.5">{field.description}</p>}
          {(field.type === 'text' || field.type === 'email' || field.type === 'number' || field.type === 'phone') && (
            <input
              id={`form-field-${field.id}`}
              type={field.type === 'phone' ? 'tel' : field.type}
              inputMode={field.type === 'phone' || field.type === 'number' ? 'numeric' : undefined}
              autoComplete={guessAutocomplete(field)}
              value={answers[field.id] || ''}
              onChange={(e) => setAnswer(field.id, e.target.value)}
              required={field.required}
              className={inputClass}
            />
          )}
          {field.type === 'textarea' && (
            <textarea id={`form-field-${field.id}`} value={answers[field.id] || ''} onChange={(e) => setAnswer(field.id, e.target.value)} required={field.required} rows={4} className={`${inputClass} resize-none`} />
          )}
          {field.type === 'date' && (
            <input id={`form-field-${field.id}`} type="date" value={answers[field.id] || ''} onChange={(e) => setAnswer(field.id, e.target.value)} required={field.required} className={inputClass} />
          )}
          {field.type === 'time' && (
            <input id={`form-field-${field.id}`} type="time" value={answers[field.id] || ''} onChange={(e) => setAnswer(field.id, e.target.value)} required={field.required} className={inputClass} />
          )}
          {field.type === 'linear_scale' && (() => {
            const min = field.settings?.min ?? 1;
            const max = field.settings?.max ?? 5;
            const nums: number[] = [];
            for (let n = min; n <= max; n++) nums.push(n);
            return (
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  {field.settings?.minLabel && <span className="text-xs text-slate-500 mr-1">{field.settings.minLabel}</span>}
                  {nums.map((n) => (
                    <label key={n} className={`w-10 h-10 inline-flex items-center justify-center rounded-full border text-sm font-bold cursor-pointer transition-all ${answers[field.id] === n || answers[field.id] === String(n) ? 'border-[#c20000] bg-[#c20000] text-white shadow-md' : 'border-slate-300 text-slate-600 hover:border-[#c20000]'}`}>
                      <input type="radio" name={`field-${field.id}`} checked={answers[field.id] === n || answers[field.id] === String(n)} onChange={() => setAnswer(field.id, n)} required={field.required && answers[field.id] === undefined} className="sr-only" />
                      {n}
                    </label>
                  ))}
                  {field.settings?.maxLabel && <span className="text-xs text-slate-500 ml-1">{field.settings.maxLabel}</span>}
                </div>
              </div>
            );
          })()}
          {field.type === 'file' && (
            <div>
              <input
                id={`form-field-${field.id}`}
                type="file"
                accept={(field.options || []).map((e: string) => `.${e}`).join(',')}
                onChange={(e) => setAnswer(field.id, e.target.files?.[0] || null)}
                required={field.required && !answers[field.id]}
                className="w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-sm file:border-0 file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 file:text-xs file:font-semibold"
              />
              {answers[field.id]?.name && (
                <p className="text-xs text-emerald-600 font-medium mt-1.5">Terpilih: {answers[field.id].name} ({((answers[field.id].size || 0) / 1024).toFixed(0)} KB)</p>
              )}
              <p className="text-[11px] text-slate-400 mt-1">Format: {(field.options || []).join(', ') || 'bebas'}{field.type === 'file' ? '' : ''}</p>
            </div>
          )}
          {field.type === 'select' && (
            <select id={`form-field-${field.id}`} value={answers[field.id] || ''} onChange={(e) => setAnswer(field.id, e.target.value)} required={field.required} className={inputClass}>
              <option value="">-- Pilih --</option>
              {(field.options || []).map((o: string) => (<option key={o} value={o}>{o}</option>))}
            </select>
          )}
          {field.type === 'radio' && (
            <div className="space-y-2">
              {(field.options || []).map((o: string) => (
                <label key={o} className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer">
                  <input type="radio" name={`field-${field.id}`} checked={answers[field.id] === o} onChange={() => setAnswer(field.id, o)} required={field.required && !answers[field.id]} className="w-4 h-4 accent-[#c20000]" />
                  {o}
                </label>
              ))}
            </div>
          )}
          {field.type === 'checkbox' && (
            <div className="space-y-2">
              {(field.options || []).map((o: string) => (
                <label key={o} className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={(answers[field.id] || []).includes(o)} onChange={() => toggleCheckbox(field.id, o)} className="w-4 h-4 accent-[#c20000] rounded" />
                  {o}
                </label>
              ))}
            </div>
          )}
        </div>
      ))}
      {hasSections && sections.length > 1 ? (
        <div className="flex gap-3">
          {sectionIdx > 0 && (
            <Button type="button" variant="outline" onClick={() => { setSectionIdx((i) => Math.max(0, i - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex-1 h-12 font-bold">
              Kembali
            </Button>
          )}
          {sectionIdx < sections.length - 1 ? (
            <Button type="button" onClick={() => {
              for (const field of activeSection.fields) {
                const v = answers[field.id];
                if (field.required && (v === undefined || v === '' || (Array.isArray(v) && v.length === 0))) {
                  toast.error(`Kolom "${field.label}" wajib diisi`);
                  return;
                }
              }
              setSectionIdx((i) => Math.min(sections.length - 1, i + 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }} className="flex-1 h-12 bg-[#0f172a] hover:bg-[#c20000] text-white font-bold">
              Lanjut
            </Button>
          ) : (
            <Button type="submit" disabled={isLoading} className="flex-1 h-12 bg-[#c20000] hover:bg-[#a30000] text-white font-bold text-base">
              {isLoading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
              Kirim Pendaftaran
            </Button>
          )}
        </div>
      ) : (
        <Button type="submit" disabled={isLoading} className="w-full h-12 bg-[#c20000] hover:bg-[#a30000] text-white font-bold text-base">
          {isLoading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
          Kirim Pendaftaran
        </Button>
      )}
    </form>
  );
}
