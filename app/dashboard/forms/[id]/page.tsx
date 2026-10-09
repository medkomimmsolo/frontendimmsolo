'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ArrowLeft, Plus, Edit, Trash2, Loader2, ExternalLink, Download, Users, Copy, Eye, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import FormFillClient from '@/app/(public)/form/[slug]/FormFillClient';
import toast from 'react-hot-toast';
import { useConfirm } from '@/components/providers/ConfirmProvider';

const FILE_PRESETS: Record<string, { label: string; exts: string[] }> = {
  images: { label: 'Gambar (jpg, png, webp — maks 2MB)', exts: ['jpg', 'jpeg', 'png', 'webp'] },
  documents: { label: 'Dokumen (pdf, word, excel, ppt — maks 10MB)', exts: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'] },
  all: { label: 'Gambar & Dokumen', exts: ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'doc', 'docx', 'xls', 'xlsx'] },
};

const FIELD_TYPES = [
  { value: 'text', label: 'Teks Singkat' },
  { value: 'email', label: 'Email' },
  { value: 'number', label: 'Angka' },
  { value: 'phone', label: 'No. HP' },
  { value: 'textarea', label: 'Teks Panjang' },
  { value: 'select', label: 'Pilihan Dropdown' },
  { value: 'radio', label: 'Pilihan Ganda' },
  { value: 'checkbox', label: 'Centang Banyak' },
  { value: 'date', label: 'Tanggal' },
  { value: 'file', label: 'Upload File' },
];

