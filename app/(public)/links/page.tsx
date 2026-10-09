import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Link2 } from 'lucide-react';
import { toAbsoluteSiteUrl } from '@/lib/absoluteUrl';

export const metadata: Metadata = {
  title: 'Tautan Resmi',
  description: 'Kumpulan tautan resmi Pimpinan Cabang Ikatan Mahasiswa Muhammadiyah Kota Surakarta.',
  alternates: {
    canonical: 'https://immsolo.or.id/links',
  },
  openGraph: {
    title: 'Tautan Resmi | PC IMM Kota Surakarta',
    description: 'Kumpulan tautan resmi Pimpinan Cabang Ikatan Mahasiswa Muhammadiyah Kota Surakarta.',
    url: 'https://immsolo.or.id/links',
    type: 'website',
    images: [
      {
        url: toAbsoluteSiteUrl('/images/imm_hero_bg.jpg'),
        width: 1200,
        height: 630,
        alt: 'Tautan Resmi PC IMM Kota Surakarta',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tautan Resmi | PC IMM Kota Surakarta',
    description: 'Kumpulan tautan resmi Pimpinan Cabang Ikatan Mahasiswa Muhammadiyah Kota Surakarta.',
    images: [toAbsoluteSiteUrl('/images/imm_hero_bg.jpg')],
  },
};

async function getPages() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/links`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export default async function LinksIndexPage() {
  const pages = await getPages();

  return (
    <main className="min-h-screen bg-[#f8f9fa] pt-28 pb-20 px-4">
      <div className="max-w-2xl mx-auto">
        <div data-aos="fade-up" className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[#0f172a]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
            Tautan Resmi
          </h1>
          <p className="text-slate-500 mt-2">PC IMM Kota Surakarta</p>
        </div>

        {pages.length === 0 ? (
          <div className="text-center py-12">
            <Link2 className="w-12 h-12 text-slate-300 mx-auto mb-4" aria-hidden="true" />
            <p className="text-[#0f172a] font-semibold mb-1">Belum ada halaman tautan.</p>
            <p className="text-sm text-slate-500">Silakan kembali lagi nanti.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pages.map((page: any) => (
              <Link key={page.id} href={`/links/${page.slug}`}
                className="flex items-center justify-between bg-white border border-slate-200 rounded-sm p-5 shadow-sm hover:shadow-md hover:border-[#c20000]/30 transition-all group">
                <div>
                  <h2 className="font-bold text-[#0f172a] group-hover:text-[#c20000] transition-colors">{page.title}</h2>
                  {page.description && <p className="text-sm text-slate-500 mt-1 line-clamp-1">{page.description}</p>}
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-[#c20000] group-hover:translate-x-1 transition-all shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
