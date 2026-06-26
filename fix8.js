const fs = require('fs');

const file = 'app/dashboard/events/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacement = `      } catch (err: any) {
        console.error(err);
        toast.error('Gagal memuat data agenda');
        router.push('/dashboard/events');
      } finally {
        setIsFetching(false);
      }
    };
    
    fetchEvent();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim() || !formData.location.trim() || !formData.event_date) {`;

content = content.replace(/\s*\}\s*catch\s*\(err:\s*any\)\s*\{\s*console\.error\(err\);\s*toast\.error\('Gagal memuat data agenda'\);\s*if\s*\(!formData\.title\.trim\(\)\s*\|\|\s*!formData\.description\.trim\(\)\s*\|\|\s*!formData\.location\.trim\(\)\s*\|\|\s*!formData\.event_date\)\s*\{/g, replacement);

fs.writeFileSync(file, content);
console.log('Fixed fix8');
