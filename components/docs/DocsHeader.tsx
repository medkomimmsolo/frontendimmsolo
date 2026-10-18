'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { getApiBase, normalizeSettings } from '@/lib/settings';

interface Props {
  query: string;
  onQueryChange: (value: string) => void;
  onMenu: () => void;
}

export default function DocsHeader({ query, onQueryChange, onMenu }: Props) {
  const [siteLogo, setSiteLogo] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${getApiBase()}/settings`, { headers: { Accept: 'application/json' } })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const settings = normalizeSettings(json?.data);
        setSiteLogo(settings.site_logo || settings.site_logo_white || null);
      })
      .catch(() => {});
  }, []);

  const openDrawerWithSearch = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) onMenu();
  };

  return (
    <header className="sticky top-0 z-30 h-16 shrink-0 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-full items-center gap-3 px-4 sm:gap-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <img
            src={siteLogo || '/icon-192.png'}
            alt="Logo PC IMM Kota Surakarta"
            className="h-9 w-9 shrink-0 rounded-xl"
          />
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-sm font-bold text-slate-900">Pusat Digital</span>
            <span className="block truncate text-[0.6875rem] text-slate-500">PC IMM Kota Surakarta</span>
          </span>
        </div>

        <div className="relative ml-auto w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              onQueryChange(e.target.value);
              openDrawerWithSearch();
            }}
            onFocus={openDrawerWithSearch}
            placeholder="Cari playbook…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#c20000]/40 focus:bg-white"
          />
        </div>
      </div>
    </header>
  );
}
