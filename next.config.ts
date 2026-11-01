import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep production builds from overwriting the active development server output.
  distDir: process.env.NODE_ENV === 'production' ? '.next-build' : '.next',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
};

export default nextConfig;
