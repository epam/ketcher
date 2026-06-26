/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // paper.js (used by ketcher-react) uses require('canvas') which webpack can't
  // bundle for the server. Externalizing it lets Node.js load it directly, where
  // paper.js gracefully handles missing canvas without crashing.
  serverExternalPackages: ['paper'],
};

export default nextConfig;
