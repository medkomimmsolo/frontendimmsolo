'use client';

import { useState } from 'react';
import { MapPin, ExternalLink, Copy, Check, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface EventLocationMapProps {
  location: string;
}

export default function EventLocationMap({ location }: EventLocationMapProps) {
  const [copied, setCopied] = useState(false);

  if (!location) return null;

  const isOnline = /zoom|google meet|meet\.google|teams|youtube|live|online|daring/i.test(location);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(location);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const gmapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(location)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="mt-12 bg-white rounded-sm border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-5 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-sm bg-red-50 text-[#c20000] flex items-center justify-center shrink-0 mt-0.5">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base md:text-lg text-[#0f172a]">
              Lokasi Kegiatan
            </h3>
            <p className="text-sm text-slate-600 mt-0.5 leading-relaxed">
              {location}
            </p>
          </div>
        </div>

        {!isOnline && (
          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="text-xs h-9 border-slate-200 hover:border-slate-300"
              title="Salin alamat"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                  Tersalin
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                  Salin
                </>
              )}
            </Button>
            <Button
              asChild
              size="sm"
              className="bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs h-9 font-medium"
            >
              <a href={gmapsSearchUrl} target="_blank" rel="noopener noreferrer">
                <Navigation className="w-3.5 h-3.5 mr-1.5" />
                Buka di Maps
                <ExternalLink className="w-3 h-3 ml-1 opacity-70" />
              </a>
            </Button>
          </div>
        )}
      </div>

      {!isOnline && (
        <div className="relative w-full h-[280px] sm:h-[350px] bg-slate-100">
          <iframe
            title={`Peta Lokasi: ${location}`}
            width="100%"
            height="100%"
            src={embedUrl}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            className="border-0 w-full h-full"
          />
        </div>
      )}
    </div>
  );
}
