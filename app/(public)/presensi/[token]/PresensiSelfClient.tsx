'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDebounce } from 'use-debounce';
import { getApiBase } from '@/lib/settings';
import { getDeviceFingerprint } from '@/lib/deviceFingerprint';
import { Button } from '@/components/ui/Button';
import { Loader2, Search, CheckCircle2, UserCheck, MapPin, CalendarDays, AlertCircle, ShieldCheck } from 'lucide-react';

interface Session {
  id: number;
  title: string;
  slug: string;
  location: string | null;
  starts_at: string | null;
  ends_at: string | null;
  is_receiving: boolean;
  is_open: boolean;
  total_peserta: number;
}

interface PesertaItem {
  id: number;
  kode: string | null;
  nama: string;
  asal: string | null;
  kehadiran: { status: string } | null;
}

interface Props {
  token: string;
}

type Phase = 'validating-qr' | 'ready' | 'qr-invalid';

export function PresensiSelfClient({ token }: Props) {
  const base = getApiBase();
  const searchParams = useSearchParams();
  const qrPayload = searchParams.get('qr');

  const [session, setSession] = useState<Session | null>(null);
  const [loadError, setLoadError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [phase, setPhase] = useState<Phase>('validating-qr');
  const [qrError, setQrError] = useState('');
  const [ticket, setTicket] = useState('');

  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 400);
  const [results, setResults] = useState<PesertaItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [selected, setSelected] = useState<PesertaItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState<{ nama: string; status: string; already: boolean } | null>(null);

  // 1. Muat info sesi.
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${base}/presensi-public/${token}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.message);
        setSession(json.data);
      } catch (e) {
        setLoadError((e as Error).message || 'Sesi tidak ditemukan');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [base, token]);

  // 2. Tukar payload QR → ticket. Wajib ada payload yang valid.
  useEffect(() => {
    if (isLoading || !session) return;
    if (!qrPayload) {
      setQrError('Anda membuka halaman ini tanpa memindai QR. Silakan pindai QR yang ditampilkan petugas.');
      setPhase('qr-invalid');
      return;
    }
    (async () => {
      try {
        const res = await fetch(`${base}/presensi-public/${token}/exchange-qr`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ payload: qrPayload }),
        });
        const json = await res.json();
        if (!json.success) {
          setQrError(json.message || 'QR tidak valid.');
          setPhase('qr-invalid');
          return;
        }
        setTicket(json.data.ticket);
        setPhase('ready');
      } catch {
        setQrError('Gagal memverifikasi QR.');
        setPhase('qr-invalid');
      }
    })();
  }, [base, token, qrPayload, isLoading, session]);

  // 3. Pencarian nama (butuh ticket).
  useEffect(() => {
    if (phase !== 'ready' || debouncedQuery.trim().length < 2) {
      setResults([]);
      return;
    }
    (async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`${base}/presensi-public/${token}/cari?q=${encodeURIComponent(debouncedQuery)}&ticket=${encodeURIComponent(ticket)}`);
        const json = await res.json();
        setResults(json.data || []);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    })();
  }, [debouncedQuery, base, token, ticket, phase]);

  const handleCheckIn = async () => {
    if (!selected) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${base}/presensi-public/${token}/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          peserta_id: selected.id,
          ticket,
          device: getDeviceFingerprint(),
        }),
      });
      const json = await res.json();
      if (!json.success) {
        alert(json.message || 'Gagal mencatat kehadiran');
        return;
      }
      setDone({ nama: json.data.peserta.nama, status: json.data.status, already: json.data.already });
    } catch {
      alert('Terjadi kesalahan jaringan');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#c20000]" />
      </div>
    );
  }

  if (loadError || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h1 className="text-lg font-bold text-slate-800 mb-1">Sesi Tidak Ditemukan</h1>
          <p className="text-sm text-slate-500">{loadError || 'QR mungkin tidak valid atau sudah kedaluwarsa.'}</p>
        </div>
      </div>
    );
  }

  // QR tidak valid / kedaluwarsa
  if (phase === 'qr-invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-md text-center">
          <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-lg font-bold text-slate-800 mb-1">QR Kedaluwarsa</h1>
          <p className="text-sm text-slate-500">{qrError}</p>
          <p className="text-xs text-slate-400 mt-4">Pindai ulang QR terbaru yang ditampilkan di layar kegiatan.</p>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-md text-center">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-800 mb-1">
            {done.already ? 'Anda Sudah Tercatat' : 'Kehadiran Tercatat!'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{done.nama}</p>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold mt-4 ${done.status === 'telat' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
            {done.status === 'telat' ? 'Telat' : 'Hadir'}
          </div>
          <p className="text-xs text-slate-400 mt-6">Terima kasih telah melakukan presensi. Anda boleh menutup halaman ini.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-[#0f172a] rounded-2xl p-6 text-white mb-4">
          <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/10 text-xs font-medium mb-3">
            <UserCheck className="w-3.5 h-3.5 mr-1.5 text-[#c20000]" /> Presensi Kegiatan
          </div>
          <h1 className="text-xl font-bold mb-2">{session.title}</h1>
          <div className="space-y-1 text-sm text-white/70">
            {session.location && <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {session.location}</div>}
            {session.starts_at && (
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                {new Date(session.starts_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
              </div>
            )}
          </div>
        </div>

        {!session.is_receiving && (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-4 py-3 text-sm mb-4 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>Presensi sedang ditutup. Silakan hubungi petugas untuk mencatat kehadiran.</span>
          </div>
        )}

        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-2.5 text-xs mb-4 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>QR terverifikasi. Satu perangkat hanya dapat presensi untuk satu peserta.</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <label className="block text-sm font-bold text-slate-900 mb-2">Cari Nama Anda</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelected(null); }}
              placeholder="Ketik minimal 2 huruf nama Anda..."
              className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-3 py-3 text-sm text-slate-700 focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] outline-none"
            />
          </div>

          {isSearching && <div className="text-center py-4"><Loader2 className="w-5 h-5 animate-spin text-[#c20000] mx-auto" /></div>}

          {!isSearching && results.length > 0 && (
            <div className="mt-3 space-y-2 max-h-72 overflow-y-auto">
              {results.map((r) => {
                const hadir = r.kehadiran && ['hadir', 'telat'].includes(r.kehadiran.status);
                return (
                  <button
                    key={r.id}
                    disabled={!!hadir || !session.is_receiving}
                    onClick={() => setSelected(r)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-colors ${
                      selected?.id === r.id ? 'border-[#c20000] bg-red-50/60' : 'border-slate-200 hover:border-slate-300'
                    } ${hadir ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <span>
                      <span className="block text-sm font-semibold text-slate-800">{r.nama}</span>
                      {r.asal && <span className="block text-xs text-slate-500">{r.asal}</span>}
                    </span>
                    {hadir ? (
                      <span className="text-xs font-bold text-emerald-600 shrink-0">Sudah hadir</span>
                    ) : (
                      <span className={`w-5 h-5 rounded-full border-2 shrink-0 ${selected?.id === r.id ? 'border-[#c20000] bg-[#c20000]' : 'border-slate-300'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {!isSearching && debouncedQuery.trim().length >= 2 && results.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">Nama tidak ditemukan. Pastikan Anda sudah terdaftar atau hubungi petugas.</p>
          )}

          <Button
            onClick={handleCheckIn}
            disabled={!selected || isSubmitting || !session.is_receiving}
            className="w-full h-12 mt-5 bg-[#c20000] hover:bg-[#a30000] text-white rounded-xl font-bold disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
            Konfirmasi Kehadiran
          </Button>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">PC IMM Kota Surakarta — Sistem Presensi Digital</p>
      </div>
    </div>
  );
}
