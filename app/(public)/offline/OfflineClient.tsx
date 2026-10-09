'use client';

import Link from 'next/link';
import { WifiOff, RotateCw, Home } from 'lucide-react';

export default function OfflineClient() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <WifiOff className="w-14 h-14 text-slate-300 mx-auto mb-4" aria-hidden="true" />
        <h1 className="text-xl font-bold text-[#0f172a] mb-2" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
          Anda sedang offline
        </h1>
        <p className="text-sm text-slate-500 mb-2">Periksa koneksi internet, lalu muat ulang halaman ini.</p>
        <p className="text-xs text-slate-400 mb-6">Halaman yang pernah dibuka tersimpan otomatis dan bisa dibaca offline.</p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-6 py-2.5 rounded-sm bg-[#c20000] hover:bg-[#a30000] text-white text-sm font-bold transition-colors"
          >
            <RotateCw className="w-4 h-4 mr-2" />
            Muat Ulang
          </button>
          <Link href="/" className="inline-flex items-center px-6 py-2.5 rounded-sm border border-slate-200 bg-white text-slate-700 text-sm font-bold hover:border-[#c20000] hover:text-[#c20000] transition-colors">
            <Home className="w-4 h-4 mr-2" />
            Beranda
          </Link>
        </div>
      </div>
    </main>
  );
}
