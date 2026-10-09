import { Metadata } from 'next';
import Link from 'next/link';
import { Building2, GraduationCap, Landmark, ArrowRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { checkMaintenance } from '@/lib/maintenance';
import MaintenancePage from '@/components/ui/MaintenancePage';
import { toAbsoluteSiteUrl } from '@/lib/absoluteUrl';

const TIPE_META: Record<string, { label: string; plural: string; icon: typeof Building2; desc: string }> = {
  komisariat: {
    label: 'Komisariat',
    plural: 'Komisariat',
    icon: GraduationCap,
    desc: 'Komisariat-komisariat IMM di kampus-kampus Kota Surakarta.',
  },
  lso: {
    label: 'LSO',
    plural: 'Lembaga Semi Otonom',
    icon: Landmark,
    desc: 'Lembaga semi otonom yang mewadahi minat dan bakat kader.',
  },
  lembaga: {
    label: 'Lembaga',
    plural: 'Lembaga & Badan Khusus',
    icon: Building2,
    desc: 'Lembaga dan badan khusus di lingkungan PC IMM Kota Surakarta.',
  },
};

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const tipe = typeof sp?.tipe === 'string' && TIPE_META[sp.tipe] ? sp.tipe : undefined;
  const canonical = `https://immsolo.or.id/lembaga${tipe ? `?tipe=${tipe}` : ''}`;
  const title = tipe ? TIPE_META[tipe].plural : 'Komisariat & Lembaga';
  const ogImage = toAbsoluteSiteUrl('/images/imm_hero_bg.jpg');

  return {
    title,
    description: `Daftar ${title.toLowerCase()} Pimpinan Cabang Ikatan Mahasiswa Muhammadiyah Kota Surakarta.`,
    alternates: { canonical },
    openGraph: {
      title: `${title} | PC IMM Kota Surakarta`,
      description: `Daftar ${title.toLowerCase()} PC IMM Kota Surakarta.`,
      url: canonical,
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | PC IMM Kota Surakarta`,
      description: `Daftar ${title.toLowerCase()} PC IMM Kota Surakarta.`,
      images: [ogImage],
    },
  };
}

async function getLembaga(tipe?: string): Promise<any[]> {
  try {
    const params = new URLSearchParams();
    if (tipe) params.set('tipe', tipe);
    const qs = params.toString();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lembaga${qs ? `?${qs}` : ''}`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error('Error fetching lembaga:', error);
    return [];
  }
}

export default async function LembagaPage(props: Props) {
  if (await checkMaintenance('maintenance_profil')) return <MaintenancePage />;

  const searchParams = await props.searchParams;
  const activeTipe = typeof searchParams?.tipe === 'string' && TIPE_META[searchParams.tipe] ? searchParams.tipe : undefined;
  const items = await getLembaga(activeTipe);

  const grouped: Record<string, any[]> = {};
  for (const item of items) {
    const t = item.tipe || 'lembaga';
    if (!grouped[t]) grouped[t] = [];
    grouped[t].push(item);
  }
  const orderedTypes = ['komisariat', 'lso', 'lembaga'].filter((t) => !activeTipe || t === activeTipe);

  return (
    <main className="min-h-screen bg-[#f8f9fa] pt-28 pb-20">
      <section className="max-w-7xl mx-auto px-4 md:px-6 pt-4 pb-6">
        <nav aria-label="breadcrumb" className="mb-4">
          <ul className="flex items-center text-sm text-[#0f172a]/60 space-x-2">
            <li>
              <Link href="/" className="hover:text-[#c20000] transition-colors">Beranda</Link>
            </li>
            <li><span className="text-[#0f172a]/40 mx-1">/</span></li>
            <li className="text-[#0f172a] font-medium" aria-current="page">Komisariat & Lembaga</li>
          </ul>
        </nav>
        <div>
          <div data-aos="fade-up" className="border-b border-[#0f172a]/10 pb-4 mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-[#0f172a]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
              Komisariat & Lembaga
            </h1>
            <p className="text-[#0f172a]/60 mt-2">Komisariat, lembaga semi otonom, dan badan khusus PC IMM Kota Surakarta.</p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-wrap items-center gap-3 mb-10">
          <Button
            asChild
            variant={!activeTipe ? 'default' : 'outline'}
            className={!activeTipe ? 'bg-[#0f172a] text-white hover:bg-[#0f172a]/90 shadow-none' : 'border-[#0f172a]/10 bg-white hover:border-[#c20000] hover:text-[#c20000]'}
          >
            <Link href="/lembaga" scroll={false}>
              Semua
            </Link>
          </Button>
          {orderedTypes.map((t) => (
            <Button
              key={t}
              asChild
              variant={activeTipe === t ? 'default' : 'outline'}
              className={activeTipe === t ? 'bg-[#0f172a] text-white hover:bg-[#0f172a]/90 shadow-none' : 'border-[#0f172a]/10 bg-white hover:border-[#c20000] hover:text-[#c20000]'}
            >
              <Link href={`/lembaga?tipe=${t}`} scroll={false}>
                {TIPE_META[t].plural}
              </Link>
            </Button>
          ))}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 max-w-md mx-auto">
            <Building2 className="w-12 h-12 text-[#0f172a]/20 mx-auto mb-4" aria-hidden="true" />
            <p className="text-[#0f172a] font-semibold text-lg mb-2">Belum ada data.</p>
            <p className="text-[#0f172a]/70 text-sm mb-6">Coba ubah filter atau kembali lagi nanti.</p>
            <Link href="/lembaga" className="inline-flex items-center px-5 py-2.5 rounded-sm border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:border-[#c20000] hover:text-[#c20000] transition-colors">
              Tampilkan Semua
            </Link>
          </div>
        ) : (
          orderedTypes.map((t) => {
            const list = grouped[t] || [];
            if (list.length === 0) return null;
            const meta = TIPE_META[t];
            const Icon = meta.icon;
            return (
              <div key={t} className="mb-12 last:mb-0">
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-10 h-10 rounded-sm bg-[#c20000]/5 text-[#c20000] inline-flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </span>
                  <h2 className="text-xl md:text-2xl font-bold text-[#0f172a]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
                    {meta.plural}
                  </h2>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {list.map((item: any) => (
                    <Link
                      key={item.id}
                      data-aos="fade-up"
                      href={`/lembaga/${item.slug}`}
                      className="group bg-white border border-[#0f172a]/10 rounded-sm p-6 hover:shadow-lg hover:-translate-y-1 hover:border-[#c20000]/30 transition-all"
                    >
                      <h3 className="font-bold text-[#0f172a] group-hover:text-[#c20000] transition-colors mb-2 leading-snug">
                        {item.name}
                      </h3>
                      {item.sejarah && <p className="text-sm text-[#0f172a]/70 line-clamp-3 mb-4">{item.sejarah}</p>}
                      <span className="inline-flex items-center text-sm font-bold text-[#c20000]">
                        Lihat Profil
                        <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                      </span>
                      {item.website_url && (
                        <span className="block mt-3">
                          <span className="inline-flex items-center text-xs text-slate-500 hover:text-[#c20000]">
                            <ExternalLink className="w-3.5 h-3.5 mr-1" />
                            {String(item.website_url).replace(/^https?:\/\//, '').split('/')[0]}
                          </span>
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </section>
    </main>
  );
}
