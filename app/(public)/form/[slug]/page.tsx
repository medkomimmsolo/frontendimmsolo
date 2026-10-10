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
    <main className="min-h-screen bg-[#f0f4f9] pt-28 pb-20 px-4">
      <FormFillClient form={form} />
    </main>
  );
}
