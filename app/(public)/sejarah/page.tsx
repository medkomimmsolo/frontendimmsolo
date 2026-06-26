import { Metadata } from 'next';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { BookOpen, Compass, Target, Clock, ShieldCheck, Flag } from 'lucide-react';
import StatsSection from '@/components/sections/StatsSection';
import SejarahHero from '@/components/sections/SejarahHero';
import { checkMaintenance } from '@/lib/maintenance';
import MaintenancePage from '@/components/ui/MaintenancePage';

export const metadata: Metadata = {
  title: 'Sejarah IMM',
  description: 'Sejarah berdirinya Ikatan Mahasiswa Muhammadiyah (IMM) pada tahun 1964.',
};

export const dynamic = 'force-dynamic';

export default async function SejarahPage() {
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
    console.error("Failed to fetch settings for sejarah stats", error);
  }

  return (
    <main className="min-h-screen bg-white pb-0">
      
      {/* 1. HERO HOOK */}
      <SejarahHero />

      {/* 2. IDENTITAS SEJARAH (Staggered Cards) */}
      <section className="relative z-20 -mt-24 mb-32 max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-3 gap-8">
          
          <div className="bg-white rounded-xl shadow-2xl shadow-slate-200/50 p-8 hover:-translate-y-2 transition-transform duration-500 group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-200 to-[#c20000] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500"></div>
            <div className="w-16 h-16 bg-[#0f172a]/5 rounded-xl flex items-center justify-center text-[#c20000] mb-8 group-hover:bg-[#c20000] group-hover:text-white transition-colors duration-500">
              <Clock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-[#0f172a]" style={{ fontFamily: 'var(--font-playfair), serif' }}>Kelahiran IMM</h2>
            <p className="text-[#0f172a]/70 leading-relaxed">
              Didirikan di Yogyakarta pada 14 Maret 1964 M (29 Syawal 1384 H). Lahir sebagai respons atas kebutuhan Muhammadiyah akan wadah pembinaan mahasiswa Islam.
            </p>
          </div>

          {/* Middle Card: Pushed slightly up */}
          <div className="bg-[#0f172a] text-white rounded-xl shadow-2xl shadow-[#0f172a]/30 p-8 md:-translate-y-8 hover:-translate-y-10 transition-transform duration-500 group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#c20000] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500"></div>
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#c20000]/10 rounded-full blur-2xl group-hover:bg-[#c20000]/30 transition-colors duration-500"></div>
            
            <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center text-white mb-8 group-hover:bg-[#c20000] transition-colors duration-500 relative z-10">
              <Target className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-playfair), serif' }}>Tujuan Mulia</h2>
            <p className="text-white/80 leading-relaxed relative z-10">
              "Mengusahakan terbentuknya akademisi Islam yang berakhlak mulia dalam rangka mencapai tujuan Muhammadiyah." Sebuah manifesto gerakan intelektual.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-2xl shadow-slate-200/50 p-8 hover:-translate-y-2 transition-transform duration-500 group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-200 to-[#c20000] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500"></div>
            <div className="w-16 h-16 bg-[#0f172a]/5 rounded-xl flex items-center justify-center text-[#c20000] mb-8 group-hover:bg-[#c20000] group-hover:text-white transition-colors duration-500">
              <Flag className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-[#0f172a]" style={{ fontFamily: 'var(--font-playfair), serif' }}>Deklarasi Kottabarat</h2>
            <p className="text-[#0f172a]/70 leading-relaxed">
              Melahirkan Enam Penegasan IMM di Surakarta, yang menjadi fondasi dan pijakan ideologis perjuangan seluruh kader IMM se-Indonesia hingga saat ini.
            </p>
          </div>

        </div>
      </section>

      {/* 3. NILAI DASAR */}
      <section className="py-24 bg-white">
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
                <div key={idx} className="group relative">
                  <div className="absolute inset-0 bg-[#0f172a]/5 rounded-2xl scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300"></div>
                  <div className="relative p-8 flex flex-col h-full border-l-2 border-transparent group-hover:border-[#c20000] transition-colors duration-300">
                    <Icon className="w-12 h-12 text-slate-300 group-hover:text-[#c20000] transition-colors duration-500 mb-6" />
                    <h3 className="text-3xl font-bold text-[#0f172a] mb-4" style={{ fontFamily: 'var(--font-playfair), serif' }}>{item.title}</h3>
                    <p className="text-slate-600 leading-relaxed text-lg">
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
      <section className="py-32 bg-[#f8fafc] relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute right-0 top-0 w-1/3 h-full bg-[#0f172a]/5 -skew-x-12 translate-x-1/2"></div>
        
        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            
            {/* Image Side */}
            <div className="relative">
              {/* Offset decorative box */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#c20000] to-red-500 translate-x-6 translate-y-6 rounded-sm"></div>
              {/* Image itself */}
              <div className="relative h-[600px] rounded-sm overflow-hidden shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=2070&auto=format&fit=crop" 
                  alt="Sejarah IMM" 
                  className="w-full h-full object-cover mix-blend-overlay opacity-80 hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-[#0f172a]/80 mix-blend-multiply pointer-events-none"></div>
                
                {/* Superimposed text */}
                <div className="absolute bottom-10 left-10 text-white">
                  <div className="text-7xl font-black mb-2" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>1964</div>
                  <div className="text-xl font-medium tracking-widest uppercase">Tahun Berdiri</div>
                </div>
              </div>
            </div>

            {/* Text Side */}
            <div>
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
