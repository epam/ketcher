import { readFileSync, mkdirSync, copyFileSync, globSync } from 'node:fs';
import { resolve, basename } from 'node:path';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
import autoprefixer from 'autoprefixer';
import { license } from '../../license-banner.mjs';
import {
  mode,
  createReplaceValues,
  getTagName,
} from '../../build-config/replace-values.mjs';
import { createExternalPredicate } from '../../build-config/external-predicate.mjs';
import { createPathAliases } from '../../build-config/path-aliases.mjs';
import { createRawTextPlugin } from '../../build-config/raw-text-plugin.mjs';

const pkg = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
);

const isProduction = process.env.NODE_ENV === mode.PRODUCTION;
const rootDir = new URL('.', import.meta.url).pathname;

// Note `ketcher-macromolecules` is intentionally NOT a `dependencies` entry
// here - it is only reached through the dynamic
// `import('ketcher-macromolecules')` in `src/Editor.tsx`, and was never
// externalized by peerDepsExternal either, so it stays bundled here exactly
// as it was under Rollup.
//
// `extraExternals: [pkg.name]` is needed because ketcher-macromolecules'
// compiled ESM entry (dist/index.modern.js, bundled here via the dynamic
// import in src/Editor.tsx) itself imports the real `ketcher-react` package
// - a documented circular-dependency workaround (see src/Editor.tsx's
// comment on why it types that import as `unknown`). Rollup only ever
// warned about this as an "unresolved dependency" and left it external;
// Rolldown hard-fails unless it is listed explicitly.
const { external } = createExternalPredicate({
  pkg,
  extraExternals: [pkg.name],
});

// rollup-plugin-typescript2 resolved this package's tsconfig.build.json
// `paths` (`components`, `src/*`) at bundle time via a TS-aware resolveId.
// Rolldown's native TS transform does not do this, so these aliases are
// derived from that same tsconfig.build.json (see
// build-config/path-aliases.mjs). `tsconfig.json`'s additional
// `ketcher-core`-internal aliases are IDE/typecheck-only (see tsconfig.json
// comments / notes) and must NOT be used for the actual build -
// tsconfig.build.json overrides `paths` entirely, so they are never read.
const pathAliases = createPathAliases(rootDir);

const sdfRawTextPlugin = createRawTextPlugin({
  name: 'ketcher-react-sdf-raw-text',
  extension: '.sdf',
});

// rollup-plugin-copy copied `src/style/*.svg` into `dist` as real files
// (distinct from the `vite-plugin-svgr`-handled `.svg`-as-React-component
// imports elsewhere in src). Verified empirically (per notes/ketcher-react.md)
// that this glob currently matches zero files, so this is a no-op today -
// preserved so the contract still holds if files are added later.
const copySvgAssetsPlugin = () => ({
  name: 'ketcher-react-copy-style-svgs',
  generateBundle() {
    const matches = globSync('src/style/*.svg', { cwd: rootDir });

    for (const match of matches) {
      const src = resolve(rootDir, match);
      const dest = resolve(rootDir, 'dist', basename(match));
      mkdirSync(resolve(rootDir, 'dist'), { recursive: true });
      copyFileSync(src, dest);
    }
  },
});

const valuesToReplace = createReplaceValues({
  version: pkg.version,
  isProduction,
  helpLink: getTagName(),
});

const output = (format, entryFileNames) => ({
  dir: format === 'cjs' ? 'dist/cjs' : 'dist',
  format,
  exports: 'named',
  banner: license,
  entryFileNames,
  // Rollup 2 emitted the `__esModule` marker on CJS output; Rolldown does not
  // by default. Without it, TypeScript's and Babel's interop treat this as a
  // non-ES module and build a namespace of non-configurable getters, changing
  // behaviour for every CJS consumer using interop. Restored explicitly.
  // (Ignored for the `es` output, where it has no meaning.)
  esModule: true,
  // Rolldown defaults chunk file extensions to `.mjs` for the `es` format's
  // code-split chunks (the dynamically-imported `ketcher-macromolecules`
  // bundle reached via `src/Editor.tsx`), unlike the Rollup baseline, which
  // used a plain `.js` extension for every emitted file regardless of
  // format. Forced back to `.js` to match.
  chunkFileNames: '[name]-[hash].js',
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
    sdfRawTextPlugin,
    copySvgAssetsPlugin(),
  ],
  build: {
    // Rolldown minifies library output by default; Rollup did not. Publishing
    // minified library code breaks downstream stack traces and makes output
    // diffing impossible. See
    // .memory-bank/adr/2026-08-28-vite-for-library-builds.md.
    minify: false,
    // `build.cssMinify` tracks `isProduction`, mirroring
    // ketcher-macromolecules/vite.config.mjs - see that file's comment and
    // .memory-bank/adr/2026-08-28-vite-for-library-builds.md.
    cssMinify: isProduction,
    // Current builds run `rollup -c -m true`. See
    // .memory-bank/adr/2026-08-28-vite-for-library-builds.md.
    sourcemap: true,
    emptyOutDir: false,
    // Vite only skips wrapping dynamic import() in its browser-only preload
    // helper (window.dispatchEvent) when build.lib is set - modulePreload:
    // false alone does not suppress it. `src/Editor.tsx` dynamically imports
    // `ketcher-macromolecules`, and Rollup never injected this wrapper, so
    // that import must stay a plain dynamic import.
    lib: {
      entry: resolve(rootDir, pkg.source),
      formats: ['cjs', 'es'],
      // Single-file bundled output (no preserveModules here, matching the
      // Rollup baseline) - the CSS extracted alongside it must land at the
      // frozen `dist/index.css` path referenced by package.json's
      // `./dist/index.css` export.
      cssFileName: 'index',
    },
    modulePreload: false,
    rolldownOptions: {
      input: resolve(rootDir, pkg.source),
      external,
      // Tree-shaking is left at Rolldown's default - it was measured and
      // rejected for ketcher-core, and this package is not preserveModules
      // so the concern that motivated even trying it there does not apply
      // here.
      output: [output('cjs', 'index.js'), output('es', 'index.js')],
    },
  },
});
