/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  output: "export",
  basePath: "/AI-Presentation-Builder",
  assetPrefix: "/AI-Presentation-Builder",
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.join(__dirname, 'src'),
    };
    return config;
  },
};

module.exports = nextConfig;
