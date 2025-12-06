import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },

  // Empty turbopack config to silence the warning
  turbopack: {},
  /* config options here */
};

export default nextConfig;
