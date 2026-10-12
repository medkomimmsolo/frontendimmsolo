import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  webpack(config) {
    // Pastikan "quill" selalu resolve ke satu salinan yang sama di semua package
    // (quill-table-up dan react-quill-new harus berbagi instance yang identik)
    // NOTE: pakai process.cwd() agar tidak pecah di Docker/standalone (path relatif CWD).
    config.resolve.alias = {
      ...config.resolve.alias,
      quill: path.resolve(process.cwd(), 'node_modules/quill'),
    };
    return config;
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8010',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8010',
      },
      {
        protocol: 'https',
        hostname: 'api.immsolo.or.id',
      },
      {
        protocol: 'https',
        hostname: 'api-web.immsolo.or.id',
      },
      {
        protocol: 'https',
        hostname: 'immsolo.or.id',
      },
      {
        protocol: 'https',
        hostname: '**.immsolo.or.id',
      },
      {
        protocol: 'https',
        hostname: '**.vercel.app',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      }
    ],
  },
  experimental: {
    optimizePackageImports: ['recharts', 'lucide-react', 'aos'],
  },
  async headers() {
    const noIndex = { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive, nosnippet' };

    // Content-Security-Policy.
    // Catatan: memakai 'unsafe-inline' untuk style (Tailwind/Quill/animate) &
    // 'unsafe-inline' script karena Next.js inline runtime bootstrap belum
    // pakai nonce. Ini tetap memblokir skema berbahaya & script eksternal
    // tak dikenal, dan berpasangan dgn sanitasi HTML (lib/sanitize.ts).
    //
    // Di development, frontend memanggil backend langsung di
    // http://127.0.0.1:8010 (NEXT_PUBLIC_API_URL), jadi host dev harus
    // diizinkan agar CSP tidak memblokir fetch.
    const isDev = process.env.NODE_ENV !== 'production';
    const devHosts = isDev
      ? ' http://127.0.0.1:8010 http://localhost:8010 http://127.0.0.1:3000 http://localhost:3000 ws://127.0.0.1:3000 ws://localhost:3000'
      : '';
    const csp = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.sentry.io https://browser.sentry-cdn.com`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      `img-src 'self' data: blob: https://*.immsolo.or.id https://immsolo.or.id https://placehold.co https://*.vercel.app${devHosts}`,
      `connect-src 'self' https://*.sentry.io https://*.immsolo.or.id https://immsolo.or.id${devHosts}`,
      "frame-src 'self' https://www.google.com https://maps.google.com",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      // upgrade-insecure-requests hanya aman di produksi (HTTPS). Di dev
      // ia akan memaksa http://127.0.0.1 naik ke https dan merusak request.
      ...(isDev ? [] : ["upgrade-insecure-requests"]),
    ].join('; ');

    return [
      {
        source: '/sw.js',
        headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }],
      },
      // Proxy ke backend (rewrites /api, /storage, /sanctum) tidak boleh ter-index.
      { source: '/api/:path*', headers: [noIndex] },
      { source: '/storage/:path*', headers: [noIndex] },
      { source: '/sanctum/:path*', headers: [noIndex] },
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
      // Halaman scan QR presensi butuh kamera (html5-qrcode di
      // PresensiScanPanel). Entry ini diletakkan SETELAH '/:path*' agar
      // menimpa Permissions-Policy global — sesuai perilaku override
      // header Next.js (entri terakhir yang cocok menang untuk key sama).
      {
        source: '/dashboard/presensi/:path*',
        headers: [
          { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=(self), interest-cohort=()' },
        ],
      },
    ];
  },
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8010';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: '/sanctum/:path*',
        destination: `${backendUrl}/sanctum/:path*`,
      },
      {
        source: '/storage/:path*',
        destination: `${backendUrl}/storage/:path*`,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: "immsolo",
  project: "frontend",
});
