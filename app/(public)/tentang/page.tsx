import { Metadata } from 'next';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Card, CardContent } from '@/components/ui/Card';
import { MapPin, Users, Building, ShieldCheck, Target, Zap, Globe } from 'lucide-react';
import StatsSection from '@/components/sections/StatsSection';
import TentangHero from '@/components/sections/TentangHero';
import { checkMaintenance } from '@/lib/maintenance';
import MaintenancePage from '@/components/ui/MaintenancePage';

export const metadata: Metadata = {
  title: 'Tentang Kami | PC IMM Kota Surakarta',
  description: 'Profil dan Jejak Langkah Pimpinan Cabang Ikatan Mahasiswa Muhammadiyah Kota Surakarta.',
  alternates: {
    canonical: 'https://immsolo.or.id/tentang'
  },
};

export const dynamic = 'force-dynamic';

export default async function TentangPage() {
  if (await checkMaintenance('maintenance_profil')) return <MaintenancePage />;
  
  // Fetch stats data for StatsSection
  let statsData = {
    stat_kader: '2.000+',
    stat_komisariat: '14',
    stat_lembaga: '5',
    stat_universitas: '4',
  };

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, { cache: 'no-store' });
    const json = await res.json();
    const settings = json.data || [];
    
    let settingsMap: Record<string, string> = {};
    if (Array.isArray(settings)) {
      settings.forEach((s: any) => { settingsMap[s.key] = s.value; });
    } else if (typeof settings === 'object') {
      settingsMap = settings;
    }
    
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
          
          <div className="bg-white rounded-xl shadow-2xl shadow-slate-200/50 p-8 hover:-translate-y-2 transition-transform duration-500 group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-200 to-[#c20000] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500"></div>
            <div className="w-16 h-16 bg-[#0f172a]/5 rounded-xl flex items-center justify-center text-[#c20000] mb-8 group-hover:bg-[#c20000] group-hover:text-white transition-colors duration-500">
              <MapPin className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-[#0f172a]" style={{ fontFamily: 'var(--font-playfair), serif' }}>Basis Gerakan</h2>
            <p className="text-[#0f172a]/70 leading-relaxed">
              Berpusat di Kota Surakarta (Solo), PC IMM membawahi belasan komisariat yang tersebar di berbagai Perguruan Tinggi, baik Perguruan Tinggi Muhammadiyah (PTM) maupun Perguruan Tinggi Negeri (PTN) di Solo Raya.
            </p>
          </div>

          {/* Middle Card: Pushed slightly up for a staggered layout */}
          <div className="bg-[#0f172a] text-white rounded-xl shadow-2xl shadow-[#0f172a]/30 p-8 md:-translate-y-8 hover:-translate-y-10 transition-transform duration-500 group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#c20000] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500"></div>
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#c20000]/10 rounded-full blur-2xl group-hover:bg-[#c20000]/30 transition-colors duration-500"></div>
            
            <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center text-white mb-8 group-hover:bg-[#c20000] transition-colors duration-500 relative z-10">
              <Target className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-playfair), serif' }}>Fokus Eksekusi</h2>
            <p className="text-white/80 leading-relaxed relative z-10">
              Selain berfokus pada dialektika keilmuan, kami bergerak progresif dalam ranah advokasi kebijakan publik, pendampingan sosial ekonomi warga, hingga respon cepat isu-isu kemanusiaan lokal.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-2xl shadow-slate-200/50 p-8 hover:-translate-y-2 transition-transform duration-500 group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-200 to-[#c20000] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500"></div>
            <div className="w-16 h-16 bg-[#0f172a]/5 rounded-xl flex items-center justify-center text-[#c20000] mb-8 group-hover:bg-[#c20000] group-hover:text-white transition-colors duration-500">
              <Building className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-[#0f172a]" style={{ fontFamily: 'var(--font-playfair), serif' }}>Struktur Organisasi</h2>
            <p className="text-[#0f172a]/70 leading-relaxed">
              Didukung oleh pimpinan cabang yang terstruktur, berbagai Lembaga Otonom (LO) dan Lembaga Semi Otonom (LSO) untuk memfasilitasi minat dan bakat kader secara profesional.
            </p>
          </div>

        </div>
      </section>

      {/* 3. PROFIL CABANG */}
      <section className="py-24 bg-[#f8fafc] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            
            {/* Text Side */}
            <div>
              <SectionTitle 
                title="Pusat Pergerakan Solo Raya" 
                subtitle="TENTANG CABANG" 
                alignment="left" 
              />
              <div className="space-y-6 text-[#0f172a]/70 text-lg leading-relaxed mt-8">
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
            <div className="relative">
              {/* Offset decorative box */}
              <div className="absolute inset-0 bg-[#0f172a] translate-x-6 translate-y-6 rounded-sm"></div>
              {/* Image itself */}
              <div className="relative h-[500px] rounded-sm overflow-hidden shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=2000&auto=format&fit=crop" 
                  alt="Kegiatan PC IMM Surakarta" 
                  className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-1000"
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
