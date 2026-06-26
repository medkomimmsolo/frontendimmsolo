export interface User {
  id: number;
  name: string;
  email: string;
  komisariat_id: number | null;
  bidang_id: number | null;
  profile_photo_path: string | null;
  roles: Role[];
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
  content: string;
  featured_image: string | null;
  status: 'draft' | 'published' | 'archived';
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
