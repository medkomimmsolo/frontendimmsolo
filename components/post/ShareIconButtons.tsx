'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { MessageSquare, Share2, Link as LinkIcon, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { toAbsoluteSiteUrl } from '@/lib/absoluteUrl';

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

interface ShareIconButtonsProps {
  title: string;
  slug: string;
  /** Base path konten, mis. "/post" atau "/agenda". */
  basePath?: string;
}

const roundBtn =
  'w-10 h-10 rounded-full border-[#0f172a]/10 text-[#0f172a]/70 transition-colors';

/**
 * Tombol share berbentuk ikon bundar (untuk header artikel/agenda).
 * Semua tombol berfungsi: WhatsApp, Facebook, X, salin tautan, share bawaan.
 */
export default function ShareIconButtons({ title, slug, basePath = '/post' }: ShareIconButtonsProps) {
  const [copied, setCopied] = useState(false);
  const url = toAbsoluteSiteUrl(`${basePath}/${slug}`);

  const openPopup = (shareUrl: string) => {
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=540');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Tautan berhasil disalin!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Gagal menyalin tautan');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // Dibatalkan pengguna — abaikan.
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className={`${roundBtn} hover:text-emerald-600 hover:border-emerald-600 hover:bg-emerald-50`}
        title="Bagikan via WhatsApp"
        aria-label="Bagikan via WhatsApp"
        onClick={() => openPopup(`https://wa.me/?text=${encodeURIComponent(`${title}\n\n${url}`)}`)}
      >
        <MessageSquare className="w-4 h-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className={`${roundBtn} hover:text-blue-600 hover:border-blue-600 hover:bg-blue-50`}
        title="Bagikan via Facebook"
        aria-label="Bagikan via Facebook"
        onClick={() => openPopup(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`)}
      >
        <FacebookIcon className="w-4 h-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className={`${roundBtn} hover:text-sky-500 hover:border-sky-500 hover:bg-sky-50`}
        title="Bagikan via X"
        aria-label="Bagikan via X"
        onClick={() =>
          openPopup(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`)
        }
      >
        <XIcon className="w-4 h-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className={`${roundBtn} hover:text-[#c20000] hover:border-[#c20000] hover:bg-[#c20000]/5`}
        title={copied ? 'Tersalin!' : 'Salin tautan'}
        aria-label="Salin tautan"
        onClick={handleCopyLink}
      >
        {copied ? <Check className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
      </Button>
      <Button
        variant="outline"
        size="icon"
        className={`${roundBtn} hover:text-[#c20000] hover:border-[#c20000] hover:bg-[#c20000]/5 sm:hidden`}
        title="Bagikan lainnya"
        aria-label="Bagikan lainnya"
        onClick={handleNativeShare}
      >
        <Share2 className="w-4 h-4" />
      </Button>
    </>
  );
}
