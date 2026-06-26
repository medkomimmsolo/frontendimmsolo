const fs = require('fs');
let content = fs.readFileSync('app/dashboard/events/[id]/page.tsx', 'utf8');

const target = `    fetchEvent();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {`;

const replacement = `    fetchEvent();
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDescriptionChange = (content: string) => {
    setFormData({ ...formData, description: content });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran gambar maksimal 2MB. Silakan pilih gambar yang lebih kecil.');
      return;
    }

    try {
      const webpFile = await convertToWebP(file);
      setBannerFile(webpFile);
      setBannerPreview(URL.createObjectURL(webpFile));
    } catch (error) {
      console.error('Failed to process image:', error);
      toast.error('Gagal memproses gambar');
    }
  };

  const removeBannerImage = () => {
    setBannerFile(null);
    setBannerPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {`;

content = content.replace(target, replacement);
fs.writeFileSync('app/dashboard/events/[id]/page.tsx', content);
console.log('Fixed');
