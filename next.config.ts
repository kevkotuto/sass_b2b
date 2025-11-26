import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb'
    }
  },
  turbopack: {
    root: '/Users/adelboudalha/Desktop/sass_b2b'
  }
};

export default nextConfig;
