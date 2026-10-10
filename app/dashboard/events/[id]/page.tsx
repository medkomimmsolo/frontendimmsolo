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
import ImageUploadPicker from '@/components/dashboard/ImageUploadPicker';

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

  const [bannerImage, setBannerImage] = useState<File | string | null>(null);

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
          setBannerImage(eventData.banner_image);
        }
      } catch (err: any) {
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

    if (bannerImage) {
      submitData.append('banner_image', bannerImage);
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
            <Button variant="outline" size="sm" type="button" className="h-9 w-9 p-0 rounded-sm border-slate-200">
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
          <div className="bg-white border border-slate-200 rounded-sm shadow-sm p-4">
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
          <div className="bg-white border border-slate-200 rounded-sm shadow-sm">
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
          <div className="bg-white border border-slate-200 rounded-sm shadow-sm">
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
                  className="w-full bg-white border border-slate-200 rounded-sm px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000]"
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
                  className="w-full bg-white border border-slate-200 rounded-sm px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000]"
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
                  className="w-full bg-white border border-slate-200 rounded-sm px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000]"
                />
              </div>

            </CardContent>
            <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <Button type="button" variant="outline" onClick={() => router.push('/dashboard/events')} className="rounded-sm text-sm border-slate-200 hover:text-[#c20000]">
                Batal
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-[#c20000] hover:bg-[#a30000] text-white rounded-sm px-5 shadow-sm">
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Perbarui
              </Button>
            </div>
          </Card>

          {/* Banner Image Card */}
          <Card className="border-slate-200 shadow-sm">
            <div className="p-3 border-b border-slate-200 bg-slate-50 font-medium text-sm text-slate-700">
              Banner Agenda (Event Banner)
            </div>
            <CardContent className="p-4">
              <ImageUploadPicker
                value={bannerImage}
                onChange={(val) => setBannerImage(val)}
                aspectRatio="banner"
                allowedFolder="events"
                description="Pilih dari Media Library atau unggah dari perangkat. Rasio disarankan: 21:9 atau 1200x630px."
              />
            </CardContent>
          </Card>

        </div>
      </div>
    </form>
  );
}

