'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { 
  ArrowLeft, Plus, Edit, Trash2, Loader2, ArrowUp, ArrowDown, ExternalLink, 
  Palette, Smartphone, Save, BadgeCheck, ArrowUpRight, Copy, Check, UserCheck
} from 'lucide-react';
import LinkItemIcon from '@/components/post/LinkItemIcon';
import { LINK_ICON_OPTIONS } from '@/lib/linkIcons';
import toast from 'react-hot-toast';
import { useConfirm } from '@/components/providers/ConfirmProvider';
import { useAuth } from '@/hooks/useAuth';
import TransferOwnershipModal from '@/components/ui/TransferOwnershipModal';

const THEME_PRESETS = [
  { name: 'Midnight', bg: '#0b1120', accent: '#c20000', text: '#ffffff', btnBg: '', btnText: '#ffffff' },
  { name: 'Crimson', bg: '#1a0505', accent: '#e11d48', text: '#ffffff', btnBg: '#e11d48', btnText: '#ffffff' },
  { name: 'Ocean', bg: '#082f49', accent: '#0ea5e9', text: '#ffffff', btnBg: '#0284c7', btnText: '#ffffff' },
  { name: 'Forest', bg: '#052e1b', accent: '#10b981', text: '#ffffff', btnBg: '#059669', btnText: '#ffffff' },
  { name: 'Royal', bg: '#1e1b4b', accent: '#8b5cf6', text: '#ffffff', btnBg: '#7c3aed', btnText: '#ffffff' },
  { name: 'Sand Light', bg: '#fef3c7', accent: '#b45309', text: '#78350f', btnBg: '#ffffff', btnText: '#92400e' },
  { name: 'Clean White', bg: '#ffffff', accent: '#c20000', text: '#0f172a', btnBg: '#0f172a', btnText: '#ffffff' },
];

