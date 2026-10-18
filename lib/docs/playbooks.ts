// Registry konten Playbook Dokumentasi PC IMM Kota Surakarta.
// Semua konten playbook hidup di sini — tambahkan/ubah playbook cukup edit file ini.

export type DocBlock =
  | { type: 'p'; text: string }
  | { type: 'list'; items: string[]; ordered?: boolean }
  | { type: 'steps'; items: { title: string; desc?: string }[] }
  | { type: 'flow'; items: string[] }
  | { type: 'table'; head: string[]; rows: string[][] }
  | { type: 'callout'; tone?: 'info' | 'warning' | 'success' | 'danger'; title?: string; text: string }
  | { type: 'links'; items: { label: string; href: string; desc?: string }[] };

export interface DocSection {
  id: string;
  title: string;
  blocks: DocBlock[];
}

export interface Playbook {
  slug: string;
  title: string;
  short: string;
  icon: string;
  group: string;
  route?: string;
  permission?: string;
  roles?: string[];
  related?: string[];
  sections: DocSection[];
}

export interface PlaybookGroup {
  label: string;
  slugs: string[];
}

const RBAC_INTRO = `Hak akses ditentukan oleh role + permission. **Denied (blokir) selalu mengalahkan allow**, dan pembatasan kategori post berlaku per pengguna. Menu sidebar otomatis tampil hanya untuk permission yang dimiliki.`;

export const playbookGroups: PlaybookGroup[] = [
  { label: 'Memulai', slugs: ['panduan-cepat', 'pengenalan-sistem', 'beranda-dashboard', 'autentikasi-profil'] },
  { label: 'Konten & Publikasi', slugs: ['berita-artikel', 'agenda-kegiatan', 'struktur-lembaga', 'dokumen'] },
  { label: 'Interaksi & Layanan Publik', slugs: ['formulir-pendaftaran', 'presensi-digital', 'biolink-linktree', 'tautan-pendek'] },
  { label: 'Komunikasi', slugs: ['kontak-kotak-masuk', 'pengumuman-internal'] },
  { label: 'Administrasi & Keamanan', slugs: ['media-library', 'pengaturan-portal', 'pengguna-role-hak-akses', 'pengajuan-akun', 'log-aktivitas'] },
  { label: 'Rujukan', slugs: ['faq-pemecahan-masalah'] },
];

