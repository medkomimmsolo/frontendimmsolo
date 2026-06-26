import type { Metadata } from 'next';
import { Inter, Poppins, El_Messiri } from 'next/font/google';
import './globals.css';
import QueryProvider from '@/providers/QueryProvider';
import { Toaster } from 'react-hot-toast';
import SplashScreen from '@/components/ui/SplashScreen';
import { ProgressBarProvider } from '@/components/providers/ProgressBarProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
});

const elMessiri = El_Messiri({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-el-messiri',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  let siteName = 'PC IMM Kota Surakarta | Ikatan Mahasiswa Muhammadiyah';
  let siteDescription =
    'Website resmi Pimpinan Cabang Ikatan Mahasiswa Muhammadiyah (IMM) Kota Surakarta. Wadah perjuangan mahasiswa Muhammadiyah dalam mengembangkan dakwah, intelektualitas, dan kemanusiaan.';
  let siteIcon = '';

  try {
    // Fetch settings from the backend (with 60s cache revalidation)
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, { next: { revalidate: 60 } });
    const json = await res.json();
    const settings = json.data || [];
    
    let settingsMap: Record<string, string> = {};
    if (Array.isArray(settings)) {
      settings.forEach((s: any) => { settingsMap[s.key] = s.value; });
    } else {
      settingsMap = settings;
    }

    if (settingsMap.site_name) siteName = settingsMap.site_name;
    if (settingsMap.site_description) siteDescription = settingsMap.site_description;
    
    if (settingsMap.site_icon) {
       // Since we added /storage/ rewrite in next.config.ts, we can use the relative path 
       // so it works on the same domain and is crawlable by Google
       siteIcon = settingsMap.site_icon;
    }
  } catch (error) {
    console.error("Failed to fetch settings for metadata", error);
  }

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
          url: siteIcon || '/icon.png', // Fallback to icon.png
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
      images: [siteIcon || '/icon.png'],
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

  if (siteIcon) {
    baseMetadata.icons = {
      icon: siteIcon,
      shortcut: siteIcon,
      apple: siteIcon,
    };
  }

  return baseMetadata;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let siteIcon = '';
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, { next: { revalidate: 60 } });
    const json = await res.json();
    const settings = json.data || [];
    
    let settingsMap: Record<string, string> = {};
    if (Array.isArray(settings)) {
      settings.forEach((s: any) => { settingsMap[s.key] = s.value; });
    } else {
      settingsMap = settings;
    }
    if (settingsMap.site_icon) {
      siteIcon = settingsMap.site_icon;
    }
  } catch (error) {
    console.error("Failed to fetch settings for RootLayout", error);
  }

  return (
    <html lang="id" className={`${inter.variable} ${poppins.variable} ${elMessiri.variable}`} data-scroll-behavior="smooth">
      <body className="min-h-screen bg-white text-[#0f172a] font-sans antialiased" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
        <QueryProvider>
          <ProgressBarProvider>
            <SplashScreen iconUrl={siteIcon} />
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
          </ProgressBarProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
