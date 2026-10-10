'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';
import { AlertTriangle, RefreshCw, Home, MessageSquare } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error ke Sentry atau monitoring
    console.error('Unhandled application error:', error);
    try {
      Sentry.captureException(error);
    } catch {}
  }, [error]);

  return (
    <main className="min-h-screen bg-[#f8f9fa] flex items-center justify-center px-4 py-20 font-sans">
      <div className="text-center max-w-md w-full bg-white p-8 rounded-sm shadow-sm border border-slate-200/80">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-[#c20000] mb-5">
          <AlertTriangle className="w-8 h-8" />
        </div>
        
        <h1 
          className="text-2xl font-bold text-[#0f172a] mb-2" 
          style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
        >
          Terjadi Kendala Teknis
        </h1>
        
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          Sistem mendeteksi kendala saat memproses permintaan Anda. Hal ini bisa terjadi karena koneksi jaringan sementara atau pembaruan server.
        </p>

        {error?.digest && (
          <p className="text-[11px] font-mono text-slate-400 bg-slate-50 border border-slate-100 rounded px-2 py-1 mb-6 truncate">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-sm bg-[#c20000] hover:bg-[#a30000] text-white text-xs font-bold transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Muat Ulang
          </button>
          
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            <Home className="w-3.5 h-3.5" /> Beranda
          </Link>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-100">
          <Link 
            href="/kontak" 
            className="text-xs text-slate-400 hover:text-[#c20000] inline-flex items-center gap-1 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" /> Laporkan kendala ke admin
          </Link>
        </div>
      </div>
    </main>
  );
}

