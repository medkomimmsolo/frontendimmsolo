'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePathname } from 'next/navigation';

const smoothEase: [number, number, number, number] = [0.16, 1, 0.3, 1];
const slowEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function SplashScreen({ iconUrl }: { iconUrl?: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  
  const pathname = usePathname();
  const isInitialLoad = useRef(true);

  // Intercept all internal link clicks to show the splash screen IMMEDIATELY
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a');
      
      if (
        anchor && 
        anchor.href && 
        anchor.href.startsWith(window.location.origin) && 
        anchor.target !== '_blank' &&
        !e.ctrlKey && 
        !e.metaKey
      ) {
        const currentUrl = new URL(window.location.href);
        const targetUrl = new URL(anchor.href);
        
        // If navigating to a different page
        if (currentUrl.pathname !== targetUrl.pathname) {
          setIsLoading(true);
          setProgress(15); // Start progress slightly to show activity
        }
      }
    };

    document.addEventListener('click', handleDocumentClick, true);
    return () => document.removeEventListener('click', handleDocumentClick, true);
  }, []);

  // Handle the progress animation and hiding logic
  useEffect(() => {
    setIsLoading(true);
    const isFirst = isInitialLoad.current;
    if (isFirst) {
      isInitialLoad.current = false;
      setProgress(0);
    }

    // Set durations: faster for route changes so it's not annoying
    const counterDuration = isFirst ? 2800 : 800;
    const hideDelay = isFirst ? 4200 : 1200;

    const interval = 30;
    const steps = counterDuration / interval;
    let currentStep = 0;

    const counterInterval = setInterval(() => {
      currentStep++;
      const t = currentStep / steps;
      const easeOutExpo = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      const newProgress = Math.min(Math.floor(easeOutExpo * 100), 100);
      setProgress(newProgress);
      
      if (currentStep >= steps) {
        setProgress(100);
        clearInterval(counterInterval);
      }
    }, interval);

    const hideTimer = setTimeout(() => {
      setIsLoading(false);
    }, hideDelay);

    return () => {
      clearInterval(counterInterval);
      clearTimeout(hideTimer);
    };
  }, [pathname]);

  const imageSource = iconUrl 
    ? (iconUrl.startsWith('http') ? iconUrl : `${iconUrl}`) 
    : '';

  const letters = Array.from("PC IMM KOTA SURAKARTA");
  const particles = Array.from({ length: 20 });

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white overflow-hidden"
          exit={{ opacity: 0, filter: "blur(20px)", scale: 1.1 }}
          transition={{ duration: 1.2, ease: smoothEase }}
        >
          {/* ----- COMPLEX BACKGROUND LAYER ----- */}
          
          {/* 1. Massive Scrolling Outline Typography */}
          <div className="absolute inset-0 flex flex-col justify-between overflow-hidden pointer-events-none opacity-[0.03] z-0 select-none">
            <motion.div 
              initial={{ x: "0%" }}
              animate={{ x: "-50%" }}
              transition={{ duration: 20, ease: "linear", repeat: Infinity }}
              className="whitespace-nowrap mt-10"
            >
              <h1 className="text-[15rem] font-black uppercase tracking-tighter text-[#0f172a]" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
                IKATAN MAHASISWA MUHAMMADIYAH IKATAN MAHASISWA MUHAMMADIYAH
              </h1>
            </motion.div>
            <motion.div 
              initial={{ x: "-50%" }}
              animate={{ x: "0%" }}
              transition={{ duration: 20, ease: "linear", repeat: Infinity }}
              className="whitespace-nowrap mb-10"
            >
              <h1 className="text-[15rem] font-black uppercase tracking-tighter text-transparent" style={{ WebkitTextStroke: '4px #c20000', fontFamily: 'var(--font-inter), sans-serif' }}>
                KOTA SURAKARTA KOTA SURAKARTA KOTA SURAKARTA
              </h1>
            </motion.div>
          </div>

          {/* 2. Floating Tech Particles */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            {particles.map((_, i) => (
              <motion.div
                key={`particle-${i}`}
                initial={{ 
                  x: `${(i * 17) % 100}vw`, 
                  y: `${(i * 23) % 100}vh`,
                  scale: 0,
                  opacity: 0
                }}
                animate={{ 
                  y: [`${(i * 23) % 100}vh`, `${((i * 23) % 100) - 20}vh`],
                  scale: [0, ((i * 7) % 15) / 10 + 0.5, 0],
                  opacity: [0, ((i * 11) % 5) / 10 + 0.2, 0]
                }}
                transition={{ 
                  duration: ((i * 13) % 3) + 2, 
                  repeat: Infinity, 
                  delay: ((i * 19) % 20) / 10,
                  ease: "easeInOut"
                }}
                className={`absolute rounded-full ${i % 3 === 0 ? 'bg-[#c20000]' : 'bg-slate-300'} w-2 h-2`}
              />
            ))}
          </div>

          {/* 3. Complex Concentric Rings */}
          <motion.div 
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: 1, rotate: 180 }}
            transition={{ duration: 4, ease: smoothEase }}
            className="absolute border border-dashed border-[#c20000]/20 rounded-full w-[800px] h-[800px] z-0"
          />
          <motion.div 
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: 1, rotate: -180 }}
            transition={{ duration: 4, ease: smoothEase, delay: 0.2 }}
            className="absolute border border-slate-200 rounded-full w-[600px] h-[600px] z-0"
          >
            {/* Crosshairs inside ring */}
            <div className="absolute top-0 left-1/2 w-px h-8 bg-[#c20000]/30 -translate-x-1/2"></div>
            <div className="absolute bottom-0 left-1/2 w-px h-8 bg-[#c20000]/30 -translate-x-1/2"></div>
            <div className="absolute left-0 top-1/2 h-px w-8 bg-[#c20000]/30 -translate-y-1/2"></div>
            <div className="absolute right-0 top-1/2 h-px w-8 bg-[#c20000]/30 -translate-y-1/2"></div>
          </motion.div>

          {/* ----- MAIN CONTENT SEQUENCE ----- */}
          <div className="relative z-20 flex flex-col items-center justify-center">
            
            {/* Multi-layered Morphing Logo Reveal */}
            <div className="relative flex items-center justify-center w-40 h-40">
              {/* Layer 1: Background rotated square */}
              <motion.div 
                initial={{ scale: 0, rotate: 45, borderRadius: "100%" }}
                animate={{ scale: 1, rotate: 135, borderRadius: "24px" }}
                transition={{ duration: 1.5, delay: 0.2, ease: smoothEase }}
                className="absolute inset-0 bg-[#c20000]/5 border border-[#c20000]/20"
              />
              
              {/* Layer 2: Main white box */}
              <motion.div
                initial={{ scale: 0, rotate: -45, borderRadius: "100%" }}
                animate={{ scale: 1, rotate: 0, borderRadius: "32px" }}
                transition={{ duration: 1.5, delay: 0.4, ease: smoothEase }}
                className="absolute inset-0 bg-white shadow-[0_30px_60px_rgba(194,0,0,0.15)] border border-slate-100 flex items-center justify-center overflow-hidden"
              >
                {/* Logo Image */}
                {imageSource ? (
                  <motion.img 
                    initial={{ opacity: 0, scale: 0, filter: "blur(10px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    transition={{ duration: 1, delay: 1.2, ease: smoothEase }}
                    src={imageSource} 
                    alt="Loading Icon" 
                    className="w-24 h-24 md:w-28 md:h-28 object-contain filter drop-shadow-xl relative z-10"
                  />
                ) : (
                  <motion.span 
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 1.2, ease: smoothEase }}
                    className="text-5xl font-black text-[#c20000] relative z-10"
                  >
                    IMM
                  </motion.span>
                )}

                {/* Shimmer inside white box */}
                <motion.div 
                  initial={{ x: '-150%', skewX: -20 }}
                  animate={{ x: '150%' }}
                  transition={{ duration: 2, delay: 1.5, repeat: Infinity, repeatDelay: 1 }}
                  className="absolute inset-0 w-16 bg-gradient-to-r from-transparent via-[#c20000]/10 to-transparent z-20"
                />
              </motion.div>
            </div>

            {/* Typography Section */}
            <div className="mt-12 flex overflow-hidden px-4">
              {letters.map((char, i) => (
                <motion.h1
                  key={i}
                  initial={{ y: 80, opacity: 0, scale: 0.5 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{ 
                    duration: 1, 
                    delay: 1.6 + (i * 0.04),
                    ease: smoothEase
                  }}
                  className="text-2xl md:text-4xl font-bold text-[#c20000]"
                  style={{ 
                    fontFamily: 'var(--font-el-messiri), serif', 
                    width: char === " " ? "0.4em" : "auto"
                  }}
                >
                  {char}
                </motion.h1>
              ))}
            </div>
            
            {/* Tech Loading Interface */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 2, ease: smoothEase }}
              className="mt-8 flex flex-col items-center w-64 md:w-80"
            >
              {/* Progress Bar Container */}
              <div className="w-full flex items-center justify-between mb-2 px-1">
                <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Initializing</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-black text-[#c20000]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
                    {progress}%
                  </p>
                </div>
              </div>
              
              {/* Progress Line */}
              <div className="w-full h-[2px] bg-slate-100 rounded-full overflow-hidden relative">
                <motion.div 
                  className="absolute top-0 left-0 h-full bg-[#c20000] shadow-[0_0_15px_#c20000]"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1, ease: "linear" }}
                />
                {/* Scanning pulse */}
                <motion.div 
                  initial={{ left: "-100%", width: "50%" }}
                  animate={{ left: "100%" }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                  className="absolute top-0 h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-50"
                />
              </div>

              {/* Status Slogan */}
              <p className="mt-4 text-[#0f172a]/60 font-medium tracking-[0.3em] uppercase text-[9px] md:text-[10px]">
                Membangun Peradaban
              </p>
            </motion.div>
          </div>
          
        </motion.div>
      )}
    </AnimatePresence>
  );
}
