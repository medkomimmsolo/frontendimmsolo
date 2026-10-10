'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard, 
  FileText, 
  CalendarDays, 
  Users, 
  Building2, 
  Settings, 
  LogOut, 
  Menu, 
  PanelLeftClose,
  PanelLeftOpen,
  X,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  User,
  FolderOpen,
  Link as LinkIcon,
  Layers,
  UserPlus,
  History,
  Inbox,
  ClipboardList,
  ShieldCheck,
  Megaphone,
  Search,
  SearchX,
  ExternalLink,
  FolderArchive,
  GraduationCap,
  Compass,
  Newspaper,
  Share2,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getApiBase, isSettingEnabled, normalizeSettings } from '@/lib/settings';
import { useNotificationCount } from '@/hooks/useNotificationCount';
import AnnouncementBanner from '@/components/dashboard/AnnouncementBanner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // UX & HCI Optimization States
  const [menuSearch, setMenuSearch] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({
    main: true,
    content: true,
    services: true,
    organization: true,
    system: true,
  });
  const [siteLogo, setSiteLogo] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Floating Portal Tooltip State (untuk mode collapsed agar bebas dari overflow clipping)
  const [isMounted, setIsMounted] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<{
    text: string;
    badge?: number;
    category: string;
    top: number;
    left: number;
  } | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setActiveTooltip(null);
  }, [pathname, isDesktopCollapsed]);

  const handleItemMouseEnter = (e: React.MouseEvent<HTMLElement>, item: any, groupLabel: string) => {
    if (!isDesktopCollapsed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setActiveTooltip({
      text: item.name,
      badge: (item as any).badge,
      category: groupLabel,
      top: rect.top + rect.height / 2,
      left: rect.right + 12,
    });
  };

  const handleItemMouseLeave = () => {
    setActiveTooltip(null);
  };

  const handleGroupMouseEnter = (e: React.MouseEvent<HTMLElement>, group: any) => {
    if (!isDesktopCollapsed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setActiveTooltip({
      text: group.label,
      category: `${group.items.length} Modul (Klik untuk buka/tutup)`,
      top: rect.top + rect.height / 2,
      left: rect.right + 12,
    });
  };

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const savedCollapsedState = localStorage.getItem('imm_dashboard_sidebar_collapsed');
      if (savedCollapsedState !== null) {
        setIsDesktopCollapsed(savedCollapsedState === 'true');
      }
      const savedGroupsState = localStorage.getItem('imm_dashboard_collapsed_groups_v3');
      if (savedGroupsState) {
        setCollapsedGroups(JSON.parse(savedGroupsState));
      } else {
        setCollapsedGroups({
          main: true,
          content: true,
          services: true,
          organization: true,
          system: true,
        });
      }
    } catch {}
  }, []);

  // Save desktop collapsed state to localStorage
  const toggleDesktopCollapsed = () => {
    setIsDesktopCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('imm_dashboard_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Toggle group accordion
  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => {
      const next = { ...prev, [groupId]: !prev[groupId] };
      try {
        localStorage.setItem('imm_dashboard_collapsed_groups_v3', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  // Keyboard shortcut Ctrl+K / Cmd+K to focus quick search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isDesktopCollapsed) {
          setIsDesktopCollapsed(false);
          try {
            localStorage.setItem('imm_dashboard_sidebar_collapsed', 'false');
          } catch {}
        }
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 100);
      }
      if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        setMenuSearch('');
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDesktopCollapsed]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Protect route
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  // Maintenance mode check for non-Super Admin & load settings
  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const res = await fetch(`${getApiBase()}/settings`);
        if (res.ok) {
          const json = await res.json();
          const settings = normalizeSettings(json?.data);
          if (settings.site_logo) {
            setSiteLogo(settings.site_logo);
          }
          const isMaintenance = isSettingEnabled(settings, 'maintenance_mode');

          const isSuperAdmin = user?.roles?.some((r: any) => r.name === 'super-admin');
          if (isMaintenance && user && !isSuperAdmin) {
            await logout();
            router.push('/login');
          }
        }
      } catch (e) {
        console.error("Failed to check maintenance mode & settings", e);
      }
    };

    if (user && !isLoading) {
      checkMaintenance();
    }
  }, [user, isLoading, logout, router]);

  const isSuperAdmin = user?.roles?.some((r: any) => r.name === 'super-admin');
  const { counts: notifCounts } = useNotificationCount(!!user);
  const can = (permission?: string | string[]) => {
    if (isSuperAdmin) return true;
    if (!permission) return true;
    const perms = Array.isArray(permission) ? permission : [permission];
    const denied = user?.denied_permissions || [];
    if (perms.some((p) => denied.includes(p))) return false;
    return perms.some((p) => user?.all_permissions?.includes(p));
  };

  // Definisi arsitektur informasi 5 kelompok modul ergonomis & user friendly
  const menuGroups = useMemo(() => [
    {
      id: 'main',
      label: 'Menu Utama',
      icon: <Compass className="w-3.5 h-3.5 shrink-0" />,
      items: [
        { name: 'Dashboard Overview', href: '/dashboard', icon: <LayoutDashboard className="w-4 h-4 shrink-0" /> },
        { name: 'Galeri & Media', href: '/dashboard/media', icon: <FolderOpen className="w-4 h-4 shrink-0" />, permission: 'manage-media' },
      ],
    },
    {
      id: 'content',
      label: 'Publikasi & Informasi',
      icon: <Newspaper className="w-3.5 h-3.5 shrink-0" />,
      items: [
        { name: 'Berita & Artikel', href: '/dashboard/blog', icon: <FileText className="w-4 h-4 shrink-0" />, permission: 'manage-blog', badge: notifCounts.pending_blogs },
        { name: 'Agenda Kegiatan', href: '/dashboard/events', icon: <CalendarDays className="w-4 h-4 shrink-0" />, permission: 'manage-event' },
        { name: 'Dokumen & Arsip', href: '/dashboard/documents', icon: <FolderArchive className="w-4 h-4 shrink-0" />, permission: 'manage-document' },
        { name: 'Papan Pengumuman', href: '/dashboard/announcements', icon: <Megaphone className="w-4 h-4 shrink-0" />, permission: 'manage-announcements' },
      ],
    },
    {
      id: 'services',
      label: 'Layanan Digital',
      icon: <Share2 className="w-3.5 h-3.5 shrink-0" />,
      items: [
        { name: 'Formulir Online', href: '/dashboard/forms', icon: <ClipboardList className="w-4 h-4 shrink-0" />, permission: 'manage-forms' },
        { name: 'Biolink (Linktree)', href: '/dashboard/links', icon: <Layers className="w-4 h-4 shrink-0" />, permission: 'manage-links' },
        { name: 'Pemendek Tautan', href: '/dashboard/shortlinks', icon: <LinkIcon className="w-4 h-4 shrink-0" />, permission: 'manage-shortlinks' },
        { name: 'Kotak Masuk (Pesan)', href: '/dashboard/messages', icon: <Inbox className="w-4 h-4 shrink-0" />, permission: 'manage-messages', badge: notifCounts.unread_messages },
      ],
    },
    {
      id: 'organization',
      label: 'Keorganisasian',
      icon: <Building2 className="w-3.5 h-3.5 shrink-0" />,
      items: [
        { name: 'Struktur Pimpinan', href: '/dashboard/struktural', icon: <Building2 className="w-4 h-4 shrink-0" />, permission: 'manage-struktural' },
        { name: 'Komisariat & Lembaga', href: '/dashboard/lembaga', icon: <GraduationCap className="w-4 h-4 shrink-0" />, permission: 'manage-struktural' },
        { name: 'Pengajuan Akun', href: '/dashboard/account-requests', icon: <UserPlus className="w-4 h-4 shrink-0" />, permission: 'manage-account-requests', badge: notifCounts.pending_account_requests },
        { name: 'Pengguna Sistem', href: '/dashboard/users', icon: <Users className="w-4 h-4 shrink-0" />, permission: 'manage-users' },
      ],
    },
    {
      id: 'system',
      label: 'Sistem & Konfigurasi',
      icon: <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />,
      items: [
        { name: 'Log Aktivitas (Audit)', href: '/dashboard/audit-logs', icon: <History className="w-4 h-4 shrink-0" />, permission: 'manage-audit-logs' },
        { name: 'Pengaturan Portal', href: '/dashboard/settings', icon: <Settings className="w-4 h-4 shrink-0" />, permission: 'manage-settings' },
        { name: 'Profil Akun', href: '/dashboard/profile', icon: <User className="w-4 h-4 shrink-0" /> },
      ],
    },
  ], [notifCounts]);

  if (isLoading || !user) {
    return <div className="h-screen w-full bg-slate-50 flex items-center justify-center font-medium text-slate-500">Memuat sesi Anda...</div>;
  }

  const sidebarWidth = isDesktopCollapsed ? 'w-[74px]' : 'w-72';

  // Toggle all groups at once
  const toggleAllGroups = () => {
    const allCollapsed = menuGroups.every((g) => (collapsedGroups[g.id] ?? true));
    const newState: Record<string, boolean> = {};
    menuGroups.forEach((g) => {
      newState[g.id] = !allCollapsed;
    });
    setCollapsedGroups(newState);
    try {
      localStorage.setItem('imm_dashboard_collapsed_groups_v3', JSON.stringify(newState));
    } catch {}
  };

  return (
    <div className="h-screen bg-slate-50 flex font-sans overflow-hidden">
      
      {/* Backdrop Overlay untuk Mobile saat Sidebar Terbuka */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Desktop & Mobile (Light White Style Sesuai Gambar) */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 bg-white text-slate-700 transition-all duration-300 ease-in-out transform 
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 lg:static lg:block flex flex-col h-screen border-r border-slate-200/90 shadow-2xl lg:shadow-none
          ${sidebarWidth}
        `}
      >
        {/* Header Sidebar: Branding "Portal CMS" & Logo (White Style) */}
        <div className={`h-16 flex items-center bg-white border-b border-slate-100 shrink-0 ${isDesktopCollapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
          {isDesktopCollapsed ? (
            <Link 
              href="/dashboard" 
              title="Portal CMS - PC IMM Kota Surakarta"
              className="w-10 h-10 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center p-1.5 shrink-0 overflow-hidden hover:border-[#c20000]/40 transition-colors"
            >
              <img 
                src={siteLogo || '/icon-192.png'} 
                alt="Logo IMM" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/icon-192.png';
                }}
              />
            </Link>
          ) : (
            <Link 
              href="/dashboard" 
              className="flex items-center gap-3 min-w-0 select-none group" 
              aria-label="Portal CMS - PC IMM Kota Surakarta"
            >
              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center p-1.5 shrink-0 overflow-hidden group-hover:border-[#c20000]/40 transition-colors">
                <img 
                  src={siteLogo || '/icon-192.png'} 
                  alt="Logo IMM" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/icon-192.png';
                  }}
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span 
                  className="font-extrabold text-[#0f172a] text-base leading-tight tracking-tight group-hover:text-[#c20000] transition-colors" 
                  style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
                >
                  Portal CMS
                </span>
                <span className="text-[11px] font-medium text-slate-500 leading-tight truncate mt-0.5">
                  PC IMM Kota Surakarta
                </span>
              </div>
            </Link>
          )}

          {/* Mobile Close Button */}
          <button 
            type="button"
            className="ml-auto lg:hidden p-2 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors" 
            onClick={() => setIsMobileSidebarOpen(false)} 
            aria-label="Tutup menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Search Menu & Modul Control Bar */}
        {!isDesktopCollapsed ? (
          <div className="px-3 pt-3 pb-2 border-b border-slate-100/90 shrink-0 space-y-2 bg-white">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Cari modul... (Ctrl+K)"
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                className="w-full bg-slate-50/90 hover:bg-slate-100/80 focus:bg-white text-xs border border-slate-200/90 rounded-xl pl-8.5 pr-8 py-2 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#c20000] focus:ring-2 focus:ring-[#c20000]/15 transition-all shadow-2xs"
              />
              {menuSearch ? (
                <button
                  type="button"
                  onClick={() => setMenuSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  title="Hapus pencarian (Esc)"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-mono font-bold text-slate-400 bg-slate-200/60 border border-slate-200 px-1 py-0.5 rounded pointer-events-none">
                  Ctrl K
                </span>
              )}
            </div>

            {/* Quick Helper / Collapse All Button */}
            <div className="flex items-center justify-between px-1 text-[10px] text-slate-400 font-medium">
              {menuSearch.trim() ? (
                <span>Hasil pencarian modul</span>
              ) : (
                <span className="font-semibold text-slate-500">5 Kategori Modul</span>
              )}
              {menuSearch.trim() ? (
                <button
                  type="button"
                  onClick={() => setMenuSearch('')}
                  className="text-slate-500 hover:text-[#c20000] font-semibold hover:underline transition-colors"
                >
                  Reset Filter
                </button>
              ) : (
                <button
                  type="button"
                  onClick={toggleAllGroups}
                  className="text-slate-500 hover:text-[#c20000] font-semibold hover:underline transition-colors"
                >
                  {menuGroups.every((g) => (collapsedGroups[g.id] ?? true)) ? 'Buka Semua' : 'Tutup Semua'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="py-2.5 flex justify-center border-b border-slate-100 shrink-0">
            <button
              type="button"
              onClick={() => {
                toggleDesktopCollapsed();
                setTimeout(() => searchInputRef.current?.focus(), 150);
              }}
              className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 flex items-center justify-center transition-colors"
              title="Cari modul (Ctrl+K)"
            >
              <Search className="w-4.5 h-4.5" />
            </button>
          </div>
        )}

        {/* Navigation Bar dengan Scroll Halus & Akordeon */}
        <nav 
          onScroll={handleItemMouseLeave}
          className={`flex-1 overflow-y-auto py-3 custom-scrollbar ${isDesktopCollapsed ? 'px-1.5 space-y-1' : 'px-3 space-y-3'}`}
        >
          {(() => {
            let totalRenderedItems = 0;
            const groupsToRender = menuGroups.map((group) => {
              const visibleItems = group.items.filter((item: any) => {
                if (!can(item.permission)) return false;
                if (!menuSearch.trim()) return true;
                return item.name.toLowerCase().includes(menuSearch.toLowerCase());
              });

              totalRenderedItems += visibleItems.length;

              if (visibleItems.length === 0) return null;

              // Cek apakah ada rute aktif di grup ini
              const hasActiveRoute = visibleItems.some((item) => 
                item.href === '/dashboard' ? pathname === '/dashboard' : pathname === item.href || pathname?.startsWith(`${item.href}/`)
              );
              const isGroupCollapsed = !menuSearch && (collapsedGroups[group.id] ?? true);

              // Hitung akumulasi badge notifikasi dalam grup
              const groupBadgeTotal = visibleItems.reduce((acc: number, item: any) => acc + (Number((item as any).badge) || 0), 0);

              return (
                <div key={group.id} className="last:mb-0">
                  {/* Mode Expanded: Header Grup Teks Lengkap */}
                  {!isDesktopCollapsed ? (
                    <>
                      <button
                        type="button"
                        onClick={() => toggleGroup(group.id)}
                        className="w-full flex items-center justify-between px-2.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 uppercase tracking-wider rounded-xl hover:bg-slate-100/70 transition-colors group select-none"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="text-slate-400 group-hover:text-[#c20000] transition-colors">
                            {group.icon}
                          </span>
                          <span className="truncate group-hover:text-[#c20000] transition-colors">{group.label}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {isGroupCollapsed && groupBadgeTotal > 0 && (
                            <span className="min-w-4 h-4 px-1 bg-[#c20000] text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none shadow-xs">
                              {groupBadgeTotal}
                            </span>
                          )}
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-semibold border border-slate-200/60">
                            {visibleItems.length}
                          </span>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isGroupCollapsed ? '-rotate-90 text-slate-400' : 'rotate-0 text-slate-600'}`} />
                        </div>
                      </button>

                      {/* Daftar Item Menu (Mode Expanded saat grup terbuka) */}
                      {!isGroupCollapsed && (
                        <div className="mt-1 space-y-1">
                          {visibleItems.map((item: any) => {
                            const isActive = item.href === '/dashboard'
                              ? pathname === '/dashboard'
                              : pathname === item.href || pathname?.startsWith(`${item.href}/`);

                            return (
                              <div key={item.name} className="relative">
                                <Link
                                  href={item.href}
                                  prefetch={false}
                                  onClick={() => {
                                    setIsMobileSidebarOpen(false);
                                    setActiveTooltip(null);
                                  }}
                                  className={`relative flex items-center rounded-xl text-xs font-semibold transition-all ${
                                    isActive
                                      ? 'bg-gradient-to-r from-red-50 to-red-50/40 text-[#c20000] font-bold border border-red-200/80 shadow-2xs before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r-full before:bg-[#c20000]'
                                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 border border-transparent hover:translate-x-0.5'
                                  } px-3 py-2.5`}
                                >
                                  <span className={`${isActive ? 'text-[#c20000]' : 'text-slate-400 group-hover:text-slate-700'} transition-colors flex items-center justify-center shrink-0`}>
                                    {item.icon}
                                  </span>
                                  <span className="ml-3 truncate flex-1">{item.name}</span>
                                  {(item as any).badge > 0 && (
                                    <span className="ml-auto shrink-0 min-w-5 h-4.5 px-1.5 bg-[#c20000] text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none shadow-sm">
                                      {(item as any).badge > 99 ? '99+' : (item as any).badge}
                                    </span>
                                  )}
                                </Link>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    /* Mode Collapsed: Persis Gambar 1 (Tertutup) dan Gambar 2 (Terbuka dengan Jalur Pohon Vertikal) */
                    <div className="flex flex-col items-center">
                      {/* Tombol Utama Icon Grup */}
                      <button
                        type="button"
                        onClick={() => toggleGroup(group.id)}
                        onMouseEnter={(e) => handleGroupMouseEnter(e, group)}
                        onMouseLeave={handleItemMouseLeave}
                        className={`w-10 h-10 rounded-2xl relative flex items-center justify-center transition-all ${
                          hasActiveRoute
                            ? 'bg-red-50 text-[#c20000] border border-red-200/90 shadow-2xs'
                            : 'bg-white hover:bg-slate-100/80 text-slate-500 hover:text-slate-900 border border-transparent'
                        }`}
                        title={group.label}
                      >
                        <span className="w-5 h-5 flex items-center justify-center">
                          {group.icon}
                        </span>

                        {/* Bulatan Badge Count di Pojok Kanan Atas (Sesuai Gambar 1 & 2) */}
                        <span className={`absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full text-[9px] font-bold flex items-center justify-center leading-none border border-white shadow-2xs ${
                          groupBadgeTotal > 0
                            ? 'bg-[#c20000] text-white'
                            : 'bg-slate-200/90 text-slate-600'
                        }`}>
                          {groupBadgeTotal > 0 ? groupBadgeTotal : visibleItems.length}
                        </span>
                      </button>

                      {/* Anak-Anak Item Menu (Hanya Muncul Jika Grup Dibuka - Persis Gambar 2) */}
                      {!isGroupCollapsed && (
                        <div className="relative flex flex-col items-center py-2 space-y-2.5 before:absolute before:top-0 before:bottom-0 before:left-1/2 before:-translate-x-1/2 before:w-[1.5px] before:bg-slate-200/80 before:z-0">
                          {visibleItems.map((item: any) => {
                            const isActive = item.href === '/dashboard'
                              ? pathname === '/dashboard'
                              : pathname === item.href || pathname?.startsWith(`${item.href}/`);

                            return (
                              <Link
                                key={item.name}
                                href={item.href}
                                prefetch={false}
                                onClick={() => setActiveTooltip(null)}
                                onMouseEnter={(e) => handleItemMouseEnter(e, item, group.label)}
                                onMouseLeave={handleItemMouseLeave}
                                className={`relative z-10 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                  isActive
                                    ? 'bg-[#c20000] text-white shadow-xs scale-105'
                                    : 'bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/80 shadow-2xs hover:scale-105'
                                }`}
                              >
                                <span className="w-4 h-4 flex items-center justify-center">
                                  {item.icon}
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      )}

                      {/* Garis Horizontal Tipis Antar Grup */}
                      <div className="w-7 h-px bg-slate-100 my-1.5" />
                    </div>
                  )}
                </div>
              );
            });

            // Tampilkan Empty State jika pencarian tidak menemukan hasil
            if (totalRenderedItems === 0 && menuSearch.trim()) {
              return (
                <div className="py-10 px-4 text-center">
                  <div className="w-11 h-11 rounded-2xl bg-red-50 text-[#c20000] flex items-center justify-center mx-auto mb-3 shadow-2xs border border-red-100">
                    <SearchX className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-800">Modul Tidak Ditemukan</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Tidak ada modul cocok dengan &ldquo;{menuSearch}&rdquo;
                  </p>
                  <button
                    type="button"
                    onClick={() => setMenuSearch('')}
                    className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    Reset Pencarian
                  </button>
                </div>
              );
            }

            return groupsToRender;
          })()}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden w-full relative">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 md:px-8 z-30 sticky top-0 shadow-2xs">
          {/* Sidebar Panel Toggle Button (Polos tanpa background/border warna) */}
          <button 
            type="button"
            className="p-1.5 text-slate-700 hover:text-slate-900 transition-colors focus:outline-none" 
            onClick={() => {
              if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                setIsMobileSidebarOpen((prev) => !prev);
              } else {
                toggleDesktopCollapsed();
              }
            }}
            title={isDesktopCollapsed ? "Lebarkan Sidebar" : "Ciutkan Sidebar"}
            aria-label="Toggle navigasi sidebar"
          >
            {isDesktopCollapsed ? (
              <PanelLeftOpen className="w-5 h-5" />
            ) : (
              <PanelLeftClose className="w-5 h-5" />
            )}
          </button>
          
          <div className="ml-auto flex items-center gap-4">
            <Button variant="outline" size="sm" asChild className="hidden sm:flex border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold rounded-xl">
              <Link href="/" target="_blank" className="flex items-center gap-1.5">
                <span>Lihat Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </Button>

            {/* User Dropdown Profile */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-3 p-1 rounded-full hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 pr-3"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 border border-slate-200 shrink-0">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-bold text-slate-800 leading-none">{user?.name || 'Administrator'}</span>
                  <span className="text-xs text-slate-500 mt-1">{user?.roles?.[0]?.name || 'Super Admin'}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
              </button>

                {isProfileDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-1.5 z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-slate-100 md:hidden">
                       <p className="text-sm font-bold text-slate-800 truncate">{user?.name || 'Administrator'}</p>
                       <p className="text-xs text-slate-500 truncate mt-0.5">{user?.roles?.[0]?.name || 'Super Admin'}</p>
                    </div>
                    
                    <Link 
                      href="/dashboard/profile" 
                      className="flex items-center px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#c20000] transition-colors"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <User className="w-4 h-4 mr-3" />
                      Setting Profile
                    </Link>
                    
                    <div className="h-px bg-slate-100 my-1"></div>
                    
                    <button 
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        logout();
                      }}
                      className="flex w-full items-center px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Keluar Sistem
                    </button>
                  </div>
                )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-50/50">
          <div className="w-full">
            <AnnouncementBanner />
            {children}
          </div>
        </main>

        {/* Footer Panel Admin (Menempel di bawah dengan proporsi seimbang) */}
        <footer className="h-11 bg-white border-t border-slate-200/90 flex items-center justify-between px-4 md:px-8 text-xs text-slate-500 shrink-0 z-20 shadow-2xs">
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-normal text-slate-400">@2026</span>
            <span className="font-bold text-slate-700">PC IMM Kota Surakarta</span>
          </div>
          <span className="font-normal text-slate-400 truncate">Tim Developer IMM Solo</span>
        </footer>
      </div>

      {/* Floating Tooltip via React Portal (Paling Atas, Bebas Overflow Clipping) */}
      {isMounted && isDesktopCollapsed && activeTooltip && typeof document !== 'undefined' && createPortal(
        <div 
          style={{ 
            position: 'fixed', 
            top: `${activeTooltip.top}px`, 
            left: `${activeTooltip.left}px`,
            transform: 'translateY(-50%)',
          }}
          className="z-[99999] pointer-events-none px-3.5 py-2 bg-slate-950 text-white text-xs font-semibold rounded-xl shadow-2xl whitespace-nowrap flex items-center gap-2 border border-slate-800 transition-opacity animate-in fade-in zoom-in-95 duration-100 ring-1 ring-white/10"
        >
          {/* Arrow Caret */}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-950" />
          
          <span className="font-semibold text-slate-100 tracking-wide">{activeTooltip.text}</span>
          {activeTooltip.badge !== undefined && activeTooltip.badge > 0 && (
            <span className="bg-[#c20000] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none shadow-xs">
              {activeTooltip.badge > 99 ? '99+' : activeTooltip.badge}
            </span>
          )}
          <span className="text-[10px] font-medium text-slate-400">({activeTooltip.category})</span>
        </div>,
        document.body
      )}
    </div>
  );
}
