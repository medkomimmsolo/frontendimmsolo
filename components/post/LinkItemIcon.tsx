import {
  Globe,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  FileText,
  Newspaper,
  Camera,
  Video,
  Mic,
  ShoppingBag,
  Heart,
  Users,
  Link2,
} from 'lucide-react';
import {
  siInstagram,
  siTiktok,
  siFacebook,
  siYoutube,
  siX,
  siWhatsapp,
  siTelegram,
  siSpotify,
  siShopee,
} from 'simple-icons';

const BRAND_PATHS: Record<string, string> = {
  instagram: siInstagram.path,
  tiktok: siTiktok.path,
  facebook: siFacebook.path,
  youtube: siYoutube.path,
  x: siX.path,
  whatsapp: siWhatsapp.path,
  telegram: siTelegram.path,
  spotify: siSpotify.path,
  shopee: siShopee.path,
};

const LUCIDE_ICONS: Record<string, any> = {
  Globe,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  FileText,
  Newspaper,
  Camera,
  Video,
  Mic,
  ShoppingBag,
  Heart,
  Users,
  Link2,
};

const LUCIDE_BY_ID: Record<string, string> = {
  globe: 'Globe',
  mail: 'Mail',
  phone: 'Phone',
  mappin: 'MapPin',
  calendar: 'CalendarDays',
  filetext: 'FileText',
  newspaper: 'Newspaper',
  camera: 'Camera',
  video: 'Video',
  mic: 'Mic',
  shop: 'ShoppingBag',
  heart: 'Heart',
  users: 'Users',
  link: 'Link2',
};

export default function LinkItemIcon({ id, className = 'w-5 h-5' }: { id?: string | null; className?: string }) {
  if (!id) return null;
  if (BRAND_PATHS[id]) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
        <path d={BRAND_PATHS[id]} />
      </svg>
    );
  }
  const compName = LUCIDE_BY_ID[id];
  const Comp = compName ? LUCIDE_ICONS[compName] : null;
  if (!Comp) return null;
  return <Comp className={className} />;
}
