import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { checkMaintenance } from '@/lib/maintenance';
import MaintenancePage from '@/components/ui/MaintenancePage';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi',
  description: 'Kebijakan privasi website PC IMM Kota Surakarta mengenai pengumpulan dan penggunaan data pengunjung.',
  alternates: {
    canonical: 'https://immsolo.or.id/kebijakan-privasi',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function KebijakanPrivasiPage() {
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
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#0f172a]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
            Kebijakan Privasi
          </h1>
        </div>

        <div className="prose prose-slate max-w-none text-[#0f172a]/80">
          <p>Website PC IMM Kota Surakarta menghormati privasi pengunjung. Halaman ini menjelaskan data yang kami kumpulkan dan cara penggunaannya.</p>

          <h2>Data yang Kami Kumpulkan</h2>
          <ul>
            <li>Data yang Anda berikan secara sukarela melalui formulir (kontak, pendaftaran kegiatan, pengajuan shortlink, dan pengajuan akun).</li>
            <li>Data teknis dasar seperti jenis peramban dan halaman yang dikunjungi untuk keperluan statistik.</li>
          </ul>

          <h2>Penggunaan Data</h2>
          <ul>
            <li>Menindaklanjuti pesan, pendaftaran, dan pengajuan yang Anda kirimkan.</li>
            <li>Meningkatkan kualitas layanan dan konten website.</li>
            <li>Kami tidak menjual atau menyewakan data pribadi Anda kepada pihak ketiga.</li>
          </ul>

          <h2>Keamanan Data</h2>
          <p>Kami menerapkan langkah-langkah teknis yang wajar untuk melindungi data Anda dari akses yang tidak sah.</p>

          <h2>Kontak</h2>
          <p>
            Jika ada pertanyaan mengenai kebijakan ini, hubungi kami melalui halaman{' '}
            <Link href="/kontak" className="text-[#c20000] hover:underline">Kontak</Link>.
          </p>
        </div>
      </article>
    </main>
  );
}
