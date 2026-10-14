'use client';

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Tautan berhasil disalin.');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Tautan belum tersalin. Periksa izin clipboard browser, lalu coba lagi.');
    }
  };

  return (
    <button
      onClick={handleShare}
      title="Bagikan halaman ini"
      aria-label="Bagikan halaman ini"
      className="w-10 h-10 inline-flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white/70 hover:text-white backdrop-blur transition-all"
    >
      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
    </button>
  );
}
