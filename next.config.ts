import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize chunk loading
  experimental: {
    optimizePackageImports: ['@rainbow-me/rainbowkit', 'wagmi', '@tanstack/react-query'],
  },
  // Use webpack instead of Turbopack for better compatibility
  // Turbopack can be enabled later when dependencies are compatible
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
  // Empty turbopack config to silence the warning when using webpack
  turbopack: {},
};

export default nextConfig;
