'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { FileText, CalendarDays, Users, Building2, TrendingUp, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

interface DashboardStats {
  blogs: number;
  events: number;
  users: number;
  lembaga: number;
}

export default function DashboardOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
  }, []);

  const statCards = [
    { 
      title: 'Total Post', 
      value: stats?.blogs || 0, 
      icon: <FileText className="w-6 h-6 text-blue-500" />,
      bg: 'bg-blue-50',
      trend: '+12% bulan ini'
    },
    { 
      title: 'Agenda Aktif', 
      value: stats?.events || 0, 
      icon: <CalendarDays className="w-6 h-6 text-amber-500" />,
      bg: 'bg-amber-50',
      trend: '3 akan datang'
    },
    { 
      title: 'Pengurus & Kader', 
      value: stats?.users || 0, 
      icon: <Users className="w-6 h-6 text-emerald-500" />,
      bg: 'bg-emerald-50',
      trend: '+5 admin baru'
    },
    { 
      title: 'Komisariat & LSO', 
      value: stats?.lembaga || 0, 
      icon: <Building2 className="w-6 h-6 text-[#c20000]" />,
      bg: 'bg-[#c20000]/5',
      trend: 'Aktif semua'
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

      {/* Main Content Area */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card className="border-[#0f172a]/10 shadow-sm h-full">
            <div className="p-6 border-b border-[#0f172a]/5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#0f172a]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>Aktivitas Terbaru</h2>
              <Activity className="w-5 h-5 text-white/70" />
            </div>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {isLoading ? (
                  <div className="p-6 text-center text-sm text-[#0f172a]/70">Memuat data...</div>
                ) : (
                  // Placeholder for recent activity
                  <>
                    <div className="p-4 sm:p-6 hover:bg-white transition-colors">
                      <div className="flex items-start">
                        <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 mr-4"></div>
                        <div>
                          <p className="text-sm font-semibold text-[#0f172a]">Admin menambahkan post baru</p>
                          <p className="text-xs text-[#0f172a]/70 mb-1">"Pelantikan Serentak PC IMM..."</p>
                          <p className="text-xs text-white/70">2 jam yang lalu</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 sm:p-6 hover:bg-white transition-colors">
                      <div className="flex items-start">
                        <div className="w-2 h-2 mt-2 rounded-full bg-amber-500 mr-4"></div>
                        <div>
                          <p className="text-sm font-semibold text-[#0f172a]">Agenda baru dijadwalkan</p>
                          <p className="text-xs text-[#0f172a]/70 mb-1">"Sekolah Instruktur Dasar (SID)"</p>
                          <p className="text-xs text-white/70">5 jam yang lalu</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 sm:p-6 hover:bg-white transition-colors">
                      <div className="flex items-start">
                        <div className="w-2 h-2 mt-2 rounded-full bg-emerald-500 mr-4"></div>
                        <div>
                          <p className="text-sm font-semibold text-[#0f172a]">Sistem diperbarui</p>
                          <p className="text-xs text-[#0f172a]/70 mb-1">Pembaruan konfigurasi SEO</p>
                          <p className="text-xs text-white/70">1 hari yang lalu</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
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
              <button className="w-full flex items-center p-3 rounded-sm border border-[#0f172a]/10 hover:border-imm-red-500 hover:bg-[#c20000]/5 hover:text-[#c20000] transition-colors group">
                <div className="w-10 h-10 rounded-sm bg-white text-[#0f172a]/70 group-hover:bg-white group-hover:text-[#c20000] flex items-center justify-center mr-3 transition-colors">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-[#0f172a] group-hover:text-[#c20000]">Tulis Post</div>
                  <div className="text-xs text-[#0f172a]/70">Buat artikel jurnal baru</div>
                </div>
              </button>

              <button className="w-full flex items-center p-3 rounded-sm border border-[#0f172a]/10 hover:border-amber-500 hover:bg-amber-50 hover:text-amber-600 transition-colors group">
                <div className="w-10 h-10 rounded-sm bg-white text-[#0f172a]/70 group-hover:bg-white group-hover:text-amber-600 flex items-center justify-center mr-3 transition-colors">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-[#0f172a] group-hover:text-amber-600">Buat Agenda</div>
                  <div className="text-xs text-[#0f172a]/70">Jadwalkan kegiatan baru</div>
                </div>
              </button>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
