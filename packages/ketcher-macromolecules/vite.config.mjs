import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
import autoprefixer from 'autoprefixer';
import * as babel from '@babel/core';
import {
  mode,
  createReplaceValues,
} from '../../build-config/replace-values.mjs';
import { createExternalPredicate } from '../../build-config/external-predicate.mjs';
import { createPathAliases } from '../../build-config/path-aliases.mjs';
import { createRawTextPlugin } from '../../build-config/raw-text-plugin.mjs';

const pkg = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
);

const isProduction = process.env.NODE_ENV === mode.PRODUCTION;
const rootDir = new URL('.', import.meta.url).pathname;

// Note that `ketcher-core` and `ketcher-react` are regular `dependencies`
// here (not peer), so peerDepsExternal's `includeDependencies: true`
// externalized them too - this package never bundles its sibling packages,
// always importing them from node_modules at runtime. Grep of src/ found no
// Node builtin imports in this package (unlike ketcher-core, which needed
// `events`), so no Node-builtin externals are passed here.
const { external } = createExternalPredicate({ pkg });

// The `ketcher-react`/`ketcher-react/*` entries in tsconfig `paths` are
// intentionally NOT part of this package's build aliases (see
// tsconfig.build.json, which the shared helper reads): that mapping points
// at `src/types/ketcher-react.d.ts`, an ambient `declare module
// 'ketcher-react'` used only to give TypeScript richer types for the *real*
// `ketcher-react` package. It must stay external at runtime (confirmed
// against the Rollup baseline: `dist/index.js`/`dist/index.modern.js` both
// still import the real `ketcher-react` package, not the local shim).
const srcDir = resolve(rootDir, 'src');
const pathAliases = createPathAliases(rootDir);

const ketRawTextPlugin = createRawTextPlugin({
  name: 'ketcher-macromolecules-ket-raw-text',
  extension: '.ket',
});

// Reproduces the one Babel plugin the SPEC says to keep: Emotion's, for
// stable class names (the suite is screenshot-based). Everything else
// Babel-related (the `.babelrc` presets, `@babel/plugin-transform-runtime`,
// `@babel/runtime`) is dropped - Rolldown's native TS/JSX transform (which
// honors this package's tsconfig `jsx`/`jsxImportSource` settings) replaces
// them.
//
// In the Rollup baseline, Babel ran *after* TS-to-JS transpilation
// (`rollup-plugin-typescript2`), i.e. on code whose JSX had already been
// compiled to `jsx()`/`jsxs()` calls by TS's own `jsx: "react-jsx"` setting.
// Emotion's babel plugin does not need raw JSX to do its job - it rewrites
// `styled(...)`/`css` tagged-template call sites, which survive JSX
// compilation unchanged - so running it here, after Rolldown's own transform
// step, on plain JS, reproduces that ordering.
const emotionBabelPlugin = () => ({
  name: 'ketcher-macromolecules-emotion-babel',
  transform(code, id) {
    if (!id.startsWith(srcDir) || id.includes('node_modules')) {
      return null;
    }

    if (!/\.(js|jsx|ts|tsx)$/.test(id.split('?')[0])) {
      return null;
    }

    const result = babel.transformSync(code, {
      babelrc: false,
      configFile: false,
      filename: id,
      sourceType: 'module',
      plugins: ['@emotion/babel-plugin'],
      sourceMaps: true,
    });

    if (!result || result.code === code) {
      return null;
    }

    return { code: result.code, map: result.map };
  },
});

const valuesToReplace = createReplaceValues({
  version: pkg.version,
  isProduction,
  helpLink: process.env.HELP_LINK || 'master',
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
  resolve: {
    alias: pathAliases,
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
  },
  css: {
    postcss: {
      plugins: [autoprefixer({ grid: 'autoplace' })],
    },
  },
  define: valuesToReplace,
  plugins: [
    svgr({ include: '**/*.svg' }),
    ketRawTextPlugin,
    emotionBabelPlugin(),
  ],
  build: {
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
    // Current builds run `rollup -c -m true`. See
    // .memory-bank/adr/2026-08-28-vite-for-library-builds.md.
    sourcemap: true,
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
