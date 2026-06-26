'use client';

import { motion } from 'motion/react';
import { Users, Building2, School, BookOpen } from 'lucide-react';

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
      description: 'Tersebar di berbagai penjuru kota Surakarta'
    },
    {
      id: 2,
      name: 'Komisariat',
      value: stats?.stat_komisariat || '14',
      icon: Building2,
      description: 'Wadah pergerakan di tingkat fakultas dan kampus'
    },
    {
      id: 3,
      name: 'Lembaga',
      value: stats?.stat_lembaga || '5',
      icon: BookOpen,
      description: 'Fokus pada pengembangan minat dan bakat'
    },
    {
      id: 4,
      name: 'Perguruan Tinggi',
      value: stats?.stat_universitas || '4',
      icon: School,
      description: 'Basis pergerakan keilmuan dan akademik'
    }
  ];

  return (
    <section className="py-32 bg-[#0f172a] relative overflow-hidden text-white border-y border-slate-800">
      
      {/* Decorative Map Silhouette Background */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none opacity-40 mix-blend-screen">
        <div 
          className="absolute inset-0 bg-[url('/images/map-surakarta.jpg')] bg-center bg-no-repeat bg-cover filter grayscale contrast-125"
        ></div>
        {/* Vignette Gradients to blend image edges into the dark navy background */}
        <div className="absolute inset-0 bg-[#0f172a]/60"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-[#0f172a] opacity-90"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a] via-transparent to-[#0f172a] opacity-90"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_20%,_#0f172a_70%)]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        
        {/* Top: Heading */}
        <div className="mb-16 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 mb-6"
          >
            <span className="text-[#c20000]/80 font-bold uppercase tracking-widest text-sm">
              Jejak Langkah Organisasi
            </span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
            style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
          >
            IMM Solo Dalam <span className="text-[#c20000] italic">Angka</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/70 text-lg max-w-sm"
          >
            Statistik pergerakan, kekuatan kader, dan jejak penyebaran Ikatan Mahasiswa Muhammadiyah di Kota Surakarta.
          </motion.p>
        </div>

        {/* Grid: Stats Side by Side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsList.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex-1"
              >
                <div className="h-full border border-slate-800 bg-slate-900/50 p-6 md:p-8 hover:border-slate-600 transition-all duration-300 flex flex-col relative overflow-hidden group rounded-sm">
                  
                  {/* Hover Reveal Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#c20000]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                  
                  {/* Animated Bottom Border */}
                  <div className="absolute left-0 bottom-0 w-full h-1 bg-[#c20000] transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></div>

                  <div className="relative z-10 flex flex-col h-full">
                    
                    {/* Top: Name & Icon */}
                    <div className="flex justify-between items-start mb-8">
                      <div className="text-[#c20000]/80 font-bold text-sm tracking-widest uppercase w-1/2">
                        {stat.name}
                      </div>
                      <div className="shrink-0 w-12 h-12 rounded-full border border-slate-700 flex items-center justify-center group-hover:bg-[#c20000] group-hover:border-[#c20000] transition-all duration-300">
                        <Icon className="w-5 h-5 text-white/70 group-hover:text-white group-hover:scale-110 transition-transform" />
                      </div>
                    </div>

                    {/* Middle: Number Value */}
                    <div className="mt-auto mb-4">
                      <div className="text-5xl md:text-6xl font-light text-white group-hover:text-[#c20000] transition-colors duration-300" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                        {stat.value}
                      </div>
                    </div>

                    {/* Bottom: Description */}
                    <p className="text-sm text-white/60 leading-relaxed group-hover:text-white/80 transition-colors">
                      {stat.description}
                    </p>

                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
