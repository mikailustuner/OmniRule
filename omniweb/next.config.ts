import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Ensure the base path matches the repo name for GitHub Pages
  basePath: '/OmniRule', 
  assetPrefix: '/OmniRule',
};

export default nextConfig;

