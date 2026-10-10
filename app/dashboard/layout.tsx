'use client';

import { useState, useRef, useEffect } from 'react';
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
  User,
  FolderOpen,
  Link as LinkIcon,
  Layers,
  UserPlus,
  History,
  Inbox,
  ClipboardList,
  ShieldCheck,
  Megaphone
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

  // Ambil logo situs dari settings (seperti Navbar/Footer publik).
  // Tanpa ini logo asli tidak akan pernah tampil di sidebar.
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
            // The logout function should handle redirection, but just in case:
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

  const menuGroups = [
    {
      label: 'Menu Utama',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-5 h-5 shrink-0" /> },
        { name: 'Media Library', href: '/dashboard/media', icon: <FolderOpen className="w-5 h-5 shrink-0" />, permission: 'manage-media' },
      ],
    },
    {
      label: 'Konten',
      items: [
        { name: 'Kelola Post', href: '/dashboard/blog', icon: <FileText className="w-5 h-5 shrink-0" />, permission: 'manage-blog', badge: notifCounts.pending_blogs },
        { name: 'Agenda Kegiatan', href: '/dashboard/events', icon: <CalendarDays className="w-5 h-5 shrink-0" />, permission: 'manage-event' },
        { name: 'Dokumen', href: '/dashboard/documents', icon: <FileText className="w-5 h-5 shrink-0" />, permission: 'manage-document' },
        { name: 'Tautan Pendek', href: '/dashboard/shortlinks', icon: <LinkIcon className="w-5 h-5 shrink-0" />, permission: 'manage-shortlinks' },
        { name: 'Linktree', href: '/dashboard/links', icon: <Layers className="w-5 h-5 shrink-0" />, permission: 'manage-links' },
        { name: 'Formulir', href: '/dashboard/forms', icon: <ClipboardList className="w-5 h-5 shrink-0" />, permission: 'manage-forms' },
      ],
    },
    {
      label: 'Organisasi',
      items: [
        { name: 'Struktur Organisasi', href: '/dashboard/struktural', icon: <Users className="w-5 h-5 shrink-0" />, permission: 'manage-struktural' },
      ],
    },
    {
      label: 'Sistem',
      items: [
        { name: 'Pengumuman', href: '/dashboard/announcements', icon: <Megaphone className="w-5 h-5 shrink-0" />, permission: 'manage-announcements' },
        { name: 'Pengguna', href: '/dashboard/users', icon: <Users className="w-5 h-5 shrink-0" />, permission: 'manage-users' },
        { name: 'Pengajuan Akun', href: '/dashboard/account-requests', icon: <UserPlus className="w-5 h-5 shrink-0" />, permission: 'manage-account-requests', badge: notifCounts.pending_account_requests },
        { name: 'Log Aktivitas', href: '/dashboard/audit-logs', icon: <History className="w-5 h-5 shrink-0" />, permission: 'manage-audit-logs' },
        { name: 'Kotak Masuk', href: '/dashboard/messages', icon: <Inbox className="w-5 h-5 shrink-0" />, permission: 'manage-messages', badge: notifCounts.unread_messages },
        { name: 'Pengaturan', href: '/dashboard/settings', icon: <Settings className="w-5 h-5 shrink-0" />, permission: 'manage-settings' },
      ],
    },
  ];

  if (isLoading || !user) {
    return <div className="h-screen w-full bg-slate-50 flex items-center justify-center font-medium text-slate-500">Memuat sesi Anda...</div>;
  }

  const sidebarWidth = isDesktopCollapsed ? 'w-20' : 'w-64';

  return (
    <div className="h-screen bg-slate-50 flex font-sans overflow-hidden">
      
      {/* Sidebar Desktop & Mobile */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 bg-white text-slate-700 transition-all duration-300 transform 
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 lg:static lg:block flex flex-col h-screen border-r border-slate-200 shadow-xl lg:shadow-none
          ${sidebarWidth}
        `}
      >
        {/* Logo Area — hanya logo, menempel kiri */}
        <div className="h-16 flex items-center justify-start px-4 bg-white border-b border-slate-100 shrink-0">
          <Link href="/dashboard" className="flex items-center" aria-label="PC IMM Admin Panel - Dashboard">
            {siteLogo ? (
              <img
                src={siteLogo}
                alt="Logo PC IMM Kota Surakarta"
                width={132}
                height={32}
                className="h-8 w-auto max-w-[132px] object-contain object-left"
              />
            ) : (
              <span className="w-8 h-8 rounded-sm bg-gradient-to-br from-[#c20000] to-[#a30000] flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-[#c20000]/20">
                I
              </span>
            )}
          </Link>
          <button className="ml-auto lg:hidden p-2 -mr-2 text-slate-400 hover:text-slate-800" onClick={() => setIsMobileSidebarOpen(false)} aria-label="Tutup menu">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
          {menuGroups.map((group, groupIdx) => {
            const visibleItems = group.items.filter((item: any) => can(item.permission));
            if (visibleItems.length === 0) return null;
            return (
              <div key={group.label} className="mb-6 last:mb-0">
                {!isDesktopCollapsed && (
                  <div className="px-2 mb-2 text-[11px] font-extrabold text-slate-400 uppercase tracking-[0.15em]">{group.label}</div>
                )}
                <div className="space-y-1.5">
                  {visibleItems.map((item: any, itemIdx: number) => {
                    const isActive = item.href === '/dashboard'
                      ? pathname === '/dashboard'
                      : pathname === item.href || pathname?.startsWith(`${item.href}/`);
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        prefetch={false}
                        onClick={() => setIsMobileSidebarOpen(false)}
                        className={`animate-in fade-in slide-in-from-left duration-300 relative flex items-center rounded-sm text-sm font-semibold transition-all group ${
                          isActive
                          ? 'bg-red-50 text-[#c20000] shadow-sm border border-red-100 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-full before:bg-[#c20000]'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                        } ${isDesktopCollapsed ? 'w-11 h-11 justify-center mx-auto' : 'px-4 py-3'}`}
                        style={{ animationDelay: `${groupIdx * 70 + itemIdx * 45}ms` }}
                        title={isDesktopCollapsed ? item.name : undefined}
                      >
                        <span className={`${isActive ? 'text-[#c20000]' : 'text-slate-400 group-hover:text-slate-700'} transition-colors flex items-center justify-center`}>
                          {item.icon}
                        </span>

                        {!isDesktopCollapsed && (
                          <span className="ml-3.5 truncate flex-1">{item.name}</span>
                        )}

                        {/* Badge notifikasi */}
                        {!isDesktopCollapsed && (item as any).badge > 0 && (
                          <span className="ml-auto shrink-0 min-w-5 h-5 px-1.5 bg-[#c20000] text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                            {(item as any).badge > 99 ? '99+' : (item as any).badge}
                          </span>
                        )}

                        {isDesktopCollapsed && (item as any).badge > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#c20000] text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                            {(item as any).badge > 9 ? '9+' : (item as any).badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
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
