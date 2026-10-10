import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Users } from 'lucide-react';
import { toAbsoluteSiteUrl } from '@/lib/absoluteUrl';

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ periode?: string }> }): Promise<Metadata> {
  const sp = await searchParams;
  const periode = typeof sp?.periode === 'string' && sp.periode ? sp.periode : undefined;
  const canonical = `https://immsolo.or.id/struktural${periode ? `?periode=${encodeURIComponent(periode)}` : ''}`;
  const ogImage = toAbsoluteSiteUrl('/images/imm_hero_bg.jpg');

  return {
    title: 'Struktur Organisasi',
    description: 'Susunan Pimpinan Cabang Ikatan Mahasiswa Muhammadiyah Kota Surakarta.',
    alternates: {
      canonical,
    },
    openGraph: {
      title: 'Struktur Organisasi | PC IMM Kota Surakarta',
      description: 'Susunan Pimpinan Cabang Ikatan Mahasiswa Muhammadiyah Kota Surakarta.',
      url: canonical,
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: 'Struktur Organisasi PC IMM Kota Surakarta',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Struktur Organisasi | PC IMM Kota Surakarta',
      description: 'Susunan Pimpinan Cabang Ikatan Mahasiswa Muhammadiyah Kota Surakarta.',
      images: [ogImage],
    },
  };
}

