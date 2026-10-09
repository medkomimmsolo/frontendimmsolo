'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden bg-[#c20000]">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[50%] -right-[10%] w-[50%] h-[100%] rounded-full bg-[#a30000] blur-[80px]"></div>
        <div className="absolute -bottom-[50%] -left-[10%] w-[50%] h-[100%] rounded-full bg-[#7a0000] blur-[80px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div data-aos="zoom-in" className="max-w-4xl mx-auto text-center">
          <h2 data-aos="fade-up" data-aos-delay="100" className="text-3xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
            Mari Bergabung Bersama <span className="text-[#fcd34d] drop-shadow-md">Ikatan</span>
          </h2>
          <p data-aos="fade-up" data-aos-delay="200" className="text-lg md:text-xl text-imm-red-50 mb-10 max-w-2xl mx-auto">
            Jadilah bagian dari gerakan mahasiswa Islam yang berorientasi pada pencerahan intelektual dan pemberdayaan masyarakat.
          </p>
          
          <div data-aos="fade-up" data-aos-delay="300" className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" variant="white" className="w-full sm:w-auto font-bold group" asChild>
              <Link href="/kontak">
                Hubungi Kami
              </Link>
            </Button>
            <Button variant="outline-white" size="lg" className="w-full sm:w-auto font-bold group" asChild>
              <Link href="/struktural">
                Lihat Struktur Organisasi
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
