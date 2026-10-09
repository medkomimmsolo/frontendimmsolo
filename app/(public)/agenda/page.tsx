import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import AgendaView from '@/components/agenda/AgendaView';

import { checkMaintenance } from '@/lib/maintenance';
import MaintenancePage from '@/components/ui/MaintenancePage';
import { toAbsoluteSiteUrl } from '@/lib/absoluteUrl';

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ filter?: string }> }): Promise<Metadata> {
  const sp = await searchParams;
  const filter = sp?.filter && sp.filter !== 'all' ? sp.filter : undefined;
  const canonical = `https://immsolo.or.id/agenda${filter ? `?filter=${filter}` : ''}`;
  const ogImage = toAbsoluteSiteUrl('/images/imm_hero_bg.jpg');

  return {
    title: 'Agenda Kegiatan',
    description: 'Jadwal dan informasi agenda kegiatan Ikatan Mahasiswa Muhammadiyah Kota Surakarta.',
    alternates: {
      canonical,
    },
    openGraph: {
      title: 'Agenda Kegiatan | PC IMM Kota Surakarta',
      description: 'Jadwal dan informasi agenda kegiatan Ikatan Mahasiswa Muhammadiyah Kota Surakarta.',
      url: canonical,
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: 'Agenda Kegiatan PC IMM Kota Surakarta',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Agenda Kegiatan | PC IMM Kota Surakarta',
      description: 'Jadwal dan informasi agenda kegiatan Ikatan Mahasiswa Muhammadiyah Kota Surakarta.',
      images: [ogImage],
    }
  };
}

const filterTabs = [
  { label: 'Semua', value: 'all' },
  { label: 'Mendatang', value: 'upcoming' },
  { label: 'Sedang Berlangsung', value: 'ongoing' },
  { label: 'Selesai', value: 'completed' },
];

export const revalidate = 30;

async function getEvents() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events`, { next: { revalidate: 30 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data.data || json.data || [];
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

export default async function AgendaPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  if (await checkMaintenance('maintenance_agenda')) return <MaintenancePage />;
  
  const resolvedSearchParams = await searchParams;
  const currentFilter = resolvedSearchParams.filter || 'all';
  
  let events = await getEvents();
  
  // Calculate dynamic statuses
  const now = new Date();
  events = events.map((event: any) => {
    const eventDate = new Date(event.event_date);
    // Calculate difference in days (ignoring time for pure day countdown)
    const diffTime = eventDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let computedStatus = event.status;
    let badgeText = '';
    let badgeClass = '';

    if (event.status !== 'cancelled') {
      if (diffDays < 0) {
        computedStatus = 'completed';
        badgeText = 'Selesai';
        badgeClass = 'bg-[#0f172a]/10 text-[#0f172a] hover:bg-[#0f172a]/20';
      } else if (diffDays === 0) {
        computedStatus = 'ongoing';
        badgeText = 'Sedang Berlangsung';
        badgeClass = 'bg-[#fcd34d] text-[#0f172a] hover:bg-[#fcd34d]';
      } else if (diffDays <= 30) {
        computedStatus = 'upcoming';
        badgeText = `H-${diffDays}`;
        badgeClass = 'bg-amber-500 text-white hover:bg-amber-600';
      } else {
        computedStatus = 'upcoming';
        badgeText = 'Akan Datang';
        badgeClass = 'bg-[#c20000] text-white hover:bg-[#a30000]';
      }
    } else {
      computedStatus = 'cancelled';
      badgeText = 'Dibatalkan';
      badgeClass = 'bg-red-100 text-red-600';
    }

    return { ...event, computedStatus, badgeText, badgeClass };
  });

  // Apply filter based on computedStatus
  if (currentFilter !== 'all') {
    events = events.filter((e: any) => e.computedStatus === currentFilter);
  }

  return (
    <main className="min-h-screen bg-[#f8f9fa] pt-28 pb-20">
      
      {/* Breadcrumb & Title Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pt-4 pb-6">
        <nav aria-label="breadcrumb" className="mb-4">
          <ul className="flex items-center text-sm text-[#0f172a]/60 space-x-2">
            <li>
              <Link href="/" className="hover:text-[#c20000] transition-colors flex items-center">
                Beranda
              </Link>
            </li>
            <li>
              <span className="text-[#0f172a]/40 mx-1">/</span>
            </li>
            <li className="text-[#0f172a] font-medium" aria-current="page">Agenda</li>
          </ul>
        </nav>
        <div>
          <div data-aos="fade-up" className="flex items-center justify-between border-b border-[#0f172a]/10 pb-4 mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-[#0f172a]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
              Agenda Kegiatan
            </h1>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-6 mb-16">
        
        {/* Filter Navigation */}
        <div className="flex flex-wrap items-center gap-3 mb-8 pb-4 overflow-x-auto no-scrollbar">
          {filterTabs.map((tab) => {
            const isActive = currentFilter === tab.value;
            return (
              <Button
                key={tab.value}
                asChild
                variant={isActive ? "default" : "outline"}
                className={!isActive ? "border-[#0f172a]/10 bg-white hover:border-[#c20000] hover:text-[#c20000]" : "bg-[#0f172a] text-white hover:bg-[#0f172a]/90 shadow-none"}
              >
                <Link href={tab.value === 'all' ? '/agenda' : `/agenda?filter=${tab.value}`} scroll={false}>
                  {tab.label}
                </Link>
              </Button>
            );
          })}
        </div>

        {/* Agenda View (Toggle List & Kalender) */}
        <AgendaView events={events} />

      </section>
    </main>
  );
}
