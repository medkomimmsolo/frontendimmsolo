'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, Edit, Trash2, Link as LinkIcon, ExternalLink, Activity, Key } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ShortlinksPage() {
  const [shortlinks, setShortlinks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    slug: '',
    target_url: '',
    phone_number: '',
    is_active: true
  });

  const fetchShortlinks = async () => {
    try {
      const res = await api.get('/shortlinks');
      setShortlinks(res.data.data);
    } catch (error) {
      toast.error('Gagal mengambil data shortlink');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShortlinks();
  }, []);

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
    if (!window.confirm('Yakin ingin menghapus shortlink ini?')) return;
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>Manajemen Shortlink</h1>
          <p className="text-slate-500 text-sm mt-1">Buat dan kelola tautan pendek (URL Shortener)</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-[#c20000] hover:bg-[#a30000] text-white">
          <Plus className="w-4 h-4 mr-2" />
          Buat Shortlink
        </Button>
      </div>

      <Card className="border border-slate-200 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50 uppercase border-b border-slate-200">
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
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Memuat data...</td>
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
                          <span className="font-semibold text-slate-900">{item.slug}</span>
                          <button 
                            onClick={() => copyToClipboard(item.slug)}
                            className="text-slate-400 hover:text-[#c20000] transition-colors"
                            title="Salin link"
                          >
                            <LinkIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">/{item.slug}</div>
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
                          <span className="px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-md text-xs font-semibold">Aktif</span>
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            <span className="px-2.5 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-md text-xs font-semibold">Pending</span>
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
                              variant="outline" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200" 
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
                          <Button variant="outline" size="sm" onClick={() => handleOpenModal(item)} className="h-8 w-8 p-0">
                            <Edit className="w-4 h-4 text-slate-600" />
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200" onClick={() => handleDelete(item.id)}>
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
        </CardContent>
      </Card>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden relative z-10 border border-slate-200">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-6 text-slate-800" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
                {editingId ? 'Edit Shortlink' : 'Buat Shortlink Baru'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Slug / Nama Tautan Akhir <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({...formData, slug: e.target.value.replace(/[^a-zA-Z0-9-_]/g, '')})}
                      placeholder="RegisPIDNAS26"
                      required
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-md focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] transition-colors text-sm"
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
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    URL Tujuan (Target) <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="url"
                    value={formData.target_url}
                    onChange={(e) => setFormData({...formData, target_url: e.target.value})}
                    placeholder="https://docs.google.com/forms/..."
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] transition-colors text-sm"
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
    </div>
  );
}
