'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PaginationControls } from '@/components/ui/PaginationControls';
import {
  Calendar,
  Check,
  Copy,
  FileText,
  Folder,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getUserFacingErrorMessage } from '@/lib/errorMessage';
import { useConfirm } from '@/components/providers/ConfirmProvider';
import { PageHeader } from '@/components/ui/PageHeader';
import { resolveMediaUrl } from '@/lib/imageUtils';

interface MediaFile {
  name: string;
  path: string;
  url: string;
  size: number;
  group: string;
  year: number | string;
  timestamp: number;
}

type MediaResponse = Record<string, Record<string, MediaFile[]>>;

const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
const MEDIA_PAGE_SIZE = 30;
const UPLOAD_FOLDERS = [
  { value: 'media', label: 'Media umum' },
  { value: 'blogs', label: 'Artikel / blog' },
  { value: 'events', label: 'Kegiatan' },
  { value: 'struktural', label: 'Struktural' },
  { value: 'lembaga', label: 'Lembaga' },
  { value: 'logos', label: 'Logo' },
  { value: 'links', label: 'Tautan' },
  { value: 'forms', label: 'Formulir' },
];

const groupFlatFiles = (files: MediaFile[]): MediaResponse => {
  const result: MediaResponse = {};
  for (const file of files) {
    if (!file || typeof file !== 'object') continue;
    const group = typeof file.group === 'string' && file.group ? file.group : 'umum';
    const year = file.year !== undefined && file.year !== null ? String(file.year) : 'arsip';
    result[group] ??= {};
    result[group][year] ??= [];
    result[group][year].push({ ...file, group, year });
  }
  return result;
};

const normalizeMedia = (raw: unknown): MediaResponse => {
  if (Array.isArray(raw)) return groupFlatFiles(raw as MediaFile[]);
  if (!raw || typeof raw !== 'object') return {};

  const files: MediaFile[] = [];
  for (const [group, years] of Object.entries(raw as Record<string, unknown>)) {
    if (Array.isArray(years)) {
      for (const item of years) {
        if (item && typeof item === 'object') {
          files.push({ ...(item as MediaFile), group });
        }
      }
      continue;
    }
    if (!years || typeof years !== 'object') continue;
    for (const [year, entries] of Object.entries(years as Record<string, unknown>)) {
      const items = Array.isArray(entries) ? entries : [entries];
      for (const item of items) {
        if (item && typeof item === 'object') {
          files.push({ ...(item as MediaFile), group, year });
        }
      }
    }
  }
  return groupFlatFiles(files);
};

const getMediaHref = (url: string) => {
  if (!url) return '';
  if (url.startsWith('/')) return url;
  try {
    const parsed = new URL(url);
    if (parsed.pathname.startsWith('/storage/')) return `${parsed.pathname}${parsed.search}`;
  } catch {
    // Keep the shared media URL resolver as the fallback for legacy URLs.
  }
  return resolveMediaUrl(url);
};

const formatBytes = (bytes: number) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const unit = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, unit)).toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
};

const formatDate = (timestamp: number) => {
  if (!Number.isFinite(timestamp) || timestamp <= 0) return 'Tanggal tidak tersedia';
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(timestamp * 1000));
};

