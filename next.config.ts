import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'laurelandlore.com' },
      { hostname: 'a0.muscache.com' },
      { hostname: 'images.squarespace-cdn.com' },
    ],
  },
};

export default nextConfig;
