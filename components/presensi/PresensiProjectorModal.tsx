'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Maximize2, Minimize2, X, Users, ShieldCheck, Sparkles, MapPin } from 'lucide-react';
import { Presensi, PresensiSesi, PresensiStats } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  presensi: Presensi;
  activeSesi?: PresensiSesi | null;
  qrUrl: string;
  secondsLeft: number;
  interval: number;
  stats?: PresensiStats | null;
}

export function PresensiProjectorModal({
  isOpen,
  onClose,
  presensi,
  activeSesi,
  qrUrl,
  secondsLeft,
  interval,
  stats,
}: Props) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !document.fullscreenElement) {
        onClose();
      }
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      /* ignore */
    }
  };

  const progress = Math.max(0, Math.min(100, (secondsLeft / interval) * 100));
  const attendedCount = stats ? stats.hadir + stats.telat : 0;
  const totalCount = stats ? stats.total_peserta : 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white overflow-hidden animate-in fade-in duration-200"
    >
      {/* Top Navbar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#c20000] flex items-center justify-center text-white font-black text-sm shadow-lg shadow-red-950/40">
            IMM
          </div>
          <div>
            <div className="text-xs font-semibold tracking-wider text-white/60 uppercase">
              Presensi Digital · Mode Proyektor
            </div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>{presensi.title}</span>
              {activeSesi && (
                <span className="px-2 py-0.5 rounded-full bg-[#c20000] text-[11px] font-bold">
                  {activeSesi.name}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {stats && totalCount > 0 && (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-bold">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                <strong className="text-emerald-400">{attendedCount}</strong> / {totalCount} Hadir
              </span>
              <span className="text-white/40">·</span>
              <span className="text-emerald-400">{stats.persen_hadir}%</span>
            </div>
          )}

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
            aria-label={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-red-600/80 text-white transition-colors"
            title="Tutup (ESC)"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Stage */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center p-6 md:p-12 gap-8 lg:gap-16 max-w-7xl mx-auto w-full">
        {/* Left / Center: Big QR */}
        <div className="flex flex-col items-center">
          <div className="relative p-7 bg-white rounded-3xl shadow-2xl shadow-red-950/30 border-4 border-white/20">
            {qrUrl ? (
              <QRCodeSVG id="projector-qr" value={qrUrl} size={300} level="M" />
            ) : (
              <div className="w-[300px] h-[300px] flex items-center justify-center text-slate-400">
                Memuat QR...
              </div>
            )}

            {/* Rotating countdown badge */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-[#0f172a] border border-white/20 rounded-full px-4 py-1.5 shadow-xl flex items-center gap-2 text-xs font-bold whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Refresh dalam</span>
              <span className="text-[#f87171]">{secondsLeft}s</span>
            </div>
          </div>

          {/* Progress bar under QR */}
          <div className="w-[300px] mt-7">
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-[#c20000] transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-white/50 mt-1.5">
              <span>QR Dinamis Anti-Titip</span>
              <span>Rotasi tiap {interval}d</span>
            </div>
          </div>
        </div>

        {/* Right: Event Info & Instructions */}
        <div className="flex-1 max-w-lg space-y-6 text-center lg:text-left">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/30 text-red-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" /> Pindai untuk Absen
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {presensi.title}
            </h1>
            {presensi.location && (
              <p className="text-sm text-white/70 flex items-center justify-center lg:justify-start gap-1.5">
                <MapPin className="w-4 h-4 text-red-400 shrink-0" /> {presensi.location}
              </p>
            )}
          </div>

          {/* Step by step cards */}
          <div className="space-y-3 bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xs text-left">
            <div className="text-xs font-bold uppercase tracking-wider text-white/50 mb-3">
              Petunjuk Bagi Peserta
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#c20000] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                1
              </div>
              <p className="text-sm text-white/90">
                Buka <strong>kamera ponsel</strong> atau aplikasi pemindai QR.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#c20000] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                2
              </div>
              <p className="text-sm text-white/90">
                Arahkan ke <strong>kode QR di layar</strong> ini dan buka link yang muncul.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#c20000] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                3
              </div>
              <p className="text-sm text-white/90">
                Cari nama Anda lalu klik <strong>Konfirmasi Kehadiran</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center lg:justify-start gap-2 text-xs text-emerald-400/90">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Anti-Titip Absen: Satu perangkat HP hanya untuk satu peserta.</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-3 text-xs text-white/40 border-t border-white/5 bg-black/30">
        Pimpinan Cabang Ikatan Mahasiswa Muhammadiyah Kota Surakarta · Sistem Presensi Terintegrasi
      </footer>
    </div>
  );
}
