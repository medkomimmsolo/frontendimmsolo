'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Share2, MessageSquare, Link as LinkIcon, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface ShareButtonsProps {
  title: string;
  slug: string;
  layout?: 'horizontal' | 'vertical';
}

// Inline SVG icons for social platforms (lucide-react doesn't include brand icons)
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export default function ShareButtons({ title, slug, layout = 'vertical' }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? `${window.location.origin}/post/${slug}` : `/post/${slug}`;

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

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`${title}\n\n${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handleFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer,width=600,height=400');
  };

  const handleTwitter = () => {
    const text = encodeURIComponent(title);
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${text}`, '_blank', 'noopener,noreferrer,width=600,height=400');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // User cancelled - do nothing
      }
    } else {
      handleCopyLink();
    }
  };

  const isVertical = layout === 'vertical';

  return (
    <div className={`flex ${isVertical ? 'lg:flex-col' : 'flex-row flex-wrap'} gap-2.5`}>
      <Button
        variant="outline"
        onClick={handleWhatsApp}
        className="w-full justify-start rounded-sm text-[#0f172a]/70 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-all group/wa"
      >
        <MessageSquare className="w-4 h-4 mr-3 group-hover/wa:scale-110 transition-transform" />
        <span className={isVertical ? 'hidden lg:inline font-bold' : 'font-bold'}>WhatsApp</span>
      </Button>

      <Button
        variant="outline"
        onClick={handleFacebook}
        className="w-full justify-start rounded-sm text-[#0f172a]/70 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all group/fb"
      >
        <FacebookIcon className="w-4 h-4 mr-3 group-hover/fb:scale-110 transition-transform" />
        <span className={isVertical ? 'hidden lg:inline font-bold' : 'font-bold'}>Facebook</span>
      </Button>

      <Button
        variant="outline"
        onClick={handleTwitter}
        className="w-full justify-start rounded-sm text-[#0f172a]/70 hover:text-[#0f172a] hover:bg-slate-50 hover:border-[#0f172a]/20 transition-all group/tw"
      >
        <XIcon className="w-3.5 h-3.5 mr-3 group-hover/tw:scale-110 transition-transform" />
        <span className={isVertical ? 'hidden lg:inline font-bold' : 'font-bold'}>X (Twitter)</span>
      </Button>

      <Button
        variant="outline"
        onClick={handleCopyLink}
        className={`w-full justify-start rounded-sm transition-all group/copy ${
          copied
            ? 'text-emerald-600 border-emerald-200 bg-emerald-50'
            : 'text-[#0f172a]/70 hover:text-[#c20000] hover:bg-[#c20000]/5 hover:border-[#c20000]/30'
        }`}
      >
        {copied ? (
          <Check className="w-4 h-4 mr-3" />
        ) : (
          <LinkIcon className="w-4 h-4 mr-3 group-hover/copy:scale-110 transition-transform" />
        )}
        <span className={isVertical ? 'hidden lg:inline font-bold' : 'font-bold'}>
          {copied ? 'Tersalin!' : 'Salin Tautan'}
        </span>
      </Button>

      {/* Native Share (only shows on mobile) */}
      <Button
        variant="outline"
        onClick={handleNativeShare}
        className="w-full justify-start rounded-sm text-[#0f172a]/70 hover:text-[#c20000] hover:bg-[#c20000]/5 hover:border-[#c20000]/30 transition-all lg:hidden group/share"
      >
        <Share2 className="w-4 h-4 mr-3 group-hover/share:scale-110 transition-transform" />
        <span className="font-bold">Bagikan Lainnya</span>
      </Button>
    </div>
  );
}
