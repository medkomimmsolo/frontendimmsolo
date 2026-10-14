'use client';

import { useState } from 'react';
import { Download, Copy, Check, Share2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { getUserFacingErrorMessage } from '@/lib/errorMessage';

interface FileActionsProps {
  slug: string;
  fileUrl: string | null;
  downloadUrl: string;
  title: string;
  fileType?: string;
}

export default function FileActions({
  slug,
  fileUrl,
  downloadUrl,
  title,
  fileType,
}: FileActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/files/${slug}` : `https://immsolo.or.id/files/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Tautan berkas berhasil disalin.');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error, 'Tautan belum tersalin. Periksa izin clipboard browser, lalu coba lagi.'));
    }
  };

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/files/${slug}` : `https://immsolo.or.id/files/${slug}`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Unduh berkas: ${title}`,
          url,
        });
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        asChild
        className="bg-[#c20000] hover:bg-[#a30000] text-white shadow-md rounded-xl px-6 h-11 text-sm font-semibold transition-transform hover:scale-[1.02] active:scale-[0.98]"
      >
        <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
          <Download className="w-4 h-4 mr-2" />
          Unduh Berkas
        </a>
      </Button>

      {fileUrl && (
        <Button
          asChild
          variant="outline"
          className="border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl px-4 h-11 text-sm font-medium"
        >
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" />
            {fileType === 'image' ? 'Lihat Gambar Penuh' : 'Buka Langsung'}
          </a>
        </Button>
      )}

      <Button
        type="button"
        variant="outline"
        onClick={handleCopyLink}
        className="border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl px-4 h-11 text-sm font-medium"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 mr-2 text-emerald-600" />
            <span className="text-emerald-600">Tersalin</span>
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 mr-2" />
            Salin Link
          </>
        )}
      </Button>

      <Button
        type="button"
        variant="outline"
        onClick={handleShare}
        className="border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl px-3.5 h-11 text-sm font-medium"
        title="Bagikan"
      >
        <Share2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
