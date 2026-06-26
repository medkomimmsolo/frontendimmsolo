'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowRight, MapPin, Clock } from 'lucide-react';

type StatsProps = {
  stats?: {
    stat_kader?: string;
    stat_komisariat?: string;
    stat_lembaga?: string;
    stat_universitas?: string;
  };
};

const mockEvents = [
  {
    id: 1,
    title: "Musyawarah Cabang XX IMM Kota Surakarta",
    slug: "musycab-xx-imm-surakarta",
    date: "2024-05-20T08:00:00Z",
    location: "Gedung Balai Muhammadiyah Surakarta",
    status: "upcoming",
    organizers: "Panitia Pemilihan, PC IMM Kota Surakarta"
  },
  {
    id: 2,
    title: "Sekolah Pimpinan: Upgrading Kepemimpinan Organisasi",
    slug: "sekolah-pimpinan-upgrading",
    date: "2024-04-15T09:00:00Z",
    location: "Aula UMS",
    status: "upcoming",
    organizers: "Bidang Kader"
  },
  {
    id: 3,
    title: "Diskusi Publik: Peran Mahasiswa dalam Mengawal Demokrasi",
    slug: "diskusi-publik-peran-mahasiswa",
    date: "2024-05-02T13:00:00Z",
    location: "Amphitheater FKIP UNS",
    status: "upcoming",
    organizers: "Bidang Hikmah, LSO Hikmah"
  }
];

export default function HeroSection({ stats }: StatsProps) {
  return (
    <section className="relative w-full min-h-[100dvh] lg:min-h-0 lg:h-[100dvh] flex items-center justify-center overflow-hidden bg-[#0a0f1a]">
      
      {/* Background with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/imm_hero_bg.jpg" 
          alt="PC IMM Surakarta Background" 
          className="w-full h-full object-cover object-center opacity-40 scale-105 motion-safe:animate-[slowZoom_30s_ease-in-out_infinite_alternate]"
        />
        {/* Solid Dark Overlay for better readability */}
        <div className="absolute inset-0 bg-[#0f172a]/80"></div>
        <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[2px]"></div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 relative w-full pt-28 pb-16 lg:py-0 flex flex-col justify-center h-full">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16 h-full lg:max-h-[80vh]">
          
          {/* Left: Hero Content */}
          <div className="lg:w-1/2 xl:w-3/5 flex flex-col items-start text-left shrink-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="inline-flex items-center gap-2.5 px-4 py-1.5 mb-8 rounded-full border border-white/10 bg-white/5 backdrop-blur-md shadow-lg"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff3333] animate-pulse shadow-[0_0_10px_rgba(255,51,51,0.8)]"></span>
              <span className="text-white/90 font-bold text-xs sm:text-sm tracking-widest uppercase" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>Website Resmi</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-6 text-white leading-[1.15]"
              style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
            >
              PC IMM<br />
              <span className="text-[#c20000]">Kota Surakarta</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="text-base sm:text-lg lg:text-xl text-white/70 mb-10 leading-relaxed font-light max-w-xl"
            >
              Wadah perjuangan mahasiswa Muhammadiyah untuk membentuk akademisi Islam yang berakhlak mulia demi terwujudnya tujuan persyarikatan.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="flex flex-wrap items-center gap-4 w-full"
            >
              <Button asChild size="lg" className="bg-[#c20000] hover:bg-[#a00000] text-white shadow-lg shadow-red-900/30 border-none rounded-full px-8 transition-all duration-300 hover:scale-105">
                <Link href="#kontak">Hubungi Kami</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 hover:text-white bg-transparent rounded-full px-8 backdrop-blur-md transition-all duration-300">
                <Link href="/tentang">Pelajari Lebih Lanjut</Link>
              </Button>
            </motion.div>
          </div>

          {/* Right: Upcoming Events Panel */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="lg:w-1/2 xl:w-2/5 w-full flex flex-col min-h-0 lg:h-auto lg:max-h-full"
          >
            <div className="bg-[#0f172a]/60 backdrop-blur-2xl border border-white/10 rounded-sm p-6 sm:p-8 shadow-2xl flex flex-col h-full relative overflow-hidden group/panel">
              
              {/* Clean solid look without gradient blobs */}

              <div className="flex items-center justify-between mb-6 relative z-10 shrink-0">
                <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
                  Agenda Mendatang
                </h3>
                <Link href="/agenda" className="text-sm font-semibold text-[#ff4d4d] hover:text-[#ff8080] transition-colors flex items-center gap-1 group">
                  Semua <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Scrollable List for Events */}
              <div className="flex flex-col gap-3.5 overflow-y-auto pr-2 relative z-10 pb-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/30">
                {mockEvents.map((event) => (
                  <Link key={event.id} href={`/agenda/${event.slug}`} className="group relative block bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 rounded-sm p-4 transition-all duration-300 hover:border-white/10 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5 shrink-0">
                    <div className="flex gap-4 items-center">
                      <div className="shrink-0 text-center w-[68px] bg-[#0a0f1a]/80 rounded-sm py-3 border border-white/5 shadow-inner transition-colors group-hover:border-[#c20000]/30">
                        <div className="text-[10px] text-[#ff4d4d] font-bold uppercase tracking-widest mb-1 leading-none">{new Date(event.date).toLocaleDateString('id-ID', { month: 'short' })}</div>
                        <div className="text-2xl font-black text-white leading-none">{new Date(event.date).getDate().toString().padStart(2, '0')}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-white mb-2 group-hover:text-[#ff4d4d] transition-colors line-clamp-2 leading-tight">{event.title}</h4>
                        <div className="flex flex-col gap-1.5 text-xs text-white/60 font-medium">
                          <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 shrink-0 text-[#c20000]"/> <span className="truncate">{event.location}</span></div>
                          <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 shrink-0 text-[#c20000]"/> {new Date(event.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

            </div>
          </motion.div>

        </div>
      </div>

      {/* Decorative Bottom Gradient Line */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent z-10"></div>
    </section>
  );
}
