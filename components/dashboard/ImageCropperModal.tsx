'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Crop, 
  Check, 
  X, 
  RotateCcw, 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  Move,
  Sparkles,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getUserFacingErrorMessage } from '@/lib/errorMessage';

export interface ImageCropperModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  onClose: () => void;
  onCropComplete: (file: File, previewUrl: string) => void;
  initialAspectRatio?: number | null; // e.g. 4/1, 16/9, 21/9, or null for free
  title?: string;
}

type AspectRatioOption = {
  id: string;
  label: string;
  ratio: number | null; // null for free/unconstrained
};

const ASPECT_OPTIONS: AspectRatioOption[] = [
  { id: '4:1', label: 'Banner Google Forms (4:1)', ratio: 4 / 1 },
  { id: '21:9', label: 'Banner Sedang (21:9)', ratio: 21 / 9 },
  { id: '16:9', label: 'Standar Lebar (16:9)', ratio: 16 / 9 },
  { id: '1:1', label: 'Kotak (1:1)', ratio: 1 },
  { id: '3:4', label: 'Portrait (3:4)', ratio: 3 / 4 },
  { id: 'free', label: 'Bebas / Utuh (Full)', ratio: null },
];

export default function ImageCropperModal({
  isOpen,
  imageUrl,
  onClose,
  onCropComplete,
  initialAspectRatio = 4 / 1,
  title = 'Sesuaikan & Potong Banner Header (Crop)',
}: ImageCropperModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [aspectRatio, setAspectRatio] = useState<number | null>(initialAspectRatio);
  const [zoom, setZoom] = useState<number>(1);
  const [isImgLoaded, setIsImgLoaded] = useState(false);

  // Crop box in displayed pixel coordinates
  const [crop, setCrop] = useState<{ x: number; y: number; width: number; height: number }>({
    x: 0,
    y: 0,
    width: 100,
    height: 50,
  });

  // Dragging state
  const dragRef = useRef<{
    type: 'move' | 'nw' | 'ne' | 'se' | 'sw' | 'n' | 's' | 'e' | 'w' | null;
    startX: number;
    startY: number;
    startCrop: { x: number; y: number; width: number; height: number };
  }>({
    type: null,
    startX: 0,
    startY: 0,
    startCrop: { x: 0, y: 0, width: 0, height: 0 },
  });

  // Calculate default crop box when image loads or aspect ratio changes
  const initCropBox = useCallback((ratio: number | null) => {
    if (!imgRef.current) return;
    const imgW = imgRef.current.clientWidth;
    const imgH = imgRef.current.clientHeight;
    if (imgW === 0 || imgH === 0) return;

    if (ratio === null) {
      // Bebas / Utuh: seleksi awal mencakup 100% luas gambar tanpa terpotong
      setCrop({
        x: 0,
        y: 0,
        width: Math.round(imgW),
        height: Math.round(imgH),
      });
      return;
    }

    // Rasio terkunci: kotak crop seluas mungkin (100%) di dalam gambar.
    // Ketika rasio gambar sama dengan rasio target, kotak = gambar utuh (tanpa terpotong sama sekali).
    let targetW = imgW;
    let targetH = targetW / ratio;

    if (targetH > imgH) {
      targetH = imgH;
      targetW = targetH * ratio;
    }

    const x = Math.max(0, (imgW - targetW) / 2);
    const y = Math.max(0, (imgH - targetH) / 2);

    setCrop({
      x: Math.round(x),
      y: Math.round(y),
      width: Math.round(targetW),
      height: Math.round(targetH),
    });
  }, []);

  useEffect(() => {
    if (isOpen) {
      setAspectRatio(initialAspectRatio);
      setZoom(1);
    }
  }, [isOpen, initialAspectRatio]);

  useEffect(() => {
    if (isOpen && isImgLoaded) {
      initCropBox(aspectRatio);
    }
  }, [isOpen, isImgLoaded, aspectRatio, initCropBox]);

  // Pointer event handlers for moving and resizing crop box
  const handlePointerDown = (
    e: React.PointerEvent,
    type: 'move' | 'nw' | 'ne' | 'se' | 'sw' | 'n' | 's' | 'e' | 'w'
  ) => {
    e.stopPropagation();
    e.preventDefault();

    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    dragRef.current = {
      type,
      startX: e.clientX,
      startY: e.clientY,
      startCrop: { ...crop },
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.type || !imgRef.current) return;
    e.preventDefault();

    const imgW = imgRef.current.clientWidth;
    const imgH = imgRef.current.clientHeight;

    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    const { startCrop, type } = dragRef.current;

    const minSize = 40;

    if (type === 'move') {
      const newX = Math.max(0, Math.min(imgW - startCrop.width, startCrop.x + dx));
      const newY = Math.max(0, Math.min(imgH - startCrop.height, startCrop.y + dy));
      setCrop((prev) => ({ ...prev, x: Math.round(newX), y: Math.round(newY) }));
      return;
    }

    let newX = startCrop.x;
    let newY = startCrop.y;
    let newW = startCrop.width;
    let newH = startCrop.height;

    // Resizing handles
    if (type.includes('e')) {
      newW = Math.max(minSize, Math.min(imgW - startCrop.x, startCrop.width + dx));
    }
    if (type.includes('s')) {
      newH = Math.max(minSize, Math.min(imgH - startCrop.y, startCrop.height + dy));
    }
    if (type.includes('w')) {
      const maxW = startCrop.x + startCrop.width;
      const proposedW = startCrop.width - dx;
      if (proposedW >= minSize && startCrop.x + dx >= 0) {
        newX = startCrop.x + dx;
        newW = proposedW;
      } else if (startCrop.x + dx < 0) {
        newX = 0;
        newW = maxW;
      }
    }
    if (type.includes('n')) {
      const maxH = startCrop.y + startCrop.height;
      const proposedH = startCrop.height - dy;
      if (proposedH >= minSize && startCrop.y + dy >= 0) {
        newY = startCrop.y + dy;
        newH = proposedH;
      } else if (startCrop.y + dy < 0) {
        newY = 0;
        newH = maxH;
      }
    }

    // Apply aspect ratio lock if active
    if (aspectRatio) {
      if (type === 'e' || type === 'w' || type === 'se' || type === 'sw') {
        newH = newW / aspectRatio;
        if (newY + newH > imgH) {
          newH = imgH - newY;
          newW = newH * aspectRatio;
        }
      } else if (type === 'n' || type === 's' || type === 'ne' || type === 'nw') {
        newW = newH * aspectRatio;
        if (newX + newW > imgW) {
          newW = imgW - newX;
          newH = newW / aspectRatio;
        }
      }
    }

    // Final boundary clamp
    newX = Math.max(0, Math.min(imgW - minSize, newX));
    newY = Math.max(0, Math.min(imgH - minSize, newY));
    newW = Math.max(minSize, Math.min(imgW - newX, newW));
    newH = Math.max(minSize, Math.min(imgH - newY, newH));

    setCrop({
      x: Math.round(newX),
      y: Math.round(newY),
      width: Math.round(newW),
      height: Math.round(newH),
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragRef.current.type) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      dragRef.current.type = null;
    }
  };

  // Perform the actual crop on high-resolution canvas
  const handleApplyCrop = () => {
    if (!imgRef.current) return;
    const img = imgRef.current;

    const naturalW = img.naturalWidth;
    const naturalH = img.naturalHeight;
    const clientW = img.clientWidth;
    const clientH = img.clientHeight;

    if (!naturalW || !naturalH || !clientW || !clientH) {
      toast.error('Gambar belum siap diproses.');
      return;
    }

    const scaleX = naturalW / clientW;
    const scaleY = naturalH / clientH;

    const sourceX = Math.max(0, Math.round(crop.x * scaleX));
    const sourceY = Math.max(0, Math.round(crop.y * scaleY));
    const sourceW = Math.min(naturalW - sourceX, Math.round(crop.width * scaleX));
    const sourceH = Math.min(naturalH - sourceY, Math.round(crop.height * scaleY));

    if (sourceW <= 0 || sourceH <= 0) {
      toast.error('Ukuran area potong tidak valid.');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = sourceW;
    canvas.height = sourceH;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      toast.error('Gagal membuat canvas gambar.');
      return;
    }

    try {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, sourceX, sourceY, sourceW, sourceH, 0, 0, sourceW, sourceH);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            toast.error('Gagal mengekspor hasil crop.');
            return;
          }

          const file = new File([blob], `banner-crop-${Date.now()}.webp`, {
            type: 'image/webp',
          });
          const previewUrl = URL.createObjectURL(blob);

          onCropComplete(file, previewUrl);
          toast.success('Potongan banner berhasil diterapkan!');
          onClose();
        },
        'image/webp',
        0.92
      );
    } catch (err) {
      console.error('Error cropping image:', err);
      toast.error(getUserFacingErrorMessage(err, 'Gagal memproses crop gambar (kemungkinan CORS).'));
    }
  };

  if (!isOpen || !imageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 text-[#ff4d4d] flex items-center justify-center">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                {title}
              </h2>
              <p className="text-[11px] text-slate-400">
                Resolusi bebas — cukup sesuaikan rasio potongan. Ketika rasio sudah pas, gambar utuh tanpa terpotong.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Aspect Ratio & Controls */}
        <div className="px-5 py-2.5 border-b border-slate-800 bg-slate-950/50 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
              <Maximize2 className="w-3 h-3 text-red-400" /> Rasio:
            </span>
            {ASPECT_OPTIONS.map((opt) => {
              const isSelected =
                (aspectRatio === null && opt.ratio === null) ||
                (aspectRatio !== null && opt.ratio !== null && Math.abs(aspectRatio - opt.ratio) < 0.05);

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setAspectRatio(opt.ratio);
                    initCropBox(opt.ratio);
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    isSelected
                      ? 'bg-[#c20000] text-white shadow-xs font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => initCropBox(aspectRatio)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
              title="Reset ke ukuran default"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>
        </div>

        {/* Workspace Canvas & Drag Overlay */}
        <div 
          ref={containerRef}
          className="relative flex-1 bg-slate-950 flex items-center justify-center p-4 overflow-hidden select-none min-h-[320px] max-h-[60vh]"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* Main Target Image */}
          <div className="relative inline-block max-w-full max-h-full">
            <img
              ref={imgRef}
              src={
                imageUrl
                  ? imageUrl.startsWith('blob:') || imageUrl.startsWith('data:')
                    ? imageUrl
                    : `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`
                  : ''
              }
              crossOrigin="anonymous"
              alt="Gambar untuk dipotong"
              onLoad={() => {
                setIsImgLoaded(true);
                initCropBox(aspectRatio);
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src.includes('/api/proxy-image') && imageUrl) {
                  target.removeAttribute('crossorigin');
                  target.src = imageUrl;
                }
              }}
              className="max-h-[55vh] max-w-full object-contain block pointer-events-none rounded-sm"
            />

            {/* Dark Mask Surrounding the Crop Window */}
            {isImgLoaded && (
              <>
                {/* Top Dim */}
                <div 
                  className="absolute left-0 right-0 top-0 bg-black/65 pointer-events-none" 
                  style={{ height: `${crop.y}px` }} 
                />
                {/* Bottom Dim */}
                <div 
                  className="absolute left-0 right-0 bottom-0 bg-black/65 pointer-events-none" 
                  style={{ top: `${crop.y + crop.height}px` }} 
                />
                {/* Left Dim */}
                <div 
                  className="absolute left-0 bg-black/65 pointer-events-none" 
                  style={{ top: `${crop.y}px`, height: `${crop.height}px`, width: `${crop.x}px` }} 
                />
                {/* Right Dim */}
                <div 
                  className="absolute right-0 bg-black/65 pointer-events-none" 
                  style={{ top: `${crop.y}px`, height: `${crop.height}px`, left: `${crop.x + crop.width}px` }} 
                />

                {/* Interactive Crop Window */}
                <div
                  className="absolute border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.5),0_0_20px_rgba(0,0,0,0.5)] cursor-move group/crop"
                  style={{
                    left: `${crop.x}px`,
                    top: `${crop.y}px`,
                    width: `${crop.width}px`,
                    height: `${crop.height}px`,
                  }}
                  onPointerDown={(e) => handlePointerDown(e, 'move')}
                >
                  {/* Rule of Thirds Grid Lines */}
                  <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-40 group-hover/crop:opacity-75 transition-opacity">
                    <div className="border-r border-b border-white/40" />
                    <div className="border-r border-b border-white/40" />
                    <div className="border-b border-white/40" />
                    <div className="border-r border-b border-white/40" />
                    <div className="border-r border-b border-white/40" />
                    <div className="border-b border-white/40" />
                    <div className="border-r border-white/40" />
                    <div className="border-r border-white/40" />
                    <div />
                  </div>

                  {/* Center Drag Icon Indicator */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover/crop:opacity-70 transition-opacity">
                    <div className="p-1.5 rounded-full bg-slate-900/60 text-white backdrop-blur-xs">
                      <Move className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Corner Resize Handles */}
                  <div
                    onPointerDown={(e) => handlePointerDown(e, 'nw')}
                    className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-[#c20000] rounded-full cursor-nwse-resize shadow-md hover:scale-125 transition-transform"
                    title="Tarik sudut kiri atas"
                  />
                  <div
                    onPointerDown={(e) => handlePointerDown(e, 'ne')}
                    className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-[#c20000] rounded-full cursor-nesw-resize shadow-md hover:scale-125 transition-transform"
                    title="Tarik sudut kanan atas"
                  />
                  <div
                    onPointerDown={(e) => handlePointerDown(e, 'sw')}
                    className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-[#c20000] rounded-full cursor-nesw-resize shadow-md hover:scale-125 transition-transform"
                    title="Tarik sudut kiri bawah"
                  />
                  <div
                    onPointerDown={(e) => handlePointerDown(e, 'se')}
                    className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-[#c20000] rounded-full cursor-nwse-resize shadow-md hover:scale-125 transition-transform"
                    title="Tarik sudut kanan bawah"
                  />

                  {/* Side Edge Resize Handles */}
                  <div
                    onPointerDown={(e) => handlePointerDown(e, 'n')}
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-2.5 bg-white border border-[#c20000] rounded-xs cursor-ns-resize shadow hover:bg-red-50"
                  />
                  <div
                    onPointerDown={(e) => handlePointerDown(e, 's')}
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-2.5 bg-white border border-[#c20000] rounded-xs cursor-ns-resize shadow hover:bg-red-50"
                  />
                  <div
                    onPointerDown={(e) => handlePointerDown(e, 'w')}
                    className="absolute -left-1.5 top-1/2 -translate-y-1/2 h-8 w-2.5 bg-white border border-[#c20000] rounded-xs cursor-ew-resize shadow hover:bg-red-50"
                  />
                  <div
                    onPointerDown={(e) => handlePointerDown(e, 'e')}
                    className="absolute -right-1.5 top-1/2 -translate-y-1/2 h-8 w-2.5 bg-white border border-[#c20000] rounded-xs cursor-ew-resize shadow hover:bg-red-50"
                  />

                  {/* Live Dimensions Pill */}
                  <div className="absolute bottom-2 left-2 pointer-events-none">
                    <span className="px-2 py-0.5 rounded-sm bg-black/80 text-[10px] font-mono text-white/90 backdrop-blur-xs">
                      {crop.width} × {crop.height} px
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer Info & Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
            <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>Geser kotak untuk memposisikan atau tarik sudutnya untuk mengubah ukuran crop.</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleApplyCrop}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#c20000] hover:bg-[#a30000] shadow-md shadow-red-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Check className="w-4 h-4" /> Terapkan Hasil Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

