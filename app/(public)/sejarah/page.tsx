import { Metadata } from 'next';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { BookOpen, Compass, Target, Clock, ShieldCheck, Flag } from 'lucide-react';
import StatsSection from '@/components/sections/StatsSection';
import SejarahHero from '@/components/sections/SejarahHero';
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
  title: 'Sejarah IMM',
  description: 'Sejarah berdirinya Ikatan Mahasiswa Muhammadiyah (IMM) pada tahun 1964.',
  alternates: {
    canonical: 'https://immsolo.or.id/sejarah',
  },
  openGraph: {
    title: 'Sejarah IMM | PC IMM Kota Surakarta',
    description: 'Sejarah berdirinya Ikatan Mahasiswa Muhammadiyah (IMM) pada tahun 1964.',
    url: 'https://immsolo.or.id/sejarah',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Sejarah IMM | PC IMM Kota Surakarta',
    description: 'Sejarah berdirinya Ikatan Mahasiswa Muhammadiyah (IMM) pada tahun 1964.',
  },
};

export default async function SejarahPage() {
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
    console.error("Failed to fetch settings for sejarah stats", error);
  }

  return (
    <main className="min-h-screen bg-white pb-0">
      
      {/* 1. HERO HOOK */}
      <SejarahHero />

      {/* 2. IDENTITAS SEJARAH (Staggered Cards) */}
      <section className="relative z-20 -mt-24 mb-32 max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-3 gap-8">
          
          <div data-aos="fade-up" className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/90 p-8 hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-200 to-[#c20000] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500"></div>
            <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center text-[#c20000] mb-8 group-hover:bg-[#c20000] group-hover:text-white transition-colors duration-500 shadow-sm">
              <Clock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-[#0f172a]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>Kelahiran IMM</h2>
            <p className="text-slate-600 leading-relaxed text-base">
              Didirikan di Yogyakarta pada 14 Maret 1964 M (29 Syawal 1384 H). Lahir sebagai respons atas kebutuhan Muhammadiyah akan wadah pembinaan mahasiswa Islam.
            </p>
          </div>

          {/* Middle Card: Pushed slightly up */}
          <div data-aos="fade-up" data-aos-delay="100" className="bg-[#0f172a] text-white rounded-2xl shadow-2xl shadow-slate-900/40 p-8 md:-translate-y-8 hover:-translate-y-10 transition-all duration-500 group relative overflow-hidden border border-slate-800">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-[#c20000] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500"></div>
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#c20000]/20 rounded-full blur-2xl group-hover:bg-[#c20000]/40 transition-colors duration-500"></div>
            
            <div className="w-16 h-16 bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center text-white mb-8 group-hover:bg-[#c20000] transition-colors duration-500 relative z-10 shadow-sm">
              <Target className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>Tujuan Mulia</h2>
            <p className="text-slate-300 leading-relaxed relative z-10 text-base">
              "Mengusahakan terbentuknya akademisi Islam yang berakhlak mulia dalam rangka mencapai tujuan Muhammadiyah." Sebuah manifesto gerakan intelektual.
            </p>
          </div>

          <div data-aos="fade-up" data-aos-delay="200" className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/90 p-8 hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-200 to-[#c20000] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500"></div>
            <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center text-[#c20000] mb-8 group-hover:bg-[#c20000] group-hover:text-white transition-colors duration-500 shadow-sm">
              <Flag className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-[#0f172a]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>Deklarasi Kottabarat</h2>
            <p className="text-slate-600 leading-relaxed text-base">
              Melahirkan Enam Penegasan IMM di Surakarta, yang menjadi fondasi dan pijakan ideologis perjuangan seluruh kader IMM se-Indonesia hingga saat ini.
            </p>
          </div>

        </div>
      </section>

      {/* 3. NILAI DASAR */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <SectionTitle 
            title="Tri Kompetensi Dasar" 
            subtitle="NILAI PERGERAKAN" 
            alignment="center" 
          />
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {[
              { title: "Religiusitas", icon: BookOpen, desc: "Kemampuan kader dalam memahami, menghayati, dan mengamalkan ajaran Islam secara kaffah berdasarkan Al-Qur'an dan As-Sunnah." },
              { title: "Intelektualitas", icon: Compass, desc: "Kapasitas keilmuan dan kemampuan analisis kritis kader terhadap berbagai persoalan umat, bangsa, dan global." },
              { title: "Humanitas", icon: Target, desc: "Kepedulian sosial dan keterlibatan aktif kader dalam melakukan advokasi dan pemberdayaan masyarakat yang tertindas." }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} data-aos="fade-up" data-aos-delay={idx * 100} className="group relative">
                  <div className="p-8 md:p-10 flex flex-col h-full bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-red-200 hover:-translate-y-1 transition-all duration-300">
                    <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-[#c20000] mb-6 group-hover:bg-[#c20000] group-hover:text-white transition-colors duration-500 shadow-sm">
                      <Icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#0f172a] mb-4" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>{item.title}</h3>
                    <p className="text-slate-600 leading-relaxed text-base">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. SEJARAH OVERLAP LAYOUT */}
      <section className="py-20 md:py-28 bg-slate-50/70 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute right-0 top-0 w-1/3 h-full bg-red-500/5 -skew-x-12 translate-x-1/2"></div>
        
        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            
            {/* Image Side */}
            <div data-aos="fade-right" className="relative">
              {/* Offset decorative box */}
              <div className="absolute inset-0 bg-red-100/60 translate-x-4 translate-y-4 rounded-2xl"></div>
              {/* Image itself */}
              <div className="relative h-72 sm:h-96 md:h-[600px] rounded-2xl overflow-hidden shadow-xl border border-slate-200/90 bg-slate-100">
                <img 
                  src="/images/imm_hero_bg.jpg" 
                  alt="Dokumentasi sejarah Ikatan Mahasiswa Muhammadiyah" 
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover mix-blend-overlay opacity-80 hover:scale-105 transition-transform duration-1000 motion-reduce:transform-none"
                />
                <div className="absolute inset-0 bg-[#0f172a]/60 mix-blend-multiply pointer-events-none"></div>
                
                {/* Superimposed text */}
                <div className="absolute bottom-10 left-10 text-white">
                  <div className="text-7xl font-black mb-2" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>1964</div>
                  <div className="text-sm font-bold tracking-widest uppercase text-white/80">Tahun Berdiri</div>
                </div>
              </div>
            </div>

            {/* Text Side */}
            <div data-aos="fade-left" data-aos-delay="150">
              <SectionTitle 
                title="Latar Belakang & Enam Penegasan" 
                subtitle="JEJAK LANGKAH" 
                alignment="left" 
              />
              <div className="space-y-6 text-[#0f172a]/70 text-lg leading-relaxed mt-8">
                <p>
                  Pada masa itu, kondisi umat Islam dan bangsa Indonesia sedang menghadapi berbagai tantangan ideologis. Muhammadiyah menyadari pentingnya memiliki sebuah wadah khusus bagi mahasiswa yang dapat mengintegrasikan nilai-nilai keislaman, keilmuan, dan kemanusiaan.
                </p>
                <p>
                  Deklarasi Kottabarat di Surakarta melahirkan rumusan sejarah penting, yang dikenal sebagai <strong>Enam Penegasan IMM</strong>:
                </p>
                
                <ul className="list-disc pl-5 space-y-3 font-medium text-slate-800">
                  <li>IMM adalah gerakan mahasiswa Islam.</li>
                  <li>Kepribadian Muhammadiyah adalah landasan perjuangan IMM.</li>
                  <li>Fungsi IMM adalah eksponen mahasiswa dalam Muhammadiyah.</li>
                  <li>IMM organisasi sah mengindahkan hukum & falsafah negara.</li>
                  <li>Ilmu adalah amaliah dan amal adalah ilmiah.</li>
                  <li>Amal IMM adalah lillahi ta'ala diabadikan untuk rakyat.</li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. STATS SECTION */}
      <StatsSection stats={statsData} />

    </main>
  );
}
