'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ArrowLeft, Plus, Edit, Trash2, Loader2, ExternalLink, Download, Users, Copy, Eye, GripVertical, FileSpreadsheet, FolderArchive, Search, FileText, X, Settings, Upload, Image as ImageIcon, ShieldCheck, Crop } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import FormFillClient from '@/components/form/FormFillClient';
import toast from 'react-hot-toast';
import { useConfirm } from '@/components/providers/ConfirmProvider';
import ImageUploadPicker from '@/components/dashboard/ImageUploadPicker';
import ImageCropperModal from '@/components/dashboard/ImageCropperModal';
import { resolveMediaUrl } from '@/lib/imageUtils';
import { PageHeader } from '@/components/ui/PageHeader';

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

function getColLetter(colIndex: number): string {
  let temp = colIndex;
  let letter = '';
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter;
    temp = Math.floor(temp / 26) - 1;
  }
  return letter;
}

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
  const [tab, setTab] = useState<'fields' | 'responses' | 'settings'>('fields');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [fieldForm, setFieldForm] = useState({ label: '', description: '', type: 'text', optionsText: '', scaleMin: '1', scaleMax: '5', scaleMinLabel: '', scaleMaxLabel: '', required: false });
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResponse, setSelectedResponse] = useState<any | null>(null);
  const [isExportingZip, setIsExportingZip] = useState(false);

  // Form Settings states
  const [settingsTitle, setSettingsTitle] = useState('');
  const [settingsDescription, setSettingsDescription] = useState('');
  const [settingsRequireEmail, setSettingsRequireEmail] = useState(false);
  const [settingsLimitOneResponse, setSettingsLimitOneResponse] = useState(false);
  const [settingsIsOpen, setSettingsIsOpen] = useState(true);
  const [settingsIsUnlimitedQuota, setSettingsIsUnlimitedQuota] = useState(true);
  const [settingsMaxResponses, setSettingsMaxResponses] = useState('');
  const [headerImageVal, setHeaderImageVal] = useState<File | string | null>(null);
  const [settingsHeaderImageSize, setSettingsHeaderImageSize] = useState<'banner' | 'medium' | 'wide' | 'natural'>('banner');
  const [isHeaderCropModalOpen, setIsHeaderCropModalOpen] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const getHeaderCropUrl = () => {
    if (!headerImageVal) return null;
    if (headerImageVal instanceof File) {
      return URL.createObjectURL(headerImageVal);
    }
    return resolveMediaUrl(headerImageVal);
  };

  useEffect(() => {
    params.then((p) => setFormId(p.id));
  }, [params]);

  const fetchForm = useCallback(async () => {
    if (!formId) return;
    setIsLoading(true);
    try {
      const res = await api.get(`/form-admin/${formId}`);
      const data = res.data.data;
      setForm(data);
      setFields(data.fields || []);
      setSettingsTitle(data.title || '');
      setSettingsDescription(data.description || '');
      setSettingsRequireEmail(Boolean(data.require_email));
      setSettingsLimitOneResponse(Boolean(data.limit_one_response));
      setSettingsIsOpen(Boolean(data.is_open ?? data.is_active));
      setSettingsIsUnlimitedQuota(!data.max_responses);
      setSettingsMaxResponses(data.max_responses ? String(data.max_responses) : '');
      setHeaderImageVal(data.header_image || null);
      setSettingsHeaderImageSize(data.header_image_size || 'banner');
    } catch {
      toast.error('Gagal memuat formulir');
    } finally {
      setIsLoading(false);
    }
  }, [formId]);

  const fetchResponses = useCallback(async (page = respPage) => {
    if (!formId) return;
    try {
      const res = await api.get(`/form-admin/${formId}/responses`, { params: { page, per_page: 50 } });
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
    const rawOptions = withOptions ? fieldForm.optionsText.split('\n').map((o) => o.trim()).filter(Boolean) : [];
    if (needsOptions) {
      if (rawOptions.length === 0) {
        toast.error('Isi minimal satu opsi pilihan');
        return;
      }
      const seen = new Set<string>();
      const duplicates = new Set<string>();
      for (const opt of rawOptions) {
        const lower = opt.toLowerCase();
        if (seen.has(lower)) {
          duplicates.add(opt);
        } else {
          seen.add(lower);
        }
      }
      if (duplicates.size > 0) {
        toast.error(`Opsi pilihan tidak boleh memiliki nilai duplikat: "${Array.from(duplicates).join('", "')}". Setiap opsi harus unik.`);
        return;
      }
    }
    const options = Array.from(new Set(rawOptions));
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


  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsTitle.trim()) {
      toast.error('Judul formulir wajib diisi');
      return;
    }

    setIsSavingSettings(true);
    try {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('title', settingsTitle);
      formData.append('description', settingsDescription);
      formData.append('require_email', settingsRequireEmail ? '1' : '0');
      formData.append('limit_one_response', settingsLimitOneResponse ? '1' : '0');
      formData.append('is_active', settingsIsOpen ? '1' : '0');
      formData.append('header_image_size', settingsHeaderImageSize);
      formData.append('max_responses', settingsIsUnlimitedQuota ? '' : settingsMaxResponses);

      if (headerImageVal instanceof File) {
        formData.append('header_image', headerImageVal);
      } else if (typeof headerImageVal === 'string') {
        formData.append('header_image', headerImageVal);
      } else if (!headerImageVal && form?.header_image) {
        formData.append('header_image', '');
      }

      const res = await api.post(`/form-admin/${formId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Pengaturan formulir berhasil disimpan');
      const updated = res.data.data;
      setForm(updated);
      setHeaderImageVal(updated.header_image || null);
      setSettingsHeaderImageSize(updated.header_image_size || 'banner');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan pengaturan formulir');
    } finally {
      setIsSavingSettings(false);
    }
  };


  const handleDeleteResponse = async (id: number) => {
    if (!(await confirm({ message: 'Hapus data pendaftar ini?', tone: 'danger' }))) return;
    try {
      await api.delete(`/form-responses/${id}`);
      toast.success('Data dihapus');
      fetchResponses();
      if (selectedResponse?.id === id) {
        setSelectedResponse(null);
      }
    } catch {
      toast.error('Gagal menghapus');
    }
  };

  const filteredResponses = responses.filter((r: any) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    if (String(r.id).includes(q)) return true;
    const data = r.data || {};
    return Object.values(data).some((val) => {
      if (val == null) return false;
      if (Array.isArray(val)) return val.join(' ').toLowerCase().includes(q);
      return String(val).toLowerCase().includes(q);
    });
  });

  const exportExcel = async () => {
    if (respTotal === 0 && responses.length === 0) {
      toast.error('Tidak ada data untuk diekspor');
      return;
    }
    const toastId = toast.loading('Menyiapkan file Excel...');
    try {
      const res = await api.get(`/form-admin/${formId}/responses`, { params: { per_page: 1000 } });
      const allResponses = res.data.data.responses.data || responses;
      const XLSX = await import('xlsx');

      const hasEmail = form?.require_email || allResponses.some((r: any) => Boolean(r.email));
      const header = ['No', 'ID Pendaftar', 'Waktu Submit', ...(hasEmail ? ['Email Responden'] : []), ...answerFields.map((f: any) => f.label)];
      const rows = allResponses.map((r: any, idx: number) => [
        idx + 1,
        r.id,
        new Date(r.created_at).toLocaleString('id-ID'),
        ...(hasEmail ? [r.email || ''] : []),
        ...answerFields.map((f: any) => {
          const v = r.data?.[f.id] ?? r.data?.[String(f.id)];
          return Array.isArray(v) ? v.join('; ') : (v ?? '');
        }),
      ]);

      const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
      ws['!cols'] = [
        { wch: 6 },
        { wch: 14 },
        { wch: 22 },
        ...(hasEmail ? [{ wch: 26 }] : []),
        ...answerFields.map(() => ({ wch: 28 }))
      ];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Data Responden');
      XLSX.writeFile(wb, `pendaftar-${form?.slug || formId}.xlsx`);
      toast.success('File Excel berhasil diunduh', { id: toastId });
    } catch {
      toast.error('Gagal mengekspor file Excel', { id: toastId });
    }
  };

  const exportCSV = () => {
    if (responses.length === 0) {
      toast.error('Tidak ada data untuk diekspor');
      return;
    }
    const hasEmail = form?.require_email || responses.some((r: any) => Boolean(r.email));
    const header = ['No', 'ID Pendaftar', 'Waktu Submit', ...(hasEmail ? ['Email Responden'] : []), ...answerFields.map((f: any) => f.label)];
    const rows = responses.map((r: any, idx: number) => [
      idx + 1,
      r.id,
      new Date(r.created_at).toLocaleString('id-ID'),
      ...(hasEmail ? [r.email || ''] : []),
      ...answerFields.map((f: any) => {
        const v = r.data?.[f.id] ?? r.data?.[String(f.id)];
        return Array.isArray(v) ? v.join('; ') : (v ?? '');
      }),
    ]);
    const csv = [header, ...rows].map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `pendaftar-${form?.slug || formId}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const exportZipWithFiles = async () => {
    if (respTotal === 0 && responses.length === 0) {
      toast.error('Belum ada data pendaftar untuk diekspor');
      return;
    }
    setIsExportingZip(true);
    const toastId = toast.loading('Menyiapkan file ZIP & mengelompokkan berkas per pendaftar...');
    try {
      const res = await api.get(`/form-admin/${formId}/export-zip`, {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rekap-pendaftar-${form?.slug || formId}-${new Date().toISOString().slice(0, 10)}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('File ZIP (Excel + Berkas per Pengisi) berhasil diunduh!', { id: toastId });
    } catch (err: any) {
      let msg = 'Gagal mengekspor berkas ZIP';
      if (err?.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const json = JSON.parse(text);
          if (json.message) msg = json.message;
        } catch {}
      } else if (err?.response?.data?.message) {
        msg = err.response.data.message;
      }
      toast.error(msg, { id: toastId });
    } finally {
      setIsExportingZip(false);
    }
  };

  const hasEmail = Boolean(form?.require_email || responses.some((r: any) => Boolean(r.email)));
  const inputClass = "w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-[#c20000] focus:ring-2 focus:ring-[#c20000]/20 transition-all";

  return (
    <div className="space-y-6">
      {/* Modern Page Header */}
      <PageHeader
        title={form?.title || 'Pengaturan & Kolom Formulir'}
        description={form?.description || 'Kelola kolom pertanyaan, tinjau responden, ekspor data, dan atur banner formulir'}
        badge="Form Builder"
      >
        <Link href="/dashboard/forms">
          <Button variant="outline" size="sm" className="h-10 px-3.5 rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Kembali
          </Button>
        </Link>
        {form && (
          <div className="flex items-center gap-2">
            <a
              href={`/form/${form.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-2xs transition-all hover:scale-[1.02] active:scale-[0.98]"
              title="Buka form pendaftaran publik"
            >
              <span>Isi Form</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        )}
      </PageHeader>

      {/* Tab Navigation Modern */}
      <div className="flex items-center gap-2 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/80 w-fit max-w-full overflow-x-auto">
        <button
          onClick={() => setTab('fields')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            tab === 'fields'
              ? 'bg-white text-[#c20000] shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <GripVertical className="w-3.5 h-3.5" />
          <span>Kolom Pertanyaan ({fields.length})</span>
        </button>
        <button
          onClick={() => setTab('responses')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            tab === 'responses'
              ? 'bg-white text-[#c20000] shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Data Responden ({respTotal})</span>
        </button>
        <button
          onClick={() => setTab('settings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            tab === 'settings'
              ? 'bg-white text-[#c20000] shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Pengaturan & Banner</span>
        </button>
      </div>

      {tab === 'fields' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-bold text-slate-700">Daftar Pertanyaan</span>
            <div className="flex items-center gap-2">
              <Button onClick={() => setIsPreviewOpen(true)} size="sm" variant="outline" className="border-slate-200 rounded-xl text-xs font-semibold shadow-2xs">
                <Eye className="w-3.5 h-3.5 mr-1.5" /> Pratinjau
              </Button>
              <Button onClick={() => openModal()} size="sm" className="bg-[#c20000] hover:bg-[#a30000] text-white rounded-xl text-xs font-bold shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]">
                <Plus className="w-3.5 h-3.5 mr-1.5 stroke-[2.5]" /> Tambah Kolom
              </Button>
            </div>
          </div>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="fields">
              {(provided) => (
                <div className="space-y-3 p-4 bg-slate-50/40" ref={provided.innerRef} {...provided.droppableProps}>
                  {isLoading ? (
                    <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[#c20000]" /></div>
                  ) : fields.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 text-xs">Belum ada kolom. Tambahkan pertanyaan pertama atau seret untuk menyusun ulang.</div>
                  ) : fields.map((f: any, idx: number) => (
                    <Draggable key={f.id} draggableId={String(f.id)} index={idx}>
                      {(dragProvided, snapshot) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          className={`bg-white border rounded-2xl transition-all ${snapshot.isDragging ? 'border-[#c20000]/50 shadow-xl rotate-[0.5deg]' : 'border-slate-200/80 shadow-2xs hover:shadow-xs'}`}
                        >
                          <div className="flex items-center gap-3 p-4">
                            <span {...dragProvided.dragHandleProps} title="Seret untuk memindahkan" className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-[#c20000] shrink-0 p-1">
                              <GripVertical className="w-4 h-4" />
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-slate-900 text-sm">{f.label} {f.required && f.type !== 'section' && <span className="text-red-500">*</span>}</p>
                              {f.description && <p className="text-xs text-slate-500 mt-0.5">{f.description}</p>}
                              <p className="text-[10px] font-mono font-semibold text-slate-400 mt-1 uppercase tracking-wider">{FIELD_TYPES.find((t) => t.value === f.type)?.label}{f.type === 'file' ? ` • ${(f.options || []).join(', ') || 'semua'}` : f.options?.length ? ` • ${f.options.join(', ')}` : ''}{f.type === 'linear_scale' ? ` • ${f.settings?.min ?? 1}–${f.settings?.max ?? 5}` : ''}</p>
                            </div>
                            {f.type === 'section' && (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600 bg-violet-50 border border-violet-200 rounded-full px-2.5 py-1 shrink-0">Section</span>
                            )}
                          </div>
                          <div className="flex items-center justify-end gap-1 px-4 py-2.5 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
                            <button onClick={() => handleDuplicateField(f)} title="Duplikat" className="h-8 w-8 inline-flex items-center justify-center text-slate-500 hover:text-violet-700 hover:bg-violet-50 rounded-xl transition-colors"><Copy className="w-3.5 h-3.5" /></button>
                            <button onClick={() => openModal(f)} title="Edit" className="h-8 w-8 inline-flex items-center justify-center text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleDeleteField(f.id)} title="Hapus" className="h-8 w-8 inline-flex items-center justify-center text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                            {f.type !== 'section' && (
                              <>
                                <span className="w-px h-4 bg-slate-200 mx-1.5" />
                                <span className="text-xs font-semibold text-slate-600 mr-1.5">Wajib</span>
                                <button
                                  type="button"
                                  role="switch"
                                  aria-checked={f.required}
                                  title={f.required ? 'Jadikan opsional' : 'Jadikan wajib'}
                                  onClick={() => handleToggleRequired(f)}
                                  className={`relative w-8 h-4.5 rounded-full transition-colors ${f.required ? 'bg-[#c20000]' : 'bg-slate-300'}`}
                                >
                                  <span className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-all ${f.required ? 'left-[15px]' : 'left-0.5'}`} />
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
        </div>
      )}

      {tab === 'responses' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
          {/* Spreadsheet Toolbar */}
          <div className="bg-slate-50/80 border-b border-slate-200/80 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-semibold">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Spreadsheet View</span>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {respTotal} responden terdaftar {searchQuery && `(${filteredResponses.length} cocok)`}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Search filter */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari dalam sheet..."
                  className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 w-44 sm:w-56"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs">✕</button>
                )}
              </div>

              {/* Action Buttons */}
              <Button
                onClick={exportZipWithFiles}
                disabled={isExportingZip || respTotal === 0}
                size="sm"
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs shadow-sm h-8"
                title="Unduh seluruh rekap spreadsheet beserta berkas/dokumen upload yang dikelompokkan per peserta"
              >
                {isExportingZip ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Mengompres Berkas...
                  </>
                ) : (
                  <>
                    <FolderArchive className="w-3.5 h-3.5 mr-1.5" /> Export ZIP (Excel + Berkas)
                  </>
                )}
              </Button>

              <Button
                onClick={() => void exportExcel()}
                disabled={respTotal === 0}
                size="sm"
                variant="outline"
                className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-xs font-medium h-8"
                title="Unduh rekap data tabel dalam format Microsoft Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> Excel (.xlsx)
              </Button>

              <Button
                onClick={exportCSV}
                disabled={respTotal === 0}
                size="sm"
                variant="outline"
                className="border-slate-300 text-slate-600 hover:bg-slate-50 text-xs h-8"
              >
                <Download className="w-3.5 h-3.5 mr-1" /> CSV
              </Button>
            </div>
          </div>

          {/* Spreadsheet Formula / Sheet Status Bar */}
          <div className="bg-[#f1f3f4] border-b border-slate-300 px-4 py-1.5 flex items-center justify-between text-[11px] text-slate-600 font-mono select-none">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-700">fx</span>
              <span className="text-slate-500">
                {selectedResponse ? `Baris terpilih: Pendaftar #${selectedResponse.id}` : `Formulir: ${form?.title || 'Form'} | Total Kolom: ${answerFields.length + (hasEmail ? 3 : 2)}`}
              </span>
            </div>
            <span className="text-slate-400 hidden sm:inline">Klik baris atau tombol detail untuk melihat seluruh jawaban responden</span>
          </div>

          {/* Spreadsheet Table Container */}
          <div className="overflow-x-auto max-h-[680px] overflow-y-auto border-b border-slate-300 select-text">
            <table className="w-full text-left border-collapse text-xs border border-slate-300 bg-white min-w-max">
              <thead>
                {/* Row 1: Spreadsheet Column Letters (A, B, C, D...) */}
                <tr className="bg-[#e9ecef] border-b border-slate-300 text-slate-600 font-mono text-[11px] font-bold">
                  <th className="w-12 text-center p-1 border-r border-slate-300 bg-[#dee2e6] text-slate-500 select-none">#</th>
                  <th className="p-1 px-3 border-r border-slate-300 text-center uppercase tracking-wider">{getColLetter(0)}</th>
                  <th className="p-1 px-3 border-r border-slate-300 text-center uppercase tracking-wider">{getColLetter(1)}</th>
                  {hasEmail && (
                    <th className="p-1 px-3 border-r border-slate-300 text-center uppercase tracking-wider">{getColLetter(2)}</th>
                  )}
                  {answerFields.map((_, idx) => (
                    <th key={idx} className="p-1 px-3 border-r border-slate-300 text-center uppercase tracking-wider">
                      {getColLetter(idx + (hasEmail ? 3 : 2))}
                    </th>
                  ))}
                  <th className="p-1 px-3 text-center uppercase tracking-wider bg-[#dee2e6] text-slate-500">AKSI</th>
                </tr>

                {/* Row 2: Real Field Headers */}
                <tr className="bg-[#f8f9fa] border-b border-slate-300 text-slate-700 font-semibold text-xs sticky top-0 z-10 shadow-sm">
                  <th className="w-12 text-center p-2.5 border-r border-slate-300 bg-[#e9ecef] text-slate-500 font-mono select-none">No</th>
                  <th className="p-2.5 px-3 border-r border-slate-300 whitespace-nowrap min-w-[80px]">ID Pendaftar</th>
                  <th className="p-2.5 px-3 border-r border-slate-300 whitespace-nowrap min-w-[150px]">Waktu Submit</th>
                  {hasEmail && (
                    <th className="p-2.5 px-3 border-r border-slate-300 whitespace-nowrap min-w-[190px]">
                      <div className="flex items-center gap-1.5 text-emerald-800">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Email Responden</span>
                      </div>
                    </th>
                  )}
                  {answerFields.map((f: any) => (
                    <th key={f.id} className="p-2.5 px-3 border-r border-slate-300 whitespace-nowrap min-w-[180px] max-w-[280px]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate" title={f.label}>{f.label}</span>
                        <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-slate-200 text-slate-600 uppercase shrink-0">
                          {f.type}
                        </span>
                      </div>
                    </th>
                  ))}
                  <th className="p-2.5 px-4 text-center whitespace-nowrap min-w-[110px] bg-[#f1f3f4]">Opsi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 font-sans">
                {filteredResponses.length === 0 ? (
                  <tr>
                    <td colSpan={answerFields.length + (hasEmail ? 4 : 3)} className="p-14 text-center text-slate-500 bg-slate-50/50">
                      <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="font-semibold text-slate-700">
                        {searchQuery ? 'Tidak ada data yang sesuai dengan pencarian' : 'Belum ada data pendaftar pada formulir ini'}
                      </p>
                      {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="mt-2 text-xs text-emerald-600 hover:underline">
                          Reset filter pencarian
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredResponses.map((r: any, rIdx: number) => {
                    const rowNumber = (respPage - 1) * 50 + rIdx + 1;
                    return (
                      <tr
                        key={r.id}
                        onClick={() => setSelectedResponse(r)}
                        className={`hover:bg-emerald-50/40 cursor-pointer transition-colors ${
                          selectedResponse?.id === r.id ? 'bg-emerald-100/50 font-medium' : rIdx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'
                        }`}
                      >
                        {/* Row Index (Excel row number) */}
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

                        {/* Col C..: Answer Fields */}
                        {answerFields.map((f: any) => {
                          const v = r.data?.[f.id] ?? r.data?.[String(f.id)];
                          const isFile = f.type === 'file' || (typeof v === 'string' && v.startsWith('/storage/'));

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
                                  title="Klik untuk membuka / mengunduh file"
                                >
                                  <ExternalLink className="w-3 h-3 shrink-0" />
                                  <span className="truncate max-w-[150px]">{v.split('/').pop() || 'Lihat File'}</span>
                                </a>
                              ) : isFile ? (
                                <span className="text-slate-300 italic text-[11px]">- tidak ada file -</span>
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

                        {/* Col Options: Detail & Delete */}
                        <td className="p-2 px-3 text-center whitespace-nowrap bg-slate-50/50" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedResponse(r)}
                              title="Lihat detail lengkap responden"
                              className="px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-emerald-700 bg-white hover:bg-emerald-50 border border-slate-200 rounded-sm transition-colors inline-flex items-center gap-1"
                            >
                              <FileText className="w-3 h-3 text-emerald-600" /> Detail
                            </button>
                            <button
                              onClick={() => handleDeleteResponse(r.id)}
                              title="Hapus data ini"
                              className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-sm border border-transparent hover:border-red-200 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
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
              Menampilkan {filteredResponses.length} dari {respTotal} responden
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={respPage === 1}
                onClick={() => setRespPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 text-xs rounded-sm border border-slate-300 bg-white disabled:opacity-40 hover:bg-slate-50 transition-colors font-medium text-slate-700"
              >
                ← Prev
              </button>
              <span className="text-slate-700 font-mono font-semibold px-2">
                Halaman {respPage} / {respTotalPages || 1}
              </span>
              <button
                disabled={respPage === respTotalPages || respTotalPages === 0}
                onClick={() => setRespPage((p) => Math.min(respTotalPages, p + 1))}
                className="px-3 py-1 text-xs rounded-sm border border-slate-300 bg-white disabled:opacity-40 hover:bg-slate-50 transition-colors font-medium text-slate-700"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'settings' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs p-6 sm:p-8 max-w-4xl">
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[#0f172a] mb-1">Pengaturan & Banner Formulir</h2>
              <p className="text-xs text-slate-500">
                Atur banner gambar header seperti Google Form, verifikasi email responden anti-spam, serta status pembukaan formulir.
              </p>
            </div>

            {/* Section 1: Header Image (Banner ala Google Form) */}
            <div className="border border-slate-200/90 rounded-2xl p-5 bg-slate-50/60 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#c20000]" /> Banner Gambar Header Formulir
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Gambar banner ini akan tampil di bagian atas formulir online publik.
                  </p>
                </div>
              </div>

              <ImageUploadPicker
                value={headerImageVal}
                onChange={(val) => setHeaderImageVal(val)}
                aspectRatio={settingsHeaderImageSize}
                allowedFolder="forms"
                description="Pilih dari Media Library atau unggah berkas gambar baru dari perangkat."
              />

              {/* Fitur Tarik & Sesuaikan Potongan Crop ala Google Forms */}
              <div className="pt-3 border-t border-slate-200/80 bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-lg bg-red-50 text-[#c20000] mt-0.5 shrink-0">
                    <Crop className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                      Tarik & Potong Posisi Banner (Interactive Crop)
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Ala Google Form
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Buka jendela pemotong interaktif untuk menggeser kotak crop atau menarik sudutnya agar bagian gambar yang tampil pas di banner.
                    </p>
                  </div>
                </div>

                {headerImageVal ? (
                  <button
                    type="button"
                    onClick={() => setIsHeaderCropModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#c20000] hover:bg-[#a30000] text-white text-xs font-bold rounded-xl shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
                  >
                    <Crop className="w-3.5 h-3.5" />
                    <span>Tarik / Crop Banner Sekarang</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-400 italic">
                    Pilih gambar di atas terlebih dahulu untuk memotong
                  </span>
                )}
              </div>

              {/* Setting Ukuran Gambar Sesuai Template Sistem */}
              <div className="pt-3 border-t border-slate-200/80">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Format Tampilan Frame di Formulir Publik
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'banner', label: 'Banner Ramping (4:1)', desc: 'Standar Google Forms (1600×400 px)' },
                    { id: 'medium', label: 'Banner Sedang (21:9)', desc: 'Proporsi sedang sistem (1600×680 px)' },
                    { id: 'wide', label: 'Standar Lebar (16:9)', desc: 'Format landscape video (1600×900 px)' },
                    { id: 'natural', label: 'Proporsional Asli (Auto)', desc: 'Tinggi utuh tanpa terpotong' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSettingsHeaderImageSize(opt.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        settingsHeaderImageSize === opt.id
                          ? 'bg-red-50/80 border-[#c20000] ring-1 ring-[#c20000] text-[#c20000]'
                          : 'bg-white border-slate-200/90 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold flex items-center justify-between">
                        {opt.label}
                        {settingsHeaderImageSize === opt.id && <span className="w-1.5 h-1.5 rounded-full bg-[#c20000]"></span>}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 leading-tight">
                        {opt.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 2: Judul & Deskripsi */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Judul Formulir</label>
                <input
                  type="text"
                  required
                  value={settingsTitle}
                  onChange={(e) => setSettingsTitle(e.target.value)}
                  className={inputClass}
                  placeholder="Judul Formulir Pendaftaran"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Deskripsi Formulir</label>
                <textarea
                  rows={3}
                  value={settingsDescription}
                  onChange={(e) => setSettingsDescription(e.target.value)}
                  className={`${inputClass} resize-none`}
                  placeholder="Tuliskan petunjuk atau informasi tambahan untuk pengisi formulir..."
                />
              </div>
            </div>

            {/* Section: Kuota Pendaftar (Unlimited / Batasi Kuota) */}
            <div className="border border-slate-200/90 rounded-2xl p-5 bg-slate-50/60 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#c20000]" /> Kuota Pendaftar Formulir
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tentukan apakah kuota pengisi formulir tidak terbatas (unlimited) atau dibatasi pada jumlah tertentu.
                </p>
              </div>

              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3.5 bg-white border border-slate-200/80 rounded-xl cursor-pointer hover:border-slate-300 transition-colors shadow-2xs">
                  <input
                    type="radio"
                    name="quota_choice"
                    checked={settingsIsUnlimitedQuota}
                    onChange={() => {
                      setSettingsIsUnlimitedQuota(true);
                      setSettingsMaxResponses('');
                    }}
                    className="w-4 h-4 mt-0.5 accent-[#c20000] cursor-pointer"
                  />
                  <div>
                    <span className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      Tanpa Batas Kuota (Unlimited)
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Bebas Kuota
                      </span>
                    </span>
                    <span className="text-xs text-slate-500 leading-relaxed block mt-0.5">
                      Formulir dapat diisi bebas tanpa batas jumlah pengisi hingga Anda menutup formulir secara manual.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 bg-white border border-slate-200/80 rounded-xl cursor-pointer hover:border-slate-300 transition-colors shadow-2xs">
                  <input
                    type="radio"
                    name="quota_choice"
                    checked={!settingsIsUnlimitedQuota}
                    onChange={() => setSettingsIsUnlimitedQuota(false)}
                    className="w-4 h-4 mt-0.5 accent-[#c20000] cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-slate-800 block">
                      Batasi Jumlah Kuota Responden
                    </span>
                    <span className="text-xs text-slate-500 leading-relaxed block mt-0.5">
                      Formulir akan otomatis menolak pendaftar baru setelah batas jumlah pengisi terpenuhi.
                    </span>
                    {!settingsIsUnlimitedQuota && (
                      <div className="max-w-xs mt-3 pt-2 border-t border-slate-100">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Maksimal Responden (Jumlah Kuota):
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={settingsMaxResponses}
                          onChange={(e) => setSettingsMaxResponses(e.target.value)}
                          placeholder="Contoh: 100 atau 250"
                          className={inputClass}
                        />
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Section 3: Keamanan & Pengaturan Google Form */}
            <div className="border border-slate-200/90 rounded-2xl p-5 bg-slate-50/60 space-y-4">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Keamanan & Validasi Email Responden (Anti-Spam)
              </h3>

              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3.5 bg-white border border-slate-200/80 rounded-xl cursor-pointer hover:border-slate-300 transition-colors shadow-2xs">
                  <input
                    type="checkbox"
                    checked={settingsRequireEmail}
                    onChange={(e) => setSettingsRequireEmail(e.target.checked)}
                    className="w-4 h-4 mt-0.5 accent-[#c20000]"
                  />
                  <div>
                    <span className="text-sm font-semibold text-slate-800 block">
                      Wajibkan Pengisian Email (require_email)
                    </span>
                    <span className="text-xs text-slate-500 leading-relaxed block mt-0.5">
                      Menampilkan kartu input email di bagian atas formulir ala Google Form. Sistem memvalidasi sintaks email RFC dan memasang bot protection / honeypot anti-spam.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 bg-white border border-slate-200/80 rounded-xl cursor-pointer hover:border-slate-300 transition-colors shadow-2xs">
                  <input
                    type="checkbox"
                    checked={settingsLimitOneResponse}
                    disabled={!settingsRequireEmail}
                    onChange={(e) => setSettingsLimitOneResponse(e.target.checked)}
                    className="w-4 h-4 mt-0.5 accent-[#c20000] disabled:opacity-40"
                  />
                  <div>
                    <span className={`text-sm font-semibold block ${!settingsRequireEmail ? 'text-slate-400' : 'text-slate-800'}`}>
                      Batasi 1 Tanggapan per Email (limit_one_response)
                    </span>
                    <span className="text-xs text-slate-500 leading-relaxed block mt-0.5">
                      Mencegah pengisian ganda. Jika email yang sama sudah pernah mengirim tanggapan ke formulir ini, pengiriman kedua akan ditolak.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 bg-white border border-slate-200/80 rounded-xl cursor-pointer hover:border-slate-300 transition-colors shadow-2xs">
                  <input
                    type="checkbox"
                    checked={settingsIsOpen}
                    onChange={(e) => setSettingsIsOpen(e.target.checked)}
                    className="w-4 h-4 mt-0.5 accent-[#c20000]"
                  />
                  <div>
                    <span className="text-sm font-semibold text-slate-800 block">
                      Buka Pendaftaran (Terima Tanggapan)
                    </span>
                    <span className="text-xs text-slate-500 leading-relaxed block mt-0.5">
                      Aktifkan untuk membuka formulir ke publik. Nonaktifkan jika masa pendaftaran sudah ditutup atau formulir masih berupa draf.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <Button
                type="submit"
                disabled={isSavingSettings}
                className="bg-[#c20000] hover:bg-[#a30000] text-white px-5 rounded-xl h-10 font-bold shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {isSavingSettings ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> Menyimpan...
                  </>
                ) : (
                  'Simpan Pengaturan Formulir'
                )}
              </Button>
            </div>
          </form>
        </div>
      )}

      {selectedResponse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto" onClick={() => setSelectedResponse(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 sm:p-7 my-8 max-h-[90vh] overflow-y-auto border border-slate-200/90" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between border-b border-slate-200 pb-4 mb-5">
              <div>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold uppercase">
                  Data Responden #{selectedResponse.id}
                </span>
                <h3 className="text-lg font-bold text-[#0f172a] mt-2">
                  Rincian Jawaban Formulir
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Disubmit pada: {new Date(selectedResponse.created_at).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'medium' })}
                </p>
              </div>
              <button onClick={() => setSelectedResponse(null)} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedResponse.email && (
              <div className="mb-4 p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-semibold text-emerald-950">Email Terverifikasi Responden:</span>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-900 bg-white px-2.5 py-1 rounded-lg border border-emerald-300">
                  {selectedResponse.email}
                </span>
              </div>
            )}

            <div className="space-y-4">
              {answerFields.map((f: any, idx: number) => {
                const val = selectedResponse.data?.[f.id] ?? selectedResponse.data?.[String(f.id)];
                const isFile = f.type === 'file' || (typeof val === 'string' && val.startsWith('/storage/'));

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
                          <span key={i} className="px-2.5 py-0.5 bg-white border border-slate-200 rounded-md text-xs text-slate-800">
                            {item}
                          </span>
                        ))}
                      </div>
                    ) : val != null && val !== '' ? (
                      <p className="text-xs text-slate-800 font-medium whitespace-pre-wrap mt-0.5">{String(val)}</p>
                    ) : (
                      <p className="text-xs text-slate-400 italic">Tidak diisi / kosong</p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteResponse(selectedResponse.id)}
                className="text-red-600 border-red-200 hover:bg-red-50 text-xs rounded-xl h-9"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Hapus Data Ini
              </Button>
              <Button size="sm" onClick={() => setSelectedResponse(null)} className="bg-slate-800 hover:bg-slate-900 text-white text-xs px-4 rounded-xl h-9">
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto" onClick={() => setIsPreviewOpen(false)}>
          <div className="bg-[#f8f9fa] rounded-2xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto border border-slate-200/90" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-800">Pratinjau Formulir</h2>
              <button onClick={() => setIsPreviewOpen(false)} className="text-xs font-semibold px-2.5 py-1 rounded-lg text-slate-500 hover:text-[#c20000] hover:bg-red-50 transition-colors">Tutup ✕</button>
            </div>
            <FormFillClient
              form={{
                ...(form || {}),
                title: settingsTitle || form?.title,
                description: settingsDescription || form?.description,
                header_image: headerImageVal instanceof File
                  ? URL.createObjectURL(headerImageVal)
                  : typeof headerImageVal === 'string'
                  ? headerImageVal
                  : form?.header_image,
                header_image_size: settingsHeaderImageSize,
                slug: form?.slug || 'pratinjau',
                fields,
                is_open: true,
              }}
              preview
            />
            <p className="text-center text-[11px] text-slate-400 mt-4">Mode pratinjau — isian tidak tersimpan.</p>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={() => setIsModalOpen(false)}>
          <form onSubmit={handleSaveField} className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-7 border border-slate-200/90" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900">{editing ? 'Edit Kolom Pertanyaan' : 'Tambah Kolom Pertanyaan'}</h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Pertanyaan / Label</label>
                <input type="text" required value={fieldForm.label} onChange={(e) => setFieldForm({ ...fieldForm, label: e.target.value })}
                  placeholder="Contoh: Nama Lengkap" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Deskripsi / Bantuan <span className="text-slate-400 font-normal">(opsional)</span></label>
                <input type="text" value={fieldForm.description} onChange={(e) => setFieldForm({ ...fieldForm, description: e.target.value })}
                  placeholder="Contoh: Isi sesuai kartu identitas / KTP" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tipe Kolom</label>
                <select value={fieldForm.type} onChange={(e) => setFieldForm({ ...fieldForm, type: e.target.value, optionsText: '' })} className={inputClass}>
                  {FIELD_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
                </select>
              </div>
              {['select', 'radio', 'checkbox'].includes(fieldForm.type) && (() => {
                const lines = fieldForm.optionsText.split('\n').map((o) => o.trim()).filter(Boolean);
                const seen = new Set<string>();
                const dups = new Set<string>();
                for (const l of lines) {
                  const lower = l.toLowerCase();
                  if (seen.has(lower)) dups.add(l);
                  else seen.add(lower);
                }
                const hasDups = dups.size > 0;
                return (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-sm font-semibold text-slate-700">
                        Opsi Pilihan <span className="text-slate-400 font-normal">(satu per baris)</span>
                      </label>
                      <span className={`text-[11px] font-medium ${hasDups ? 'text-red-600 font-bold' : 'text-slate-500'}`}>
                        {lines.length} opsi {hasDups && '(duplikat terdeteksi)'}
                      </span>
                    </div>
                    <textarea
                      value={fieldForm.optionsText}
                      onChange={(e) => setFieldForm({ ...fieldForm, optionsText: e.target.value })}
                      rows={4}
                      placeholder={'UMS\nUMPKU\nUNISA'}
                      className={`${inputClass} resize-none font-mono ${hasDups ? 'border-red-400 focus:border-red-500' : ''}`}
                    />
                    {hasDups ? (
                      <p className="text-[11px] text-red-600 font-semibold mt-1">
                        ⚠️ Ditemukan opsi duplikat: &quot;{Array.from(dups).join('", "')}&quot;. Setiap opsi harus unik.
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-400 mt-1">
                        Tulis setiap pilihan pada baris baru. Setiap opsi harus unik.
                      </p>
                    )}
                  </div>
                );
              })()}
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
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Jenis File yang Diizinkan</label>
                  <div className="space-y-2">
                    {Object.entries(FILE_PRESETS).map(([key, preset]) => {
                      const current = fieldForm.optionsText.split('\n').map((o) => o.trim()).filter(Boolean);
                      const selected = current.length > 0 && preset.exts.every((e) => current.includes(e));
                      return (
                        <label key={key} className={`flex items-center gap-2.5 p-3 border rounded-xl cursor-pointer text-sm transition-all ${selected ? 'border-[#c20000] bg-red-50/50 shadow-2xs' : 'border-slate-200 hover:bg-slate-50'}`}>
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
                <label className="flex items-center gap-2.5 text-sm text-slate-700 font-medium cursor-pointer pt-1">
                  <input type="checkbox" checked={fieldForm.required} onChange={(e) => setFieldForm({ ...fieldForm, required: e.target.checked })} className="w-4 h-4 rounded accent-[#c20000]" />
                  <span>Wajib diisi oleh responden</span>
                </label>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl h-10 px-4 text-xs font-semibold">Batal</Button>
              <Button type="submit" disabled={isSaving} className="bg-[#c20000] hover:bg-[#a30000] text-white rounded-xl h-10 px-5 text-xs font-bold shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]">
                {isSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Simpan
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Crop Banner Khusus Header Formulir */}
      <ImageCropperModal
        isOpen={isHeaderCropModalOpen}
        imageUrl={getHeaderCropUrl()}
        onClose={() => setIsHeaderCropModalOpen(false)}
        onCropComplete={(croppedFile) => {
          setHeaderImageVal(croppedFile);
        }}
        initialAspectRatio={
          settingsHeaderImageSize === 'medium' ? 21 / 9 :
          settingsHeaderImageSize === 'wide' ? 16 / 9 :
          settingsHeaderImageSize === 'natural' ? null :
          4 / 1
        }
        title="Tarik & Sesuaikan Potongan Banner Header (Crop)"
      />
    </div>
  );
}
