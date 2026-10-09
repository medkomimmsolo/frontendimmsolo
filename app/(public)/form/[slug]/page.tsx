import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import FormFillClient from './FormFillClient';

async function getForm(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forms/${slug}`, { next: { revalidate: 60 } });
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
    title: form.title,
    description: form.description || `Formulir pendaftaran ${form.title} — PC IMM Kota Surakarta.`,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${form.title} | PC IMM Kota Surakarta`,
      description: form.description || `Formulir pendaftaran ${form.title} — PC IMM Kota Surakarta.`,
      url: canonical,
      type: 'website',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function FormFillPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const form = await getForm(slug);
  if (!form) notFound();

  return (
    <main className="min-h-screen bg-[#f8f9fa] pt-28 pb-20 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#c20000] mb-2">Formulir Pendaftaran</p>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0f172a]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
            {form.title}
          </h1>
          {form.description && <p className="text-slate-500 mt-2 leading-relaxed">{form.description}</p>}
          {(form.ends_at || form.max_responses) && (
            <p className="text-xs text-slate-400 mt-2">
              {form.ends_at ? `Ditutup ${new Date(form.ends_at).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}` : ''}
              {form.ends_at && form.max_responses ? ' • ' : ''}
              {form.max_responses ? `Kuota ${form.max_responses} pendaftar` : ''}
            </p>
          )}
        </div>
        <FormFillClient form={form} />
      </div>
    </main>
  );
}
