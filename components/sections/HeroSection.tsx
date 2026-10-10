'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { ArrowRight, MapPin, Clock, CalendarDays, Sparkles } from 'lucide-react';

type HeroProps = {
  stats?: {
    stat_kader?: string;
    stat_komisariat?: string;
    stat_lembaga?: string;
    stat_universitas?: string;
  };
  events?: any[];
};

export default function HeroSection({ stats, events = [] }: HeroProps) {
  const displayEvents = events.slice(0, 3);

  return (
    <section className="relative w-full min-h-[100dvh] lg:min-h-0 lg:h-[100dvh] flex items-center justify-center overflow-hidden bg-[#0a0f1a]">
      {/* Background with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/images/imm_hero_bg.jpg" 
          alt="PC IMM Surakarta Background"
          fill
          priority
          className="object-cover object-center opacity-35 filter brightness-90"
        />
        {/* Multi-layered Dark Gradient for maximum text readability & elegance */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f1a] via-[#0f172a]/90 to-[#0a0f1a]/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a] via-transparent to-[#0a0f1a]/80" />
        {/* Subtle Maroon Ambient Glow */}
        <div className="absolute top-1/3 left-10 w-96 h-96 bg-[#c20000]/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 relative w-full pt-28 pb-16 lg:py-0 flex flex-col justify-center h-full">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-14 h-full lg:max-h-[82vh]">
          
          {/* Kolom Kiri: Hero Content */}
          <div className="lg:w-7/12 xl:w-3/5 flex flex-col items-center text-center lg:items-start lg:text-left shrink-0">
            {/* Pill Badge Resmi */}
            <div
              data-aos="fade-down"
              className="inline-flex items-center gap-2.5 px-4 py-1.5 mb-8 rounded-full border border-white/10 bg-white/5 backdrop-blur-md shadow-lg"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff3333] shadow-[0_0_10px_rgba(255,51,51,0.8)] animate-pulse" />
              <span 
                className="text-white/90 font-bold text-xs sm:text-sm tracking-widest uppercase" 
                style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
              >
                Website Resmi
              </span>
            </div>

            {/* Heading Utama Asli: PC IMM Kota Surakarta */}
            <h1
              data-aos="fade-up"
              data-aos-delay="100"
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-6 text-white leading-[1.15]"
              style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
            >
              PC IMM<br />
              <span className="text-[#c20000]">Kota Surakarta</span>
            </h1>

            {/* Deskripsi Teks Asli */}
            <p
              data-aos="fade-up"
              data-aos-delay="200"
              className="text-base sm:text-lg lg:text-xl text-white/70 mb-10 leading-relaxed font-light max-w-xl"
            >
              Wadah perjuangan mahasiswa Muhammadiyah untuk membentuk akademisi Islam yang berakhlak mulia demi terwujudnya tujuan persyarikatan.
            </p>

            {/* Tombol Aksi Teks Asli */}
            <div
              data-aos="fade-up"
              data-aos-delay="300"
              className="flex flex-wrap items-center justify-center lg:justify-start gap-4 w-full"
            >
              <Button asChild size="lg" className="bg-[#c20000] hover:bg-[#a30000] text-white shadow-lg shadow-red-900/30 border-none rounded-full px-8 transition-all duration-300 hover:scale-105 font-semibold">
                <Link href="/kontak">Hubungi Kami</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 hover:text-white bg-transparent rounded-full px-8 backdrop-blur-md transition-all duration-300 font-semibold">
                <Link href="/tentang">Pelajari Lebih Lanjut</Link>
              </Button>
            </div>
          </div>

          {/* Kolom Kanan: Panel Agenda Mendatang */}
          <div 
            data-aos="fade-left"
            data-aos-delay="400"
            className="lg:w-5/12 xl:w-2/5 w-full flex flex-col min-h-0 lg:h-auto lg:max-h-full"
          >
            <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/60 rounded-xl p-6 sm:p-7 shadow-2xl flex flex-col h-full relative overflow-hidden group/panel">
              {/* Header Panel Agenda */}
              <div className="flex items-center justify-between mb-5 relative z-10 shrink-0 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-[#ff4d4d]" />
                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
                    Agenda Mendatang
                  </h2>
                </div>
                <Link 
                  href="/agenda" 
                  className="text-xs font-semibold text-[#ff6666] hover:text-white transition-colors flex items-center gap-1 group"
                >
                  Semua <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Daftar Scrollable Agenda */}
              <div className="flex flex-col gap-3 overflow-y-auto pr-1 relative z-10 pb-1 max-h-[46vh] lg:max-h-full [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/30">
                {displayEvents.length > 0 ? (
                  displayEvents.map((event) => (
                    <Link 
                      key={event.id} 
                      href={`/agenda/${event.slug}`} 
                      className="group relative block bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 hover:border-red-500/30 rounded-lg p-3.5 transition-all duration-300 shadow-sm shrink-0"
                    >
                      <div className="flex gap-3.5 items-center">
                        {/* Kotak Tanggal */}
                        <div 
                          className="shrink-0 text-center w-[58px] bg-slate-950/80 rounded-md py-2 border border-slate-800 group-hover:border-red-500/40 transition-colors shadow-inner" 
                          suppressHydrationWarning
                        >
                          <div className="text-[10px] text-[#ff4d4d] font-bold uppercase tracking-wider mb-0.5 leading-none" suppressHydrationWarning>
                            {new Date(event.event_date).toLocaleDateString('id-ID', { month: 'short', timeZone: 'Asia/Jakarta' })}
                          </div>
                          <div className="text-xl font-black text-white leading-none" suppressHydrationWarning>
                            {new Intl.DateTimeFormat('id-ID', { day: '2-digit', timeZone: 'Asia/Jakarta' }).format(new Date(event.event_date))}
                          </div>
                        </div>

                        {/* Detail Agenda */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs sm:text-sm font-bold text-white mb-1.5 group-hover:text-[#ff6666] transition-colors line-clamp-1 leading-snug">
                            {event.title}
                          </h3>
                          <div className="flex flex-col gap-1 text-[11px] text-slate-400 font-medium">
                            <div className="flex items-center gap-1.5 truncate">
                              <MapPin className="w-3 h-3 shrink-0 text-[#ff4d4d]"/> 
                              <span className="truncate">{event.location || 'Surakarta'}</span>
                            </div>
                            <div className="flex items-center gap-1.5" suppressHydrationWarning>
                              <Clock className="w-3 h-3 shrink-0 text-[#ff4d4d]"/> 
                              <span>{new Date(event.event_date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }).replace(/\./g, ':')} WIB</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-slate-400 text-xs text-center py-8 bg-slate-950/30 rounded-lg border border-slate-800/40">
                    Belum ada agenda mendatang dalam waktu dekat.
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Garis Pembatas Halus di Bawah */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent z-10" />
    </section>
  );
}
