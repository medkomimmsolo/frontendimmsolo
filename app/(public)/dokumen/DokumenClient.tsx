'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Download, FileText, HardDrive, Globe, Archive, Search, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface DocumentItem {
  id: number;
  title: string;
  description?: string;
  file_type?: string;
  file_size?: string;
  file_path?: string;
  downloads_count?: number;
}

const getFileIcon = (type?: string) => {
  switch (type?.toLowerCase()) {
    case 'pdf':
      return <FileText className="w-6 h-6 text-red-500" />;
    case 'word':
    case 'doc':
    case 'docx':
      return <FileText className="w-6 h-6 text-blue-600" />;
    case 'excel':
    case 'xls':
    case 'xlsx':
      return <FileText className="w-6 h-6 text-green-600" />;
    case 'ppt':
    case 'pptx':
      return <FileText className="w-6 h-6 text-orange-600" />;
    case 'drive':
      return <HardDrive className="w-6 h-6 text-yellow-600" />;
    case 'zip':
    case 'rar':
      return <Archive className="w-6 h-6 text-indigo-600" />;
    case 'link':
    default:
      return <Globe className="w-6 h-6 text-slate-600" />;
  }
};

export default function DokumenClient({ documents }: { documents: DocumentItem[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Kumpulkan semua format file yang tersedia di dokumen
  const availableTypes = useMemo(() => {
    const set = new Set<string>();
    documents.forEach((doc) => {
      if (doc.file_type) {
        set.add(doc.file_type.toLowerCase());
      }
    });
    return Array.from(set);
  }, [documents]);

  // Filter dokumen sesuai kata kunci dan filter tipe file
  const filteredDocuments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return documents.filter((doc) => {
      const matchSearch =
        !q ||
        doc.title.toLowerCase().includes(q) ||
        (doc.description && doc.description.toLowerCase().includes(q));

      const matchType =
        selectedType === 'all' ||
        (doc.file_type && doc.file_type.toLowerCase() === selectedType);

      return matchSearch && matchType;
    });
  }, [documents, searchQuery, selectedType]);

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6">
      {/* Filter and Search Bar */}
      <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200/90 shadow-sm mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari dokumen, pedoman, materi..."
              className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#c20000] focus:ring-2 focus:ring-[#c20000]/15 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                title="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick stats */}
          <div className="text-xs text-slate-500 font-medium shrink-0 flex items-center gap-1.5 px-1">
            Menampilkan <span className="font-bold text-[#0f172a]">{filteredDocuments.length}</span> dari {documents.length} dokumen
          </div>
        </div>

        {/* Format Filter Badges */}
        {availableTypes.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Format:</span>
            <button
              type="button"
              onClick={() => setSelectedType('all')}
              className={`px-3.5 py-1 text-xs font-semibold rounded-full transition-all ${
                selectedType === 'all'
                  ? 'bg-[#c20000] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua ({documents.length})
            </button>
            {availableTypes.map((type) => {
              const count = documents.filter((d) => d.file_type?.toLowerCase() === type).length;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className={`px-3.5 py-1 text-xs font-semibold rounded-full uppercase tracking-wider transition-all ${
                    selectedType === type
                      ? 'bg-[#c20000] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {type} ({count})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Documents Grid */}
      {filteredDocuments.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredDocuments.map((doc: any) => (
            <Card
              key={doc.id}
              className="border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-red-200 hover:-translate-y-1 transition-all duration-300 bg-white rounded-2xl overflow-hidden flex flex-col h-full group"
            >
              <CardContent className="p-6 flex flex-col flex-1">
                {/* Icon & Meta */}
                <div className="flex items-start justify-between mb-4 gap-3">
                  <div className="w-12 h-12 shrink-0 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-red-50 group-hover:border-red-100 group-hover:text-[#c20000] transition-colors">
                    {getFileIcon(doc.file_type)}
                  </div>
                  {doc.file_type && (
                    <span className="shrink-0 px-2.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                      {doc.file_type}
                    </span>
                  )}
                </div>

                {/* Content */}
                <h2 className="text-base font-bold text-[#0f172a] leading-snug line-clamp-2 group-hover:text-[#c20000] transition-colors mb-2" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
                  {doc.title}
                </h2>

                {doc.description && (
                  <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-4">
                    {doc.description}
                  </p>
                )}

                {!doc.description && <div className="mb-4 flex-1"></div>}

                {/* Footer Action */}
                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-500 font-medium flex items-center gap-3">
                    {doc.file_size ? (
                      <span className="flex items-center gap-1.5">
                        <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                        {doc.file_size}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-slate-400" />
                        Web Link
                      </span>
                    )}
                    {doc.downloads_count > 0 && (
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Download className="w-3 h-3" />
                        {doc.downloads_count.toLocaleString('id-ID')}×
                      </span>
                    )}
                  </div>

                  <Button
                    asChild
                    size="sm"
                    className="bg-[#c20000] text-white hover:bg-[#a00000] border-none rounded-xl px-4 h-9 shadow-sm transition-colors text-xs font-semibold shrink-0"
                  >
                    <a
                      href={`${process.env.NEXT_PUBLIC_API_URL}/documents/${doc.id}/download`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="w-3.5 h-3.5 mr-1.5" />
                      {doc.file_path ? 'Unduh' : 'Buka'}
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200/90 p-8 shadow-sm max-w-lg mx-auto">
          <div className="w-16 h-16 bg-red-50 border border-red-100 text-[#c20000] rounded-full flex items-center justify-center mx-auto mb-4">
            <Archive className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-[#0f172a] mb-2" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
            {searchQuery || selectedType !== 'all' ? 'Dokumen Tidak Ditemukan' : 'Belum Ada Dokumen'}
          </h2>
          <p className="text-slate-500 max-w-md mx-auto text-sm">
            {searchQuery || selectedType !== 'all'
              ? 'Tidak ada dokumen yang cocok dengan kata kunci atau filter yang Anda pilih.'
              : 'Saat ini belum ada dokumen yang dipublikasikan. Silakan periksa kembali nanti.'}
          </p>
          {(searchQuery || selectedType !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedType('all');
              }}
              className="mt-5 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors shadow-sm"
            >
              Reset Filter
            </button>
          )}
        </div>
      )}
    </section>
  );
}

