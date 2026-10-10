import HeroSection from '@/components/sections/HeroSection';
import StatsSection from '@/components/sections/StatsSection';
import AboutPreview from '@/components/sections/AboutPreview';
import ChairmanMessageSection from '@/components/sections/ChairmanMessageSection';
import LatestNews from '@/components/sections/LatestNews';

import CTASection from '@/components/sections/CTASection';
import { checkMaintenance } from '@/lib/maintenance';
import MaintenancePage from '@/components/ui/MaintenancePage';
import { getApiBase, normalizeSettings, type Settings } from '@/lib/settings';
import { Metadata } from 'next';
import { toAbsoluteSiteUrl } from '@/lib/absoluteUrl';

export const metadata: Metadata = {
  title: 'Beranda',
  description: 'Website resmi Pimpinan Cabang Ikatan Mahasiswa Muhammadiyah (IMM) Kota Surakarta — berita, agenda, struktural, dokumen, dan layanan kader.',
  alternates: {
    canonical: 'https://immsolo.or.id',
  },
  openGraph: {
    title: 'PC IMM Kota Surakarta',
    description: 'Website resmi Pimpinan Cabang Ikatan Mahasiswa Muhammadiyah (IMM) Kota Surakarta.',
    url: 'https://immsolo.or.id',
    type: 'website',
    images: [
      {
        url: toAbsoluteSiteUrl('/images/imm_hero_bg.jpg'),
        width: 1200,
        height: 630,
        alt: 'PC IMM Kota Surakarta',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PC IMM Kota Surakarta',
    description: 'Website resmi Pimpinan Cabang Ikatan Mahasiswa Muhammadiyah (IMM) Kota Surakarta.',
    images: [toAbsoluteSiteUrl('/images/imm_hero_bg.jpg')],
  },
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function fetchSettings(): Promise<Settings> {
  try {
    const res = await fetch(`${getApiBase()}/settings`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return {};
    const json = await res.json();
    return normalizeSettings(json?.data);
  } catch (error) {
    console.error("Failed to fetch settings", error);
    return {};
  }
}

async function fetchLatestPosts(): Promise<any[]> {
  try {
    const res = await fetch(`${getApiBase()}/blogs?per_page=6`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data?.data || json.data || [];
  } catch (error) {
    console.error("Failed to fetch latest posts", error);
    return [];
  }
}

async function fetchLatestEvents(): Promise<any[]> {
  try {
    const res = await fetch(`${getApiBase()}/events?per_page=3`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data?.data || json.data || [];
  } catch (error) {
    console.error("Failed to fetch latest events", error);
    return [];
  }
}

export default async function Home() {
  if (await checkMaintenance('maintenance_beranda')) return <MaintenancePage />;
  const statsData = {
    stat_kader: '2.000+',
    stat_komisariat: '14',
    stat_lembaga: '5',
    stat_universitas: '4',
  };

  const chairmanData = {
    name: '',
    period: '',
    message: '',
    photo: '',
  };

  const [settingsMap, latestPosts, latestEvents] = await Promise.all([
    fetchSettings().catch(() => ({} as Settings)),
    fetchLatestPosts(),
    fetchLatestEvents(),
  ]);

  try {
    if (settingsMap.stat_kader) statsData.stat_kader = settingsMap.stat_kader;
    if (settingsMap.stat_komisariat) statsData.stat_komisariat = settingsMap.stat_komisariat;
    if (settingsMap.stat_lembaga) statsData.stat_lembaga = settingsMap.stat_lembaga;
    if (settingsMap.stat_universitas) statsData.stat_universitas = settingsMap.stat_universitas;

    if (settingsMap.chairman_name) chairmanData.name = settingsMap.chairman_name;
    if (settingsMap.chairman_period) chairmanData.period = settingsMap.chairman_period;
    if (settingsMap.chairman_message) chairmanData.message = settingsMap.chairman_message;
    if (settingsMap.chairman_photo) chairmanData.photo = settingsMap.chairman_photo;
  } catch (error) {
    console.error("Failed to map settings for homepage stats", error);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "PC IMM Kota Surakarta",
    "alternateName": [
      "PC IMM Solo",
      "IMM Kota Surakarta",
      "IMM Solo",
      "Ikatan Mahasiswa Muhammadiyah Surakarta"
    ],
    "url": "https://immsolo.or.id",
    "logo": "https://immsolo.or.id/logo.png",
    "description": "Website resmi Pimpinan Cabang Ikatan Mahasiswa Muhammadiyah (IMM) Kota Surakarta. Wadah perjuangan mahasiswa Muhammadiyah.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Surakarta",
      "addressRegion": "Jawa Tengah",
      "addressCountry": "ID"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroSection stats={statsData} events={latestEvents} />
      <AboutPreview stats={statsData} />
      <StatsSection stats={statsData} />
      <ChairmanMessageSection {...chairmanData} />
      <LatestNews posts={latestPosts} />

      <CTASection />
    </>
  );
}
