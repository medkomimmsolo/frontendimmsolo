import { Metadata } from 'next';
import Link from 'next/link';
import { WifiOff } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Offline | PC IMM Kota Surakarta',
};

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <WifiOff className="w-14 h-14 text-slate-300 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-[#0f172a] mb-2" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
          Anda sedang offline
        </h1>
        <p className="text-sm text-slate-500 mb-6">Periksa koneksi internet, lalu coba lagi.</p>
        <Link href="/" className="inline-block px-6 py-2.5 rounded-md bg-[#c20000] hover:bg-[#a30000] text-white text-sm font-bold transition-colors">
          Coba Lagi
        </Link>
      </div>
    </main>
  );
}
