export async function checkMaintenance(pageKey: string): Promise<boolean> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, { next: { revalidate: 60 } });
    if (!res.ok) return false;
    
    const json = await res.json();
    const settings = json.data || [];
    
    let isMaintenance = false;
    if (Array.isArray(settings)) {
      // First check global maintenance
      const globalMaintenance = settings.find((s: any) => s.key === 'maintenance_mode');
      if (globalMaintenance && globalMaintenance.value === 'true') {
        return true;
      }
      
      // Then check specific page maintenance
      const pageMaintenance = settings.find((s: any) => s.key === pageKey);
      if (pageMaintenance && pageMaintenance.value === 'true') {
        return true;
      }
    } else if (typeof settings === 'object') {
      if (settings.maintenance_mode === 'true') {
        return true;
      }
      if (settings[pageKey] === 'true') {
        return true;
      }
    }
    
    return isMaintenance;
  } catch (error) {
    console.error(`Failed to check maintenance mode for ${pageKey}`, error);
    return false;
  }
}
