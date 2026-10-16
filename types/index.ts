export interface User {
  id: number;
  name: string;
  username?: string | null;
  email: string;
  komisariat_id: number | null;
  bidang_id: number | null;
  profile_photo_path: string | null;
  is_active: boolean;
  roles: Role[];
  all_permissions?: string[];
  denied_permissions?: string[];
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

export interface Blog {
  id: number;
  user_id: number;
  category_id: number;
  title: string;
  slug: string;
  excerpt: string;
  published_at: string | null;
  content: string;
  featured_image: string | null;
  status: 'draft' | 'published' | 'archived';
  review_status?: 'pending' | 'approved' | 'rejected';
  review_note?: string | null;
  views_count: number;
  meta_title: string | null;
  meta_description: string | null;
  keywords: string | null;
  created_at: string;
  updated_at: string;
  user?: User;
  category?: Category;
}

export interface Event {
  id: number;
  title: string;
  slug: string;
  description: string;
  location: string;
  event_date: string;
  registration_link: string | null;
  banner_image: string | null;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Struktural {
  id: number;
  name: string;
  jabatan: string;
  periode: string;
  kelompok_bidang?: string | null;
  kategori?: string | null;
  urutan: number;
  foto: string | null;
  instagram_url: string | null;
  social_media?: { icon: string; url: string; }[] | null;
  created_at: string;
}

export interface Lembaga {
  id: number;
  name: string;
  slug: string;
  tipe: 'komisariat' | 'lso' | 'lembaga';
  sejarah: string | null;
  visi_misi: string | null;
  logo: string | null;
  website_url: string | null;
  created_at: string;
}

export interface Setting {
  id: number;
  key: string;
  value: string | null;
}

export type PresensiMode = 'self' | 'scan' | 'both';
export type PresensiFormFieldType = 'text' | 'email' | 'phone' | 'number' | 'date' | 'textarea' | 'select' | 'checkbox';

export interface PresensiFormField {
  key: string;
  label: string;
  type: PresensiFormFieldType;
  required: boolean;
  options?: string[];
}

export type PresensiFormValue = string | number | string[] | null;

export type PresensiKehadiranStatus = 'hadir' | 'telat' | 'izin' | 'tidak_hadir';
export type PresensiKehadiranMethod = 'self' | 'scan' | 'manual';

export interface Presensi {
  id: number;
  user_id: number | null;
  event_id: number | null;
  title: string;
  slug: string;
  description: string | null;
  location: string | null;
  starts_at: string | null;
  ends_at: string | null;
  is_open: boolean;
  mode: PresensiMode;
  event_token: string | null;
  form_fields: PresensiFormField[];
  late_after_minutes: number | null;
  allow_manual_add: boolean;
  enforce_device_limit?: boolean;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
  user?: { id: number; name: string };
  event?: { id: number; title: string } | null;
  pesertas_count?: number;
  kehadirans_count?: number;
  sesis?: PresensiSesi[];
}

export interface PresensiSesi {
  id: number;
  presensi_id: number;
  name: string;
  starts_at: string | null;
  ends_at: string | null;
  is_open: boolean;
  position: number;
  scan_token: string;
  hadir_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PresensiStats {
  total_peserta: number;
  hadir: number;
  telat: number;
  izin: number;
  belum_hadir: number;
  persen_hadir: number;
}

export interface PresensiPeserta {
  id: number;
  presensi_id: number;
  kode: string | null;
  nama: string;
  email: string | null;
  phone: string | null;
  asal: string | null;
  token: string;
  meta: Record<string, unknown> | null;
  form_data?: Record<string, PresensiFormValue> | null;
  created_at: string;
  updated_at: string;
  kehadiran?: PresensiKehadiran | null;
}

export interface PresensiKehadiran {
  id: number;
  presensi_id: number;
  presensi_peserta_id: number;
  presensi_sesi_id: number | null;
  status: PresensiKehadiranStatus;
  method: PresensiKehadiranMethod;
  checked_at: string;
  checked_by: number | null;
  ip: string | null;
  note: string | null;
  peserta?: { id: number; nama: string; kode: string | null; email: string | null; asal: string | null };
  checkedBy?: { id: number; name: string } | null;
  sesi?: { id: number; name: string } | null;
}

export type PresensiKehadiranLogAction = 'created' | 'updated' | 'deleted';

/** Satu baris riwayat perubahan kehadiran (audit trail). */
export interface PresensiKehadiranLog {
  id: number;
  presensi_id: number;
  presensi_kehadiran_id: number | null;
  presensi_peserta_id: number | null;
  presensi_sesi_id: number | null;
  action: PresensiKehadiranLogAction;
  status_before: PresensiKehadiranStatus | null;
  status_after: PresensiKehadiranStatus | null;
  method: PresensiKehadiranMethod | null;
  note: string | null;
  changed_by: number | null;
  changed_by_name: string | null;
  ip: string | null;
  created_at: string;
  peserta?: { id: number; nama: string; kode: string | null } | null;
  sesi?: { id: number; name: string } | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
