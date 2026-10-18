import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ChevronLeft, ChevronRight, ExternalLink, Lock } from 'lucide-react';
import { BlockRenderer, PlaybookIcon, renderInline } from '@/components/docs/DocBlocks';
import { getPlaybook, playbookOrder } from '@/lib/docs/playbooks';

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return playbookOrder.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pb = getPlaybook(slug);
  if (!pb) return { title: 'Playbook Tidak Ditemukan' };
  return { title: pb.title, description: pb.short };
}

export default async function PlaybookPage({ params }: Props) {
  const { slug } = await params;
  const pb = getPlaybook(slug);
  if (!pb) notFound();

  const idx = playbookOrder.indexOf(pb.slug);
  const prev = idx > 0 ? getPlaybook(playbookOrder[idx - 1]) : undefined;
  const next = idx < playbookOrder.length - 1 ? getPlaybook(playbookOrder[idx + 1]) : undefined;

  return (
    <div className="mx-auto flex max-w-7xl gap-10 px-6 py-12 sm:px-10 lg:px-14">
      <article className="min-w-0 max-w-3xl flex-1">
        <nav className="flex items-center gap-1.5 text-xs text-slate-400" aria-label="Breadcrumb">
          <Link href="/docs" className="hover:text-[#c20000]">
            Playbook
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-slate-500">{pb.group}</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-slate-600">{pb.title}</span>
        </nav>

        <header className="mt-6">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#c20000] to-[#900000] text-white shadow-md shadow-[#c20000]/25">
              <PlaybookIcon name={pb.icon} className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{pb.title}</h1>
              {pb.permission ? (
                <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                  <Lock className="h-3.5 w-3.5" /> Permission: <code className="font-mono">{pb.permission}</code>
                </p>
              ) : null}
            </div>
          </div>
          <p className="mt-5 leading-relaxed text-slate-600">{pb.short}</p>

          {pb.roles?.length || pb.route ? (
            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
              {pb.route ? (
                <a
                  href={pb.route}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 font-medium text-slate-600 transition hover:border-[#c20000]/40 hover:text-[#c20000]"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> {pb.route}
                </a>
              ) : null}
              {pb.roles?.map((role) => (
                <span key={role} className="rounded-full bg-[#c20000]/10 px-3 py-1.5 font-medium text-[#c20000]">
                  {role}
                </span>
              ))}
            </div>
          ) : null}
        </header>

        <div className="mt-10 space-y-12">
          {pb.sections.map((section, si) => (
            <section key={section.id} id={section.id} className="scroll-mt-8">
              <h2 className="flex items-baseline gap-2.5 border-b border-slate-100 pb-3 text-lg font-bold text-slate-900">
                <span className="font-mono text-sm font-semibold text-[#c20000]/70">{String(si + 1).padStart(2, '0')}</span>
                {section.title}
              </h2>
              <div className="mt-4 space-y-4">
                {section.blocks.map((block, bi) => (
                  <BlockRenderer key={bi} block={block} />
                ))}
              </div>
            </section>
          ))}
        </div>

        {pb.related?.length ? (
          <section className="mt-14 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Playbook Terkait</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {pb.related
                .map((r) => getPlaybook(r))
                .filter((r): r is NonNullable<typeof r> => Boolean(r))
                .map((rp) => (
                  <Link
                    key={rp.slug}
                    href={`/docs/${rp.slug}`}
                    className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 transition hover:border-[#c20000]/40 hover:shadow-sm"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#c20000]/10 text-[#c20000]">
                      <PlaybookIcon name={rp.icon} className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800 group-hover:text-[#c20000]">{rp.title}</p>
                      <p className="truncate text-xs text-slate-500">{rp.group}</p>
                    </div>
                  </Link>
                ))}
            </div>
          </section>
        ) : null}

        <nav className="mt-10 grid gap-3 border-t border-slate-200 pt-8 sm:grid-cols-2">
          {prev ? (
            <Link href={`/docs/${prev.slug}`} className="group rounded-xl border border-slate-200 p-4 transition hover:border-[#c20000]/40">
              <p className="flex items-center gap-1 text-xs text-slate-400">
                <ChevronLeft className="h-3.5 w-3.5" /> Sebelumnya
              </p>
              <p className="mt-1 font-semibold text-slate-800 group-hover:text-[#c20000]">{prev.title}</p>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/docs/${next.slug}`} className="group rounded-xl border border-slate-200 p-4 text-right transition hover:border-[#c20000]/40 sm:text-left">
              <p className="flex items-center justify-end gap-1 text-xs text-slate-400 sm:justify-start">
                Berikutnya <ChevronRight className="h-3.5 w-3.5" />
              </p>
              <p className="mt-1 font-semibold text-slate-800 group-hover:text-[#c20000]">{next.title}</p>
            </Link>
          ) : null}
        </nav>
      </article>

      <aside className="sticky top-24 hidden h-fit w-56 shrink-0 xl:block">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Di halaman ini</p>
        <ul className="mt-3 space-y-1.5 border-l-2 border-slate-100">
          {pb.sections.map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`} className="-ml-0.5 block border-l-2 border-transparent py-1 pl-3 text-sm text-slate-500 transition hover:border-[#c20000] hover:text-[#c20000]">
                {section.title}
              </a>
            </li>
          ))}
        </ul>
        {pb.sections.some((s) => s.blocks.some((b) => b.type === 'callout')) ? (
          <p className="mt-6 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
            {renderInline('Blok berwarna adalah **catatan penting** — baca sebelum mencoba.')}
          </p>
        ) : null}
      </aside>
    </div>
  );
}
