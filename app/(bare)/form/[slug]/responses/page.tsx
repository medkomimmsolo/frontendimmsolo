import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import PublicResponsesClient from '@/components/form/PublicResponsesClient';
import { getApiBase } from '@/lib/settings';

async function getFormResponsesData(slug: string) {
  try {
    const apiBase = getApiBase();
    const res = await fetch(`${apiBase}/forms/${slug}/responses`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getFormResponsesData(slug);
  if (!data?.form) return { title: 'Tidak Ditemukan' };

  const form = data.form;
  const canonical = `https://immsolo.or.id/form/${slug}/responses`;

  return {
    title: `Rekap Responden: ${form.title} — Spreadsheet View`,
    description: `Daftar rekap responden pendaftar ${form.title} — PC IMM Kota Surakarta.`,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `Rekap Responden: ${form.title} | PC IMM Kota Surakarta`,
      description: `Daftar responden pendaftar ${form.title} — PC IMM Kota Surakarta.`,
      url: canonical,
      type: 'website',
      images: form.header_image ? [{ url: form.header_image }] : undefined,
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function PublicResponsesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getFormResponsesData(slug);
  if (!data || !data.form) notFound();

  return (
    <div className="min-h-screen bg-[#f0f4f9] text-slate-800 flex flex-col justify-between selection:bg-[#c20000]/10 selection:text-[#c20000]">
      {/* ── MAIN CONTENT (Spreadsheet View Bare Layout) ── */}
      <main className="flex-1 py-6 sm:py-10 px-4 sm:px-6">
        <PublicResponsesClient initialData={data} />
      </main>

      {/* ── MINIMAL FOOTER ALA GOOGLE FORMS ── */}
      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200/60">
        <p>
          Layanan Rekap Spreadsheet Digital &bull;{' '}
          <Link href="/" className="hover:text-[#c20000] underline">
            PC IMM Kota Surakarta
          </Link>
        </p>
      </footer>
    </div>
  );
}

