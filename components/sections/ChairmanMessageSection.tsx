'use client';

import { useState, useEffect } from 'react';
import { Quote } from 'lucide-react';
import Image from 'next/image';
import { getApiBase, normalizeSettings } from '@/lib/settings';
import { toAbsoluteMediaUrl } from '@/lib/absoluteUrl';

type ChairmanProps = {
  name?: string;
  period?: string;
  message?: string;
  photo?: string;
};

const DEFAULT_FALLBACK_PHOTO = 'https://placehold.co/600x800/e2e8f0/64748b?text=Foto+Ketua';

export default function ChairmanMessageSection({ name: initialName, period: initialPeriod, message: initialMessage, photo: initialPhoto }: ChairmanProps) {
  const [name, setName] = useState(initialName || '');
  const [period, setPeriod] = useState(initialPeriod || '');
  const [message, setMessage] = useState(initialMessage || '');
  const [photo, setPhoto] = useState(initialPhoto || '');
  const [imgSrc, setImgSrc] = useState<string>(
    initialPhoto ? (toAbsoluteMediaUrl(initialPhoto) || initialPhoto) : DEFAULT_FALLBACK_PHOTO
  );

  // Sync secara client-side langsung dari API /settings untuk memastikan data selalu fresh
  // tanpa terhalang ISR / Route Cache jika admin baru saja memperbarui setting di dashboard.
  useEffect(() => {
    let isMounted = true;
    fetch(`${getApiBase()}/settings`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((json) => {
        if (!isMounted) return;
        const s = normalizeSettings(json?.data);
        if (s.chairman_name !== undefined) setName(s.chairman_name);
        if (s.chairman_period !== undefined) setPeriod(s.chairman_period);
        if (s.chairman_message !== undefined) setMessage(s.chairman_message);
        if (s.chairman_photo !== undefined) {
          setPhoto(s.chairman_photo);
          setImgSrc(s.chairman_photo ? (toAbsoluteMediaUrl(s.chairman_photo) || s.chairman_photo) : DEFAULT_FALLBACK_PHOTO);
        }
      })
      .catch(() => {
        // Fallback tetap menggunakan initial props
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const chairmanName = name.trim() || 'Ketua Umum';
  const chairmanPeriod = period.trim() || 'Periode 2024 - 2025';
  const chairmanMessage = message.trim() || 'Selamat datang di website resmi Pimpinan Cabang Ikatan Mahasiswa Muhammadiyah (PC IMM) Kota Surakarta. Mari bersama-sama mewujudkan generasi yang anggun dalam moral dan unggul dalam intelektual.';

  return (
    <section className="py-20 md:py-28 bg-white relative overflow-hidden border-t border-[#0f172a]/5">
      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Photo Section */}
          <div data-aos="fade-right" className="lg:col-span-5 relative max-w-sm mx-auto lg:max-w-none w-full">
            <div className="relative z-10 aspect-square md:aspect-[4/5] rounded-sm overflow-hidden border border-[#0f172a]/10 shadow-lg bg-white group">
              <div className="absolute inset-0 bg-[#0f172a]/5 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
              <Image 
                src={imgSrc} 
                alt={`Foto ${chairmanName}`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover filter grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
                onError={() => setImgSrc(DEFAULT_FALLBACK_PHOTO)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/80 via-transparent to-transparent z-20"></div>
              <div className="absolute bottom-6 left-6 z-30">
                <p className="font-bold text-2xl text-white tracking-tight" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>{chairmanName}</p>
                <p className="text-sm text-white/90 font-medium">Ketua Umum PC IMM Kota Surakarta {chairmanPeriod}</p>
              </div>
            </div>
            
            {/* Decorative block behind photo */}
            <div className="absolute -bottom-2 -right-2 md:-bottom-4 md:-right-4 w-3/4 h-3/4 bg-[#c20000]/10 rounded-sm -z-10"></div>
            <div className="absolute -top-2 -left-2 md:-top-4 md:-left-4 w-16 h-16 md:w-24 md:h-24 border-t-2 border-l-2 border-[#c20000]/30 -z-10"></div>
          </div>

          {/* Text/Message Section */}
          <div data-aos="fade-left" data-aos-delay="150" className="lg:col-span-7 flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-[#c20000] font-bold uppercase tracking-widest text-sm">Sambutan</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0f172a] mb-8 leading-tight" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
              Pesan <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c20000] to-[#8a0000]">Ketua Umum</span>
            </h2>
            
            <div className="relative">
              <Quote className="absolute -top-2 -left-2 md:-top-4 md:-left-4 w-8 h-8 md:w-12 md:h-12 text-[#c20000]/10 -z-10" />
              <p className="text-xl md:text-2xl text-[#0f172a]/80 leading-relaxed font-medium italic border-l-4 border-[#c20000] pl-4 md:pl-6 py-2">
                &ldquo;{chairmanMessage}&rdquo;
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
