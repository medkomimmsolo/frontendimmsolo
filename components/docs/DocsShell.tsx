'use client';

import { useState, type ReactNode } from 'react';
import DocsHeader from './DocsHeader';
import DocsFooter from './DocsFooter';
import DocsSidebar from './DocsSidebar';

export default function DocsShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  return (
    <div className="flex min-h-screen flex-col bg-white font-[family-name:var(--font-poppins)] text-slate-800 antialiased">
      <DocsHeader query={query} onQueryChange={setQuery} onMenu={() => setOpen(true)} />
      <div className="flex flex-1">
        <DocsSidebar open={open} onClose={() => setOpen(false)} query={query} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
      <DocsFooter />
    </div>
  );
}
