import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/',
        '/api/',
        '/admin/',
        // Halaman utilitas / thin content — jangan habiskan crawl-budget.
        '/cari',
        '/shortlink',
        '/ajukan-akun',
        '/offline',
      ],
    },
    sitemap: 'https://immsolo.or.id/sitemap.xml',
  };
}
