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
        hostname: 'placehold.co',
      }
    ],
  },
  experimental: {
    optimizePackageImports: ['recharts', 'lucide-react', 'aos'],
  },
  async headers() {
    const noIndex = { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive, nosnippet' };
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
