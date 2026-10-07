import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  output: "standalone",
  webpack(config) {
    // Pastikan "quill" selalu resolve ke satu salinan yang sama di semua package
    // (quill-table-up dan react-quill-new harus berbagi instance yang identik)
    config.resolve.alias = {
      ...config.resolve.alias,
      quill: path.resolve('./node_modules/quill'),
    };
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
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
        protocol: 'http',
        hostname: 'immsolo.or.id',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      }
    ],
  },
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
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
