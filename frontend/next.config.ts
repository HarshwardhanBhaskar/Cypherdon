import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 80, 95],
    unoptimized: process.env.NODE_ENV === "development",
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
