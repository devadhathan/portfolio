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
  // Suppress React error overlay for specific errors
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Experimental features for better performance
  experimental: {
    optimizeCss: false,
  },
}

module.exports = nextConfig


