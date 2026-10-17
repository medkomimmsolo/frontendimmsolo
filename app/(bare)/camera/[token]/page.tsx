import type { Metadata } from 'next';
import PublicCameraClient from './PublicCameraClient';
import { checkMaintenance } from '@/lib/maintenance';
import MaintenancePage from '@/components/ui/MaintenancePage';

export const metadata: Metadata = {
  title: 'Kamera Presensi | PC IMM Kota Surakarta',
  referrer: 'no-referrer',
  robots: { index: false, follow: false },
};

export default async function PublicCameraPage({ params }: { params: Promise<{ token: string }> }) {
  if (await checkMaintenance('maintenance_presensi')) return <MaintenancePage />;
  const { token } = await params;

  return <PublicCameraClient token={token} />;
}
