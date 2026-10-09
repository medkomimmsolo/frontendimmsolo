import { Metadata } from 'next';
import Link from 'next/link';
import { ClipboardList, ArrowRight } from 'lucide-react';
import { toAbsoluteSiteUrl } from '@/lib/absoluteUrl';

export const metadata: Metadata = {
  title: 'Formulir Pendaftaran',
  description: 'Daftar formulir pendaftaran online PC IMM Kota Surakarta.',
  alternates: {
    canonical: 'https://immsolo.or.id/form',
  },
  openGraph: {
    title: 'Formulir Pendaftaran | PC IMM Kota Surakarta',
    description: 'Daftar formulir pendaftaran online PC IMM Kota Surakarta.',
    url: 'https://immsolo.or.id/form',
    type: 'website',
    images: [
      {
        url: toAbsoluteSiteUrl('/images/imm_hero_bg.jpg'),
        width: 1200,
        height: 630,
        alt: 'Formulir Pendaftaran PC IMM Kota Surakarta',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Formulir Pendaftaran | PC IMM Kota Surakarta',
    description: 'Daftar formulir pendaftaran online PC IMM Kota Surakarta.',
    images: [toAbsoluteSiteUrl('/images/imm_hero_bg.jpg')],
  },
};

async function getForms() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forms`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export default async function FormIndexPage() {
  const forms = await getForms();

  return (
    <main className="min-h-screen bg-[#f8f9fa] pt-28 pb-20 px-4">
      <div className="max-w-2xl mx-auto">
        <div data-aos="fade-up" className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[#0f172a]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
            Formulir Pendaftaran
          </h1>
          <p className="text-slate-500 mt-2">PC IMM Kota Surakarta</p>
        </div>
        {forms.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-4" aria-hidden="true" />
            <p className="text-[#0f172a] font-semibold mb-1">Belum ada formulir yang dibuka.</p>
            <p className="text-sm text-slate-500">Silakan kembali lagi nanti atau hubungi kami untuk informasi.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {forms.map((f: any) => (
              <Link key={f.id} href={`/form/${f.slug}`}
                className="flex items-center gap-4 bg-white border border-slate-200 rounded-sm p-5 shadow-sm hover:shadow-md hover:border-[#c20000]/30 transition-all group">
                <span className="w-11 h-11 shrink-0 inline-flex items-center justify-center rounded-sm bg-[#c20000]/10 text-[#c20000]">
                  <ClipboardList className="w-5 h-5" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-bold text-[#0f172a] group-hover:text-[#c20000] transition-colors">{f.title}</span>
                  {f.description && <span className="block text-sm text-slate-500 mt-0.5 line-clamp-1">{f.description}</span>}
                </span>
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-[#c20000] group-hover:translate-x-1 transition-all shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
