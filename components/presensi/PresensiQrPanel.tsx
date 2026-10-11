'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Download, Copy, Check, RefreshCw, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Presensi, PresensiPeserta } from '@/types';

interface Props {
  presensi: Presensi;
  peserta: PresensiPeserta[];
  onRefreshPeserta: () => void;
}

export function PresensiQrPanel({ presensi, peserta }: Props) {
  const [copied, setCopied] = useState(false);
  const [payload, setPayload] = useState<string>('');
  const [secondsLeft, setSecondsLeft] = useState<number>(presensi.qr_refresh_seconds || 15);
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const siteUrl =
    typeof window !== 'undefined'
      ? process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || '';

  // URL yang di-encode QR = halaman self check-in + payload dinamis.
  const qrUrl = payload ? `${siteUrl}/presensi/${presensi.event_token}?qr=${encodeURIComponent(payload)}` : '';

  const fetchQr = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/presensi/${presensi.id}/activity-qr`);
      setPayload(res.data.data.payload);
      setSecondsLeft(res.data.data.expires_in || res.data.data.interval || 15);
    } catch {
      toast.error('Gagal memuat QR');
    } finally {
      setIsLoading(false);
    }
  }, [presensi.id]);

  useEffect(() => {
    if (presensi.mode === 'scan') return; // QR dinamis hanya untuk mode self/both
    fetchQr();
  }, [fetchQr, presensi.mode]);

  // Countdown + auto-refresh saat mencapai 0.
  useEffect(() => {
    if (presensi.mode === 'scan') return;
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          fetchQr();
          return presensi.qr_refresh_seconds || 15;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchQr, presensi.mode, presensi.qr_refresh_seconds]);

  const copyLink = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Link disalin');
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Gagal menyalin');
    }
  };

  const downloadQr = () => {
    const svg = document.getElementById('qr-kegiatan') as SVGSVGElement | null;
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-kegiatan-${presensi.slug}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const canSelf = presensi.mode === 'self' || presensi.mode === 'both';
  const canScan = presensi.mode === 'scan' || presensi.mode === 'both';
  const interval = presensi.qr_refresh_seconds || 15;
  const progress = Math.max(0, Math.min(100, (secondsLeft / interval) * 100));

  return (
    <div className="space-y-6">
      {canSelf && (
        <Card className="border-slate-200/90 rounded-2xl shadow-2xs">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> QR Kegiatan Dinamis — Self Check-in
            </CardTitle>
            <p className="text-sm text-slate-500 mt-1">
              QR berputar setiap <strong>{interval} detik</strong>. Peserta harus memindai QR yang sedang tampil; QR lama otomatis kedaluwarsa.
            </p>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex flex-col items-center">
              <div className="bg-white p-5 border-2 border-slate-100 rounded-2xl shadow-sm">
                {isLoading || !qrUrl ? (
                  <div className="w-[220px] h-[220px] flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 animate-spin text-slate-300" />
                  </div>
                ) : (
                  <QRCodeSVG id="qr-kegiatan" value={qrUrl} size={220} level="M" />
                )}
              </div>
              {/* Progress bar countdown */}
              <div className="w-[220px] mt-3">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Refresh dalam</span>
                  <span className="font-bold text-slate-700">{secondsLeft}s</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#c20000] transition-all duration-1000 ease-linear"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <p className="text-sm text-slate-600">
                Tampilkan QR ini di layar lokasi kegiatan. Peserta memindai, memilih namanya, lalu menandai hadir sendiri.
                Anti-titip-absen {presensi.enforce_device_limit !== false ? <strong>aktif</strong> : <span className="text-slate-400">nonaktif</span>}: satu perangkat hanya untuk satu peserta.
              </p>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                <code className="text-xs text-slate-600 flex-1 truncate">{siteUrl}/presensi/{presensi.event_token}</code>
                <button onClick={() => copyLink(`${siteUrl}/presensi/${presensi.event_token}`)} className="text-slate-500 hover:text-[#c20000]">
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex gap-2">
                <Button onClick={fetchQr} variant="outline" className="h-10 px-4 rounded-xl text-xs font-bold">
                  <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh QR
                </Button>
                <Button onClick={downloadQr} variant="outline" className="h-10 px-4 rounded-xl text-xs font-bold">
                  <Download className="w-4 h-4 mr-1.5" /> Unduh QR
                </Button>
              </div>
              <p className="text-xs text-slate-400">
                Catatan: QR yang diunduh hanya berlaku sementara. Untuk ditampilkan, gunakan QR live di halaman ini.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {canScan && (
        <Card className="border-slate-200/90 rounded-2xl shadow-2xs">
          <CardHeader>
            <CardTitle className="text-base">QR Unik per Peserta — Scan Petugas</CardTitle>
            <p className="text-sm text-slate-500 mt-1">
              Cetak kartu QR untuk tiap peserta. Petugas memindai QR ini di tab <strong>Scan</strong>. Menampilkan {peserta.length} peserta (halaman ini).
            </p>
          </CardHeader>
          <CardContent>
            {peserta.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">Belum ada peserta. Impor peserta terlebih dahulu.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {peserta.map((p) => (
                  <div key={p.id} className="border border-slate-200 rounded-xl p-3 text-center bg-white">
                    <QRCodeSVG value={`presensi:${presensi.id}:${p.token}`} size={120} level="M" className="mx-auto" />
                    <div className="mt-2 text-sm font-semibold text-slate-800 line-clamp-1">{p.nama}</div>
                    {p.kode && <div className="text-xs text-slate-400">Kode {p.kode}</div>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!canSelf && !canScan && (
        <p className="text-sm text-slate-400">Mode QR tidak aktif untuk sesi ini.</p>
      )}
    </div>
  );
}
