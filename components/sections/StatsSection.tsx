'use client';

import { Users, Building2, School, BookOpen, BarChart3 } from 'lucide-react';

type StatsProps = {
  stats: {
    stat_kader: string;
    stat_komisariat: string;
    stat_lembaga: string;
    stat_universitas: string;
  };
};

export default function StatsSection({ stats }: StatsProps) {
  const statsList = [
    {
      id: 1,
      name: 'Kader Aktif',
      value: stats?.stat_kader || '2.000+',
      icon: Users,
      description: 'Tersebar di berbagai penjuru kota Surakarta',
    },
    {
      id: 2,
      name: 'Komisariat',
      value: stats?.stat_komisariat || '14',
      icon: Building2,
      description: 'Wadah pergerakan di tingkat fakultas dan kampus',
    },
    {
      id: 3,
      name: 'Lembaga Khusus',
      value: stats?.stat_lembaga || '5',
      icon: BookOpen,
      description: 'Fokus pada pengembangan minat dan bakat kader',
    },
    {
      id: 4,
      name: 'Perguruan Tinggi',
      value: stats?.stat_universitas || '4',
      icon: School,
      description: 'Basis pergerakan keilmuan dan akademik kampus',
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-[#0a0f1a] relative overflow-hidden text-white border-y border-slate-800/80">
      {/* Decorative Map Silhouette Background */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none opacity-30 mix-blend-screen">
        <div className="absolute inset-0 bg-[url('/images/map-surakarta.jpg')] bg-center bg-no-repeat bg-cover filter grayscale contrast-125" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a] via-[#0a0f1a]/70 to-[#0a0f1a]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f1a] via-transparent to-[#0a0f1a]" />
      </div>

      {/* Ambient Red Glow in Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#c20000]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top: Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 md:mb-18 gap-6">
          <div className="max-w-2xl">
            <div data-aos="fade-up" className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/60 border border-red-500/20 text-[#ff4d4d] text-xs font-bold uppercase tracking-wider">
                <BarChart3 className="w-3.5 h-3.5" /> Jejak Langkah Organisasi
              </span>
            </div>
            
            <h2 
              data-aos="fade-up"
              data-aos-delay="100"
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight"
              style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
            >
              IMM Surakarta Dalam{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff4d4d] to-[#ff8080]">
                Angka
              </span>
            </h2>
          </div>

          <p data-aos="fade-up" data-aos-delay="200" className="text-slate-400 text-sm sm:text-base max-w-md leading-relaxed">
            Statistik kekuatan kader, jangkauan komisariat, dan jejak penyebaran Ikatan Mahasiswa Muhammadiyah di Kota Surakarta.
          </p>
        </div>

        {/* Grid Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsList.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={stat.id} 
                data-aos="fade-up" 
                data-aos-delay={index * 100}
                className="group relative"
              >
                <div className="h-full bg-slate-900/60 backdrop-blur-md border border-slate-800/90 hover:border-red-500/40 rounded-xl p-6 sm:p-7 transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-red-950/20 hover:-translate-y-1 relative overflow-hidden">
                  
                  {/* Hover Accent Top Line */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#c20000] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div>
                    {/* Icon Container */}
                    <div className="w-12 h-12 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-[#ff4d4d] mb-6 group-hover:bg-red-950/40 group-hover:border-red-500/30 group-hover:scale-110 transition-all duration-300 shadow-sm">
                      <Icon className="w-6 h-6" />
                    </div>

                    {/* Number Value */}
                    <div 
                      className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-2 group-hover:text-red-100 transition-colors"
                      style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
                    >
                      {stat.value}
                    </div>

                    {/* Label */}
                    <div className="text-sm sm:text-base font-bold text-slate-200 mb-1">
                      {stat.name}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-400 leading-relaxed mt-4 pt-3 border-t border-slate-800/70">
                    {stat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
