/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  // 🧠 Raise allowed body size for file uploads (e.g. lesson PDFs, ZIPs)
  experimental: {
    serverActions: {
      bodySizeLimit: "25mb", // can go up to "50mb" if needed
    },
  },

  // 🖼️ Optional: image optimization
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

module.exports = nextConfig;
