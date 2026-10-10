'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
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
  X,
  ChevronDown,
  ChevronRight,
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
  ExternalLink,
  PanelLeftClose,
  PanelLeftOpen,
  FolderArchive,
  GraduationCap,
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
  const [siteLogo, setSiteLogo] = useState<string | null>(null);

  // UX & HCI Optimization States
  const [menuSearch, setMenuSearch] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const savedCollapsedState = localStorage.getItem('imm_dashboard_sidebar_collapsed');
      if (savedCollapsedState !== null) {
        setIsDesktopCollapsed(savedCollapsedState === 'true');
      }
      const savedGroupsState = localStorage.getItem('imm_dashboard_collapsed_groups');
      if (savedGroupsState) {
        setCollapsedGroups(JSON.parse(savedGroupsState));
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
        localStorage.setItem('imm_dashboard_collapsed_groups', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Keyboard shortcut Ctrl+K / Cmd+K to focus quick search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isDesktopCollapsed) {
          setIsDesktopCollapsed(false);
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

  // Ambil logo situs dari settings
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const res = await fetch(`${getApiBase()}/settings`);
        if (!res.ok) return;
        const json = await res.json();
        const settings = normalizeSettings(json?.data);
        if (settings.site_logo) setSiteLogo(settings.site_logo);
      } catch (e) {
        console.error('Failed to fetch site logo', e);
      }
    };
    fetchLogo();
  }, []);
  
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

  // Maintenance mode check for non-Super Admin
  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const res = await fetch(`${getApiBase()}/settings`);
        if (res.ok) {
          const json = await res.json();
          const settings = normalizeSettings(json?.data);
          const isMaintenance = isSettingEnabled(settings, 'maintenance_mode');

          const isSuperAdmin = user?.roles?.some((r: any) => r.name === 'super-admin');
          if (isMaintenance && user && !isSuperAdmin) {
            await logout();
            router.push('/login');
          }
        }
      } catch (e) {
        console.error("Failed to check maintenance mode", e);
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

  // Definisi arsitektur informasi 5 kelompok modul ergonomis
  const menuGroups = useMemo(() => [
    {
      id: 'main',
      label: 'Utama',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-4 h-4 shrink-0" /> },
        { name: 'Media Library', href: '/dashboard/media', icon: <FolderOpen className="w-4 h-4 shrink-0" />, permission: 'manage-media' },
      ],
    },
    {
      id: 'content',
      label: 'Publikasi & Konten',
      items: [
        { name: 'Kelola Post', href: '/dashboard/blog', icon: <FileText className="w-4 h-4 shrink-0" />, permission: 'manage-blog', badge: notifCounts.pending_blogs },
        { name: 'Agenda Kegiatan', href: '/dashboard/events', icon: <CalendarDays className="w-4 h-4 shrink-0" />, permission: 'manage-event' },
        { name: 'Dokumen & Arsip', href: '/dashboard/documents', icon: <FolderArchive className="w-4 h-4 shrink-0" />, permission: 'manage-document' },
        { name: 'Pengumuman', href: '/dashboard/announcements', icon: <Megaphone className="w-4 h-4 shrink-0" />, permission: 'manage-announcements' },
      ],
    },
    {
      id: 'services',
      label: 'Layanan & Interaksi',
      items: [
        { name: 'Formulir Pendaftaran', href: '/dashboard/forms', icon: <ClipboardList className="w-4 h-4 shrink-0" />, permission: 'manage-forms' },
        { name: 'Biolink (Linktree)', href: '/dashboard/links', icon: <Layers className="w-4 h-4 shrink-0" />, permission: 'manage-links' },
        { name: 'Tautan Pendek', href: '/dashboard/shortlinks', icon: <LinkIcon className="w-4 h-4 shrink-0" />, permission: 'manage-shortlinks' },
        { name: 'Kotak Masuk', href: '/dashboard/messages', icon: <Inbox className="w-4 h-4 shrink-0" />, permission: 'manage-messages', badge: notifCounts.unread_messages },
      ],
    },
    {
      id: 'organization',
      label: 'Keorganisasian',
      items: [
        { name: 'Struktur Organisasi', href: '/dashboard/struktural', icon: <Building2 className="w-4 h-4 shrink-0" />, permission: 'manage-struktural' },
        { name: 'Komisariat & Lembaga', href: '/dashboard/lembaga', icon: <GraduationCap className="w-4 h-4 shrink-0" />, permission: 'manage-struktural' },
        { name: 'Pengguna Sistem', href: '/dashboard/users', icon: <Users className="w-4 h-4 shrink-0" />, permission: 'manage-users' },
        { name: 'Pengajuan Akun', href: '/dashboard/account-requests', icon: <UserPlus className="w-4 h-4 shrink-0" />, permission: 'manage-account-requests', badge: notifCounts.pending_account_requests },
      ],
    },
    {
      id: 'system',
      label: 'Sistem & Keamanan',
      items: [
        { name: 'Pengaturan Sistem', href: '/dashboard/settings', icon: <Settings className="w-4 h-4 shrink-0" />, permission: 'manage-settings' },
        { name: 'Log Aktivitas', href: '/dashboard/audit-logs', icon: <History className="w-4 h-4 shrink-0" />, permission: 'manage-audit-logs' },
      ],
    },
  ], [notifCounts]);

  if (isLoading || !user) {
    return <div className="h-screen w-full bg-slate-50 flex items-center justify-center font-medium text-slate-500">Memuat sesi Anda...</div>;
  }

  const sidebarWidth = isDesktopCollapsed ? 'w-[72px]' : 'w-64';

  return (
    <div className="h-screen bg-slate-50 flex font-sans overflow-hidden">
      
      {/* Sidebar Desktop & Mobile */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 bg-white text-slate-700 transition-all duration-300 ease-in-out transform 
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 lg:static lg:block flex flex-col h-screen border-r border-slate-200/90 shadow-xl lg:shadow-none
          ${sidebarWidth}
        `}
      >
        {/* Header Sidebar: Logo & Tombol Collapse Ergonomis */}
        <div className={`h-16 flex items-center bg-white border-b border-slate-100 shrink-0 ${isDesktopCollapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
          <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden" aria-label="PC IMM Admin Panel - Dashboard">
            {siteLogo ? (
              <img
                src={siteLogo}
                alt="Logo PC IMM Kota Surakarta"
                width={132}
                height={32}
                className="h-8 w-auto max-w-[130px] object-contain object-left"
              />
            ) : (
              <span className="w-8 h-8 rounded-sm bg-gradient-to-br from-[#c20000] to-[#990000] flex items-center justify-center text-white font-bold text-base shadow-sm shadow-[#c20000]/25 shrink-0">
                IMM
              </span>
            )}
          </Link>

          {/* Desktop Toggle Button in Sidebar Header (Linear / Notion UX style) */}
          <button 
            type="button"
            onClick={toggleDesktopCollapsed}
            title={isDesktopCollapsed ? "Perluas Sidebar" : "Persempit Sidebar"}
            className="hidden lg:flex p-1.5 rounded-sm text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
          >
            {isDesktopCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          <button 
            type="button"
            className="ml-auto lg:hidden p-1.5 text-slate-400 hover:text-slate-800 rounded-sm hover:bg-slate-100" 
            onClick={() => setIsMobileSidebarOpen(false)} 
            aria-label="Tutup menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Search Menu (Hukum Hick-Hyman: Percepat Navigasi Saat Banyak Modul) */}
        {!isDesktopCollapsed && (
          <div className="px-3 pt-3 pb-1 border-b border-slate-100/60 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Cari menu... (Ctrl+K)"
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                className="w-full bg-slate-50/80 hover:bg-slate-100/70 focus:bg-white text-xs border border-slate-200/80 rounded-sm pl-8 pr-7 py-1.5 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000]/30 transition-all"
              />
              {menuSearch && (
                <button
                  type="button"
                  onClick={() => setMenuSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Navigation Bar dengan Scroll Halus & Akordeon */}
        <nav className="flex-1 overflow-y-auto py-3 px-2.5 custom-scrollbar space-y-4">
          {menuGroups.map((group) => {
            const visibleItems = group.items.filter((item: any) => {
              if (!can(item.permission)) return false;
              if (!menuSearch.trim()) return true;
              return item.name.toLowerCase().includes(menuSearch.toLowerCase());
            });

            if (visibleItems.length === 0) return null;

            // Auto-expand group jika di dalamnya terdapat rute aktif
            const hasActiveRoute = visibleItems.some((item) => 
              item.href === '/dashboard' ? pathname === '/dashboard' : pathname === item.href || pathname?.startsWith(`${item.href}/`)
            );
            const isGroupCollapsed = !menuSearch && (collapsedGroups[group.id] && !hasActiveRoute);

            return (
              <div key={group.id} className="last:mb-0">
                {/* Header Grup Akordeon (Interactive Accordion) */}
                {!isDesktopCollapsed && (
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.id)}
                    className="w-full flex items-center justify-between px-2.5 py-1 text-[11px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider rounded-sm transition-colors group select-none"
                  >
                    <span>{group.label}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-mono text-slate-300 font-normal">({visibleItems.length})</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isGroupCollapsed ? '-rotate-90 text-slate-300' : 'rotate-0 text-slate-400'}`} />
                    </div>
                  </button>
                )}

                {/* Daftar Item Menu */}
                {(!isGroupCollapsed || isDesktopCollapsed) && (
                  <div className={`mt-1 space-y-1 ${isDesktopCollapsed ? 'border-t border-slate-100/70 pt-2 first:border-t-0' : ''}`}>
                    {visibleItems.map((item: any) => {
                      const isActive = item.href === '/dashboard'
                        ? pathname === '/dashboard'
                        : pathname === item.href || pathname?.startsWith(`${item.href}/`);

                      return (
                        <div key={item.name} className="relative group">
                          <Link
                            href={item.href}
                            prefetch={false}
                            onClick={() => setIsMobileSidebarOpen(false)}
                            className={`relative flex items-center rounded-sm text-xs font-semibold transition-all ${
                              isActive
                                ? 'bg-red-50 text-[#c20000] font-bold border border-red-100 shadow-sm before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:rounded-r before:bg-[#c20000]'
                                : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900 border border-transparent'
                            } ${isDesktopCollapsed ? 'w-10 h-10 justify-center mx-auto' : 'px-3 py-2.5'}`}
                          >
                            {/* Ikon Menu */}
                            <span className={`${isActive ? 'text-[#c20000]' : 'text-slate-400 group-hover:text-slate-700'} transition-colors flex items-center justify-center shrink-0`}>
                              {item.icon}
                            </span>

                            {/* Label Menu (Expanded) */}
                            {!isDesktopCollapsed && (
                              <span className="ml-3 truncate flex-1">{item.name}</span>
                            )}

                            {/* Badge Notifikasi (Expanded) */}
                            {!isDesktopCollapsed && (item as any).badge > 0 && (
                              <span className="ml-auto shrink-0 min-w-5 h-4.5 px-1.5 bg-[#c20000] text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none shadow-sm">
                                {(item as any).badge > 99 ? '99+' : (item as any).badge}
                              </span>
                            )}

                            {/* Dot Badge (Collapsed) */}
                            {isDesktopCollapsed && (item as any).badge > 0 && (
                              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#c20000] rounded-full ring-2 ring-white"></span>
                            )}
                          </Link>

                          {/* Floating Tooltip Popover untuk Mode Collapsed Desktop (Kaidah IMK: Visibility & Affordance) */}
                          {isDesktopCollapsed && (
                            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-sm shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 flex items-center gap-2">
                              <span>{item.name}</span>
                              {(item as any).badge > 0 && (
                                <span className="bg-[#c20000] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                                  {(item as any).badge}
                                </span>
                              )}
                              <span className="text-[10px] font-normal text-slate-400">({group.label})</span>
                              {/* Arrow Caret */}
                              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900"></div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer: Info Akun & Pintasan Cepat */}
        <div className="border-t border-slate-100 p-2.5 bg-slate-50/50 shrink-0">
          {!isDesktopCollapsed ? (
            <div className="flex items-center justify-between p-2 rounded-sm bg-white border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-red-100 text-[#c20000] flex items-center justify-center text-xs font-bold shrink-0">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate leading-tight">{user?.name || 'Admin'}</p>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 font-semibold border border-slate-200/60 inline-block mt-0.5">
                    {user?.roles?.[0]?.name || 'Super Admin'}
                  </span>
                </div>
              </div>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                title="Buka Website Publik"
                className="p-1.5 text-slate-400 hover:text-[#c20000] hover:bg-red-50 rounded transition-colors shrink-0"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ) : (
            <div className="flex justify-center group relative">
              <div className="w-9 h-9 rounded-full bg-red-100 text-[#c20000] flex items-center justify-center text-xs font-bold cursor-pointer">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-sm shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                <p>{user?.name || 'Administrator'}</p>
                <p className="text-[10px] text-slate-400">{user?.roles?.[0]?.name || 'Super Admin'}</p>
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900"></div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden w-full relative">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 md:px-8 z-30 sticky top-0 shadow-sm">
          {/* Collapse/Menu Toggle */}
          <button 
            className="text-slate-500 hover:text-slate-900 transition-colors p-2 -ml-2 rounded-sm hover:bg-slate-100" 
            onClick={() => {
              if (window.innerWidth < 1024) {
                setIsMobileSidebarOpen(true);
              } else {
                setIsDesktopCollapsed(!isDesktopCollapsed);
              }
            }}
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="ml-auto flex items-center gap-5">
            <Button variant="outline" size="sm" asChild className="hidden sm:flex border-slate-200 text-slate-600 hover:bg-slate-50 font-medium">
              <Link href="/" target="_blank">Lihat Website</Link>
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
                   
                   
                   
                   
                    className="absolute right-0 mt-2 w-56 bg-white rounded-sm shadow-xl border border-slate-100 py-1 z-50"
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
      </div>

      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 bg-[#0f172a]/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsMobileSidebarOpen(false)}></div>
      )}
    </div>
  );
}
