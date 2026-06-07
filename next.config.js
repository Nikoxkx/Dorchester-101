/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: false,
    domains: ['localhost', 'example.com'],
  },
  trailingSlash: false,
};

module.exports = nextConfig;
