export interface LinkIconOption {
  id: string;
  label: string;
  kind: 'brand' | 'lucide';
  /** slug simple-icons untuk kind brand */
  brandSlug?: string;
  /** nama komponen lucide untuk kind lucide */
  lucide?: string;
}

export const LINK_ICON_OPTIONS: LinkIconOption[] = [
  { id: 'instagram', label: 'Instagram', kind: 'brand', brandSlug: 'instagram' },
  { id: 'tiktok', label: 'TikTok', kind: 'brand', brandSlug: 'tiktok' },
  { id: 'facebook', label: 'Facebook', kind: 'brand', brandSlug: 'facebook' },
  { id: 'youtube', label: 'YouTube', kind: 'brand', brandSlug: 'youtube' },
  { id: 'x', label: 'X (Twitter)', kind: 'brand', brandSlug: 'x' },
  { id: 'whatsapp', label: 'WhatsApp', kind: 'brand', brandSlug: 'whatsapp' },
  { id: 'telegram', label: 'Telegram', kind: 'brand', brandSlug: 'telegram' },
  { id: 'spotify', label: 'Spotify', kind: 'brand', brandSlug: 'spotify' },
  { id: 'shopee', label: 'Shopee', kind: 'brand', brandSlug: 'shopee' },
  { id: 'globe', label: 'Website', kind: 'lucide', lucide: 'Globe' },
  { id: 'mail', label: 'Email', kind: 'lucide', lucide: 'Mail' },
  { id: 'phone', label: 'Telepon', kind: 'lucide', lucide: 'Phone' },
  { id: 'mappin', label: 'Lokasi', kind: 'lucide', lucide: 'MapPin' },
  { id: 'calendar', label: 'Agenda', kind: 'lucide', lucide: 'CalendarDays' },
  { id: 'filetext', label: 'Dokumen', kind: 'lucide', lucide: 'FileText' },
  { id: 'newspaper', label: 'Berita', kind: 'lucide', lucide: 'Newspaper' },
  { id: 'camera', label: 'Galeri', kind: 'lucide', lucide: 'Camera' },
  { id: 'video', label: 'Video', kind: 'lucide', lucide: 'Video' },
  { id: 'mic', label: 'Podcast', kind: 'lucide', lucide: 'Mic' },
  { id: 'shop', label: 'Toko', kind: 'lucide', lucide: 'ShoppingBag' },
  { id: 'heart', label: 'Donasi', kind: 'lucide', lucide: 'Heart' },
  { id: 'users', label: 'Komunitas', kind: 'lucide', lucide: 'Users' },
  { id: 'link', label: 'Tautan', kind: 'lucide', lucide: 'Link2' },
];

const LABELS: Record<string, string> = Object.fromEntries(LINK_ICON_OPTIONS.map((o) => [o.id, o.label]));

export function linkIconLabel(id?: string | null): string {
  if (!id) return 'Tanpa icon';
  return LABELS[id] ?? id;
}
