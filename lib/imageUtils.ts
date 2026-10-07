export const convertToWebP = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const MAX_DIMENSION = 1600;
        let width = img.width;
        let height = img.height;
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
          reject(new Error('Canvas context not found'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Blob conversion failed'));
              return;
            }
            const webpFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            resolve(webpFile);
          },
          'image/webp',
          0.8 // 80% quality
        );
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

import api from '@/lib/api';

export const uploadInlineImage = async (file: File): Promise<string> => {
  const webpFile = await convertToWebP(file);
  const formData = new FormData();
  formData.append('file', webpFile);
  formData.append('folder', 'posts');
  const res = await api.post('/media', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
  const url: string = res.data.data.url;
  return url.startsWith('http') ? url : `${backendUrl}${url}`;
};
