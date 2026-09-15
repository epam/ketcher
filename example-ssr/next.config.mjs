/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // `ketcher-core` imports `paper` for rendering. `paper`'s Node entry point
  // (dist/node/self.js) does `require('jsdom')` wrapped in a try/catch and
  // falls back to a lightweight stub when it's unavailable - which is the
  // desired behavior here, since jsdom isn't (and shouldn't be) a real
  // dependency of this app. Left un-externalized, Turbopack/webpack
  // statically resolve every `require()` inside `paper`'s Node build,
  // including the internal `jsdom/lib/jsdom/living/generated/utils` path
  // paper's optional canvas support pulls in - and that resolution is
  // attempted even though the code only runs when jsdom is present, so it
  // hard-fails the build regardless of the runtime guard. Marking `paper` as
  // an external server package makes Next `require()` it directly at
  // runtime instead, so Node's real module resolution (and paper's own
  // try/catch) applies, and prerendering falls back gracefully as intended.
  serverExternalPackages: ['paper'],
};

export default nextConfig;
