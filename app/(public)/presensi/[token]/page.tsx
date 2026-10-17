import { Metadata } from 'next';
import { Suspense } from 'react';
import { PresensiSelfClient } from './PresensiSelfClient';
import { checkMaintenance } from '@/lib/maintenance';
import MaintenancePage from '@/components/ui/MaintenancePage';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Presensi Kegiatan | PC IMM Kota Surakarta',
  robots: { index: false, follow: false },
};

export default async function PresensiSelfPage({ params }: { params: Promise<{ token: string }> }) {
  if (await checkMaintenance('maintenance_presensi')) return <MaintenancePage />;
  const { token } = await params;

  return (
    <main>
      <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
        <PresensiSelfClient token={token} />
      </Suspense>
    </main>
  );
}
