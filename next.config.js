/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'maps.googleapis.com'],
  },
  webpack: (config, { isServer }) => {
    // Handle optional dependencies gracefully (fsevents is macOS-only)
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'fsevents': 'commonjs fsevents',
      });
    }

    // Ignore fsevents warnings on non-macOS platforms
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'fsevents': false,
    };

    return config;
  },
}

module.exports = nextConfig
