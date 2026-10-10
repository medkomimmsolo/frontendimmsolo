'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronRight, ChevronDown, Search, LogIn, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { getApiBase, normalizeSettings } from '@/lib/settings';

// Base static structure without the dynamic categories
const navigationTemplate = [
  {
    name: 'Profil',
    children: [
      { name: 'Sejarah IMM', href: '/sejarah' },
      { name: 'Tentang IMM Kota Surakarta', href: '/tentang' },
      { name: 'Struktur Pimpinan', href: '/struktural' },
      {
        name: 'Komisariat & Lembaga',
        children: [
          { name: 'Komisariat Kampus', href: '/lembaga?tipe=komisariat' },
          { name: 'Lembaga Semi Otonom (LSO)', href: '/lembaga?tipe=lso' },
          { name: 'Lembaga & Badan Khusus', href: '/lembaga?tipe=lembaga' },
        ],
      },
      { name: 'Semua Komisariat & Lembaga', href: '/lembaga' },
    ],
  },
  {
    name: 'Info',
    href: '/post',
    isDynamicCategories: true,
    children: [], // Akan diisi dinamis dari API categories
  },
  {
    name: 'IMM Digital',
    children: [
      { name: 'Sistem Perkaderan', href: 'https://perkaderan.immsolo.or.id/' },
      { name: 'Maroon Vote', href: 'https://maroonvote.immsolo.or.id/' },
    ],
  },
  {
    name: 'Layanan',
    children: [
      { name: 'Dokumen & Arsip', href: '/dokumen' },
      { name: 'Tautan Pendek (Shortlink)', href: '/shortlink' },
      { name: 'Formulir Publik', href: '/form' },
      { name: 'Tautan Resmi (Biolink)', href: '/links' },
    ],
  },
  { name: 'Kontak', href: '/kontak' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastY = useRef(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [siteLogo, setSiteLogo] = useState<string | null>(null);
  const [siteLogoWhite, setSiteLogoWhite] = useState<string | null>(null);
  const [navigation, setNavigation] = useState<any[]>(navigationTemplate);
  const pathname = usePathname();

  const isHomeOrTentangOrSejarah = pathname === '/' || pathname === '/tentang' || pathname === '/sejarah';
  const isTransparent = isHomeOrTentangOrSejarah && !isScrolled;

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const y = window.scrollY;
        setIsScrolled(y > 20);
        // Sembunyikan saat scroll cepat ke bawah, tampilkan saat scroll ke atas atau di pucuk
        setIsVisible(y < 120 || y < lastY.current);
        lastY.current = y;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    const fetchSettingsAndCategories = async () => {
      try {
        const [settingsRes, categoriesRes] = await Promise.all([
          fetch(`${getApiBase()}/settings`),
          fetch(`${getApiBase()}/categories`),
        ]);

        const settings = normalizeSettings((await settingsRes.json())?.data);
        if (settings.site_logo) setSiteLogo(settings.site_logo);
        if (settings.site_logo_white) setSiteLogoWhite(settings.site_logo_white);

        const categoriesData = await categoriesRes.json();
        if (categoriesData.success && categoriesData.data) {
          const navCopy = [...navigationTemplate];
          const infoNode = navCopy.find((n) => n.name === 'Info');
          if (infoNode) {
            infoNode.children = [
              { name: 'Semua Berita & Opini', href: '/post' },
              ...categoriesData.data.map((cat: any) => ({
                name: cat.name,
                href: `/post?category=${cat.slug}`,
              })),
              { name: 'Agenda Kegiatan', href: '/agenda' },
            ];
          }
          setNavigation(navCopy);
        }
      } catch (e) {
        console.error('Failed to fetch navbar data', e);
      }
    };

    fetchSettingsAndCategories();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const activeLogo = isTransparent ? (siteLogoWhite || siteLogo) : siteLogo;

  // Dropdown state
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Tutup dropdown saat ganti halaman
  useEffect(() => {
    setOpenMenu(null);
    setMobileMenuOpen(false);
  }, [pathname]);

  // Tutup dropdown dengan tombol Esc
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenMenu(null);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Render Desktop Menu recursively
  const renderDesktopMenuItem = (item: any, isRoot = false, parentKey = '') => {
    const key = `${parentKey}/${item.name}`;
    const isActive =
      pathname === item.href ||
      (item.children && item.children.some((c: any) => pathname.startsWith(c.href || '###')));
    const isOpen = openMenu !== null && (openMenu === key || openMenu.startsWith(`${key}/`));
    const isExternal = item.href && (item.href.startsWith('http://') || item.href.startsWith('https://'));

    if (!item.children || item.children.length === 0) {
      const linkProps = isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {};
      return (
        <Link
          key={item.name}
          href={item.href || '#'}
          {...linkProps}
          onClick={() => setOpenMenu(null)}
          className={cn(
            isRoot
              ? 'text-xs lg:text-sm font-semibold transition-all relative py-2 px-3 lg:px-3.5 rounded-xl overflow-hidden group/navitem flex items-center gap-1.5'
              : 'group/dropdownitem flex items-center justify-between px-3.5 py-2.5 text-xs lg:text-sm font-medium rounded-lg transition-all duration-200 hover:bg-red-50/80 hover:text-[#c20000]',
            isRoot && isTransparent
              ? (isActive ? 'text-white' : 'text-white/80 hover:text-white')
              : isRoot
              ? (isActive ? 'text-[#c20000]' : 'text-slate-800 hover:text-[#c20000]')
              : (isActive ? 'text-[#c20000] bg-red-50/60 font-semibold' : 'text-slate-700')
          )}
        >
          {/* Hover background for root items */}
          {isRoot && (
            <div
              className={cn(
                'absolute inset-0 rounded-xl transition-opacity duration-300 opacity-0 group-hover/navitem:opacity-100',
                isTransparent ? 'bg-white/10' : 'bg-slate-100/70'
              )}
            />
          )}

          <span className="relative z-10 flex items-center gap-2">
            {!isRoot && isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#c20000]" />}
            {item.name}
          </span>

          {isExternal && !isRoot && (
            <ExternalLink className="w-3.5 h-3.5 opacity-40 group-hover/dropdownitem:opacity-100 transition-opacity" />
          )}

          {/* Active indicator bar */}
          {isRoot && isActive && (
            <div
              className={cn(
                'absolute bottom-0 left-3 right-3 h-0.5 rounded-t-full',
                isTransparent ? 'bg-white' : 'bg-[#c20000]'
              )}
            />
          )}
        </Link>
      );
    }

    return (
      <div
        key={item.name}
        className="relative"
        tabIndex={0}
        role="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={`Menu ${item.name}`}
        onMouseEnter={() => setOpenMenu(key)}
        onMouseLeave={() =>
          setOpenMenu((prev) => (prev === key || prev?.startsWith(`${key}/`) ? null : prev))
        }
        onFocus={() => setOpenMenu(key)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpenMenu(null);
        }}
      >
        <div
          className={cn(
            'cursor-pointer flex items-center justify-between transition-all duration-200 select-none',
            isRoot
              ? 'text-xs lg:text-sm font-semibold relative py-2 px-3 lg:px-3.5 rounded-xl overflow-hidden group/navitem gap-1.5'
              : 'w-full px-3.5 py-2.5 text-xs lg:text-sm font-medium rounded-lg hover:bg-red-50/80 hover:text-[#c20000]',
            isRoot && isTransparent
              ? (isActive ? 'text-white' : 'text-white/80 hover:text-white')
              : isRoot
              ? (isActive ? 'text-[#c20000]' : 'text-slate-800 hover:text-[#c20000]')
              : (isActive ? 'text-[#c20000] bg-red-50/60 font-semibold' : 'text-slate-700')
          )}
        >
          {isRoot && (
            <div
              className={cn(
                'absolute inset-0 rounded-xl transition-opacity duration-300 opacity-0 group-hover/navitem:opacity-100',
                isTransparent ? 'bg-white/10' : 'bg-slate-100/70'
              )}
            />
          )}

          <span className="relative z-10 flex items-center gap-1.5">
            {!isRoot && isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#c20000]" />}
            {item.name}
          </span>
          {isRoot ? (
            <ChevronDown
              className={`w-3.5 h-3.5 opacity-70 relative z-10 transition-transform duration-300 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 opacity-50 relative z-10 transition-transform duration-300" />
          )}

          {isRoot && isActive && (
            <div
              className={cn(
                'absolute bottom-0 left-3 right-3 h-0.5 rounded-t-full',
                isTransparent ? 'bg-white' : 'bg-[#c20000]'
              )}
            />
          )}
        </div>

        {/* Dropdown Menu Box */}
        <div
          className={cn(
            'absolute pt-1 z-50',
            isOpen ? 'block' : 'hidden',
            isRoot ? 'left-0 top-full pt-2.5 w-64' : 'left-full top-0 pl-2.5 w-64 -mt-1.5'
          )}
        >
          <div
            className={cn(
              'bg-white rounded-xl shadow-xl shadow-slate-900/10 border border-slate-200/90 p-2 flex flex-col gap-0.5 ring-1 ring-black/5 backdrop-blur-md',
              isRoot
                ? 'animate-in fade-in slide-in-from-top-2 duration-200'
                : 'animate-in fade-in slide-in-from-left-2 duration-200'
            )}
          >
            {item.children.map((child: any) => renderDesktopMenuItem(child, false, key))}
          </div>
        </div>
      </div>
    );
  };

  // Render Mobile Menu recursively using details/summary
  const renderMobileMenuItem = (item: any) => {
    if (!item.children || item.children.length === 0) {
      const isExternal = item.href && (item.href.startsWith('http://') || item.href.startsWith('https://'));
      const linkProps = isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {};
      return (
        <Link
          key={item.name}
          href={item.href || '#'}
          {...linkProps}
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center justify-between px-3 py-2.5 text-sm font-semibold text-slate-800 hover:text-[#c20000] hover:bg-red-50/50 rounded-lg transition-colors"
        >
          <span>{item.name}</span>
          {isExternal && <ExternalLink className="w-3.5 h-3.5 text-slate-400" />}
        </Link>
      );
    }

    return (
      <details key={item.name} className="group/mobile py-1">
        <summary className="flex cursor-pointer items-center justify-between px-3 py-2.5 text-sm font-semibold text-slate-800 hover:text-[#c20000] hover:bg-slate-50 rounded-lg transition-colors select-none">
          <span>{item.name}</span>
          <ChevronDown className="w-4 h-4 transition-transform group-open/mobile:rotate-180 text-slate-400" />
        </summary>
        <div className="mt-1 flex flex-col gap-0.5 border-l-2 border-red-100 ml-4 pl-3">
          {item.children.map((child: any) => renderMobileMenuItem(child))}
        </div>
      </details>
    );
  };

  return (
    <>
      <header
        className={cn(
          'fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b py-2.5 sm:py-3',
          !isVisible && !mobileMenuOpen ? '-translate-y-full' : 'translate-y-0',
          isScrolled
            ? 'bg-white/95 backdrop-blur-md border-slate-200/80 shadow-xs'
            : 'bg-transparent border-transparent'
        )}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo Brand */}
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex items-center gap-2 group"
              aria-label="PC IMM Kota Surakarta - Beranda"
            >
              {activeLogo ? (
                <img
                  src={`${activeLogo}`}
                  alt="Logo PC IMM Kota Surakarta"
                  width={150}
                  height={38}
                  className="h-9 sm:h-10 w-auto object-contain transition-all duration-300"
                />
              ) : (
                <div className="h-9 sm:h-10 px-3 rounded-md bg-gradient-to-br from-[#c20000] to-[#990000] flex items-center justify-center text-white font-extrabold text-sm tracking-wider shadow-sm">
                  PC IMM
                </div>
              )}
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            {navigation.map((item) => renderDesktopMenuItem(item, true))}
          </div>

          {/* Quick Actions Desktop (Search & Login Button) */}
          <div className="hidden md:flex items-center gap-2.5">
            <Link
              href="/cari"
              title="Cari berita, agenda, dokumen..."
              className={cn(
                'p-2 rounded-full transition-colors flex items-center justify-center',
                isTransparent
                  ? 'text-white hover:bg-white/15'
                  : 'text-slate-600 hover:text-[#c20000] hover:bg-slate-100'
              )}
            >
              <Search className="w-4 h-4" />
            </Link>

            <Link href="/login">
              <Button
                className={cn(
                  'rounded-xl text-xs font-semibold px-4 h-9 transition-all inline-flex items-center gap-1.5 shadow-sm',
                  'bg-[#c20000] hover:bg-[#a30000] text-white border-none hover:shadow'
                )}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk</span>
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center gap-1.5 md:hidden">
            <Link
              href="/cari"
              className={cn(
                'p-2 rounded-full transition-colors',
                isTransparent ? 'text-white' : 'text-slate-700'
              )}
              aria-label="Pencarian"
            >
              <Search className="w-5 h-5" />
            </Link>

            <button
              type="button"
              className={cn(
                'p-2 rounded-md transition-colors',
                isTransparent ? 'text-white hover:bg-white/10' : 'text-slate-800 hover:bg-slate-100'
              )}
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Buka menu utama"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          <div
            className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Mobile Drawer */}
            <div>
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="PC IMM Kota Surakarta - Beranda"
                >
                  {siteLogo ? (
                    <img
                      src={`${siteLogo}`}
                      alt="Logo PC IMM Kota Surakarta"
                      width={130}
                      height={32}
                      className="h-8 w-auto object-contain"
                    />
                  ) : (
                    <div className="h-8 px-2.5 rounded bg-[#c20000] text-white font-bold text-xs flex items-center justify-center">
                      PC IMM SURAKARTA
                    </div>
                  )}
                </Link>
                <button
                  type="button"
                  className="p-1.5 text-slate-500 hover:text-slate-800 rounded-md hover:bg-slate-100 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Tutup menu"
                >
                  <X className="h-5 h-5" />
                </button>
              </div>

              {/* Pencarian di Mobile Drawer */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <form action="/cari" method="get" className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="q"
                    placeholder="Cari berita, agenda..."
                    className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000]"
                  />
                </form>
              </div>

              {/* Navigasi List Mobile */}
              <div className="p-4 space-y-1">
                {navigation.map((item) => renderMobileMenuItem(item))}
              </div>
            </div>

            {/* Footer Mobile Drawer */}
            <div className="p-5 border-t border-slate-100 bg-slate-50/70 space-y-3">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full rounded-xl py-2.5 text-sm font-semibold text-white bg-[#c20000] hover:bg-[#a30000] shadow-sm transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk ke Panel Admin</span>
              </Link>
              <p className="text-[11px] text-center text-slate-400 font-mono">
                Fastabiqul Khairat • immsolo.or.id
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
