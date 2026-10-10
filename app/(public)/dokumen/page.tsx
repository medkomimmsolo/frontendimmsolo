import { Metadata } from 'next';
import Link from 'next/link';
import { Download, FileText, HardDrive, Globe, Archive } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const getFileIcon = (type: string) => {
  switch(type?.toLowerCase()) {
    case 'pdf': return <FileText className="w-6 h-6" />;
    case 'word': 
    case 'doc':
    case 'docx': return <FileText className="w-6 h-6 text-blue-600" />;
    case 'excel': 
    case 'xls':
    case 'xlsx': return <FileText className="w-6 h-6 text-green-600" />;
    case 'ppt': 
    case 'pptx': return <FileText className="w-6 h-6 text-orange-600" />;
    case 'drive': return <HardDrive className="w-6 h-6 text-yellow-600" />;
    case 'zip': 
    case 'rar': return <Archive className="w-6 h-6 text-indigo-600" />;
    case 'link': 
    default: return <Globe className="w-6 h-6 text-slate-600" />;
  }
};

import { checkMaintenance } from '@/lib/maintenance';
import MaintenancePage from '@/components/ui/MaintenancePage';
import { toAbsoluteSiteUrl } from '@/lib/absoluteUrl';

export const metadata: Metadata = {
  title: 'Dokumen',
  description: 'Pusat unduhan dokumen resmi, materi kajian, dan panduan organisasi PC IMM Kota Surakarta.',
  alternates: {
    canonical: 'https://immsolo.or.id/dokumen',
  },
  openGraph: {
    title: 'Dokumen | PC IMM Kota Surakarta',
    description: 'Pusat unduhan dokumen resmi, materi kajian, dan panduan organisasi PC IMM Kota Surakarta.',
    url: 'https://immsolo.or.id/dokumen',
    type: 'website',
    images: [
      {
        url: toAbsoluteSiteUrl('/images/imm_hero_bg.jpg'),
        width: 1200,
        height: 630,
        alt: 'Dokumen PC IMM Kota Surakarta',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dokumen | PC IMM Kota Surakarta',
    description: 'Pusat unduhan dokumen resmi, materi kajian, dan panduan organisasi PC IMM Kota Surakarta.',
    images: [toAbsoluteSiteUrl('/images/imm_hero_bg.jpg')],
  },
};

async function getDocuments() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents?public=true`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data.data || json.data || [];
  } catch (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
}

import DokumenClient from './DokumenClient';

export default async function DokumenPage() {
  if (await checkMaintenance('maintenance_dokumen')) return <MaintenancePage />;
  
  const documents = await getDocuments();

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
            <li className="text-[#0f172a] font-medium" aria-current="page">Dokumen</li>
          </ul>
        </nav>
        <div>
          <div data-aos="fade-up" className="flex flex-col border-b border-[#0f172a]/10 pb-4 mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-[#0f172a]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
              Dokumen Resmi
            </h1>
            <p className="text-[#0f172a]/60 mt-2">
              Kumpulan peraturan, materi kajian, form, dan panduan administrasi organisasi.
            </p>
          </div>
        </div>
      </section>

      {/* Dokumen Client with Search & Filter */}
      <DokumenClient documents={documents} />
    </main>
  );
}
