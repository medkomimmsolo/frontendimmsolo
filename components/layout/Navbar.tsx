'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronRight, ChevronDown, Search } from 'lucide-react';
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
      { name: 'Struktural', href: '/struktural' },
      {
        name: 'Lembaga',
        children: [
          { name: 'Komisariat', href: '/lembaga?tipe=komisariat' },
          { name: 'Lembaga Semi Otonom', href: '/lembaga?tipe=lso' },
          { name: 'Lembaga & Badan Khusus', href: '/lembaga?tipe=lembaga' },
        ]
      },
      { name: 'Semua Komisariat & Lembaga', href: '/lembaga' },
    ]
  },
  {
    name: 'Info',
    href: '/post',
    isDynamicCategories: true,
    children: [] // Will be populated dynamically
  },
  {
    name: 'IMM Digital',
    children: [
      { name: 'Perkaderan', href: 'https://perkaderan.immsolo.or.id/' },
      { name: 'Maroon Vote', href: 'https://maroonvote.immsolo.or.id/' },
    ]
  },
  {
    name: 'Layanan',
    children: [
      { name: 'Dokumen', href: '/dokumen' },
      { name: 'Tautan Pendek', href: '/shortlink' },
    ]
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
        // Sembunyikan saat scroll ke bawah, tampilkan saat ke atas / di atas.
        setIsVisible(y < 120 || y < lastY.current);
        lastY.current = y;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    const fetchSettingsAndCategories = async () => {
      try {
        const [settingsRes, categoriesRes] = await Promise.all([
          fetch(`${getApiBase()}/settings`),
          fetch(`${getApiBase()}/categories`)
        ]);

        // Backend returns a flat { key: value } map under `data`; normalizeSettings
        // also tolerates the legacy array-of-{key,value} shape.
        const settings = normalizeSettings((await settingsRes.json())?.data);
        if (settings.site_logo) setSiteLogo(settings.site_logo);
        if (settings.site_logo_white) setSiteLogoWhite(settings.site_logo_white);

        const categoriesData = await categoriesRes.json();
        if (categoriesData.success && categoriesData.data) {
          const navCopy = [...navigationTemplate];
          const infoNode = navCopy.find(n => n.name === 'Info');
          if (infoNode) {
            infoNode.children = [
              { name: 'Semua Info', href: '/post' },
              ...categoriesData.data.map((cat: any) => ({
                name: cat.name,
                href: `/post?category=${cat.slug}`
              })),
              { name: 'Agenda', href: '/agenda' }
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

  // Dropdown terbuka yang dikontrol state (bukan hover CSS murni) agar
  // selalu tertutup saat navigasi terjadi.
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Tutup semua dropdown setiap kali pindah halaman.
  useEffect(() => {
    setOpenMenu(null);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenu(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Render Desktop Menu recursively
  const renderDesktopMenuItem = (item: any, isRoot = false, parentKey = '') => {
    const key = `${parentKey}/${item.name}`;
    const isActive = pathname === item.href || (item.children && item.children.some((c: any) => pathname.startsWith(c.href || '###')));
    const isOpen = openMenu !== null && (openMenu === key || openMenu.startsWith(`${key}/`));

    if (!item.children || item.children.length === 0) {
      return (
        <Link
          key={item.name}
          href={item.href || '#'}
          onClick={() => setOpenMenu(null)}
          className={cn(
            isRoot 
              ? 'text-sm font-semibold transition-all relative py-2 px-3.5 rounded-sm overflow-hidden group/navitem' 
              : 'group/dropdownitem flex items-center justify-between px-3.5 py-2.5 text-sm font-medium rounded-sm transition-all duration-200 hover:bg-red-50 hover:pl-5',
            isRoot && isTransparent 
              ? (isActive ? 'text-white' : 'text-white/80 hover:text-white')
              : isRoot ? (isActive ? 'text-[#c20000]' : 'text-[#0f172a]/80 hover:text-[#c20000]') 
              : (isActive ? 'text-[#c20000] bg-red-50/50' : 'text-slate-700 hover:text-[#c20000]')
          )}
        >
          {/* Hover background for root items */}
          {isRoot && (
            <div className={cn(
              "absolute inset-0 rounded-sm transition-opacity duration-300 opacity-0 group-hover/navitem:opacity-100",
              isTransparent ? "bg-white/10" : "bg-slate-100/80"
            )} />
          )}
          
          <span className="relative z-10 flex items-center gap-2">
            {!isRoot && isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#c20000]" />}
            {item.name}
          </span>
          
          {/* Active indicator bar */}
          {isRoot && isActive && (
            <div
              className={cn("absolute bottom-0 left-3 right-3 h-0.5 rounded-t-full", isTransparent ? "bg-white" : "bg-[#c20000]")}
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
        onMouseLeave={() => setOpenMenu((prev) => (prev === key || prev?.startsWith(`${key}/`) ? null : prev))}
        onFocus={() => setOpenMenu(key)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpenMenu(null);
        }}
      >
        <div className={cn(
          "cursor-pointer flex items-center justify-between",
          isRoot 
            ? "text-sm font-semibold transition-all relative py-2 px-3.5 rounded-sm overflow-hidden group/navitem gap-1.5" 
            : "w-full px-3.5 py-2.5 text-sm font-medium rounded-sm transition-all duration-200 hover:bg-red-50 hover:pl-5",
          isRoot && isTransparent 
            ? (isActive ? 'text-white' : 'text-white/80 hover:text-white')
            : isRoot ? (isActive ? 'text-[#c20000]' : 'text-[#0f172a]/80 hover:text-[#c20000]') 
            : (isActive ? 'text-[#c20000] bg-red-50/50' : 'text-slate-700 hover:text-[#c20000]')
        )}>
          {/* Hover background for root items */}
          {isRoot && (
            <div className={cn(
              "absolute inset-0 rounded-sm transition-opacity duration-300 opacity-0 group-hover/navitem:opacity-100 group-hover/navdropdown:opacity-100",
              isTransparent ? "bg-white/10" : "bg-slate-100/80"
            )} />
          )}

          <span className="relative z-10 flex items-center gap-2">
            {!isRoot && isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#c20000]" />}
            {item.name}
          </span>
          {isRoot 
            ? <ChevronDown className={`w-4 h-4 opacity-70 relative z-10 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} /> 
            : <ChevronRight className="w-4 h-4 opacity-50 relative z-10 transition-transform duration-300" />
          }
          
          {/* Active indicator bar */}
          {isRoot && isActive && (
            <div
              className={cn("absolute bottom-0 left-3 right-3 h-0.5 rounded-t-full", isTransparent ? "bg-white" : "bg-[#c20000]")}
            />
          )}
        </div>

        <div className={cn(
          "absolute pt-1",
          isOpen ? "block" : "hidden",
          isRoot ? "left-0 top-full pt-3 w-64" : "left-full top-0 pl-3 w-64 -mt-2"
        )}>
          <div className={cn(
            "bg-white rounded-sm shadow-2xl shadow-slate-900/10 border border-slate-100 p-2.5 flex flex-col gap-1 ring-1 ring-black/5",
            isRoot ? "animate-in fade-in slide-in-from-top-2 duration-200" : "animate-in fade-in slide-in-from-left-2 duration-200"
          )}>
            {item.children.map((child: any) => renderDesktopMenuItem(child, false, key))}
          </div>
        </div>
      </div>
    );
  };

  // Render Mobile Menu recursively using details/summary
  const renderMobileMenuItem = (item: any) => {
    if (!item.children || item.children.length === 0) {
      return (
        <Link
          key={item.name}
          href={item.href || '#'}
          onClick={() => setMobileMenuOpen(false)}
          className="block px-3 py-2 text-base font-semibold text-[#0f172a]/90 hover:text-[#c20000]"
        >
          {item.name}
        </Link>
      );
    }

    return (
      <details key={item.name} className="group/mobile py-1">
        <summary className="flex cursor-pointer items-center justify-between px-3 py-2 text-base font-semibold text-[#0f172a]/90 hover:text-[#c20000]">
          {item.name}
          <ChevronDown className="w-4 h-4 transition-transform group-open/mobile:rotate-180" />
        </summary>
        <div className="mt-1 flex flex-col gap-1 border-l-2 border-slate-100 ml-4 pl-2">
          {item.children.map((child: any) => renderMobileMenuItem(child))}
        </div>
      </details>
    );
  };

  return (
    <>
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b py-3',
        !isVisible && !mobileMenuOpen ? '-translate-y-full' : 'translate-y-0',
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md border-[#0f172a]/10 shadow-sm' 
          : 'bg-transparent border-transparent'
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 group" aria-label="PC IMM Kota Surakarta - Beranda">
            {activeLogo ? (
              <img src={`${activeLogo}`} alt="Logo PC IMM Kota Surakarta" width={160} height={40} className="h-10 w-auto object-contain transition-all duration-300" />
            ) : (
              <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-[#c20000] to-[#a30000] flex items-center justify-center text-white font-bold text-lg">I</div>
            )}
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navigation.map(item => renderDesktopMenuItem(item, true))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link href="/cari" title="Cari" className={cn("p-2 rounded-full transition-colors", isTransparent ? "text-white hover:bg-white/10" : "text-[#0f172a]/70 hover:bg-slate-100")}>
            <Search className="w-5 h-5" />
          </Link>
          <Link href="/login">
            <Button className={cn("rounded-sm transition-colors bg-[#c20000] hover:bg-[#a30000] text-white border-none px-6", isTransparent ? "shadow-none" : "shadow-sm")}>
              Masuk
            </Button>
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden">
          <button
            type="button"
            className={cn("-m-2.5 inline-flex items-center justify-center p-2.5", isTransparent ? "text-white" : "text-[#0f172a]/90")}
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Buka menu utama"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </nav>
    </header>

      {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-[100] bg-white overflow-y-auto"
          >
            <div className="flex items-center justify-between px-6 py-6 border-b border-[#0f172a]/5">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} aria-label="PC IMM Kota Surakarta - Beranda">
                {siteLogo ? (
                  <img src={`${siteLogo}`} alt="Logo PC IMM Kota Surakarta" width={128} height={32} className="h-8 w-auto object-contain" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#c20000] flex items-center justify-center text-white font-bold text-sm">I</div>
                )}
              </Link>
              <button type="button" className="-m-2.5 p-2.5 text-[#0f172a]/90" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="mt-6 px-6">
              <div className="-my-6 divide-y divide-slate-100">
                <div className="space-y-2 py-6">
                  {navigation.map(item => renderMobileMenuItem(item))}
                </div>
                <div className="py-6">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block w-full rounded-sm px-4 py-3 text-center text-base font-semibold text-white bg-[#c20000] hover:bg-[#a30000] transition-colors">
                    Masuk
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
    </>
  );
}