export default function LinkItemsPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useAuth();
  const isSuperAdmin = user?.roles?.some((r: any) => r.name === 'super-admin');
  const { confirm } = useConfirm();
  const [pageId, setPageId] = useState<string>('');
  const [page, setPage] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  // Tab mode di sisi kiri: 'links' (daftar link) | 'design' (kustomisasi warna & profil)
  const [activeTab, setActiveTab] = useState<'links' | 'design'>('links');

  // Link Item Modal
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [itemFormData, setItemFormData] = useState({ title: '', url: '', icon: '', is_active: true });
  const [isItemSaving, setIsItemSaving] = useState(false);

  // Page Design / Appearance Form
  const [pageFormData, setPageFormData] = useState({
    title: '',
    slug: '',
    description: '',
    bg_color: '',
    accent_color: '',
    text_color: '',
    btn_bg_color: '',
    btn_text_color: '',
    is_active: true,
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isPageSaving, setIsPageSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    params.then((p) => setPageId(p.id));
  }, [params]);

  const fetchPage = useCallback(async () => {
    if (!pageId) return;
    setIsLoading(true);
    try {
      const res = await api.get(`/link-pages/${pageId}`);
      const data = res.data.data;
      setPage(data);
      setItems(data.items || []);
      setPageFormData({
        title: data.title || '',
        slug: data.slug || '',
        description: data.description || '',
        bg_color: data.bg_color || '',
        accent_color: data.accent_color || '',
        text_color: data.text_color || '',
        btn_bg_color: data.btn_bg_color || '',
        btn_text_color: data.btn_text_color || '',
        is_active: data.is_active ?? true,
      });
      if (data.avatar) {
        setAvatarPreview(data.avatar);
      }
    } catch {
      toast.error('Gagal memuat data');
    } finally {
      setIsLoading(false);
    }
  }, [pageId]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  // Handler simpan tampilan / setting halaman
  const handleSavePageSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsPageSaving(true);
    try {
      const data = new FormData();
      data.append('title', pageFormData.title);
      if (pageFormData.slug) data.append('slug', pageFormData.slug);
      if (pageFormData.description) data.append('description', pageFormData.description);
      data.append('is_active', pageFormData.is_active ? '1' : '0');
      if (pageFormData.bg_color) data.append('bg_color', pageFormData.bg_color);
      if (pageFormData.accent_color) data.append('accent_color', pageFormData.accent_color);
      if (pageFormData.text_color) data.append('text_color', pageFormData.text_color);
      if (pageFormData.btn_bg_color) data.append('btn_bg_color', pageFormData.btn_bg_color);
      if (pageFormData.btn_text_color) data.append('btn_text_color', pageFormData.btn_text_color);
      if (avatarFile) data.append('avatar', avatarFile);

      data.append('_method', 'PUT');
      const res = await api.post(`/link-pages/${pageId}`, data);
      toast.success('Pengaturan tampilan disimpan');
      setPage(res.data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan tampilan');
    } finally {
      setIsPageSaving(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    }
  };

  // Item Modal Handlers
  const openItemModal = (item: any = null) => {
    setEditingItem(item);
    setItemFormData(item ? { title: item.title, url: item.url, icon: item.icon || '', is_active: item.is_active } : { title: '', url: '', icon: '', is_active: true });
    setIsItemModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsItemSaving(true);
    try {
      const payload: any = { ...itemFormData };
      if (editingItem) {
        await api.put(`/link-items/${editingItem.id}`, payload);
        toast.success('Tautan diperbarui');
      } else {
        await api.post(`/link-pages/${pageId}/items`, payload);
        toast.success('Tautan ditambahkan');
      }
      setIsItemModalOpen(false);
      fetchPage();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan');
    } finally {
      setIsItemSaving(false);
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!(await confirm({ message: 'Hapus tautan ini?', tone: 'danger' }))) return;
    try {
      await api.delete(`/link-items/${id}`);
      toast.success('Tautan dihapus');
      fetchPage();
    } catch {
      toast.error('Gagal menghapus');
    }
  };

  const moveItem = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const reordered = [...items];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setItems(reordered);
    try {
      await api.put(`/link-pages/${pageId}/reorder`, {
        items: reordered.map((it, i) => ({ id: it.id, order: i + 1 })),
      });
    } catch {
      toast.error('Gagal menyimpan urutan');
      fetchPage();
    }
  };

  const toggleActive = async (item: any) => {
    try {
      await api.put(`/link-items/${item.id}`, { is_active: !item.is_active });
      fetchPage();
    } catch {
      toast.error('Gagal mengubah status');
    }
  };

  // Helper kalkulasi kontras warna preview
  const isLightColor = (hexColor?: string | null): boolean => {
    if (!hexColor) return false;
    const clean = hexColor.replace('#', '');
    if (!/^[0-9a-fA-F]{6}$/.test(clean)) return false;
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) > 150;
  };

  // Live preview values
  const previewBg = pageFormData.bg_color || '#0b1120';
  const previewAccent = pageFormData.accent_color || '#c20000';
  const previewBgIsLight = isLightColor(previewBg);
  const previewTextColor = pageFormData.text_color || (previewBgIsLight ? '#0f172a' : '#ffffff');
  const previewSubColor = pageFormData.text_color ? `${pageFormData.text_color}cc` : (previewBgIsLight ? 'rgba(15,23,42,0.7)' : 'rgba(255,255,255,0.75)');
  
  const previewBtnBg = pageFormData.btn_bg_color || null;
  const previewBtnIsLight = previewBtnBg ? isLightColor(previewBtnBg) : false;
  const previewBtnText = pageFormData.btn_text_color || (previewBtnBg ? (previewBtnIsLight ? '#0f172a' : '#ffffff') : (previewBgIsLight ? '#0f172a' : '#ffffff'));

  const publicUrl = page ? `https://immsolo.or.id/links/${page.slug}` : '';

  const copyUrl = () => {
    if (publicUrl) {
      navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast.success('Link disalin ke clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── TOP HEADER ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-sm shadow-sm border border-slate-200">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/links">
            <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-sm border-slate-200 hover:text-[#c20000]">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[#0f172a]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
              {page?.title || 'Memuat...'}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-0.5">
              <a 
                href={page ? `/links/${page.slug}` : '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-mono text-blue-600 hover:text-[#c20000]"
              >
                {page ? `/links/${page.slug}` : ''} <ExternalLink className="w-3 h-3" />
              </a>
              <button 
                onClick={copyUrl} 
                className="text-slate-400 hover:text-slate-700 p-0.5 rounded"
                title="Salin Link"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              {page?.user?.name && (
                <span className="text-[11px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded font-medium inline-flex items-center gap-1">
                  <UserCheck className="w-3 h-3" /> Pemilik: <strong>{page.user.name}</strong>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tab Switcher & Action */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {isSuperAdmin && (
            <Button
              onClick={() => setIsTransferModalOpen(true)}
              variant="outline"
              size="sm"
              className="h-9 px-3 text-xs border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100 font-semibold rounded-sm shadow-sm"
              title="Alihkan kepemilikan Linktree ini ke pengguna lain"
            >
              <UserCheck className="w-3.5 h-3.5 mr-1.5" /> Transfer ke User Lain
            </Button>
          )}

          <div className="flex p-1 bg-slate-100 rounded-sm border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('links')}
              className={`px-3 py-1.5 rounded-sm transition-all flex items-center gap-1.5 ${
                activeTab === 'links' ? 'bg-white text-[#c20000] shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Plus className="w-3.5 h-3.5" /> Kelola Tautan ({items.length})
            </button>
            <button
              onClick={() => setActiveTab('design')}
              className={`px-3 py-1.5 rounded-sm transition-all flex items-center gap-1.5 ${
                activeTab === 'design' ? 'bg-white text-[#c20000] shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Palette className="w-3.5 h-3.5" /> Tampilan & Warna
            </button>
          </div>

          {activeTab === 'links' ? (
            <Button 
              onClick={() => openItemModal()} 
              className="h-9 px-4 bg-[#c20000] hover:bg-[#a30000] text-white rounded-sm text-xs font-semibold shadow-sm ml-auto sm:ml-0"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Tambah Tautan
            </Button>
          ) : (
            <Button 
              onClick={() => handleSavePageSettings()} 
              disabled={isPageSaving}
              className="h-9 px-4 bg-[#c20000] hover:bg-[#a30000] text-white rounded-sm text-xs font-semibold shadow-sm ml-auto sm:ml-0"
            >
              {isPageSaving ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1.5" />} Simpan
            </Button>
          )}
        </div>
      </div>

      {/* ── TWO COLUMN WORKSPACE (KIRI: EDITOR / KANAN: LIVE PREVIEW) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ── LEFT COLUMN: EDITING CONTENT (7 Cols) ── */}
        <div className="lg:col-span-7 space-y-6">
          {activeTab === 'links' ? (
            /* TAB 1: DAFTAR LINK & TOMBOL */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-800">Daftar Tombol Tautan</h2>
                  <p className="text-xs text-slate-500">Atur urutan dan kelola link tujuan pengunjung.</p>
                </div>
                <Button onClick={() => openItemModal()} size="sm" className="bg-[#c20000] hover:bg-[#a30000] text-white text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Tambah Baru
                </Button>
              </div>

              {isLoading ? (
                <Card className="p-12 text-center border-slate-200">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#c20000]" />
                </Card>
              ) : items.length === 0 ? (
                <Card className="p-10 text-center border-dashed border-2 border-slate-200 bg-white">
                  <p className="text-slate-500 text-sm mb-4">Halaman ini belum memiliki tautan.</p>
                  <Button onClick={() => openItemModal()} className="bg-[#c20000] hover:bg-[#a30000] text-white text-xs">
                    <Plus className="w-3.5 h-3.5 mr-1.5" /> Tambah Tautan Pertama
                  </Button>
                </Card>
              ) : (
                <div className="space-y-3">
                  {items.map((item: any, idx: number) => (
                    <Card key={item.id} className="p-4 bg-white border-slate-200 shadow-sm hover:border-slate-300 transition-all flex items-center gap-3">
                      {/* Urutan */}
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <button 
                          onClick={() => moveItem(idx, -1)} 
                          disabled={idx === 0} 
                          title="Naikkan urutan"
                          className="p-1 text-slate-400 hover:text-[#c20000] disabled:opacity-20"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                          {idx + 1}
                        </span>
                        <button 
                          onClick={() => moveItem(idx, 1)} 
                          disabled={idx === items.length - 1} 
                          title="Turunkan urutan"
                          className="p-1 text-slate-400 hover:text-[#c20000] disabled:opacity-20"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Icon */}
                      <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                        {item.icon ? <LinkItemIcon id={item.icon} className="w-5 h-5 text-slate-700" /> : <span className="font-bold text-slate-600 text-sm">{item.title.charAt(0)}</span>}
                      </div>

                      {/* Detail */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 text-sm truncate">{item.title}</h3>
                        <p className="text-xs text-slate-400 font-mono truncate mt-0.5">{item.url}</p>
                        <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
                          <span className="bg-slate-100 px-2 py-0.5 rounded font-medium">{item.clicks || 0} Klik</span>
                          <button 
                            onClick={() => toggleActive(item)}
                            className={`font-semibold cursor-pointer ${item.is_active ? 'text-emerald-600' : 'text-slate-400'}`}
                          >
                            {item.is_active ? '● Aktif' : '○ Nonaktif'}
                          </button>
                        </div>
                      </div>

                      {/* Aksi */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button 
                          onClick={() => openItemModal(item)} 
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteItem(item.id)} 
                          className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* TAB 2: EDIT WARNA & TAMPILAN PROFIL */
            <form onSubmit={handleSavePageSettings} className="bg-white border border-slate-200 rounded-sm p-6 space-y-6 shadow-sm">
              <div>
                <h2 className="text-base font-bold text-slate-800">Kustomisasi Tampilan & Warna</h2>
                <p className="text-xs text-slate-500">Ubah tema, warna teks, tombol, dan logo profil dengan pratinjau langsung.</p>
              </div>

              {/* Info & Transfer Pemilik untuk Super Admin */}
              {isSuperAdmin && (
                <div className="p-3.5 bg-purple-50/80 border border-purple-200 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 text-purple-700 rounded-sm shrink-0">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-purple-900">Pengelola / Pemilik Halaman</h3>
                      <p className="text-xs text-purple-700 mt-0.5">
                        Saat ini dipegang oleh: <strong className="font-semibold">{page?.user?.name || 'Belum ditentukan (Sistem)'}</strong>
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setIsTransferModalOpen(true)}
                    className="bg-purple-700 hover:bg-purple-800 text-white text-xs h-8 px-3.5 shrink-0 self-start sm:self-auto font-medium shadow-sm"
                  >
                    <UserCheck className="w-3.5 h-3.5 mr-1.5" /> Alihkan ke User Lain
                  </Button>
                </div>
              )}

              {/* Preset Tema Cepat */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Preset Tema</label>
                <div className="flex flex-wrap gap-2">
                  {THEME_PRESETS.map((t) => {
                    const active = pageFormData.bg_color === t.bg && pageFormData.accent_color === t.accent;
                    return (
                      <button
                        key={t.name}
                        type="button"
                        onClick={() => {
                          setPageFormData({
                            ...pageFormData,
                            bg_color: t.bg,
                            accent_color: t.accent,
                            text_color: t.text,
                            btn_bg_color: t.btnBg,
                            btn_text_color: t.btnText,
                          });
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                          active ? 'border-[#c20000] bg-red-50 text-[#c20000] ring-1 ring-[#c20000]' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ background: `linear-gradient(135deg, ${t.bg} 50%, ${t.accent} 50%)` }} />
                        {t.name}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => {
                      setPageFormData({
                        ...pageFormData,
                        bg_color: '',
                        accent_color: '',
                        text_color: '',
                        btn_bg_color: '',
                        btn_text_color: '',
                      });
                    }}
                    className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                      !pageFormData.bg_color ? 'border-[#c20000] bg-red-50 text-[#c20000]' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    Reset Default
                  </button>
                </div>
              </div>

              {/* Color Pickers Grid */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Pengaturan Warna Kustom</label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Latar Belakang */}
                  <div className="border border-slate-200 rounded-sm p-3 bg-slate-50/50">
                    <span className="block text-xs font-semibold text-slate-700 mb-1">Warna Latar Halaman (Background)</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={pageFormData.bg_color || '#0b1120'}
                        onChange={(e) => setPageFormData({ ...pageFormData, bg_color: e.target.value })}
                        className="w-9 h-9 rounded cursor-pointer border-0 bg-transparent p-0"
                      />
                      <input
                        type="text"
                        value={pageFormData.bg_color}
                        onChange={(e) => setPageFormData({ ...pageFormData, bg_color: e.target.value })}
                        placeholder="#0b1120"
                        className="flex-1 px-2.5 py-1.5 text-xs font-mono border border-slate-200 rounded-sm uppercase bg-white"
                      />
                    </div>
                  </div>

                  {/* Aksen Cahaya */}
                  <div className="border border-slate-200 rounded-sm p-3 bg-slate-50/50">
                    <span className="block text-xs font-semibold text-slate-700 mb-1">Warna Aksen / Glow</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={pageFormData.accent_color || '#c20000'}
                        onChange={(e) => setPageFormData({ ...pageFormData, accent_color: e.target.value })}
                        className="w-9 h-9 rounded cursor-pointer border-0 bg-transparent p-0"
                      />
                      <input
                        type="text"
                        value={pageFormData.accent_color}
                        onChange={(e) => setPageFormData({ ...pageFormData, accent_color: e.target.value })}
                        placeholder="#c20000"
                        className="flex-1 px-2.5 py-1.5 text-xs font-mono border border-slate-200 rounded-sm uppercase bg-white"
                      />
                    </div>
                  </div>

                  {/* Warna Font / Teks */}
                  <div className="border border-slate-200 rounded-sm p-3 bg-slate-50/50">
                    <span className="block text-xs font-semibold text-slate-700 mb-1">Warna Teks Judul & Deskripsi</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={pageFormData.text_color || (previewBgIsLight ? '#0f172a' : '#ffffff')}
                        onChange={(e) => setPageFormData({ ...pageFormData, text_color: e.target.value })}
                        className="w-9 h-9 rounded cursor-pointer border-0 bg-transparent p-0"
                      />
                      <input
                        type="text"
                        value={pageFormData.text_color}
                        onChange={(e) => setPageFormData({ ...pageFormData, text_color: e.target.value })}
                        placeholder="Otomatis (Kontras)"
                        className="flex-1 px-2.5 py-1.5 text-xs font-mono border border-slate-200 rounded-sm uppercase bg-white"
                      />
                    </div>
                  </div>

                  {/* Latar Tombol */}
                  <div className="border border-slate-200 rounded-sm p-3 bg-slate-50/50">
                    <span className="block text-xs font-semibold text-slate-700 mb-1">Warna Latar Tombol (Button)</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={pageFormData.btn_bg_color || '#ffffff'}
                        onChange={(e) => setPageFormData({ ...pageFormData, btn_bg_color: e.target.value })}
                        className="w-9 h-9 rounded cursor-pointer border-0 bg-transparent p-0"
                      />
                      <input
                        type="text"
                        value={pageFormData.btn_bg_color}
                        onChange={(e) => setPageFormData({ ...pageFormData, btn_bg_color: e.target.value })}
                        placeholder="Transparan / Glass"
                        className="flex-1 px-2.5 py-1.5 text-xs font-mono border border-slate-200 rounded-sm uppercase bg-white"
                      />
                    </div>
                  </div>

                  {/* Teks Tombol */}
                  <div className="border border-slate-200 rounded-sm p-3 bg-slate-50/50 sm:col-span-2">
                    <span className="block text-xs font-semibold text-slate-700 mb-1">Warna Tulisan di Dalam Tombol</span>
                    <div className="flex items-center gap-2 max-w-sm">
                      <input
                        type="color"
                        value={pageFormData.btn_text_color || '#ffffff'}
                        onChange={(e) => setPageFormData({ ...pageFormData, btn_text_color: e.target.value })}
                        className="w-9 h-9 rounded cursor-pointer border-0 bg-transparent p-0"
                      />
                      <input
                        type="text"
                        value={pageFormData.btn_text_color}
                        onChange={(e) => setPageFormData({ ...pageFormData, btn_text_color: e.target.value })}
                        placeholder="#ffffff"
                        className="flex-1 px-2.5 py-1.5 text-xs font-mono border border-slate-200 rounded-sm uppercase bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Profil & Slug */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Informasi Profil</label>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Judul Profil</label>
                  <input
                    type="text"
                    required
                    value={pageFormData.title}
                    onChange={(e) => setPageFormData({ ...pageFormData, title: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-sm focus:outline-none focus:border-[#c20000]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Slug URL</label>
                  <div className="flex items-center border border-slate-200 rounded-sm overflow-hidden focus-within:border-[#c20000]">
                    <span className="px-3 py-2 text-xs text-slate-400 bg-slate-50 border-r border-slate-200 font-mono">immsolo.or.id/links/</span>
                    <input
                      type="text"
                      required
                      value={pageFormData.slug}
                      onChange={(e) => setPageFormData({ ...pageFormData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '') })}
                      className="flex-1 px-3 py-2 text-xs font-mono focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Deskripsi / Bio</label>
                  <textarea
                    rows={2}
                    value={pageFormData.description}
                    onChange={(e) => setPageFormData({ ...pageFormData, description: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-sm focus:outline-none focus:border-[#c20000]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Foto Profil / Avatar</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-sm file:border-0 file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button 
                  type="submit" 
                  disabled={isPageSaving}
                  className="w-full h-11 bg-[#c20000] hover:bg-[#a30000] text-white font-bold rounded-sm shadow-sm"
                >
                  {isPageSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Simpan Perubahan Tampilan
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* ── RIGHT COLUMN: LIVE MOBILE PHONE PREVIEW (5 Cols, Sticky) ── */}
        <div className="lg:col-span-5 sticky top-24">
          <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-sm mb-3 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-[#c20000]" /> Pratinjau Langsung (Live Preview)
            </span>
            <span className="text-[11px] text-slate-400">Otomatis update realtime</span>
          </div>

          {/* Smartphone Frame */}
          <div className="mx-auto w-[310px] sm:w-[340px] h-[640px] rounded-[40px] p-3 bg-slate-900 shadow-2xl border-4 border-slate-800 relative flex flex-col overflow-hidden">
            
            {/* Speaker & Camera Notch */}
            <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-2 shrink-0 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-950/80 mr-2" />
              <div className="w-8 h-1 rounded-full bg-slate-950/60" />
            </div>

            {/* Screen Content */}
            <div 
              className="flex-1 w-full rounded-[28px] overflow-y-auto px-4 py-8 relative transition-colors duration-300 custom-scrollbar"
              style={{ backgroundColor: previewBg }}
            >
              {/* Glow Blobs */}
              <div 
                className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-[70px] opacity-25"
                style={{ backgroundColor: previewAccent }}
              />

              {/* Profile Header */}
              <div className="relative z-10 text-center mb-6">
                <div className="relative w-20 h-20 mx-auto mb-3">
                  <div 
                    className="absolute -inset-1.5 rounded-full opacity-40 blur-md" 
                    style={{ background: `linear-gradient(to top right, ${previewAccent}, transparent)` }} 
                  />
                  <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-white/30 shadow-md mx-auto">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center text-white font-bold text-xl">
                        {pageFormData.title ? pageFormData.title.charAt(0).toUpperCase() : 'I'}
                      </div>
                    )}
                  </div>
                  <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-white shadow inline-flex items-center justify-center">
                    <BadgeCheck className="w-3.5 h-3.5" style={{ color: previewAccent }} />
                  </span>
                </div>

                <h2 
                  className="text-lg font-bold leading-tight tracking-tight line-clamp-2"
                  style={{ color: previewTextColor }}
                >
                  {pageFormData.title || 'Nama Halaman'}
                </h2>
                
                {pageFormData.description && (
                  <p 
                    className="text-xs mt-1.5 line-clamp-3 font-light leading-relaxed px-2"
                    style={{ color: previewSubColor }}
                  >
                    {pageFormData.description}
                  </p>
                )}
              </div>

              {/* Links List in Preview */}
              <div className="relative z-10 space-y-2.5">
                {items.filter((it) => it.is_active).length === 0 ? (
                  <div className="text-center py-6 px-3 rounded-xl border border-white/10 text-xs" style={{ color: previewSubColor }}>
                    Belum ada tautan aktif
                  </div>
                ) : (
                  items
                    .filter((it) => it.is_active)
                    .map((item: any) => (
                      <div
                        key={item.id}
                        style={{
                          backgroundColor: previewBtnBg ? previewBtnBg : undefined,
                          color: previewBtnText,
                        }}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                          previewBtnBg
                            ? 'border border-black/10 shadow-sm'
                            : previewBgIsLight
                            ? 'bg-white/80 border border-black/10 shadow-sm'
                            : 'bg-white/10 border border-white/15 backdrop-blur-md shadow-sm'
                        }`}
                      >
                        <div 
                          className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-white"
                          style={{ background: `linear-gradient(135deg, ${previewAccent}, ${previewAccent}99)` }}
                        >
                          {item.icon ? (
                            <LinkItemIcon id={item.icon} className="w-4 h-4" />
                          ) : (
                            <span className="text-xs font-bold">{item.title.charAt(0)}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate" style={{ color: previewBtnText }}>{item.title}</p>
                          <p className="text-[10px] opacity-70 truncate" style={{ color: previewBtnText }}>
                            {item.url.replace(/^https?:\/\//, '').split('/')[0]}
                          </p>
                        </div>
                        <ArrowUpRight className="w-3.5 h-3.5 shrink-0 opacity-70" style={{ color: previewBtnText }} />
                      </div>
                    ))
                )}
              </div>

              {/* Watermark Bottom */}
              <div className="pt-8 text-center text-[10px] font-semibold opacity-60" style={{ color: previewTextColor }}>
                immsolo.or.id
              </div>
            </div>

            {/* Bottom Home Indicator */}
            <div className="w-28 h-1 bg-slate-700 rounded-full mx-auto mt-2 shrink-0" />
          </div>
        </div>

      </div>

      {/* ── MODAL TAMBAH / EDIT ITEM TAUTAN ── */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/50 backdrop-blur-sm p-4" onClick={() => setIsItemModalOpen(false)}>
          <form onSubmit={handleSaveItem} className="bg-white rounded-sm shadow-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-slate-800 mb-5">{editingItem ? 'Edit Tautan' : 'Tambah Tautan Baru'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Judul Tautan</label>
                <input 
                  type="text" 
                  required 
                  value={itemFormData.title} 
                  onChange={(e) => setItemFormData({ ...itemFormData, title: e.target.value })}
                  placeholder="Contoh: Formulir Pendaftaran Kader" 
                  className="w-full border border-slate-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000]" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">URL Tujuan</label>
                <input 
                  type="url" 
                  required 
                  value={itemFormData.url} 
                  onChange={(e) => setItemFormData({ ...itemFormData, url: e.target.value })}
                  placeholder="https://..." 
                  className="w-full border border-slate-200 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000]" 
                />
                <p className="text-xs text-slate-500 mt-1">Tempel link tujuan (klik pengunjung tercatat otomatis).</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Pilih Icon <span className="text-slate-400 font-normal">(opsional)</span></label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-44 overflow-y-auto border border-slate-200 rounded-sm p-2">
                  <button
                    type="button"
                    onClick={() => setItemFormData({ ...itemFormData, icon: '' })}
                    className={`flex flex-col items-center gap-1 p-2 rounded-sm border text-[10px] font-medium transition-colors ${!itemFormData.icon ? 'border-[#c20000] bg-[#c20000]/5 text-[#c20000]' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                  >
                    <span className="w-5 h-5 inline-flex items-center justify-center font-bold">–</span>
                    Tanpa Icon
                  </button>
                  {LINK_ICON_OPTIONS.map((opt) => {
                    const active = itemFormData.icon === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setItemFormData({ ...itemFormData, icon: opt.id })}
                        title={opt.label}
                        className={`flex flex-col items-center gap-1 p-2 rounded-sm border text-[10px] font-medium transition-colors ${active ? 'border-[#c20000] bg-[#c20000]/5 text-[#c20000]' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                      >
                        <LinkItemIcon id={opt.id} className="w-5 h-5" />
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input 
                  type="checkbox" 
                  checked={itemFormData.is_active} 
                  onChange={(e) => setItemFormData({ ...itemFormData, is_active: e.target.checked })} 
                  className="w-4 h-4 accent-[#c20000]" 
                />
                Tampilkan tautan ini ke publik
              </label>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="outline" onClick={() => setIsItemModalOpen(false)}>Batal</Button>
              <Button type="submit" disabled={isItemSaving} className="bg-[#c20000] hover:bg-[#a30000] text-white">
                {isItemSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Simpan
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Transfer Pemilik */}
      {isTransferModalOpen && page && (
        <TransferOwnershipModal
          isOpen={isTransferModalOpen}
          onClose={() => setIsTransferModalOpen(false)}
          itemTitle={page.title || 'Halaman Linktree'}
          currentOwnerName={page.user?.name}
          onTransfer={async (newUserId) => {
            await api.put(`/link-pages/${pageId}`, { user_id: newUserId });
            fetchPage();
          }}
        />
      )}
    </div>
  );
}