async function getStruktural() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/struktural`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data?.data || json.data || [];
  } catch (error) {
    console.error('Error fetching struktural:', error);
    return [];
  }
}

import { checkMaintenance } from '@/lib/maintenance';
import MaintenancePage from '@/components/ui/MaintenancePage';

export default async function StrukturalPage({ searchParams }: { searchParams: Promise<{ periode?: string }> }) {
  if (await checkMaintenance('maintenance_profil')) return <MaintenancePage />;
  
  const resolvedSearchParams = await searchParams;
  const allStruktural = await getStruktural();

  const periods = Array.from(new Set(allStruktural.map((s: any) => s.periode))).filter(Boolean).sort().reverse() as string[];
  const currentPeriod = resolvedSearchParams.periode || (periods.length > 0 ? periods[0] : '2024-2025');

  // Remove dummy members used for category structuring
  const struktural = allStruktural.filter((s: any) => s.periode === currentPeriod && s.name !== '-');
  struktural.sort((a: any, b: any) => a.urutan - b.urutan);

  const groupedByKategori = struktural.reduce((acc: any, curr: any) => {
    const kat = curr.kategori || 'BPH';
    if (!acc[kat]) acc[kat] = [];
    acc[kat].push(curr);
    return acc;
  }, {});

  const kategoris = Object.keys(groupedByKategori).sort((a, b) => {
    if (a.toLowerCase() === 'bph') return -1;
    if (b.toLowerCase() === 'bph') return 1;
    if (a.toLowerCase().includes('lembaga')) return 1;
    if (b.toLowerCase().includes('lembaga')) return -1;
    return a.localeCompare(b);
  });

  return (
    <main className="min-h-screen bg-slate-50/70 pt-28 pb-20 font-sans">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 mb-16 text-center">
        <div data-aos="fade-up" className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-[#c20000] border border-red-100 text-xs font-bold uppercase tracking-wider mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#c20000]"></span>
          Kepengurusan Cabang
        </div>
        <div data-aos="fade-up" data-aos-delay="50">
          <h1 className="text-3xl md:text-5xl font-extrabold text-[#0f172a] mb-5 tracking-tight" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
            Struktur Organisasi
          </h1>
        </div>
        <div data-aos="fade-up" data-aos-delay="100">
          <p className="text-base md:text-lg text-slate-500 leading-relaxed font-normal max-w-2xl mx-auto mb-6">
            Formasi kepemimpinan Pimpinan Cabang Ikatan Mahasiswa Muhammadiyah Kota Surakarta Periode {currentPeriod}.
          </p>
        </div>

        {periods.length > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm mt-4">
            <span className="text-slate-400 font-medium mr-2">Pilih Periode:</span>
            <div className="flex flex-wrap justify-center gap-2">
              {periods.map(period => (
                <Link
                  key={period}
                  href={`/struktural?periode=${period}`}
                  scroll={false}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    currentPeriod === period 
                      ? 'bg-[#c20000] text-white shadow-sm' 
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-red-200 hover:text-[#c20000]'
                  }`}
                >
                  {period}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {kategoris.map((kategori) => {
          const kategoriMembers = groupedByKategori[kategori];
          const isBPH = kategori.toLowerCase() === 'bph';

          const groups = kategoriMembers.reduce((acc: any, curr: any) => {
            const group = curr.kelompok_bidang || (isBPH ? '' : 'Lainnya');
            if (!acc[group]) acc[group] = [];
            acc[group].push(curr);
            return acc;
          }, {});

          const sortedGroupNames = Object.keys(groups).sort((a, b) => {
            const minA = Math.min(...groups[a].map((m: any) => m.urutan || 999));
            const minB = Math.min(...groups[b].map((m: any) => m.urutan || 999));
            return minA - minB;
          });

          return (
            <div key={kategori} className="mb-20">
              
              <div className="mb-8 border-b border-slate-200/80 pb-4">
                <h2 className="text-2xl md:text-3xl font-bold text-[#0f172a]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
                  {kategori === 'BPH' ? 'Badan Pimpinan Harian' : kategori}
                </h2>
              </div>
              
              {sortedGroupNames.map((groupName) => {
                const members = groups[groupName];

                return (
                  <div key={groupName} className="mb-12 last:mb-0">
                    {groupName && (
                      <div className="flex items-center gap-4 mb-6">
                        <h3 className="text-xs font-bold text-[#c20000] uppercase tracking-[0.2em] shrink-0 bg-red-50/70 border border-red-100/80 px-3 py-1 rounded-full">
                          {groupName}
                        </h3>
                        <div className="h-px bg-slate-200/80 w-full"></div>
                      </div>
                    )}

                    <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto">
                      {members.map((person: any) => {
                        
                        // Render array of social media or fallback to instagram_url
                        const hasSocials = (person.social_media && person.social_media.length > 0) || person.instagram_url;
                        
                        return (
                          <div 
                            key={person.id} 
                            className="group bg-white rounded-2xl shadow-sm border border-slate-200/90 overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-1.5 hover:border-red-200 transition-all duration-300 w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)]"
                          >
                            {/* Area Foto */}
                            <div className="relative w-full aspect-square bg-slate-100 overflow-hidden">
                              <img 
                                src={person.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=random`} 
                                alt={`Foto ${person.name}`}
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 ease-in-out"
                              />
                            </div>
                            
                            {/* Area Nama & Jabatan */}
                            <div className="p-4 sm:p-5 flex-1 flex flex-col items-center text-center bg-white">
                              <h4 
                                className="text-[13px] md:text-sm font-semibold text-slate-900 tracking-tight leading-snug mb-1 break-words w-full" 
                                style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
                              >
                                {person.name}
                              </h4>
                              <p className={`text-[10px] uppercase tracking-wider leading-snug mb-4 ${
                                person.jabatan?.toLowerCase().includes('ketua') 
                                  ? 'font-bold text-[#c20000]' 
                                  : 'font-semibold text-slate-500'
                              }`}>
                                {person.jabatan}
                              </p>
                              
                              {/* Ikon Sosial Media - Selalu Muncul di Bawah Tengah */}
                              {hasSocials && (
                                <div className="mt-auto flex items-center justify-center gap-2.5 pt-1 w-full">
                                  {person.social_media && person.social_media.length > 0 ? (
                                    person.social_media.map((sm: any, smIdx: number) => (
                                      <a 
                                        key={smIdx} 
                                        href={sm.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="hover:scale-110 transition-transform duration-300 hover:opacity-80 inline-flex items-center justify-center min-w-10 min-h-10"
                                        title={sm.url}
                                        aria-label={`Media sosial ${person.name}`}
                                      >
                                        <img src={sm.icon} alt="" aria-hidden="true" className="w-3.5 h-3.5 object-contain" />
                                      </a>
                                    ))
                                  ) : person.instagram_url ? (
                                    <a 
                                      href={person.instagram_url} 
                                      target="_blank" 
                                      rel="noopener noreferrer" 
                                      className="text-slate-400 hover:text-[#c20000] transition-colors inline-flex items-center justify-center min-w-10 min-h-10"
                                      title="Instagram"
                                      aria-label={`Instagram ${person.name}`}
                                    >
                                      <ArrowUpRight className="w-3.5 h-3.5" />
                                    </a>
                                  ) : null}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}

        {struktural.length === 0 && (
          <div className="text-center py-16 max-w-md mx-auto">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" aria-hidden="true" />
            <p className="text-slate-900 font-semibold text-lg mb-2">Data struktur organisasi belum tersedia.</p>
            <p className="text-slate-500 text-sm">Silakan kembali lagi nanti.</p>
          </div>
        )}

      </div>
    </main>
  );
}
