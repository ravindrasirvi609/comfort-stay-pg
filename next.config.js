/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh4.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh5.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh6.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
  
  // Empty turbopack config to silence the warning
  turbopack: {},
  
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