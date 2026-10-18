'use client';

import { useCallback, useState, type ReactNode } from 'react';
import { Menu } from 'lucide-react';
import DocsHeader from './DocsHeader';
import DocsFooter from './DocsFooter';
import DocsSidebar from './DocsSidebar';

export default function DocsShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const openSidebar = useCallback(() => setOpen(true), []);
  const closeSidebar = useCallback(() => setOpen(false), []);

  return (
    <div className="flex min-h-screen flex-col bg-white font-[family-name:var(--font-poppins)] text-slate-800 antialiased">
      <DocsHeader query={query} onQueryChange={setQuery} onMenu={openSidebar} />
      <div className="flex items-center border-b border-slate-200 bg-white px-4 py-2 lg:hidden">
        <button
          onClick={openSidebar}
          className="flex items-center gap-2 rounded-lg py-1.5 pr-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          aria-label="Buka menu dokumentasi"
        >
          <Menu className="h-5 w-5 text-[#c20000]" /> Menu Playbook
        </button>
      </div>
      <div className="flex flex-1">
        <DocsSidebar open={open} onClose={closeSidebar} query={query} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
      <DocsFooter />
    </div>
  );
}
