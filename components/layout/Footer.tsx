'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Mail, Phone } from 'lucide-react';
import { getApiBase, normalizeSettings, type Settings } from '@/lib/settings';

/** Bangun URL sosmed dari value settings (bisa URL penuh atau handle). */
function socialUrl(kind: 'instagram' | 'youtube' | 'tiktok', value: string | undefined): string | null {
  if (!value) return null;
  const v = value.trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  const handle = v.replace(/^@/, '');
  if (!handle) return null;
  if (kind === 'instagram') return `https://instagram.com/${handle}`;
  if (kind === 'tiktok') return `https://tiktok.com/@${handle}`;
  // YouTube: handle tanpa spasi dianggap @handle, nama channel difallback ke pencarian.
  if (!/\s/.test(handle)) return `https://youtube.com/${handle.startsWith('@') ? handle : `@${handle}`}`;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(v)}`;
}

export default function Footer() {
  const [settings, setSettings] = useState<Settings>({});

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${getApiBase()}/settings`);
        const data = await response.json();
        // Backend returns a flat { key: value } map under `data`; normalizeSettings
        // also tolerates the legacy array-of-{key,value} shape.
        setSettings(normalizeSettings(data?.data));
      } catch (e) {
        console.error('Failed to fetch site settings', e);
      }
    };
    fetchSettings();
  }, []);

  const siteLogoWhite = settings.site_logo_white || settings.site_logo || null;
  const email = settings.contact_email || 'solo.imm@gmail.com';
  const phone = settings.contact_phone || '+62 85879136568';
  const address = settings.address || 'Gedung Dakwah Balai Muhammadiyah, Jl. Teuku Umar No.5, Keprabon, Surakarta';

  const socials = [
    {
      label: 'Instagram',
      href: socialUrl('instagram', settings.social_instagram),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
      ),
    },
    {
      label: 'Youtube',
      href: socialUrl('youtube', settings.social_youtube),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
      ),
    },
    {
      label: 'Tiktok',
      href: socialUrl('tiktok', settings.social_tiktok),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 12a4 4 0 1 0 4 4V4c.6 2.5 2.4 4.3 5 4.6"/></svg>
      ),
    },
  ].filter((s) => s.href);

  return (
    <footer className="bg-[#0f172a] border-t border-white/10 pt-20 pb-10 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-[#c20000]/80 to-transparent"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#c20000]/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          {/* Brand Info */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="inline-flex items-center gap-3 group">
              {siteLogoWhite ? (
                <img
                  src={`${siteLogoWhite}`}
                  alt="Logo PC IMM Kota Surakarta"
                  width={160}
                  height={48}
                  loading="lazy"
                  className="h-12 w-auto object-contain transition-transform group-hover:scale-105"
                />
              ) : (
                <>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#c20000] to-[#a30000] flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-[#c20000]/40">
                    I
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl font-bold leading-tight text-white tracking-wide">
                      PC IMM
                    </span>
                    <span className="text-sm text-white/70 leading-tight font-medium">
                      Kota Surakarta
                    </span>
                  </div>
                </>
              )}
            </Link>
            <p className="text-white/80 leading-relaxed pr-4 text-base">
              Wadah perjuangan mahasiswa Muhammadiyah untuk membentuk akademisi Islam yang berakhlak mulia demi terwujudnya tujuan persyarikatan.
            </p>
            {socials.length > 0 && (
              <div className="flex gap-3 pt-2">
                {socials.map((s) => (
                  <a key={s.label} href={s.href as string} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-[#c20000] hover:border-[#c20000] transition-all duration-300 shadow-sm">
                    {s.icon}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h2 className="text-white font-bold text-lg mb-6 tracking-wide">Tautan Cepat</h2>
            <ul className="space-y-4 text-white/80">
              <li><Link href="/tentang" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Tentang IMM</Link></li>
              <li><Link href="/post" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Post & Artikel</Link></li>
              <li><Link href="/agenda" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Agenda Kegiatan</Link></li>
              <li><Link href="/struktural" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Struktural PC</Link></li>

            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h2 className="text-white font-bold text-lg mb-6 tracking-wide">Hubungi Kami</h2>
            <ul className="space-y-5 text-white/80">
              <li className="flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#c20000] group-hover:border-[#c20000] transition-colors duration-300 shadow-sm">
                  <MapPin className="w-5 h-5 text-white group-hover:text-white transition-colors" />
                </div>
                <span className="text-base leading-relaxed pt-1">{address}</span>
              </li>
              <li className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#c20000] group-hover:border-[#c20000] transition-colors duration-300 shadow-sm">
                  <Mail className="w-5 h-5 text-white group-hover:text-white transition-colors" />
                </div>
                <a href={`mailto:${email}`} className="text-base hover:text-white transition-colors break-all">{email}</a>
              </li>
              <li className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#c20000] group-hover:border-[#c20000] transition-colors duration-300 shadow-sm">
                  <Phone className="w-5 h-5 text-white group-hover:text-white transition-colors" />
                </div>
                <a href={`tel:${phone.replace(/[^+\d]/g, '')}`} className="text-base hover:text-white transition-colors">{phone}</a>
              </li>
            </ul>
          </div>

          {/* Layanan */}
          <div className="lg:col-span-3">
            <h2 className="text-white font-bold text-lg mb-6 tracking-wide">Layanan</h2>
            <ul className="space-y-4 text-white/80">
              <li><Link href="/shortlink" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Shortlink</Link></li>
              <li><Link href="/form" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Formulir Pendaftaran</Link></li>
              <li><Link href="/links" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Tautan Resmi</Link></li>
              <li><Link href="/dokumen" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Dokumen</Link></li>
              <li><Link href="/kontak" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-300">Kontak</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/60 font-medium">
            © {new Date().getFullYear()} PC IMM Kota Surakarta. Hak cipta dilindungi.
          </p>
          <div className="flex gap-6 text-sm text-white/60 font-medium">
            <Link href="/kebijakan-privasi" className="hover:text-white transition-colors duration-300">Kebijakan Privasi</Link>
            <Link href="/syarat-ketentuan" className="hover:text-white transition-colors duration-300">Syarat & Ketentuan</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
