import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ChevronRight, ExternalLink, Building2 } from 'lucide-react';
import { checkMaintenance } from '@/lib/maintenance';
import MaintenancePage from '@/components/ui/MaintenancePage';
import { toAbsoluteSiteUrl } from '@/lib/absoluteUrl';

const TIPE_LABEL: Record<string, string> = {
  komisariat: 'Komisariat',
  lso: 'Lembaga Semi Otonom',
  lembaga: 'Lembaga',
};

async function getLembaga(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lembaga/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error('Error fetching lembaga:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = await getLembaga(slug);
  if (!item) return { title: 'Tidak Ditemukan' };
  const canonical = `https://immsolo.or.id/lembaga/${slug}`;
  return {
    title: item.name,
    description: item.sejarah ? `${item.sejarah.slice(0, 155)}...` : `Profil ${item.name} — PC IMM Kota Surakarta.`,
    alternates: { canonical },
    openGraph: {
      title: `${item.name} | PC IMM Kota Surakarta`,
      description: item.sejarah ? `${item.sejarah.slice(0, 200)}` : `Profil ${item.name} — PC IMM Kota Surakarta.`,
      url: canonical,
      type: 'article',
    },
  };
}

export default async function LembagaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  if (await checkMaintenance('maintenance_profil')) return <MaintenancePage />;

  const { slug } = await params;
  const item = await getLembaga(slug);

  if (!item) {
    notFound();
  }

  const pageUrl = toAbsoluteSiteUrl(`/lembaga/${slug}`);
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Beranda', item: toAbsoluteSiteUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'Komisariat & Lembaga', item: toAbsoluteSiteUrl('/lembaga') },
      { '@type': 'ListItem', position: 3, name: item.name, item: pageUrl },
    ],
  };

  return (
    <main className="min-h-screen bg-white pt-24 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <article className="max-w-3xl mx-auto px-4 md:px-6 mt-10">
        <div className="flex items-center justify-between mb-8">
          <Link href="/lembaga" className="inline-flex items-center text-sm font-semibold text-[#0f172a]/70 hover:text-[#c20000] transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Daftar
          </Link>
          <nav aria-label="breadcrumb" className="flex items-center text-sm text-[#0f172a]/70">
            <Link href="/" className="hover:text-[#0f172a]/90">Beranda</Link>
            <ChevronRight className="w-4 h-4 mx-1" />
            <Link href="/lembaga" className="hover:text-[#0f172a]/90">Komisariat & Lembaga</Link>
            <ChevronRight className="w-4 h-4 mx-1" />
            <span className="text-[#0f172a]/80 truncate max-w-[200px]">{item.name}</span>
          </nav>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <span className="w-14 h-14 rounded-sm bg-[#c20000]/5 text-[#c20000] inline-flex items-center justify-center shrink-0">
            <Building2 className="w-7 h-7" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#c20000]">
              {TIPE_LABEL[item.tipe] || 'Lembaga'}
            </p>
            <h1 className="text-2xl md:text-4xl font-bold text-[#0f172a] leading-tight" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
              {item.name}
            </h1>
          </div>
        </div>

        {item.website_url && (
          <a
            href={item.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#c20000] hover:underline mb-8"
          >
            <ExternalLink className="w-4 h-4" />
            {String(item.website_url).replace(/^https?:\/\//, '')}
          </a>
        )}

        {item.sejarah && (
          <section className="mb-10">
            <h2 className="text-xl font-bold text-[#0f172a] mb-3" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
              Sejarah
            </h2>
            <p className="text-[#0f172a]/80 leading-relaxed whitespace-pre-line">{item.sejarah}</p>
          </section>
        )}

        {item.visi_misi && (
          <section className="bg-[#f8f9fa] border border-[#0f172a]/10 rounded-sm p-6 md:p-8">
            <h2 className="text-xl font-bold text-[#0f172a] mb-3" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
              Visi & Misi
            </h2>
            <p className="text-[#0f172a]/80 leading-relaxed whitespace-pre-line">{item.visi_misi}</p>
          </section>
        )}
      </article>
    </main>
  );
}
