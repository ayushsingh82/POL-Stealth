import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize chunk loading
  experimental: {
    optimizePackageImports: ['@rainbow-me/rainbowkit', 'wagmi', '@tanstack/react-query'],
  },
  // Webpack configuration for better compatibility
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },
};

export default nextConfig;
