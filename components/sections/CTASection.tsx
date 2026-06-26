'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden bg-[#c20000]">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[50%] -right-[10%] w-[50%] h-[100%] rounded-full bg-[#c20000] blur-[80px]"></div>
        <div className="absolute -bottom-[50%] -left-[10%] w-[50%] h-[100%] rounded-full bg-[#a30000] blur-[80px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Mari Bergabung Bersama <span className="text-[#fcd34d] drop-shadow-md">Ikatan</span>
          </h2>
          <p className="text-lg md:text-xl text-imm-red-50 mb-10 max-w-2xl mx-auto">
            Jadilah bagian dari gerakan mahasiswa Islam yang berorientasi pada pencerahan intelektual dan pemberdayaan masyarakat.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" variant="white" className="w-full sm:w-auto font-bold group">
              Hubungi Kami
            </Button>
            <Button variant="outline-white" size="lg" className="w-full sm:w-auto font-bold group" asChild>
              <Link href="/struktural">
                Lihat Struktur Organisasi
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
