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
  // Exclude the three-js-scene-creation-2 directory from the build
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  // Experimental features for better performance
  experimental: {
    optimizeCss: false,
  },
  // macOS without fsevents falls back to per-directory fs.watch, which
  // exhausts file descriptors (EMFILE) and silently breaks HMR. Use polling
  // (no per-file descriptors) and ignore heavy dirs to keep it light.
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        poll: 800,
        aggregateTimeout: 300,
        ignored: ['**/node_modules/**', '**/.next/**', '**/.git/**'],
      };
    }
    return config;
  },
}

module.exports = nextConfig


