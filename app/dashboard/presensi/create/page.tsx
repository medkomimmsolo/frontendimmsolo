'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Event } from '@/types';
import { PresensiFormFieldBuilder } from '@/components/presensi/PresensiFormFieldBuilder';
import { DEFAULT_PRESENSI_FORM_FIELDS } from '@/lib/presensi';

const inputCls =
  'w-full bg-white border border-slate-200 rounded-sm px-3.5 py-2.5 text-sm text-slate-700 focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] outline-none shadow-sm transition-all';

export default function PresensiCreatePage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);

  const [form, setForm] = useState({
    title: '',
    location: '',
    description: '',
    starts_at: '',
    ends_at: '',
    mode: 'self' as 'self' | 'scan',
    event_id: '' as string | number,
    late_after_minutes: '' as string | number,
    allow_manual_add: true,
    enforce_device_limit: true,
    is_open: false,
    form_fields: DEFAULT_PRESENSI_FORM_FIELDS,
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get('/events', { params: { per_page: 100 } });
        const payload = res.data.data;
        setEvents(payload?.data || (Array.isArray(payload) ? payload : []));
      } catch {
        /* opsional */
      }
    };
    fetchEvents();
  }, []);

  const set = (key: string, value: unknown) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Judul sesi wajib diisi');
      return;
    }
    setIsSaving(true);
    try {
      const payload: Record<string, unknown> = {
        title: form.title,
        location: form.location || null,
        description: form.description || null,
        starts_at: form.starts_at || null,
        ends_at: form.ends_at || null,
        mode: form.mode,
        event_id: form.event_id ? Number(form.event_id) : null,
        late_after_minutes: form.late_after_minutes === '' ? null : Number(form.late_after_minutes),
        allow_manual_add: form.allow_manual_add,
        enforce_device_limit: form.enforce_device_limit,
        is_open: form.is_open,
        form_fields: form.mode === 'self' ? form.form_fields : undefined,
      };
      const res = await api.post('/presensi', payload);
      toast.success('Sesi presensi berhasil dibuat');
      router.push(`/dashboard/presensi/${res.data.data.id}`);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Gagal menyimpan sesi presensi');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      <PageHeader title="Buat Sesi Presensi" description="Atur detail sesi, jadwal, dan mode pengambilan presensi" badge="Presensi">
        <Link href="/dashboard/presensi">
          <Button variant="outline" className="h-10 px-4 rounded-xl text-xs font-bold">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Kembali
          </Button>
        </Link>
      </PageHeader>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200/90 rounded-2xl shadow-2xs">
            <CardHeader><CardTitle className="text-base">Informasi Sesi</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-1.5">Judul Sesi *</label>
                <input className={inputCls} value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Contoh: Presensi Rapat Kerja Cabang" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-1.5">Lokasi</label>
                <input className={inputCls} value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="Aula / Gedung / Online" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-1.5">Deskripsi</label>
                <textarea className={`${inputCls} min-h-[100px]`} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Keterangan tambahan (opsional)" />
              </div>
            </CardContent>
          </Card>

          {form.mode === 'self' && (
            <Card className="border-slate-200/90 rounded-2xl shadow-2xs">
              <CardContent className="pt-6">
                <PresensiFormFieldBuilder
                  fields={form.form_fields}
                  onChange={(form_fields) => set('form_fields', form_fields)}
                />
              </CardContent>
            </Card>
          )}

          <Card className="border-slate-200/90 rounded-2xl shadow-2xs">
            <CardHeader><CardTitle className="text-base">Jadwal & Status</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-1.5">Mulai</label>
                <input type="datetime-local" className={inputCls} value={form.starts_at} onChange={(e) => set('starts_at', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-1.5">Selesai</label>
                <input type="datetime-local" className={inputCls} value={form.ends_at} onChange={(e) => set('ends_at', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-1.5">Toleransi Telat (menit)</label>
                <input type="number" min={0} className={inputCls} value={form.late_after_minutes} onChange={(e) => set('late_after_minutes', e.target.value)} placeholder="Kosongkan = tanpa telat" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-1.5">Kaitkan ke Agenda (opsional)</label>
                <select className={inputCls} value={form.event_id} onChange={(e) => set('event_id', e.target.value)}>
                  <option value="">— Tidak dikaitkan —</option>
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>{ev.title}</option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#c20000] focus:ring-[#c20000]" checked={form.allow_manual_add} onChange={(e) => set('allow_manual_add', e.target.checked)} />
                <span className="text-sm text-slate-700">Izinkan tambah peserta manual</span>
              </label>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-slate-200/90 rounded-2xl shadow-2xs">
            <CardHeader><CardTitle className="text-base">Mode Presensi</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {([
                ['self', 'Form Presensi', 'Peserta scan QR/link lalu mengisi form kehadiran'],
                ['scan', 'Scan Peserta', 'Petugas memindai QR masing-masing peserta'],
              ] as const).map(([val, label, desc]) => (
                <label key={val} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${form.mode === val ? 'border-[#c20000] bg-red-50/50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <input type="radio" name="mode" className="mt-1 w-4 h-4 text-[#c20000] focus:ring-[#c20000]" checked={form.mode === val} onChange={() => set('mode', val)} />
                  <span>
                    <span className="block text-sm font-semibold text-slate-800">{label}</span>
                    <span className="block text-xs text-slate-500 mt-0.5">{desc}</span>
                  </span>
                </label>
              ))}
            </CardContent>
          </Card>

          <Card className="border-slate-200/90 rounded-2xl shadow-2xs">
            <CardContent className="pt-6 space-y-4">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#c20000] focus:ring-[#c20000]" checked={form.enforce_device_limit} onChange={(e) => set('enforce_device_limit', e.target.checked)} />
                <span className="text-sm text-slate-700">Batasi 1 perangkat = 1 peserta (anti titip absen)</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#c20000] focus:ring-[#c20000]" checked={form.is_open} onChange={(e) => set('is_open', e.target.checked)} />
                <span className="text-sm text-slate-700">Buka presensi sekarang</span>
              </label>
              <Button type="submit" disabled={isSaving} className="w-full h-11 bg-[#c20000] hover:bg-[#a30000] text-white rounded-xl font-bold">
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Simpan Sesi
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
