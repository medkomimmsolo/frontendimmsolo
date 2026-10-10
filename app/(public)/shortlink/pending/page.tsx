import { Metadata } from 'next';
import { ShieldAlert, MessageCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { checkMaintenance } from '@/lib/maintenance';
import { getApiBase, normalizeSettings } from '@/lib/settings';

async function getAdminWa(): Promise<string> {
  try {
    const res = await fetch(`${getApiBase()}/settings`, { cache: 'no-store' });
    if (!res.ok) return '6282226252923';
    const data = await res.json();
    const val = normalizeSettings(data?.data).shortlink_admin_wa;
    return val ? String(val).replace(/[^0-9]/g, '') : '6282226252923';
  } catch {
    return '6282226252923';
  }
}
import MaintenancePage from '@/components/ui/MaintenancePage';

export const metadata: Metadata = {
  title: 'Shortlink Belum Aktif',
  description: 'Tautan pendek yang Anda tuju belum diaktifkan oleh Admin.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PendingShortlinkPage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>;
}) {
  const { slug } = await searchParams;
  const adminWa = await getAdminWa();
  if (await checkMaintenance('maintenance_shortlink')) return <MaintenancePage />;
  
  return (
    <main className="min-h-screen bg-slate-50 pt-32 pb-24 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 text-center border border-slate-200/90">
        
        <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-10 h-10 text-yellow-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-800 mb-3" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
          Tautan Belum Aktif
        </h1>
        
        <p className="text-slate-600 mb-8 leading-relaxed">
          Tautan pendek <span className="font-semibold text-[#c20000]">/{slug || '...'}</span> yang Anda tuju <strong>belum dikonfirmasi</strong> atau <strong>masih menunggu persetujuan</strong> dari Admin PC IMM Kota Surakarta.
        </p>

        <div className="bg-slate-50 rounded-xl p-5 mb-8 border border-slate-100 text-left">
          <p className="text-sm text-slate-500 font-medium mb-2">Jika Anda adalah pembuat tautan ini:</p>
          <p className="text-sm text-slate-700 leading-relaxed mb-4">
            Silakan hubungi Admin untuk konfirmasi agar tautan segera diaktifkan. Anda bisa langsung chat tanpa format khusus.
          </p>
          <a 
            href={`https://wa.me/${adminWa}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#1ebd5a] text-white py-2.5 rounded-xl font-medium transition-colors shadow-sm"
          >
            <MessageCircle className="w-4 h-4" />
            Hubungi Admin via WhatsApp
          </a>
        </div>

        <Link 
          href="/shortlink"
          className="flex items-center justify-center gap-2 text-sm font-medium text-slate-500 hover:text-[#c20000] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Halaman Shortlink
        </Link>
      </div>
    </main>
  );
}
