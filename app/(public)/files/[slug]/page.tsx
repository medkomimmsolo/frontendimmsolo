import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  FileText,
  Image as ImageIcon,
  HardDrive,
  Calendar,
  User,
  Download,
  ArrowLeft,
  FileCheck,
  Globe,
  Archive,
} from 'lucide-react';
import { toAbsoluteMediaUrl, toAbsoluteSiteUrl } from '@/lib/absoluteUrl';
import FileActions from './FileActions';
import { checkMaintenance } from '@/lib/maintenance';
import MaintenancePage from '@/components/ui/MaintenancePage';

export const revalidate = 60;

interface DocumentData {
  id: number;
  title: string;
  slug: string;
  description?: string;
  file_name?: string;
  file_path?: string;
  file_url?: string;
  file_size?: string;
  file_type?: string;
  downloads_count: number;
  status: string;
  created_at: string;
  user?: {
    id: number;
    name: string;
  };
}

async function getDocument(slug: string): Promise<DocumentData | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/files/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (error) {
    console.error('Error fetching file by slug:', error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const doc = await getDocument(resolvedParams.slug);

  if (!doc) {
    return {
      title: 'Berkas Tidak Ditemukan | PC IMM Kota Surakarta',
      description: 'Berkas yang Anda cari tidak ditemukan atau telah dipindahkan.',
    };
  }

  const isImage = doc.file_type === 'image';
  const rawFileUrl = doc.file_path ? toAbsoluteMediaUrl(doc.file_path) : doc.file_url;
  const ogImage = isImage && rawFileUrl ? rawFileUrl : toAbsoluteSiteUrl('/images/imm_hero_bg.jpg');

  const title = `${doc.title} | Berkas PC IMM Kota Surakarta`;
  const description = doc.description || `Unduh dan lihat berkas resmi "${doc.title}" dari PC IMM Kota Surakarta.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://immsolo.or.id/files/${resolvedParams.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://immsolo.or.id/files/${resolvedParams.slug}`,
      type: 'website',
      images: ogImage
        ? [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: doc.title,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : [],
    },
  };
}

export default async function FileDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (await checkMaintenance('maintenance_dokumen')) return <MaintenancePage />;
  const resolvedParams = await params;
  const doc = await getDocument(resolvedParams.slug);

  if (!doc) {
    notFound();
  }

  const isImage = doc.file_type === 'image';
  const isPdf = doc.file_type === 'pdf';
  const directFileUrl = doc.file_path ? toAbsoluteMediaUrl(doc.file_path) : doc.file_url || null;
  const downloadApiUrl = `${process.env.NEXT_PUBLIC_API_URL}/files/${doc.slug}/download`;

  const formattedDate = new Date(doc.created_at).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <main className="min-h-screen bg-slate-50/70 pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="breadcrumb" className="mb-6">
          <ul className="flex items-center text-sm text-slate-500 space-x-2 flex-wrap">
            <li>
              <Link href="/" className="hover:text-[#c20000] transition-colors font-medium">
                Beranda
              </Link>
            </li>
            <li><span className="text-slate-300">/</span></li>
            <li>
              <Link href="/dokumen" className="hover:text-[#c20000] transition-colors font-medium">
                Dokumen & Berkas
              </Link>
            </li>
            <li><span className="text-slate-300">/</span></li>
            <li className="text-[#0f172a] font-semibold truncate max-w-xs sm:max-w-md" aria-current="page">
              {doc.title}
            </li>
          </ul>
        </nav>

        {/* Main Content Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
          
          {/* Header Info */}
          <div className="p-6 sm:p-8 border-b border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-[#c20000] border border-red-100 text-xs font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c20000]"></span>
                {isImage ? 'Foto / Media' : doc.file_type ? doc.file_type.toUpperCase() : 'Berkas'}
              </span>
              <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                /files/{doc.slug}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-[#0f172a] leading-tight mb-3" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
              {doc.title}
            </h1>

            {doc.description && (
              <p className="text-slate-600 text-base leading-relaxed max-w-3xl whitespace-pre-line">
                {doc.description}
              </p>
            )}
          </div>

          {/* Image Preview (if image) */}
          {isImage && directFileUrl && (
            <div className="bg-slate-900/5 p-4 sm:p-6 flex items-center justify-center border-b border-slate-100">
              <div className="relative max-h-[560px] overflow-hidden rounded-xl shadow-inner border border-slate-200/70 bg-white">
                <img
                  src={directFileUrl}
                  alt={doc.title}
                  className="w-full h-auto max-h-[540px] object-contain rounded-xl"
                  loading="eager"
                />
              </div>
            </div>
          )}

          {/* Document Preview Placeholder (if non-image) */}
          {!isImage && (
            <div className="bg-slate-50/60 p-8 sm:p-12 flex flex-col items-center justify-center text-center border-b border-slate-100">
              <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-[#c20000] mb-4">
                {isPdf ? (
                  <FileText className="w-10 h-10 text-red-500" />
                ) : doc.file_type === 'zip' ? (
                  <Archive className="w-10 h-10 text-indigo-500" />
                ) : doc.file_url ? (
                  <Globe className="w-10 h-10 text-blue-500" />
                ) : (
                  <FileCheck className="w-10 h-10 text-emerald-600" />
                )}
              </div>
              <h2 className="text-lg font-bold text-[#0f172a] mb-1">
                {doc.file_name || doc.title}
              </h2>
              <p className="text-sm text-slate-500 max-w-md">
                Berkas siap diunduh atau dibuka langsung melalui tautan di bawah.
              </p>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="p-6 sm:p-8 bg-white space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 px-5 bg-slate-50/70 rounded-xl border border-slate-100 text-sm">
              <div>
                <span className="text-xs text-slate-400 font-medium block mb-1">Format</span>
                <span className="font-semibold text-slate-800 uppercase flex items-center gap-1.5">
                  {isImage ? <ImageIcon className="w-4 h-4 text-emerald-600" /> : <FileText className="w-4 h-4 text-[#c20000]" />}
                  {doc.file_type || 'Berkas'}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-400 font-medium block mb-1">Ukuran</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-slate-500" />
                  {doc.file_size || 'Tautan Eksternal'}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-400 font-medium block mb-1">Tanggal Rilis</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  {formattedDate}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-400 font-medium block mb-1">Total Unduhan</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-blue-600" />
                  {doc.downloads_count.toLocaleString('id-ID')}×
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <FileActions
                slug={doc.slug}
                fileUrl={directFileUrl}
                downloadUrl={downloadApiUrl}
                title={doc.title}
                fileType={doc.file_type}
              />

              <Link
                href="/dokumen"
                className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-[#c20000] transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Lihat Semua Dokumen
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
