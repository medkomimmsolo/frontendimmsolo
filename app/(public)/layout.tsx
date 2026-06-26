import PublicLayout from '@/components/layout/PublicLayout';
import MaintenancePage from '@/components/ui/MaintenancePage';
import { checkMaintenance } from '@/lib/maintenance';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if global maintenance mode is active
  const isMaintenance = await checkMaintenance('maintenance_mode');

  if (isMaintenance) {
    return <MaintenancePage />;
  }

  return <PublicLayout>{children}</PublicLayout>;
}
