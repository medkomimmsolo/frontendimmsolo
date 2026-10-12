'use client';

import { use, useEffect, useRef, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Html5Qrcode } from 'html5-qrcode';
import api from '@/lib/api';
import { getDeviceFingerprint } from '@/lib/deviceFingerprint';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Camera, CameraOff, CheckCircle2, XCircle, Loader2, ArrowLeft,
  Layers, UserCheck, Clock, MapPin,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Presensi, PresensiSesi } from '@/types';

const SCANNER_ID = 'presensi-qr-reader-full';

interface ScanResult {
  id: number;
  nama: string;
  kode?: string | null;
  asal?: string | null;
  status: string;
  already: boolean;
  sesiName?: string | null;
  at: number;
  error?: boolean;
}

export default function PresensiScanPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-[#c20000]" /></div>}>
      <ScanClient params={params} />
    </Suspense>
  );
}

function ScanClient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const sesiParam = searchParams.get('sesi');
  const initialSesiId = sesiParam ? Number(sesiParam) : null;

  const [presensi, setPresensi] = useState<Presensi | null>(null);
  const [sesis, setSesis] = useState<PresensiSesi[]>([]);
  const [activeSesiId, setActiveSesiId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [last, setLast] = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<ScanResult[]>([]);
  const lastScanRef = useRef<{ token: string; at: number }>({ token: '', at: 0 });

  // Muat detail + daftar sesi.
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/presensi/${id}`);
        const p: Presensi = res.data.data.presensi;
        const list: PresensiSesi[] = res.data.data.sesis || p.sesis || [];
        setPresensi(p);
        setSesis(list);
        if (initialSesiId && list.some((s) => s.id === initialSesiId)) {
          setActiveSesiId(initialSesiId);
        } else {
          setActiveSesiId(list.length > 0 ? list[0].id : null);
        }
      } catch {
        toast.error('Gagal memuat data presensi');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  const activeSesi = sesis.find((s) => s.id === activeSesiId) || null;

  const handlePayload = useCallback(
    async (payload: string) => {
      const now = Date.now();
      if (lastScanRef.current.token === payload && now - lastScanRef.current.at < 4000) return;
      lastScanRef.current = { token: payload, at: now };

      try {
        const res = await api.post(`/presensi/${id}/scan`, {
          payload,
          device: getDeviceFingerprint(),
          sesi_id: activeSesi?.id,
        });
        const d = res.data.data;
        const entry: ScanResult = {
          id: d.peserta.id,
          nama: d.peserta.nama,
          kode: d.peserta.kode,
          asal: d.peserta.asal,
          status: d.status,
          already: d.already,
          sesiName: d.sesi_name ?? activeSesi?.name,
          at: now,
        };
        setLast(entry);
        setHistory((prev) => [entry, ...prev.slice(0, 29)]);
        if (d.already) {
          toast(`${d.peserta.nama} sudah tercatat`, { icon: 'ℹ️' });
        } else {
          toast.success(`${d.peserta.nama} — ${d.status}`);
        }
      } catch (error) {
        const err = error as { response?: { data?: { message?: string } } };
        const msg = err.response?.data?.message || 'QR tidak dikenali';
        toast.error(msg);
        setLast({ id: 0, nama: msg, status: 'error', already: false, at: now, error: true });
      }
    },
    [id, activeSesi]
  );

  const startScan = useCallback(async () => {
    if (scannerRef.current) return;
    setIsStarting(true);
    try {
      if (typeof window !== 'undefined' && !window.isSecureContext) {
        toast.error('Kamera hanya bisa dipakai via HTTPS atau localhost.');
        return;
      }
      const scanner = new Html5Qrcode(SCANNER_ID);
      let cameraConfig: string | { facingMode: string } = { facingMode: 'environment' };
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (cameras && cameras.length > 0) {
          const back = cameras.find((c) => /back|rear|environment|belakang/i.test(c.label));
          cameraConfig = (back ?? cameras[cameras.length - 1]).id;
        }
      } catch {
        // biarkan start() memicu prompt izin lalu fallback facingMode
      }
      scannerRef.current = scanner;
      await scanner.start(
        cameraConfig,
        { fps: 10, qrbox: { width: 320, height: 320 }, aspectRatio: 1.0 },
        (decodedText) => { handlePayload(decodedText); },
        () => { /* abaikan error decode per-frame */ }
      );
      setIsScanning(true);
    } catch (error) {
      const name = (error as { name?: string })?.name;
      if (name === 'NotAllowedError') {
        toast.error('Izin kamera ditolak. Aktifkan izin kamera di browser, lalu muat ulang halaman.');
      } else if (name === 'NotFoundError' || name === 'OverconstrainedError') {
        toast.error('Kamera tidak ditemukan pada perangkat ini.');
      } else if (name === 'NotReadableError') {
        toast.error('Kamera sedang dipakai aplikasi lain.');
      } else {
        toast.error('Tidak dapat mengakses kamera.');
      }
      scannerRef.current = null;
    } finally {
      setIsStarting(false);
    }
  }, [handlePayload]);

  const stopScan = useCallback(async () => {
    const scanner = scannerRef.current;
    if (!scanner) return;
    try {
      await scanner.stop();
      scanner.clear();
    } catch { /* ignore */ }
    scannerRef.current = null;
    setIsScanning(false);
  }, []);

  // Auto-start kamera saat halaman siap (halaman ini khusus scan).
  useEffect(() => {
    if (!isLoading && presensi && !scannerRef.current && !isScanning && !isStarting) {
      startScan();
    }
  }, [isLoading, presensi, isScanning, isStarting, startScan]);

  useEffect(() => {
    return () => {
      const scanner = scannerRef.current;
      if (scanner) {
        scanner.stop().then(() => scanner.clear()).catch(() => {});
      }
    };
  }, []);

  if (isLoading || !presensi) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-[#c20000]" />
      </div>
    );
  }

  return (
    <div className="space-y-5 w-full">
      {/* Header ringkas */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/presensi/${id}`} className="text-slate-400 hover:text-[#c20000]">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-bold text-slate-900">Scan QR Peserta</h1>
          </div>
          <p className="text-sm text-slate-500 mt-0.5 ml-7">
            {presensi.title}{activeSesi ? ` — ${activeSesi.name}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {sesis.length > 0 && (
            <select
              value={activeSesiId ?? ''}
              onChange={(e) => setActiveSesiId(e.target.value ? Number(e.target.value) : null)}
              className="h-10 bg-white border border-slate-200 rounded-xl px-3 text-xs font-bold text-slate-700 outline-none focus:border-[#c20000]"
              title="Pilih sesi"
            >
              {sesis.map((s) => (
                <option key={s.id} value={s.id}>{s.name}{s.is_open ? '' : ' (tutup)'}</option>
              ))}
            </select>
          )}
          {!isScanning ? (
            <Button onClick={startScan} disabled={isStarting} className="h-10 px-5 bg-[#c20000] hover:bg-[#a30000] text-white rounded-xl font-bold text-xs">
              {isStarting ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Camera className="w-4 h-4 mr-1.5" />} Mulai
            </Button>
          ) : (
            <Button onClick={stopScan} variant="outline" className="h-10 px-5 rounded-xl font-bold text-xs">
              <CameraOff className="w-4 h-4 mr-1.5" /> Hentikan
            </Button>
          )}
        </div>
      </div>

      {!presensi.is_open && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-4 py-2.5 text-sm">
          Presensi sedang ditutup — buka dulu agar scan tercatat.
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Kamera besar — hampir penuh lebar layar. */}
        <div className="xl:col-span-2">
          <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-lg">
            <div id={SCANNER_ID} className="w-full min-h-[420px] sm:min-h-[560px] xl:min-h-[640px]" />
            {!isScanning && (
              <div className="absolute inset-0 flex items-center justify-center text-center text-slate-300 px-6">
                <div>
                  <Camera className="w-12 h-12 mx-auto mb-3 opacity-60" />
                  <p className="text-sm">Menyiapkan kamera… Tekan <strong>Mulai</strong> bila tidak muncul otomatis.</p>
                </div>
              </div>
            )}
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/50 backdrop-blur px-3 py-1.5 rounded-full text-xs font-semibold text-white">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${isScanning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
              {isScanning ? 'Kamera aktif' : 'Kamera nonaktif'}
            </div>
          </div>
        </div>

        {/* Hasil scan terakhir + riwayat. */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Hasil Scan Terakhir</div>
            {!last ? (
              <p className="text-sm text-slate-400 py-6 text-center">Belum ada peserta yang dipindai.</p>
            ) : last.error ? (
              <div className="text-center py-4">
                <XCircle className="w-12 h-12 text-red-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-red-600">{last.nama}</p>
              </div>
            ) : (
              <div className="text-center">
                {last.status === 'error' ? (
                  <XCircle className="w-12 h-12 text-red-400 mx-auto mb-2" />
                ) : (
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                )}
                <div className="text-lg font-bold text-slate-800">{last.nama}</div>
                {last.kode && <div className="text-xs text-slate-400">Kode {last.kode}</div>}
                <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    last.status === 'telat' ? 'bg-amber-50 text-amber-600 border-amber-200'
                    : last.status === 'hadir' ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                    {last.status}
                  </span>
                  {last.already && <Badge className="bg-slate-100 text-slate-500 border-slate-200">sudah tercatat</Badge>}
                </div>
                <div className="mt-3 space-y-1 text-xs text-slate-500">
                  {last.asal && <div className="flex items-center justify-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {last.asal}</div>}
                  {last.sesiName && <div className="flex items-center justify-center gap-1.5"><Layers className="w-3.5 h-3.5" /> {last.sesiName}</div>}
                  <div className="flex items-center justify-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(last.at).toLocaleTimeString('id-ID')}</div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Riwayat ({history.length})</div>
              {history.length > 0 && (
                <button onClick={() => setHistory([])} className="text-[11px] font-semibold text-slate-400 hover:text-red-600">
                  Bersihkan
                </button>
              )}
            </div>
            {history.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">Belum ada scan.</p>
            ) : (
              <div className="space-y-2 max-h-[360px] overflow-y-auto">
                {history.map((r, i) => (
                  <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${r.error ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-white'}`}>
                    {r.error ? <XCircle className="w-4 h-4 text-red-500 shrink-0" /> : <UserCheck className="w-4 h-4 text-emerald-500 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-800 truncate">{r.nama}</div>
                      <div className="text-[11px] text-slate-400">{new Date(r.at).toLocaleTimeString('id-ID')}{r.sesiName ? ` · ${r.sesiName}` : ''}</div>
                    </div>
                    <span className={`text-[11px] font-bold uppercase shrink-0 ${
                      r.status === 'telat' ? 'text-amber-600' : r.status === 'hadir' ? 'text-emerald-600' : 'text-slate-400'
                    }`}>{r.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
