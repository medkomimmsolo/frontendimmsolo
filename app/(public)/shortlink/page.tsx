import { Metadata } from 'next';
import { checkMaintenance } from '@/lib/maintenance';
import MaintenancePage from '@/components/ui/MaintenancePage';
import ShortlinkClient from './ShortlinkClient';

export const metadata: Metadata = {
  title: 'Pengajuan Shortlink',
  description: 'Pengajuan dan pengecekan status shortlink immsolo.or.id.',
};

export default async function ShortlinkPage() {
  if (await checkMaintenance('maintenance_shortlink')) return <MaintenancePage />;
  
  return <ShortlinkClient />;
}
