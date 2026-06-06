/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Disable trailing slashes for better desktop app UX
  trailingSlash: false,
};

module.exports = nextConfig;
