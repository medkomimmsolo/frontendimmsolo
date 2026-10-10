'use client';

import { Users, BookOpen, Heart, ArrowRight, Quote, Compass, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

type StatsProps = {
  stats?: {
    stat_kader?: string;
    stat_komisariat?: string;
    stat_lembaga?: string;
    stat_universitas?: string;
  };
};

export default function AboutPreview({ stats }: StatsProps) {
  return (
    <section className="py-20 md:py-28 bg-white relative overflow-hidden">
      {/* Background soft ambient accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#c20000]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-0 w-80 h-80 bg-slate-100/80 rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Heading */}
        <div className="mb-14 md:mb-20 max-w-3xl">
          <div data-aos="fade-up" className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-[#c20000] border border-red-100 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Identitas Pergerakan
            </span>
          </div>
          <h2 
            data-aos="fade-up"
            data-aos-delay="100"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0f172a] leading-tight mb-5 tracking-tight"
            style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
          >
            Membangun Peradaban Melalui{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c20000] to-[#8a0000]">
              Tri Kompetensi
            </span>
          </h2>
          <p data-aos="fade-up" data-aos-delay="200" className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-2xl">
            Ikatan Mahasiswa Muhammadiyah (IMM) bergerak dengan tiga pilar utama yang tak terpisahkan, membentuk kader yang seimbang antara spiritualitas, intelektualitas, dan aksi kemanusiaan.
          </p>
        </div>

        {/* Bento Grid Layout Modern & Selaras */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 auto-rows-[minmax(280px,auto)]">
          
          {/* Card 1: Religiusitas (Spans 2 columns on tablet+) */}
          <div 
            data-aos="fade-up" 
            className="md:col-span-2 relative rounded-2xl overflow-hidden group bg-gradient-to-br from-white via-red-50/20 to-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-red-200 transition-all duration-500"
          >
            <div className="relative h-full p-8 md:p-12 flex flex-col justify-between z-10">
              <div className="w-14 h-14 rounded-xl bg-white shadow-md flex items-center justify-center text-[#c20000] mb-8 border border-slate-100 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                <Heart className="w-7 h-7 fill-[#c20000]/10" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#c20000] mb-2 block">
                  Pilar Utama 01
                </span>
                <h3 
                  className="text-2xl sm:text-3xl font-bold text-[#0f172a] mb-3" 
                  style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
                >
                  Religiusitas
                </h3>
                <p className="text-slate-600 text-base sm:text-lg max-w-xl leading-relaxed">
                  Menjadikan nilai-nilai murni keislaman sebagai landasan utama dalam setiap tarikan napas, alam pikiran, dan orientasi langkah perjuangan kader.
                </p>
              </div>
              {/* Watermark Icon */}
              <div className="absolute bottom-0 right-0 p-8 opacity-[0.03] text-[#c20000] pointer-events-none transform translate-x-1/4 translate-y-1/4 group-hover:scale-105 transition-transform duration-700">
                <Heart className="w-64 h-64" />
              </div>
            </div>
          </div>

          {/* Card 2: Quote Card Fastabiqul Khairat */}
          <div 
            data-aos="fade-up" 
            data-aos-delay="100" 
            className="relative rounded-2xl bg-gradient-to-br from-[#c20000] to-[#990000] text-white p-8 md:p-10 flex flex-col justify-between overflow-hidden shadow-lg shadow-red-950/20 group"
          >
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
            <Quote className="w-10 h-10 text-white/40 mb-6 relative z-10" />
            <p 
              className="text-lg sm:text-xl font-medium leading-snug relative z-10 italic" 
              style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
            >
              &ldquo;Menjadi cendekiawan berpribadi adalah tujuan hakiki dari setiap langkah perjuangan kader Ikatan.&rdquo;
            </p>
            <div className="pt-6 border-t border-white/20 mt-6 relative z-10 flex items-center justify-between text-xs text-white/80 font-medium">
              <span>Falsafah Pergerakan</span>
              <span className="font-mono uppercase font-bold tracking-wider text-red-200">IMM Solo</span>
            </div>
          </div>

          {/* Card 3: Intelektualitas */}
          <div 
            data-aos="fade-up" 
            data-aos-delay="150" 
            className="relative rounded-2xl bg-white border border-slate-200/90 p-8 md:p-10 shadow-sm hover:shadow-xl hover:border-red-200 transition-all duration-500 group overflow-hidden"
          >
            <div className="w-14 h-14 rounded-xl bg-slate-50 flex items-center justify-center text-slate-800 mb-6 group-hover:bg-red-50 group-hover:text-[#c20000] transition-colors duration-300 border border-slate-100">
              <BookOpen className="w-7 h-7" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#c20000] mb-2 block">
              Pilar Utama 02
            </span>
            <h3 
              className="text-xl sm:text-2xl font-bold text-[#0f172a] mb-3"
              style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
            >
              Intelektualitas
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Menjunjung tradisi keilmuan yang kokoh, berfikir kritis, objektif, dan solutif dalam merespon berbagai dinamika zaman.
            </p>
          </div>

          {/* Card 4: Humanitas */}
          <div 
            data-aos="fade-up" 
            data-aos-delay="200" 
            className="relative rounded-2xl bg-white border border-slate-200/90 p-8 md:p-10 shadow-sm hover:shadow-xl hover:border-red-200 transition-all duration-500 group overflow-hidden"
          >
            <div className="w-14 h-14 rounded-xl bg-slate-50 flex items-center justify-center text-slate-800 mb-6 group-hover:bg-red-50 group-hover:text-[#c20000] transition-colors duration-300 border border-slate-100">
              <Users className="w-7 h-7" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#c20000] mb-2 block">
              Pilar Utama 03
            </span>
            <h3 
              className="text-xl sm:text-2xl font-bold text-[#0f172a] mb-3"
              style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
            >
              Humanitas
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Kepekaan dan kepedulian sosial yang termanifestasi melalui aksi nyata pendampingan dan pemberdayaan masyarakat luas.
            </p>
          </div>

          {/* Card 5: Eksplorasi Profil */}
          <div 
            data-aos="fade-up" 
            data-aos-delay="250" 
            className="relative rounded-2xl bg-[#0f172a] text-white p-8 md:p-10 shadow-xl group overflow-hidden flex flex-col justify-between min-h-[280px]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-[#0a0f1a]" />
            <Compass className="absolute top-6 right-6 w-28 h-28 text-white/5 group-hover:rotate-45 group-hover:scale-110 transition-transform duration-700 ease-out pointer-events-none" />
            
            <div className="relative z-10">
              <span className="text-xs font-mono font-bold tracking-wider text-red-400 uppercase mb-2 block">
                Mengenal IMM
              </span>
              <h3 
                className="text-xl sm:text-2xl font-bold mb-2 tracking-tight"
                style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
              >
                Eksplorasi Pergerakan
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Pelajari lebih dalam sejarah pendirian 1964, visi-misi, serta susunan pimpinan cabang IMM Kota Surakarta.
              </p>
            </div>

            <div className="relative z-10 mt-6 pt-4 border-t border-slate-800">
              <Link 
                href="/tentang" 
                className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs sm:text-sm transition-colors group/btn shadow-sm"
              >
                <span>Lihat Profil Lengkap</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
