'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2, Pencil, Play, Pause, Loader2, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useConfirm } from '@/components/providers/ConfirmProvider';
import { PresensiSesi } from '@/types';

interface Props {
  presensiId: number;
  sesis: PresensiSesi[];
  activeSesiId: number | null;
  onSelect: (id: number | null) => void;
  onChanged: () => void;
}

const inputCls =
  'w-full bg-white border border-slate-200 rounded-sm px-3.5 py-2.5 text-sm text-slate-700 focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] outline-none shadow-sm transition-all';

function toLocalInput(value: string | null): string {
  return value ? value.slice(0, 16) : '';
}

export function PresensiSesiPanel({ presensiId, sesis, activeSesiId, onSelect, onChanged }: Props) {
  const { confirm } = useConfirm();
  const [name, setName] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [editing, setEditing] = useState<PresensiSesi | null>(null);
  const [editName, setEditName] = useState('');
  const [editStarts, setEditStarts] = useState('');
  const [editEnds, setEditEnds] = useState('');
  const [busy, setBusy] = useState(false);
  const [toggling, setToggling] = useState<number | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    try {
      const res = await api.post(`/presensi/${presensiId}/sesi`, {
        name: name.trim(),
        starts_at: startsAt || null,
        ends_at: endsAt || null,
        is_open: true,
      });
      toast.success(`Sesi "${res.data.data.name}" ditambahkan`);
      setName('');
      setStartsAt('');
      setEndsAt('');
      onChanged();
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Gagal menambah sesi');
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (s: PresensiSesi) => {
    setEditing(s);
    setEditName(s.name);
    setEditStarts(toLocalInput(s.starts_at));
    setEditEnds(toLocalInput(s.ends_at));
  };

  const handleSaveEdit = async () => {
    if (!editing || !editName.trim()) return;
    setBusy(true);
    try {
      await api.put(`/presensi-sesi/${editing.id}`, {
        name: editName.trim(),
        starts_at: editStarts || null,
        ends_at: editEnds || null,
      });
      toast.success('Sesi diperbarui');
      setEditing(null);
      onChanged();
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Gagal memperbarui sesi');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (s: PresensiSesi) => {
    if (sesis.length <= 1) {
      toast.error('Kegiatan harus punya minimal satu sesi');
      return;
    }
    if (await confirm({ message: `Hapus sesi "${s.name}" beserta catatan kehadirannya?`, tone: 'danger' })) {
      try {
        await api.delete(`/presensi-sesi/${s.id}`);
        toast.success('Sesi dihapus');
        if (activeSesiId === s.id) onSelect(null);
        onChanged();
      } catch (error) {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(err.response?.data?.message || 'Gagal menghapus sesi');
      }
    }
  };

  const handleToggle = async (s: PresensiSesi) => {
    setToggling(s.id);
    try {
      await api.put(`/presensi-sesi/${s.id}/toggle-open`, { is_open: !s.is_open });
      toast.success(s.is_open ? `Sesi "${s.name}" ditutup` : `Sesi "${s.name}" dibuka`);
      onChanged();
    } catch {
      toast.error('Gagal mengubah status sesi');
    } finally {
      setToggling(null);
    }
  };

  return (
    <Card className="border-slate-200/90 rounded-2xl shadow-2xs">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Layers className="w-4 h-4" /> Sesi Kegiatan
        </CardTitle>
        <p className="text-sm text-slate-500 mt-1">
          Satu data kegiatan bisa punya banyak sesi (mis. Sesi 1, Sesi 2). Peserta & QR-nya sama — tidak perlu input ulang.
          Pilih sesi aktif di bawah untuk memfilter peserta, QR, scan, kehadiran, dan ekspor.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Daftar sesi */}
        <div className="space-y-2">
          {sesis.length === 0 && <p className="text-sm text-slate-400">Belum ada sesi.</p>}
          {sesis.map((s) => (
            <div
              key={s.id}
              className={`flex items-center gap-3 border rounded-xl px-3.5 py-2.5 transition-colors ${
                activeSesiId === s.id ? 'border-[#c20000] bg-red-50/50' : 'border-slate-200 bg-white'
              }`}
            >
              <button
                onClick={() => onSelect(activeSesiId === s.id ? null : s.id)}
                className="flex-1 text-left min-w-0"
                title="Pilih sebagai sesi aktif"
              >
                <div className="text-sm font-semibold text-slate-800 truncate">{s.name}</div>
                <div className="text-xs text-slate-400">
                  {s.starts_at ? new Date(s.starts_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : 'Tanpa jadwal'}
                  {typeof s.hadir_count === 'number' && ` · ${s.hadir_count} hadir`}
                </div>
              </button>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${
                  s.is_open ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}
              >
                {s.is_open ? 'Buka' : 'Tutup'}
              </span>
              <Button
                onClick={() => handleToggle(s)}
                disabled={toggling === s.id}
                variant="outline"
                className="h-8 px-2.5 rounded-lg text-[11px] font-bold"
                title={s.is_open ? 'Tutup sesi' : 'Buka sesi'}
              >
                {toggling === s.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : s.is_open ? (
                  <Pause className="w-3.5 h-3.5" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
              </Button>
              <button onClick={() => startEdit(s)} title="Ubah sesi" className="h-8 w-8 inline-flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(s)} title="Hapus sesi" className="h-8 w-8 inline-flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Form tambah sesi */}
        <form onSubmit={handleAdd} className="border border-dashed border-slate-300 rounded-xl p-3.5 space-y-3">
          <div className="text-sm font-bold text-slate-800">Tambah Sesi Baru</div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Nama sesi</label>
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="cth. Sesi 2 — Materi" maxLength={255} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Mulai (opsional)</label>
              <input type="datetime-local" className={inputCls} value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Selesai (opsional)</label>
              <input type="datetime-local" className={inputCls} value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
            </div>
          </div>
          <Button type="submit" disabled={busy || !name.trim()} className="h-9 px-4 bg-[#c20000] hover:bg-[#a30000] text-white rounded-lg text-xs font-bold">
            {busy ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Plus className="w-4 h-4 mr-1.5" />} Tambah Sesi
          </Button>
        </form>

        {/* Edit inline */}
        {editing && (
          <div className="border border-amber-200 bg-amber-50/60 rounded-xl p-3.5 space-y-3">
            <div className="text-sm font-bold text-slate-800">Ubah: {editing.name}</div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Nama sesi</label>
              <input className={inputCls} value={editName} onChange={(e) => setEditName(e.target.value)} maxLength={255} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Mulai</label>
                <input type="datetime-local" className={inputCls} value={editStarts} onChange={(e) => setEditStarts(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Selesai</label>
                <input type="datetime-local" className={inputCls} value={editEnds} onChange={(e) => setEditEnds(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveEdit} disabled={busy || !editName.trim()} className="h-9 px-4 bg-[#c20000] hover:bg-[#a30000] text-white rounded-lg text-xs font-bold">
                {busy ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : null} Simpan
              </Button>
              <Button onClick={() => setEditing(null)} variant="outline" className="h-9 px-4 rounded-lg text-xs font-bold">
                Batal
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
