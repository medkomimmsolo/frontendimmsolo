'use client';

import { useState, useEffect, useRef } from 'react';
import { convertToWebP, resolveMediaUrl } from '@/lib/imageUtils';
import MediaPickerModal from './MediaPickerModal';
import { 
  FolderOpen, 
  UploadCloud, 
  Trash2, 
  RefreshCw, 
  Image as ImageIcon, 
  Check, 
  HardDrive,
  FolderArchive
} from 'lucide-react';
import toast from 'react-hot-toast';

export interface ImageUploadPickerProps {
  value?: File | string | null;
  onChange: (fileOrUrl: File | string | null, previewUrl: string | null) => void;
  label?: string;
  description?: string;
  aspectRatio?: 'video' | 'square' | 'portrait' | 'banner' | 'auto';
  allowedFolder?: string;
  className?: string;
  modalTitle?: string;
}

export default function ImageUploadPicker({
  value,
  onChange,
  label,
  description,
  aspectRatio = 'video',
  allowedFolder = 'media',
  className = '',
  modalTitle = 'Pilih dari Media Library',
}: ImageUploadPickerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isFromLibrary, setIsFromLibrary] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      setIsFromLibrary(false);
      return;
    }

    if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setPreviewUrl(url);
      setIsFromLibrary(false);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else if (typeof value === 'string' && value.trim() !== '') {
      setPreviewUrl(resolveMediaUrl(value));
      setIsFromLibrary(true);
    }
  }, [value]);

  const handleDeviceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const rawFile = e.target.files[0];
      try {
        const webpFile = await convertToWebP(rawFile);
        if (webpFile.size > 2 * 1024 * 1024) {
          toast.error('Ukuran gambar setelah kompresi masih lebih dari 2MB. Silakan pilih foto dengan resolusi lebih kecil.');
          return;
        }
        setIsFromLibrary(false);
        const objUrl = URL.createObjectURL(webpFile);
        onChange(webpFile, objUrl);
        toast.success('Gambar dari perangkat siap digunakan');
      } catch (err) {
        console.error('Gagal konversi ke WebP', err);
        toast.error('Gagal memproses gambar');
      }
    }
  };

  const handleLibrarySelect = (url: string) => {
    setIsFromLibrary(true);
    onChange(url, resolveMediaUrl(url));
    toast.success('Gambar dari Media Library dipilih');
  };

  const handleRemove = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onChange(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getAspectClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square max-w-[240px]';
      case 'portrait':
        return 'aspect-[3/4] max-w-[260px]';
      case 'banner':
        return 'aspect-[21/9] w-full';
      case 'auto':
        return 'min-h-[160px] max-h-[320px] w-full';
      case 'video':
      default:
        return 'aspect-video w-full';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-slate-800">
          {label}
        </label>
      )}

      {/* Hidden file input for device upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp"
        onChange={handleDeviceUpload}
        className="hidden"
      />

      {/* Main Container */}
      {previewUrl ? (
        /* Image Preview State */
        <div className="space-y-2">
          <div className={`relative rounded-md overflow-hidden border border-slate-200 bg-slate-900/5 group shadow-sm ${getAspectClass()}`}>
            <img
              src={previewUrl}
              alt="Pratinjau Gambar"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
              onError={(e) => {
                if (typeof value === 'string') {
                  (e.target as HTMLImageElement).src = value;
                }
              }}
            />

            {/* Source Badge */}
            <div className="absolute top-2 left-2 z-10">
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold backdrop-blur-md shadow-sm text-white ${
                isFromLibrary ? 'bg-indigo-600/90' : 'bg-emerald-600/90'
              }`}>
                {isFromLibrary ? (
                  <>
                    <FolderArchive className="w-3 h-3" />
                    Media Library
                  </>
                ) : (
                  <>
                    <HardDrive className="w-3 h-3" />
                    Dari Device
                  </>
                )}
              </span>
            </div>

            {/* Hover Actions Overlay */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/95 hover:bg-white text-slate-800 rounded-md text-xs font-medium shadow-md transition-all hover:scale-105"
                title="Pilih dari Media Library"
              >
                <FolderOpen className="w-3.5 h-3.5 text-indigo-600" />
                Media Library
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/95 hover:bg-white text-slate-800 rounded-md text-xs font-medium shadow-md transition-all hover:scale-105"
                title="Unggah dari Device"
              >
                <UploadCloud className="w-3.5 h-3.5 text-emerald-600" />
                Ganti Device
              </button>

              <button
                type="button"
                onClick={handleRemove}
                className="inline-flex items-center justify-center p-1.5 bg-red-600/90 hover:bg-red-600 text-white rounded-md shadow-md transition-all hover:scale-105"
                title="Hapus gambar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 px-0.5">
            <span className="truncate">
              {value instanceof File ? value.name : typeof value === 'string' ? value : 'Gambar terpilih'}
            </span>
            <button
              type="button"
              onClick={handleRemove}
              className="text-red-500 hover:text-red-700 font-medium hover:underline shrink-0 ml-2"
            >
              Hapus Gambar
            </button>
          </div>
        </div>
      ) : (
        /* Empty Dropzone modern: Klik langsung membuka Media Library atau pilih dari device */
        <div 
          onClick={() => setIsModalOpen(true)}
          className={`border-2 border-dashed border-slate-200 hover:border-[#c20000]/60 rounded-2xl p-6 bg-slate-50/60 hover:bg-red-50/20 transition-all duration-200 flex flex-col items-center justify-center text-center cursor-pointer group shadow-2xs ${getAspectClass()}`}
        >
          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center text-slate-400 group-hover:text-[#c20000] group-hover:scale-105 transition-all mb-3">
            <ImageIcon className="w-6 h-6 stroke-[1.75]" />
          </div>

          <p className="text-xs sm:text-sm font-bold text-slate-800 mb-1 group-hover:text-[#c20000] transition-colors">
            Pilih atau Unggah Media
          </p>
          <p className="text-[11px] text-slate-400 max-w-xs mb-4">
            Klik untuk membuka Media Library atau unggah file baru langsung dari komputer Anda.
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#c20000] hover:bg-[#a30000] text-white text-xs font-bold rounded-xl shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Buka Media Library</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-slate-300 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
              <span>Dari Perangkat</span>
            </button>
          </div>
        </div>
      )}

      {description && (
        <p className="text-xs text-slate-400">
          {description}
        </p>
      )}

      {/* Modal Picker */}
      <MediaPickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleLibrarySelect}
        currentUrl={typeof value === 'string' ? value : undefined}
        title={modalTitle}
        allowedFolder={allowedFolder}
      />
    </div>
  );
}