export default function FormDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { confirm } = useConfirm();
  const [formId, setFormId] = useState('');
  const [form, setForm] = useState<any>(null);
  const [fields, setFields] = useState<any[]>([]);
  const answerFields = fields.filter((f: any) => f.type !== 'section');
  const [responses, setResponses] = useState<any[]>([]);
  const [respPage, setRespPage] = useState(1);
  const [respTotalPages, setRespTotalPages] = useState(1);
  const [respTotal, setRespTotal] = useState(0);
  const [tab, setTab] = useState<'fields' | 'responses'>('fields');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [fieldForm, setFieldForm] = useState({ label: '', description: '', type: 'text', optionsText: '', scaleMin: '1', scaleMax: '5', scaleMinLabel: '', scaleMaxLabel: '', required: false });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    params.then((p) => setFormId(p.id));
  }, [params]);

  const fetchForm = useCallback(async () => {
    if (!formId) return;
    setIsLoading(true);
    try {
      const res = await api.get(`/form-admin/${formId}`);
      setForm(res.data.data);
      setFields(res.data.data.fields || []);
    } catch {
      toast.error('Gagal memuat formulir');
    } finally {
      setIsLoading(false);
    }
  }, [formId]);

  const fetchResponses = useCallback(async (page = respPage) => {
    if (!formId) return;
    try {
      const res = await api.get(`/form-admin/${formId}/responses`, { params: { page, per_page: 20 } });
      setFields(res.data.data.fields || []);
      const payload = res.data.data.responses;
      setResponses(payload.data || []);
      setRespTotalPages(payload.last_page || 1);
      setRespTotal(payload.total || 0);
    } catch {
      toast.error('Gagal memuat data pendaftar');
    }
  }, [formId, respPage]);

  useEffect(() => {
    fetchForm();
  }, [fetchForm]);
  useEffect(() => {
    if (tab === 'responses') fetchResponses();
  }, [tab, fetchResponses]);

  const needsOptions = ['select', 'radio', 'checkbox'].includes(fieldForm.type);

  const openModal = (item: any = null) => {
    setEditing(item);
    setFieldForm(item
      ? {
          label: item.label, description: item.description || '', type: item.type,
          optionsText: (item.options || []).join('\n'),
          scaleMin: String(item.settings?.min ?? 1), scaleMax: String(item.settings?.max ?? 5),
          scaleMinLabel: item.settings?.minLabel || '', scaleMaxLabel: item.settings?.maxLabel || '',
          required: item.required,
        }
      : { label: '', description: '', type: 'text', optionsText: '', scaleMin: '1', scaleMax: '5', scaleMinLabel: '', scaleMaxLabel: '', required: false });
    setIsModalOpen(true);
  };

  const handleSaveField = async (e: React.FormEvent) => {
    e.preventDefault();
    const withOptions = needsOptions || fieldForm.type === 'file';
    const options = withOptions ? fieldForm.optionsText.split('\n').map((o) => o.trim()).filter(Boolean) : [];
    if (needsOptions && options.length === 0) {
      toast.error('Isi minimal satu opsi pilihan');
      return;
    }
    setIsSaving(true);
    try {
      const payload: any = { label: fieldForm.label, description: fieldForm.description || undefined, type: fieldForm.type, options, required: fieldForm.required };
      if (fieldForm.type === 'linear_scale') {
        const min = parseInt(fieldForm.scaleMin) || 0;
        const max = parseInt(fieldForm.scaleMax) || 5;
        payload.settings = { min: Math.min(min, max), max: Math.max(min, max), minLabel: fieldForm.scaleMinLabel, maxLabel: fieldForm.scaleMaxLabel };
      }
      if (editing) {
        await api.put(`/form-fields/${editing.id}`, payload);
        toast.success('Kolom diperbarui');
      } else {
        await api.post(`/form-admin/${formId}/fields`, payload);
        toast.success('Kolom ditambahkan');
      }
      setIsModalOpen(false);
      fetchForm();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleRequired = async (item: any) => {
    try {
      await api.put(`/form-fields/${item.id}`, { required: !item.required });
      fetchForm();
    } catch {
      toast.error('Gagal mengubah status wajib');
    }
  };

  const handleDeleteField = async (id: number) => {
    if (!(await confirm({ message: 'Hapus kolom ini? Jawaban terkait tetap tersimpan.', tone: 'danger' }))) return;
    try {
      await api.delete(`/form-fields/${id}`);
      toast.success('Kolom dihapus');
      fetchForm();
    } catch {
      toast.error('Gagal menghapus');
    }
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination || result.destination.index === result.source.index) return;
    const reordered = [...fields];
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setFields(reordered);
    try {
      await api.put(`/form-admin/${formId}/reorder`, { items: reordered.map((f, i) => ({ id: f.id, order: i + 1 })) });
    } catch {
      toast.error('Gagal menyimpan urutan');
      fetchForm();
    }
  };

  const handleDuplicateField = async (item: any) => {
    try {
      await api.post(`/form-admin/${formId}/fields`, {
        label: `${item.label} (salinan)`,
        type: item.type,
        options: item.options || [],
        required: item.required,
      });
      toast.success('Kolom diduplikat');
      fetchForm();
    } catch {
      toast.error('Gagal menduplikat');
    }
  };

  const handleDeleteResponse = async (id: number) => {
    if (!(await confirm({ message: 'Hapus data pendaftar ini?', tone: 'danger' }))) return;
    try {
      await api.delete(`/form-responses/${id}`);
      toast.success('Data dihapus');
      fetchResponses();
    } catch {
      toast.error('Gagal menghapus');
    }
  };

  const buildExportRows = () => {
    const header = ['Waktu', ...answerFields.map((f: any) => f.label)];
    const rows = responses.map((r: any) => [
      new Date(r.created_at).toLocaleString('id-ID'),
      ...answerFields.map((f: any) => {
        const v = r.data?.[f.id] ?? r.data?.[String(f.id)];
        return Array.isArray(v) ? v.join('; ') : (v ?? '');
      }),
    ]);
    return [header, ...rows];
  };

  const exportExcel = async () => {
    if (responses.length === 0) {
      toast.error('Tidak ada data untuk diekspor');
      return;
    }
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.aoa_to_sheet(buildExportRows());
    ws['!cols'] = [{ wch: 20 }, ...answerFields.map(() => ({ wch: 25 }))];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pendaftar');
    XLSX.writeFile(wb, `pendaftar-${form?.slug || formId}.xlsx`);
    toast.success('File Excel diunduh');
  };

  const exportCSV = () => {
    if (responses.length === 0) {
      toast.error('Tidak ada data untuk diekspor');
      return;
    }
    const csv = buildExportRows().map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `pendaftar-${form?.slug || formId}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const inputClass = "w-full border border-slate-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000]";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/forms">
          <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-sm border-slate-200 hover:text-[#c20000]">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1 bg-white p-6 rounded-sm shadow-sm border border-[#0f172a]/5">
          <h1 className="text-2xl font-bold text-[#0f172a]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
            {form?.title || 'Memuat...'}
          </h1>
          {form && (
            <a href={`/form/${form.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-mono text-blue-600 hover:text-[#c20000] mt-1">
              /form/{form.slug} <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setTab('fields')}
          className={`px-4 py-2 rounded-sm text-sm font-semibold border transition-colors ${tab === 'fields' ? 'bg-[#c20000] text-white border-[#c20000]' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
          Kolom Pertanyaan ({fields.length})
        </button>
        <button onClick={() => setTab('responses')}
          className={`px-4 py-2 rounded-sm text-sm font-semibold border transition-colors inline-flex items-center gap-1.5 ${tab === 'responses' ? 'bg-[#c20000] text-white border-[#c20000]' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
          <Users className="w-4 h-4" /> Data Pendaftar
        </button>
      </div>

      {tab === 'fields' && (
        <Card className="border-[#0f172a]/10 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-end gap-2">
            <Button onClick={() => setIsPreviewOpen(true)} size="sm" variant="outline" className="border-slate-200">
              <Eye className="w-4 h-4 mr-1.5" /> Pratinjau
            </Button>
            <Button onClick={() => openModal()} size="sm" className="bg-[#c20000] hover:bg-[#a30000] text-white">
              <Plus className="w-4 h-4 mr-1.5" /> Tambah Kolom
            </Button>
          </div>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="fields">
              {(provided) => (
                <div className="space-y-3 p-4 bg-slate-100/60" ref={provided.innerRef} {...provided.droppableProps}>
                  {isLoading ? (
                    <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[#c20000]" /></div>
                  ) : fields.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">Belum ada kolom. Tambahkan pertanyaan pertama atau seret untuk menyusun ulang.</div>
                  ) : fields.map((f: any, idx: number) => (
                    <Draggable key={f.id} draggableId={String(f.id)} index={idx}>
                      {(dragProvided, snapshot) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          className={`bg-white border rounded-sm transition-all ${snapshot.isDragging ? 'border-[#c20000]/50 shadow-xl rotate-[0.5deg]' : 'border-slate-200 shadow-sm hover:shadow'}`}
                        >
                          <div className="flex items-center gap-3 p-4">
                            <span {...dragProvided.dragHandleProps} title="Seret untuk memindahkan" className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-[#c20000] shrink-0">
                              <GripVertical className="w-5 h-5" />
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-[#0f172a] text-[15px]">{f.label} {f.required && f.type !== 'section' && <span className="text-red-500">*</span>}</p>
                              {f.description && <p className="text-xs text-slate-500 mt-0.5">{f.description}</p>}
                              <p className="text-[11px] text-slate-400 mt-1 uppercase tracking-wide">{FIELD_TYPES.find((t) => t.value === f.type)?.label}{f.type === 'file' ? ` • ${(f.options || []).join(', ') || 'semua'}` : f.options?.length ? ` • ${f.options.join(', ')}` : ''}{f.type === 'linear_scale' ? ` • ${f.settings?.min ?? 1}–${f.settings?.max ?? 5}` : ''}</p>
                            </div>
                            {f.type === 'section' && (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600 bg-violet-50 border border-violet-200 rounded-full px-2.5 py-1 shrink-0">Section</span>
                            )}
                          </div>
                          <div className="flex items-center justify-end gap-1 px-4 py-2 border-t border-slate-100 bg-slate-50/60 rounded-b-xl">
                            <button onClick={() => handleDuplicateField(f)} title="Duplikat" className="h-8 w-8 inline-flex items-center justify-center text-slate-500 hover:text-violet-700 hover:bg-violet-100 rounded-full transition-colors"><Copy className="w-4 h-4" /></button>
                            <button onClick={() => openModal(f)} title="Edit" className="h-8 w-8 inline-flex items-center justify-center text-slate-500 hover:text-blue-700 hover:bg-blue-100 rounded-full transition-colors"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => handleDeleteField(f.id)} title="Hapus" className="h-8 w-8 inline-flex items-center justify-center text-slate-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors"><Trash2 className="w-4 h-4" /></button>
                            {f.type !== 'section' && (
                              <>
                                <span className="w-px h-5 bg-slate-200 mx-1" />
                                <span className="text-xs font-medium text-slate-500 mr-1">Wajib</span>
                                <button
                                  type="button"
                                  role="switch"
                                  aria-checked={f.required}
                                  title={f.required ? 'Jadikan opsional' : 'Jadikan wajib'}
                                  onClick={() => handleToggleRequired(f)}
                                  className={`relative w-9 h-5 rounded-full transition-colors ${f.required ? 'bg-[#c20000]' : 'bg-slate-300'}`}
                                >
                                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${f.required ? 'left-[18px]' : 'left-0.5'}`} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </Card>
      )}
      {tab === 'responses' && (
        <Card className="border-[#0f172a]/10 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <p className="text-sm text-slate-600 font-medium">{respTotal} pendaftar</p>
            <div className="flex gap-2">
              <Button onClick={exportCSV} size="sm" variant="outline" className="border-slate-200">
                <Download className="w-4 h-4 mr-1.5" /> CSV
              </Button>
              <Button onClick={() => void exportExcel()} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Download className="w-4 h-4 mr-1.5" /> Excel
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-white border-b border-[#0f172a]/5 text-[#0f172a]/70 text-xs font-semibold uppercase tracking-wider">
                  <th className="p-3 pl-6">Waktu</th>
                  {answerFields.map((f: any) => (<th key={f.id} className="p-3 whitespace-nowrap">{f.label}</th>))}
                  <th className="p-3 pr-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {responses.length === 0 ? (
                  <tr><td colSpan={answerFields.length + 2} className="p-12 text-center text-slate-500">Belum ada pendaftar</td></tr>
                ) : responses.map((r: any) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 pl-6 whitespace-nowrap text-xs text-slate-500">
                      {new Date(r.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    {answerFields.map((f: any) => {
                      const v = r.data?.[f.id] ?? r.data?.[String(f.id)];
                      const isFile = typeof v === 'string' && v.startsWith('/storage/forms/');
                      return (
                        <td key={f.id} className="p-3 text-slate-700 max-w-[12rem] truncate" title={Array.isArray(v) ? v.join(', ') : String(v ?? '-')}>
                          {isFile ? (
                            <a href={v} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-[#c20000] hover:underline font-medium">Lihat File ⬈</a>
                          ) : Array.isArray(v) ? v.join(', ') : (v ?? '-')}
                        </td>
                      );
                    })}
                    <td className="p-3 pr-6 text-right">
                      <button onClick={() => handleDeleteResponse(r.id)} title="Hapus" className="h-8 w-8 inline-flex items-center justify-center text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-sm transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-6 py-4">
            <button disabled={respPage === 1} onClick={() => setRespPage((p) => Math.max(1, p - 1))} className="px-3 py-1.5 text-sm rounded-sm border border-slate-200 disabled:opacity-40 hover:bg-slate-50">Prev</button>
            <span className="text-sm text-slate-600 font-semibold">{respPage} / {respTotalPages}</span>
            <button disabled={respPage === respTotalPages} onClick={() => setRespPage((p) => Math.min(respTotalPages, p + 1))} className="px-3 py-1.5 text-sm rounded-sm border border-slate-200 disabled:opacity-40 hover:bg-slate-50">Next</button>
          </div>
        </Card>
      )}

      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/50 backdrop-blur-sm p-4 overflow-y-auto" onClick={() => setIsPreviewOpen(false)}>
          <div className="bg-[#f8f9fa] rounded-sm shadow-xl max-w-2xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-800">Pratinjau Formulir</h2>
              <button onClick={() => setIsPreviewOpen(false)} className="text-sm font-semibold text-slate-500 hover:text-[#c20000]">Tutup ✕</button>
            </div>
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-[#0f172a]">{form?.title}</h3>
              {form?.description && <p className="text-sm text-slate-500 mt-1">{form.description}</p>}
            </div>
            <FormFillClient form={{ ...(form || {}), slug: form?.slug || 'pratinjau', fields, is_open: true }} preview />
            <p className="text-center text-[11px] text-slate-400 mt-4">Mode pratinjau — isian tidak tersimpan.</p>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/50 backdrop-blur-sm p-4" onClick={() => setIsModalOpen(false)}>
          <form onSubmit={handleSaveField} className="bg-white rounded-sm shadow-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-slate-800 mb-5">{editing ? 'Edit Kolom' : 'Tambah Kolom'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pertanyaan / Label</label>
                <input type="text" required value={fieldForm.label} onChange={(e) => setFieldForm({ ...fieldForm, label: e.target.value })}
                  placeholder="Nama Lengkap" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi <span className="text-slate-400 font-normal">(opsional, tampil di bawah pertanyaan)</span></label>
                <input type="text" value={fieldForm.description} onChange={(e) => setFieldForm({ ...fieldForm, description: e.target.value })}
                  placeholder="Contoh: Isi sesuai KTP" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipe Kolom</label>
                <select value={fieldForm.type} onChange={(e) => setFieldForm({ ...fieldForm, type: e.target.value, optionsText: '' })} className={inputClass}>
                  {FIELD_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
                </select>
              </div>
              {['select', 'radio', 'checkbox'].includes(fieldForm.type) && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Opsi Pilihan <span className="text-slate-400 font-normal">(satu per baris)</span></label>
                  <textarea value={fieldForm.optionsText} onChange={(e) => setFieldForm({ ...fieldForm, optionsText: e.target.value })} rows={4}
                    placeholder={'UMS\nUMPKU\nUNISA'} className={`${inputClass} resize-none font-mono`} />
                </div>
              )}
              {fieldForm.type === 'linear_scale' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nilai Terkecil</label>
                    <input type="number" value={fieldForm.scaleMin} onChange={(e) => setFieldForm({ ...fieldForm, scaleMin: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nilai Terbesar</label>
                    <input type="number" value={fieldForm.scaleMax} onChange={(e) => setFieldForm({ ...fieldForm, scaleMax: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Label Kiri</label>
                    <input type="text" value={fieldForm.scaleMinLabel} onChange={(e) => setFieldForm({ ...fieldForm, scaleMinLabel: e.target.value })} placeholder="Tidak Puas" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Label Kanan</label>
                    <input type="text" value={fieldForm.scaleMaxLabel} onChange={(e) => setFieldForm({ ...fieldForm, scaleMaxLabel: e.target.value })} placeholder="Sangat Puas" className={inputClass} />
                  </div>
                </div>
              )}
              {fieldForm.type === 'file' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Jenis File yang Diizinkan</label>
                  <div className="space-y-2">
                    {Object.entries(FILE_PRESETS).map(([key, preset]) => {
                      const current = fieldForm.optionsText.split('\n').map((o) => o.trim()).filter(Boolean);
                      const selected = current.length > 0 && preset.exts.every((e) => current.includes(e));
                      return (
                        <label key={key} className={`flex items-center gap-2.5 p-2.5 border rounded-sm cursor-pointer text-sm transition-colors ${selected ? 'border-[#c20000]/40 bg-[#c20000]/5' : 'border-slate-200 hover:bg-slate-50'}`}>
                          <input
                            type="radio"
                            name="file-preset"
                            checked={selected}
                            onChange={() => setFieldForm({ ...fieldForm, optionsText: preset.exts.join('\n') })}
                            className="w-4 h-4 accent-[#c20000]"
                          />
                          <span className="font-medium text-slate-700">{preset.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
              {fieldForm.type !== 'section' && (
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={fieldForm.required} onChange={(e) => setFieldForm({ ...fieldForm, required: e.target.checked })} className="w-4 h-4 accent-[#c20000]" />
                  Wajib diisi
                </label>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
              <Button type="submit" disabled={isSaving} className="bg-[#c20000] hover:bg-[#a30000] text-white">
                {isSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Simpan
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
