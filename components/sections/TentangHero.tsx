'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';

export default function TentangHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0f172a]">
      
      {/* Full-screen Dummy Background Image matching Home page */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/images/imm_hero_bg.jpg" 
          alt="PC IMM Surakarta Background" 
          fill
          priority
          className="object-cover object-center opacity-50 scale-105 motion-safe:animate-[slowZoom_20s_ease-in-out_infinite_alternate]"
        />
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px]"></div>
      </div>
      
      <div className="max-w-5xl mx-auto px-4 md:px-6 z-10 relative w-full pt-20 text-center flex flex-col items-center">
        
        {/* Pulsing Badge matching Home page */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-white/20 bg-white/5 backdrop-blur-md"
        >
          <span className="w-2 h-2 rounded-full bg-[#c20000] animate-pulse"></span>
          <span className="text-white font-bold text-base tracking-wide" style={{ fontFamily: 'var(--font-el-messiri), sans-serif' }}>Profil Organisasi</span>
        </motion.div>
        
        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-white leading-tight" 
          style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
        >
          Mengenal Lebih Dekat <br className="hidden md:block" /> 
          <span className="text-[#c20000]">IMM Kota Surakarta</span>
        </motion.h1>
        
        {/* Hero Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-lg md:text-xl text-white/80 mb-10 leading-relaxed font-light max-w-3xl mx-auto"
        >
          Ikatan Mahasiswa Muhammadiyah (IMM) adalah gerakan mahasiswa Islam, sekaligus organisasi otonom Muhammadiyah. Kami adalah episentrum pergerakan dan pemikiran progresif di kota budaya.
        </motion.p>

      </div>

      {/* Decorative Bottom Line matching Home page */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent z-10"></div>
    </section>
  );
}
