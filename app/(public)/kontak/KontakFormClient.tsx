'use client';

import { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/Button';
import { MessageSquare, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getApiBase } from '@/lib/settings';

export default function KontakFormClient() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const base = getApiBase();
      await axios.post(`${base}/contact`, formData);
      setIsSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      const errs = err.response?.data?.errors;
      toast.error(errs ? Object.values(errs).flat().join(', ') : err.response?.data?.message || 'Gagal mengirim pesan');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-sm border border-slate-200 focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] transition-colors";

  if (isSuccess) {
    return (
      <div className="text-center py-10">
        <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-[#0f172a] mb-2">Pesan Terkirim</h3>
        <p className="text-sm text-slate-500 mb-6">Terima kasih! Pesan Anda sudah kami terima dan akan segera ditindaklanjuti.</p>
        <Button onClick={() => setIsSuccess(false)} variant="outline" className="border-slate-200">
          Kirim Pesan Lain
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="kontak-name" className="text-sm font-semibold text-[#0f172a]">Nama Lengkap</label>
          <input id="kontak-name" type="text" name="name" autoComplete="name" required value={formData.name} onChange={handleChange} placeholder="Masukkan nama..." className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="kontak-email" className="text-sm font-semibold text-[#0f172a]">Email</label>
          <input id="kontak-email" type="email" name="email" autoComplete="email" required value={formData.email} onChange={handleChange} placeholder="contoh@email.com" className={inputClass} />
        </div>
      </div>
      <div className="space-y-1.5">
        <label htmlFor="kontak-subject" className="text-sm font-semibold text-[#0f172a]">Subjek</label>
        <input id="kontak-subject" type="text" name="subject" required value={formData.subject} onChange={handleChange} placeholder="Hal yang ingin didiskusikan" className={inputClass} />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="kontak-message" className="text-sm font-semibold text-[#0f172a]">Pesan</label>
        <textarea id="kontak-message" name="message" required rows={5} value={formData.message} onChange={handleChange} placeholder="Tuliskan pesan Anda di sini..." className={`${inputClass} resize-none`}></textarea>
      </div>
      <Button type="submit" disabled={isLoading} className="w-full bg-[#c20000] hover:bg-[#a30000] text-white h-12 rounded-sm font-semibold text-base mt-4 shadow-md shadow-red-500/20">
        {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <MessageSquare className="w-5 h-5 mr-2" />}
        Kirim Pesan
      </Button>
    </form>
  );
}
