import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/AI-Presentation-Builder",
  assetPrefix: "/AI-Presentation-Builder",
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};
    turbo: false,
  },
};

export default nextConfig;
