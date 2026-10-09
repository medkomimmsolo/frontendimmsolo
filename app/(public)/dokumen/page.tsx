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

      {/* Documents List */}
      <section className="max-w-7xl mx-auto px-4 md:px-6">
        {documents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {documents.map((doc: any) => (
              <Card key={doc.id} className="border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 bg-white rounded-sm overflow-hidden flex flex-col h-full group">
                <CardContent className="p-5 flex flex-col flex-1">
                  
                  {/* Icon & Meta */}
                  <div className="flex items-start justify-between mb-4 gap-3">
                    <div className="w-12 h-12 shrink-0 bg-slate-50 border border-slate-100 rounded-sm flex items-center justify-center text-slate-500 group-hover:bg-[#c20000]/5 group-hover:border-[#c20000]/10 transition-colors">
                      {getFileIcon(doc.file_type)}
                    </div>
                    {doc.file_type && (
                      <span className="shrink-0 px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase tracking-wider">
                        {doc.file_type}
                      </span>
                    )}
                  </div>
                  
                  {/* Content */}
                  <h2 className="text-base font-semibold text-[#0f172a] leading-snug line-clamp-2 group-hover:text-[#c20000] transition-colors mb-2">
                    {doc.title}
                  </h2>
                  
                  {doc.description && (
                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-4">
                      {doc.description}
                    </p>
                  )}
                  
                  {!doc.description && <div className="mb-4 flex-1"></div>}

                  {/* Footer Action */}
                  <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-xs text-slate-500 font-medium flex items-center gap-3">
                      {doc.file_size ? (
                        <span className="flex items-center gap-1.5">
                          <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                          {doc.file_size}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-slate-400" />
                          Web Link
                        </span>
                      )}
                      {doc.downloads_count > 0 && (
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <Download className="w-3 h-3" />
                          {doc.downloads_count.toLocaleString('id-ID')}×
                        </span>
                      )}
                    </div>
                    
                    <Button asChild size="sm" className="bg-[#c20000] text-white hover:bg-[#a30000] border-none rounded-sm px-4 h-8 shadow-sm transition-colors text-xs font-medium shrink-0">
                      <a 
                        href={`${process.env.NEXT_PUBLIC_API_URL}/documents/${doc.id}/download`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <Download className="w-3.5 h-3.5 mr-1.5" />
                        {doc.file_path ? 'Unduh' : 'Buka'}
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-sm border border-slate-200">
            <div className="w-16 h-16 bg-slate-50 border border-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Archive className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-semibold text-[#0f172a] mb-2">Belum Ada Dokumen</h2>
            <p className="text-slate-500 max-w-md mx-auto text-sm">
              Saat ini belum ada dokumen yang dipublikasikan. Silakan periksa kembali nanti.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
