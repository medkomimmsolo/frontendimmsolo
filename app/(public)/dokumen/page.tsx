import { Metadata } from 'next';
import Link from 'next/link';
import { Download, FileText, Calendar, Link as LinkIcon, HardDrive, Globe, ExternalLink, Archive } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const getFileIcon = (type: string) => {
  switch(type) {
    case 'pdf': return <FileText className="w-6 h-6" />;
    case 'word': return <FileText className="w-6 h-6 text-blue-600" />;
    case 'excel': return <FileText className="w-6 h-6 text-green-600" />;
    case 'ppt': return <FileText className="w-6 h-6 text-orange-600" />;
    case 'drive': return <HardDrive className="w-6 h-6 text-yellow-600" />;
    case 'zip': return <Archive className="w-6 h-6 text-indigo-600" />;
    case 'link': 
    default: return <Globe className="w-6 h-6 text-slate-600" />;
  }
};

export const metadata: Metadata = {
  title: 'Dokumen',
  description: 'Pusat unduhan dokumen resmi, materi kajian, dan panduan organisasi PC IMM Kota Surakarta.',
};

export const dynamic = 'force-dynamic';

async function getDocuments() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents?public=true`, {
      cache: 'no-store'
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data.data || json.data || [];
  } catch (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
}

import { checkMaintenance } from '@/lib/maintenance';
import MaintenancePage from '@/components/ui/MaintenancePage';

export default async function DokumenPage() {
  if (await checkMaintenance('maintenance_dokumen')) return <MaintenancePage />;
  
  const documents = await getDocuments();

  return (
    <main className="min-h-screen bg-[#f8f9fa] pt-24 pb-20">
      
      {/* Breadcrumb & Title Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pt-4 pb-6">
        <nav aria-label="breadcrumb" className="mb-4">
          <ul className="flex items-center text-sm text-[#0f172a]/60 space-x-2">
            <li>
              <Link href="/" className="hover:text-[#c20000] transition-colors flex items-center">
                Home
              </Link>
            </li>
            <li>
              <span className="text-[#0f172a]/40 mx-1">/</span>
            </li>
            <li className="text-[#0f172a] font-medium" aria-current="page">Dokumen</li>
          </ul>
        </nav>
        <div className="flex flex-col border-b border-[#0f172a]/10 pb-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-[#0f172a]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
            Dokumen Resmi
          </h1>
          <p className="text-[#0f172a]/60 mt-2">
            Kumpulan peraturan, materi kajian, form, dan panduan administrasi organisasi.
          </p>
        </div>
      </section>

      {/* Documents List */}
      <section className="max-w-7xl mx-auto px-4 md:px-6">
        {documents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {documents.map((doc: any) => (
              <Card key={doc.id} className="border-0 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full bg-white rounded-2xl overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#c20000] to-red-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CardContent className="p-6 flex flex-col flex-1">
                  
                  {/* Icon & Title */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 shrink-0 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-red-50 transition-all duration-300 shadow-sm">
                      {getFileIcon(doc.file_type)}
                    </div>
                    <div className="flex-1 pt-1">
                      <h3 className="text-base font-bold text-[#0f172a] leading-snug line-clamp-2 group-hover:text-[#c20000] transition-colors" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
                        {doc.title}
                      </h3>
                      {doc.file_type && (
                        <span className="inline-block mt-1.5 px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-md uppercase tracking-widest border border-slate-200">
                          {doc.file_type}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Description */}
                  {doc.description && (
                    <p className="text-sm text-[#0f172a]/60 line-clamp-2 mb-5 leading-relaxed">
                      {doc.description}
                    </p>
                  )}
                  
                  {!doc.description && <div className="mb-5 flex-1"></div>}

                  {/* Footer Action */}
                  <div className="mt-auto pt-5 border-t border-slate-100/80 flex items-center justify-between">
                    <div className="text-xs text-slate-400 font-semibold flex items-center">
                      {doc.file_size ? (
                        <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                          <HardDrive className="w-3.5 h-3.5" />
                          {doc.file_size}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                          <Globe className="w-3.5 h-3.5" />
                          Web Link
                        </span>
                      )}
                    </div>
                    
                    <a 
                      href={`${process.env.NEXT_PUBLIC_API_URL}/documents/${doc.id}/download`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="shrink-0"
                    >
                      <Button size="sm" className="bg-slate-900 text-white hover:bg-[#c20000] rounded-lg shadow-sm px-4 h-9 transition-colors">
                        <Download className="w-4 h-4 mr-1.5" />
                        {doc.file_path ? 'Unduh' : 'Buka'}
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-lg border border-slate-200">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-[#0f172a] mb-2">Belum Ada Dokumen</h3>
            <p className="text-[#0f172a]/60 max-w-md mx-auto">
              Saat ini belum ada dokumen yang dipublikasikan. Silakan periksa kembali nanti.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
