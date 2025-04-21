/** @type {import('next').NextConfig} */
const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  buildExcludes: [/middleware-manifest\.json$/],
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  // Enable debug mode to get more logs during build
  debug: true,
  workboxOptions: {
    disableDevLogs: true,
  }
});

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
  // PWA configuration
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=3600, must-revalidate",
        },
      ],
    },
    // Add specific headers for PWA files
    {
      source: "/(sw|pwa|sw-register).js",
      headers: [
        {
          key: "Cache-Control", 
          value: "public, max-age=3600, must-revalidate"
        },
        {
          key: "Content-Type",
          value: "application/javascript; charset=utf-8"
        }
      ]
    },
    {
      source: "/manifest.json",
      headers: [
        {
          key: "Cache-Control", 
          value: "public, max-age=3600, must-revalidate"
        },
        {
          key: "Content-Type",
          value: "application/manifest+json; charset=utf-8"
        }
      ]
    }
  ],
};

module.exports = withPWA(nextConfig);