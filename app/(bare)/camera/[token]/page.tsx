import type { Metadata } from 'next';
import PublicCameraClient from './PublicCameraClient';

export const metadata: Metadata = {
  title: 'Kamera Presensi | PC IMM Kota Surakarta',
  referrer: 'no-referrer',
  robots: { index: false, follow: false },
};

export default async function PublicCameraPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  return <PublicCameraClient token={token} />;
}
