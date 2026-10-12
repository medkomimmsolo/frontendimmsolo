'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Camera, CameraOff, CheckCircle2, XCircle, Loader2, ScanLine } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { getDeviceFingerprint } from '@/lib/deviceFingerprint';
import { Presensi, PresensiSesi } from '@/types';

interface Props {
  presensi: Presensi;
  activeSesi?: PresensiSesi | null;
  onChecked: () => void;
}

interface ScanResult {
  nama: string;
  kode?: string | null;
  status: string;
  already: boolean;
  at: number;
}

const SCANNER_ID = 'presensi-qr-reader';

export function PresensiScanPanel({ presensi, activeSesi, onChecked }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [results, setResults] = useState<ScanResult[]>([]);
  const lastScanRef = useRef<{ token: string; at: number }>({ token: '', at: 0 });

  const handlePayload = useCallback(
    async (payload: string) => {
      // Debounce agar satu QR tidak terkirim berkali-kali.
      const now = Date.now();
      if (lastScanRef.current.token === payload && now - lastScanRef.current.at < 4000) return;
      lastScanRef.current = { token: payload, at: now };

      try {
        const res = await api.post(`/presensi/${presensi.id}/scan`, {
          payload,
          device: getDeviceFingerprint(),
          sesi_id: activeSesi?.id,
        });
        const d = res.data.data;
        setResults((prev) => [
          { nama: d.peserta.nama, kode: d.peserta.kode, status: d.status, already: d.already, at: now },
          ...prev.slice(0, 19),
        ]);
        if (d.already) {
          toast(`${d.peserta.nama} sudah tercatat`, { icon: 'ℹ️' });
        } else {
          toast.success(`${d.peserta.nama} — ${d.status}`);
          onChecked();
        }
      } catch (error) {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(err.response?.data?.message || 'QR tidak dikenali');
        setResults((prev) => [{ nama: 'QR tidak dikenali', status: 'error', already: false, at: now }, ...prev.slice(0, 19)]);
      }
    },
    [presensi.id, activeSesi, onChecked]
  );

  const startScan = useCallback(async () => {
    if (scannerRef.current) return;
    setIsStarting(true);
    try {
      // getUserMedia hanya tersedia di secure context (HTTPS atau localhost).
      // Tanpa ini, browser menolak akses kamera di http://<ip-lan>.
      if (typeof window !== 'undefined' && !window.isSecureContext) {
        toast.error('Kamera hanya bisa dipakai via HTTPS atau localhost. Buka situs lewat https:// lalu coba lagi.');
        return;
      }

      const scanner = new Html5Qrcode(SCANNER_ID);

      // Pilih kamera yang paling tepat: utamakan kamera belakang di mobile,
      // tapi tetap jalan di desktop yang hanya punya webcam depan.
      // Menggunakan cameraId konkret (bukan facingMode) agar kompatibel
      // di iOS Safari & Android Chrome sekaligus laptop/desktop.
      let cameraConfig: string | { facingMode: string } = { facingMode: 'environment' };
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (cameras && cameras.length > 0) {
          const back = cameras.find((c) => /back|rear|environment|belakang/i.test(c.label));
          cameraConfig = (back ?? cameras[cameras.length - 1]).id;
        }
      } catch {
        // getCameras bisa gagal sebelum izin diberikan; biarkan start()
        // yang memicu prompt izin lalu fallback ke facingMode.
      }

      scannerRef.current = scanner;
      await scanner.start(
        cameraConfig,
        { fps: 10, qrbox: { width: 280, height: 280 }, aspectRatio: 1.0 },
        (decodedText) => { handlePayload(decodedText); },
        () => { /* abaikan error decode per-frame */ }
      );
      setIsScanning(true);
    } catch (error) {
      console.error(error);
      const name = (error as { name?: string })?.name;
      if (name === 'NotAllowedError') {
        toast.error('Izin kamera ditolak. Aktifkan izin kamera di pengaturan browser, lalu muat ulang halaman.');
      } else if (name === 'NotFoundError' || name === 'OverconstrainedError') {
        toast.error('Kamera tidak ditemukan pada perangkat ini.');
      } else if (name === 'NotReadableError') {
        toast.error('Kamera sedang dipakai aplikasi lain. Tutup aplikasi tersebut lalu coba lagi.');
      } else {
        toast.error('Tidak dapat mengakses kamera. Pastikan izin kamera diberikan.');
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
    } catch {
      /* ignore */
    }
    scannerRef.current = null;
    setIsScanning(false);
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup saat unmount.
      const scanner = scannerRef.current;
      if (scanner) {
        scanner.stop().then(() => scanner.clear()).catch(() => {});
      }
    };
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Kamera — area lebar sendiri agar leluasa mengarahkan QR. */}
      <Card className="border-slate-200/90 rounded-2xl shadow-2xs lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ScanLine className="w-4 h-4" /> Scan QR Peserta
            {activeSesi && <span className="text-xs font-bold text-[#c20000]">· {activeSesi.name}</span>}
          </CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            Arahkan kamera ke QR unik peserta. Kehadiran tercatat otomatis.
            {!presensi.is_open && <span className="text-amber-600 font-semibold"> Presensi sedang ditutup — buka dulu agar scan tercatat.</span>}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            {!isScanning ? (
              <Button onClick={startScan} disabled={isStarting} className="h-12 px-7 bg-[#c20000] hover:bg-[#a30000] text-white rounded-xl font-bold">
                {isStarting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Camera className="w-5 h-5 mr-2" />}
                Mulai Scan
              </Button>
            ) : (
              <Button onClick={stopScan} variant="outline" className="h-12 px-7 rounded-xl font-bold">
                <CameraOff className="w-5 h-5 mr-2" /> Hentikan
              </Button>
            )}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${isScanning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
              {isScanning ? 'Kamera aktif — siap memindai' : 'Kamera nonaktif'}
            </div>
          </div>
          <div
            id={SCANNER_ID}
            className={`w-full rounded-2xl overflow-hidden bg-slate-900/90 min-h-[320px] sm:min-h-[440px] flex items-center justify-center ${isScanning ? '' : 'border-2 border-dashed border-slate-300'}`}
          >
            {!isScanning && (
              <div className="text-center text-slate-300 px-6 py-16">
                <Camera className="w-10 h-10 mx-auto mb-3 opacity-60" />
                <p className="text-sm">Tekan <strong>Mulai Scan</strong> untuk mengaktifkan kamera.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Riwayat scan di samping kamera. */}
      <Card className="border-slate-200/90 rounded-2xl shadow-2xs">
        <CardHeader><CardTitle className="text-base">Riwayat Scan (Sesi Ini)</CardTitle></CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">Belum ada scan.</p>
          ) : (
            <div className="space-y-2 max-h-[520px] overflow-y-auto">
              {results.map((r, i) => (
                <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${r.status === 'error' ? 'border-red-200 bg-red-50' : 'border-emerald-200 bg-emerald-50'}`}>
                  {r.status === 'error' ? <XCircle className="w-5 h-5 text-red-500 shrink-0" /> : <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-800 truncate">{r.nama}</div>
                    {r.kode && <div className="text-xs text-slate-500">Kode {r.kode}</div>}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-semibold text-slate-700 uppercase">{r.status}</div>
                    <div className="text-[11px] text-slate-400">{new Date(r.at).toLocaleTimeString('id-ID')}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
