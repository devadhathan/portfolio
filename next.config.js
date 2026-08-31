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
    /*
     * WebP only. The sources are already WebP, so AVIF was re-encoding them for
     * about 13KB on a 60KB thumbnail while costing ~4x the transform time
     * (measured: 658ms vs 173ms cold on a 1400px source). Every uncached size
     * pays that on first request, which is what made the work grid crawl.
     */
    formats: ['image/webp'],
  },
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  transpilePackages: ['next-intl', 'use-intl', 'cuelume'],
  experimental: {
    optimizeCss: false,
    optimizePackageImports: ['lucide-react'],
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
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Filesystem cache can leave page.js pointing at vendor chunks that no longer exist.
      config.cache = { type: 'memory' };
      config.watchOptions = {
        ...config.watchOptions,
        aggregateTimeout: 300,
        ignored: ['**/node_modules/**', '**/.git/**', '**/.next/**'],
        poll: Number(process.env.WATCHPACK_POLLING_INTERVAL || 1000),
      };

      // Server dev bundles (incl. static-paths-worker) must not split vendors into
      // separate files — hot reload often leaves orphan ./vendor-chunks/*.js refs.
      if (isServer && config.optimization) {
        config.optimization.splitChunks = false;
      }
    }
    return config;
  },
}

module.exports = withNextIntl(nextConfig)
