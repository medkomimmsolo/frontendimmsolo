import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import FormFillClient from '@/components/form/FormFillClient';

async function getForm(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forms/${slug}`, { next: { revalidate: 30 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const form = await getForm(slug);
  if (!form) return { title: 'Tidak Ditemukan' };
  const canonical = `https://immsolo.or.id/form/${slug}`;
  return {
    title: `${form.title} — Formulir Online`,
    description: form.description || `Formulir pendaftaran ${form.title} — PC IMM Kota Surakarta.`,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${form.title} | PC IMM Kota Surakarta`,
      description: form.description || `Formulir pendaftaran ${form.title} — PC IMM Kota Surakarta.`,
      url: canonical,
      type: 'website',
      images: form.header_image ? [{ url: form.header_image }] : undefined,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function BareFormFillPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const form = await getForm(slug);
  if (!form) notFound();

  return (
    <div className="min-h-screen bg-[#f0f4f9] text-slate-800 flex flex-col justify-between selection:bg-[#c20000]/10 selection:text-[#c20000]">
      {/* ── MINIMAL TOP BAR (Logo IMM Kecil ala Google Form Header) ── */}
      <header className="py-4 px-6 border-b border-slate-200/60 bg-white/70 backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-700 hover:text-[#c20000] transition-colors" title="Kembali ke Beranda IMM Solo">
          <Image
            src="/images/logo-imm.webp"
            alt="Logo PC IMM Kota Surakarta"
            width={28}
            height={28}
            className="w-7 h-7 object-contain"
          />
          <span className="font-bold text-xs tracking-wide text-slate-800 hidden sm:inline" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
            PC IMM Kota Surakarta
          </span>
        </Link>

        <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
          Formulir Digital
        </span>
      </header>

      {/* ── FORM CONTENT (Tanpa Navbar & Footer Utama Website) ── */}
      <main className="flex-1 py-8 sm:py-12 px-4">
        <FormFillClient form={form} />
      </main>

      {/* ── MINIMAL FOOTER ALA GOOGLE FORMS ── */}
      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200/60">
        <p>
          Layanan Formulir Digital Resmi &bull; <Link href="/" className="hover:text-[#c20000] underline">PC IMM Kota Surakarta</Link>
        </p>
      </footer>
    </div>
  );
}

