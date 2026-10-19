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

const ATURAN_IZIN = `Aturannya sederhana: jika sebuah menu **diblokir** untuk Anda, menu itu tertutup walau peran Anda sebesar apa pun. Menu yang tidak Anda miliki izinnya tidak akan tampil — jadi tampilan dashboard Anda bisa berbeda dengan rekan, dan itu wajar.`;

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
    short: 'Baru dapat akun? Ikuti langkah 10 menit ini sampai Anda nyaman memakai dashboard.',
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
            text: 'Cara paling mudah memahaminya: **dashboard** adalah dapur tempat kita menyiapkan isi website. Semua yang Anda buat di dashboard akan tampil sendiri di halaman publik — berita, agenda, formulir, dan lain-lain.',
          },
          {
            type: 'list',
            items: [
              'Menu di sebelah kiri hanya menampilkan menu yang **Anda beri izin**. Menu rekan Anda tidak ada di tempat Anda? Itu wajar, karena wewenangnya berbeda.',
              'Semua menu punya pola yang sama: **buka menu → tombol Tambah → isi formulir → Simpan**. Setelah faham satu, sisanya jadi mudah.',
              'Foto yang diunggah otomatis diringkas oleh sistem agar website tetap cepat. Anda hanya perlu memperhatikan **bentuk (rasio) fotonya** — sistem akan memberi tahu bila bentuknya kurang pas.',
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
              { title: 'Masuk ke dashboard', desc: 'Kunjungi immsolo.or.id/login, lalu masukkan nama akun dan kata sandi dari super-admin.' },
              { title: 'Ganti kata sandi', desc: 'Klik foto profil di pojok atas → Profil, lalu ganti kata sandi sementara Anda.' },
              { title: 'Lengkapi profil', desc: 'Isi nama tampilan, foto, dan kontak. Ini dipakai sebagai tanda "karya siapa ini" pada konten.' },
              { title: 'Jalan-jalan dulu', desc: 'Klik satu per satu menu di sebelah kiri. Aman — yang belum ditekan Simpan tidak akan berubah apa-apa.' },
              { title: 'Coba membuat', desc: 'Buat satu artikel "Draf" di menu Berita. Draf tidak tampil di publik sampai Anda pilih tombol tayang.' },
            ],
          },
        ],
      },
      {
        id: 'prinsip-kerja',
        title: 'Tiga Kebiasaan Baik',
        blocks: [
          {
            type: 'list',
            items: [
              '**Draf dulu, tayang kemudian** — selesaikan isinya, cek pratinjau, baru tayangkan.',
              '**Minta teman membaca dahulu** — mata kedua sangat membantu menangkap salah tulis.',
              '**Jangan bagikan kata sandi** — satu akun untuk satu orang, supaya riwayat catatan tetap jujur.',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            title: 'Bingung atau macet?',
            text: 'Buka playbuk menu yang sedang Anda pakai lewat daftar di kiri, atau langsung ke bagian **Pemecahan Masalah & FAQ**.',
          },
        ],
      },
    ],
  },
  {
    slug: 'pengenalan-sistem',
    title: 'Pengenalan Sistem',
    short: 'Daftar menu dashboard, peran pengurus, dan aturan izin akses — paham ini, sisanya gampang.',
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
            text: 'Playbuk ini adalah buku petunjuk memakai website PC IMM Kota Surakarta, ditulis untuk **pengurus**, bukan untuk programmer. Setiap menu di dashboard punya satu playbuk sendiri — dibuka lewat daftar di sebelah kiri.',
          },
          {
            type: 'p',
            text: 'Dua kata yang akan sering muncul: **halaman publik** (yang dilihat masyarakat di immsolo.or.id) dan **dashboard** (ruang kerja pengurus di immsolo.or.id/dashboard).',
          },
          {
            type: 'callout',
            tone: 'info',
            title: 'Cara memakai playbuk',
            text: 'Cari menu playbuk di sebelah kiri, atau lompat cepat ke sub-bagian memakai daftar "Di halaman ini" di sebelah kanan. Tautan warna merah menuju halaman terkait.',
          },
        ],
      },
      {
        id: 'kamus-istilah',
        title: 'Kamus Istilah',
        blocks: [
          {
            type: 'table',
            head: ['Istilah', 'Artinya'],
            rows: [
              ['Dashboard', 'Ruang kerja pengurus untuk mengatur isi website (harus masuk dengan akun).'],
              ['Playbuk', 'Buku petunjuk pemakaian satu fitur/menu.'],
              ['Izin akses (permission)', 'Kunci yang menentukan menu apa saja yang boleh dibuka seseorang.'],
              ['Peran (role)', 'Sekumpulan kunci izin yang dipakai bersama, contohnya peran "admin" atau "bidang".'],
              ['Draf (draft)', 'Konten yang belum tayang — hanya Anda yang melihatnya.'],
              ['Tayangkan (publish)', 'Membuat konten tampil di halaman publik.'],
              ['Pratinjau', 'Melihat tampilan konten sebenarnya sebelum tayang.'],
              ['WebP', 'Bentuk gambar yang lebih ringan; sistem mengubahnya otomatis saat unggah.'],
              ['Mode perawatan (maintenance)', 'Keadaan ketika suatu halaman ditutup sementara untuk perbaikan.'],
              ['Riwayat catatan (log)', 'Catatan otomatis: siapa mengerjakan apa, dan kapan.'],
            ],
          },
        ],
      },
      {
        id: 'peta-modul',
        title: 'Peta Menu Dashboard',
        blocks: [
          {
            type: 'p',
            text: 'Berikut daftar semua menu yang ada di dashboard beserta kode izinnya. Anda tidak perlu menghafalnya — cukup tunjukkan kode ini kepada super-admin bila butuh diatur.',
          },
          {
            type: 'table',
            head: ['Menu', 'Alamat Dashboard', 'Kode Izin'],
            rows: [
              ['Berita & Kategori', '/dashboard/blog', 'manage-blog'],
              ['Agenda Kegiatan', '/dashboard/events', 'manage-event'],
              ['Struktur Organisasi', '/dashboard/struktural', 'manage-struktural'],
              ['Lembaga', '/dashboard/lembaga', 'manage-struktural'],
              ['Dokumen', '/dashboard/documents', 'manage-document'],
              ['Formulir Pendaftaran', '/dashboard/forms', 'manage-forms'],
              ['Presensi Digital', '/dashboard/presensi', 'manage-presensi'],
              ['Biolink (Kumpulan Tautan)', '/dashboard/links', 'manage-links'],
              ['Tautan Pendek', '/dashboard/shortlinks', 'manage-shortlinks'],
              ['Kotak Masuk', '/dashboard/messages', 'manage-messages'],
              ['Pengumuman', '/dashboard/announcements', 'manage-announcements'],
              ['Media Library (Gudang Foto)', '/dashboard/media', 'manage-media'],
              ['Pengajuan Akun', '/dashboard/account-requests', 'manage-account-requests'],
              ['Pengguna, Peran & Izin', '/dashboard/users', 'super-admin'],
              ['Riwayat Catatan', '/dashboard/audit-logs', 'manage-audit-logs'],
              ['Pengaturan Website', '/dashboard/settings', 'manage-settings'],
            ],
          },
        ],
      },
      {
        id: 'peran-bawaan',
        title: 'Peran Pengurus',
        blocks: [
          {
            type: 'table',
            head: ['Peran', 'Wilayah kerjanya'],
            rows: [
              ['super-admin', 'Pengurus tertinggi: semua menu terbuka, termasuk mengatur akun dan izin orang lain.'],
              ['admin', 'Pengurus harian PC — mengisi website dan layanan sesuai izin yang diberikan.'],
              ['bidang', 'Pengurus salah satu bidang — mengurus isi dan data milik bidangnya sendiri.'],
              ['komisariat', 'Pengurus komisariat — biasanya menulis berita yang perlu diperiksa pengurus pusat dahulu.'],
              ['Peran lain (custom)', ' bisa dibuat oleh super-admin sesuai kebutuhan, misalnya "humas" atau "editor-foto".'],
            ],
          },
          { type: 'callout', tone: 'info', title: 'Aturan izin akses', text: ATURAN_IZIN },
        ],
      },
      {
        id: 'konvensi-gambar',
        title: 'Aturan Mengunggah Foto',
        blocks: [
          {
            type: 'p',
            text: 'Aturan utamanya cuma satu: **bentuk (rasio) foto** supaya sesuai tempatnya — berapa pun ukurannya (tetap di bawah 2MB setelah diperiksa sistem).',
          },
          {
            type: 'list',
            items: [
              'Sistem otomatis memperbandingkan foto agar halaman tetap cepat — jangan khawatir soal ukuran.',
              'Bentuk foto sudah pas → foto **tidak dipotong sama sekali**.',
              'Bentuknya belum pas → jendela potong (crop) terbuka otomatis; tinggal geser bingkai ke bagian yang diinginkan.',
              'Bentuk yang lazim: banner Google Form **4:1** (4 lebar : 1 tinggi), banner sedang **21:9**, banner standar **16:9**, foto profil/logo **1:1**, dan potret **3:4**.',
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'beranda-dashboard',
    title: 'Beranda Dashboard',
    short: 'Halaman pertama setelah masuk: sapaan, angka ringkas, grafik klik, dan artikel terbaru.',
    icon: 'home',
    group: 'Memulai',
    route: '/dashboard',
    related: ['tautan-pendek', 'biolink-linktree', 'berita-artikel'],
    sections: [
      {
        id: 'isi-beranda',
        title: 'Yang Tampil di Beranda',
        blocks: [
          {
            type: 'p',
            text: 'Beranda adalah layar pembuka setelah masuk — gambaran ringkas "kondisi website hari ini".',
          },
          {
            type: 'list',
            items: [
              '**Sapaan** mengikuti jam (Selamat Pagi/Siang/Sore/Malam) dengan tanggal hari ini dalam Bahasa Indonesia.',
              '**Kartu angka** — jumlah artikel (total dan yang sudah tayang), agenda mendatang, jumlah pengguna, dan jumlah lembaga.',
              '**Grafik garis** — geliat isi website 6 bulan terakhir.',
              '**Artikel terbaru** — empat artikel terakhir yang tayang; klik untuk membuka atau menyuntingnya.',
            ],
          },
        ],
      },
      {
        id: 'analitik',
        title: 'Grafik Jumlah Klik',
        blocks: [
          {
            type: 'p',
            text: 'Ada dua grafik klik 30 hari terakhir. Grafik hanya tampil bila Anda punya izin menunya:',
          },
          {
            type: 'list',
            items: [
              '**Tautan Pendek** (izin manage-shortlinks): seberapa laku tautan pendek diklik, dan mana yang terpopuler.',
              '**Biolink** (manage-links): klik pada halaman dan tombol tautannya.',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Angka-angka di beranda hanya untuk dilihat, tidak bisa diubah dari sini. Manfaatnya: menyusun rencana konten atau promosi berikutnya.',
          },
        ],
      },
      {
        id: 'pintasan',
        title: 'Pintasan & Berita Duka',
        blocks: [
          {
            type: 'list',
            items: [
              'Tombol aksi cepat membawa Anda langsung ke formulir buat konten (artikel, agenda, dsb).',
              'Pesan baru di **Kotak Masuk** muncul sebagai lencana merah berangka di pojok halaman.',
              'Pengumuman aktif tampil sebagai tiang bendera di bagian atas dashboard.',
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'autentikasi-profil',
    title: 'Masuk, Profil & Kata Sandi',
    short: 'Cara masuk ke dashboard, mengganti kata sandi, mengisi profil, dan solusi bila lupa sandi.',
    icon: 'key',
    group: 'Memulai',
    route: '/login',
    sections: [
      {
        id: 'login',
        title: 'Masuk ke Dashboard',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Buka halaman masuk', desc: 'immsolo.or.id/login, atau klik tombol Masuk di navbar website.' },
              { title: 'Masukkan data', desc: 'Alamat surel/username dan kata sandi yang diberikan super-admin.' },
              { title: 'Anda sudah masuk', desc: 'Menu di kiri hanya memuat menu yang Anda berizin buka.' },
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            title: 'Jangan mencoba terus-terusan',
            text: 'Salah kata sandi berulang membuat sistem sangat mengingat ("terlalu banyak percobaan"). Bila lupa, hubungi super-admin.',
          },
        ],
      },
      {
        id: 'profil',
        title: 'Profil & Kata Sandi',
        blocks: [
          {
            type: 'p',
            text: 'Di halaman **Profil** (klik foto di pojok atas) Anda bisa mengganti nama tampilan, foto, kontak, dan kata sandi. Kata sandi baru berlaku saat masuk berikutnya.',
          },
          {
            type: 'list',
            items: [
              '**Keluar** mengakhiri sesi di perangkat itu — pastikan bila memakai komputer umum.',
              'Akun yang **dinonaktifkan** oleh super-admin tak bisa masuk sampai diaktifkan kembali.',
              'Jangan berikan kata sandi kepada siapa pun, termasuk rekan pewaris.',
            ],
          },
        ],
      },
    ],
  },

  // ── Konten & Publikasi ──────────────────────────────────────────────────
  {
    slug: 'berita-artikel',
    title: 'Berita & Artikel',
    short: 'Menulis berita, atur kategori & kata kunci, minta diperiksa bila perlu, lalu tayangkan.',
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
            text: 'Modul ini untuk menulis **berita dan artikel** yang tampil di halaman Beranda (/post). Artikel boleh diberi kategori, kata kunci (tag), foto utama, dan foto tepat di dalam tulisan.',
          },
        ],
      },
      {
        id: 'alur-publikasi',
        title: 'Alur Sebelum Artikel Tayang',
        blocks: [
          {
            type: 'flow',
            items: ['Tulis draf', 'Pratinjau', 'Tayangkan', 'Tampil di /post'],
          },
          {
            type: 'p',
            text: 'Untuk pengurus komisariat (dan peran lain yang diatur), alurnya sedikit beda: tulisan yang Anda tayangkan akan menunggu **pemeriksaan** pengurus pusat dulu. Bila disetujui — tayang; bila ditolak, ada catatan alasannya dan Anda bisa membenahi lalu mengajukan ulang.',
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Artikel yang ditolak tidak hilang. Statusnya jelas di daftar: Draf, Menunggu, Tayang, atau Ditolak.',
          },
        ],
      },
      {
        id: 'langkah-menulis',
        title: 'Langkah Menulis',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Menu Berita → Tambah Artikel', desc: 'Isi judul, kategori, dan ringkasan singkat.' },
              { title: 'Unggah foto utama', desc: 'Bentuk terbaik 16:9 (lebar, seperti layar televisi). Bila bentuk sudah pas, fotonya tidak dipotong.' },
              { title: 'Tulis isi artikel', desc: 'Tombol di kotak tulisan: huruf tebal, daftar, tautan, dan menyisip foto langsung dari komputer.' },
              { title: 'Isi kata kunci', desc: 'Kata kunci memudahkan pembaca menemukan artikel; alamat artikel otomatis terbentuk dari judul (masih bisa Anda ubah).' },
              { title: 'Simpan / Tayangkan', desc: 'Simpan sebagai Draf untuk disambung nanti, atau Tayangkan bila siap (sesuai wewenang Anda).' },
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'Selalu tekan tombol **Pratinjau** — lihat bagaimana rupa artikelnya sebelum tayang.',
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
              'Kategori (mis. "Kegiatan", "Opini") dibuat seperlunya dari menu Berita, dan jadi filter di halaman publik.',
              'Super-admin dapat **menjatah kategori** tertentu kepada pengguna tertentu lewat menu Pengguna → Hak Akses Modul → tab Kategori Post. Yang bersangkutan hanya bisa mengerjakan kategori itu.',
              'Kosongkan kategori = kategori apa pun boleh.',
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'agenda-kegiatan',
    title: 'Agenda & Kegiatan',
    short: 'Kalender kegiatan PC/PA/PS: pamflet, rentang tanggal, lokasi, dan tautan kalender untuk pengunjung.',
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
            text: 'Agenda adalah daftar **acara/kegiatan** yang tampil di halaman Agenda (/agenda). Isinya cukup: judul, rentang tanggal, lokasi, pamflet (gambar acara), dan keterangan.',
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
              { title: 'Menu Agenda → Tambah', desc: 'Isi judul, tanggal mulai–selesai, lokasi, dan keterangan.' },
              { title: 'Unggah pamflet', desc: 'Bentuk banner 4:1 (banner lebar). Bila bentuknya sudah pas, tidak dipotong.' },
              { title: 'Simpan', desc: 'Agenda langsung tampil di daftar dan halaman publik mengikuti tanggalnya.' },
            ],
          },
        ],
      },
      {
        id: 'badge-timeline',
        title: 'Label Otomatis',
        blocks: [
          {
            type: 'table',
            head: ['Kapan', 'Label yang Tampil'],
            rows: [
              ['Sebelum tanggal mulai', 'Akan Datang'],
              ['Sedang dalam rentang tanggal', 'Berlangsung'],
              ['Lewat tanggal selesai', 'Selesai'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            title: 'Tambah ke kalender saku',
            text: 'Di halaman publiknya ada tombol mengunduh berkas kalender (.ics) — pengunjung bisa menyimpan acara langsung ke Google Calendar/Outlook di ponselnya.',
          },
        ],
      },
    ],
  },
  {
    slug: 'struktur-lembaga',
    title: 'Struktur Organisasi & Lembaga',
    short: 'Isi bagan pengurus (kartunya bisa diseret untuk mengatur urutan) dan profil komisariat/lembaga.',
    icon: 'network',
    group: 'Konten & Publikasi',
    route: '/dashboard/struktural',
    permission: 'manage-struktural',
    related: ['pengaturan-portal', 'media-library'],
    sections: [
      {
        id: 'struktural',
        title: 'Bagan Pengurus',
        blocks: [
          {
            type: 'p',
            text: 'Bagan pengurus adalah peta siapa memegang jabatan apa — Ketua, Sekretaris, Bendahara, Bidang, dan seterusnya — yang tampil di halaman /struktural.',
          },
          {
            type: 'steps',
            items: [
              { title: 'Tambah jabatan', desc: 'Isi nama, jabatan, kategori (BPH/Bidang), kelompok bidang, foto persegi (1:1), dan masa bakti.' },
              { title: 'Atur urutan sesuai jabatan', desc: '**Tahan lalu seret (drag)** kartunya — susunan tersimpan otomatis, tanpa tombol Simpan.' },
              { title: 'Pilih periode', desc: 'Bagan publik bisa disaring per masa jabatan (mis. 2024–2026).' },
            ],
          },
        ],
      },
      {
        id: 'lembaga',
        title: 'Profil Komisariat & Lembaga',
        blocks: [
          {
            type: 'p',
            text: 'Halaman /lembaga memuat daftar Komisariat, Lembaga, dan Otonomi Sosial Organisasi (LSO): logo, sejarah singkat, visi-misi, dan tautan resmi.',
          },
          {
            type: 'list',
            items: [
              'Logo memakai bentuk persegi (1:1); resolusinya bebas — otomatis diringkas.',
              'Jenis lembaga mengatur filter halaman publik (Komisariat / LSO / Lembaga).',
              'Alamat tautan (slug) yang sama persis dengan lembaga lain akan ditolak, dengan pesan yang jelas.',
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'dokumen',
    title: 'Dokumen & Berkas',
    short: 'Tempat berbagi berkas (PDF/Word/Excel) kepada masyarakat lewat halaman /dokumen.',
    icon: 'folder',
    group: 'Konten & Publikasi',
    route: '/dashboard/documents',
    permission: 'manage-document',
    related: ['media-library', 'faq-pemecahan-masalah'],
    sections: [
      {
        id: 'upload',
        title: 'Unggah & Kelola Dokumen',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Menu Dokumen → Tambah', desc: 'Isi judul, kategori, dan deskripsi singkat.' },
              { title: 'Pilih berkas', desc: 'Format: PDF, Word, Excel, PowerPoint, ZIP, atau gambar — sampai 10MB.' },
              { title: 'Simpan', desc: 'Dokumen tampil di /dokumen, bisa dicari dan disaring per kategori.' },
            ],
          },
        ],
      },
      {
        id: 'akses-publik',
        title: 'Tautan Unduh',
        blocks: [
          {
            type: 'list',
            items: [
              'Pengunjung mengunduh langsung dari halaman /dokumen lewat tombol Unduh/Buka.',
              'Setiap dokumen punya alamat rapi **/files/nama-dokumen** — nyaman dibagikan lewat WhatsApp atau di keterangan/kanal.',
              'Menu ini hanya terbuka bagi yang diberi izin; selain itu tombolnya tidak akan muncul.',
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
    short: 'Buat formulir seperti Google Forms: banner, susun pertanyaan, batasi satu orang satu e-mail, unduh hasilnya.',
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
              { title: 'Menu Formulir → Tambah', desc: 'Isi judul + alamat unik formulir (mis. lomba-17an) yang menjadi bagian tautannya.' },
              { title: 'Unggah banner atas', desc: 'Ukurannya bebas; bagian yang terpotong bisa Anda atur sendiri bila bentuknya belum pas.' },
              { title: 'Pilih bentuk banner', desc: 'Ramping (4:1), Sedang (21:9), Lebar (16:9), atau Utuh (tinggi aslinya, tak terpotong).' },
              { title: 'Aturan e-mail', desc: 'Centang "**Wajib E-mail**" dan "**Batasi 1 per e-mail**" supaya satu orang tak bisa mendaftar berkali-kali.' },
              { title: 'Aktifkan formulir', desc: 'Formulir yang aktif langsung dapat dibuka masyarakat di /form/[alamat].' },
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            title: 'Alat potong banner',
            text: 'Bila bentuk gambar belum sama dengan slotnya, jendela "Tarik & Sesuaikan Potongan" terbuka agar Anda memilih bagian banner yang ditampilkan.',
          },
        ],
      },
      {
        id: 'builder-field',
        title: 'Menyusun Pertanyaan',
        blocks: [
          {
            type: 'p',
            text: 'Susun pertanyaan seperti di Google Forms: tulisan pendek/panjang, surel, pilihan dropdown, radio, centang, skala 1–10, dan unggah berkas. Tiap pertanyaan bisa dibuat **wajib**, diberi pilihan jawaban, dan **diseret** untuk mengatur urutan (tersimpan otomatis).',
          },
          {
            type: 'callout',
            tone: 'warning',
            title: 'Pertanyaan unggah berkas',
            text: 'Pendaftar dapat melampirkan foto/scan (mis. bukti bayar). Batas ukurannya mengikuti pengaturan formulir; jenis berkasnya diatur per pertanyaan.',
          },
        ],
      },
      {
        id: 'halaman-publik',
        title: 'Halaman Isi & Pengaman',
        blocks: [
          {
            type: 'list',
            items: [
              'Halaman isinya bersih (tanpa navbar/footer) — pas untuk dibagikan lewat tautan atau QR.',
              'E-mail kembar otomatis ditolak bila batasan e-mail diaktifkan — dengan pesan yang mudah dipahami pendaftar.',
              'Ada perangkap muatan (anti-spam) dan pembatasan kirim per menit supaya tidak dibanjiri.',
            ],
          },
        ],
      },
      {
        id: 'data-pendaftar',
        title: 'Melihat & Mengunduh Data Pendaftar',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Tab Data Pendaftar', desc: 'Tabel No/Waktu/E-mail/Jawaban + kotak pencarian; klik baris untuk melihat detail.' },
              { title: 'Unduh Excel / CSV', desc: 'Untuk diolah — semua kolom termasuk e-mail.' },
              { title: 'Unduh ZIP', desc: 'Berisi Excel + folder lampiran tiap pendaftar — memudahkan panitia menilai berkas.' },
              { title: 'Hapus respons', desc: 'Boleh per baris; setiap penghapusan tercatat di Riwayat Catatan.' },
            ],
          },
          {
            type: 'callout',
            tone: 'danger',
            title: 'Data pendaftar itu rahasia',
            text: 'Rekap jawaban TIDAK dapat dilihat masyarakat — hanya lewat dashboard oleh yang diberi izin.',
          },
        ],
      },
    ],
  },
  {
    slug: 'presensi-digital',
    title: 'Presensi Digital',
    short: 'Absensi tanpa kertas: peserta pindai QR sendiri, atau petugas yang memindai — lengkap dan bisa diekspor.',
    icon: 'qr',
    group: 'Interaksi & Layanan Publik',
    route: '/dashboard/presensi',
    permission: 'manage-presensi',
    roles: ['admin', 'bidang', 'komisariat'],
    related: ['formulir-pendaftaran', 'agenda-kegiatan', 'faq-pemecahan-masalah'],
    sections: [
      {
        id: 'konsep',
        title: 'Dua Cara Presensi',
        blocks: [
          {
            type: 'p',
            text: 'Presensi digital menggantikan daftar hadir kertas. Ada **dua cara**:',
          },
          {
            type: 'list',
            items: [
              '**Peserta isi sendiri (Mode Form)** — tampilkan QR di layar; peserta memindainya lalu mengisi formulir presensi di ponselnya sendiri. Tak perlu masuk akun. Cocok untuk acara terbuka.',
              '**Petugas memindai (Mode Scan)** — daftar peserta sudah disiapkan; petugas berkeliling memindai kode peserta. Cocok untuk acara tertutup/undangan.',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            title: 'Sesi kegiatan',
            text: 'Satu kegiatan boleh punya **banyak sesi** (mis. Sesi 1 pagi, Sesi 2 siang) — pesertanya sama, catatan kehadirannya terpisah per sesi. Presensi harus **dibuka** (nyalakan saklarnya) agar bisa diisi atau dipindai.',
          },
        ],
      },
      {
        id: 'membuat-presensi',
        title: 'Membuat Presensi Baru',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Menu Presensi → Tambah', desc: 'Isi judul kegiatan, jadwal, dan pilih caranya (Peserta Isi Sendiri / Petugas Memindai).' },
              { title: 'Susun pertanyaan', desc: 'Untuk Mode Form: tambah/hapus pertanyaan (nama, asal instansi, dll) dan tandai mana yang wajib.' },
              { title: 'Pasang pengaman', desc: 'Aktifkan **batas 1 per perangkat** supaya satu ponsel hanya bisa mengisi satu orang (anti titip absen).' },
              { title: 'Buat sesi', desc: 'Tambahkan sesi bila kegiatannya berlapis (gelombang 1, gelombang 2, dll).' },
              { title: 'Buka presensi', desc: 'Nyalakan saklar — QR aktif dan siap dipindai.' },
            ],
          },
        ],
      },
      {
        id: 'peserta-impor-excel',
        title: 'Daftar Peserta & Impor Excel',
        blocks: [
          {
            type: 'p',
            text: 'Peserta bisa diketik satu-satu atau **diimpor sekaligus dari berkas Excel**. Yang dibaca sistem adalah **nama kolom di baris pertama** (urutan kolom bebas):',
          },
          {
            type: 'table',
            head: ['Kolom', 'Wajib?', 'Artinya'],
            rows: [
              ['nama', 'Ya, harus ada', 'Baris tanpa nama otomatis dilewati.'],
              ['email', 'Tidak', 'Kalau ada, dipakai mengenal orangnya (tidak boleh kembar).'],
              ['phone', 'Tidak', 'Nomor HP/WhatsApp.'],
              ['asal', 'Tidak', 'Instansi / komisariat / universitas.'],
              ['kode', 'Tidak', 'Kode peserta versi Anda; bila kosong, sistem menomori sendiri: 001, 002, 003, …'],
            ],
          },
          {
            type: 'steps',
            items: [
              { title: 'Unduh contoh berkas', desc: 'Di jendela Impor Peserta, klik tombol Template.' },
              { title: 'Isi datanya', desc: 'Satu baris = satu peserta. Baris pertama harus memuat kolom nama.' },
              { title: 'Unggah & lihat ringkasan', desc: 'Sistem menyebut berapa baris yang terbaca sebelum benar-benar diimpor.' },
              { title: 'Impor', desc: 'Baris kembar dilewati otomatis; hasil akhirnya dilaporkan.' },
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            title: 'Cara mengenali baris kembar',
            text: 'Ada e-mail → dibanding lewat **e-mail** (huruf besar/kecil diabaikan). Tanpa e-mail → lewat pasangan **nama + asal**. Kode yang sudah dipakai tidak akan dipakai ulang.',
          },
          {
            type: 'callout',
            tone: 'success',
            title: 'Ambil dari Formulir',
            text: 'Alternatif yang manis: impor peserta langsung dari jawaban **formulir pendaftaran** — sistem mengambil kolom "nama", "instansi/asal/kampus", "HP/WA", dan e-mail pendaftar.',
          },
        ],
      },
      {
        id: 'scan-checkin',
        title: 'QR, Pemindaian & Isi di Ponsel',
        blocks: [
          {
            type: 'list',
            items: [
              '**QR di dashboard** bisa diproyeksikan ke layar besar (mode TV) — peserta memindainya dengan kamera ponselnya dan langsung masuk formulir presensi.',
              '**Halaman publik presensi** (/presensi/[tautan]) menampilkan formulir sesi yang sedang aktif — tanpa perlu masuk akun.',
              '**Pemindaian petugas** (menu presensi → Pindai) memakai kamera: pindai kode peserta → kehadirannya tercatat; pindai kembar ditolak.',
              '**Batas 1 per perangkat**: setiap ponsel hanya boleh mengisi satu orang — mencegah titip absen.',
              '**Kirim QR via email**: tombol "**Kirim QR via Email**" mengirim QR personal ke email tiap peserta yang punya alamat e-mail (QR tampil sebagai gambar besar + lampiran di email). Kirim satu per satu lewat kartu peserta, atau semuanya sekaligus; peserta tanpa e-mail dilewati otomatis. Anda juga bisa menulis **pesan utama** (opsional) yang ikut tampil menonjol di dalam email — cukup sekali diisi, dipakai untuk semua email yang dikirim.',
            ],
          },
        ],
      },
      {
        id: 'kehadiran-export',
        title: 'Melihat Kehadiran & Mengunduh Laporan',
        blocks: [
          {
            type: 'list',
            items: [
              'Status kehadiran: **Hadir, Telat, Izin, Tidak Hadir, Belum**. Petugas boleh menandai manual lewat tab Kehadiran.',
              'Tiap baris kehadiran mencantumkan **datanya dari mana**: Form / Pindai / Manual — transparan.',
              'Tab **Riwayat** mencatat semua perubahan: status lama → baru, siapa, dan kapan.',
              '**Unduh Excel** dengan filter: pilih sesi + status + kolom (termasuk jawaban formulir). Lembar Ringkasan menyebut jumlah baris yang ikut.',
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'biolink-linktree',
    title: 'Biolink (Kumpulan Tautan)',
    short: 'Halaman kumpulan tautan dengan desain sendiri — seperti Linktree, untuk ditempel di bio media sosial.',
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
              { title: 'Menu Biolink → Tambah', desc: 'Judul + alamat unik yang menjadi bagian tautannya (/links/[alamat]).' },
              { title: 'Pilih tema warna', desc: 'Warna latar, warna tombol, dan huruf — pratinjau ponsel di sebelah kanan langsung berubah.' },
              { title: 'Tambah isinya', desc: 'Tombol tautan, tulisan bio, atau gambar; avatar/logo bentuk persegi (1:1).' },
              { title: 'Atur urutan', desc: 'Seret itemnya — urutan di halaman publik ikut berubah.' },
            ],
          },
        ],
      },
      {
        id: 'publik-analitik',
        title: 'Publik & Statistik Klik',
        blocks: [
          {
            type: 'list',
            items: [
              'Halaman publik tampil penuh layar (tanpa navbar) — seperti Linktree pada umumnya.',
              'Setiap klik tombol dicatat (angkanya naik) lewat tautan pintas internal.',
              'Analitik dashboard: grafik 30 hari dan item terfavorit.',
              'Super-admin dapat **memindahkan pemilik** halaman ke pengguna lain.',
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'tautan-pendek',
    title: 'Tautan Pendek',
    short: 'Tautan panjang dijadikan pendek: masyarakat mengajukan, admin mengaktifkan, lalu dihitung kliknya.',
    icon: 'zap',
    group: 'Interaksi & Layanan Publik',
    route: '/dashboard/shortlinks',
    permission: 'manage-shortlinks',
    related: ['biolink-linktree', 'faq-pemecahan-masalah'],
    sections: [
      {
        id: 'pengajuan-publik',
        title: 'Pengajuan dari Masyarakat',
        blocks: [
          {
            type: 'flow',
            items: ['Mengajukan', 'Menunggu', 'Diaktifkan Admin', 'Aktif'],
          },
          {
            type: 'list',
            items: [
              'Warga atau pengurus mengajukan di /shortlink: tautan tujuan + nama pendek (opsional) + nomor WhatsApp.',
              'Jatah harian **per nomor WhatsApp** menjaga agar tidak disalahgunakan.',
              'Status pengajuan bisa dipantau di /shortlink/pending.',
            ],
          },
        ],
      },
      {
        id: 'aktivasi-admin',
        title: 'Mengaktifkan & Mengelola',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Periksa pengajuan', desc: 'Dashboard tautan pendek memuat daftar pengajuan beserta statusnya.' },
              { title: 'Aktivasi', desc: 'Nyalakan tautannya — selama menunggu, pengunjung melihat halaman "sedang menunggu".' },
              { title: 'Bagikan', desc: 'Alamat pendeknya /s/[nama] (alias /[nama] juga berlaku) + QR yang bisa diunduh.' },
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'Beberapa nama pendek sudah dicadangkan (dipakai sistem); nama kembar juga ditolak.',
          },
        ],
      },
      {
        id: 'analitik',
        title: 'Statistik Klik',
        blocks: [
          {
            type: 'list',
            items: [
              'Setiap kunjungan tautan menambah hitungan klik.',
              'Grafik 30 hari + tautan terpopuler tampil di Beranda Dashboard dan di menu ini.',
            ],
          },
        ],
      },
    ],
  },

  // ── Komunikasi ──────────────────────────────────────────────────────────
  {
    slug: 'kontak-kotak-masuk',
    title: 'Kotak Masuk',
    short: 'Pesan dari halaman Kontak tiba di sini: ada tanda belum dibaca, tandai, dan hapus.',
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
            items: ['Publik /kontak', 'Masuk Kotak Masuk', 'Ditandai dibaca', 'Ditindaklanjuti / Hapus'],
          },
          {
            type: 'list',
            items: [
              'Formulir kontak publik dibatasi 5 kirim per menit menahan spam.',
              'Pesan baru menyalakan tanda merah di dashboard (pojok halaman dan menu kiri).',
              'Tindakan yang tersedia: tandai dibaca, membalas lewat kontak yang tertulis, atau menghapus.',
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'pengumuman-internal',
    title: 'Pengumuman',
    short: 'Tulisan singkat yang muncul sebagai banner di seluruh halaman — baik publik maupun dashboard.',
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
              { title: 'Menu Pengumuman → Tambah', desc: 'Judul + isi + tingkat kepentingan (prioritas).' },
              { title: 'Aktifkan', desc: 'Pengumuman aktif tampil sebagai banner di halaman publik dan dashboard.' },
              { title: 'Nonaktifkan / hapus', desc: 'Banner langsung menghilang dari semua halaman.' },
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Pengumuman cocok untuk info berjangka (pendaftaran dibuka, perubahan jam). Untuk konten yang ingin tetap diingat, gunakan Berita/Agenda.',
          },
        ],
      },
    ],
  },

  // ── Administrasi & Keamanan ─────────────────────────────────────────────
  {
    slug: 'media-library',
    title: 'Gudang Foto (Media Library)',
    short: 'Penyimpanan bersama foto website: unggah sekali, pakai di semua menu.',
    icon: 'image',
    group: 'Administrasi & Keamanan',
    route: '/dashboard/media',
    permission: 'manage-media',
    related: ['berita-artikel', 'faq-pemecahan-masalah'],
    sections: [
      {
        id: 'upload',
        title: 'Unggah & Penyempurnaan Otomatis',
        blocks: [
          {
            type: 'list',
            items: [
              'Format PNG, JPG, JPEG, WebP — sampai 2MB per berkas.',
              'Semua foto otomatis diringkas menjadi **WebP**; bentuk aslinya dipertahankan.',
              'Foto disimpan rapi per folder menu (blogs, events, forms, dll) agar mudah dicari.',
            ],
          },
        ],
      },
      {
        id: 'pemakaian',
        title: 'Memakai Foto',
        blocks: [
          {
            type: 'list',
            items: [
              'Gudang foto menjadi sumber pilihan gambar di semua menu (tombol "Buka Media Library").',
              'Tautan foto bisa disalin untuk ditempel ke isi artikel/pengumuman.',
              'Hapus banyak sekaligus tersedia — berkas di penyimpanan dan datanya ikut hilang.',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'Jangan asal menghapus foto yang masih dipakai banner/artikel aktif — periksa dahulu.',
          },
        ],
      },
    ],
  },
  {
    slug: 'pengaturan-portal',
    title: 'Pengaturan Website',
    short: 'Wajah website: nama, logo, sambutan ketua, kontak, dan mode perawatan.',
    icon: 'settings',
    group: 'Administrasi & Keamanan',
    route: '/dashboard/settings',
    permission: 'manage-settings',
    related: ['media-library', 'pengumuman-internal'],
    sections: [
      {
        id: 'identitas',
        title: 'Identitas & Halaman Statis',
        blocks: [
          {
            type: 'list',
            items: [
              'Nama website, deskripsi, dan gambar berbagi (og image) dipakai di seluruh halaman.',
              'Halaman statis: Tentang, Sejarah, Kebijakan Privasi, Syarat & Ketentuan — diatur dari sini.',
              'Sambutan Ketua Umum (nama, masa, pesan, foto persegi) tampil langsung di beranda.',
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
              'Logo utama, logo putih (untuk latar gelap), dan favicon — semuanya otomatis WebP, bentuk persegi.',
              'Kontak (WhatsApp, alamat, surel) dipakai di navbar, footer, dan halaman kontak.',
            ],
          },
        ],
      },
      {
        id: 'maintenance',
        title: 'Mode Perawatan',
        blocks: [
          {
            type: 'list',
            items: [
              '**Global**: seluruh halaman publik menampilkan tulisan "sedang dibereskan"; super-admin tetap bisa masuk.',
              '**Per menu**: misal hanya menu Dokumen yang ditutup; menu lain tetap normal.',
              'Jangan lupa menutup kembali mode perawatan setelah selesai.',
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'pengguna-role-hak-akses',
    title: 'Pengguna, Peran & Izin Akses',
    short: 'Kelola akun pengurus, siapa boleh membuka apa, pembatasan kategori berita, dan jalannya akun.',
    icon: 'shield',
    group: 'Administrasi & Keamanan',
    route: '/dashboard/users',
    permission: 'super-admin',
    related: ['pengajuan-akun', 'log-aktivitas', 'berita-artikel'],
    sections: [
      {
        id: 'kelola-user',
        title: 'Kelola Akun',
        blocks: [
          {
            type: 'steps',
            items: [
              { title: 'Tambah akun', desc: '/dashboard/users/create: nama, surel, username, peran, komisariat/lembaga.' },
              { title: 'Aktif / Nonaktif', desc: 'Akun nonaktif tak bisa masuk; akun Anda sendiri tak bisa dinonaktifkan.' },
              { title: 'Hapus', desc: 'Permanen — pastikan datanya tak dibutuhkan lagi.' },
            ],
          },
        ],
      },
      {
        id: 'hak-akses-modul',
        title: 'Hak Akses Per Orang',
        blocks: [
          {
            type: 'p',
            text: 'Tombol **Hak Akses Modul** di daftar pengguna membuka jendela pengaturan khusus orang itu: tab **Modul Akses** (menu apa saja yang boleh) dan tab **Kategori Post** (jatah kategori berita).',
          },
          {
            type: 'table',
            head: ['Status tampil', 'Artinya'],
            rows: [
              ['Via peran', 'Datang dari perannya — blokir untuk mematikan satu menu saja.'],
              ['Akses khusus', 'Diberikan langsung kepada orang itu (di luar perannya).'],
              ['Diblokir', 'Tegak dilarang — berlaku di atas semua aturan lain.'],
            ],
          },
          { type: 'callout', tone: 'info', text: ATURAN_IZIN },
        ],
      },
      {
        id: 'kelola-role',
        title: 'Kelola Peran',
        blocks: [
          {
            type: 'list',
            items: [
              'Peran bawaan: super-admin, admin, bidang, komisariat — tak bisa dihapus; isinya (izin) boleh diubah.',
              'Peran tambahan bisa dibuat bebas (mis. "humas", "editor-media") dengan kombinasi izin pilihan.',
              'Mengubah isi peran berlaku untuk semua orang yang memakainya.',
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'pengajuan-akun',
    title: 'Pengajuan Akun',
    short: 'Orang mengajukan akun pengurus dari halaman publik; super-admin menyetujui atau menolak.',
    icon: 'user-plus',
    group: 'Administrasi & Keamanan',
    route: '/dashboard/account-requests',
    permission: 'manage-account-requests',
    related: ['pengguna-role-hak-akses', 'autentikasi-profil'],
    sections: [
      {
        id: 'alur',
        title: 'Alurnya',
        blocks: [
          {
            type: 'flow',
            items: ['Pengajuan', 'Ditinjau Admin', 'Disetujui / Ditolak', 'Akun Aktif'],
          },
          {
            type: 'list',
            items: [
              'Pengajuan dilakukan di /ajukan-akun (ada pembatasan laju + captcha bila diaktifkan).',
              'Super-admin membaca data pengaju lalu memutuskan: setujui (langsung jadi akun) atau tolak dengan alasan.',
              'Pengaju diberi tahu hasilnya lewat kontak yang tertulis.',
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'log-aktivitas',
    title: 'Riwayat Catatan (Log Aktivitas)',
    short: 'Catatan otomatis seluruh tindakan pengurus: siapa, apa, di menu mana, dan kapan.',
    icon: 'audit',
    group: 'Administrasi & Keamanan',
    route: '/dashboard/audit-logs',
    permission: 'manage-audit-logs',
    related: ['pengguna-role-hak-akses', 'faq-pemecahan-masalah'],
    sections: [
      {
        id: 'fungsi',
        title: 'Untuk Apa & Cara Memakainya',
        blocks: [
          {
            type: 'list',
            items: [
              'Setiap tindakan penting (buat/ubah/hapus, setujui, impor, dll) tercatat lengkap: **siapa, apa yang dilakukan, di menu mana, dan kapan**.',
              'Gunakan pencarian dan filter untuk menelusuri per menu atau per orang.',
              'Catatan bersifat **baca saja** — tak bisa diubah atau dihapus dari halaman ini.',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            title: 'Manfaatnya',
            text: 'Ketika muncul pertanyaan "siapa yang menghapus data ini?", jawabannya ada di sini. Ini juga bukti kerja yang bisa ditunjukkan.',
          },
        ],
      },
    ],
  },

  // ── Rujukan ─────────────────────────────────────────────────────────────
  {
    slug: 'faq-pemecahan-masalah',
    title: 'Pemecahan Masalah & FAQ',
    short: 'Kegagalan yang sering ditemui — unggahan, masuk akun, konten tak tayang, data kembar — beserta solusinya.',
    icon: 'help',
    group: 'Rujukan',
    related: ['panduan-cepat', 'pengenalan-sistem', 'pengguna-role-hak-akses'],
    sections: [
      {
        id: 'upload-gambar',
        title: 'Unggah & Foto',
        blocks: [
          {
            type: 'table',
            head: ['Masalah', 'Sebabnya', 'Caranya'],
            rows: [
              ['Unggahan ditolak melebihi batas', 'Berkas lebih besar dari 2MB', 'Perkecil ukurannya sebelum diunggah; sistem sudah ikut memadatkan, tapi 2MB adalah batas akhir.'],
              ['Foto terpotong tak sesuai keinginan', 'Bentuknya tidak sama dengan slotnya', 'Atur jendela potong saat terbuka — geser bingkai ke bagian yang diinginkan, lalu simpan.'],
              ['Foto lama tampil miring 90°', 'Data arah kamera (EXIF) pada foto lama', 'Unggah ulang foto itu — versi sistem baru sudah membaca arah otomatis.'],
              ['Logo tampak buram', 'Sumbernya resolusinya terlalu kecil', 'Unggah versi yang lebih besar; bentuk persegi, resolusinya bebas.'],
            ],
          },
        ],
      },
      {
        id: 'login-akses',
        title: 'Masuk Akun & Izin',
        blocks: [
          {
            type: 'table',
            head: ['Masalah', 'Sebabnya', 'Caranya'],
            rows: [
              ['"Terlalu banyak percobaan"', 'Salah sandi berulang', 'Tunggu beberapa menit, lalu coba lagi dengan benar.'],
              ['Masuk tapi menu kosong', 'Belum diberi izin', 'Minta super-admin mengatur hak akses Anda.'],
              ['Tidak bisa masuk sama sekali', 'Akun dinonaktifkan', 'Minta super-admin mengaktifkan kembali akun Anda.'],
              ['Lupa kata sandi', '—', 'Hubungi super-admin untuk mengaturnya ulang; pastikan surel di profil valid.'],
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
              '**Artikel tidak muncul di /post** — periksa statusnya: Draf belum tayang; Menunggu sedang diperiksa; Ditolak perlu dibenahi lalu diajukan ulang.',
              '**Artikel tayang tapi tak tampak di kategori** — cek kategori yang dipilih, atau cek apakah akun Anda dijatah kategori tertentu.',
              '**Formulir tak bisa dibuka publik** — pastikan formulirnya aktif dan alamatnya benar (/form/[alamat]).',
              '**Agenda tak tampak** — agenda tampil mengikuti tanggalnya; periksa tanggal mulai/selesai.',
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
            head: ['Masalah', 'Sebabnya', 'Caranya'],
            rows: [
              ['Pendaftar kembar', 'Batasan e-mail belum diaktifkan', 'Aktifkan "Wajib E-mail" + "Batasi 1 per e-mail" di formulir.'],
              ['Impor Excel "0 baris terbaca"', 'Baris pertama tak berisi kolom nama', 'Pastikan baris pertama berisi kolom: nama (wajib), email, phone, asal, kode (tak wajib).'],
              ['Kode peserta bertabrakan', 'Kode sudah dipakai orang lain', 'Biarkan kolom kode kosong supaya sistem menomori sendiri (001, 002, …).'],
              ['Kamera tak terbuka saat memindai', 'Izin kamera browser mati / perangkat tanpa kamera', 'Aktifkan izin kamera; pastikan membuka lewat HTTPS.'],
              ['Seseorang bisa absen 2 kali', 'Batas per perangkat belum aktif', 'Aktifkan batas 1 per perangkat di presensi; satu ponsel hanya untuk satu orang.'],
            ],
          },
        ],
      },
      {
        id: 'tautan',
        title: 'Tautan & Tautan Pendek',
        blocks: [
          {
            type: 'table',
            head: ['Masalah', 'Sebabnya', 'Caranya'],
            rows: [
              ['Nama pendek ditolak "reserved"', 'Nama itu dicadangkan sistem', 'Pakai nama lain.'],
              ['Pengunjung melihat "menunggu aktivasi"', 'Tautannya masih pending', 'Super-admin/penanggung jawab mengaktifkannya dari dashboard.'],
              ['Jatah pengajuan habis', 'Batas harian per nomor WhatsApp', 'Tunggu keesokan harinya atau ajukan lewat admin langsung.'],
              ['Biolink tak terbuka', 'Halamannya tidak aktif', 'Aktifkan halaman di /dashboard/links.'],
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
              '**Semua halaman menampilkan tulisan perawatan** — mode perawatan global menyala; hanya super-admin yang bisa masuk; hubungi mereka untuk mematikan.',
              '**Hanya menu tertentu yang tertutup** — mode perawatan per menu; aturnya di Pengaturan Website.',
              '**Tidak yakin siapa yang mengubah data?** — telusuri Riwayat Catatan: siapa, tindakan apa, di mana, dan kapan.',
              '**Masih belum terpecahkan?** — hubungi super-admin dan kirimkan: menu bermasalah + langkah yang Anda lakukan + tangkapan layar.',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            title: 'Cara melapor yang cepat ditanggapi',
            text: 'Sebut: `Menu` + `Yang saya lakukan` + `Yang muncul` + `Tangkapan layar`. Laporan yang lengkap mempercepat perbaikan.',
          },
        ],
      },
    ],
  },
];

export const getPlaybook = (slug: string): Playbook | undefined => playbooks.find((p) => p.slug === slug);

export const playbookOrder = playbookGroups.flatMap((g) => g.slugs);
