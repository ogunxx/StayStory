import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: import.meta.dirname,
  },
  images: {
    remotePatterns: [
      { hostname: 'laurelandlore.com' },
      { hostname: 'a0.muscache.com' },
      { hostname: 'images.squarespace-cdn.com' },
    ],
  },
};

export default nextConfig;
