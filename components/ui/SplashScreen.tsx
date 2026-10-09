'use client';

import { useState, useEffect } from 'react';

const WORDS = ['HALO', 'ASSALAMUALAIKUM', 'SUGENG RAWUH'];
const WORD_MS = 300;
const LOGO_MS = 200;
const CURTAIN_MS = 450;

const SHOW_MS = LOGO_MS + WORDS.length * WORD_MS + 100;
const FADE_MS = CURTAIN_MS + 150;

const EASE_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';

/**
 * Layar pembuka ala situs Awwwards setiap kali halaman dimuat penuh.
 * (Root layout hanya mount ulang saat full load, jadi navigasi
 * client-side antar halaman TIDAK memicu splash.)
 * Alur: logo memudar masuk → kata sapaan bergantian dalam topeng
 * (mask reveal) → tirai putih terangkat disusul tirai merah.
 * Murni CSS + state, basis putih. Dilewati total untuk
 * prefers-reduced-motion.
 */
export default function SplashScreen({ iconUrl }: { iconUrl?: string }) {
  const [phase, setPhase] = useState<'pending' | 'show' | 'leave' | 'done'>('pending');
  const [wordIdx, setWordIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let reduced = false;
    try {
      reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      reduced = false;
    }

    // Jangan tampilkan di dashboard/login & hanya sekali per sesi (hemat LCP).
    try {
      const p = window.location.pathname;
      if (p.startsWith('/dashboard') || p.startsWith('/login')) {
        setPhase('done');
        return;
      }
      if (sessionStorage.getItem('immsolo_splash_seen')) {
        setPhase('done');
        return;
      }
    } catch {
      // abaikan, lanjut tampil
    }

    if (reduced) {
      setPhase('done');
      return;
    }

    setPhase('show');

    // Kata sapaan bergantian.
    const wordTimer = setInterval(() => {
      setWordIdx((i) => (i + 1) % WORDS.length);
    }, WORD_MS);

    // Counter halus 0 → 100 selama fase tampil.
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / (SHOW_MS - CURTAIN_MS), 1);
      const eased = t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setProgress(Math.min(Math.floor(eased * 100), 100));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const t1 = setTimeout(() => {
      clearInterval(wordTimer);
      setPhase('leave');
    }, SHOW_MS);
    const t2 = setTimeout(() => {
      try {
        sessionStorage.setItem('immsolo_splash_seen', '1');
      } catch {
        // abaikan
      }
      setPhase('done');
    }, SHOW_MS + FADE_MS);
    return () => {
      clearInterval(wordTimer);
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (phase === 'pending' || phase === 'done') return null;

  const leaving = phase === 'leave';

  return (
    <div
      role="status"
      aria-label="Memuat website PC IMM Kota Surakarta"
      className={`fixed inset-0 z-[99999] ${leaving ? 'pointer-events-none' : ''}`}
    >
      {/* ── Tirai merah (di belakang, terangkat menyusul) ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[#c20000] transition-transform ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          transitionDuration: `${CURTAIN_MS}ms`,
          transitionDelay: leaving ? '130ms' : '0ms',
          transform: leaving ? 'translateY(-100%)' : 'translateY(0)',
        }}
      />

      {/* ── Watermark raksasa melayang ── */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none" aria-hidden="true">
        <div className="splash-marquee whitespace-nowrap w-max font-black uppercase leading-none text-[#0f172a]/[0.045]" style={{ fontFamily: 'var(--font-poppins), sans-serif', fontSize: 'clamp(10rem, 28vw, 24rem)' }}>
          {'IMM • '.repeat(6)}
        </div>
      </div>

      {/* ── Panel putih (konten + terangkat duluan) ── */}
      <div
        className="absolute inset-0 bg-white flex flex-col items-center justify-center overflow-hidden transition-transform ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          transitionDuration: `${CURTAIN_MS}ms`,
          transform: leaving ? 'translateY(-100%)' : 'translateY(0)',
        }}
      >
        {/* Logo hidup: mengapung + dot satelit mengorbit + glow */}
        <div
          className="animate-in zoom-in-95 duration-500 mb-10 relative flex items-center justify-center"
          aria-hidden="true"
        >
          {/* Glow lembut */}
          <div className="splash-glow absolute w-60 h-60 rounded-full bg-[#c20000]/15 blur-3xl" />
          {/* Orbit satelit */}
          <div className="splash-orbit absolute w-44 h-44">
            <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#c20000] shadow-[0_0_12px_rgba(194,0,0,0.9)]" />
            <span className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 rounded-full bg-[#f59e0b]" />
          </div>
          {/* Logo mengapung */}
          <div className="splash-float-soft relative w-28 h-28 rounded-3xl overflow-hidden bg-white border border-slate-100 shadow-[0_16px_45px_rgba(15,23,42,0.16)]">
            {iconUrl ? (
              <img src={iconUrl} alt="" width={112} height={112} className="w-full h-full object-contain" />
            ) : (
              <div
                className="w-full h-full bg-gradient-to-br from-[#c20000] to-[#7a0000] flex items-center justify-center text-white font-bold text-6xl"
                style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
              >
                I
              </div>
            )}
            <div className="splash-shine absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/60 to-transparent" aria-hidden="true" />
          </div>
        </div>

        {/* Kata sapaan bergantian dalam topeng */}
        <div className="w-full px-4" aria-live="polite" aria-atomic="true">
          <p className="sr-only">{WORDS[wordIdx]}</p>
          <div
            aria-hidden="true"
            className="relative overflow-hidden mx-auto text-center font-black uppercase whitespace-nowrap leading-[1.15]"
            style={{
              fontFamily: 'var(--font-poppins), sans-serif',
              fontSize: 'clamp(1.9rem, 8vw, 5.5rem)',
              letterSpacing: '0.02em',
              height: '1.2em',
              maxWidth: '100%',
            }}
          >
            {WORDS.map((w, i) => {
              const pos = i === wordIdx ? 'translateY(0)' : i < wordIdx ? 'translateY(-115%)' : 'translateY(115%)';
              return (
                <span
                  key={w}
                  className={`absolute inset-0 flex items-center justify-center transition-transform ${
                    i === wordIdx ? 'text-[#c20000]' : 'text-[#0f172a]'
                  }`}
                  style={{
                    transform: pos,
                    transitionDuration: '420ms',
                    transitionTimingFunction: EASE_EXPO,
                  }}
                >
                  {w}
                </span>
              );
            })}
          </div>
        </div>

        {/* Penghitung + bar tipis */}
        <div className="absolute bottom-10 left-0 w-full px-8 md:px-14 flex items-end justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
            Memuat Website
          </span>
          <span className="text-sm font-bold text-[#c20000] tabular-nums">{progress}%</span>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-[3px] bg-slate-100">
          <div
            className="h-full bg-[#c20000] transition-[width] duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
