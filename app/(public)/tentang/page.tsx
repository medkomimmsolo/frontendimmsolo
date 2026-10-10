import { Metadata } from 'next';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Card, CardContent } from '@/components/ui/Card';
import { MapPin, Users, Building, ShieldCheck, Target, Zap, Globe } from 'lucide-react';
import StatsSection from '@/components/sections/StatsSection';
import TentangHero from '@/components/sections/TentangHero';
import { checkMaintenance } from '@/lib/maintenance';
import MaintenancePage from '@/components/ui/MaintenancePage';
import { getApiBase, normalizeSettings, type Settings } from '@/lib/settings';

async function fetchSettings(): Promise<Settings> {
  const res = await fetch(`${getApiBase()}/settings`, { next: { revalidate: 60 } });
  if (!res.ok) return {};
  const json = await res.json();
  return normalizeSettings(json?.data);
}

export const metadata: Metadata = {
  title: 'Tentang Kami',
  description: 'Profil dan Jejak Langkah Pimpinan Cabang Ikatan Mahasiswa Muhammadiyah Kota Surakarta.',
  alternates: {
    canonical: 'https://immsolo.or.id/tentang'
  },
  openGraph: {
    title: 'Tentang Kami | PC IMM Kota Surakarta',
    description: 'Profil dan Jejak Langkah Pimpinan Cabang Ikatan Mahasiswa Muhammadiyah Kota Surakarta.',
    url: 'https://immsolo.or.id/tentang',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Tentang Kami | PC IMM Kota Surakarta',
    description: 'Profil dan Jejak Langkah Pimpinan Cabang Ikatan Mahasiswa Muhammadiyah Kota Surakarta.',
  },
};

export default async function TentangPage() {
  if (await checkMaintenance('maintenance_profil')) return <MaintenancePage />;
  
  // Fetch stats data for StatsSection
  const statsData = {
    stat_kader: '2.000+',
    stat_komisariat: '14',
    stat_lembaga: '5',
    stat_universitas: '4',
  };

  try {
    const settingsMap = await fetchSettings();

    if (settingsMap.stat_kader) statsData.stat_kader = settingsMap.stat_kader;
    if (settingsMap.stat_komisariat) statsData.stat_komisariat = settingsMap.stat_komisariat;
    if (settingsMap.stat_lembaga) statsData.stat_lembaga = settingsMap.stat_lembaga;
    if (settingsMap.stat_universitas) statsData.stat_universitas = settingsMap.stat_universitas;
  } catch (error) {
    console.error("Failed to fetch settings for tentang stats", error);
  }

  return (
    <main className="min-h-screen bg-white pb-0">
      
      {/* 1. HERO HOOK */}
      <TentangHero />

      {/* 2. IDENTITAS LOKAL (Staggered Cards) */}
      <section className="relative z-20 -mt-24 mb-32 max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-3 gap-8">
          
          <div data-aos="fade-up" className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/90 p-8 hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-200 to-[#c20000] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500"></div>
            <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center text-[#c20000] mb-8 group-hover:bg-[#c20000] group-hover:text-white transition-colors duration-500 shadow-sm">
              <MapPin className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-[#0f172a]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>Basis Gerakan</h2>
            <p className="text-slate-600 leading-relaxed text-base">
              Berpusat di Kota Surakarta (Solo), PC IMM membawahi belasan komisariat yang tersebar di berbagai Perguruan Tinggi, baik Perguruan Tinggi Muhammadiyah (PTM) maupun Perguruan Tinggi Negeri (PTN) di Solo Raya.
            </p>
          </div>

          {/* Middle Card: Pushed slightly up for a staggered layout */}
          <div data-aos="fade-up" data-aos-delay="100" className="bg-[#0f172a] text-white rounded-2xl shadow-2xl shadow-slate-900/40 p-8 md:-translate-y-8 hover:-translate-y-10 transition-all duration-500 group relative overflow-hidden border border-slate-800">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-[#c20000] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500"></div>
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#c20000]/20 rounded-full blur-2xl group-hover:bg-[#c20000]/40 transition-colors duration-500"></div>
            
            <div className="w-16 h-16 bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center text-white mb-8 group-hover:bg-[#c20000] transition-colors duration-500 relative z-10 shadow-sm">
              <Target className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>Fokus Eksekusi</h2>
            <p className="text-slate-300 leading-relaxed relative z-10 text-base">
              Selain berfokus pada dialektika keilmuan, kami bergerak progresif dalam ranah advokasi kebijakan publik, pendampingan sosial ekonomi warga, hingga respon cepat isu-isu kemanusiaan lokal.
            </p>
          </div>

          <div data-aos="fade-up" data-aos-delay="200" className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/90 p-8 hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-200 to-[#c20000] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500"></div>
            <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center text-[#c20000] mb-8 group-hover:bg-[#c20000] group-hover:text-white transition-colors duration-500 shadow-sm">
              <Building className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-[#0f172a]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>Struktur Organisasi</h2>
            <p className="text-slate-600 leading-relaxed text-base">
              Didukung oleh pimpinan cabang yang terstruktur, berbagai Lembaga Otonom (LO) dan Lembaga Semi Otonom (LSO) untuk memfasilitasi minat dan bakat kader secara profesional.
            </p>
          </div>

        </div>
      </section>

      {/* 3. PROFIL CABANG */}
      <section className="py-20 md:py-28 bg-slate-50/70 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            
            {/* Text Side */}
            <div data-aos="fade-right">
              <SectionTitle 
                title="Pusat Pergerakan Solo Raya" 
                subtitle="TENTANG CABANG" 
                alignment="left" 
              />
              <div className="space-y-6 text-slate-600 text-base md:text-lg leading-relaxed mt-8">
                <p>
                  Pimpinan Cabang Ikatan Mahasiswa Muhammadiyah (PC IMM) Kota Surakarta merupakan salah satu cabang percontohan di Jawa Tengah yang memiliki dinamika pergerakan yang sangat kaya dan progresif.
                </p>
                <p>
                  Sebagai episentrum intelektual di kota budaya, IMM Solo mewarisi semangat juang persyarikatan dalam menghadirkan Islam yang berkemajuan. Kader-kader IMM Solo tersebar di kampus-kampus besar seperti Universitas Muhammadiyah Surakarta (UMS), Universitas Sebelas Maret (UNS), UIN Raden Mas Said, dan kampus lainnya.
                </p>
                <p>
                  Setiap kepemimpinan senantiasa berupaya merawat tradisi literasi, budaya diskusi, dan turun ke jalan maupun masyarakat ketika advokasi dibutuhkan.
                </p>
              </div>
            </div>

            {/* Image Side */}
            <div data-aos="fade-left" data-aos-delay="150" className="relative">
              {/* Offset decorative box */}
              <div className="absolute inset-0 bg-red-100/60 translate-x-4 translate-y-4 rounded-2xl"></div>
              {/* Image itself */}
              <div className="relative h-64 sm:h-80 md:h-[500px] rounded-2xl overflow-hidden shadow-xl border border-slate-200/90 bg-slate-100">
                <img 
                  src="/images/imm_hero_bg.jpg" 
                  alt="Kegiatan PC IMM Surakarta" 
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover opacity-95 hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. STATS SECTION (Dark Theme) */}
      <StatsSection stats={statsData} />

    </main>
  );
}
