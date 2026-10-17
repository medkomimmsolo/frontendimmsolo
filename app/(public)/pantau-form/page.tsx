import type { Metadata } from 'next';
import { PantauFormClient } from './PantauFormClient';
import { checkMaintenance } from '@/lib/maintenance';
import MaintenancePage from '@/components/ui/MaintenancePage';

export const metadata: Metadata = {
  title: 'Pantau Respons Form | PC IMM Kota Surakarta',
  robots: { index: false, follow: false },
};

export default async function PantauFormPage() {
  if (await checkMaintenance('maintenance_form')) return <MaintenancePage />;
  return <PantauFormClient />;
}
