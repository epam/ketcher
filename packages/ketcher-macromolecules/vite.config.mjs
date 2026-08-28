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

const pkg = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
);

const isProduction = process.env.NODE_ENV === mode.PRODUCTION;

// Rollup's peerDepsExternal({ includeDependencies: true }) externalized every
// entry in `dependencies` and `peerDependencies`. No plugin equivalent exists
// for Rolldown, so it is reproduced by hand from package.json. Note that
// `ketcher-core` and `ketcher-react` are regular `dependencies` here (not
// peer), so `includeDependencies: true` externalized them too - this package
// never bundles its sibling packages, always importing them from
// node_modules at runtime.
const packageExternals = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];

// Grep of src/ found no Node builtin imports in this package (unlike
// ketcher-core, which needed `events`), so no Node-builtin externals list is
// needed here. Left as an explicit empty array so the omission is visible
// rather than silent.
const nodeBuiltinExternals = [];

const allExternals = [...packageExternals, ...nodeBuiltinExternals];

// peerDepsExternal externalizes a package's deep imports too (e.g.
// `lodash/fp`), not just the bare package name. Rolldown's `external` array
// only does exact-string matching, so this is reproduced as a predicate
// function, mirroring ketcher-core/vite.config.mjs.
const external = (id) =>
  allExternals.some((dep) => id === dep || id.startsWith(`${dep}/`));

// rollup-plugin-tsconfig-paths resolved this package's tsconfig.json `paths`
// aliases at bundle time. Rolldown's native TS transform does not do this,
// so it is reproduced explicitly here from the same tsconfig.json paths.
//
// The `ketcher-react`/`ketcher-react/*` entries in tsconfig `paths` are
// intentionally NOT mirrored here: that mapping points at
// `src/types/ketcher-react.d.ts`, an ambient `declare module 'ketcher-react'`
// used only to give TypeScript richer types for the *real* `ketcher-react`
// package. It must stay external at runtime (confirmed against the Rollup
// baseline: `dist/index.js`/`dist/index.modern.js` both still import the
// real `ketcher-react` package, not the local shim).
const srcDir = resolve(new URL('.', import.meta.url).pathname, 'src');

const pathAliases = [
  { find: /^components(\/.*)?$/, replacement: `${srcDir}/components$1` },
  { find: /^state(\/.*)?$/, replacement: `${srcDir}/state$1` },
  { find: /^hooks$/, replacement: `${srcDir}/hooks` },
  { find: /^assets(\/.*)?$/, replacement: `${srcDir}/assets$1` },
  { find: /^theming(\/.*)?$/, replacement: `${srcDir}/theming$1` },
  { find: /^helpers(\/.*)?$/, replacement: `${srcDir}/helpers$1` },
  { find: /^src(\/.*)?$/, replacement: `${srcDir}$1` },
];

// rollup-plugin-string has no Rolldown equivalent (per SPEC.md): a small
// inline transform imports `.ket` files as raw-text default exports, matching
// rollup-plugin-string's output shape. Copied from ketcher-core/vite.config.mjs
// rather than shared, per SPEC.md's no-cross-package-import constraint.
const ketRawTextPlugin = () => ({
  name: 'ketcher-macromolecules-ket-raw-text',
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
    ketRawTextPlugin(),
    emotionBabelPlugin(),
  ],
  build: {
    // Rolldown minifies library output by default; Rollup did not. Publishing
    // minified library code breaks downstream stack traces and makes output
    // diffing impossible. Per SPEC.md.
    minify: false,
    // The Rollup baseline always ran with NODE_ENV=production (the `build`
    // script hardcodes it) and minified only its extracted CSS
    // (`rollup-plugin-postcss`'s `minimize: isProduction`), independent of
    // JS minification. `build.cssMinify` defaults to `build.minify` in Vite,
    // which would turn CSS minification off too if left alone - set
    // explicitly so it tracks the same isProduction flag the Rollup config
    // used, not the JS minify setting.
    cssMinify: isProduction,
    // Current builds run `rollup -c -m true`. Per SPEC.md.
    sourcemap: true,
    emptyOutDir: false,
    lib: {
      entry: resolve(new URL('.', import.meta.url).pathname, pkg.source),
      formats: ['cjs', 'es'],
      fileName: (format) => (format === 'cjs' ? 'index.js' : 'index.modern.js'),
      // Single-file bundled output (unlike ketcher-core's preserveModules) -
      // the CSS extracted alongside it must land at the frozen
      // `dist/index.css` path both formats' banners `require`/`import`.
      cssFileName: 'index',
    },
    modulePreload: false,
    rolldownOptions: {
      input: resolve(new URL('.', import.meta.url).pathname, pkg.source),
      external,
      // Tree-shaking is left at Rolldown's default per SPEC.md - it was
      // measured and rejected for ketcher-core, and this package is not
      // preserveModules so the concern that motivated even trying it there
      // does not apply here.
      output: [output('cjs', 'index.js'), output('es', 'index.modern.js')],
    },
  },
});
