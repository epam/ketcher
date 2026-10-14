/// <reference types="vite/client" />

// CRA's `react-scripts` types pulled in @types/node, which is where `global`
// and `process` came from. Vite's client types declare neither, and this is a
// browser app, so declare only what the sources actually use rather than
// pulling all of @types/node back in:
//   - App.tsx assigns to `global.ketcher`; index.html defines `global` at runtime
//   - App.tsx reads `process.env.PUBLIC_URL`, which vite.config.ts injects via `define`
// `PUBLIC_URL` is non-optional, as react-scripts' own ProcessEnv declared it —
// vite.config.ts always defines it, falling back to an empty string.
declare var global: typeof globalThis;
declare var process: {
  env: { PUBLIC_URL: string; [key: string]: string | undefined };
};
