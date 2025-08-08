/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "res.cloudinary.com",
      // Common Google avatar/CDN hosts
      "lh3.googleusercontent.com",
      "lh4.googleusercontent.com",
      "lh5.googleusercontent.com",
      "lh6.googleusercontent.com",
    ],
  },
  webpack: (config) => {
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