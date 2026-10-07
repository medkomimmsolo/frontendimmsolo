import { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowUpRight, BadgeCheck } from 'lucide-react';
import ShareButton from './ShareButton';
import LinkItemIcon from '@/components/post/LinkItemIcon';

async function getPage(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/links/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return { title: 'Tidak Ditemukan | PC IMM Kota Surakarta' };
  return {
    title: `${page.title} | PC IMM Kota Surakarta`,
    description: page.description || `Tautan resmi ${page.title} — PC IMM Kota Surakarta.`,
  };
}

export default async function LinktreePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) notFound();

  const items = page.active_items || page.items?.filter((i: any) => i.is_active) || [];
  const bg = page.bg_color || '#0b1120';
  const accent = page.accent_color || '#c20000';
  const bgIsLight = (() => {
    const hex = bg.replace('#', '');
    if (!/^[0-9a-fA-F]{6}$/.test(hex)) return false;
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) > 150;
  })();
  const footColor = bgIsLight ? 'rgba(15,23,42,0.55)' : 'rgba(255,255,255,0.55)';
  const avatarSrc = page.avatar
    ? (page.avatar.startsWith('http') ? page.avatar : page.avatar)
    : '/images/imm_hero_bg.jpg';

  return (
    <main className="relative min-h-screen overflow-hidden pt-10 pb-32 px-4" style={{ backgroundColor: bg }}>
      {/* Latar dekoratif */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[42rem] h-[42rem] rounded-full blur-[140px] opacity-20" style={{ backgroundColor: accent }} />
        <div className="absolute bottom-0 -left-40 w-[30rem] h-[30rem] rounded-full bg-indigo-500/10 blur-[130px]" />
        <div className="absolute top-1/3 -right-40 w-[26rem] h-[26rem] rounded-full blur-[110px] opacity-[0.07]" style={{ backgroundColor: accent }} />
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
            maskImage: 'radial-gradient(ellipse 90% 60% at 50% 0%, black 30%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse 90% 60% at 50% 0%, black 30%, transparent 75%)',
          }}
        />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 120% 90% at 50% 110%, rgba(0,0,0,0.5), transparent 60%)' }} />
      </div>

      <div className="relative max-w-md mx-auto">
        <div className="flex items-center justify-end mb-8">
          <ShareButton title={page.title} />
        </div>

        <div className="text-center mb-8">
          <div className="relative w-24 h-24 mx-auto mb-5">
            <div className="absolute -inset-2 rounded-full opacity-40 blur-xl" style={{ background: `linear-gradient(to top right, ${accent}, transparent 70%)` }} />
            <div className="absolute -inset-[5px] rounded-full border border-white/25" />
            <div className="relative w-24 h-24 rounded-full overflow-hidden ring-1 ring-white/40 ring-offset-2 ring-offset-transparent shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <Image src={avatarSrc} alt={page.title} fill sizes="96px" className="object-cover" priority />
            </div>
            <span className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-white shadow-lg inline-flex items-center justify-center">
              <BadgeCheck className="w-4 h-4" style={{ color: accent }} />
            </span>
          </div>
          <h1 className="text-[26px] leading-tight font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
            {page.title}
          </h1>
          {page.description && <p className="text-sm text-white/55 mt-2 leading-relaxed max-w-[19rem] mx-auto font-light">{page.description}</p>}
        </div>

        <div className="flex items-center gap-3 mb-7" aria-hidden="true">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-white/15" />
          <span className="w-1.5 h-1.5 rotate-45 border border-white/25" />
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-white/15" />
        </div>

        {items.length === 0 ? (
          <div className="text-center bg-white/5 border border-white/10 rounded-2xl py-10 px-6">
            <p className="text-white/50 text-sm">Belum ada tautan di halaman ini.</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {items.map((item: any, idx: number) => (
              <a
                key={item.id}
                href={`${process.env.NEXT_PUBLIC_API_URL}/links/go/${item.id}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ animationDelay: `${Math.min(idx * 70, 500)}ms` }}
                className="animate-[linktree-in_0.5s_ease-out_both] group relative flex items-center gap-4 bg-gradient-to-b from-white/[0.09] to-white/[0.04] hover:from-white/[0.14] hover:to-white/[0.07] border border-white/10 hover:border-white/25 backdrop-blur-xl rounded-2xl pl-4 pr-4 py-[15px] text-white shadow-[0_10px_35px_rgba(0,0,0,0.4)] transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[0_18px_45px_rgba(0,0,0,0.5)] overflow-hidden"
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <span className="w-11 h-11 shrink-0 inline-flex items-center justify-center rounded-xl border border-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_4px_12px_rgba(0,0,0,0.3)]" style={{ background: `linear-gradient(135deg, ${accent}d9, ${accent}59)` }}>
                  {item.icon ? <LinkItemIcon id={item.icon} className="w-[22px] h-[22px]" /> : <span className="text-[15px] font-bold">{item.title.charAt(0).toUpperCase()}</span>}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-semibold text-[15px] tracking-wide truncate">{item.title}</span>
                  <span className="block text-[11px] text-white/40 truncate font-normal mt-0.5">
                    {item.url.replace(/^https?:\/\//, '').split('/')[0]}
                  </span>
                </span>
                <span className="w-8 h-8 shrink-0 inline-flex items-center justify-center rounded-full border border-white/10 text-white/40 group-hover:text-white transition-all duration-300 group-hover:border-white/30">
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-[1px] group-hover:-translate-y-[1px] transition-transform" />
                </span>
              </a>
            ))}
          </div>
        )}

      </div>

      <footer className="fixed bottom-0 inset-x-0 z-20">
        <div className="max-w-md mx-auto px-4 py-2.5 flex justify-center">
          <a href="https://immsolo.or.id" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-1.5 transition-all">
            {/* <span className="w-4 h-4 rounded-full inline-flex items-center justify-center text-[8px] font-black text-white" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}77)` }}>I</span> */}
            <span className="text-[10px] font-semibold tracking-[0.18em] transition-colors" style={{ color: footColor }}>immsolo.or.id</span>
          </a>
        </div>
      </footer>
    </main>
  );
}
