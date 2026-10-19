'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { ArrowUpRight, BookOpen, X } from 'lucide-react';
import { PlaybookIcon } from '@/components/docs/DocBlocks';
import { getPlaybook, playbooks, playbookGroups } from '@/lib/docs/playbooks';

interface Props {
  open: boolean;
  onClose: () => void;
  query: string;
}

export default function DocsSidebar({ open, onClose, query }: Props) {
  const pathname = usePathname();

  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  const q = query.trim().toLowerCase();
  const matches = (title: string) => !q || title.toLowerCase().includes(q);

  const nav = (
    <nav className="space-y-6">
      {playbookGroups.map((group) => {
        const visible = group.slugs.filter((slug) => matches(getPlaybook(slug)?.title ?? ''));
        if (visible.length === 0) return null;
        return (
          <div key={group.label}>
            <p className="mb-2 px-2 text-2xs font-semibold uppercase tracking-wider text-slate-400">{group.label}</p>
            <ul className="space-y-0.5">
              {visible.map((slug) => {
                const pb = getPlaybook(slug);
                if (!pb) return null;
                const active = pathname === `/docs/${pb.slug}`;
                return (
                  <li key={pb.slug}>
                    <Link
                      href={`/docs/${pb.slug}`}
                      className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition ${
                        active ? 'bg-[#c20000]/10 font-semibold text-[#c20000]' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <PlaybookIcon name={pb.icon} className={`h-4 w-4 shrink-0 ${active ? 'text-[#c20000]' : 'text-slate-400'}`} />
                      <span className="truncate">{pb.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
      {q && playbooks.every((p) => !matches(p.title)) ? (
        <p className="px-2 text-sm text-slate-400">Tidak ada playbook yang cocok.</p>
      ) : null}
    </nav>
  );

  return (
    <>
      {open ? <div className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden" onClick={onClose} aria-hidden /> : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto border-r border-slate-200 bg-white px-4 pb-8 pt-5 transition-transform lg:sticky lg:top-16 lg:z-0 lg:h-[calc(100vh-4rem)] lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-6 flex items-center justify-between">
          <Link href="/docs" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#c20000] to-[#900000] text-white">
              <BookOpen className="h-4.5 w-4.5" />
            </span>
            <span>
              <span className="block text-sm font-bold text-slate-900">Playbook</span>
              <span className="block text-2xs text-slate-500">PC IMM Kota Surakarta</span>
            </span>
          </Link>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden" aria-label="Tutup menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        {nav}

        <div className="mt-8 border-t border-slate-200 pt-4">
          <Link href="/" className="flex items-center justify-between rounded-lg px-2.5 py-2 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-900">
            Kembali ke Situs
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </aside>
    </>
  );
}
