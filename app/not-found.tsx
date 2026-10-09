import Link from 'next/link';
import { Search, Home, Link2, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#f8f9fa] flex items-center justify-center px-4 py-20">
      <div className="text-center max-w-lg w-full">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-sm bg-[#c20000]/10 mb-6">
          <span className="text-4xl font-black text-[#c20000]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
            404
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#0f172a] mb-3" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-slate-500 mb-2 leading-relaxed">
          Maaf, alamat yang Anda tuju tidak ada atau sudah dipindahkan. Mungkin tautan shortlink-nya belum aktif atau salah ketik.
        </p>
        <p className="text-xs text-slate-400 mb-8">
          Cek status shortlink di halaman <Link href="/shortlink" className="text-[#c20000] font-semibold hover:underline">Tautan Pendek</Link>.
        </p>
        <form action="/cari" method="get" className="flex gap-2 mb-6">
          <input
            type="text"
            name="q"
            minLength={2}
            required
            placeholder="Cari berita, agenda, dokumen..."
            className="flex-1 border border-slate-200 rounded-sm px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000]"
          />
          <button type="submit" className="px-4 py-2.5 rounded-sm bg-[#0f172a] hover:bg-slate-800 text-white text-sm font-bold transition-colors inline-flex items-center gap-1.5">
            <Search className="w-4 h-4" /> Cari
          </button>
        </form>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-sm bg-[#c20000] hover:bg-[#a30000] text-white text-sm font-bold transition-colors">
            <Home className="w-4 h-4" /> Beranda
          </Link>
          <Link href="/links" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-sm bg-white border border-slate-200 hover:border-[#c20000] text-slate-700 hover:text-[#c20000] text-sm font-bold transition-colors">
            <Link2 className="w-4 h-4" /> Tautan Resmi
          </Link>
          <Link href="/kontak" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-sm bg-white border border-slate-200 hover:border-[#c20000] text-slate-700 hover:text-[#c20000] text-sm font-bold transition-colors">
            <ArrowLeft className="w-4 h-4" /> Hubungi Kami
          </Link>
        </div>
      </div>
    </main>
  );
}
