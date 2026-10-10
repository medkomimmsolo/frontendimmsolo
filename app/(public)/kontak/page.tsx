import { Metadata } from "next";
import { Mail, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import KontakFormClient from "./KontakFormClient";

export const metadata: Metadata = {
  title: "Kontak",
  description:
    "Hubungi Pimpinan Cabang Ikatan Mahasiswa Muhammadiyah Kota Surakarta.",
  alternates: {
    canonical: "https://immsolo.or.id/kontak",
  },
  openGraph: {
    title: "Kontak | PC IMM Kota Surakarta",
    description: "Hubungi Pimpinan Cabang Ikatan Mahasiswa Muhammadiyah Kota Surakarta.",
    url: "https://immsolo.or.id/kontak",
    type: "website",
  },
};

import { checkMaintenance } from "@/lib/maintenance";
import MaintenancePage from "@/components/ui/MaintenancePage";

export default async function KontakPage() {
  if (await checkMaintenance("maintenance_kontak")) return <MaintenancePage />;
  return (
    <main className="min-h-screen bg-slate-50/70 pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div data-aos="fade-up" className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-[#c20000] border border-red-100 text-xs font-bold uppercase tracking-wider mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c20000]"></span>
            Hubungi Kami
          </div>
          <div data-aos="fade-up" data-aos-delay="50">
            <h1
              className="text-3xl md:text-5xl font-extrabold text-[#0f172a] mb-5 tracking-tight"
              style={{ fontFamily: "var(--font-poppins), sans-serif" }}
            >
              Layanan & Komunikasi
            </h1>
          </div>
          <div data-aos="fade-up" data-aos-delay="100">
            <p className="text-slate-500 text-base md:text-lg leading-relaxed font-normal">
              Punya pertanyaan seputar organisasi, pendaftaran kader, saran, atau peluang kolaborasi? Silakan hubungi kami melalui formulir atau kontak resmi di bawah.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Contact Info */}
          <div data-aos="fade-right">
            <h2
              className="text-2xl font-bold text-[#0f172a] mb-6"
              style={{ fontFamily: "var(--font-poppins), sans-serif" }}
            >
              Sekretariat & Kanal Resmi
            </h2>
            <div className="space-y-6 mb-10">
              <div className="flex items-start bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
                <div className="w-12 h-12 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center text-[#c20000] mr-4 shrink-0 shadow-sm">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0f172a] mb-1" style={{ fontFamily: "var(--font-poppins), sans-serif" }}>
                    Sekretariat
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    Gedung Dakwah Balai Muhammadiyah
                    <br />
                    Jl. Teuku Umar No.5, Keprabon, Surakarta
                  </p>
                </div>
              </div>

              <div className="flex items-center bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
                <div className="w-12 h-12 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center text-[#c20000] mr-4 shrink-0 shadow-sm">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0f172a] mb-1" style={{ fontFamily: "var(--font-poppins), sans-serif" }}>
                    Email Resmi
                  </h3>
                  <a
                    href="mailto:solo.imm@gmail.com"
                    className="text-[#c20000] hover:underline font-semibold text-sm"
                  >
                    solo.imm@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-center bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
                <div className="w-12 h-12 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center text-[#c20000] mr-4 shrink-0 shadow-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-6 h-6"
                  >
                    <rect
                      x="2"
                      y="2"
                      width="20"
                      height="20"
                      rx="5"
                      ry="5"
                    ></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0f172a] mb-1" style={{ fontFamily: "var(--font-poppins), sans-serif" }}>
                    Instagram
                  </h3>
                  <a
                    href="https://instagram.com/immsurakarta"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#c20000] hover:underline font-semibold text-sm"
                  >
                    @immsurakarta
                  </a>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="w-full h-64 bg-slate-100 rounded-2xl overflow-hidden relative shadow-sm border border-slate-200/90">
              <iframe
                title="Peta lokasi sekretariat PC IMM Kota Surakarta"
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
          <div data-aos="fade-left" data-aos-delay="150">
            <Card className="shadow-xl shadow-slate-200/60 border border-slate-200/90 rounded-2xl bg-white overflow-hidden">
              <CardContent className="p-8 md:p-10">
                <h2
                  className="text-2xl font-bold text-[#0f172a] mb-6"
                  style={{ fontFamily: "var(--font-poppins), sans-serif" }}
                >
                  Kirim Pesan Langsung
                </h2>
                <KontakFormClient />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
