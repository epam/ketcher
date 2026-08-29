import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { license } from '../../license-banner.mjs';
import { mode } from '../../build-config/replace-values.mjs';
import { createExternalPredicate } from '../../build-config/external-predicate.mjs';
import { createPathAliases } from '../../build-config/path-aliases.mjs';
import { createRawTextPlugin } from '../../build-config/raw-text-plugin.mjs';

const pkg = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
);

const isProduction = process.env.NODE_ENV === mode.PRODUCTION;
const rootDir = new URL('.', import.meta.url).pathname;

// Rolldown resolves bare 'events' to a bundled polyfill where Rollup left it
// external (nothing else under src/ imports a Node builtin - confirmed by
// grep). Explicit per .memory-bank/adr/2026-08-28-vite-for-library-builds.md.
const { external } = createExternalPredicate({ pkg, nodeBuiltins: ['events'] });

// The Rollup build resolved bare `domain/*`, `application/*`,
// `infrastructure/*`, `utilities` and `types` imports via
// @rollup/plugin-typescript's TS-aware resolveId (which honors tsconfig
// `paths`). Rolldown's native TS transform does not do this, so these
// aliases are derived from the same tsconfig `paths` (see
// build-config/path-aliases.mjs).
const pathAliases = createPathAliases(rootDir);

const ketRawTextPlugin = createRawTextPlugin({
  name: 'ketcher-core-ket-raw-text',
  extension: '.ket',
});

const output = (format, entryFileNames) => ({
  dir: 'dist',
  format,
  exports: 'named',
  banner: license,
  preserveModules: true,
  preserveModulesRoot: 'src',
  entryFileNames,
});

export default defineConfig({
  resolve: {
    alias: pathAliases,
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(
      isProduction ? mode.PRODUCTION : mode.DEVELOPMENT,
    ),
  },
  plugins: [ketRawTextPlugin],
  build: {
    // Rolldown minifies library output by default; Rollup did not. Publishing
    // minified library code breaks downstream stack traces and makes output
    // diffing impossible. See
    // .memory-bank/adr/2026-08-28-vite-for-library-builds.md.
    minify: false,
    // Current builds run `rollup -c -m true`. See
    // .memory-bank/adr/2026-08-28-vite-for-library-builds.md.
    sourcemap: true,
    emptyOutDir: false,
    // Vite only skips wrapping dynamic import() in its browser-only preload
    // helper (window.dispatchEvent) when build.lib is set - modulePreload:
    // false alone does not suppress it. This is a library consumed from Node
    // (example-ssr) as well as the browser, and Rollup never injected this
    // wrapper, so `await import('./data/monomers.ket')` must stay a plain
    // dynamic import. The actual output shape (per-file preserveModules,
    // dual cjs/es, entryFileNames) is still fully specified below via
    // rolldownOptions.output, which takes precedence over anything build.lib
    // would otherwise derive.
    lib: {
      entry: resolve(rootDir, pkg.source),
      formats: ['cjs', 'es'],
    },
    modulePreload: false,
    rolldownOptions: {
      input: resolve(rootDir, pkg.source),
      external,
      // Tree-shaking is left at Rolldown's default. It was briefly disabled
      // here on the theory that preserveModules needs every preserved module
      // treated as a root, but measurement says otherwise: comparing the
      // export surface of all 489 baseline modules, disabling it drops exactly
      // the same exports as leaving it on, and the Rollup baseline emits fewer
      // files (489) than either Rolldown setting (525 on, 537 off) - so Rollup
      // itself tree-shook at least as aggressively as this does.
      output: [output('cjs', '[name].js'), output('es', '[name].modern.js')],
    },
  },
});
