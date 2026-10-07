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
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'motion/react';

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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`);
        if (res.ok) {
          const json = await res.json();
          const settings = json.data || [];
          
          let isMaintenance = false;
          if (Array.isArray(settings)) {
            const maintenanceSetting = settings.find((s: any) => s.key === 'maintenance_mode');
            if (maintenanceSetting && maintenanceSetting.value === 'true') {
              isMaintenance = true;
            }
          } else if (typeof settings === 'object') {
            if (settings.maintenance_mode === 'true') {
              isMaintenance = true;
            }
          }
          
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
  const can = (permission?: string | string[]) => {
    if (isSuperAdmin) return true;
    if (!permission) return true;
    const perms = Array.isArray(permission) ? permission : [permission];
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
        { name: 'Kelola Post', href: '/dashboard/blog', icon: <FileText className="w-5 h-5 shrink-0" />, permission: 'manage-blog' },
        { name: 'Agenda Kegiatan', href: '/dashboard/events', icon: <CalendarDays className="w-5 h-5 shrink-0" />, permission: 'manage-event' },
        { name: 'Dokumen', href: '/dashboard/documents', icon: <FileText className="w-5 h-5 shrink-0" />, permission: 'manage-document' },
        { name: 'Tautan Pendek', href: '/dashboard/shortlinks', icon: <LinkIcon className="w-5 h-5 shrink-0" />, permission: 'manage-shortlinks' },
        { name: 'Linktree', href: '/dashboard/links', icon: <Layers className="w-5 h-5 shrink-0" />, permission: 'manage-links' },
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
        { name: 'Pengguna', href: '/dashboard/users', icon: <Users className="w-5 h-5 shrink-0" />, permission: 'manage-users' },
        { name: 'Pengajuan Akun', href: '/dashboard/account-requests', icon: <UserPlus className="w-5 h-5 shrink-0" />, permission: 'manage-users' },
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
        {/* Logo Area */}
        <div className={`h-16 flex items-center bg-white border-b border-slate-100 transition-all ${isDesktopCollapsed ? 'justify-center px-0' : 'px-6'}`}>
          <div className="w-8 h-8 rounded-sm bg-gradient-to-br from-[#c20000] to-[#a30000] flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-[#c20000]/20 shrink-0">
            I
          </div>
          {!isDesktopCollapsed && (
            <span className="font-bold text-[#0f172a] tracking-wide ml-3 whitespace-nowrap overflow-hidden" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
              PC IMM
            </span>
          )}
          <button className="ml-auto lg:hidden text-slate-400 hover:text-slate-800" onClick={() => setIsMobileSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
          {menuGroups.map((group) => {
            const visibleItems = group.items.filter((item: any) => can(item.permission));
            if (visibleItems.length === 0) return null;
            return (
              <div key={group.label} className="mb-6 last:mb-0">
                {!isDesktopCollapsed && (
                  <div className="px-2 mb-2 text-[11px] font-extrabold text-slate-400 uppercase tracking-[0.15em]">{group.label}</div>
                )}
                <div className="space-y-1.5">
                  {visibleItems.map((item: any) => {
                    const isActive = item.href === '/dashboard'
                      ? pathname === '/dashboard'
                      : pathname === item.href || pathname?.startsWith(`${item.href}/`);
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center rounded-xl text-sm font-semibold transition-all group ${
                          isActive
                          ? 'bg-red-50 text-[#c20000] shadow-sm border border-red-100'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        } ${isDesktopCollapsed ? 'w-11 h-11 justify-center mx-auto' : 'px-4 py-3.5'}`}
                        title={isDesktopCollapsed ? item.name : undefined}
                      >
                        <span className={`${isActive ? 'text-[#c20000]' : 'text-slate-400 group-hover:text-slate-700'} transition-colors flex items-center justify-center`}>
                          {item.icon}
                        </span>

                        {!isDesktopCollapsed && (
                          <span className="ml-3.5 truncate">{item.name}</span>
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

              <AnimatePresence>
                {isProfileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-50/50">
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsMobileSidebarOpen(false)}></div>
      )}
    </div>
  );
}
