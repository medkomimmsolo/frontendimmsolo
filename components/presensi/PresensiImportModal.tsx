'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { getUserFacingErrorMessage } from '@/lib/errorMessage';
import { Button } from '@/components/ui/Button';
import { Loader2, Upload, FileSpreadsheet, ClipboardList, Download, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  presensiId: number;
  onClose: () => void;
  onImported: () => void;
}

interface FormOption {
  id: number;
  title: string;
  slug: string;
}

type Source = 'excel' | 'form';

interface ParsedRow {
  nama: string;
  email?: string | null;
  phone?: string | null;
  asal?: string | null;
  kode?: string | null;
}

const TEMPLATE_HEADERS = ['nama', 'email', 'phone', 'asal', 'kode'];
const TEMPLATE_SAMPLE = [
  TEMPLATE_HEADERS,
  ['Budi Santoso', 'budi@example.com', '08123456789', 'Universitas Sebelas Maret', '001'],
  ['Siti Aminah', 'siti@example.com', '08987654321', 'UMS', '002'],
];

export function PresensiImportModal({ isOpen, presensiId, onClose, onImported }: Props) {
  const [source, setSource] = useState<Source>('excel');
  const [isProcessing, setIsProcessing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<ParsedRow[]>([]);
  const [forms, setForms] = useState<FormOption[]>([]);
  const [selectedForm, setSelectedForm] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        const res = await api.get('/form-admin', { params: { per_page: 100 } });
        const payload = res.data.data;
        setForms(payload?.data || (Array.isArray(payload) ? payload : []));
      } catch {
        /* opsional */
      }
    })();
  }, [isOpen]);

  if (!isOpen) return null;

  const downloadTemplate = async () => {
    const XLSX = await import('@e965/xlsx');
    const ws = XLSX.utils.aoa_to_sheet(TEMPLATE_SAMPLE);
    ws['!cols'] = [{ wch: 28 }, { wch: 28 }, { wch: 18 }, { wch: 30 }, { wch: 10 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Peserta');
    XLSX.writeFile(wb, 'template-import-peserta.xlsx');
  };

  const handleFile = async (f: File | null) => {
    setFile(f);
    setParsed([]);
    if (!f) return;
    try {
      const XLSX = await import('@e965/xlsx');
      const buf = await f.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
      const rows: ParsedRow[] = json
        .map((r) => {
          const get = (key: string) => {
            const found = Object.keys(r).find((k) => k.toLowerCase().trim() === key);
            const val = found ? r[found] : undefined;
            return val === undefined || val === null ? '' : String(val).trim();
          };
          return {
            nama: get('nama'),
            email: get('email') || null,
            phone: get('phone') || null,
            asal: get('asal') || null,
            kode: get('kode') || null,
          };
        })
        .filter((r) => r.nama !== '');
      setParsed(rows);
      if (rows.length === 0) {
        toast.error('Tidak ada baris valid. Pastikan ada kolom "nama".');
      } else {
        toast.success(`${rows.length} baris terbaca`);
      }
    } catch (error) {
      console.error(error);
      toast.error(getUserFacingErrorMessage(error, 'Gagal membaca file Excel'));
    }
  };

  const handleImport = async () => {
    setIsProcessing(true);
    try {
      if (source === 'excel') {
        if (parsed.length === 0) {
          toast.error('Belum ada data untuk diimpor');
          setIsProcessing(false);
          return;
        }
        const res = await api.post(`/presensi/${presensiId}/peserta/import`, { source: 'excel', rows: parsed });
        toast.success(res.data.message || 'Impor berhasil');
      } else {
        if (!selectedForm) {
          toast.error('Pilih formulir terlebih dahulu');
          setIsProcessing(false);
          return;
        }
        const res = await api.post(`/presensi/${presensiId}/peserta/import`, { source: 'form', form_id: Number(selectedForm) });
        toast.success(res.data.message || 'Impor berhasil');
      }
      onImported();
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Impor gagal');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Impor Peserta</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Pilih sumber */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSource('excel')}
              className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-colors ${source === 'excel' ? 'border-[#c20000] bg-red-50/50' : 'border-slate-200 hover:border-slate-300'}`}
            >
              <FileSpreadsheet className={`w-6 h-6 ${source === 'excel' ? 'text-[#c20000]' : 'text-slate-400'}`} />
              <span>
                <span className="block text-sm font-semibold text-slate-800">Upload Excel</span>
                <span className="block text-xs text-slate-500">Sesuai template</span>
              </span>
            </button>
            <button
              onClick={() => setSource('form')}
              className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-colors ${source === 'form' ? 'border-[#c20000] bg-red-50/50' : 'border-slate-200 hover:border-slate-300'}`}
            >
              <ClipboardList className={`w-6 h-6 ${source === 'form' ? 'text-[#c20000]' : 'text-slate-400'}`} />
              <span>
                <span className="block text-sm font-semibold text-slate-800">Dari Formulir</span>
                <span className="block text-xs text-slate-500">Ambil response form</span>
              </span>
            </button>
          </div>

          {source === 'excel' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                <div className="text-xs text-slate-600">
                  Kolom: <code className="text-[#c20000]">nama</code> (wajib), <code>email</code>, <code>phone</code>, <code>asal</code>, <code>kode</code>
                </div>
                <Button onClick={downloadTemplate} variant="outline" className="h-9 px-3 text-xs rounded-lg shrink-0">
                  <Download className="w-3.5 h-3.5 mr-1.5" /> Template
                </Button>
              </div>

              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl py-8 cursor-pointer hover:border-[#c20000] transition-colors">
                <Upload className="w-8 h-8 text-slate-300 mb-2" />
                <span className="text-sm text-slate-600 font-medium">{file ? file.name : 'Klik untuk pilih file .xlsx / .xls / .csv'}</span>
                <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] || null)} />
              </label>

              {parsed.length > 0 && (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Pratinjau ({parsed.length} baris)
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    <table className="admin-panel-table w-full text-left text-xs">
                      <thead className="bg-white border-b border-slate-100 text-slate-400">
                        <tr>
                          <th className="py-2 px-4">Nama</th>
                          <th className="py-2 px-4">Email</th>
                          <th className="py-2 px-4">Asal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {parsed.slice(0, 30).map((r, i) => (
                          <tr key={i}>
                            <td className="py-2 px-4 font-medium text-slate-700">{r.nama}</td>
                            <td className="py-2 px-4 text-slate-500">{r.email || '—'}</td>
                            <td className="py-2 px-4 text-slate-500">{r.asal || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {source === 'form' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-1.5">Pilih Formulir</label>
                <select
                  value={selectedForm}
                  onChange={(e) => setSelectedForm(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-sm px-3.5 py-2.5 text-sm text-slate-700 focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] outline-none shadow-sm"
                >
                  <option value="">— Pilih formulir —</option>
                  {forms.map((f) => (
                    <option key={f.id} value={f.id}>{f.title}</option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-slate-500">
                Sistem otomatis mengambil nama (field berlabel mengandung “nama”), email, dan asal dari response formulir. Duplikat email akan dilewati.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100">
          <Button onClick={onClose} variant="outline" className="h-10 px-4 rounded-xl text-xs font-bold">Batal</Button>
          <Button onClick={handleImport} disabled={isProcessing} className="h-10 px-5 bg-[#c20000] hover:bg-[#a30000] text-white rounded-xl text-xs font-bold">
            {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
            Impor Sekarang
          </Button>
        </div>
      </div>
    </div>
  );
}
