import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { license } from '../../license-banner.mjs';
import { mode } from '../../build-config/replace-values.mjs';

const pkg = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
);

const isProduction = process.env.NODE_ENV === mode.PRODUCTION;

// Rollup's peerDepsExternal({ includeDependencies: true }) externalized every
// entry in `dependencies` and `peerDependencies`. No plugin equivalent exists
// for Rolldown, so it is reproduced by hand from package.json.
const packageExternals = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];

// Rolldown resolves bare 'events' to a bundled polyfill where Rollup left it
// external (nothing else under src/ imports a Node builtin - confirmed by
// grep). Explicit per SPEC.md.
const nodeBuiltinExternals = ['events'];

const allExternals = [...packageExternals, ...nodeBuiltinExternals];

// peerDepsExternal externalizes a package's deep imports too (e.g.
// `ajv/dist/runtime/ucs2length`, `lodash/fp`), not just the bare package
// name. Rolldown's `external` array only does exact-string matching, so this
// is reproduced as a predicate function.
const external = (id) =>
  allExternals.some((dep) => id === dep || id.startsWith(`${dep}/`));

// The Rollup build resolved bare `domain/*`, `application/*`,
// `infrastructure/*`, `utilities` and `types` imports via
// @rollup/plugin-typescript's TS-aware resolveId (which honors tsconfig
// `paths`). Rolldown's native TS transform does not do this, so it is
// reproduced explicitly here from the same tsconfig.json paths.
const srcDir = resolve(new URL('.', import.meta.url).pathname, 'src');

const pathAliases = [
  { find: /^domain(\/.*)?$/, replacement: `${srcDir}/domain$1` },
  { find: /^application(\/.*)?$/, replacement: `${srcDir}/application$1` },
  {
    find: /^infrastructure(\/.*)?$/,
    replacement: `${srcDir}/infrastructure$1`,
  },
  { find: /^utilities$/, replacement: `${srcDir}/utilities` },
  { find: /^types$/, replacement: `${srcDir}/types` },
];

// rollup-plugin-string has no Rolldown equivalent (per SPEC.md): a small
// inline transform imports `.ket` files as raw-text default exports, matching
// rollup-plugin-string's output shape.
const ketRawTextPlugin = () => ({
  name: 'ketcher-core-ket-raw-text',
  transform(_code, id) {
    if (!id.endsWith('.ket')) {
      return null;
    }

    const content = readFileSync(id, 'utf8');

    return {
      code: `export default ${JSON.stringify(content)};`,
      map: null,
    };
  },
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
  plugins: [ketRawTextPlugin()],
  build: {
    // Rolldown minifies library output by default; Rollup did not. Publishing
    // minified library code breaks downstream stack traces and makes output
    // diffing impossible. Per SPEC.md.
    minify: false,
    // Current builds run `rollup -c -m true`. Per SPEC.md.
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
      entry: resolve(new URL('.', import.meta.url).pathname, pkg.source),
      formats: ['cjs', 'es'],
    },
    modulePreload: false,
    rolldownOptions: {
      input: resolve(new URL('.', import.meta.url).pathname, pkg.source),
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
