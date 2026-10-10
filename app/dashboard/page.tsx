'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import Link from 'next/link';
import { FileText, CalendarDays, Users, Building2, TrendingUp, Activity, BarChart2, Link as LinkIcon } from 'lucide-react';
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

  const statCards = [
    { 
      title: 'Total Post', 
      value: stats?.published_blogs || 0, 
      icon: <FileText className="w-6 h-6 text-blue-500" />,
      bg: 'bg-blue-50',
      trend: 'Artikel & berita terbit'
    },
    { 
      title: 'Agenda Aktif', 
      value: stats?.upcoming_events || 0, 
      icon: <CalendarDays className="w-6 h-6 text-amber-500" />,
      bg: 'bg-amber-50',
      trend: 'Agenda terjadwal'
    },
    { 
      title: 'Pengurus & Kader', 
      value: stats?.total_users || 0, 
      icon: <Users className="w-6 h-6 text-emerald-500" />,
      bg: 'bg-emerald-50',
      trend: 'Akun terdaftar'
    },
    { 
      title: 'Komisariat & LSO', 
      value: stats?.total_lembaga || 0, 
      icon: <Building2 className="w-6 h-6 text-[#c20000]" />,
      bg: 'bg-[#c20000]/5',
      trend: 'Komisariat & LSO'
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0f172a] mb-2" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
          Selamat Datang, {user?.name || 'Administrator'} 👋
        </h1>
        <p className="text-[#0f172a]/70">
          Ini adalah ringkasan aktivitas dan data website PC IMM Kota Surakarta.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {isLoading ? (
          // Skeleton Loader
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className="border-[#0f172a]/10 shadow-sm animate-pulse">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-4 w-24 bg-slate-200 rounded"></div>
                  <div className="w-12 h-12 rounded-sm bg-slate-200"></div>
                </div>
                <div className="h-8 w-16 bg-slate-200 rounded mb-2"></div>
                <div className="h-3 w-32 bg-slate-200 rounded"></div>
              </CardContent>
            </Card>
          ))
        ) : (
          statCards.map((stat, index) => (
            <Card key={index} className="border-[#0f172a]/10 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="text-sm font-semibold text-[#0f172a]/70">{stat.title}</div>
                  <div className={`w-12 h-12 rounded-sm flex items-center justify-center ${stat.bg}`}>
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl font-bold text-[#0f172a] mb-2">{stat.value}</div>
                <div className="flex items-center text-xs text-[#0f172a]/70 font-medium">
                  <TrendingUp className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                  {stat.trend}
                </div>
              </CardContent>
            </Card>
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
                  <div key={item.slug} className="flex items-center justify-between text-sm">
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
                  <div key={item.title} className="flex items-center justify-between text-sm">
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
