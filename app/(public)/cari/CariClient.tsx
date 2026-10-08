'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Search, FileText, CalendarDays, FolderOpen, Loader2 } from 'lucide-react';

export default function CariClient() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ blogs: any[]; events: any[]; documents: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q') || '';
    if (q) {
      setQuery(q);
      doSearch(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doSearch = async (q: string) => {
    const term = q.trim();
    if (term.length < 2) return;
    setIsLoading(true);
    setSearched(true);
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8010/api/v1';
      const res = await axios.get(`${base}/search`, { params: { q: term } });
      setResults(res.data.data);
      window.history.replaceState(null, '', `/cari?q=${encodeURIComponent(term)}`);
    } catch {
      setResults({ blogs: [], events: [], documents: [] });
    } finally {
      setIsLoading(false);
    }
  };

  const total = (results?.blogs.length || 0) + (results?.events.length || 0) + (results?.documents.length || 0);

  return (
    <main className="min-h-screen bg-[#f8f9fa] pt-28 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-[#0f172a] mb-6" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
          Pencarian
        </h1>
        <form onSubmit={(e) => { e.preventDefault(); doSearch(query); }} className="relative mb-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari berita, agenda, dokumen... (min. 2 huruf)"
            className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-4 text-base shadow-sm focus:outline-none focus:border-[#c20000] focus:ring-2 focus:ring-[#c20000]/15"
          />
        </form>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-[#c20000]" /></div>
        ) : searched && results && (
          <>
            <p className="text-sm text-slate-500 mb-6">Ditemukan <span className="font-bold text-[#0f172a]">{total}</span> hasil</p>

            {results.blogs.length > 0 && (
              <section className="mb-8">
                <h2 className="flex items-center gap-2 text-lg font-bold text-[#0f172a] mb-3"><FileText className="w-5 h-5 text-[#c20000]" /> Berita</h2>
                <div className="space-y-3">
                  {results.blogs.map((b: any) => (
                    <Link key={b.id} href={`/post/${b.slug}`} className="block bg-white border border-slate-100 rounded-lg p-4 shadow-sm hover:shadow-md hover:border-[#c20000]/20 transition-all">
                      <h3 className="font-bold text-[#0f172a]">{b.title}</h3>
                      {b.excerpt && <p className="text-sm text-slate-500 mt-1 line-clamp-2">{b.excerpt}</p>}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {results.events.length > 0 && (
              <section className="mb-8">
                <h2 className="flex items-center gap-2 text-lg font-bold text-[#0f172a] mb-3"><CalendarDays className="w-5 h-5 text-[#c20000]" /> Agenda</h2>
                <div className="space-y-3">
                  {results.events.map((e: any) => (
                    <Link key={e.id} href={`/agenda/${e.slug}`} className="block bg-white border border-slate-100 rounded-lg p-4 shadow-sm hover:shadow-md hover:border-[#c20000]/20 transition-all">
                      <h3 className="font-bold text-[#0f172a]">{e.title}</h3>
                      <p className="text-xs text-slate-500 mt-1">{e.location} • {new Date(e.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {results.documents.length > 0 && (
              <section className="mb-8">
                <h2 className="flex items-center gap-2 text-lg font-bold text-[#0f172a] mb-3"><FolderOpen className="w-5 h-5 text-[#c20000]" /> Dokumen</h2>
                <div className="space-y-3">
                  {results.documents.map((d: any) => (
                    <Link key={d.id} href="/dokumen" className="block bg-white border border-slate-100 rounded-lg p-4 shadow-sm hover:shadow-md hover:border-[#c20000]/20 transition-all">
                      <h3 className="font-bold text-[#0f172a]">{d.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 uppercase">{d.file_type}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {total === 0 && <p className="text-center text-slate-500 py-10">Tidak ada hasil. Coba kata kunci lain.</p>}
          </>
        )}
      </div>
    </main>
  );
}
