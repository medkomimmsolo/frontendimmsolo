'use client';

import { use, useEffect, useRef, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Html5Qrcode } from 'html5-qrcode';
import api from '@/lib/api';
import { getDeviceFingerprint } from '@/lib/deviceFingerprint';
import { Button } from '@/components/ui/Button';
import {
  Camera, CameraOff, CheckCircle2, XCircle, Loader2, ArrowLeft,
  Layers, Clock, MapPin, Maximize2, Minimize2,
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

  const cameraContainerRef = useRef<HTMLDivElement | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [last, setLast] = useState<ScanResult | null>(null);
  const popupTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  useEffect(() => {
    const updateFullscreenState = () => {
      setIsFullscreen(document.fullscreenElement === cameraContainerRef.current);
    };
    document.addEventListener('fullscreenchange', updateFullscreenState);
    return () => document.removeEventListener('fullscreenchange', updateFullscreenState);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const cameraContainer = cameraContainerRef.current;
    if (!cameraContainer) return;
    try {
      if (document.fullscreenElement === cameraContainer) {
        await document.exitFullscreen();
      } else if (!document.fullscreenElement) {
        await cameraContainer.requestFullscreen();
      } else {
        toast.error('Tutup mode layar penuh yang sedang aktif terlebih dahulu.');
      }
    } catch {
      toast.error('Tidak dapat mengubah mode layar penuh pada browser ini.');
    }
  }, []);

  const showScanPopup = useCallback((result: ScanResult) => {
    if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current);
    setLast(result);
    popupTimeoutRef.current = setTimeout(() => {
      setLast(null);
      popupTimeoutRef.current = null;
    }, 5000);
  }, []);

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
        showScanPopup(entry);
      } catch (error) {
        const err = error as { response?: { data?: { message?: string } } };
        const msg = err.response?.data?.message || 'QR tidak dikenali';
        showScanPopup({ id: 0, nama: msg, status: 'error', already: false, at: now, error: true });
      }
    },
    [id, activeSesi, showScanPopup]
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
      const desktopVideoConstraints: MediaTrackConstraints = window.matchMedia('(min-width: 768px)').matches
        ? { width: { ideal: 1280 }, height: { ideal: 720 }, aspectRatio: { ideal: 16 / 9 } }
        : {};
      const videoConstraints: MediaTrackConstraints = typeof cameraConfig === 'string'
        ? { deviceId: { exact: cameraConfig }, ...desktopVideoConstraints }
        : { ...cameraConfig, ...desktopVideoConstraints };
      scannerRef.current = scanner;
      await scanner.start(
        cameraConfig,
        { fps: 10, videoConstraints },
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
      if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current);
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

      <div className="w-full">
        <div
          ref={cameraContainerRef}
          className={`relative w-full overflow-hidden bg-slate-900 border border-slate-800 shadow-lg [&_video]:!h-full [&_video]:!w-full [&_video]:!object-contain ${
            isFullscreen
              ? 'h-screen w-screen aspect-auto rounded-none'
              : 'aspect-[9/16] md:aspect-video rounded-3xl'
          }`}
        >
          <div id={SCANNER_ID} className="h-full w-full" />
          {!isScanning && (
            <div className="absolute inset-0 flex items-center justify-center text-center text-slate-300 px-6">
              <div>
                <Camera className="w-12 h-12 mx-auto mb-3 opacity-60" />
                <p className="text-sm">Menyiapkan kamera… Tekan <strong>Mulai</strong> bila tidak muncul otomatis.</p>
              </div>
            </div>
          )}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-black/50 backdrop-blur px-3 py-1.5 rounded-full text-xs font-semibold text-white">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${isScanning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
            {isScanning ? 'Kamera aktif' : 'Kamera nonaktif'}
          </div>
          <Button
            type="button"
            onClick={toggleFullscreen}
            variant="outline"
            aria-label={isFullscreen ? 'Keluar dari layar penuh' : 'Tampilkan kamera layar penuh'}
            title={isFullscreen ? 'Keluar dari layar penuh' : 'Layar penuh'}
            className="absolute top-3 right-3 z-10 h-9 w-9 rounded-full border-white/30 bg-black/50 p-0 text-white backdrop-blur hover:bg-black/70 hover:text-white"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          {last && (
            <div className="pointer-events-none absolute inset-x-3 top-14 z-20 flex justify-center" role="status" aria-live="polite">
              <div className={`w-full max-w-md rounded-2xl border p-4 shadow-xl backdrop-blur-md ${
                last.error ? 'border-red-200 bg-white/95' : 'border-emerald-200 bg-white/95'
              }`}>
                <div className="flex items-start gap-3">
                  {last.error
                    ? <XCircle className="mt-0.5 h-6 w-6 shrink-0 text-red-500" />
                    : <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-500" />}
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-bold uppercase tracking-wider ${last.error ? 'text-red-600' : 'text-emerald-700'}`}>
                      {last.error ? 'Scan gagal' : last.already ? 'Sudah tercatat' : 'Scan berhasil'}
                    </p>
                    <p className="mt-0.5 truncate text-lg font-bold text-slate-900">{last.nama}</p>
                    {!last.error && (
                      <>
                        {last.kode && <p className="text-xs text-slate-500">Kode {last.kode}</p>}
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                          <span className={`font-bold uppercase ${
                            last.status === 'telat' ? 'text-amber-600' : 'text-emerald-600'
                          }`}>{last.status}</span>
                          {last.asal && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{last.asal}</span>}
                          {last.sesiName && <span className="inline-flex items-center gap-1"><Layers className="h-3.5 w-3.5" />{last.sesiName}</span>}
                          <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{new Date(last.at).toLocaleTimeString('id-ID')}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>
  );
}
