/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    resolveAlias: {
      'lodash/default': 'lodash',
    },
  },
};

export default nextConfig;
