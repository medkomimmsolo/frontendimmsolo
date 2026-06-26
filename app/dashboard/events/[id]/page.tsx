'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { ArrowLeft, Save, Loader2, CalendarDays, MapPin, Link as LinkIcon, Image as ImageIcon, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { convertToWebP } from '@/lib/imageUtils';

// Import React Quill dynamically to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

export default function EditEvent({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    event_date: '',
    registration_link: '',
    status: 'upcoming',
  });

  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
  }), []);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await api.get(`/events/${id}`);
        const eventData = response.data.data;
        
        // Convert Laravel timestamp to datetime-local format
        const dateObj = new Date(eventData.event_date);
        const formattedDate = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000)
          .toISOString().slice(0, 16);
        
        setFormData({
          title: eventData.title,
          description: eventData.description,
          location: eventData.location,
          event_date: formattedDate,
          registration_link: eventData.registration_link || '',
          status: eventData.status,
  });

        if (eventData.banner_image) {
          // ensure full URL if local
          const imageUrl = eventData.banner_image.startsWith('http') 
            ? eventData.banner_image 
            : `${process.env.NEXT_PUBLIC_API_URL || ''}${eventData.banner_image}`;
          setBannerPreview(imageUrl);
        }      } catch (err: any) {
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


    try {
      const webpFile = await convertToWebP(file);

      if (webpFile.size > 2 * 1024 * 1024) {
        toast.error('Setelah dikonversi, ukuran gambar masih lebih dari 2MB. Silakan pilih gambar dengan resolusi lebih kecil.');
        return;
      }
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
    
    if (!formData.title.trim() || !formData.description.trim() || !formData.location.trim() || !formData.event_date) {
      toast.error('Judul, Deskripsi, Lokasi, dan Tanggal wajib diisi!');
      return;
    }

    setIsLoading(true);
    
    const submitData = new FormData();
    // Using PUT method spoofing for Laravel FormData
    submitData.append('_method', 'PUT');
    submitData.append('title', formData.title);
    submitData.append('description', formData.description);
    submitData.append('location', formData.location);
    submitData.append('status', formData.status);
    
    if (formData.registration_link) {
      submitData.append('registration_link', formData.registration_link);
    }
    
    // Format date properly
    if (formData.event_date) {
      const formattedDate = new Date(formData.event_date).toISOString().slice(0, 19).replace('T', ' ');
      submitData.append('event_date', formattedDate);
    }

    if (bannerFile) {
      submitData.append('banner_image', bannerFile);
    }
    
    try {
      await api.post(`/events/${id}`, submitData);
      toast.success('Agenda berhasil diperbarui!');
      router.push('/dashboard/events');
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Gagal menyimpan perubahan');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mr-3 text-[#c20000]" />
        Memuat data agenda...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/events">
            <Button variant="outline" size="sm" type="button" className="h-9 w-9 p-0 rounded-md border-slate-200">
              <ArrowLeft className="w-4 h-4 text-slate-600" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-[#0f172a]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
            Edit Agenda
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Main Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Title Input */}
          <div className="bg-white border border-slate-200 rounded-md shadow-sm p-4">
            <input 
              type="text" 
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Add title" 
              className="w-full text-2xl font-semibold bg-transparent border-none placeholder-slate-300 focus:outline-none focus:ring-0 text-[#0f172a]"
            />
          </div>

          {/* Description Editor */}
          <div className="bg-white border border-slate-200 rounded-md shadow-sm">
            <div className="p-3 border-b border-slate-200 bg-slate-50 font-medium text-sm text-slate-700">
              Event Details & Description
            </div>
            <div className="p-0">
              <ReactQuill 
                theme="snow" 
                value={formData.description} 
                onChange={handleDescriptionChange} 
                modules={modules}
                className="h-[350px] border-none [&_.ql-toolbar]:border-none [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-slate-200 [&_.ql-container]:border-none [&_.ql-editor]:min-h-[300px] [&_.ql-editor]:text-[15px]"
                placeholder="Write the event description here..."
              />
            </div>
          </div>
          
          {/* Location & Link Info */}
          <div className="bg-white border border-slate-200 rounded-md shadow-sm">
            <div className="p-3 border-b border-slate-200 bg-slate-50 font-medium text-sm text-slate-700">
              Event Information
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" /> Location / Venue
                </label>
                <input 
                  type="text" 
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Gedung Dakwah Muhammadiyah Surakarta" 
                  className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-slate-400" /> Registration Link (Optional)
                </label>
                <input 
                  type="url" 
                  name="registration_link"
                  value={formData.registration_link}
                  onChange={handleChange}
                  placeholder="https://forms.gle/..." 
                  className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000]"
                />
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Sidebar */}
        <div className="space-y-6">
          
          {/* Publish Card */}
          <Card className="border-slate-200 shadow-sm">
            <div className="p-3 border-b border-slate-200 bg-slate-50 font-medium text-sm text-slate-700">
              Publish
            </div>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-2">
                  Status: 
                  <select 
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="font-medium text-slate-700 bg-transparent border-none focus:ring-0 cursor-pointer p-0"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </span>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-slate-400" /> Event Date & Time
                </label>
                <input 
                  type="datetime-local" 
                  name="event_date"
                  value={formData.event_date}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000]"
                />
              </div>

            </CardContent>
            <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <Link href="/dashboard/events" className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors">
                Cancel
              </Link>
              <Button type="submit" disabled={isLoading} className="bg-[#c20000] hover:bg-[#a00000] text-white rounded-md px-5 h-9 shadow-sm">
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Update
              </Button>
            </div>
          </Card>

          {/* Banner Image Card */}
          <Card className="border-slate-200 shadow-sm">
            <div className="p-3 border-b border-slate-200 bg-slate-50 font-medium text-sm text-slate-700">
              Event Banner
            </div>
            <CardContent className="p-4">
              {bannerPreview ? (
                <div className="relative group rounded-md overflow-hidden border border-slate-200">
                  <img src={bannerPreview} alt="Banner Preview" className="w-full h-auto object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      type="button"
                      onClick={removeBannerImage}
                      className="bg-white text-red-600 rounded-full p-2 hover:bg-red-50 transition-colors shadow-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 rounded-md p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 hover:border-[#c20000] transition-colors group"
                >
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-[#c20000]/10 transition-colors">
                    <ImageIcon className="w-5 h-5 text-slate-400 group-hover:text-[#c20000]" />
                  </div>
                  <p className="text-sm font-medium text-[#c20000]">Click to upload banner</p>
                  <p className="text-xs text-slate-500 mt-1">Recommended size: 1200x630px</p>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
            </CardContent>
          </Card>

        </div>
      </div>
    </form>
  );
}

