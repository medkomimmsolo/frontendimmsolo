'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Quote, ShieldCheck, Sparkles } from 'lucide-react';
import { getApiBase, normalizeSettings } from '@/lib/settings';
import { toAbsoluteMediaUrl } from '@/lib/absoluteUrl';

type ChairmanProps = {
  name?: string;
  period?: string;
  message?: string;
  photo?: string;
};

const DEFAULT_FALLBACK_PHOTO = '/images/chairman-placeholder.svg';

export default function ChairmanMessageSection({
  name: initialName,
  period: initialPeriod,
  message: initialMessage,
  photo: initialPhoto,
}: ChairmanProps) {
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
          setImgSrc(
            s.chairman_photo
              ? (toAbsoluteMediaUrl(s.chairman_photo) || s.chairman_photo)
              : DEFAULT_FALLBACK_PHOTO
          );
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
  const chairmanMessage =
    message.trim() ||
    'Selamat datang di website resmi Pimpinan Cabang Ikatan Mahasiswa Muhammadiyah (PC IMM) Kota Surakarta. Mari bersama-sama mewujudkan generasi yang anggun dalam moral dan unggul dalam intelektual demi kemaslahatan umat dan bangsa.';

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-white via-slate-50/50 to-white relative overflow-hidden border-y border-slate-100">
      {/* Ornamen latar belakang lembut */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-[#c20000]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-48 w-96 h-96 bg-slate-200/50 rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Kolom Kiri: Foto Ketua Umum & Kartu Profil Berwibawa */}
          <div data-aos="fade-right" className="lg:col-span-5 relative max-w-md mx-auto lg:max-w-none w-full">
            <div className="relative group">
              {/* Bingkai Luar Beraksen Marun */}
              <div className="absolute -inset-2 bg-gradient-to-br from-[#c20000]/20 via-transparent to-slate-200/50 rounded-2xl blur-xs -z-10 group-hover:from-[#c20000]/30 transition-all duration-500" />
              
              {/* Wadah Utama Foto */}
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-white shadow-xl shadow-slate-900/10 border border-slate-200/80">
                <Image
                  src={imgSrc}
                  alt={`Foto ${chairmanName}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                  onError={() => setImgSrc(DEFAULT_FALLBACK_PHOTO)}
                  unoptimized={imgSrc.endsWith('.svg')}
                  priority={false}
                />
                
                {/* Gradient Proteksi Bawah */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                {/* Badge Identitas Mengambang di Atas Foto */}
                <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-xs font-semibold shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-[#c20000] animate-pulse" />
                  <span>Pimpinan Cabang</span>
                </div>
              </div>

              {/* Kartu Profil Formal di Bawah Foto */}
              <div className="mt-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-lg shadow-slate-900/5">
                <div className="flex items-center gap-2">
                  <h3 
                    className="font-bold text-base sm:text-lg text-slate-900 truncate leading-snug"
                    style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
                  >
                    {chairmanName}
                  </h3>
                  <span title="Terverifikasi" className="inline-flex">
                    <ShieldCheck className="w-4 h-4 text-[#c20000] shrink-0" />
                  </span>
                </div>
                <p className="text-xs font-semibold text-[#c20000] uppercase tracking-wider mt-0.5">
                  Ketua Umum • {chairmanPeriod}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  PC IMM Kota Surakarta
                </p>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Pesan Sambutan & Kutipan */}
          <div data-aos="fade-left" data-aos-delay="150" className="lg:col-span-7 flex flex-col justify-center">
            {/* Header Seksi */}
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-[#c20000] border border-red-100 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Sambutan Resmi
              </span>
            </div>

            <h2 
              className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0f172a] mb-6 leading-tight tracking-tight"
              style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
            >
              Untaian Kata <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c20000] to-[#8a0000]">Ketua Umum</span>
            </h2>

            {/* Kotak Sambutan Utama */}
            <div className="relative bg-white rounded-xl p-6 sm:p-8 md:p-10 border border-slate-200/80 shadow-sm shadow-slate-900/5">
              {/* Ikon Kutipan Dekoratif Besar */}
              <Quote className="absolute -top-3 left-6 w-9 h-9 text-[#c20000] fill-[#c20000]/10" />

              {/* Teks Sambutan (Mendukung Multi-paragraf) */}
              <div className="text-slate-700 text-base sm:text-lg leading-relaxed sm:leading-loose font-normal whitespace-pre-line pt-2">
                &ldquo;{chairmanMessage}&rdquo;
              </div>

              {/* Footer Kutipan: Motto Ikatan */}
              <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-600 italic">
                  &ldquo;Anggun dalam Moral, Unggul dalam Intelektual&rdquo;
                </span>
                <span className="font-mono text-[#c20000] font-bold text-[11px] uppercase tracking-wider">
                  Fastabiqul Khairat
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
