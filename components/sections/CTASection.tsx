'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowRight, UserPlus, Sparkles, MessageCircle } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden bg-gradient-to-br from-[#c20000] via-[#ab0000] to-[#7a0000] text-white">
      {/* Background Decorative Rings & Ambient Glows */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 rounded-full bg-white/5 blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-96 h-96 rounded-full bg-black/15 blur-2xl pointer-events-none" />
      
      {/* Subtle Pattern Grid Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div data-aos="zoom-in" className="max-w-4xl mx-auto text-center">
          
          {/* Pill Badge Ajakan */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 text-xs sm:text-sm font-semibold tracking-wide text-white/95 shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Kaderisasi & Kolaborasi Pergerakan</span>
          </div>

          <h2 
            data-aos="fade-up" 
            data-aos-delay="100" 
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight tracking-tight" 
            style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
          >
            Mari Bergabung & Bergerak Bersama{' '}
            <span className="text-amber-300 drop-shadow-sm">Ikatan</span>
          </h2>
          
          <p 
            data-aos="fade-up" 
            data-aos-delay="200" 
            className="text-base sm:text-lg md:text-xl text-red-50/90 mb-10 max-w-2xl mx-auto leading-relaxed font-normal"
          >
            Jadilah bagian dari ikhtiar kolektif mahasiswa Islam dalam menegakkan nilai-nilai moralitas luhur, tradisi keilmuan kritis, dan kepedulian sosial di Kota Surakarta.
          </p>
          
          <div 
            data-aos="fade-up" 
            data-aos-delay="300" 
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button 
              size="lg" 
              className="w-full sm:w-auto h-12 px-8 bg-white hover:bg-slate-100 text-[#c20000] font-bold text-sm rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-102"
              asChild
            >
              <Link href="/kontak" className="inline-flex items-center justify-center gap-2">
                <MessageCircle className="w-4 h-4" />
                <span>Hubungi Kami</span>
              </Link>
            </Button>

            <Button 
              size="lg" 
              variant="outline" 
              className="w-full sm:w-auto h-12 px-8 border-white/30 text-white hover:bg-white/10 hover:text-white bg-transparent font-semibold text-sm rounded-xl backdrop-blur-md transition-all duration-300"
              asChild
            >
              <Link href="/struktural" className="inline-flex items-center justify-center gap-2">
                <span>Struktur Pimpinan Cabang</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          {/* Slogan Footer */}
          <p className="mt-10 text-xs text-red-100/70 font-mono tracking-widest uppercase">
            Fastabiqul Khairat • PC IMM Kota Surakarta
          </p>
        </div>
      </div>
    </section>
  );
}
