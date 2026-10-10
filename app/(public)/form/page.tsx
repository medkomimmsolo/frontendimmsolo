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
    <main className="min-h-screen bg-slate-50/70 pt-28 pb-20 px-4">
      <div className="max-w-2xl mx-auto">
        <div data-aos="fade-up" className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-[#c20000] border border-red-100 text-xs font-bold uppercase tracking-wider mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c20000]"></span>
            Layanan & Pendaftaran
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#0f172a] tracking-tight" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
            Formulir Pendaftaran
          </h1>
          <p className="text-slate-500 mt-2 text-sm md:text-base">Pusat registrasi kegiatan dan layanan administratif online PC IMM Kota Surakarta.</p>
        </div>
        {forms.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/90 p-8 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-red-50 text-[#c20000] flex items-center justify-center mx-auto mb-4 border border-red-100">
              <ClipboardList className="w-8 h-8" aria-hidden="true" />
            </div>
            <p className="text-[#0f172a] font-bold text-lg mb-1">Belum ada formulir yang dibuka.</p>
            <p className="text-sm text-slate-500">Silakan kembali lagi nanti atau hubungi kami untuk informasi lebih lanjut.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {forms.map((f: any) => (
              <Link key={f.id} href={`/form/${f.slug}`}
                className="flex items-center gap-4 bg-white border border-slate-200/90 rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-xl hover:border-red-200 hover:-translate-y-0.5 transition-all duration-300 group">
                <span className="w-12 h-12 shrink-0 inline-flex items-center justify-center rounded-xl bg-red-50 border border-red-100 text-[#c20000] shadow-sm">
                  <ClipboardList className="w-6 h-6" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-bold text-base text-[#0f172a] group-hover:text-[#c20000] transition-colors" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>{f.title}</span>
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
