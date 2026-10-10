'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import api from '@/lib/api';
import { resolveMediaUrl, convertToWebP } from '@/lib/imageUtils';
import { 
  X, 
  Search, 
  Upload, 
  Image as ImageIcon, 
  Check, 
  Loader2, 
  Folder, 
  RefreshCw,
  Calendar,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export interface MediaFile {
  name: string;
  path: string;
  url: string;
  size: number;
  group?: string;
  year?: number | string;
  timestamp?: number;
}

type MediaResponse = {
  [group: string]: {
    [year: string]: MediaFile[];
  };
};

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  currentUrl?: string | null;
  title?: string;
  allowedFolder?: string;
}

export default function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  currentUrl,
  title = 'Pilih dari Media Library',
  allowedFolder = 'media',
}: MediaPickerModalProps) {
  const [activeTab, setActiveTab] = useState<'browse' | 'upload'>('browse');
  const [mediaData, setMediaData] = useState<MediaResponse>({});
  const [flatFiles, setFlatFiles] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);

  // Upload tab states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadFolder, setUploadFolder] = useState<string>(allowedFolder);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/media');
      const raw = res.data?.data;
      
      const filesList: MediaFile[] = [];
      const grouped: MediaResponse = {};

      if (raw && typeof raw === 'object') {
        Object.entries(raw).forEach(([groupName, yearsObj]: [string, any]) => {
          if (Array.isArray(yearsObj)) {
            yearsObj.forEach((f) => {
              if (f && typeof f === 'object') {
                const item: MediaFile = { ...f, group: groupName };
                filesList.push(item);
                const y = String(item.year || 'arsip');
                if (!grouped[groupName]) grouped[groupName] = {};
                if (!grouped[groupName][y]) grouped[groupName][y] = [];
                grouped[groupName][y].push(item);
              }
            });
          } else if (yearsObj && typeof yearsObj === 'object') {
            Object.entries(yearsObj).forEach(([yearKey, items]: [string, any]) => {
              const fileArr = Array.isArray(items) ? items : [items];
              fileArr.forEach((f) => {
                if (f && typeof f === 'object') {
                  const item: MediaFile = { ...f, group: groupName, year: yearKey };
                  filesList.push(item);
                  if (!grouped[groupName]) grouped[groupName] = {};
                  if (!grouped[groupName][yearKey]) grouped[groupName][yearKey] = [];
                  grouped[groupName][yearKey].push(item);
                }
              });
            });
          }
        });
      }

      setMediaData(grouped);
      setFlatFiles(filesList);

      // Preselect if currentUrl matches
      if (currentUrl) {
        const found = filesList.find((f) => f.url === currentUrl || currentUrl.endsWith(f.path));
        if (found) setSelectedFile(found);
      }
    } catch (err) {
      console.error('Failed to load media library', err);
      toast.error('Gagal memuat Media Library');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    } else {
      setSelectedFile(null);
      setSearchQuery('');
      setActiveTab('browse');
      setUploadFile(null);
      setUploadPreview(null);
    }
  }, [isOpen]);

  const groups = useMemo(() => {
    const list = Object.keys(mediaData);
    return ['all', ...list];
  }, [mediaData]);

  const filteredFiles = useMemo(() => {
    return flatFiles.filter((file) => {
      const matchGroup = selectedGroup === 'all' || file.group === selectedGroup;
      const matchSearch = searchQuery.trim() === '' || 
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.path.toLowerCase().includes(searchQuery.toLowerCase());
      return matchGroup && matchSearch;
    });
  }, [flatFiles, selectedGroup, searchQuery]);

  const formatBytes = (bytes?: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleSelectConfirm = () => {
    if (!selectedFile) return;
    onSelect(selectedFile.url);
    onClose();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const raw = e.target.files[0];
      try {
        const webpFile = await convertToWebP(raw);
        setUploadFile(webpFile);
        const objUrl = URL.createObjectURL(webpFile);
        setUploadPreview(objUrl);
      } catch (err) {
        console.error(err);
        toast.error('Gagal memproses gambar');
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      toast.error('Silakan pilih file gambar');
      return;
    }

    try {
      setIsUploading(true);
      const fd = new FormData();
      fd.append('file', uploadFile);
      fd.append('folder', uploadFolder || 'media');

      const res = await api.post('/media', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadedUrl = res.data?.data?.url;
      toast.success('Gambar berhasil diunggah ke Media Library');
      
      // Auto choose the uploaded image
      onSelect(uploadedUrl);
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Gagal mengunggah gambar');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-imm-red-50 text-imm-red-500 flex items-center justify-center font-bold">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800 leading-tight">
                {title}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih aset gambar yang sudah ada atau unggah baru ke Media Library
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 bg-white shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('browse')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'browse'
                ? 'border-imm-red-500 text-imm-red-500 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Jelajahi Media Library ({flatFiles.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'upload'
                ? 'border-imm-red-500 text-imm-red-500 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-4 h-4" />
            Unggah Baru ke Media
          </button>
        </div>

        {/* Tab 1: Browse Media Library */}
        {activeTab === 'browse' && (
          <div className="flex flex-col flex-1 min-h-0">
            {/* Filter & Search Bar */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row items-center gap-3 shrink-0">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-thin">
                {groups.map((group) => (
                  <button
                    key={group}
                    type="button"
                    onClick={() => setSelectedGroup(group)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-colors capitalize ${
                      selectedGroup === group
                        ? 'bg-imm-red-500 text-white shadow-sm'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {group === 'all' ? 'Semua Folder' : group}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64 sm:ml-auto">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama file..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-imm-red-500 focus:ring-1 focus:ring-imm-red-500"
                />
              </div>

              <button
                type="button"
                onClick={fetchMedia}
                disabled={isLoading}
                title="Muat ulang media"
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-md transition-colors shrink-0"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Media Content Grid & Sidebar Preview */}
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row min-h-[360px]">
              {/* Grid area */}
              <div className="flex-1 overflow-y-auto p-4 bg-slate-50/30">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin text-imm-red-500 mb-2" />
                    <p className="text-sm">Memuat daftar media...</p>
                  </div>
                ) : filteredFiles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-400 border border-dashed border-slate-200 rounded-lg p-6 bg-white">
                    <ImageIcon className="w-12 h-12 text-slate-300 mb-2" />
                    <p className="text-sm font-medium text-slate-700">Tidak ada media ditemukan</p>
                    <p className="text-xs text-slate-400 mt-1 text-center max-w-sm">
                      {searchQuery
                        ? `Tidak ada file yang cocok dengan pencarian "${searchQuery}"`
                        : 'Belum ada gambar yang diunggah di folder ini.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('upload')}
                      className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-imm-red-500 hover:bg-imm-red-600 text-white text-xs font-medium rounded-md shadow-sm transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Unggah Gambar Sekarang
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {filteredFiles.map((file) => {
                      const isSelected = selectedFile?.path === file.path || selectedFile?.url === file.url;
                      const fullUrl = resolveMediaUrl(file.url);
                      return (
                        <div
                          key={file.path}
                          onClick={() => setSelectedFile(file)}
                          onDoubleClick={() => {
                            setSelectedFile(file);
                            onSelect(file.url);
                            onClose();
                          }}
                          className={`group relative aspect-square rounded-md overflow-hidden bg-white border cursor-pointer transition-all duration-150 flex flex-col ${
                            isSelected
                              ? 'border-imm-red-500 ring-2 ring-imm-red-500 ring-offset-1 shadow-md'
                              : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex-1 w-full bg-slate-100 relative overflow-hidden flex items-center justify-center">
                            <img
                              src={fullUrl}
                              alt={file.name}
                              loading="lazy"
                              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = file.url;
                              }}
                            />
                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 bg-imm-red-500 text-white rounded-full p-1 shadow-md">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            )}
                          </div>
                          <div className="p-1.5 bg-white border-t border-slate-100">
                            <p className="text-[11px] font-medium text-slate-700 truncate" title={file.name}>
                              {file.name}
                            </p>
                            <p className="text-[9px] text-slate-400 flex items-center justify-between">
                              <span className="capitalize">{file.group || 'media'}</span>
                              <span>{formatBytes(file.size)}</span>
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Detail Sidebar Preview */}
              <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-slate-200 p-4 bg-white flex flex-col justify-between shrink-0">
                {selectedFile ? (
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Pratinjau Terpilih
                    </h3>
                    <div className="aspect-video w-full rounded-md overflow-hidden bg-slate-100 border border-slate-200 relative">
                      <img
                        src={resolveMediaUrl(selectedFile.url)}
                        alt={selectedFile.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-600">
                      <div>
                        <span className="font-medium text-slate-700 block">Nama File:</span>
                        <p className="truncate text-slate-500" title={selectedFile.name}>{selectedFile.name}</p>
                      </div>
                      <div>
                        <span className="font-medium text-slate-700 block">Folder / Kategori:</span>
                        <p className="capitalize text-slate-500">{selectedFile.group || 'media'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-slate-700 block">Ukuran File:</span>
                        <p className="text-slate-500">{formatBytes(selectedFile.size)}</p>
                      </div>
                      <div>
                        <span className="font-medium text-slate-700 block">URL Path:</span>
                        <p className="truncate text-slate-400 font-mono text-[10px]" title={selectedFile.url}>
                          {selectedFile.url}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400">
                    <ImageIcon className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-xs">Klik salah satu gambar untuk melihat detail dan memilih.</p>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                  <button
                    type="button"
                    disabled={!selectedFile}
                    onClick={handleSelectConfirm}
                    className="w-full py-2 px-3 bg-imm-red-500 hover:bg-imm-red-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-md shadow-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    Gunakan Gambar Terpilih
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-1.5 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium rounded-md transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Upload New Directly to Media */}
        {activeTab === 'upload' && (
          <form onSubmit={handleUploadSubmit} className="p-6 flex-1 flex flex-col justify-between overflow-y-auto">
            <div className="max-w-xl mx-auto w-full space-y-4">
              <div className="text-center space-y-1">
                <h3 className="text-sm font-semibold text-slate-800">Unggah Gambar ke Media Library</h3>
                <p className="text-xs text-slate-500">
                  Gambar akan otomatis dikonversi ke WebP dan disimpan ke Media Library untuk digunakan berulang kali.
                </p>
              </div>

              {/* Upload Drop Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  uploadPreview
                    ? 'border-imm-red-300 bg-imm-red-50/20'
                    : 'border-slate-300 hover:border-imm-red-400 bg-slate-50 hover:bg-slate-100/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {uploadPreview ? (
                  <div className="space-y-3">
                    <div className="w-48 h-32 mx-auto rounded-md overflow-hidden bg-white shadow-sm border border-slate-200">
                      <img src={uploadPreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="text-xs text-slate-600">
                      <p className="font-semibold text-slate-800 truncate">{uploadFile?.name}</p>
                      <p className="text-slate-400">{formatBytes(uploadFile?.size)} (WebP siap diunggah)</p>
                      <span className="text-imm-red-500 hover:underline mt-1 inline-block">Klik untuk mengganti</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 py-4">
                    <div className="w-12 h-12 rounded-full bg-imm-red-50 text-imm-red-500 flex items-center justify-center mx-auto">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-slate-700">
                      Klik atau seret gambar ke sini
                    </p>
                    <p className="text-xs text-slate-400">
                      PNG, JPG, JPEG, atau WebP (Maksimal 2MB, otomatis dioptimasi)
                    </p>
                  </div>
                )}
              </div>

              {/* Target Folder Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Folder Penyimpanan
                </label>
                <select
                  value={uploadFolder}
                  onChange={(e) => setUploadFolder(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-imm-red-500 focus:ring-1 focus:ring-imm-red-500"
                >
                  <option value="media">media (Umum / Media Library)</option>
                  <option value="blogs">blogs (Kabar & Berita)</option>
                  <option value="events">events (Agenda & Kegiatan)</option>
                  <option value="struktural">struktural (Pengurus & Tokoh)</option>
                  <option value="lembaga">lembaga (Komisariat & Korkom)</option>
                  <option value="logos">logos (Identitas & Logo)</option>
                  <option value="links">links (Biolink & Tautan)</option>
                </select>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3 max-w-xl mx-auto w-full">
              <button
                type="button"
                onClick={() => setActiveTab('browse')}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-md text-xs font-medium text-slate-600 transition-colors"
              >
                Kembali ke Galeri
              </button>
              <button
                type="submit"
                disabled={!uploadFile || isUploading}
                className="px-5 py-2 bg-imm-red-500 hover:bg-imm-red-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-md shadow-sm transition-colors flex items-center gap-1.5"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Mengunggah...
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    Unggah & Pilih Gambar
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

