export interface ImageDimensions {
  width: number;
  height: number;
  ratio: number;
}

interface DecodedImage {
  source: CanvasImageSource;
  width: number;
  height: number;
  cleanup: () => void;
}

const decodeOriented = async (file: File): Promise<DecodedImage> => {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      return { source: bitmap, width: bitmap.width, height: bitmap.height, cleanup: () => bitmap.close() };
    } catch {
      /* Browser tidak mendukung opsi orientasi — fallback ke <img> */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = (error) => reject(error);
      el.src = url;
    });
    return { source: img, width: img.naturalWidth, height: img.naturalHeight, cleanup: () => URL.revokeObjectURL(url) };
  } catch (err) {
    URL.revokeObjectURL(url);
    throw err;
  }
};

export const getImageDimensions = async (file: File): Promise<ImageDimensions> => {
  const decoded = await decodeOriented(file);
  const dims: ImageDimensions = {
    width: decoded.width,
    height: decoded.height,
    ratio: decoded.width / decoded.height,
  };
  decoded.cleanup();
  return dims;
};

export const isRatioMatch = (actual: number, target: number, tolerance = 0.03): boolean =>
  target > 0 && Math.abs(actual - target) / target <= tolerance;

export const convertToWebP = async (file: File): Promise<File> => {
  const decoded = await decodeOriented(file);
  try {
    const MAX_DIMENSION = 1600;
    let width = decoded.width;
    let height = decoded.height;
    if (Math.max(width, height) > MAX_DIMENSION) {
      const scale = MAX_DIMENSION / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas context not found');
    }
    ctx.drawImage(decoded.source, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.8));
    if (!blob) {
      throw new Error('Blob conversion failed');
    }
    return new File([blob], file.name.replace(/\.[^/.]+$/, '') + '.webp', {
      type: 'image/webp',
      lastModified: Date.now(),
    });
  } finally {
    decoded.cleanup();
  }
};

import api from '@/lib/api';
import { backendOrigin } from '@/lib/env';

export const uploadInlineImage = async (file: File): Promise<string> => {
  const webpFile = await convertToWebP(file);
  const formData = new FormData();
  formData.append('file', webpFile);
  formData.append('folder', 'posts');
  const res = await api.post('/media', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const url: string = res.data.data.url;
  return resolveMediaUrl(url);
};

export const resolveMediaUrl = (url?: string | null): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${backendOrigin()}${cleanPath}`;
};
