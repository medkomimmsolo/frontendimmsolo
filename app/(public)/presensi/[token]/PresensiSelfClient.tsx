'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDebounce } from 'use-debounce';
import { getApiBase } from '@/lib/settings';
import { getDeviceFingerprint } from '@/lib/deviceFingerprint';
import { Button } from '@/components/ui/Button';
import { Loader2, Search, CheckCircle2, UserCheck, MapPin, CalendarDays, AlertCircle, ShieldCheck, QrCode, Clock, RefreshCw } from 'lucide-react';

interface SesiItem {
  id: number;
  name: string;
  starts_at: string | null;
  ends_at: string | null;
  is_open: boolean;
  is_receiving: boolean;
}

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
  sesis?: SesiItem[];
  active_sesi_id?: number | null;
  active_sesi_name?: string | null;
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
  const sesiParam = searchParams.get('sesi');
  const sesiId = sesiParam ? Number(sesiParam) : null;

  const [session, setSession] = useState<Session | null>(null);
  const [loadError, setLoadError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [phase, setPhase] = useState<Phase>('validating-qr');
  const [qrError, setQrError] = useState('');
  const [ticket, setTicket] = useState('');
  const [ticketSecondsLeft, setTicketSecondsLeft] = useState<number | null>(null);

  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 400);
  const [results, setResults] = useState<PesertaItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [selected, setSelected] = useState<PesertaItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState<{ nama: string; status: string; already: boolean } | null>(null);
  const [submitError, setSubmitError] = useState('');
  const [needsRescan, setNeedsRescan] = useState(false);

  // Countdown masa aktif tiket (5 menit)
  useEffect(() => {
    if (phase !== 'ready' || ticketSecondsLeft === null) return;
    if (ticketSecondsLeft <= 0) {
      setQrError('Waktu sesi presensi Anda telah habis (5 menit). Silakan pindai ulang QR di layar kegiatan.');
      setPhase('qr-invalid');
      setNeedsRescan(true);
      return;
    }
    const timer = setInterval(() => {
      setTicketSecondsLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, ticketSecondsLeft]);

  // 1. Muat info sesi (bawa sesi_id dari QR bila ada).
  useEffect(() => {
    (async () => {
      try {
        const query = sesiId ? `?sesi_id=${sesiId}` : '';
        const res = await fetch(`${base}/presensi-public/${token}${query}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.message);
        setSession(json.data);
      } catch (e) {
        setLoadError((e as Error).message || 'Sesi tidak ditemukan');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [base, token, sesiId]);

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
          body: JSON.stringify({ payload: qrPayload, sesi_id: sesiId ?? undefined }),
        });
        const json = await res.json();
        if (!json.success) {
          setQrError(json.message || 'QR tidak valid.');
          setPhase('qr-invalid');
          return;
        }
        setTicket(json.data.ticket);
        setTicketSecondsLeft(json.data.expires_in || 300);
        setPhase('ready');
      } catch {
        setQrError('Gagal memverifikasi QR.');
        setPhase('qr-invalid');
      }
    })();
  }, [base, token, qrPayload, isLoading, session, sesiId]);

  // 3. Pencarian nama (butuh ticket).
  useEffect(() => {
    if (phase !== 'ready' || debouncedQuery.trim().length < 2) {
      setResults([]);
      return;
    }
    (async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`${base}/presensi-public/${token}/cari?q=${encodeURIComponent(debouncedQuery)}&ticket=${encodeURIComponent(ticket)}${sesiId ? `&sesi_id=${sesiId}` : ''}`);
        const json = await res.json();
        setResults(json.data || []);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    })();
  }, [debouncedQuery, base, token, ticket, phase, sesiId]);

  const handleCheckIn = async () => {
    if (!selected) return;
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch(`${base}/presensi-public/${token}/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          peserta_id: selected.id,
          ticket,
          device: getDeviceFingerprint(),
          sesi_id: sesiId ?? undefined,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        setSubmitError(json.message || 'Gagal mencatat kehadiran');
        // Pesan terkait ticket/QR kadaluwarsa → perlu pindai ulang.
        if (res.status === 403 || /kedaluwarsa|pindai ulang/i.test(json.message || '')) {
          setNeedsRescan(true);
        }
        return;
      }
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([100, 50, 100]);
        } catch {
          /* ignore */
        }
      }
      setDone({ nama: json.data.peserta.nama, status: json.data.status, already: json.data.already });
    } catch {
      setSubmitError('Terjadi kesalahan jaringan. Periksa koneksi Anda lalu coba lagi.');
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
          <p className="text-sm text-slate-500 mb-4">{qrError}</p>
          <p className="text-xs text-slate-400 mb-6">Pindai ulang QR terbaru yang ditampilkan di layar kegiatan.</p>
          <Button
            onClick={() => {
              const url = new URL(window.location.href);
              url.searchParams.delete('qr');
              window.location.href = url.toString();
            }}
            className="h-10 px-5 bg-[#c20000] hover:bg-[#a30000] text-white rounded-xl text-xs font-bold"
          >
            <RefreshCw className="w-4 h-4 mr-1.5" /> Pindai Ulang QR
          </Button>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-md text-center animate-in zoom-in-95 duration-200">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-800 mb-1">
            {done.already ? 'Anda Sudah Tercatat' : 'Kehadiran Tercatat!'}
          </h1>
          <p className="text-base font-semibold text-slate-700 mt-1">{done.nama}</p>
          {session.active_sesi_name && (
            <p className="text-xs text-slate-500 mt-0.5">Sesi: <strong>{session.active_sesi_name}</strong></p>
          )}
          <div className={`inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold mt-4 ${done.status === 'telat' ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
            {done.status === 'telat' ? 'Status: Telat' : 'Status: Hadir Tepat Waktu'}
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
          {session.active_sesi_name && (
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#c20000] text-white text-xs font-bold mb-2">
              {session.active_sesi_name}
            </div>
          )}
          <div className="space-y-1 text-sm text-white/70">
            {session.location && <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-white/50" /> {session.location}</div>}
            {session.starts_at && (
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-white/50" />
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

        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-3.5 py-2 text-xs flex items-center gap-2 flex-1 min-w-0">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="truncate">Anti-Titip: 1 HP = 1 Peserta</span>
          </div>

          {ticketSecondsLeft !== null && (
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border shrink-0 transition-colors ${
                ticketSecondsLeft <= 45
                  ? 'bg-amber-50 text-amber-700 border-amber-300 animate-pulse'
                  : 'bg-white text-slate-700 border-slate-200 shadow-2xs'
              }`}
              title="Sisa waktu sebelum tiket kedaluwarsa"
            >
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Tiket: {Math.floor(ticketSecondsLeft / 60)}:{String(ticketSecondsLeft % 60).padStart(2, '0')}
              </span>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <label htmlFor="self-search-input" className="block text-sm font-bold text-slate-900 mb-2">
            Cari Nama Anda
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="self-search-input"
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelected(null); setSubmitError(''); setNeedsRescan(false); }}
              placeholder="Ketik minimal 2 huruf nama Anda..."
              className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-3 py-3 text-sm text-slate-700 focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] outline-none"
            />
          </div>

          {isSearching && <div className="text-center py-4"><Loader2 className="w-5 h-5 animate-spin text-[#c20000] mx-auto" /></div>}

          {!isSearching && results.length > 0 && (
            <div aria-live="polite" className="mt-3 space-y-2 max-h-72 overflow-y-auto">
              {results.map((r) => {
                const hadir = r.kehadiran && ['hadir', 'telat'].includes(r.kehadiran.status);
                return (
                  <button
                    key={r.id}
                    type="button"
                    disabled={!!hadir || !session.is_receiving}
                    onClick={() => { setSelected(r); setSubmitError(''); setNeedsRescan(false); }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all ${
                      selected?.id === r.id ? 'border-[#c20000] bg-red-50/60 shadow-2xs' : 'border-slate-200 hover:border-slate-300'
                    } ${hadir ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <span className="min-w-0 pr-2">
                      <span className="block text-sm font-semibold text-slate-800 truncate">{r.nama}</span>
                      <span className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {r.asal && <span className="text-xs text-slate-500 font-medium">{r.asal}</span>}
                        {r.kode && (
                          <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-600">
                            #{r.kode}
                          </span>
                        )}
                      </span>
                    </span>
                    {hadir ? (
                      <span className="text-xs font-bold text-emerald-600 shrink-0">Sudah hadir</span>
                    ) : (
                      <span className={`w-5 h-5 rounded-full border-2 shrink-0 transition-colors ${selected?.id === r.id ? 'border-[#c20000] bg-[#c20000]' : 'border-slate-300'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {!isSearching && debouncedQuery.trim().length >= 2 && results.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">Nama tidak ditemukan. Pastikan Anda sudah terdaftar atau hubungi petugas.</p>
          )}

          {submitError && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-start gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p>{submitError}</p>
                {needsRescan && (
                  <button
                    type="button"
                    onClick={() => {
                      const url = new URL(window.location.href);
                      url.searchParams.delete('qr');
                      window.location.href = url.toString();
                    }}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#c20000] hover:bg-[#a30000] text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    <QrCode className="w-4 h-4" /> Pindai Ulang QR
                  </button>
                )}
              </div>
            </div>
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
