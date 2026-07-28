import { Metadata } from 'next';
import Link from 'next/link';
import { Download, FileText, HardDrive, Globe, Archive, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { checkMaintenance } from '@/lib/maintenance';
import MaintenancePage from '@/components/ui/MaintenancePage';

const getFileIcon = (type: string) => {
  switch(type?.toLowerCase()) {
    case 'pdf': return <FileText className="w-8 h-8 text-rose-500 group-hover:scale-110 transition-transform duration-500" />;
    case 'word': 
    case 'doc':
    case 'docx': return <FileText className="w-8 h-8 text-blue-500 group-hover:scale-110 transition-transform duration-500" />;
    case 'excel': 
    case 'xls':
    case 'xlsx': return <FileText className="w-8 h-8 text-emerald-500 group-hover:scale-110 transition-transform duration-500" />;
    case 'ppt': 
    case 'pptx': return <FileText className="w-8 h-8 text-orange-500 group-hover:scale-110 transition-transform duration-500" />;
    case 'drive': return <HardDrive className="w-8 h-8 text-amber-500 group-hover:scale-110 transition-transform duration-500" />;
    case 'zip': 
    case 'rar': return <Archive className="w-8 h-8 text-indigo-500 group-hover:scale-110 transition-transform duration-500" />;
    case 'link': 
    default: return <Globe className="w-8 h-8 text-slate-500 group-hover:scale-110 transition-transform duration-500" />;
  }
};

export const metadata: Metadata = {
  title: 'Dokumen | PC IMM Kota Surakarta',
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

export default async function DokumenPage() {
  if (await checkMaintenance('maintenance_dokumen')) return <MaintenancePage />;
  
  const documents = await getDocuments();

  return (
    <main className="min-h-screen bg-slate-50 selection:bg-[#c20000]/20">
      
      {/* Hero Section with Glassmorphism and Gradients */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden bg-[#0f172a]">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-b from-[#c20000]/30 to-transparent blur-[120px]"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-t from-blue-600/20 to-transparent blur-[100px]"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 md:px-6 z-10">
          <nav aria-label="breadcrumb" className="mb-8">
            <ul className="flex items-center text-sm text-slate-300 space-x-2">
              <li>
                <Link href="/" className="hover:text-white transition-colors flex items-center">
                  Home
                </Link>
              </li>
              <li><ChevronRight className="w-4 h-4 text-slate-500" /></li>
              <li className="text-white font-medium" aria-current="page">Dokumen</li>
            </ul>
          </nav>
          
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/90 text-sm font-medium mb-6 backdrop-blur-md">
              <Archive className="w-4 h-4 text-[#c20000]" />
              <span>Pusat Unduhan Resmi</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight leading-tight" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
              Dokumen & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c20000] to-red-400">Arsip Organisasi</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
              Kumpulan peraturan, materi kajian, formulir, dan panduan administrasi untuk menunjang pergerakan ikatan.
            </p>
          </div>
        </div>
      </section>

      {/* Documents List */}
      <section className="relative -mt-10 max-w-7xl mx-auto px-4 md:px-6 z-20 pb-24">
        {documents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {documents.map((doc: any) => (
              <Card key={doc.id} className="group relative bg-white border border-slate-200/60 rounded-[2rem] overflow-hidden hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:-translate-y-2 transition-all duration-500">
                {/* Hover Top Gradient Line */}
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#c20000] to-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <CardContent className="p-8 flex flex-col h-full">
                  {/* Icon & Meta */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-[#c20000]/5 group-hover:border-[#c20000]/20 transition-all duration-500 relative overflow-hidden">
                      {/* Glow effect behind icon */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#c20000]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
                      <div className="relative z-10">
                        {getFileIcon(doc.file_type)}
                      </div>
                    </div>
                    
                    {doc.file_type && (
                      <span className="px-3.5 py-1.5 bg-slate-50 text-slate-500 border border-slate-100 text-xs font-bold rounded-full uppercase tracking-wider group-hover:bg-[#c20000] group-hover:text-white group-hover:border-[#c20000] transition-colors duration-300 shadow-sm">
                        {doc.file_type}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-[#0f172a] mb-3 leading-snug group-hover:text-[#c20000] transition-colors line-clamp-2" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
                    {doc.title}
                  </h3>
                  
                  {doc.description && (
                    <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed mb-6">
                      {doc.description}
                    </p>
                  )}
                  
                  {!doc.description && <div className="mb-6 flex-1"></div>}
                  
                  <div className="mt-auto"></div>

                  {/* Footer */}
                  <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center text-sm text-slate-500 font-medium">
                      {doc.file_size ? (
                         <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                           <HardDrive className="w-4 h-4 text-slate-400" />
                           {doc.file_size}
                         </span>
                      ) : (
                         <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                           <Globe className="w-4 h-4 text-slate-400" />
                           Web Link
                         </span>
                      )}
                    </div>
                    
                    <a 
                      href={`${process.env.NEXT_PUBLIC_API_URL}/documents/${doc.id}/download`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group/btn inline-flex items-center justify-center h-11 px-5 rounded-xl bg-slate-900 text-white font-medium hover:bg-[#c20000] hover:shadow-lg hover:shadow-[#c20000]/25 transition-all duration-300 gap-2"
                    >
                      <Download className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                      <span>{doc.file_path ? 'Unduh' : 'Buka'}</span>
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-[2rem] border border-slate-200/60 shadow-sm relative overflow-hidden">
            <div className="w-20 h-20 bg-slate-50 border border-slate-100 text-slate-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Archive className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-[#0f172a] mb-3" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>Belum Ada Dokumen</h3>
            <p className="text-slate-500 max-w-md mx-auto text-lg">
              Saat ini belum ada dokumen yang dipublikasikan. Silakan periksa kembali nanti.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
