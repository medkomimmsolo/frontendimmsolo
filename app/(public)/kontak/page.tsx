import { Metadata } from 'next';
import { Mail, MapPin, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Kontak',
  description: 'Hubungi Pimpinan Cabang Ikatan Mahasiswa Muhammadiyah Kota Surakarta.',
};

import { checkMaintenance } from '@/lib/maintenance';
import MaintenancePage from '@/components/ui/MaintenancePage';

export default async function KontakPage() {
  if (await checkMaintenance('maintenance_kontak')) return <MaintenancePage />;
  return (
    <main className="min-h-screen bg-[#f8f9fa] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-3xl md:text-5xl font-bold text-[#0f172a] mb-6" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
            Hubungi Kami
          </h1>
          <p className="text-[#0f172a]/70 text-lg leading-relaxed">
            Punya pertanyaan, saran, atau ingin berkolaborasi? Jangan ragu untuk menghubungi PC IMM Kota Surakarta melalui form di bawah atau via kontak langsung kami.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Contact Info */}
          <div>
            <h3 className="text-2xl font-bold text-[#0f172a] mb-6" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
              Informasi Kontak
            </h3>
            <div className="space-y-6 mb-10">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-[#c20000]/10 rounded-full flex items-center justify-center text-[#c20000] mr-4 shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-[#0f172a] mb-1">Sekretariat</h4>
                  <p className="text-[#0f172a]/70 leading-relaxed">
                    Gedung Dakwah Balai Muhammadiyah<br />
                    Jl. Teuku Umar No.5, Keprabon<br />
                    Surakarta
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-12 h-12 bg-[#c20000]/10 rounded-full flex items-center justify-center text-[#c20000] mr-4 shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-[#0f172a] mb-1">Email</h4>
                  <a href="mailto:medkomcabangsolo@gmail.com" className="text-[#c20000] hover:underline font-medium">
                    medkomcabangsolo@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-12 h-12 bg-[#c20000]/10 rounded-full flex items-center justify-center text-[#c20000] mr-4 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-[#0f172a] mb-1">Instagram</h4>
                  <a href="https://instagram.com/immsolo" target="_blank" rel="noreferrer" className="text-[#c20000] hover:underline font-medium">
                    @immsolo
                  </a>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="w-full h-64 bg-slate-200 rounded-md overflow-hidden relative shadow-sm border border-slate-100">
               <iframe 
                 src="https://maps.google.com/maps?q=Gedung%20Dakwah%20Balai%20Muhammadiyah,%20Jl.%20Teuku%20Umar%20No.5,%20Keprabon,%20Surakarta&t=&z=16&ie=UTF8&iwloc=&output=embed" 
                 width="100%" 
                 height="100%" 
                 style={{ border: 0 }} 
                 allowFullScreen 
                 loading="lazy" 
                 referrerPolicy="no-referrer-when-downgrade"
                 className="absolute inset-0"
               />
            </div>
          </div>

          {/* Form */}
          <div>
            <Card className="shadow-xl shadow-[#0f172a]/5 border-none">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-[#0f172a] mb-6" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
                  Kirim Pesan
                </h3>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-[#0f172a]">Nama Lengkap</label>
                      <input type="text" placeholder="Masukkan nama..." className="w-full px-4 py-3 rounded-sm border border-slate-200 focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] transition-colors" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-[#0f172a]">Email</label>
                      <input type="email" placeholder="contoh@email.com" className="w-full px-4 py-3 rounded-sm border border-slate-200 focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] transition-colors" />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[#0f172a]">Subjek</label>
                    <input type="text" placeholder="Hal yang ingin didiskusikan" className="w-full px-4 py-3 rounded-sm border border-slate-200 focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] transition-colors" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[#0f172a]">Pesan</label>
                    <textarea rows={5} placeholder="Tuliskan pesan Anda di sini..." className="w-full px-4 py-3 rounded-sm border border-slate-200 focus:outline-none focus:border-[#c20000] focus:ring-1 focus:ring-[#c20000] transition-colors resize-none"></textarea>
                  </div>

                  <Button type="button" className="w-full bg-[#c20000] hover:bg-[#a30000] text-white py-6 rounded-sm font-semibold text-base mt-4 shadow-md shadow-red-500/20">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Kirim Pesan
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
