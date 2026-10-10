'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import Link from 'next/link';
import { FileText, CalendarDays, Users, Building2, TrendingUp, Activity, BarChart2, Link as LinkIcon, Plus, Calendar, Clock, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { ChartArea, BarChartSimple } from '@/components/ui/ChartArea';
import { ActivityTrendChart, type TrendItem } from '@/components/ui/ActivityTrendChart';

interface DashboardStats {
  total_blogs: number;
  published_blogs: number;
  total_events: number;
  upcoming_events: number;
  total_users: number;
  total_lembaga: number;
}

interface ClickAnalytics {
  summary: {
    total_clicks: number;
    active_count?: number;
    total_count?: number;
    active_items?: number;
    total_items?: number;
    active_pages?: number;
  };
  chart: Array<{ date: string; clicks: number }>;
  top_shortlinks?: Array<{ slug: string; target_url: string; clicks: number }>;
  top_items?: Array<{ title: string; url: string; clicks: number; page?: { title: string } }>;
  top_pages?: Array<{ title: string; slug: string; total_clicks: number }>;
}

export default function DashboardOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [shortlinkAnalytics, setShortlinkAnalytics] = useState<ClickAnalytics | null>(null);
  const [linkAnalytics, setLinkAnalytics] = useState<ClickAnalytics | null>(null);
  const [activityTrend, setActivityTrend] = useState<TrendItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch stats', error);
        toast.error('Gagal memuat statistik dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
    api.get('/dashboard/trend', { params: { months: 6 } })
      .then((res) => {
        if (res.data.success) {
          setActivityTrend(res.data.data || []);
        }
      })
      .catch((e) => console.error('Failed to fetch activity trend', e));

    api.get('/blogs', { params: { per_page: 4, status: 'published' } })
      .then((res) => setRecentPosts(res.data.data?.data || res.data.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchAnalytics = async () => {
      try {
        const isSuper = user?.roles?.some((r: any) => r.name === 'super-admin');
        const canShortlink = isSuper || user?.all_permissions?.includes('manage-shortlinks');
        const canLinks = isSuper || user?.all_permissions?.includes('manage-links');

        const [shortlinkRes, linkRes] = await Promise.allSettled([
          canShortlink ? api.get('/shortlinks/analytics', { params: { days: 30 } }) : Promise.reject('no-perm'),
          canLinks ? api.get('/links/analytics', { params: { days: 30 } }) : Promise.reject('no-perm'),
        ]);
        if (shortlinkRes.status === 'fulfilled' && shortlinkRes.value?.data?.success) {
          setShortlinkAnalytics(shortlinkRes.value.data.data);
        }
        if (linkRes.status === 'fulfilled' && linkRes.value?.data?.success) {
          setLinkAnalytics(linkRes.value.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch analytics', error);
      } finally {
        setIsAnalyticsLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  // Helper untuk ucapan salam dinamis berdasarkan jam
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) return { text: 'Selamat Pagi', icon: '🌅' };
    if (hour >= 11 && hour < 15) return { text: 'Selamat Siang', icon: '☀️' };
    if (hour >= 15 && hour < 18) return { text: 'Selamat Sore', icon: '🌤️' };
    return { text: 'Selamat Malam', icon: '🌙' };
  };

  const greeting = getGreeting();
  
  // Format Tanggal Indonesia
  const currentDateFormatted = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const statCards = [
    { 
      title: 'Total Publikasi', 
      value: stats?.published_blogs || 0, 
      sublabel: `${stats?.total_blogs || 0} total artikel dibuat`,
      icon: <FileText className="w-5 h-5 text-blue-600" />,
      bg: 'bg-blue-50/80',
      border: 'border-blue-100',
      badge: 'Artikel & Berita',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200/60'
    },
    { 
      title: 'Agenda Mendatang', 
      value: stats?.upcoming_events || 0, 
      sublabel: `${stats?.total_events || 0} total kegiatan tercatat`,
      icon: <CalendarDays className="w-5 h-5 text-amber-600" />,
      bg: 'bg-amber-50/80',
      border: 'border-amber-100',
      badge: 'Terjadwal',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200/60'
    },
    { 
      title: 'Pengurus & Kader', 
      value: stats?.total_users || 0, 
      sublabel: 'Akun sistem terdaftar & aktif',
      icon: <Users className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50/80',
      border: 'border-emerald-100',
      badge: 'Basis Kader',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
    },
    { 
      title: 'Komisariat & LSO', 
      value: stats?.total_lembaga || 0, 
      sublabel: 'Entitas struktural & lembaga otonom',
      icon: <Building2 className="w-5 h-5 text-[#c20000]" />,
      bg: 'bg-red-50/80',
      border: 'border-red-100',
      badge: 'Struktural',
      badgeColor: 'bg-red-50 text-[#c20000] border-red-200/60'
    },
  ];

  return (
    <div>
      {/* Welcome Banner Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#8f0000] via-[#ab0000] to-[#c20000] text-white p-6 sm:p-7 md:p-8 mb-8 shadow-xl shadow-red-950/15 border border-red-700/50">
        {/* Latar Belakang Aksen Geometris / Watermark (seperti chevron/line di gambar referensi) */}
        <div className="absolute right-0 top-0 bottom-0 w-2/3 pointer-events-none opacity-15 overflow-hidden flex items-center justify-end pr-4">
          <svg
            className="w-[450px] h-52 transform translate-x-12 select-none"
            viewBox="0 0 300 120"
            fill="none"
            stroke="currentColor"
            strokeWidth="16"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20,100 90,30 160,85 240,15 290,60" />
          </svg>
        </div>

        {/* Konten Banner */}
        <div className="relative z-10">
          {/* Header Baris Atas: Tanggal & Indikator Waktu */}
          <div className="flex items-center justify-between gap-3 flex-wrap mb-3.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/15 backdrop-blur-md border border-white/15 text-[11px] sm:text-xs font-medium text-red-50">
              <Calendar className="w-3.5 h-3.5 text-red-200" />
              <span>{currentDateFormatted}</span>
            </div>
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] font-semibold text-red-100 border border-white/10">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Sistem Aktif & Terlindungi</span>
            </div>
          </div>

          {/* Sapaan Nama & Deskripsi */}
          <div className="max-w-2xl">
            <h1 
              className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-2 flex items-center gap-2 flex-wrap" 
              style={{ fontFamily: 'var(--font-poppins), sans-serif' }}
            >
              <span>{greeting.text}, {user?.name || 'Administrator'}!</span>
              <span className="text-2xl sm:text-3xl select-none" role="img" aria-label="greeting icon">{greeting.icon}</span>
            </h1>
            <p className="text-xs sm:text-sm text-red-100/90 font-medium leading-relaxed">
              Portal Admin PC IMM Kota Surakarta — Kelola seluruh publikasi berita, kaderisasi, agenda, dan tautan layanan dari satu pusat kendali.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid Modern */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
        {isLoading ? (
          // Skeleton Loader
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className="border-slate-200/80 rounded-2xl shadow-xs animate-pulse bg-white">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-4 w-24 bg-slate-200 rounded-md"></div>
                  <div className="w-10 h-10 rounded-xl bg-slate-200"></div>
                </div>
                <div className="h-8 w-16 bg-slate-200 rounded-md mb-2"></div>
                <div className="h-3 w-32 bg-slate-200 rounded-md"></div>
              </CardContent>
            </Card>
          ))
        ) : (
          statCards.map((stat, index) => (
            <div 
              key={index} 
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-200 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${stat.badgeColor}`}>
                    {stat.badge}
                  </span>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg} ${stat.border} border shrink-0 group-hover:scale-105 transition-transform`}>
                    {stat.icon}
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-1" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
                  {stat.value.toLocaleString('id-ID')}
                </div>
                <div className="text-xs font-bold text-slate-700 mb-1">
                  {stat.title}
                </div>
              </div>
              <div className="pt-3 mt-2 border-t border-slate-100 flex items-center text-[11px] text-slate-500 font-medium">
                <TrendingUp className="w-3.5 h-3.5 mr-1.5 text-emerald-600 shrink-0" />
                <span className="truncate">{stat.sublabel}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Tren Aktivitas Organisasi */}
      {activityTrend.length > 0 && (
        <div className="mb-8">
          <ActivityTrendChart data={activityTrend} />
        </div>
      )}

      {/* Main Content Area */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Click Analytics - Shortlinks */}
        <div className="lg:col-span-2">
          <Card className="border-[#0f172a]/10 shadow-sm h-full">
            <div className="p-6 border-b border-[#0f172a]/5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#0f172a]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
                <LinkIcon className="w-5 h-5 inline mr-2 text-[#c20000]" />
                Analitik Klik Shortlink (30 Hari)
              </h2>
            </div>
            <CardContent className="p-0">
              {isAnalyticsLoading ? (
                <div className="p-6 h-64 animate-pulse">
                  <div className="h-full bg-slate-100 rounded" />
                </div>
              ) : shortlinkAnalytics ? (
                <ChartArea
                  data={shortlinkAnalytics.chart}
                  title={`${shortlinkAnalytics.summary.total_clicks?.toLocaleString('id-ID') || 0} total klik dari ${shortlinkAnalytics.summary.total_count || 0} shortlink`}
                  color="#c20000"
                  height={300}
                />
              ) : (
                <div className="p-6 text-center text-sm text-[#0f172a]/70">Data tidak tersedia</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <Card className="border-[#0f172a]/10 shadow-sm">
            <div className="p-6 border-b border-[#0f172a]/5">
              <h2 className="text-lg font-bold text-[#0f172a]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>Aksi Cepat</h2>
            </div>
            <CardContent className="p-6 space-y-4">
              <Link href="/dashboard/blog/create" className="w-full flex items-center p-3 rounded-sm border border-[#0f172a]/10 hover:border-imm-red-500 hover:bg-[#c20000]/5 hover:text-[#c20000] transition-colors group">
                <div className="w-10 h-10 rounded-sm bg-white text-[#0f172a]/70 group-hover:bg-white group-hover:text-[#c20000] flex items-center justify-center mr-3 transition-colors">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-[#0f172a] group-hover:text-[#c20000]">Tulis Post</div>
                  <div className="text-xs text-[#0f172a]/70">Buat artikel jurnal baru</div>
                </div>
              </Link>

              <Link href="/dashboard/events/create" className="w-full flex items-center p-3 rounded-sm border border-[#0f172a]/10 hover:border-amber-500 hover:bg-amber-50 hover:text-amber-600 transition-colors group">
                <div className="w-10 h-10 rounded-sm bg-white text-[#0f172a]/70 group-hover:bg-white group-hover:text-amber-600 flex items-center justify-center mr-3 transition-colors">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-[#0f172a] group-hover:text-amber-600">Buat Agenda</div>
                  <div className="text-xs text-[#0f172a]/70">Jadwalkan kegiatan baru</div>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Click Analytics - Linktree */}
        <div className="lg:col-span-2">
          <Card className="border-[#0f172a]/10 shadow-sm h-full">
            <div className="p-6 border-b border-[#0f172a]/5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#0f172a]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
                <BarChart2 className="w-5 h-5 inline mr-2 text-[#c20000]" />
                Analitik Klik Linktree (30 Hari)
              </h2>
            </div>
            <CardContent className="p-0">
              {isAnalyticsLoading ? (
                <div className="p-6 h-64 animate-pulse">
                  <div className="h-full bg-slate-100 rounded" />
                </div>
              ) : linkAnalytics ? (
                <ChartArea
                  data={linkAnalytics.chart}
                  title={`${linkAnalytics.summary.total_clicks?.toLocaleString('id-ID') || 0} total klik dari ${linkAnalytics.summary.total_items || 0} tautan`}
                  color="#10b981"
                  height={300}
                />
              ) : (
                <div className="p-6 text-center text-sm text-[#0f172a]/70">Data tidak tersedia</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Shortlinks & Linktree Items */}
        <div className="lg:col-span-1 space-y-6">
          {shortlinkAnalytics?.top_shortlinks && shortlinkAnalytics.top_shortlinks.length > 0 && (
            <Card className="border-[#0f172a]/10 shadow-sm">
              <div className="p-4 border-b border-[#0f172a]/5">
                <h3 className="text-sm font-bold text-[#0f172a] flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-[#c20000]" />
                  Top Shortlink
                </h3>
              </div>
              <CardContent className="p-4 space-y-3">
                {shortlinkAnalytics.top_shortlinks.slice(0, 5).map((item, idx) => (
                  <div key={`shortlink-${item.slug}-${idx}`} className="flex items-center justify-between text-sm">
                    <span className="font-mono text-[#c20000] font-semibold">
                      {idx + 1}. immsolo.or.id/{item.slug}
                    </span>
                    <span className="text-slate-600 font-medium">{item.clicks} klik</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {linkAnalytics?.top_items && linkAnalytics.top_items.length > 0 && (
            <Card className="border-[#0f172a]/10 shadow-sm">
              <div className="p-4 border-b border-[#0f172a]/5">
                <h3 className="text-sm font-bold text-[#0f172a] flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-[#c20000]" />
                  Top Tautan Linktree
                </h3>
              </div>
              <CardContent className="p-4 space-y-3">
                {linkAnalytics.top_items.slice(0, 5).map((item, idx) => (
                  <div key={`link-item-${item.title}-${idx}`} className="flex items-center justify-between text-sm">
                    <span className="truncate max-w-[160px] font-medium text-[#0f172a]">
                      {idx + 1}. {item.title}
                    </span>
                    <span className="text-emerald-600 font-medium ml-2">{item.clicks} klik</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-3">
          <Card className="border-[#0f172a]/10 shadow-sm">
            <div className="p-6 border-b border-[#0f172a]/5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#0f172a]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>Aktivitas Terbaru</h2>
              <Activity className="w-5 h-5 text-slate-400" />
            </div>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {isLoading ? (
                  <div className="p-6 text-center text-sm text-[#0f172a]/70">Memuat data...</div>
                ) : (
                  <>
                  {recentPosts.length === 0 ? (
                    <div className="p-6 text-center text-sm text-[#0f172a]/70">Belum ada aktivitas post terbaru.</div>
                  ) : (
                    recentPosts.map((post) => (
                      <Link href={`/dashboard/blog/${post.id}`} key={post.id} className="block p-4 sm:p-6 hover:bg-slate-50 transition-colors">
                        <div className="flex items-start">
                          <div className="w-2 h-2 mt-2 rounded-full bg-[#c20000] mr-4"></div>
                          <div>
                            <p className="text-sm font-semibold text-[#0f172a]">{post.title}</p>
                            <p className="text-xs text-[#0f172a]/70 mb-1">{post.category?.name || 'Umum'}</p>
                            <p className="text-xs text-slate-400">{new Date(post.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
