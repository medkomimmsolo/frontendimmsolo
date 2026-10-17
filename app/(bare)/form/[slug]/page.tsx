import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import FormFillClient from '@/components/form/FormFillClient';
import { checkMaintenance } from '@/lib/maintenance';
import MaintenancePage from '@/components/ui/MaintenancePage';

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
  if (await checkMaintenance('maintenance_form')) return <MaintenancePage />;
  const { slug } = await params;
  const form = await getForm(slug);
  if (!form) notFound();

  return (
    <div className="min-h-screen bg-[#f0f4f9] text-slate-800 flex flex-col justify-between selection:bg-[#c20000]/10 selection:text-[#c20000]">
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
