import PublicCameraClient from './[token]/PublicCameraClient';
import { checkMaintenance } from '@/lib/maintenance';
import MaintenancePage from '@/components/ui/MaintenancePage';

export default async function CameraPage() {
  if (await checkMaintenance('maintenance_presensi')) return <MaintenancePage />;
  return <PublicCameraClient />;
}