export default function MediaLibrary() {
  const { confirm } = useConfirm();
  const [mediaData, setMediaData] = useState<MediaResponse>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadFolder, setUploadFolder] = useState('media');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPreview, setUploadPreview] = useState('');
  const [deletingPath, setDeletingPath] = useState<string | null>(null);
  const [failedPreviews, setFailedPreviews] = useState<Set<string>>(new Set());
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const requestId = useRef(0);

  const fetchMedia = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setIsLoading(true);
    setLoadError(false);
    try {
      const response = await api.get('/media');
      if (currentRequest !== requestId.current) return;
      const normalized = normalizeMedia(response.data?.data);
      setMediaData(normalized);
      setFailedPreviews(new Set());
      setSelectedGroup((current) => current === 'all' || normalized[current] ? current : 'all');
    } catch (error) {
      if (currentRequest !== requestId.current) return;
      console.error('Failed to load media library', error);
      setLoadError(true);
      toast.error(getUserFacingErrorMessage(error, 'Gagal memuat media library'));
    } finally {
      if (currentRequest === requestId.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchMedia();
    return () => {
      requestId.current += 1;
    };
  }, [fetchMedia]);

  useEffect(() => {
    if (!uploadFile) {
      setUploadPreview('');
      return;
    }
    const previewUrl = URL.createObjectURL(uploadFile);
    setUploadPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [uploadFile]);

  const allFiles = useMemo(
    () => Object.values(mediaData).flatMap((years) => Object.values(years).flat()),
    [mediaData],
  );
  const groups = useMemo(
    () => Object.keys(mediaData).sort((a, b) => a.localeCompare(b, 'id')),
    [mediaData],
  );
  const visibleFiles = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase('id');
    return allFiles
      .filter((file) => selectedGroup === 'all' || file.group === selectedGroup)
      .filter((file) => !query || `${file.name} ${file.path} ${file.group}`.toLocaleLowerCase('id').includes(query))
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [allFiles, searchQuery, selectedGroup]);
  const totalPages = Math.max(1, Math.ceil(visibleFiles.length / MEDIA_PAGE_SIZE));
  const pageFiles = useMemo(
    () => visibleFiles.slice((currentPage - 1) * MEDIA_PAGE_SIZE, currentPage * MEDIA_PAGE_SIZE),
    [currentPage, visibleFiles],
  );
  const totalBytes = useMemo(() => allFiles.reduce((sum, file) => sum + (Number(file.size) || 0), 0), [allFiles]);

  useEffect(() => {
    setCurrentPage(1);
  }, [allFiles, searchQuery, selectedGroup]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Format yang didukung: JPG, PNG, dan WebP.');
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error('Ukuran gambar maksimal 2 MB.');
      return;
    }
    setUploadFile(file);
  };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!uploadFile) {
      toast.error('Pilih gambar yang akan diunggah.');
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('folder', uploadFolder);
      await api.post('/media', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Gambar berhasil diunggah.');
      setUploadFile(null);
      setIsUploadOpen(false);
      setSelectedGroup(uploadFolder);
      await fetchMedia();
    } catch (error) {
      console.error('Failed to upload media', error);
      toast.error(getUserFacingErrorMessage(error, 'Gagal mengunggah gambar. Pastikan format dan ukurannya sesuai.'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (file: MediaFile) => {
    if (!(await confirm({
      title: 'Hapus file media?',
      message: `“${file.name}” akan dihapus permanen. Jika masih digunakan, gambar pada website dapat rusak.`,
      confirmText: 'Hapus permanen',
      tone: 'danger',
    }))) return;

    setDeletingPath(file.path);
    try {
      await api.delete('/media', { data: { path: file.path } });
      toast.success('File berhasil dihapus.');
      await fetchMedia();
    } catch (error) {
      console.error('Failed to delete media', error);
      toast.error(getUserFacingErrorMessage(error, 'Gagal menghapus file media.'));
    } finally {
      setDeletingPath(null);
    }
  };

  const copyMediaLink = async (file: MediaFile) => {
    try {
      const href = getMediaHref(file.url);
      await navigator.clipboard.writeText(new URL(href, window.location.origin).toString());
      setCopiedPath(file.path);
      window.setTimeout(() => setCopiedPath((current) => current === file.path ? null : current), 1800);
      toast.success('Tautan media disalin.');
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error, 'Tautan belum tersalin. Periksa izin clipboard browser.'));
    }
  };

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title="Media Library"
        description="Kelola, cari, dan unggah gambar yang digunakan di seluruh portal."
        badge="Media"
      >
        <Button
          type="button"
          onClick={() => setIsUploadOpen((open) => !open)}
          className="h-10 rounded-xl bg-[#c20000] px-4 text-sm font-bold text-white hover:bg-[#a30000]"
        >
          {isUploadOpen ? <X className="mr-2 h-4 w-4" /> : <Upload className="mr-2 h-4 w-4" />}
          {isUploadOpen ? 'Tutup unggah' : 'Unggah media'}
        </Button>
      </PageHeader>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3" aria-label="Ringkasan media">
        {[
          { label: 'Total file', value: allFiles.length.toLocaleString('id-ID'), icon: ImageIcon, color: 'bg-red-50 text-[#c20000]' },
          { label: 'Kelompok', value: groups.length.toLocaleString('id-ID'), icon: Folder, color: 'bg-blue-50 text-blue-600' },
          { label: 'Total ukuran', value: formatBytes(totalBytes), icon: FileText, color: 'bg-amber-50 text-amber-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="flex items-center gap-3 rounded-2xl border border-slate-200/90 bg-white px-4 py-3 shadow-2xs">
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}><Icon className="h-5 w-5" /></span>
            <div><p className="text-xs font-medium text-slate-500">{label}</p><p className="text-lg font-bold text-slate-900">{value}</p></div>
          </div>
        ))}
      </section>

      {isUploadOpen && (
        <Card className="overflow-hidden rounded-2xl border-slate-200/90 shadow-2xs">
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleUpload} className="grid gap-5 md:grid-cols-[minmax(0,1fr)_260px]">
              <div>
                <div className="mb-3">
                  <h2 className="font-bold text-slate-900">Unggah gambar</h2>
                  <p className="mt-1 text-sm text-slate-500">JPG, PNG, atau WebP. Maksimal 2 MB; gambar disimpan dalam format WebP.</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="sr-only"
                  aria-label="Pilih file gambar"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex min-h-32 w-full items-center justify-center gap-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-left transition hover:border-[#c20000] hover:bg-red-50/40"
                >
                  {uploadPreview ? (
                    <Image src={uploadPreview} alt="Pratinjau gambar yang akan diunggah" width={96} height={96} unoptimized className="h-24 w-24 rounded-lg object-cover" />
                  ) : (
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-[#c20000] shadow-sm"><Upload className="h-5 w-5" /></span>
                  )}
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-slate-800">{uploadFile?.name ?? 'Pilih gambar dari perangkat'}</span>
                    <span className="mt-1 block text-xs text-slate-500">{uploadFile ? formatBytes(uploadFile.size) : 'Klik untuk memilih JPG, PNG, atau WebP'}</span>
                  </span>
                </button>
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-sm font-semibold text-slate-700">
                  Simpan ke kelompok
                  <select
                    value={uploadFolder}
                    onChange={(event) => setUploadFolder(event.target.value)}
                    className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000]"
                  >
                    {UPLOAD_FOLDERS.map((folder) => <option key={folder.value} value={folder.value}>{folder.label}</option>)}
                  </select>
                </label>
                <Button type="submit" disabled={!uploadFile || isUploading} className="mt-auto h-10 rounded-xl bg-[#c20000] text-white hover:bg-[#a30000]">
                  {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                  {isUploading ? 'Mengunggah...' : 'Unggah gambar'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold text-slate-900">Koleksi media</h2>
            <p className="mt-0.5 text-xs text-slate-500">{visibleFiles.length.toLocaleString('id-ID')} file ditampilkan</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative min-w-0 flex-1 sm:w-72 sm:flex-none">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Cari nama atau kelompok..."
                aria-label="Cari media"
                className="h-10 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000]"
              />
            </div>
            <Button type="button" variant="outline" size="icon" onClick={() => void fetchMedia()} disabled={isLoading} aria-label="Muat ulang media" title="Muat ulang">
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row">
          <nav aria-label="Kelompok media" className="flex gap-2 overflow-x-auto border-b border-slate-100 p-3 md:w-56 md:shrink-0 md:flex-col md:overflow-visible md:border-b-0 md:border-r">
            {[{ key: 'all', label: 'Semua media', count: allFiles.length }, ...groups.map((group) => ({
              key: group,
              label: group,
              count: Object.values(mediaData[group] ?? {}).flat().length,
            }))].map(({ key, label, count }) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedGroup(key)}
                aria-pressed={selectedGroup === key}
                className={`flex shrink-0 items-center justify-between gap-4 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors md:w-full ${
                  selectedGroup === key ? 'bg-red-50 text-[#c20000]' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="flex min-w-0 items-center gap-2"><Folder className="h-4 w-4 shrink-0" /><span className="truncate capitalize">{label}</span></span>
                <span className={`text-xs ${selectedGroup === key ? 'text-[#c20000]' : 'text-slate-400'}`}>{count}</span>
              </button>
            ))}
          </nav>

          <div className="min-h-72 min-w-0 flex-1 p-4 sm:p-5">
            {isLoading ? (
              <div className="flex min-h-64 flex-col items-center justify-center text-sm text-slate-500">
                <Loader2 className="mb-3 h-8 w-8 animate-spin text-[#c20000]" />
                Memuat koleksi media...
              </div>
            ) : loadError ? (
              <div className="flex min-h-64 flex-col items-center justify-center text-center">
                <p className="font-semibold text-slate-800">Media gagal dimuat</p>
                <p className="mt-1 text-sm text-slate-500">Periksa koneksi, lalu coba muat ulang koleksi.</p>
                <Button type="button" variant="outline" onClick={() => void fetchMedia()} className="mt-4 rounded-xl"><RefreshCw className="mr-2 h-4 w-4" /> Coba lagi</Button>
              </div>
            ) : visibleFiles.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center text-center">
                <ImageIcon className="mb-3 h-11 w-11 text-slate-300" />
                <p className="font-semibold text-slate-800">{allFiles.length === 0 ? 'Belum ada media' : 'Media tidak ditemukan'}</p>
                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  {allFiles.length === 0 ? 'Unggah gambar pertama untuk digunakan pada halaman portal.' : 'Coba kata kunci lain atau pilih kelompok media yang berbeda.'}
                </p>
                {allFiles.length === 0 && (
                  <Button type="button" onClick={() => setIsUploadOpen(true)} className="mt-4 rounded-xl bg-[#c20000] text-white"><Upload className="mr-2 h-4 w-4" /> Unggah media</Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {pageFiles.map((file) => {
                  const imageFile = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file.name);
                  const mediaHref = getMediaHref(file.url);
                  const previewFailed = failedPreviews.has(file.path);
                  return (
                    <Card key={file.path} className="group min-w-0 overflow-hidden rounded-xl border-slate-200 shadow-none transition hover:border-slate-300 hover:shadow-sm">
                      <a href={mediaHref} target="_blank" rel="noreferrer" className="relative block aspect-square bg-slate-100" aria-label={`Buka ${file.name} di tab baru`}>
                        {imageFile && !previewFailed ? (
                          <Image
                            src={mediaHref}
                            alt={file.name}
                            fill
                            unoptimized
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                            onError={() => setFailedPreviews((current) => new Set(current).add(file.path))}
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-slate-300"><FileText className="h-12 w-12" /></div>
                        )}
                        <span className="absolute right-2 top-2 rounded-lg bg-white/90 p-1.5 text-slate-500 opacity-100 shadow-sm transition group-hover:text-[#c20000]">
                          <ImageIcon className="h-4 w-4" />
                        </span>
                      </a>
                      <CardContent className="space-y-2 p-3">
                        <p className="truncate text-xs font-semibold text-slate-800" title={file.name}>{file.name}</p>
                        <div className="flex items-center justify-between gap-2 text-[10px] text-slate-500">
                          <span className="truncate capitalize">{file.group}</span>
                          <span className="shrink-0">{formatBytes(Number(file.size))}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
                          <span className="flex min-w-0 items-center gap-1 truncate text-[10px] text-slate-400" title={formatDate(Number(file.timestamp))}>
                            <Calendar className="h-3 w-3 shrink-0" />{formatDate(Number(file.timestamp))}
                          </span>
                          <div className="flex shrink-0 items-center gap-1">
                            <button type="button" onClick={() => void copyMediaLink(file)} aria-label={`Salin tautan ${file.name}`} title={copiedPath === file.path ? 'Tersalin' : 'Salin tautan'} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900">
                              {copiedPath === file.path ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                            </button>
                            <button type="button" onClick={() => void handleDelete(file)} disabled={deletingPath === file.path} aria-label={`Hapus ${file.name}`} title="Hapus permanen" className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 disabled:opacity-50">
                              {deletingPath === file.path ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
            {!isLoading && !loadError && visibleFiles.length > MEDIA_PAGE_SIZE && (
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200/90">
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={visibleFiles.length}
                  pageSize={MEDIA_PAGE_SIZE}
                  unit="media"
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
