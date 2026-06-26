const createNextIntlPlugin = require('next-intl/plugin')

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [],
    unoptimized: false,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
  },
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  transpilePackages: ['next-intl'],
  experimental: {
    optimizeCss: false,
    serverComponentsExternalPackages: [
      '@sanity/client',
      '@vercel/kv',
      '@formatjs/intl-localematcher',
      '@formatjs/fast-memoize',
      '@formatjs/icu-messageformat-parser',
      '@formatjs/icu-skeleton-parser',
      '@formatjs/ecma402-abstract',
    ],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        poll: 800,
        aggregateTimeout: 300,
        ignored: ['**/node_modules/**', '**/.next/**', '**/.git/**'],
      };
      // Avoid stale @formatjs vendor-chunk refs when the dev cache rebuilds mid-compile
      config.cache = false;
    }
    return config;
  },
}

module.exports = withNextIntl(nextConfig)
