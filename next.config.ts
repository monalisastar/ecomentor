import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: true,

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "25mb",
    },
  },

  // 🖼️ Universal Supabase + Image Optimization Support
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co", // ✅ wildcard supports any Supabase project
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
}

export default nextConfig
