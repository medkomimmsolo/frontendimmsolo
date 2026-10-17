import { Metadata } from 'next';
import AjukanAkunClient from './AjukanAkunClient';
import { checkMaintenance } from '@/lib/maintenance';
import MaintenancePage from '@/components/ui/MaintenancePage';

export const metadata: Metadata = {
  title: 'Pengajuan Akun',
  description: 'Formulir pengajuan akun pengelola website PC IMM Kota Surakarta.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AjukanAkunPage() {
  if (await checkMaintenance('maintenance_ajukan_akun')) return <MaintenancePage />;
  return <AjukanAkunClient />;
}
