import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import { checkMaintenance } from '@/lib/maintenance';
import MaintenancePage from '@/components/ui/MaintenancePage';

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan',
  description: 'Syarat dan ketentuan penggunaan website PC IMM Kota Surakarta.',
  alternates: {
    canonical: 'https://immsolo.or.id/syarat-ketentuan',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function SyaratKetentuanPage() {
  if (await checkMaintenance('maintenance_mode')) return <MaintenancePage />;

  return (
    <main className="min-h-screen bg-white pt-28 pb-20">
      <article className="max-w-3xl mx-auto px-4 md:px-6">
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-[#0f172a]/70 hover:text-[#c20000] transition-colors mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Beranda
        </Link>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-sm bg-[#c20000]/5 flex items-center justify-center text-[#c20000]">
            <FileText className="w-6 h-6" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#0f172a]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
            Syarat & Ketentuan
          </h1>
        </div>

        <div className="prose prose-slate max-w-none text-[#0f172a]/80">
          <p>Dengan mengakses website PC IMM Kota Surakarta, Anda dianggap telah memahami dan menyetujui syarat dan ketentuan berikut.</p>

          <h2>Penggunaan Konten</h2>
          <ul>
            <li>Seluruh konten website ini ditujukan untuk keperluan informasi, dakwah, dan syiar organisasi.</li>
            <li>Pengutipan konten diperbolehkan untuk tujuan non-komersial dengan mencantumkan sumber.</li>
          </ul>

          <h2>Layanan Publik</h2>
          <ul>
            <li>Layanan shortlink, formulir, dan tautan hanya boleh digunakan untuk tujuan yang sah dan tidak melanggar hukum.</li>
            <li>Pengelola berhak menonaktifkan layanan yang disalahgunakan tanpa pemberitahuan terlebih dahulu.</li>
          </ul>

          <h2>Batasan Tanggung Jawab</h2>
          <p>Pengelola berupaya menjaga akurasi informasi, namun tidak bertanggung jawab atas kerugian yang timbul dari penggunaan informasi di website ini.</p>

          <h2>Perubahan</h2>
          <p>Syarat dan ketentuan ini dapat diperbarui sewaktu-waktu. Versi terbaru selalu tersedia di halaman ini.</p>
        </div>
      </article>
    </main>
  );
}
