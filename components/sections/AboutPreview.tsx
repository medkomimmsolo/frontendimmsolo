'use client';

import { motion } from 'motion/react';
import { Users, BookOpen, Heart, ArrowRight, Quote, Compass } from 'lucide-react';
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
    <section className="py-32 bg-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[#c20000]/5/50 skew-x-12 translate-x-32 hidden lg:block"></div>
      
      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="mb-16 md:mb-24 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="flex items-center gap-4 mb-6"
          >
            <span className="text-[#c20000] font-bold uppercase tracking-widest text-sm">Identitas Pergerakan</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#0f172a] leading-tight mb-6"
            style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
          >
            Membangun <span className="text-transparent bg-clip-text bg-gradient-to-r from-imm-red-600 to-imm-red-800">Peradaban</span> Melalui Tri Kompetensi
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.2 }}
            className="text-lg text-[#0f172a]/80 leading-relaxed max-w-2xl"
          >
            Ikatan Mahasiswa Muhammadiyah (IMM) bergerak dengan tiga pilar utama yang tak terpisahkan, membentuk kader yang seimbang antara spiritualitas, intelektualitas, dan aksi sosial.
          </motion.p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 auto-rows-[minmax(280px,auto)]">
          
          {/* Card 1: Religiusitas (Large/Spans 2 columns on tablet+) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="md:col-span-2 relative rounded-sm overflow-hidden group bg-white border border-[#0f172a]/10 shadow-sm hover:shadow-xl hover:border-imm-red-200 transition-all duration-500"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-imm-red-50 to-white opacity-50"></div>
            <div className="relative h-full p-8 md:p-12 flex flex-col justify-between z-10">
              <div className="w-16 h-16 rounded-sm bg-white shadow-md flex items-center justify-center text-[#c20000] mb-8 border border-[#0f172a]/5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                <Heart className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-[#0f172a] mb-4" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>Religiusitas</h3>
                <p className="text-[#0f172a]/80 text-lg max-w-md">Menjadikan nilai-nilai murni keislaman sebagai landasan utama dalam setiap tarikan napas, pikiran, dan langkah pergerakan.</p>
              </div>
              <div className="absolute bottom-0 right-0 p-8 opacity-5 text-[#c20000] pointer-events-none transform translate-x-1/4 translate-y-1/4 group-hover:scale-110 transition-transform duration-700">
                <Heart className="w-64 h-64" />
              </div>
            </div>
          </motion.div>

          {/* Card 2: Quote/Visual */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative rounded-sm bg-[#c20000] text-white p-8 md:p-10 flex flex-col justify-center overflow-hidden shadow-lg shadow-imm-red-600/20 group"
          >
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#c20000] rounded-full blur-2xl opacity-50 group-hover:bg-[#fcd34d] transition-colors duration-700"></div>
            <Quote className="w-12 h-12 text-[#c20000]/60 mb-6 relative z-10" />
            <p className="text-xl font-medium leading-snug relative z-10" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
              "Menjadi cendekiawan berpribadi, adalah tujuan hakiki dari setiap kader Ikatan."
            </p>
          </motion.div>

          {/* Card 3: Intelektualitas */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative rounded-sm bg-white border border-[#0f172a]/10 p-8 md:p-10 shadow-sm hover:shadow-xl hover:border-imm-red-200 transition-all duration-500 group overflow-hidden"
          >
            <div className="w-14 h-14 rounded-sm bg-white flex items-center justify-center text-[#0f172a]/90 mb-8 group-hover:bg-[#c20000]/5 group-hover:text-[#c20000] transition-colors duration-300">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-[#0f172a] mb-4">Intelektualitas</h3>
            <p className="text-[#0f172a]/80">Tradisi keilmuan yang kuat, kritis, dan objektif dalam merespon dinamika zaman.</p>
          </motion.div>

          {/* Card 4: Humanitas */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative rounded-sm bg-white border border-[#0f172a]/10 p-8 md:p-10 shadow-sm hover:shadow-xl hover:border-imm-red-200 transition-all duration-500 group overflow-hidden"
          >
            <div className="w-14 h-14 rounded-sm bg-white flex items-center justify-center text-[#0f172a]/90 mb-8 group-hover:bg-[#c20000]/5 group-hover:text-[#c20000] transition-colors duration-300">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-[#0f172a] mb-4">Humanitas</h3>
            <p className="text-[#0f172a]/80">Kepedulian sosial yang diwujudkan melalui aksi nyata pemberdayaan masyarakat.</p>
          </motion.div>

          {/* Card 5: Action / CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="relative rounded-sm bg-[#0f172a] text-white p-8 md:p-10 shadow-xl group overflow-hidden flex flex-col justify-end min-h-[280px]"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-800 to-slate-900"></div>
            <Compass className="absolute top-8 right-8 w-32 h-32 text-[#0f172a] group-hover:rotate-45 transition-transform duration-1000 ease-out" />
            
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-2">Eksplorasi Pergerakan</h3>
              <p className="text-white/70 mb-6 text-sm">Pelajari lebih dalam tentang sejarah, tujuan, dan struktur organisasi PC IMM Kota Surakarta.</p>
              <Button asChild variant="white" className="w-full group/btn">
                <Link href="/tentang" className="flex justify-between items-center">
                  Lihat Profil Lengkap
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
