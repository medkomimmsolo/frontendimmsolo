'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loader2, Folder, Image as ImageIcon, Trash2, Calendar, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

interface MediaFile {
  name: string;
  path: string;
  url: string;
  size: number;
  group: string;
  year: number;
  timestamp: number;
}

type MediaResponse = {
  [group: string]: {
    [year: string]: MediaFile[];
  };
};

export default function MediaLibrary() {
  const [mediaData, setMediaData] = useState<MediaResponse>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<string>('');

  const fetchMedia = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/media');
      const data = res.data.data;
      setMediaData(data);
      if (Object.keys(data).length > 0 && !selectedGroup) {
        setSelectedGroup(Object.keys(data)[0]);
      }
    } catch (error) {
      console.error(error);
      toast.error('Gagal memuat media library');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleDelete = async (path: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus file ini? Ini mungkin merusak tampilan website jika file masih digunakan.')) {
      return;
    }

    try {
      await api.delete('/media', { data: { path } });
      toast.success('File berhasil dihapus');
      fetchMedia();
    } catch (error) {
      console.error(error);
      toast.error('Gagal menghapus file');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-[#0f172a]/70">
        <Loader2 className="w-8 h-8 animate-spin mr-3 text-imm-red-500" />
        Memuat perpustakaan media...
      </div>
    );
  }

  const groups = Object.keys(mediaData);

  if (groups.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
            Media Library
          </h1>
          <p className="text-[#0f172a]/70 text-sm mt-1">Kelola semua gambar dan dokumen yang diunggah.</p>
        </div>
        <Card className="border-[#0f172a]/10 shadow-sm">
          <CardContent className="p-12 text-center">
            <ImageIcon className="w-12 h-12 text-[#0f172a]/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#0f172a]">Belum ada media</h3>
            <p className="text-[#0f172a]/70 mt-2 text-sm">Media akan muncul di sini setelah Anda mengunggah gambar untuk Post, Lembaga, atau Struktural.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
          Media Library
        </h1>
        <p className="text-[#0f172a]/70 text-sm mt-1">Kelola gambar dan dokumen yang dikelompokkan berdasarkan penggunaannya.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Groups */}
        <div className="w-full md:w-64 space-y-2 shrink-0">
          <h3 className="text-sm font-semibold text-[#0f172a]/50 uppercase tracking-wider mb-4 px-2">Kelompok Media</h3>
          {groups.map((group) => (
            <button
              key={group}
              onClick={() => setSelectedGroup(group)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium transition-colors ${
                selectedGroup === group
                  ? 'bg-imm-red-500 text-white shadow-sm'
                  : 'text-[#0f172a]/70 hover:bg-[#0f172a]/5 hover:text-[#0f172a]'
              }`}
            >
              <Folder className={`w-5 h-5 ${selectedGroup === group ? 'text-white/80' : 'text-[#0f172a]/40'}`} />
              <span className="capitalize">{group}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-8">
          {selectedGroup && mediaData[selectedGroup] && (
            Object.keys(mediaData[selectedGroup])
              .sort((a, b) => Number(b) - Number(a)) // Sort years descending
              .map((year) => (
                <div key={year} className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-[#0f172a]/10 pb-2">
                    <Calendar className="w-5 h-5 text-imm-red-500" />
                    <h2 className="text-xl font-semibold text-[#0f172a]">Tahun {year}</h2>
                    <span className="text-sm text-[#0f172a]/50 ml-2">({mediaData[selectedGroup][year].length} file)</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {mediaData[selectedGroup][year].map((file) => {
                      const isImage = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file.name);
                      return (
                        <Card key={file.path} className="overflow-hidden border-[#0f172a]/10 shadow-sm group">
                          <div className="aspect-square bg-[#0f172a]/5 relative flex items-center justify-center">
                            {isImage ? (
                              <img 
                                src={process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') + file.url} 
                                alt={file.name}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = file.url;
                                }}
                              />
                            ) : (
                              <FileText className="w-12 h-12 text-[#0f172a]/20" />
                            )}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <a 
                                href={process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') + file.url} 
                                target="_blank" 
                                rel="noreferrer"
                                className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors"
                                title="Lihat Penuh"
                              >
                                {isImage ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                              </a>
                              <button 
                                onClick={() => handleDelete(file.path)}
                                className="p-2 bg-red-500/80 hover:bg-red-500 rounded-full text-white transition-colors"
                                title="Hapus"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="p-3">
                            <p className="text-xs font-medium text-[#0f172a] truncate" title={file.name}>
                              {file.name}
                            </p>
                            <p className="text-[10px] text-[#0f172a]/50 mt-1">
                              {formatBytes(file.size)}
                            </p>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
