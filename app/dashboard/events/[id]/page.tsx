'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Save, Loader2, CalendarDays, MapPin, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { getUserFacingErrorMessage } from '@/lib/errorMessage';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import ImageUploadPicker from '@/components/dashboard/ImageUploadPicker';
import { PageHeader } from '@/components/ui/PageHeader';

// Import React Quill dynamically to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

const inputClass = "w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[#0f172a] focus:outline-none focus:border-[#c20000] focus:ring-2 focus:ring-[#c20000]/20 transition-all text-sm shadow-2xs";
const labelClass = "block text-xs font-bold text-slate-700 uppercase tracking-wider";
const helperClass = "text-xs text-slate-500 leading-relaxed";

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
        const response = await api.get(`/events/${id}/edit`);
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
        toast.error(getUserFacingErrorMessage(err, 'Gagal memuat data agenda'));
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
    <form onSubmit={handleSubmit} className="w-full space-y-6">

      {/* Page Header dengan Aksi */}
      <PageHeader
        title="Edit Agenda"
        description="Perbarui detail agenda kegiatan organisasi"
        badge="Agenda"
      >
        <Link href="/dashboard/events">
          <Button type="button" variant="outline" size="sm" className="h-10 px-4 rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs">
            Batal
          </Button>
        </Link>
        <Button type="submit" disabled={isLoading} className="h-10 px-5 bg-[#c20000] hover:bg-[#a30000] text-white rounded-xl text-xs font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]">
          {isLoading ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
          {isLoading ? 'Menyimpan...' : 'Perbarui Agenda'}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* ─────────────── KIRI: Konten Utama ─────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Judul & Deskripsi */}
          <Card className="border border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden bg-white">
            <div className="bg-slate-50/70 px-6 py-4 border-b border-slate-200/80">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Judul &amp; Deskripsi Agenda</h3>
            </div>
            <CardContent className="p-0">
              <div className="p-6 sm:p-7 space-y-5">
                <div className="space-y-1.5">
                  <label className={labelClass}>Judul Agenda <span className="text-[#c20000]">*</span></label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Tulis judul agenda..."
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={labelClass}>Deskripsi <span className="text-[#c20000]">*</span></label>
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <ReactQuill
                      theme="snow"
                      value={formData.description}
                      onChange={handleDescriptionChange}
                      modules={modules}
                      className="border-none [&_.ql-toolbar]:border-none [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-slate-200 [&_.ql-container]:border-none [&_.ql-editor]:min-h-[280px] [&_.ql-editor]:text-sm"
                      placeholder="Tulis deskripsi agenda di sini..."
                    />
                  </div>
                  <p className={helperClass}>Gunakan toolbar untuk format teks, tautan, dan gambar.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detail Agenda */}
          <Card className="border border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden bg-white">
            <div className="bg-slate-50/70 px-6 py-4 border-b border-slate-200/80">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Detail Agenda</h3>
            </div>
            <CardContent className="p-6 sm:p-7 space-y-5">
              <div className="space-y-1.5">
                <label className={`${labelClass} flex items-center gap-2`}>
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> Lokasi / Tempat <span className="text-[#c20000]">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="cth. Gedung Dakwah Muhammadiyah Surakarta"
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <label className={`${labelClass} flex items-center gap-2`}>
                  <LinkIcon className="w-3.5 h-3.5 text-slate-400" /> Tautan Pendaftaran <span className="text-slate-400 font-semibold normal-case tracking-normal">(opsional)</span>
                </label>
                <input
                  type="url"
                  name="registration_link"
                  value={formData.registration_link}
                  onChange={handleChange}
                  placeholder="https://forms.gle/..."
                  className={inputClass}
                />
              </div>
            </CardContent>
          </Card>

        </div>

        {/* ─────────────── KANAN: Sidebar Meta ─────────────── */}
        <div className="space-y-6">

          {/* Publikasi */}
          <Card className="border border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden bg-white">
            <div className="bg-slate-50/70 px-5 py-4 border-b border-slate-200/80">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Publikasi</h3>
            </div>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className={labelClass}>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="upcoming">Akan Datang</option>
                  <option value="ongoing">Berlangsung</option>
                  <option value="completed">Selesai</option>
                  <option value="cancelled">Dibatalkan</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className={`${labelClass} flex items-center gap-2`}>
                  <CalendarDays className="w-3.5 h-3.5 text-slate-400" /> Tanggal &amp; Waktu <span className="text-[#c20000]">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="event_date"
                  required
                  value={formData.event_date}
                  onChange={handleChange}
                  className={inputClass}
                />
                <p className={helperClass}>Waktu agenda ditampilkan pada halaman publik.</p>
              </div>
            </CardContent>
          </Card>

          {/* Banner Agenda */}
          <Card className="border border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden bg-white">
            <div className="bg-slate-50/70 px-5 py-4 border-b border-slate-200/80">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Banner Agenda</h3>
            </div>
            <CardContent className="p-5">
              <ImageUploadPicker
                value={bannerImage}
                onChange={(val) => setBannerImage(val)}
                aspectRatio="banner"
                allowedFolder="events"
                description="Pilih dari Media Library atau unggah dari perangkat. Resolusi bebas — yang dinilai hanya rasio banner 4:1; rasio pas tidak akan terpotong."
              />
            </CardContent>
          </Card>

        </div>
      </div>
    </form>
  );
}
