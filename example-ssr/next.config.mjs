/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  // `ketcher-core` imports `paper`. Its Node entry (dist/node/self.js) does
  // `require('jsdom')` and, when jsdom is resolvable (the monorepo root has it
  // for Vitest, so it is hoisted here), builds a jsdom window without canvas
  // support and throws during prerender. Aliasing jsdom to a module that throws
  // makes paper's own try/catch fall back to its stub, as when jsdom is absent.
  turbopack: {
    resolveAlias: {
      jsdom: './shims/jsdom.cjs',
      'jsdom/lib/jsdom/living/generated/utils': './shims/jsdom.cjs',
    },
  },
};

export default nextConfig;