export const playbooks: Playbook[] = [
  // ── Memulai ─────────────────────────────────────────────────────────────
  {
    slug: 'panduan-cepat',
    title: 'Panduan Cepat Pengurus Baru',
    short: 'Cukup 10 menit: masuk, ganti sandi, lengkapi profil, dan pahami cara kerja dashboard.',
    icon: 'rocket',
    group: 'Memulai',
    related: ['pengenalan-sistem', 'autentikasi-profil', 'faq-pemecahan-masalah'],
    sections: [
      {
        id: 'sekilas',
        title: 'Sekilas 5 Menit',
        blocks: [
          {
            type: 'p',
            text: 'Anda baru mendapat akun dan tidak tahu mulai dari mana? Playbook ini untuk Anda. Dashboard adalah "ruang belakang" website: semua yang Anda buat di sini akan tampil di halaman publik — berita di /post, agenda di /agenda, formulir di /form/[slug], dan seterusnya.',
          },
          {
            type: 'list',
            items: [
              'Menu di sidebar hanya menampilkan modul yang **Anda punya izinnya** — menu yang hilang berarti belum diizinkan, bukan rusak.',
              'Semua modul mengikuti pola yang sama: **daftar → tombol Tambah → formulir → simpan → cek pratinjau publik**.',
              'Gambar otomatis dikompres ke WebP; yang perlu Anda perhatikan hanya **rasio**.',
            ],
          },
        ],
      },
      {
        id: 'hari-pertama',
        title: 'Hari Pertama',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Login', desc: 'immsolo.or.id/login dengan kredensial dari super-admin.' },
              { title: 'Ganti kata sandi', desc: 'Buka /dashboard/profile dan ganti sandi sementara Anda.' },
              { title: 'Lengkapi profil', desc: 'Nama tampilan, foto, dan kontak — dipakai di audit log dan tulisan "oleh" pada konten.' },
              { title: 'Jelajahi dashboard', desc: 'Klik satu per satu menu di sidebar; halaman Beranda Dashboard merangkum data terbaru.' },
              { title: 'Coba menulis', desc: 'Buat artikel draft di /dashboard/blog → Tambah — aman, karena draft tidak tampil publik sampai Anda publish.' },
            ],
          },
        ],
      },
      {
        id: 'prinsip-kerja',
        title: 'Prinsip Kerja',
        blocks: [
          {
            type: 'list',
            items: [
              '**Draft dulu, publish kemudian** — konten penting sebaiknya direview rekan sebelum tayang.',
              '**Pratinjau sebelum tayang** — hampir semua modul punya tombol pratinjau/tautan publik.',
              '**Blokir menang atas izin** — kalau module diblokir per pengguna, role apa pun tidak menolong.',
              '**Jangan simpan sandi di tempat umum** — satu akun = satu orang, agar audit log akurat.',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            title: 'Tersesat / bingung?',
            text: 'Cek playbook modul terkait di sidebar, atau lompat ke **Pemecahan Masalah & FAQ** — daftar masalah umum dan solusinya.',
          },
        ],
      },
    ],
  },
  {
    slug: 'pengenalan-sistem',
    title: 'Pengenalan Sistem',
    short: 'Peta modul, arsitektur, peran bawaan, dan aturan hak akses yang menjadi fondasi seluruh playbook.',
    icon: 'book',
    group: 'Memulai',
    related: ['panduan-cepat', 'pengguna-role-hak-akses', 'faq-pemecahan-masalah'],
    sections: [
      {
        id: 'tentang-dokumen',
        title: 'Tentang Dokumen Ini',
        blocks: [
          {
            type: 'p',
            text: 'Playbook ini adalah panduan penggunaan **sistem website PC IMM Kota Surakarta** untuk pengurus dan admin. Mirip playbook SATUSEHAT, dokumen ini bukan sekadar tutorial langkah demi langkah, melainkan kumpulan modul panduan yang saling berkaitan: setiap modul dashboard punya playbook sendiri yang bisa dibuka dari sidebar.',
          },
          {
            type: 'p',
            text: 'Sistem terdiri dari dua sisi: **halaman publik** (immsolo.or.id — konten yang dibaca masyarakat) dan **dashboard admin** (immsolo.or.id/dashboard — tempat pengurus mengelola konten). Setiap playbook menjelaskan keduanya.',
          },
          {
            type: 'callout',
            tone: 'info',
            title: 'Cara pakai playbook',
            text: 'Gunakan sidebar kiri untuk berpindah modul, dan panel **"Di halaman ini"** untuk melompat ke sub-bagian. Tautan berwarna merah mengarah ke halaman/fitur terkait.',
          },
        ],
      },
      {
        id: 'arsitektur',
        title: 'Arsitektur Singkat',
        blocks: [
          {
            type: 'list',
            items: [
              '**Frontend** — Next.js (App Router) di immsolo.or.id: halaman publik + dashboard, dengan PWA (bisa offline).',
              '**Backend** — Laravel REST API (`/api/v1`, 26 controller): otentikasi token, validasi, audit log.',
              '**Storage** — file & gambar disimpan sebagai **WebP** (dikompres otomatis saat upload di browser).',
              '**Keamanan** — RBAC berbasis permission, captcha, rate limit, dan maintenance mode.',
            ],
          },
          {
            type: 'flow',
            items: ['Browser', 'Next.js (Publik / Dashboard)', 'REST API Laravel', 'Database & Storage'],
          },
        ],
      },
      {
        id: 'peta-modul',
        title: 'Peta Modul',
        blocks: [
          {
            type: 'table',
            head: ['Modul', 'Route Dashboard', 'Permission'],
            rows: [
              ['Berita & Kategori', '/dashboard/blog', 'manage-blog'],
              ['Agenda Kegiatan', '/dashboard/events', 'manage-event'],
              ['Struktur Organisasi', '/dashboard/struktural', 'manage-struktural'],
              ['Lembaga', '/dashboard/lembaga', 'manage-struktural'],
              ['Dokumen', '/dashboard/documents', 'manage-document'],
              ['Formulir Pendaftaran', '/dashboard/forms', 'manage-forms'],
              ['Presensi Digital', '/dashboard/presensi', 'manage-presensi'],
              ['Biolink (Linktree)', '/dashboard/links', 'manage-links'],
              ['Tautan Pendek', '/dashboard/shortlinks', 'manage-shortlinks'],
              ['Kotak Masuk', '/dashboard/messages', 'manage-messages'],
              ['Pengumuman Internal', '/dashboard/announcements', 'manage-announcements'],
              ['Media Library', '/dashboard/media', 'manage-media'],
              ['Pengajuan Akun', '/dashboard/account-requests', 'manage-account-requests'],
              ['Pengguna, Role & Hak Akses', '/dashboard/users', 'manage-users (super-admin)'],
              ['Log Aktivitas', '/dashboard/audit-logs', 'manage-audit-logs'],
              ['Pengaturan Portal', '/dashboard/settings', 'manage-settings'],
            ],
          },
        ],
      },
      {
        id: 'peran-bawaan',
        title: 'Peran (Role) Bawaan',
        blocks: [
          {
            type: 'table',
            head: ['Role', 'Cakupan'],
            rows: [
              ['super-admin', 'Akses penuh seluruh modul, tidak bisa dibatasi, mengelola user/role/hak akses.'],
              ['admin', 'Pengelola inti PC: konten, formulir, presensi, media, pengaturan (sesuai permission yang diberikan).'],
              ['bidang', 'Pengurus bidang: konten dan data milik bidangnya.'],
              ['komisariat', 'Pengurus komisariat: umumnya mengelola artikel yang butuh review, dan data miliknya.'],
              ['Role custom', 'Dapat dibuat super-admin dengan kombinasi permission bebas.'],
            ],
          },
          { type: 'callout', tone: 'info', title: 'Aturan hak akses', text: RBAC_INTRO },
        ],
      },
      {
        id: 'konvensi-gambar',
        title: 'Konvensi Upload Gambar',
        blocks: [
          {
            type: 'p',
            text: 'Semua upload gambar dinilai berdasarkan **rasio**, bukan resolusi — resolusi berapa pun diterima (maks berkas 2MB setelah kompresi).',
          },
          {
            type: 'list',
            items: [
              'Gambar otomatis dikompres ke **WebP** di browser — cepat dimuat, hemat kuota.',
              'Jika rasio sudah pas (mis. 16:9), gambar diutuhkan **tanpa dipotong**.',
              'Jika rasio beda, alat potong (crop) terbuka otomatis agar Anda memilih bagian yang ditampilkan.',
              'Format rasio: banner Google Form **4:1**, banner sedang **21:9**, standar **16:9**, avatar/logo **1:1**, portrait **3:4**.',
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'autentikasi-profil',
    title: 'Akun, Login & Profil',
    short: 'Masuk ke dashboard, ganti kata sandi, atur profil, dan pemulihan akses.',
    icon: 'key',
    group: 'Memulai',
    route: '/login',
    sections: [
      {
        id: 'login',
        title: 'Login ke Dashboard',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Buka halaman login', desc: 'Kunjungi immsolo.or.id/login atau klik tombol Masuk di navbar.' },
              { title: 'Isi kredensial', desc: 'Email/username + kata sandi yang diberikan super-admin.' },
              { title: 'Masuk dashboard', desc: 'Menu sidebar hanya menampilkan modul sesuai hak akses Anda.' },
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            title: 'Batasi percobaan',
            text: 'Kesalahan login berulang memicu pembatasan (throttle) sementara. Jika lupa kata sandi, hubungi super-admin — bukan mencoba berulang.',
          },
        ],
      },
      {
        id: 'profil',
        title: 'Profil & Kata Sandi',
        blocks: [
          {
            type: 'p',
            text: 'Di **/dashboard/profile** Anda dapat mengubah nama, data kontak, dan kata sandi. Kata sandi baru berlaku pada login berikutnya.',
          },
          {
            type: 'list',
            items: [
              'Keluar (logout) menghapus sesi di browser tersebut.',
              'Akun yang **dinonaktifkan** oleh super-admin tidak bisa login sampai diaktifkan kembali.',
              'Status login dijaga dengan token + cookie penanda sesi; jangan bagikan kredensial ke orang lain.',
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'beranda-dashboard',
    title: 'Beranda Dashboard',
    short: 'Pusat ringkasan: sambutan, statistik situs, grafik analitik, dan artikel terbaru.',
    icon: 'home',
    group: 'Memulai',
    route: '/dashboard',
    related: ['tautan-pendek', 'biolink-linktree', 'berita-artikel'],
    sections: [
      {
        id: 'isi-beranda',
        title: 'Apa yang Ada di Beranda',
        blocks: [
          {
            type: 'p',
            text: 'Beranda dashboard adalah halaman pertama setelah login — ringkasan kondisi situs dalam satu layar.',
          },
          {
            type: 'list',
            items: [
              '**Sambutan dinamis** — "Selamat Pagi/Siang/Sore/Malam" mengikuti jam perangkat, plus tanggal hari ini (format Indonesia).',
              '**Kartu statistik** — total & artikel terpublikasi, total & agenda mendatang, jumlah pengguna, dan jumlah lembaga/komisariat.',
              '**Grafik tren aktivitas** — aktivitas konten 6 bulan terakhir.',
              '**Artikel terbaru** — 4 artikel terpublikasi, klik untuk membuka/edit.',
            ],
          },
        ],
      },
      {
        id: 'analitik',
        title: 'Analitik Klik',
        blocks: [
          {
            type: 'p',
            text: 'Dua grafik klik 30 hari terakhir tampil di beranda — namun hanya untuk modul yang Anda izinkan:',
          },
          {
            type: 'list',
            items: [
              '**Shortlink** (permission manage-shortlinks): total klik tautan pendek, daftar tautan terpopuler.',
              '**Biolink** (permission manage-links): total klik halaman & item tautan, halaman terpopuler.',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Statistik & analitik di beranda bersifat baca — tidak ada aksi yang bisa dilakukan di sini selain menjadikan data ini dasar keputusan (mis. konten apa yang perlu dipromosikan).',
          },
        ],
      },
      {
        id: 'pintasan',
        title: 'Pintasan & Notifikasi',
        blocks: [
          {
            type: 'list',
            items: [
              'Tombol aksi cepat membawa Anda langsung ke formulir buat konten (artikel, agenda, dsb).',
              'Pesan baru di **Kotak Masuk** muncul sebagai badge di header/sidebar.',
              'Pengumuman internal aktif tampil sebagai banner di bagian atas dashboard.',
            ],
          },
        ],
      },
    ],
  },

  // ── Konten & Publikasi ──────────────────────────────────────────────────
  {
    slug: 'berita-artikel',
    title: 'Berita & Artikel (Blog)',
    short: 'Menulis artikel, mengelola kategori & tag, alur review komisariat, dan publikasi.',
    icon: 'newspaper',
    group: 'Konten & Publikasi',
    route: '/dashboard/blog',
    permission: 'manage-blog',
    roles: ['admin', 'bidang', 'komisariat'],
    related: ['media-library', 'pengguna-role-hak-akses', 'faq-pemecahan-masalah'],
    sections: [
      {
        id: 'ringkasan',
        title: 'Ringkasan',
        blocks: [
          {
            type: 'p',
            text: 'Modul blog mengelola **berita dan artikel** yang tampil di halaman publik /post. Mendukung kategori, tag, gambar utama, gambar inline di isi, draft/published, serta alur review untuk pengurus komisariat.',
          },
        ],
      },
      {
        id: 'alur-publikasi',
        title: 'Alur Publikasi',
        blocks: [
          {
            type: 'flow',
            items: ['Buat Draft', 'Tulis Isi (Editor)', 'Publish', 'Tampil Publik'],
          },
          {
            type: 'p',
            text: 'Pengguna dengan role **komisariat** (dan peran pembatas lain) menghasilkan artikel berstatus menunggu review: alurnya menjadi **Buat Draft → Ajukan Review → Disetujui Super Admin → Tampil Publik**. Super-admin dapat menyetujui (approve) atau menolak (reject) beserta catatan review — penulis mendapat notifikasi di dashboard.',
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Artikel yang ditolak tidak hilang — ubah isinya lalu ajukan ulang. Status badge di daftar artikel menunjukkan draft, pending, published, atau rejected.',
          },
        ],
      },
      {
        id: 'langkah-menulis',
        title: 'Langkah Menulis Artikel',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Buka /dashboard/blog → Tambah Artikel', desc: 'Isi judul, kategori, dan ringkasan.' },
              { title: 'Unggah gambar utama', desc: 'Resolusi bebas, rasio 16:9 disarankan; rasio pas tidak terpotong. Gambar otomatis jadi WebP.' },
              { title: 'Tulis isi dengan editor', desc: 'Editor mendukung teks rapi, daftar, tautan, dan gambar inline (unggah langsung dari editor).' },
              { title: 'Isi tag & SEO', desc: 'Tag memudahkan pencarian; slug otomatis dari judul namun bisa diedit.' },
              { title: 'Simpan / Publish', desc: 'Simpan sebagai draft untuk melanjutkan nanti, atau langsung publish (sesuai hak).' },
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'Gunakan tombol **Pratinjau** untuk melihat tampilan artikel sebelum dipublikasikan.',
          },
        ],
      },
      {
        id: 'kategori-scope',
        title: 'Kategori & Pembatasan',
        blocks: [
          {
            type: 'list',
            items: [
              'Kategori dikelola dari form blog (tambah/edit/hapus) dan muncul sebagai filter di halaman publik.',
              'Super-admin dapat **membatasi kategori** per pengguna di modul Pengguna → Hak Akses Modul → tab Kategori Post. Pengguna yang dibatasi hanya dapat membaca/menulis kategori tersebut.',
              'Kosongkan pilihan kategori = pengguna boleh semua kategori.',
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'agenda-kegiatan',
    title: 'Agenda & Kegiatan',
    short: 'Kelola agenda kegiatan PC/PA/PS/komisariat, badge timeline otomatis, dan unduh ICS.',
    icon: 'calendar',
    group: 'Konten & Publikasi',
    route: '/dashboard/events',
    permission: 'manage-event',
    related: ['presensi-digital', 'berita-artikel'],
    sections: [
      {
        id: 'ringkasan',
        title: 'Ringkasan',
        blocks: [
          {
            type: 'p',
            text: 'Agenda menampilkan kegiatan yang akan datang dan yang berlangsung di halaman publik /agenda. Setiap kegiatan punya rentang tanggal, lokasi, pamflet/banner, dan deskripsi.',
          },
        ],
      },
      {
        id: 'langkah',
        title: 'Langkah Membuat Agenda',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Buka /dashboard/events → Tambah', desc: 'Isi judul, tanggal mulai–selesai, lokasi, dan deskripsi.' },
              { title: 'Unggah banner/pamflet', desc: 'Resolusi bebas — rasio banner 4:1 dinilai; rasio pas tidak terpotong.' },
              { title: 'Simpan', desc: 'Agenda langsung muncul di daftar dan halaman publik sesuai tanggalnya.' },
            ],
          },
        ],
      },
      {
        id: 'badge-timeline',
        title: 'Badge Timeline Otomatis',
        blocks: [
          {
            type: 'table',
            head: ['Waktu', 'Badge'],
            rows: [
              ['Sebelum tanggal mulai', 'Akan Datang'],
              ['Hari H (di rentang tanggal)', 'Berlangsung'],
              ['Setelah tanggal selesai', 'Selesai'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            title: 'Unduh ICS',
            text: 'Di halaman detail agenda publik tersedia tombol **Unduh ICS** — berkas .ics yang bisa diimpor ke Google Calendar / Outlook.',
          },
        ],
      },
    ],
  },
  {
    slug: 'struktur-lembaga',
    title: 'Struktur Organisasi & Lembaga',
    short: 'Bagan pengurus (drag-drop urutan), foto 1:1, dan direktori komisariat/lembaga.',
    icon: 'network',
    group: 'Konten & Publikasi',
    route: '/dashboard/struktural',
    permission: 'manage-struktural',
    related: ['pengaturan-portal', 'media-library'],
    sections: [
      {
        id: 'struktural',
        title: 'Struktur Organisasi',
        blocks: [
          {
            type: 'p',
            text: 'Modul struktural menyusun **bagan pengurus** yang tampil di /struktural: Ketua, Sekretaris, Bendahara, Bidang, hingga komisariat. Setiap kartu berisi nama, jabatan, kategori (BPH/Bidang), kelompok bidang, foto, dan periode.',
          },
          {
            type: 'steps',
            items: [
              { title: 'Tambah pengurus', desc: 'Isi nama, jabatan, kategori, dan unggah foto rasio 1:1 (persegi, resolusi bebas).' },
              { title: 'Susun urutan', desc: 'Seret kartu (drag & drop) — urutan tersimpan otomatis tanpa tombol simpan.' },
              { title: 'Filter periode', desc: 'Bagan publik dapat difilter per periode kepengurusan.' },
            ],
          },
        ],
      },
      {
        id: 'lembaga',
        title: 'Lembaga & Komisariat',
        blocks: [
          {
            type: 'p',
            text: 'Direktori /lembaga memuat profil **Komisariat, Lembaga, dan Otonomi Sosial Organisasi (LSO)**: logo, sejarah, visi-misi, dan tautan resmi.',
          },
          {
            type: 'list',
            items: [
              'Logo memakai rasio 1:1, resolusi bebas, otomatis WebP.',
              'Tipe lembaga memengaruhi filter halaman publik (Komisariat/LSO/Lembaga).',
              'Slug duplikat akan ditolak dengan pesan validasi yang jelas.',
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'dokumen',
    title: 'Dokumen & Berkas',
    short: 'Upload dokumen (PDF/Word/Excel), kategori, dan akses unduh publik via /dokumen & /files.',
    icon: 'folder',
    group: 'Konten & Publikasi',
    route: '/dashboard/documents',
    permission: 'manage-document',
    related: ['media-library', 'faq-pemecahan-masalah'],
    sections: [
      {
        id: 'upload',
        title: 'Upload & Kelola Dokumen',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Buka /dashboard/documents/create', desc: 'Isi judul, kategori, dan deskripsi.' },
              { title: 'Pilih berkas', desc: 'Format: PDF, Word, Excel, PowerPoint, ZIP, gambar — maksimal 10MB.' },
              { title: 'Simpan', desc: 'Dokumen tampil di /dokumen dengan filter kategori dan pencarian.' },
            ],
          },
        ],
      },
      {
        id: 'akses-publik',
        title: 'Akses Publik & Slug',
        blocks: [
          {
            type: 'list',
            items: [
              'Pengunjung mengunduh lewat tombol Unduh/Buka di /dokumen.',
              'Setiap dokumen punya tautan ramah **/files/[slug]** — bagus untuk dibagikan di WhatsApp/caption.',
              'Modul dapat dijaga permission: tanpa manage-document, menu dan API ditolak (403).',
            ],
          },
        ],
      },
    ],
  },

  // ── Interaksi & Layanan Publik ──────────────────────────────────────────
  {
    slug: 'formulir-pendaftaran',
    title: 'Formulir Pendaftaran',
    short: 'Builder formulir ala Google Forms: banner, field drag-drop, validasi, export Excel/CSV/ZIP.',
    icon: 'clipboard',
    group: 'Interaksi & Layanan Publik',
    route: '/dashboard/forms',
    permission: 'manage-forms',
    related: ['presensi-digital', 'media-library', 'faq-pemecahan-masalah'],
    sections: [
      {
        id: 'membuat-form',
        title: 'Membuat Formulir & Banner',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Buat formulir baru', desc: 'Di /dashboard/forms → Tambah: judul + slug (alamat halaman publik).' },
              { title: 'Unggah banner header', desc: 'Resolusi bebas; rasio mengikuti format frame yang dipilih (4:1 / 21:9 / 16:9 / proporsional).' },
              { title: 'Pilih format frame', desc: 'Banner Ramping (4:1), Sedang (21:9), Lebar (16:9), atau Proporsional Asli (tinggi utuh).' },
              { title: 'Atur email & limit', desc: 'Centang "Wajib Email" dan "Batasi 1 per Email" bila perlu — mencegah pendaftaran ganda.' },
              { title: 'Aktifkan formulir', desc: 'Formulir aktif langsung bisa diakses publik di /form/[slug].' },
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            title: 'Alat potong banner',
            text: 'Sama seperti modul lain: jika rasio gambar belum pas, alat "Tarik & Sesuaikan Potongan" terbuka agar Anda memilih bagian banner yang tampil.',
          },
        ],
      },
      {
        id: 'builder-field',
        title: 'Builder Field',
        blocks: [
          {
            type: 'p',
            text: 'Susun pertanyaan seperti Google Forms: teks pendek/panjang, email, dropdown, radio, checkbox, skala, dan file upload. Field dapat diatur **wajib**, diberi opsi jawaban, serta diurutkan dengan drag & drop (tersimpan otomatis).',
          },
          {
            type: 'callout',
            tone: 'warning',
            title: 'Field file upload',
            text: 'Pendaftar dapat melampirkan berkas (mis. foto/scan). Ukuran maksimum mengikuti pengaturan formulir; format diatur per field.',
          },
        ],
      },
      {
        id: 'halaman-publik',
        title: 'Halaman Publik & Validasi',
        blocks: [
          {
            type: 'list',
            items: [
              'Formulir tampil tanpa navbar/footer (halaman khusus) — cocok dibagikan via QR/tautan.',
              'Email ganda ditolak dengan pesan "email sudah digunakan" bila limit diaktifkan.',
              'Ada honeypot anti-spam dan pembatasan jumlah pengiriman per menit.',
            ],
          },
        ],
      },
      {
        id: 'data-pendaftar',
        title: 'Data Pendaftar & Export',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Tab Data Pendaftar', desc: 'Tabel No/ID/Waktu/Email/Jawaban + pencarian; klik baris untuk detail lengkap.' },
              { title: 'Export Excel/CSV', desc: 'Unduh .xlsx atau .csv — semua kolom termasuk email.' },
              { title: 'Export ZIP', desc: 'Berisi Excel + folder lampiran per pengisi — praktis untuk panitia seleksi.' },
              { title: 'Hapus respons', desc: 'Respons per baris dapat dihapus; tindakan tercatat di log aktivitas.' },
            ],
          },
          {
            type: 'callout',
            tone: 'danger',
            title: 'Lindungi data pendaftar',
            text: 'Rekap respons TIDAK dapat diakses publik — hanya lewat dashboard dengan permission manage-forms.',
          },
        ],
      },
    ],
  },
  {
    slug: 'presensi-digital',
    title: 'Presensi Digital',
    short: 'Presensi QR/form: sesi kegiatan, impor peserta Excel, scan kamera, anti titip absen, export.',
    icon: 'qr',
    group: 'Interaksi & Layanan Publik',
    route: '/dashboard/presensi',
    permission: 'manage-presensi',
    roles: ['admin', 'bidang', 'komisariat'],
    related: ['formulir-pendaftaran', 'agenda-kegiatan', 'faq-pemecahan-masalah'],
    sections: [
      {
        id: 'konsep',
        title: 'Konsep & Mode',
        blocks: [
          {
            type: 'p',
            text: 'Presensi digital menggantikan daftar hadir kertas. Ada **dua mode**:',
          },
          {
            type: 'list',
            items: [
              '**Mode Form** — peserta memindai QR lalu mengisi formulir presensi (tidak perlu daftar nama terlebih dahulu, tidak perlu login). Cocok untuk kegiatan terbuka.',
              '**Mode Scan Peserta** — daftar peserta sudah disiapkan (manual/impor Excel); petugas memindai kode peserta. Cocok untuk kegiatan tertutup/undangan.',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            title: 'Sesi kegiatan',
            text: 'Satu kegiatan bisa punya banyak **sesi** (mis. Sesi 1 pagi, Sesi 2 siang) — peserta sama, catatan kehadiran terpisah per sesi. Presensi harus dibuka (toggle buka/tutup) agar bisa diisi/ discan.',
          },
        ],
      },
      {
        id: 'membuat-presensi',
        title: 'Membuat Presensi',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: '/dashboard/presensi → Tambah', desc: 'Isi judul kegiatan, jadwal, dan pilih mode (Form / Scan Peserta).' },
              { title: 'Susun field formulir', desc: 'Pada mode Form: tambah/hapus field (nama, email, instansi, dll), atur wajib/tidak.' },
              { title: 'Atur limit perangkat', desc: 'Aktifkan **device limit** untuk anti titip absen (1 perangkat = 1 peserta).' },
              { title: 'Buat sesi', desc: 'Tambahkan sesi kegiatan bila kegiatan punya beberapa gelombang.' },
              { title: 'Buka presensi', desc: 'Toggle status menjadi terbuka; QR aktif.' },
            ],
          },
        ],
      },
      {
        id: 'peserta-impor-excel',
        title: 'Peserta & Impor Excel',
        blocks: [
          {
            type: 'p',
            text: 'Peserta dapat ditambahkan manual (nama/kode/asal) atau **diimpor massal dari Excel**. Impor Excel dinilai berdasarkan **nama kolom pada header** (tidak peduli urutan):',
          },
          {
            type: 'table',
            head: ['Kolom', 'Wajib?', 'Keterangan'],
            rows: [
              ['nama', 'Ya', 'Baris tanpa nama dilewati otomatis.'],
              ['email', 'Tidak', 'Jika ada, dipakai sebagai kunci unik peserta.'],
              ['phone', 'Tidak', 'Nomor HP/WhatsApp.'],
              ['asal', 'Tidak', 'Instansi/komisariat/universitas.'],
              ['kode', 'Tidak', 'Kode peserta; jika kosong, diisi otomatis 001, 002, … sesuai urutan.'],
            ],
          },
          {
            type: 'steps',
            items: [
              { title: 'Unduh template', desc: 'Di modal Impor Peserta, klik Template untuk mendapatkan contoh .xlsx.' },
              { title: 'Isi data', desc: 'Satu baris = satu peserta; header harus berisi kolom nama (kolom lain opsional).' },
              { title: 'Unggah & pratinjau', desc: 'Sistem menampilkan pratinjau jumlah baris terbaca sebelum diimpor.' },
              { title: 'Impor', desc: 'Baris ganda dilewati; jumlah berhasil dilaporkan di akhir.' },
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            title: 'Aturan duplikat impor',
            text: 'Punya email → duplikat dicek via **email** (tidak peduli huruf besar/kecil). Tanpa email → via kombinasi **nama + asal**. Kode yang sudah terpakai tidak dipakai ulang (kode kosong otomatis diurutkan).',
          },
          {
            type: 'callout',
            tone: 'success',
            title: 'Impor dari Formulir',
            text: 'Alternatif: impor peserta langsung dari **respons formulir pendaftaran** — sistem mengambil field berlabel "nama", "instansi/asal/komisariat/kampus", "hp/telepon/WA", dan email pendaftar.',
          },
        ],
      },
      {
        id: 'scan-checkin',
        title: 'QR, Scan & Check-in Publik',
        blocks: [
          {
            type: 'list',
            items: [
              '**QR Code** di dashboard bisa ditampilkan ke layar proyektor (mode TV) — peserta memindai lalu mengisi formulir presensi di ponselnya (tanpa login).',
              '**Halaman presensi publik** (/presensi/[token]) menampilkan skema formulir sesi aktif; check-in langsung mencatat kehadiran.',
              '**Scan petugas** (/dashboard/presensi/[id]/scan) memakai kamera: pindai kode/tiket peserta → kehadiran tercatat; scan ganda ditolak.',
              '**Device limit**: satu perangkat hanya boleh check-in satu peserta — mencegah titip absen.',
            ],
          },
        ],
      },
      {
        id: 'kehadiran-export',
        title: 'Kehadiran, Riwayat & Export',
        blocks: [
          {
            type: 'list',
            items: [
              'Status kehadiran: **hadir, telat, izin, tidak_hadir, belum**. Petugas bisa menandai manual (hadir/izin/tidak hadir) dari tab Kehadiran.',
              'Setiap baris menampilkan **metode** kehadiran (Form / Scan / Manual).',
              'Tab **Riwayat** mencatat semua perubahan kehadiran: status sebelum → sesudah, metode, pelaku, dan waktu.',
              '**Export Excel** bisa difilter: pilih sesi, status, dan kolom (termasuk jawaban field formulir). Sheet Ringkasan menampilkan jumlah baris yang diekspor.',
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'biolink-linktree',
    title: 'Biolink (Linktree)',
    short: 'Halaman tautan dengan tema kustom, live preview, urutan drag-drop, dan analitik klik.',
    icon: 'link',
    group: 'Interaksi & Layanan Publik',
    route: '/dashboard/links',
    permission: 'manage-links',
    related: ['tautan-pendek', 'beranda-dashboard'],
    sections: [
      {
        id: 'membuat-biolink',
        title: 'Membuat Biolink',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Buat halaman', desc: '/dashboard/links → Tambah: judul + slug (alamat /links/[slug]).' },
              { title: 'Tentukan tema', desc: 'Warna latar, warna tombol, dan font — pratinjau ponsel berubah live.' },
              { title: 'Tambah item', desc: 'Tombol tautan, teks bio, atau gambar; avatar/logo rasio 1:1.' },
              { title: 'Atur urutan', desc: 'Seret item — urutan publik mengikuti.' },
            ],
          },
        ],
      },
      {
        id: 'publik-analitik',
        title: 'Publik & Analitik',
        blocks: [
          {
            type: 'list',
            items: [
              'Halaman publik tampil penuh (tanpa navbar) — ala Linktree, pas untuk bio Instagram.',
              'Setiap klik tombol dicatat (counter +1) lewat tautan pintas internal.',
              'Analitik dashboard: grafik 30 hari dan item terpopuler.',
              'Super-admin dapat **memindahkan kepemilikan** halaman ke pengguna lain.',
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'tautan-pendek',
    title: 'Tautan Pendek (Shortlink)',
    short: 'Pengajuan link publik dengan kuota, aktivasi admin, QR, dan analitik klik.',
    icon: 'zap',
    group: 'Interaksi & Layanan Publik',
    route: '/dashboard/shortlinks',
    permission: 'manage-shortlinks',
    related: ['biolink-linktree', 'faq-pemecahan-masalah'],
    sections: [
      {
        id: 'pengajuan-publik',
        title: 'Pengajuan Publik',
        blocks: [
          {
            type: 'flow',
            items: ['Publik Ajukan', 'Status Pending', 'Aktivasi Admin', 'Link Aktif'],
          },
          {
            type: 'list',
            items: [
              'Warga/pengurus mengajukan di /shortlink: URL tujuan + alias (opsional) + nomor WhatsApp.',
              'Kuota harian **per nomor WhatsApp** mencegah penyalahgunaan.',
              'Status dapat dipantau di /shortlink/pending dengan slug/alias.',
            ],
          },
        ],
      },
      {
        id: 'aktivasi-admin',
        title: 'Aktivasi & Kelola Admin',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Review pengajuan', desc: 'Dashboard shortlink memuat daftar beserta status.' },
              { title: 'Aktivasi', desc: 'Aktifkan link — selama pending, pengunjung diberi halaman menunggu.' },
              { title: 'Bagikan', desc: 'Alamat pendek /s/[slug] (alias /[slug] juga berlaku) + QR dapat diunduh.' },
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'Alias tertentu diblokir (reserved) untuk melindungi route sistem; alias duplikat ditolak.',
          },
        ],
      },
      {
        id: 'analitik',
        title: 'Analitik',
        blocks: [
          {
            type: 'list',
            items: [
              'Setiap redirect menambah counter klik.',
              'Grafik klik 30 hari + tautan terpopuler tampil di dashboard overview dan modul shortlink.',
            ],
          },
        ],
      },
    ],
  },

  // ── Komunikasi ──────────────────────────────────────────────────────────
  {
    slug: 'kontak-kotak-masuk',
    title: 'Kontak & Kotak Masuk',
    short: 'Pesan dari halaman kontak masuk ke dashboard: badge belum dibaca, tandai, hapus.',
    icon: 'inbox',
    group: 'Komunikasi',
    route: '/dashboard/messages',
    permission: 'manage-messages',
    related: ['pengumuman-internal'],
    sections: [
      {
        id: 'alur',
        title: 'Alur Pesan',
        blocks: [
          {
            type: 'flow',
            items: ['Publik /kontak', 'Pesan Masuk', 'Tandai Dibaca', 'Tindak Lanjut / Hapus'],
          },
          {
            type: 'list',
            items: [
              'Form kontak publik terbatas 5 pengiriman/menit untuk mencegah spam.',
              'Pesan masuk menandai badge belum dibaca di dashboard (header + sidebar).',
              'Tindakan: tandai dibaca, balas via kontak yang tertulis, atau hapus.',
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'pengumuman-internal',
    title: 'Pengumuman Internal',
    short: 'Banner informasi yang tampil di seluruh halaman publik dan dashboard admin.',
    icon: 'megaphone',
    group: 'Komunikasi',
    route: '/dashboard/announcements',
    permission: 'manage-announcements',
    related: ['pengaturan-portal', 'kontak-kotak-masuk'],
    sections: [
      {
        id: 'membuat',
        title: 'Membuat Pengumuman',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Buka /dashboard/announcements', desc: 'Buat pengumuman: judul + isi + level prioritas.' },
              { title: 'Aktifkan', desc: 'Pengumuman aktif tampil sebagai banner di halaman publik dan dashboard.' },
              { title: 'Nonaktifkan / hapus', desc: 'Banner langsung hilang dari semua halaman.' },
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Pengumuman cocok untuk info singkat berjangka (pendaftaran dibuka, kegiatan darurat, perubahan jam). Untuk konten permanen, gunakan Berita/Agenda.',
          },
        ],
      },
    ],
  },

  // ── Administrasi & Keamanan ─────────────────────────────────────────────
  {
    slug: 'media-library',
    title: 'Media Library',
    short: 'Pusat penyimpanan gambar: upload WebP otomatis, salin URL, hapus massal.',
    icon: 'image',
    group: 'Administrasi & Keamanan',
    route: '/dashboard/media',
    permission: 'manage-media',
    related: ['berita-artikel', 'faq-pemecahan-masalah'],
    sections: [
      {
        id: 'upload',
        title: 'Upload & Optimasi',
        blocks: [
          {
            type: 'list',
            items: [
              'Format diterima: PNG, JPG, JPEG, WebP — maksimal 2MB per berkas.',
              'Semua gambar otomatis dikompres ke **WebP**; rasio asli dipertahankan.',
              'Gambar disimpan per folder modul (blogs, events, forms, dsb) agar rapi.',
            ],
          },
        ],
      },
      {
        id: 'pemakaian',
        title: 'Pemakaian',
        blocks: [
          {
            type: 'list',
            items: [
              'Media Library menjadi sumber pilihan gambar di semua modul (tombol "Buka Media Library").',
              'URL gambar dapat disalin untuk dipakai di isi artikel/pengumuman.',
              'Hapus massal tersedia — berkas di storage dan datanya ikut terhapus; tautan lama menjadi tidak valid.',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'Jangan menghapus gambar yang masih dipakai artikel/banner aktif — cek pemakaiannya dahulu.',
          },
        ],
      },
    ],
  },
  {
    slug: 'pengaturan-portal',
    title: 'Pengaturan Portal',
    short: 'Identitas situs, logo, sambutan ketua, kontak, dan mode maintenance.',
    icon: 'settings',
    group: 'Administrasi & Keamanan',
    route: '/dashboard/settings',
    permission: 'manage-settings',
    related: ['media-library', 'pengumuman-internal'],
    sections: [
      {
        id: 'identitas',
        title: 'Identitas & Konten Statis',
        blocks: [
          {
            type: 'list',
            items: [
              'Nama situs, deskripsi, dan SEO global (meta + og image) digunakan di seluruh halaman.',
              'Halaman statis: Tentang, Sejarah, Kebijakan Privasi, Syarat & Ketentuan — diatur dari sini.',
              'Sambutan Ketua Umum (nama, periode, pesan, foto rasio 1:1) tampil real-time di beranda.',
            ],
          },
        ],
      },
      {
        id: 'logo-kontak',
        title: 'Logo & Kontak',
        blocks: [
          {
            type: 'list',
            items: [
              'Logo utama, logo putih (untuk latar gelap), favicon — semuanya otomatis WebP, rasio 1:1.',
              'Kontak (WhatsApp, alamat, email) dipakai di navbar, footer, dan halaman kontak.',
            ],
          },
        ],
      },
      {
        id: 'maintenance',
        title: 'Mode Maintenance',
        blocks: [
          {
            type: 'list',
            items: [
              '**Global**: seluruh halaman publik menampilkan halaman perawatan; super-admin tetap bisa masuk dashboard.',
              '**Per modul**: mis. hanya modul Dokumen yang ditutup sementara; modul lain normal.',
              'Jangan lupa mematikan kembali maintenance setelah selesai.',
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'pengguna-role-hak-akses',
    title: 'Pengguna, Role & Hak Akses',
    short: 'Kelola akun pengurus, role custom, permission per modul, dan pembatasan kategori.',
    icon: 'shield',
    group: 'Administrasi & Keamanan',
    route: '/dashboard/users',
    permission: 'super-admin',
    related: ['pengajuan-akun', 'log-aktivitas', 'berita-artikel'],
    sections: [
      {
        id: 'kelola-user',
        title: 'Kelola Pengguna',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Tambah pengguna', desc: '/dashboard/users/create: nama, email, username, role, komisariat/lembaga.' },
              { title: 'Aktif / Nonaktif', desc: 'Pengguna nonaktif tidak bisa login; akun sendiri tidak bisa dinonaktifkan.' },
              { title: 'Hapus', desc: 'Permanen — pastikan datanya tidak dibutuhkan lagi.' },
            ],
          },
        ],
      },
      {
        id: 'hak-akses-modul',
        title: 'Hak Akses Modul (Per Pengguna)',
        blocks: [
          {
            type: 'p',
            text: 'Tombol **Hak Akses Modul** di daftar pengguna membuka pengaturan rinci: tab **Modul Akses** (checkbox per modul) dan tab **Kategori Post** (pembatasan kategori artikel).',
          },
          {
            type: 'table',
            head: ['Status Akses', 'Arti'],
            rows: [
              ['Via role', 'Diberikan oleh role pengguna — blokir untuk menonaktifkan per modul.'],
              ['Akses khusus', 'Diberikan langsung ke pengguna (di luar role).'],
              ['Diblokir', 'Ditegaskan secara eksplisit — menang atas allow role maupun direct.'],
            ],
          },
          { type: 'callout', tone: 'info', text: RBAC_INTRO },
        ],
      },
      {
        id: 'kelola-role',
        title: 'Kelola Role',
        blocks: [
          {
            type: 'list',
            items: [
              'Role bawaan: super-admin, admin, bidang, komisariat — tidak dapat dihapus, permission-nya bisa diubah.',
              'Role custom dapat dibuat bebas (mis. "humas", "editor-media") dengan kombinasi permission pilihan.',
              'Perubahan permission role berlaku untuk semua pengguna yang memakainya.',
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'pengajuan-akun',
    title: 'Pengajuan Akun',
    short: 'Warga mengajukan akun pengurus; super-admin menyetujui atau menolak.',
    icon: 'user-plus',
    group: 'Administrasi & Keamanan',
    route: '/dashboard/account-requests',
    permission: 'manage-account-requests',
    related: ['pengguna-role-hak-akses', 'autentikasi-profil'],
    sections: [
      {
        id: 'alur',
        title: 'Alur Pengajuan',
        blocks: [
          {
            type: 'flow',
            items: ['Publik Mengajukan', 'Admin Review', 'Approve / Reject', 'Akun Aktif'],
          },
          {
            type: 'list',
            items: [
              'Pengajuan dilakukan di /ajukan-akun (dengan pembatasan rate + captcha bila diaktifkan).',
              'Super-admin meninjau data pengaju lalu menyetujui (membuat akun) atau menolak dengan alasan.',
              'Pengaju diberi tahu hasilnya sesuai kontak yang terdaftar.',
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'log-aktivitas',
    title: 'Log Aktivitas (Audit)',
    short: 'Jejak seluruh tindakan admin: siapa, aksi apa, modul mana, kapan.',
    icon: 'audit',
    group: 'Administrasi & Keamanan',
    route: '/dashboard/audit-logs',
    permission: 'manage-audit-logs',
    related: ['pengguna-role-hak-akses', 'faq-pemecahan-masalah'],
    sections: [
      {
        id: 'fungsi',
        title: 'Fungsi & Pemakaian',
        blocks: [
          {
            type: 'list',
            items: [
              'Setiap operasi CRUD penting (buat/ubah/hapus, approve, import, dsb) tercatat dengan **pengguna, aksi, modul, dan waktu**.',
              'Gunakan filter/pencarian untuk menelusuri riwayat per modul atau per pengguna.',
              'Log bersifat baca saja — tidak bisa diedit/dihapus dari UI.',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            title: 'Untuk apa?',
            text: 'Audit log membantu investigasi (mis. artikel terhapus siapa) dan menjadi bukti pertanggungjawaban organisasi.',
          },
        ],
      },
    ],
  },

  // ── Rujukan ─────────────────────────────────────────────────────────────
  {
    slug: 'faq-pemecahan-masalah',
    title: 'Pemecahan Masalah & FAQ',
    short: 'Masalah yang paling sering ditemui — upload, login, artikel tak tayang, duplikat pendaftar — beserta solusinya.',
    icon: 'help',
    group: 'Rujukan',
    related: ['panduan-cepat', 'pengenalan-sistem', 'pengguna-role-hak-akses'],
    sections: [
      {
        id: 'upload-gambar',
        title: 'Upload & Gambar',
        blocks: [
          {
            type: 'table',
            head: ['Masalah', 'Penyebab', 'Solusi'],
            rows: [
              ['Upload gagal "melebihi batas"', 'Berkas >2MB setelah kompresi', 'Kompres/kurangi dimensi sebelum unggah; gambar besar otomatis dipadatkan, tapi 2MB adalah batas akhir.'],
              ['Gambar terpotong tidak sesuai keinginan', 'Rasio tidak sesuai target', 'Biarkan alat potong terbuka, geser bingkai sesuai bagian yang diinginkan, lalu simpan.'],
              ['Foto lama tampil berputar 90°', 'Data orientasi kamera (EXIF) foto lama', 'Unggah ulang foto tersebut — versi sistem baru membaca orientasi secara otomatis.'],
              ['Logo buram saat dikecilkan', 'Sumber resolusi terlalu kecil', 'Unggah versi resolusi lebih tinggi; rasio 1:1, resolusi bebas.'],
            ],
          },
        ],
      },
      {
        id: 'login-akses',
        title: 'Login & Akses',
        blocks: [
          {
            type: 'table',
            head: ['Masalah', 'Penyebab', 'Solusi'],
            rows: [
              ['"Terlalu banyak percobaan"', 'Throttle login salah berulang', 'Tunggu beberapa menit, lalu coba lagi dengan benar.'],
              ['Login berhasil tapi menu kosong', 'Belum punya permission', 'Hubungi super-admin untuk mengatur hak akses.'],
              ['Tidak bisa login sama sekali', 'Akun dinonaktifkan', 'Minta super-admin mengaktifkan kembali akun Anda.'],
              ['Lupa kata sandi', '—', 'Hubungi super-admin untuk atur ulang; alamat email profil harus valid.'],
            ],
          },
        ],
      },
      {
        id: 'konten',
        title: 'Konten Tidak Tayang',
        blocks: [
          {
            type: 'list',
            items: [
              '**Artikel tidak muncul di /post** — cek status: draft belum tayang; pending menunggu approve; rejected perlu diubah lalu diajukan ulang.',
              '**Artikel tayang tapi tidak ada di kategori** — cek kategori yang dipilih, atau cek apakah akun Anda dibatasi kategori tertentu.',
              '**Formulir tidak bisa diakses publik** — pastikan formulir berstatus aktif dan slug benar (alamat: /form/[slug]).',
              '**Agenda tidak tampil** — agenda tampil sesuai rentang tanggalnya; cek tanggal mulai/selesai.',
            ],
          },
        ],
      },
      {
        id: 'form-presensi',
        title: 'Formulir & Presensi',
        blocks: [
          {
            type: 'table',
            head: ['Masalah', 'Penyebab', 'Solusi'],
            rows: [
              ['Pendaftar ganda', 'Limit 1 per email belum aktif', 'Aktifkan "Wajib Email" + "Batasi 1 per Email" di formulir.'],
              ['Impor Excel "0 baris terbaca"', 'Header kolom tidak mengandung "nama"', 'Pastikan baris pertama berisi kolom: nama (wajib), email, phone, asal, kode (opsional).'],
              ['Kode peserta menabrak', 'Kode sudah terpakai', 'Biarkan kolom kode kosong agar sistem mengurutkan otomatis (001, 002, …).'],
              ['Scan gagal / kamera tak terbuka', 'Izin kamera browser mati atau perangkat tanpa kamera', 'Aktifkan izin kamera; gunakan perangkat dengan kamera; pastikan HTTPS.'],
              ['Seseorang bisa absen 2x', 'Device limit belum diaktifkan', 'Aktifkan limit perangkat pada presensi; satu perangkat hanya untuk satu peserta.'],
            ],
          },
        ],
      },
      {
        id: 'tautan',
        title: 'Tautan & Shortlink',
        blocks: [
          {
            type: 'table',
            head: ['Masalah', 'Penyebab', 'Solusi'],
            rows: [
              ['Pengajuan ditolak "alias reserved"', 'Alias menabrak route sistem', 'Gunakan alias lain.'],
              ['Pengunjung lihat "menunggu aktivasi"', 'Shortlink masih pending', 'Super-admin/penanggung jawab mengaktifkan dari dashboard.'],
              ['Kuota pengajuan habis', 'Batas harian per nomor WhatsApp', 'Tunggu hari berikutnya atau ajukan melalui admin langsung.'],
              ['Link biolink tidak terdaftar', 'Halaman tidak aktif', 'Aktifkan halaman di /dashboard/links.'],
            ],
          },
        ],
      },
      {
        id: 'lainnya',
        title: 'Lainnya',
        blocks: [
          {
            type: 'list',
            items: [
              '**Seluruh situs tampil halaman perawatan** — maintenance global menyala; hanya super-admin yang bisa masuk; hubungi super-admin untuk mematikan.',
              '**Modul tertentu "dalam perawatan"** — maintenance per modul menyala; atur di Pengaturan Portal.',
              '**Tidak yakin siapa yang mengubah data** — telusuri Log Aktivitas: siapa, aksi, modul, waktu.',
              '**Masih buntu** — hubungi super-admin PC dan cantumkan halaman yang bermasalah + screenshot.',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            title: 'Laporkan dengan format ini',
            text: '`Modul` + `yang saya lakukan` + `yang muncul` + `screenshot`. Laporan yang lengkap mempercepat perbaikan jauh.',
          },
        ],
      },
    ],
  },
];

export const getPlaybook = (slug: string): Playbook | undefined => playbooks.find((p) => p.slug === slug);

export const playbookOrder = playbookGroups.flatMap((g) => g.slugs);
