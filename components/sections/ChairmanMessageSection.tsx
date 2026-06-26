'use client';

import { motion } from 'motion/react';
import { Quote } from 'lucide-react';
import Image from 'next/image';

type ChairmanProps = {
  name?: string;
  period?: string;
  message?: string;
  photo?: string;
};

export default function ChairmanMessageSection({ name, period, message, photo }: ChairmanProps) {
  if (!name && !message && !photo) return null;

  const chairmanName = name || 'Ketua Umum';
  const chairmanPeriod = period || 'Periode 2024 - 2025';
  const chairmanMessage = message || 'Selamat datang di website resmi Pimpinan Cabang Ikatan Mahasiswa Muhammadiyah (PC IMM) Kota Surakarta. Mari bersama-sama mewujudkan generasi yang anggun dalam moral dan unggul dalam intelektual.';
  const photoUrl = photo ? `${photo}` : 'https://placehold.co/600x800/e2e8f0/64748b?text=Foto+Ketua';

  return (
    <section className="py-24 bg-white relative overflow-hidden border-t border-[#0f172a]/5">
      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Photo Section */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative z-10 aspect-[4/5] rounded-sm overflow-hidden border border-[#0f172a]/10 shadow-lg bg-white group">
              <div className="absolute inset-0 bg-[#0f172a]/5 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
              <Image 
                src={photoUrl} 
                alt={`Foto ${chairmanName}`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover filter grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/80 via-transparent to-transparent z-20"></div>
              <div className="absolute bottom-6 left-6 z-30">
                <p className="font-bold text-2xl text-white tracking-tight" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>{chairmanName}</p>
                <p className="text-sm text-white/90 font-medium">Ketua Umum PC IMM Kota Surakarta {chairmanPeriod}</p>
              </div>
            </div>
            
            {/* Decorative block behind photo */}
            <div className="absolute -bottom-4 -right-4 w-3/4 h-3/4 bg-[#c20000]/10 rounded-sm -z-10"></div>
            <div className="absolute -top-4 -left-4 w-24 h-24 border-t-2 border-l-2 border-[#c20000]/30 -z-10"></div>
          </motion.div>

          {/* Text/Message Section */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-7 flex flex-col justify-center"
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="text-[#c20000] font-bold uppercase tracking-widest text-sm">Sambutan</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0f172a] mb-8 leading-tight" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
              Pesan <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c20000] to-[#8a0000]">Ketua Umum</span>
            </h2>
            
            <div className="relative">
              <Quote className="absolute -top-4 -left-4 w-12 h-12 text-[#c20000]/10 -z-10" />
              <p className="text-xl md:text-2xl text-[#0f172a]/80 leading-relaxed font-medium italic border-l-4 border-[#c20000] pl-6 py-2">
                "{chairmanMessage}"
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
