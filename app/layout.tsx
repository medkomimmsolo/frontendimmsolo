import type { Metadata, Viewport } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import QueryProvider from '@/providers/QueryProvider';
import { Toaster } from 'react-hot-toast';
import SplashScreen from '@/components/ui/SplashScreen';
import { ProgressBarProvider } from '@/components/providers/ProgressBarProvider';
import { ConfirmProvider } from '@/components/providers/ConfirmProvider';
import SwRegister from '@/components/providers/SwRegister';
import AosInit from '@/components/providers/AosInit';
import { getSiteSettings } from '@/lib/siteSettings';
import { toAbsoluteMediaUrl, toAbsoluteSiteUrl } from '@/lib/absoluteUrl';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});

const poppins = Poppins({
  weight: ['600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
  preload: true,
});

export async function generateMetadata(): Promise<Metadata> {
  let siteName = 'PC IMM Kota Surakarta | Ikatan Mahasiswa Muhammadiyah';
  let siteDescription =
    'Website resmi Pimpinan Cabang Ikatan Mahasiswa Muhammadiyah (IMM) Kota Surakarta. Wadah perjuangan mahasiswa Muhammadiyah dalam mengembangkan dakwah, intelektualitas, dan kemanusiaan.';

  // Single settings fetch for the whole render pass (shared with RootLayout).
  const settingsMap = await getSiteSettings();

  if (settingsMap.site_name) siteName = settingsMap.site_name;
  if (settingsMap.site_description) siteDescription = settingsMap.site_description;

  const rawIcon = settingsMap.site_icon ?? '';
  const iconAbs = toAbsoluteMediaUrl(rawIcon) || toAbsoluteSiteUrl('/icon-512.png');
  // OG image: jangan pakai ikon kotak untuk aspek 1200x630. Pakai hero absolut.
  const ogImage = toAbsoluteSiteUrl('/images/imm_hero_bg.jpg');

  const baseMetadata: Metadata = {
    metadataBase: new URL('https://immsolo.or.id'),
    title: {
      default: siteName,
      template: `%s | ${siteName.split('|')[0].trim()}`,
    },
    description: siteDescription,
    keywords: [
      "PC IMM Kota Surakarta",
      "PC IMM Solo",
      "IMM Kota Surakarta",
      "IMM Solo",
      "Surakarta",
      "Solo",
      "IMM",
      "UMS",
      "UMPKU Surakarta",
      "UNISA Surakarta",
      "UNS",
      "Universitas Muhammadiyah Surakarta",
      "Universitas PKU Muhammadiyah Surakarta",
      "Universitas Aisyiyah Surakarta",
      "Universitas Sebelas Maret",
      "Ikatan Mahasiswa Muhammadiyah",
      "Pimpinan Cabang Ikatan Mahasiswa Muhammadiyah",
      "Pimpinan Cabang Ikatan Mahasiswa Muhammadiyah Kota Surakarta",
      "Pimpinan Cabang Ikatan Mahasiswa Muhammadiyah Solo"
    ],
    authors: [{ name: "PC IMM Kota Surakarta", url: "https://immsolo.or.id" }],
    creator: "PC IMM Kota Surakarta",
    publisher: "PC IMM Kota Surakarta",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      title: siteName,
      description: siteDescription,
      url: 'https://immsolo.or.id',
      siteName: siteName,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: siteName,
        },
      ],
      locale: 'id_ID',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: siteName,
      description: siteDescription,
      images: [ogImage],
    },
    icons: {
      icon: iconAbs,
      shortcut: iconAbs,
      apple: iconAbs,
    },
    manifest: '/manifest.webmanifest',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: 'PC IMM Surakarta',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };

  return baseMetadata;
}

export const viewport: Viewport = {
  themeColor: '#c20000',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Same cached fetch as generateMetadata above — no second round-trip.
  const settingsMap = await getSiteSettings();
  const siteIcon = settingsMap.site_icon ?? '';

  return (
    <html lang="id" className={`${inter.variable} ${poppins.variable}`} data-scroll-behavior="smooth">
      <body className="min-h-screen bg-white text-[#0f172a] font-sans antialiased" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
        <QueryProvider>
          <ProgressBarProvider>
            <ConfirmProvider>
            <SplashScreen iconUrl={siteIcon} />
            <SwRegister />
            <AosInit />
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#ffffff',
                  color: '#0f172a',
                  border: '1px solid rgba(220, 38, 38, 0.2)',
                },
                success: {
                  iconTheme: {
                    primary: '#dc2626',
                    secondary: '#ffffff',
                  },
                },
              }}
            />
                      </ConfirmProvider>
          </ProgressBarProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
