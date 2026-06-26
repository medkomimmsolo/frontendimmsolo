'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

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
          { name: 'Lembaga Otonom', href: '/lembaga/otonom' },
          { name: 'Lembaga Semi Otonom', href: '/lembaga/semi-otonom' },
        ]
      },
      { name: 'Komisariat', href: '/komisariat' },
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [siteLogo, setSiteLogo] = useState<string | null>(null);
  const [siteLogoWhite, setSiteLogoWhite] = useState<string | null>(null);
  const [navigation, setNavigation] = useState<any[]>(navigationTemplate);
  const pathname = usePathname();

  const isHomeOrTentangOrSejarah = pathname === '/' || pathname === '/tentang' || pathname === '/sejarah';
  const isTransparent = isHomeOrTentangOrSejarah && !isScrolled;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    
    const fetchSettingsAndCategories = async () => {
      try {
        const [settingsRes, categoriesRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`)
        ]);

        const settingsData = await settingsRes.json();
        if (settingsData.success && settingsData.data) {
          if (settingsData.data.site_logo) setSiteLogo(settingsData.data.site_logo);
          if (settingsData.data.site_logo_white) setSiteLogoWhite(settingsData.data.site_logo_white);
        }

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

  // Render Desktop Menu recursively
  const renderDesktopMenuItem = (item: any, isRoot = false) => {
    const isActive = pathname === item.href || (item.children && item.children.some((c: any) => pathname.startsWith(c.href || '###')));

    if (!item.children || item.children.length === 0) {
      return (
        <Link
          key={item.name}
          href={item.href || '#'}
          className={cn(
            isRoot 
              ? 'text-sm font-semibold transition-all relative py-2 px-3.5 rounded-md overflow-hidden group/navitem' 
              : 'group/dropdownitem flex items-center justify-between px-3.5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-red-50 hover:pl-5',
            isRoot && isTransparent 
              ? (isActive ? 'text-white' : 'text-white/80 hover:text-white')
              : isRoot ? (isActive ? 'text-[#c20000]' : 'text-[#0f172a]/80 hover:text-[#c20000]') 
              : (isActive ? 'text-[#c20000] bg-red-50/50' : 'text-slate-700 hover:text-[#c20000]')
          )}
        >
          {/* Hover background for root items */}
          {isRoot && (
            <div className={cn(
              "absolute inset-0 rounded-md transition-opacity duration-300 opacity-0 group-hover/navitem:opacity-100 -z-10",
              isTransparent ? "bg-white/10" : "bg-slate-100/80"
            )} />
          )}
          
          <span className="relative z-10 flex items-center gap-2">
            {!isRoot && isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#c20000]" />}
            {item.name}
          </span>
          
          {/* Active indicator bar */}
          {isRoot && isActive && (
            <motion.div
              layoutId="navbar-indicator"
              className={cn("absolute bottom-0 left-3 right-3 h-0.5 rounded-t-full", isTransparent ? "bg-white" : "bg-[#c20000]")}
              initial={false}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
        </Link>
      );
    }

    return (
      <div key={item.name} className={cn("relative", isRoot ? "group/navdropdown" : "group/sub")}>
        <div className={cn(
          "cursor-pointer flex items-center justify-between",
          isRoot 
            ? "text-sm font-semibold transition-all relative py-2 px-3.5 rounded-md overflow-hidden group/navitem gap-1.5" 
            : "w-full px-3.5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-red-50 hover:pl-5",
          isRoot && isTransparent 
            ? (isActive ? 'text-white' : 'text-white/80 hover:text-white')
            : isRoot ? (isActive ? 'text-[#c20000]' : 'text-[#0f172a]/80 hover:text-[#c20000]') 
            : (isActive ? 'text-[#c20000] bg-red-50/50' : 'text-slate-700 hover:text-[#c20000]')
        )}>
          {/* Hover background for root items */}
          {isRoot && (
            <div className={cn(
              "absolute inset-0 rounded-md transition-opacity duration-300 opacity-0 group-hover/navitem:opacity-100 group-hover/navdropdown:opacity-100 -z-10",
              isTransparent ? "bg-white/10" : "bg-slate-100/80"
            )} />
          )}

          <span className="relative z-10 flex items-center gap-2">
            {!isRoot && isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#c20000]" />}
            {item.name}
          </span>
          {isRoot 
            ? <ChevronDown className="w-4 h-4 opacity-70 relative z-10 transition-transform duration-300 group-hover/navdropdown:rotate-180" /> 
            : <ChevronRight className="w-4 h-4 opacity-50 relative z-10 transition-transform duration-300 group-hover/sub:translate-x-0.5" />
          }
          
          {/* Active indicator bar */}
          {isRoot && isActive && (
            <motion.div
              layoutId="navbar-indicator"
              className={cn("absolute bottom-0 left-3 right-3 h-0.5 rounded-t-full", isTransparent ? "bg-white" : "bg-[#c20000]")}
              initial={false}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
        </div>

        <div className={cn(
          "absolute pt-1 hidden",
          isRoot ? "group-hover/navdropdown:block left-0 top-full pt-3 w-64" : "group-hover/sub:block left-full top-0 pl-3 w-64 -mt-2"
        )}>
          <div className={cn(
            "bg-white rounded-xl shadow-2xl shadow-slate-900/10 border border-slate-100 p-2.5 flex flex-col gap-1 ring-1 ring-black/5",
            isRoot ? "animate-in fade-in slide-in-from-top-2 duration-200" : "animate-in fade-in slide-in-from-left-2 duration-200"
          )}>
            {item.children.map((child: any) => renderDesktopMenuItem(child, false))}
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
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b py-3',
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md border-[#0f172a]/10 shadow-sm' 
          : 'bg-transparent border-transparent'
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 group">
            {activeLogo ? (
              <img src={`${activeLogo}`} alt="Logo" className="h-10 w-auto object-contain transition-all duration-300" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#c20000] flex items-center justify-center text-white font-bold text-lg">I</div>
            )}
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navigation.map(item => renderDesktopMenuItem(item, true))}
        </div>

        <div className="hidden md:flex items-center gap-4">
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

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="fixed inset-0 z-50 bg-white overflow-y-auto"
          >
            <div className="flex items-center justify-between px-6 py-6 border-b border-[#0f172a]/5">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                {siteLogo ? (
                  <img src={`${siteLogo}`} alt="Logo" className="h-8 w-auto object-contain" />
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
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block w-full rounded-sm px-4 py-3 text-center text-base font-semibold text-white bg-[#c20000]">
                    Masuk
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
