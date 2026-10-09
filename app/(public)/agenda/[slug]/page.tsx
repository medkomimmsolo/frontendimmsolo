import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, Calendar, MapPin, ChevronRight, ExternalLink, Download } from 'lucide-react';
import ShareIconButtons from '@/components/post/ShareIconButtons';
import AddToCalendarButtons from '@/components/agenda/AddToCalendarButtons';
import EventLocationMap from '@/components/agenda/EventLocationMap';
import { notFound } from 'next/navigation';

export const revalidate = 60;

async function getEvent(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error('Error fetching event:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const event = await getEvent(resolvedParams.slug);
  
  if (!event) {
    return {
      title: 'Not Found | PC IMM Kota Surakarta',
    };
  }

  const ogImage = toAbsoluteMediaUrl(event.banner_image) || toAbsoluteSiteUrl('/images/imm_hero_bg.jpg');

  return {
    title: event.title,
    description: event.meta_description || event.description || `Agenda Kegiatan PC IMM Kota Surakarta: ${event.title}`,
    alternates: {
      canonical: `https://immsolo.or.id/agenda/${resolvedParams.slug}`
    },
    openGraph: {
      title: `${event.title} | PC IMM Kota Surakarta`,
      description: event.meta_description || event.description || `Agenda Kegiatan PC IMM Kota Surakarta: ${event.title}`,
      url: `https://immsolo.or.id/agenda/${resolvedParams.slug}`,
      type: 'website',
      images: ogImage ? [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: event.title,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: event.title,
      description: event.meta_description || event.description,
      images: ogImage ? [ogImage] : [],
    }
  };
}

import { checkMaintenance } from '@/lib/maintenance';
import MaintenancePage from '@/components/ui/MaintenancePage';
import { toAbsoluteMediaUrl, toAbsoluteSiteUrl } from '@/lib/absoluteUrl';

export default async function AgendaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  if (await checkMaintenance('maintenance_agenda')) return <MaintenancePage />;
  
  const resolvedParams = await params;
  const event = await getEvent(resolvedParams.slug);

  if (!event) {
    notFound();
  }

  const eventDate = new Date(event.event_date);
  const time = eventDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }).replace(/\./g, ':') + ' WIB';
  const dateStr = eventDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' });

  const eventUrl = toAbsoluteSiteUrl(`/agenda/${resolvedParams.slug}`);
  const eventJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.meta_description || event.description?.replace(/<[^>]*>?/gm, '').slice(0, 300) || undefined,
    startDate: eventDate.toISOString(),
    location: event.location
      ? { '@type': 'Place', name: event.location }
      : undefined,
    url: eventUrl,
    organizer: {
      '@type': 'Organization',
      name: 'PC IMM Kota Surakarta',
      url: 'https://immsolo.or.id',
    },
  };
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Beranda', item: toAbsoluteSiteUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'Agenda', item: toAbsoluteSiteUrl('/agenda') },
      { '@type': 'ListItem', position: 3, name: event.title, item: eventUrl },
    ],
  };

  return (
    <main className="min-h-screen bg-white pt-24 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      
      {/* Article Header */}
      <article className="max-w-4xl mx-auto px-4 md:px-6 mt-10">
        
        {/* Breadcrumb & Back */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/agenda" className="inline-flex items-center text-sm font-semibold text-[#0f172a]/70 hover:text-[#c20000] transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Agenda
          </Link>
          <nav aria-label="breadcrumb" className="flex items-center text-sm text-[#0f172a]/70">
            <ul className="flex items-center space-x-2">
              <li>
                <Link href="/" className="hover:text-[#0f172a]/90">Beranda</Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="w-4 h-4" />
              </li>
              <li>
                <Link href="/agenda" className="hover:text-[#0f172a]/90">Agenda</Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="w-4 h-4" />
              </li>
              <li className="text-[#0f172a]/80 truncate max-w-[200px]" aria-current="page">{event.title}</li>
            </ul>
          </nav>
        </div>

        <Badge className={
          event.status === 'upcoming' ? "bg-[#c20000]/5 text-[#c20000] hover:bg-[#c20000]/10 border-none px-4 py-1.5 mb-6 text-sm" : 
          event.status === 'ongoing' ? "bg-amber-100 text-amber-800 hover:bg-amber-200 border-none px-4 py-1.5 mb-6 text-sm" :
          "bg-[#0f172a]/5 text-[#0f172a]/80 hover:bg-[#0f172a]/10 border-none px-4 py-1.5 mb-6 text-sm"
        }>
          {event.status === 'upcoming' ? 'Mendatang' : 
          event.status === 'ongoing' ? 'Sedang Berlangsung' : 
          event.status === 'cancelled' ? 'Dibatalkan' : 'Selesai'}
        </Badge>

        <h1 
          className="text-3xl md:text-5xl lg:text-6xl font-bold text-[#0f172a] mb-8 leading-[1.15]"
          style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
        >
          {event.title}
        </h1>

        <div className="flex flex-wrap items-center gap-6 py-6 border-y border-[#0f172a]/10 mb-10 text-[#0f172a]/80">
          <div className="flex items-center font-medium">
            <div className="w-10 h-10 rounded-full bg-[#0f172a]/5 border border-[#0f172a]/5 flex items-center justify-center mr-3 text-[#0f172a]/70">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm text-[#0f172a]/70">Tanggal & Waktu</div>
              <div className="text-[#0f172a] font-bold">{dateStr} • {time}</div>
            </div>
          </div>
          <div className="hidden sm:block w-px h-10 bg-[#0f172a]/10"></div>
          <div className="flex items-center font-medium">
            <div className="w-10 h-10 rounded-full bg-[#0f172a]/5 border border-[#0f172a]/5 flex items-center justify-center mr-3 text-[#0f172a]/70">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm text-[#0f172a]/70">Lokasi</div>
              <div className="text-[#0f172a] font-bold">{event.location}</div>
            </div>
          </div>
          
          {/* Share Buttons */}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm font-semibold text-[#0f172a]/70 mr-2 hidden sm:block">Bagikan:</span>
            <ShareIconButtons title={event.title} slug={event.slug} basePath="/agenda" />
            <a href={`${process.env.NEXT_PUBLIC_API_URL}/events/${event.slug}/ics`} download>
              <Button variant="outline" size="icon" className="w-10 h-10 rounded-full border-[#0f172a]/10 text-[#0f172a]/70 hover:text-emerald-600 hover:border-emerald-600 hover:bg-emerald-50" title="Tambah ke Kalender (.ics)">
                <Download className="w-4 h-4" />
              </Button>
            </a>
          </div>
        </div>

        {/* Hero Image */}
        <div className="relative w-full h-[300px] md:h-[500px] rounded-sm overflow-hidden mb-12 shadow-md">
          <img 
            src={event.banner_image || '/images/imm_hero_bg.jpg'} 
            alt={event.title} 
            className="w-full h-full object-cover"
            fetchPriority="high"
            decoding="async"
          />
        </div>

        {/* Article Body (Prose) */}
        <div 
          className="prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-headings:text-[#0f172a] prose-a:text-[#c20000] prose-img:rounded-sm"
          dangerouslySetInnerHTML={{ __html: event.description }}
        />

        {/* Tambah ke Kalender — Google Calendar + .ics */}
        <AddToCalendarButtons
          title={event.title}
          description={event.meta_description || event.description}
          location={event.location}
          startInput={event.event_date}
          slug={event.slug}
        />

        {/* Peta Lokasi Kegiatan */}
        {event.location && (
          <EventLocationMap location={event.location} />
        )}

        {/* Registration Banner */}
        {event.registration_link && event.status === 'upcoming' && (
          <div className="mt-16 bg-white border border-[#c20000]/10 rounded-sm p-8 md:p-12 text-center shadow-lg shadow-[#c20000]/5">
            <div className="w-16 h-16 rounded-full bg-[#c20000]/5 flex items-center justify-center mx-auto mb-6 text-[#c20000]">
              <Calendar className="w-8 h-8" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#0f172a] mb-4" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
              Tertarik Mengikuti Kegiatan Ini?
            </h2>
            <p className="text-[#0f172a]/80 mb-8 max-w-lg mx-auto text-lg">
              Segera daftarkan diri Anda sebelum kuota pendaftaran ditutup.
            </p>
            <Button asChild size="lg" className="font-bold text-lg px-8 h-14 rounded-full shadow-md hover:shadow-lg transition-all group bg-[#c20000] hover:bg-[#a30000] text-white">
              <a href={event.registration_link} target="_blank" rel="noopener noreferrer">
                Daftar Sekarang
                <ExternalLink className="w-5 h-5 ml-2 opacity-70 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
          </div>
        )}

      </article>

    </main>
  );
}
