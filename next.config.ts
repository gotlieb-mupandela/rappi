import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "v1.joma-sport.net",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
