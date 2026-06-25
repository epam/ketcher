/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    resolveAlias: {
      // Turbopack misinterprets `import { default as X } from "lodash"` in
      // miew's webpack-generated ESM bundle as a request for "lodash/default".
      'lodash/default': 'lodash',
    },
  },
};

export default nextConfig;
