'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface SplashScreenProps {
  iconUrl?: string;
}

export default function SplashScreen({ iconUrl }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [imgFailed, setImgFailed] = useState(false);

  // References for GSAP targets
  const containerRef = useRef<HTMLDivElement>(null);
  const redCurtainRef = useRef<HTMLDivElement>(null);
  const whitePanelRef = useRef<HTMLDivElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const logoWrapperRef = useRef<HTMLDivElement>(null);
  const ring1Ref = useRef<SVGSVGElement>(null);
  const ring2Ref = useRef<SVGSVGElement>(null);
  const glowOrbRef = useRef<HTMLDivElement>(null);
  
  const word1Ref = useRef<HTMLDivElement>(null);
  const word2Ref = useRef<HTMLDivElement>(null);
  const word3Ref = useRef<HTMLDivElement>(null);
  
  const badgeRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const counterNumberRef = useRef<HTMLSpanElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const watermarkRef = useRef<HTMLDivElement>(null);
  const statusTextRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // 1. Cek rute: lewati di dashboard dan login
    const pathname = window.location.pathname;
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/login')) {
      setIsVisible(false);
      return;
    }

    // 2. Cek prefers-reduced-motion
    let reduced = false;
    try {
      reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      reduced = false;
    }

    if (reduced) {
      setIsVisible(false);
      return;
    }

    // Kunci scroll halaman selama loading aktif
    document.body.style.overflow = 'hidden';

    let safetyTimeoutId: NodeJS.Timeout | null = null;
    let isWindowLoaded = typeof document !== 'undefined' && document.readyState === 'complete';
    const handleWindowLoad = () => {
      isWindowLoaded = true;
    };
    if (!isWindowLoaded) {
      window.addEventListener('load', handleWindowLoad, { once: true });
    }

    const ctx = gsap.context(() => {
      // Set initial states secara eksplisit untuk mencegah FOUC & teks bertumpuk
      gsap.set([word1Ref.current, word2Ref.current, word3Ref.current], {
        opacity: 0,
        yPercent: 120,
        visibility: 'hidden',
      });
      gsap.set(logoWrapperRef.current, {
        scale: 0.45,
        opacity: 0,
        y: 20,
      });
      gsap.set(badgeRef.current, {
        opacity: 0,
        y: -18,
      });
      gsap.set(taglineRef.current, {
        opacity: 0,
        y: 12,
      });
      gsap.set(glowOrbRef.current, {
        scale: 0.5,
        opacity: 0,
      });

      // Rotasi kontinu untuk cincin orbit dekoratif
      gsap.to(ring1Ref.current, {
        rotation: 360,
        duration: 14,
        repeat: -1,
        ease: 'none',
      });
      gsap.to(ring2Ref.current, {
        rotation: -360,
        duration: 20,
        repeat: -1,
        ease: 'none',
      });

      // Watermark marquee geser pelan
      gsap.to(watermarkRef.current, {
        xPercent: -20,
        duration: 10,
        repeat: -1,
        ease: 'none',
      });

      // ── Main Sequence Timeline ──
      const introTl = gsap.timeline();

      // Step A: Logo & Header Entrance (0.0s - 0.7s)
      introTl
        .to(glowOrbRef.current, {
          scale: 1,
          opacity: 0.75,
          duration: 1.0,
          ease: 'power2.out',
        }, 0)
        .to(badgeRef.current, {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power3.out',
        }, 0.1)
        .to(logoWrapperRef.current, {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: 'back.out(1.8)',
        }, 0.15);

      // Step B: Sapaan Bergantian Tanpa Overlap (Disiplin Visibility & Position)
      // Kata 1: ASSALAMUALAIKUM (0.35s - 1.2s)
      introTl
        .set(word1Ref.current, { visibility: 'visible' }, 0.35)
        .to(word1Ref.current, {
          yPercent: 0,
          opacity: 1,
          duration: 0.45,
          ease: 'power3.out',
        }, 0.35)
        .to(word1Ref.current, {
          yPercent: -120,
          opacity: 0,
          duration: 0.35,
          ease: 'power3.in',
        }, 1.05)
        .set(word1Ref.current, { visibility: 'hidden' }, 1.4);

      // Kata 2: FASTABIQUL KHAIRAT (1.4s - 2.25s)
      introTl
        .set(word2Ref.current, { visibility: 'visible', yPercent: 120, opacity: 0 }, 1.4)
        .to(word2Ref.current, {
          yPercent: 0,
          opacity: 1,
          duration: 0.45,
          ease: 'power3.out',
        }, 1.4)
        .to(word2Ref.current, {
          yPercent: -120,
          opacity: 0,
          duration: 0.35,
          ease: 'power3.in',
        }, 2.05)
        .set(word2Ref.current, { visibility: 'hidden' }, 2.4);

      // Kata 3: IMM KOTA SURAKARTA (2.4s+)
      introTl
        .set(word3Ref.current, { visibility: 'visible', yPercent: 120, opacity: 0 }, 2.4)
        .to(word3Ref.current, {
          yPercent: 0,
          opacity: 1,
          duration: 0.55,
          ease: 'power4.out',
        }, 2.4)
        .to(taglineRef.current, {
          y: 0,
          opacity: 1,
          duration: 0.55,
          ease: 'power3.out',
        }, 2.6);

      // ── Step C: Smart Progress Buffer & Delay Controller ──
      const progressObj = { val: 0 };
      const updateUI = (val: number) => {
        const current = Math.round(val);
        if (counterNumberRef.current) {
          counterNumberRef.current.textContent = current.toString().padStart(2, '0');
        }
        if (progressBarRef.current) {
          progressBarRef.current.style.transform = `scaleX(${current / 100})`;
        }

        // Status update kontekstual
        if (statusTextRef.current) {
          if (current < 35) {
            statusTextRef.current.textContent = 'Menghubungkan ke Portal...';
          } else if (current < 70) {
            statusTextRef.current.textContent = 'Memuat Data & Publikasi...';
          } else if (current < 95) {
            statusTextRef.current.textContent = 'Menyiapkan Tampilan Halaman...';
          } else {
            statusTextRef.current.textContent = 'Halaman Siap • Fastabiqul Khairat';
          }
        }
      };

      // Fase 1: 0% -> 92% selama 2.4 detik (memberi waktu persiapan render DOM & data)
      gsap.to(progressObj, {
        val: 92,
        duration: 2.4,
        ease: 'power2.out',
        onUpdate: () => updateUI(progressObj.val),
        onComplete: () => {
          // Fase 2: Verifikasi apakah dokumen dan request utama telah selesai
          const completeAndExit = () => {
            gsap.to(progressObj, {
              val: 100,
              duration: 0.4,
              ease: 'power1.out',
              onUpdate: () => updateUI(progressObj.val),
              onComplete: () => {
                // Jeda 250ms pada 100% sebelum transisi tirai terangkat
                gsap.delayedCall(0.25, triggerExit);
              },
            });
          };

          if (isWindowLoaded) {
            completeAndExit();
          } else {
            safetyTimeoutId = setTimeout(() => {
              completeAndExit();
            }, 1000);

            window.addEventListener('load', () => {
              if (safetyTimeoutId) clearTimeout(safetyTimeoutId);
              completeAndExit();
            }, { once: true });
          }
        },
      });

      // ── Step D: Exit Curtain Sequence ──
      const triggerExit = () => {
        const exitTl = gsap.timeline({
          onComplete: () => {
            document.body.style.overflow = '';
            setIsVisible(false);
          },
        });

        exitTl
          .to(contentWrapperRef.current, {
            y: -30,
            opacity: 0,
            scale: 0.96,
            duration: 0.45,
            ease: 'power3.in',
          })
          .to(whitePanelRef.current, {
            yPercent: -100,
            duration: 0.85,
            ease: 'power4.inOut',
          }, '-=0.1')
          .to(redCurtainRef.current, {
            yPercent: -100,
            duration: 0.9,
            ease: 'power4.inOut',
          }, '-=0.75');
      };
    }, containerRef);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('load', handleWindowLoad);
      if (safetyTimeoutId) clearTimeout(safetyTimeoutId);
      ctx.revert();
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      ref={containerRef}
      role="status"
      aria-label="Memuat website PC IMM Kota Surakarta"
      className="fixed inset-0 z-[999999] overflow-hidden select-none"
    >
      {/* ── Lapisan 1: Tirai Merah Marun (Belakang) ── */}
      <div
        ref={redCurtainRef}
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-[#c20000] via-[#ab0000] to-[#7f0000] will-change-transform"
      />

      {/* ── Lapisan 2: Panel Utama Putih Bersih ── */}
      <div
        ref={whitePanelRef}
        className="absolute inset-0 bg-white flex flex-col justify-between overflow-hidden will-change-transform"
      >
        {/* Subtle Background Radial Grid Accent */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(#0f172a_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.035] pointer-events-none"
        />

        {/* Ambient Glowing Orb */}
        <div
          ref={glowOrbRef}
          aria-hidden="true"
          style={{ opacity: 0 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full bg-gradient-to-tr from-red-100/60 via-amber-100/40 to-transparent blur-3xl pointer-events-none"
        />

        {/* Watermark Tipografi Raksasa di Latar Belakang */}
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none opacity-[0.025]"
        >
          <div
            ref={watermarkRef}
            className="whitespace-nowrap font-black uppercase text-[#0f172a] will-change-transform"
            style={{
              fontFamily: 'var(--font-poppins), sans-serif',
              fontSize: 'clamp(8rem, 22vw, 20rem)',
            }}
          >
            {'IMM SURAKARTA • FASTABIQUL KHAIRAT • '.repeat(4)}
          </div>
        </div>

        {/* ── HEADER STATUS TOP ── */}
        <header className="relative z-10 w-full px-6 sm:px-12 pt-8 flex items-center justify-between">
          <div
            ref={badgeRef}
            style={{ opacity: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200/90 shadow-2xs"
          >
            <span className="w-2 h-2 rounded-full bg-[#c20000] animate-pulse" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-slate-700">
              PC IMM KOTA SURAKARTA
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono font-semibold text-slate-400">
            <span>BERDIRI 1964</span>
            <span>•</span>
            <span className="text-[#c20000]">SOLO</span>
          </div>
        </header>

        {/* ── CENTER CONTENT WRAPPER ── */}
        <main
          ref={contentWrapperRef}
          className="relative z-10 flex flex-col items-center justify-center text-center px-4 my-auto will-change-transform"
        >
          {/* Logo Emblem dengan Cincin Orbit Berputar */}
          <div className="relative mb-8 sm:mb-10 flex items-center justify-center">
            {/* Cincin Orbit 1 (Dashed Gold/Red) */}
            <svg
              ref={ring1Ref}
              className="absolute w-40 h-40 sm:w-48 sm:h-48 text-[#c20000]/25 pointer-events-none will-change-transform"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeDasharray="4 6"
              />
            </svg>

            {/* Cincin Orbit 2 (Solid Tipis dengan Titik Aksen) */}
            <svg
              ref={ring2Ref}
              className="absolute w-48 h-48 sm:w-56 sm:h-56 text-slate-300 pointer-events-none will-change-transform"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="48"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.8"
                strokeDasharray="1 8"
              />
              <circle cx="50" cy="2" r="2.5" fill="#c20000" />
              <circle cx="50" cy="98" r="2" fill="#d97706" />
            </svg>

            {/* Emblem Kartu Logo */}
            <div
              ref={logoWrapperRef}
              style={{ opacity: 0 }}
              className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white shadow-[0_20px_50px_rgba(194,0,0,0.14)] border border-slate-100 flex items-center justify-center p-3.5 transition-all overflow-hidden will-change-transform"
            >
              {!imgFailed && iconUrl ? (
                <img
                  src={iconUrl}
                  alt="Logo PC IMM Kota Surakarta"
                  width={112}
                  height={112}
                  onError={() => setImgFailed(true)}
                  className="w-full h-full object-contain filter drop-shadow-sm"
                />
              ) : (
                <div
                  className="w-full h-full rounded-2xl bg-gradient-to-br from-[#c20000] to-[#8a0000] flex items-center justify-center text-white font-black text-4xl sm:text-5xl shadow-inner"
                  style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
                >
                  IMM
                </div>
              )}

              {/* Efek kilau sweep melintas */}
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-[splash-stripe_2.2s_ease-in-out_infinite] pointer-events-none"
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Sapaan Teks Masking (Words Transition) - Tanpa Overlap */}
          <div className="relative w-full max-w-2xl h-16 sm:h-20 overflow-hidden flex items-center justify-center pointer-events-none">
            {/* Word 1: ASSALAMUALAIKUM */}
            <div
              ref={word1Ref}
              className="absolute inset-0 flex items-center justify-center font-extrabold text-[#0f172a] tracking-tight will-change-transform"
              style={{
                fontFamily: 'var(--font-poppins), sans-serif',
                fontSize: 'clamp(1.75rem, 6vw, 3.75rem)',
                opacity: 0,
                visibility: 'hidden',
              }}
            >
              ASSALAMUALAIKUM
            </div>

            {/* Word 2: FASTABIQUL KHAIRAT */}
            <div
              ref={word2Ref}
              className="absolute inset-0 flex items-center justify-center font-extrabold text-[#c20000] tracking-tight will-change-transform"
              style={{
                fontFamily: 'var(--font-poppins), sans-serif',
                fontSize: 'clamp(1.5rem, 5.5vw, 3.5rem)',
                opacity: 0,
                visibility: 'hidden',
              }}
            >
              FASTABIQUL KHAIRAT
            </div>

            {/* Word 3: IMM KOTA SURAKARTA */}
            <div
              ref={word3Ref}
              className="absolute inset-0 flex items-center justify-center font-extrabold tracking-tight will-change-transform"
              style={{
                fontFamily: 'var(--font-poppins), sans-serif',
                fontSize: 'clamp(1.4rem, 5vw, 3.25rem)',
                opacity: 0,
                visibility: 'hidden',
              }}
            >
              <span className="text-[#c20000]">IMM</span>&nbsp;
              <span className="text-[#0f172a]">KOTA SURAKARTA</span>
            </div>
          </div>

          {/* Tagline / Visi Moral */}
          <p
            ref={taglineRef}
            style={{ opacity: 0 }}
            className="mt-4 text-xs sm:text-sm font-semibold uppercase text-slate-500 font-sans tracking-[0.12em] max-w-md mx-auto"
          >
            Anggun dalam Moral, Unggul dalam Intelektual
          </p>
        </main>

        {/* ── FOOTER PROGRESS & COUNTER BOTTOM ── */}
        <footer className="relative z-10 w-full px-6 sm:px-12 pb-8">
          <div className="flex items-end justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c20000] animate-ping" />
              <span
                ref={statusTextRef}
                className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400"
              >
                Menghubungkan ke Portal...
              </span>
            </div>

            <div className="flex items-baseline gap-1">
              <span
                ref={counterNumberRef}
                className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tabular-nums tracking-tighter"
                style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
              >
                00
              </span>
              <span className="text-sm font-bold text-[#c20000]">%</span>
            </div>
          </div>

          {/* Slim Progress Bar Track */}
          <div className="relative w-full h-[3px] sm:h-[4px] bg-slate-100 rounded-full overflow-hidden">
            <div
              ref={progressBarRef}
              className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-[#c20000] via-[#e11d48] to-[#c20000] origin-left will-change-transform"
              style={{ transform: 'scaleX(0)' }}
            />
          </div>
        </footer>
      </div>
    </div>
  );
}
