'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Search, FileText, CalendarDays, FolderOpen, Loader2 } from 'lucide-react';
import { getApiBase } from '@/lib/settings';

export default function CariClient() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ blogs: any[]; events: any[]; documents: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [typing, setTyping] = useState(false);
  const [hasError, setHasError] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q') || '';
    if (q) {
      setQuery(q);
      doSearch(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cari otomatis saat mengetik (debounce 600ms)
  useEffect(() => {
    if (query.trim().length < 2) {
      setTyping(false);
      return;
    }
    setTyping(true);
    const t = setTimeout(() => {
      doSearch(query);
      setTyping(false);
    }, 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const doSearch = async (q: string) => {
    const term = q.trim();
    if (term.length < 2) return;
    const myId = ++requestId.current;
    setIsLoading(true);
    setSearched(true);
    setHasError(false);
    try {
      const base = getApiBase();
      const res = await axios.get(`${base}/search`, { params: { q: term } });
      if (myId !== requestId.current) return; // abaikan respons basi
      setResults(res.data.data);
      window.history.replaceState(null, '', `/cari?q=${encodeURIComponent(term)}`);
    } catch {
      if (myId !== requestId.current) return;
      setHasError(true);
      setResults({ blogs: [], events: [], documents: [] });
    } finally {
      if (myId === requestId.current) setIsLoading(false);
    }
  };

  const total = (results?.blogs.length || 0) + (results?.events.length || 0) + (results?.documents.length || 0);

  return (
    <main className="min-h-screen bg-[#f8f9fa] pt-28 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-[#0f172a] mb-6" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
          Pencarian
        </h1>
        <form onSubmit={(e) => { e.preventDefault(); doSearch(query); }} className="relative mb-10" role="search">
          <label htmlFor="cari-input" className="sr-only">Cari berita, agenda, dan dokumen</label>
          {(isLoading || typing) ? (
            <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#c20000] animate-spin" aria-hidden="true" />
          ) : (
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" aria-hidden="true" />
          )}
          <input
            id="cari-input"
            type="search" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari berita, agenda, dokumen... (min. 2 huruf)"
            autoComplete="off"
            className="w-full bg-white border border-slate-200 rounded-sm pl-12 pr-28 py-4 text-base shadow-sm focus:outline-none focus:border-[#c20000] focus:ring-2 focus:ring-[#c20000]/15"
          />
          <button
            type="submit"
            disabled={isLoading || query.trim().length < 2}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 rounded-sm bg-[#c20000] hover:bg-[#a30000] disabled:opacity-40 text-white text-sm font-bold transition-colors"
          >
            Cari
          </button>
        </form>

        {isLoading ? (
          <div className="flex justify-center py-16" role="status" aria-label="Sedang mencari"><Loader2 className="w-8 h-8 animate-spin text-[#c20000]" /></div>
        ) : searched && results && (
          <div aria-live="polite">
            <p className="text-sm text-slate-500 mb-6">Ditemukan <span className="font-bold text-[#0f172a]">{total}</span> hasil</p>

            {results.blogs.length > 0 && (
              <section className="mb-8">
                <h2 className="flex items-center gap-2 text-lg font-bold text-[#0f172a] mb-3"><FileText className="w-5 h-5 text-[#c20000]" /> Berita</h2>
                <div className="space-y-3">
                  {results.blogs.map((b: any) => (
                    <Link key={b.id} href={`/post/${b.slug}`} className="block bg-white border border-slate-100 rounded-sm p-4 shadow-sm hover:shadow-md hover:border-[#c20000]/20 transition-all">
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
                    <Link key={e.id} href={`/agenda/${e.slug}`} className="block bg-white border border-slate-100 rounded-sm p-4 shadow-sm hover:shadow-md hover:border-[#c20000]/20 transition-all">
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
                    <Link key={d.id} href="/dokumen" className="block bg-white border border-slate-100 rounded-sm p-4 shadow-sm hover:shadow-md hover:border-[#c20000]/20 transition-all">
                      <h3 className="font-bold text-[#0f172a]">{d.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 uppercase">{d.file_type}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {total === 0 && (
              hasError ? (
                <div className="text-center py-10">
                  <p className="text-[#0f172a] font-semibold mb-1">Gagal memuat hasil pencarian.</p>
                  <p className="text-sm text-slate-500 mb-4">Periksa koneksi internet Anda lalu coba lagi.</p>
                  <button
                    onClick={() => doSearch(query)}
                    className="px-5 py-2.5 rounded-sm border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:border-[#c20000] hover:text-[#c20000] transition-colors"
                  >
                    Coba Lagi
                  </button>
                </div>
              ) : (
                <div className="text-center py-10">
                  <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" aria-hidden="true" />
                  <p className="text-[#0f172a] font-semibold mb-1">Tidak ada hasil untuk “{query}”.</p>
                  <p className="text-sm text-slate-500">Coba kata kunci lain yang lebih umum.</p>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </main>
  );
}
