import { Metadata } from 'next';
import { Suspense } from 'react';
import { PresensiSelfClient } from './PresensiSelfClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Presensi Kegiatan | PC IMM Kota Surakarta',
  robots: { index: false, follow: false },
};

export default async function PresensiSelfPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  return (
    <main>
      <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
        <PresensiSelfClient token={token} />
      </Suspense>
    </main>
  );
}
