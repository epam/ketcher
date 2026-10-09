import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
import autoprefixer from 'autoprefixer';
import emotion from '@rolldown/plugin-emotion';
import { BROWSER_BUILD_TARGET } from '../../build-config/browser-target.mjs';
import {
  mode,
  createReplaceValues,
} from '../../build-config/replace-values.mjs';
import { createTsconfigPathResolution } from '../../build-config/tsconfig-path-resolution.mjs';
import { createExternalPredicate } from '../../build-config/external-predicate.mjs';
import { createRawTextPlugin } from '../../build-config/raw-text-plugin.mjs';

const pkg = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
);

const isProduction = process.env.NODE_ENV === mode.PRODUCTION;
const rootDir = fileURLToPath(new URL('.', import.meta.url));

// Note that `ketcher-core` and `ketcher-react` are regular `dependencies`
// here (not peer), so peerDepsExternal's `includeDependencies: true`
// externalized them too - this package never bundles its sibling packages,
// always importing them from node_modules at runtime. Grep of src/ found no
// Node builtin imports in this package (unlike ketcher-core, which needed
// `events`), so no Node-builtin externals are passed here.
const { external } = createExternalPredicate({ pkg });

const ketRawTextPlugin = createRawTextPlugin({
  name: 'ketcher-macromolecules-ket-raw-text',
  extension: '.ket',
});

const valuesToReplace = createReplaceValues({
  version: pkg.version,
  isProduction,
});

const cssBanner = {
  cjs: `require('./index.css');`,
  es: `import './index.css';`,
};

const output = (format, entryFileNames) => ({
  format,
  exports: 'named',
  banner: cssBanner[format],
  entryFileNames,
});

export default defineConfig({
  ...createTsconfigPathResolution(),
  css: {
    // rollup-plugin-postcss's default CSS-modules class name pattern -
    // Vite's own default differs, which would break consumers (and tests)
    // matching on class names like `ActionButton-module_selected__<hash>`.
    modules: {
      generateScopedName: '[name]_[local]__[hash:base64:5]',
    },
    postcss: {
      plugins: [autoprefixer({ grid: 'autoplace' })],
    },
  },
  define: valuesToReplace,
  plugins: [
    svgr({ include: '**/*.svg' }),
    ketRawTextPlugin,
    emotion({
      // Source maps embed absolute paths into Emotion's serialized styles,
      // which makes class-name hashes in snapshots machine-dependent.
      sourceMap: !isProduction && !process.env.VITEST,
      autoLabel: 'dev-only',
      labelFormat: '[local]',
    }),
  ],
  build: {
    target: BROWSER_BUILD_TARGET,
    // Rolldown minifies library output by default; Rollup did not. Publishing
    // minified library code breaks downstream stack traces and makes output
    // diffing impossible. See
    // .memory-bank/adr/2026-08-28-vite-for-library-builds.md.
    minify: false,
    // `build.cssMinify` tracks `isProduction` (matching the Rollup
    // baseline's `rollup-plugin-postcss` `minimize: isProduction`, which was
    // independent of JS minification) rather than defaulting to
    // `build.minify`, which would turn CSS minification off too. See
    // .memory-bank/adr/2026-08-28-vite-for-library-builds.md.
    cssMinify: isProduction,
    sourcemap: !isProduction,
    emptyOutDir: false,
    lib: {
      entry: resolve(rootDir, pkg.source),
      formats: ['cjs', 'es'],
      fileName: (format) => (format === 'cjs' ? 'index.js' : 'index.modern.js'),
      // Single-file bundled output (unlike ketcher-core's preserveModules) -
      // the CSS extracted alongside it must land at the frozen
      // `dist/index.css` path both formats' banners `require`/`import`.
      cssFileName: 'index',
    },
    modulePreload: false,
    rolldownOptions: {
      input: resolve(rootDir, pkg.source),
      external,
      // Tree-shaking is left at Rolldown's default. It was measured and
      // rejected for ketcher-core, and this package is not preserveModules
      // so the concern that motivated even trying it there does not apply
      // here.
      output: [output('cjs', 'index.js'), output('es', 'index.modern.js')],
    },
  },
});
