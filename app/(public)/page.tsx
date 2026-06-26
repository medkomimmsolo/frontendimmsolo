import HeroSection from '@/components/sections/HeroSection';
import StatsSection from '@/components/sections/StatsSection';
import AboutPreview from '@/components/sections/AboutPreview';
import ChairmanMessageSection from '@/components/sections/ChairmanMessageSection';
import LatestNews from '@/components/sections/LatestNews';

import CTASection from '@/components/sections/CTASection';
import { checkMaintenance } from '@/lib/maintenance';
import MaintenancePage from '@/components/ui/MaintenancePage';

export const dynamic = 'force-dynamic';

export default async function Home() {
  if (await checkMaintenance('maintenance_beranda')) return <MaintenancePage />;
  let statsData = {
    stat_kader: '2.000+',
    stat_komisariat: '14',
    stat_lembaga: '5',
    stat_universitas: '4',
  };

  let chairmanData = {
    name: '',
    period: '',
    message: '',
    photo: '',
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
    
    if (settingsMap.chairman_name) chairmanData.name = settingsMap.chairman_name;
    if (settingsMap.chairman_period) chairmanData.period = settingsMap.chairman_period;
    if (settingsMap.chairman_message) chairmanData.message = settingsMap.chairman_message;
    if (settingsMap.chairman_photo) chairmanData.photo = settingsMap.chairman_photo;
  } catch (error) {
    console.error("Failed to fetch settings for homepage stats", error);
  }

  let latestPosts: any[] = [];
  try {
    const resPosts = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs`, { next: { revalidate: 60 } });
    if (resPosts.ok) {
      const jsonPosts = await resPosts.json();
      latestPosts = jsonPosts.data?.data || jsonPosts.data || [];
    }
  } catch (error) {
    console.error("Failed to fetch latest posts", error);
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
      <HeroSection stats={statsData} />
      <AboutPreview stats={statsData} />
      <StatsSection stats={statsData} />
      <ChairmanMessageSection {...chairmanData} />
      <LatestNews posts={latestPosts} />

      <CTASection />
    </>
  );
}
