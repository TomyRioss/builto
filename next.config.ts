import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Los adjuntos del ticket viajan por server action: 4 webp de hasta 1.5 MB.
    serverActions: { bodySizeLimit: "8mb" },
  },
};

export default nextConfig;
