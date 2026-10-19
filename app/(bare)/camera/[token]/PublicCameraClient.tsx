'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { ArrowLeft, Camera, CameraOff, CheckCircle2, Clock, Layers, Loader2, MapPin, Maximize2, Minimize2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { getDeviceFingerprint } from '@/lib/deviceFingerprint';

const SCANNER_ID = 'public-presensi-camera-reader';

interface CameraSessionInfo {
  presensi_title: string;
  sesi_name: string;
  is_receiving: boolean;
}

interface ScanResult {
  nama: string;
  kode?: string | null;
  asal?: string | null;
  status: string;
  already: boolean;
  sesiName?: string | null;
  at: number;
  error?: boolean;
}

export default function PublicCameraClient({ token }: { token?: string }) {
  const [session, setSession] = useState<CameraSessionInfo | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [tokenInput, setTokenInput] = useState(token ?? '');
  const [activeToken, setActiveToken] = useState<string | null>(token ?? null);
  const [cameraError, setCameraError] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [last, setLast] = useState<ScanResult | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const cameraFrameRef = useRef<HTMLDivElement | null>(null);
  const attemptedStartRef = useRef(false);
  const lastScanRef = useRef<{ payload: string; at: number }>({ payload: '', at: 0 });
  const popupTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!activeToken) return;
    let active = true;
    api.get(`/presensi-camera/${activeToken}`)
      .then((res) => {
        if (active) setSession(res.data.data);
      })
      .catch(() => {
        if (active) setLoadError(true);
      });
    return () => { active = false; };
  }, [activeToken]);

  useEffect(() => {
    const updateFullscreenState = () => {
      setIsFullscreen(document.fullscreenElement === cameraFrameRef.current);
    };
    document.addEventListener('fullscreenchange', updateFullscreenState);
    return () => document.removeEventListener('fullscreenchange', updateFullscreenState);
  }, []);

  const showScanPopup = useCallback((result: ScanResult) => {
    if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current);
    setLast(result);
    popupTimeoutRef.current = setTimeout(() => {
      setLast(null);
      popupTimeoutRef.current = null;
    }, 5000);
  }, []);

  const handlePayload = useCallback(async (payload: string) => {
    const now = Date.now();
    if (lastScanRef.current.payload === payload && now - lastScanRef.current.at < 4000) return;
    lastScanRef.current = { payload, at: now };

    try {
      const res = await api.post(`/presensi-camera/${activeToken}/scan`, {
        payload,
        device: getDeviceFingerprint(),
      });
      const data = res.data.data;
      showScanPopup({
        nama: data.peserta.nama,
        kode: data.peserta.kode,
        asal: data.peserta.asal,
        status: data.status,
        already: data.already,
        sesiName: data.sesi_name ?? session?.sesi_name,
        at: now,
      });
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      showScanPopup({
        nama: err.response?.data?.message || 'QR tidak dikenali',
        status: 'error',
        already: false,
        at: now,
        error: true,
      });
    }
  }, [activeToken, session, showScanPopup]);

  const startScan = useCallback(async () => {
    if (scannerRef.current || !activeToken || !session?.is_receiving) return;
    attemptedStartRef.current = true;
    setIsStarting(true);
    setCameraError('');
    try {
      if (!window.isSecureContext) {
        setCameraError('Kamera hanya bisa dipakai melalui HTTPS atau localhost.');
        return;
      }
      const scanner = new Html5Qrcode(SCANNER_ID);
      let cameraConfig: string | MediaTrackConstraints = { facingMode: 'environment' };
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (cameras.length > 0) {
          const back = cameras.find((camera) => /back|rear|environment|belakang/i.test(camera.label));
          cameraConfig = (back ?? cameras[cameras.length - 1]).id;
        }
      } catch {
        // Biarkan start() meminta izin kamera dan memilih kamera belakang.
      }
      const desktopConstraints: MediaTrackConstraints = window.matchMedia('(min-width: 768px)').matches
        ? { width: { ideal: 1280 }, height: { ideal: 720 }, aspectRatio: { ideal: 16 / 9 } }
        : {};
      const videoConstraints: MediaTrackConstraints = typeof cameraConfig === 'string'
        ? { deviceId: { exact: cameraConfig }, ...desktopConstraints }
        : { ...cameraConfig, ...desktopConstraints };
      scannerRef.current = scanner;
      await scanner.start(
        cameraConfig,
        { fps: 10, videoConstraints },
        (payload) => { void handlePayload(payload); },
        () => {},
      );
      setIsScanning(true);
    } catch (error) {
      const name = (error as { name?: string })?.name;
      setCameraError(
        name === 'NotAllowedError'
          ? 'Izin kamera ditolak. Aktifkan izin kamera di browser lalu coba lagi.'
          : name === 'NotFoundError' || name === 'OverconstrainedError'
            ? 'Kamera tidak ditemukan pada perangkat ini.'
            : name === 'NotReadableError'
              ? 'Kamera sedang dipakai aplikasi lain.'
              : 'Tidak dapat mengakses kamera. Periksa izin kamera browser dan coba lagi.'
      );
      scannerRef.current = null;
    } finally {
      setIsStarting(false);
    }
  }, [activeToken, handlePayload, session?.is_receiving]);

  const stopScan = useCallback(async () => {
    const scanner = scannerRef.current;
    if (!scanner) return;
    try {
      await scanner.stop();
      scanner.clear();
    } catch {
      setCameraError('Kamera tidak dapat dihentikan dengan normal.');
    } finally {
      scannerRef.current = null;
      setIsScanning(false);
    }
  }, []);

  useEffect(() => {
    if (session?.is_receiving && !attemptedStartRef.current) {
      void startScan();
    }
  }, [session, startScan]);

  useEffect(() => () => {
    const scanner = scannerRef.current;
    if (scanner) scanner.stop().then(() => scanner.clear()).catch(() => {});
    if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current);
  }, []);

  const toggleFullscreen = async () => {
    const frame = cameraFrameRef.current;
    if (!frame) return;
    try {
      if (document.fullscreenElement === frame) {
        await document.exitFullscreen();
      } else if (!document.fullscreenElement) {
        await frame.requestFullscreen();
      }
    } catch {
      setCameraError('Browser tidak dapat mengaktifkan mode layar penuh.');
    }
  };

  const handleTokenSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanToken = tokenInput.trim().toUpperCase();
    if (!/^[A-Z0-9]{8}$/.test(cleanToken)) {
      setLoadError(true);
      return;
    }
    const cameraFrame = cameraFrameRef.current;
    if (cameraFrame && !document.fullscreenElement) {
      void cameraFrame.requestFullscreen().catch(() => {
        setCameraError('Browser tidak mengizinkan layar penuh otomatis. Gunakan tombol layar penuh di atas kamera.');
      });
    }
    attemptedStartRef.current = false;
    setLoadError(false);
    setSession(null);
    setCameraError('');
    setActiveToken(cleanToken);
  };

  const changeSessionToken = async () => {
    if (scannerRef.current) await stopScan();
    setSession(null);
    setActiveToken(null);
    setTokenInput('');
    setLoadError(false);
    setLast(null);
    attemptedStartRef.current = false;
  };

  return (
    <main className="min-h-screen bg-slate-950 p-2 text-white sm:p-4">
      <div
        ref={cameraFrameRef}
        className={`relative mx-auto w-full overflow-hidden bg-black shadow-2xl [&_video]:!h-full [&_video]:!w-full [&_video]:!object-contain ${
          isFullscreen
            ? 'h-screen w-screen aspect-auto rounded-none'
            : 'aspect-[9/16] max-h-[calc(100dvh-1rem)] rounded-2xl md:aspect-video md:max-h-[calc(100dvh-2rem)] md:rounded-3xl'
        }`}
      >
        <div id={SCANNER_ID} className="h-full w-full" />
        {!isScanning && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center text-slate-300">
            <div>
              {isStarting || (activeToken && !session && !loadError)
                ? <Loader2 className="mx-auto mb-3 h-12 w-12 animate-spin text-red-400" />
                : <Camera className="mx-auto mb-3 h-12 w-12 opacity-60" />}
              <p className="text-sm">
                {loadError
                  ? 'Token tidak valid. Periksa kembali token presensi.'
                  : session && !session.is_receiving
                    ? 'Presensi sedang ditutup.'
                    : session
                      ? 'Menyiapkan kamera…'
                      : activeToken
                        ? 'Memeriksa token presensi…'
                        : 'Kamera siap digunakan. Masukkan token presensi.'}
              </p>
            </div>
          </div>
        )}

        {session ? (
          <div className="absolute inset-x-3 top-3 z-20 flex flex-wrap items-start justify-between gap-2 p-1 drop-shadow-lg sm:inset-x-5 sm:top-5 sm:p-2">
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-sm font-bold sm:text-lg">{session.presensi_title}</h1>
              <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-slate-200 sm:text-sm"><Layers className="h-3.5 w-3.5" />{session.sesi_name}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 text-2xs font-semibold sm:text-xs ${session.is_receiving ? 'text-emerald-200' : 'text-amber-200'}`}>
                  <span className={`h-2 w-2 rounded-full ${session.is_receiving ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  {session.is_receiving ? 'Presensi dibuka' : 'Presensi ditutup'}
                </span>
                <span className="inline-flex items-center gap-1.5 text-2xs font-semibold text-white sm:text-xs">
                  <span className={`h-2 w-2 rounded-full ${isScanning ? 'animate-pulse bg-emerald-400' : 'bg-slate-400'}`} />
                  {isScanning ? 'Kamera aktif' : 'Kamera nonaktif'}
                </span>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
              <Button onClick={changeSessionToken} variant="outline" className="h-9 rounded-full border-white/50 bg-transparent px-3 text-xs text-white shadow-lg hover:bg-white/15 hover:text-white sm:h-10 sm:px-4 sm:text-sm">
                Ganti token
              </Button>
              <Button
                type="button"
                onClick={toggleFullscreen}
                variant="outline"
                aria-label={isFullscreen ? 'Keluar dari layar penuh' : 'Tampilkan kamera layar penuh'}
                title={isFullscreen ? 'Keluar dari layar penuh' : 'Layar penuh'}
                className="h-9 w-9 rounded-full border-white/50 bg-transparent p-0 text-white shadow-lg hover:bg-white/15 hover:text-white sm:h-10 sm:w-10"
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        ) : (
          <div className="absolute inset-x-3 top-3 z-20 flex items-center justify-between px-1 py-1 drop-shadow-lg sm:inset-x-5 sm:top-5 sm:px-2">
            <div className="flex items-center gap-2.5">
              <Camera className="h-5 w-5 text-red-400" />
              <h1 className="text-base font-bold sm:text-lg">Kamera Presensi</h1>
            </div>
            <Button
              type="button"
              onClick={toggleFullscreen}
              variant="outline"
              aria-label={isFullscreen ? 'Keluar dari layar penuh' : 'Tampilkan kamera layar penuh'}
              className="h-9 w-9 rounded-full border-white/50 bg-transparent p-0 text-white shadow-lg hover:bg-white/15 hover:text-white"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        )}

        {cameraError && (
          <div role="alert" className="absolute inset-x-3 top-20 z-30 text-center text-sm font-semibold text-red-100 drop-shadow-lg sm:inset-x-5 sm:top-24">
            {cameraError}
          </div>
        )}

        {last && (
          <div className="pointer-events-none absolute inset-x-3 top-24 z-30 flex justify-center sm:inset-x-5 sm:top-28" role="status" aria-live="polite">
            <div className={`w-full max-w-md rounded-2xl border bg-white/95 p-4 text-slate-900 shadow-xl backdrop-blur-md ${last.error ? 'border-red-200' : 'border-emerald-200'}`}>
              <div className="flex items-start gap-3">
                {last.error ? <XCircle className="mt-0.5 h-6 w-6 shrink-0 text-red-500" /> : <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-500" />}
                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-bold uppercase tracking-wider ${last.error ? 'text-red-600' : 'text-emerald-700'}`}>{last.error ? 'Scan gagal' : last.already ? 'Sudah tercatat' : 'Scan berhasil'}</p>
                  <p className="mt-0.5 truncate text-lg font-bold">{last.nama}</p>
                  {!last.error && (
                    <>
                      {last.kode && <p className="text-xs text-slate-500">Kode {last.kode}</p>}
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                        <span className={`font-bold uppercase ${last.status === 'telat' ? 'text-amber-600' : 'text-emerald-600'}`}>{last.status}</span>
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

        {(!activeToken || loadError) && (
          <form
            onSubmit={handleTokenSubmit}
            className="absolute inset-x-4 top-1/2 z-20 mx-auto w-[calc(100%-2rem)] max-w-md -translate-y-1/2 rounded-3xl border border-white/15 bg-slate-950/85 p-5 shadow-2xl backdrop-blur-xl sm:p-7"
          >
            <div className="mb-5 text-center">
              {loadError && <XCircle className="mx-auto mb-3 h-9 w-9 text-red-400" />}
              <h2 className="text-xl font-bold">{loadError ? 'Token tidak ditemukan' : 'Pilih presensi'}</h2>
              <p className="mt-1.5 text-sm text-slate-300">Masukkan token 8 karakter untuk menghubungkan kamera ke presensi dan sesi.</p>
            </div>
            <label htmlFor="camera-session-token" className="mb-2 block text-sm font-semibold text-slate-200">Token presensi</label>
            <input
              id="camera-session-token"
              type="text"
              value={tokenInput}
              onChange={(event) => {
                setTokenInput(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8));
                setLoadError(false);
              }}
              placeholder="Contoh: AABC1234"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              maxLength={8}
              aria-invalid={loadError}
              className="h-12 w-full rounded-xl border border-white/20 bg-black/40 px-4 text-center font-mono text-xl font-bold tracking-[0.25em] text-white outline-none placeholder:text-sm placeholder:font-normal placeholder:tracking-normal focus:border-red-400"
            />
            {loadError && <p role="alert" className="mt-2 text-sm text-red-300">Periksa kembali token dari petugas.</p>}
            <Button type="submit" disabled={tokenInput.length !== 8} className="mt-4 h-11 w-full rounded-xl bg-[#c20000] font-bold text-white hover:bg-[#a30000]">
              <Camera className="mr-2 h-4 w-4" /> Gunakan Kamera
            </Button>
            {!isFullscreen && (
              <p className="mt-3 text-center text-xs text-slate-400">Kamera akan dibuka dalam layar penuh setelah token dikonfirmasi.</p>
            )}
            {!activeToken && (
              <Link href="/" className="mt-4 flex items-center justify-center gap-2 text-xs text-white/60 hover:text-white"><ArrowLeft className="h-3.5 w-3.5" /> Kembali ke situs</Link>
            )}
          </form>
        )}
        {session && !session.is_receiving && (
          <div className="pointer-events-none absolute inset-x-3 bottom-24 z-10 text-center text-xs text-white drop-shadow-lg sm:inset-x-5">
            Kamera aktif kembali saat presensi dibuka oleh pengelola.
          </div>
        )}

        {session && session.is_receiving && (
          <div className="absolute inset-x-0 bottom-5 z-20 flex justify-center sm:bottom-8">
            {isScanning ? (
              <Button
                onClick={stopScan}
                variant="outline"
                className="h-12 rounded-full border-white/50 bg-black/30 px-6 font-semibold text-white shadow-lg backdrop-blur-sm hover:bg-black/60 hover:text-white"
              >
                <CameraOff className="mr-2 h-4 w-4" /> Hentikan kamera
              </Button>
            ) : (
              <Button
                onClick={startScan}
                disabled={isStarting}
                className="h-12 rounded-full bg-[#c20000]/90 px-7 font-semibold text-white shadow-lg backdrop-blur-sm hover:bg-[#a30000]"
              >
                {isStarting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
                Mulai kamera
              </Button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
