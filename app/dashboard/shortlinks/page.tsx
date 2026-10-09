'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, Edit, Trash2, Link as LinkIcon, ExternalLink, Activity, Key, Loader2, Search, QrCode, BarChart3, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useConfirm } from '@/components/providers/ConfirmProvider';
import { QRCodeSVG } from 'qrcode.react';

export default function ShortlinksPage() {
  const { confirm } = useConfirm();
  const [shortlinks, setShortlinks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [formData, setFormData] = useState({
    slug: '',
    target_url: '',
    phone_number: '',
    is_active: true
  });

  const [qrItem, setQrItem] = useState<any>(null);
  const [statsItem, setStatsItem] = useState<any>(null);
  const [statsData, setStatsData] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [summary, setSummary] = useState<any>(null);

  const fetchShortlinks = async (page = currentPage, search = searchQuery) => {
    try {
      const res = await api.get('/shortlinks', { params: { page, per_page: 15, search: search || undefined } });
      const payload = res.data.data;
      if (payload && payload.data) {
        setShortlinks(payload.data);
        setTotalPages(payload.last_page || 1);
        setTotalItems(payload.total || 0);
      } else {
        setShortlinks(Array.isArray(payload) ? payload : []);
      }
    } catch (error) {
      toast.error('Gagal mengambil data shortlink');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShortlinks();
    api.get('/shortlinks/analytics', { params: { days: 30 } })
      .then((res) => setSummary(res.data?.data))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleOpenModal = (item: any = null) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        slug: item.slug,
        target_url: item.target_url,
        phone_number: item.phone_number || '',
        is_active: item.is_active
      });
    } else {
      setEditingId(null);
      setFormData({
        slug: '',
        target_url: '',
        phone_number: '',
        is_active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/shortlinks/${editingId}`, formData);
        toast.success('Shortlink berhasil diupdate');
      } else {
        await api.post('/shortlinks', formData);
        toast.success('Shortlink berhasil dibuat');
      }
      setIsModalOpen(false);
      fetchShortlinks();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const handleDelete = async (id: number) => {
    if (!(await confirm({ message: 'Yakin ingin menghapus shortlink ini?', tone: 'danger' }))) return;
    try {
      await api.delete(`/shortlinks/${id}`);
      toast.success('Shortlink berhasil dihapus');
      fetchShortlinks();
    } catch (error) {
      toast.error('Gagal menghapus shortlink');
    }
  };

  const generateSlug = () => {
    const randomString = Math.random().toString(36).substring(2, 8);
    setFormData({ ...formData, slug: randomString });
  };

  const copyToClipboard = (slug: string) => {
    const url = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success('Link disalin ke clipboard');
  };

  const openStats = async (item: any) => {
    setStatsItem(item);
    setStatsData(null);
    setStatsLoading(true);
    try {
      const res = await api.get('/shortlinks/analytics', { params: { days: 30, shortlink_id: item.id } });
      setStatsData(res.data?.data);
    } catch {
      toast.error('Gagal memuat statistik');
    } finally {
      setStatsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-sm shadow-sm border border-[#0f172a]/5">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>Manajemen Shortlink</h1>
          <p className="text-[#0f172a]/70 text-sm mt-1">Buat dan kelola tautan pendek (URL Shortener)</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-[#c20000] hover:bg-[#a30000] text-white">
          <Plus className="w-4 h-4 mr-2" />
          Buat Shortlink
        </Button>
      </div>

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border border-[#0f172a]/10 shadow-sm">
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Klik</p>
              <p className="text-2xl font-bold text-[#0f172a] mt-1">{summary.summary?.total_clicks ?? 0}</p>
            </CardContent>
          </Card>
          <Card className="border border-[#0f172a]/10 shadow-sm">
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tautan Aktif</p>
              <p className="text-2xl font-bold text-emerald-700 mt-1">{summary.summary?.active_count ?? 0}</p>
            </CardContent>
          </Card>
          <Card className="border border-[#0f172a]/10 shadow-sm">
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Shortlink</p>
              <p className="text-2xl font-bold text-[#0f172a] mt-1">{summary.summary?.total_count ?? 0}</p>
            </CardContent>
          </Card>
        </div>
      )}
      {summary?.top_referers?.length > 0 && (
        <Card className="border border-[#0f172a]/10 shadow-sm">
          <CardContent className="p-5">
            <h3 className="text-sm font-bold text-[#0f172a] mb-3">Top Referer (30 hari)</h3>
            <ul className="space-y-1.5 text-sm">
              {summary.top_referers.slice(0, 5).map((r: any) => (
                <li key={r.referer} className="flex items-center justify-between gap-3">
                  <span className="truncate text-slate-600" title={r.referer}>{r.referer}</span>
                  <span className="font-semibold text-[#0f172a] shrink-0">{r.clicks} klik</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <form onSubmit={(e) => { e.preventDefault(); setCurrentPage(1); fetchShortlinks(1, searchQuery); }} className="bg-white border border-[#0f172a]/10 rounded-sm p-4 sm:p-6 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari slug atau target URL... (Enter)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-slate-200 rounded-sm pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000]"
          />
        </div>
      </form>

      <Card className="border border-[#0f172a]/10 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-sm text-[#0f172a]/70 bg-white uppercase border-b border-[#0f172a]/10">
                <tr>
                  <th className="px-6 py-4 font-semibold">Slug / Link</th>
                  <th className="px-6 py-4 font-semibold">Target URL</th>
                  <th className="px-6 py-4 font-semibold">Pemohon</th>
                  <th className="px-6 py-4 font-semibold text-center">Klik</th>
                  <th className="px-6 py-4 font-semibold text-center">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[#c20000]" /><p className="text-sm mt-2">Memuat data...</p></td>
                  </tr>
                ) : shortlinks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Belum ada shortlink</td>
                  </tr>
                ) : (
                  shortlinks.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">immsolo.or.id/{item.slug}</span>
                          <button 
                            onClick={() => copyToClipboard(item.slug)}
                            className="text-slate-400 hover:text-[#c20000] transition-colors"
                            title="Salin link"
                          >
                            <LinkIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-xs text-slate-500 mt-1 font-mono">/{item.slug}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs truncate text-slate-600" title={item.target_url}>
                          {item.target_url}
                        </div>
                        <a 
                          href={item.target_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-[#c20000] hover:underline flex items-center mt-1"
                        >
                          Buka <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-700">
                          {item.phone_number || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-medium min-w-[3rem]">
                          <Activity className="w-3.5 h-3.5 text-slate-400" />
                          {item.clicks}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.is_active ? (
                          <span className="px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-semibold">Aktif</span>
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            <span className="px-2.5 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full text-xs font-semibold">Pending</span>
                            {item.activation_token && (
                              <span className="text-[10px] font-mono text-slate-500 font-bold bg-slate-100 px-1 rounded cursor-pointer" onClick={() => {
                                navigator.clipboard.writeText(item.activation_token);
                                toast.success('Token disalin');
                              }} title="Klik untuk menyalin token">
                                {item.activation_token}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!item.is_active && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0 text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-sm" 
                              onClick={async () => {
                                try {
                                  const res = await api.post(`/shortlinks/${item.id}/token`);
                                  toast.success('Token berhasil digenerate');
                                  navigator.clipboard.writeText(res.data.data.token);
                                  toast.success('Token disalin ke clipboard!');
                                  fetchShortlinks();
                                } catch (e) {
                                  toast.error('Gagal generate token');
                                }
                              }}
                              title="Generate Token Aktivasi"
                            >
                              <Key className="w-4 h-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => setQrItem(item)} title="QR Code" className="h-9 w-9 p-0 text-slate-600 hover:text-[#c20000] bg-slate-50 hover:bg-red-50 rounded-sm">
                            <QrCode className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openStats(item)} title="Statistik klik & referer" className="h-9 w-9 p-0 text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-sm">
                            <BarChart3 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleOpenModal(item)} title="Edit" className="h-9 w-9 p-0 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-sm" title="Hapus" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
            <p className="text-xs text-slate-500 font-medium">
              Menampilkan {(currentPage - 1) * 15 + 1}–{Math.min(currentPage * 15, totalItems)} dari {totalItems} shortlink
            </p>
            <div className="flex items-center gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="px-3 py-1.5 text-sm rounded-sm border border-slate-200 disabled:opacity-40 hover:bg-slate-50">Prev</button>
              <span className="text-sm text-slate-600 font-semibold">{currentPage} / {totalPages}</span>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-1.5 text-sm rounded-sm border border-slate-200 disabled:opacity-40 hover:bg-slate-50">Next</button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#0f172a]/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-sm w-full max-w-md shadow-2xl overflow-hidden relative z-10 border border-slate-200">
            <div className="p-6">
              <h2 className="text-lg font-bold mb-5 text-slate-800" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
                {editingId ? 'Edit Shortlink' : 'Buat Shortlink Baru'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Slug / Nama Tautan Akhir <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({...formData, slug: e.target.value.replace(/[^a-zA-Z0-9-_]/g, '')})}
                      placeholder="RegisPIDNAS26"
                      required
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-sm focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] transition-colors text-sm"
                    />
                    <Button type="button" variant="outline" onClick={generateSlug} title="Generate Random" className="shrink-0 text-sm h-[38px]">
                      Acak
                    </Button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                    Tanpa spasi, hanya huruf, angka, strip (-), dan underscore (_).<br/>
                    Akan menjadi: <span className="text-[#c20000] font-medium">immsolo.or.id/{formData.slug || '...'}</span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    URL Tujuan (Target) <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="url"
                    value={formData.target_url}
                    onChange={(e) => setFormData({...formData, target_url: e.target.value})}
                    placeholder="https://docs.google.com/forms/..."
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-sm focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] transition-colors text-sm"
                  />
                </div>


                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox" 
                    id="is_active" 
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="w-4 h-4 rounded border-slate-300 text-[#c20000] focus:ring-[#c20000]"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-slate-700 cursor-pointer select-none">
                    Aktifkan Tautan
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-6">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="px-6">
                    Batal
                  </Button>
                  <Button type="submit" className="bg-[#c20000] hover:bg-[#a30000] text-white px-6 shadow-sm shadow-[#c20000]/20">
                    Simpan
                  </Button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal QR Code */}
      {qrItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#0f172a]/50 backdrop-blur-sm" onClick={() => setQrItem(null)}></div>
          <div className="bg-white rounded-sm w-full max-w-xs shadow-2xl relative z-10 border border-slate-200 p-6 text-center">
            <button onClick={() => setQrItem(null)} className="absolute top-3 right-3 text-slate-400 hover:text-slate-700" aria-label="Tutup">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold text-slate-800 mb-1">QR Code</h2>
            <p className="text-xs text-slate-500 mb-4 font-mono">immsolo.or.id/{qrItem.slug}</p>
            <div className="flex justify-center bg-white p-3 border border-slate-100 rounded-sm">
              <QRCodeSVG value={`${typeof window !== 'undefined' ? window.location.origin : 'https://immsolo.or.id'}/${qrItem.slug}`} size={200} level="M" />
            </div>
            <Button
              className="mt-4 w-full bg-[#c20000] hover:bg-[#a30000] text-white"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/${qrItem.slug}`);
                toast.success('Link disalin ke clipboard');
              }}
            >
              Salin Link
            </Button>
          </div>
        </div>
      )}

      {/* Modal Statistik per shortlink */}
      {statsItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#0f172a]/50 backdrop-blur-sm" onClick={() => { setStatsItem(null); setStatsData(null); }}></div>
          <div className="bg-white rounded-sm w-full max-w-md shadow-2xl relative z-10 border border-slate-200 p-6">
            <button onClick={() => { setStatsItem(null); setStatsData(null); }} className="absolute top-3 right-3 text-slate-400 hover:text-slate-700" aria-label="Tutup">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold text-slate-800">Statistik Klik</h2>
            <p className="text-xs text-slate-500 mb-4 font-mono">immsolo.or.id/{statsItem.slug} • total {statsItem.clicks} klik</p>
            {statsLoading ? (
              <p className="text-sm text-slate-500 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Memuat...</p>
            ) : statsData ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">7 hari terakhir</h3>
                  <ul className="space-y-1 text-sm max-h-40 overflow-y-auto">
                    {statsData.chart?.slice(-7).map((d: any) => (
                      <li key={d.date} className="flex justify-between gap-3">
                        <span className="text-slate-600">{d.date}</span>
                        <span className="font-semibold">{d.clicks}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Top Referer</h3>
                  {statsData.top_referers?.length ? (
                    <ul className="space-y-1 text-sm max-h-40 overflow-y-auto">
                      {statsData.top_referers.map((r: any) => (
                        <li key={r.referer} className="flex justify-between gap-3">
                          <span className="truncate text-slate-600" title={r.referer}>{r.referer}</span>
                          <span className="font-semibold shrink-0">{r.clicks}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500">Belum ada data referer.</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Gagal memuat data.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
