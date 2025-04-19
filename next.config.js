/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["res.cloudinary.com"],
  },
  webpack: (config, { isServer }) => {
    // Ignore source map files during build
    config.module.rules.push({
      test: /\.map$/,
      use: "null-loader",
    });

    // Important: return the modified config
    return config;
  },
};

module.exports = nextConfig;