/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheMaxMemorySize: 0,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        port: '',
        pathname: '/pointhi/leaflet-color-markers/**',
      },
      {
        protocol: 'https',
        hostname: 'cdnjs.cloudflare.com',
        port: '',
        pathname: '/ajax/libs/leaflet/**',
      },
    ],
  },
};

module.exports = nextConfig;
