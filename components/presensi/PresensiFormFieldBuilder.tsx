'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { PresensiFormField } from '@/types';

interface Props {
  fields: PresensiFormField[];
  onChange: (fields: PresensiFormField[]) => void;
}

const fieldTypes: { value: PresensiFormField['type']; label: string }[] = [
  { value: 'text', label: 'Jawaban singkat' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Nomor telepon' },
  { value: 'number', label: 'Angka' },
  { value: 'date', label: 'Tanggal' },
  { value: 'textarea', label: 'Paragraf' },
  { value: 'select', label: 'Pilihan dropdown' },
  { value: 'checkbox', label: 'Kotak centang' },
];

export function PresensiFormFieldBuilder({ fields, onChange }: Props) {
  const updateField = (key: string, update: Partial<PresensiFormField>) => {
    onChange(fields.map((field) => field.key === key ? { ...field, ...update } : field));
  };

  const addField = () => {
    const key = `field_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    onChange([...fields, { key, label: '', type: 'text', required: false, options: [] }]);
  };

  const removeField = (key: string) => {
    onChange(fields.filter((field) => field.key !== key));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Pertanyaan Form Presensi</h3>
          <p className="mt-1 text-xs text-slate-500">
            Peserta akan mengisi sendiri data di bawah ini. Nama peserta wajib ada; kolom lain bisa ditambah atau dihapus.
          </p>
        </div>
        <Button type="button" onClick={addField} variant="outline" className="h-9 rounded-lg px-3 text-xs font-bold">
          <Plus className="mr-1.5 h-4 w-4" /> Tambah Pertanyaan
        </Button>
      </div>

      {fields.map((field, index) => {
        const isName = field.key === 'nama';
        const hasOptions = field.type === 'select' || field.type === 'checkbox';

        return (
          <div key={field.key} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="grid gap-3 md:grid-cols-[1fr_190px_auto]">
              <label className="block text-xs font-semibold text-slate-600">
                Pertanyaan {index + 1}
                <input
                  value={field.label}
                  onChange={(event) => updateField(field.key, { label: event.target.value })}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000]"
                  placeholder={isName ? 'Nama lengkap' : 'Tulis pertanyaan'}
                  required
                />
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Jenis jawaban
                <select
                  value={isName ? 'text' : field.type}
                  disabled={isName}
                  onChange={(event) => updateField(field.key, {
                    type: event.target.value as PresensiFormField['type'],
                    options: ['select', 'checkbox'].includes(event.target.value) ? field.options || [] : [],
                  })}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-[#c20000] disabled:bg-slate-100"
                >
                  {fieldTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                </select>
              </label>
              <div className="flex items-end gap-3">
                <label className="flex h-10 items-center gap-2 text-xs font-semibold text-slate-600">
                  <input
                    type="checkbox"
                    checked={isName || field.required}
                    disabled={isName}
                    onChange={(event) => updateField(field.key, { required: event.target.checked })}
                    className="h-4 w-4 accent-[#c20000]"
                  />
                  Wajib
                </label>
                <button
                  type="button"
                  disabled={isName}
                  onClick={() => removeField(field.key)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label={`Hapus pertanyaan ${field.label || index + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            {hasOptions && (
              <label className="mt-3 block text-xs font-semibold text-slate-600">
                Pilihan jawaban (satu pilihan per baris)
                <textarea
                  value={(field.options || []).join('\n')}
                  onChange={(event) => updateField(field.key, {
                    options: event.target.value.split('\n').map((option) => option.trim()).filter(Boolean),
                  })}
                  rows={3}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000]"
                  placeholder={'Komisariat A\nKomisariat B'}
                  required
                />
              </label>
            )}
          </div>
        );
      })}
    </div>
  );
}
