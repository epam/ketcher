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

const pkg = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
);

const isProduction = process.env.NODE_ENV === mode.PRODUCTION;
const rootDir = new URL('.', import.meta.url).pathname;

// Rollup's peerDepsExternal({ includeDependencies: true }) externalized every
// entry in `dependencies` and `peerDependencies`. No plugin equivalent exists
// for Rolldown, so it is reproduced by hand from package.json. Note
// `ketcher-macromolecules` is intentionally NOT a `dependencies` entry here -
// it is only reached through the dynamic `import('ketcher-macromolecules')`
// in `src/Editor.tsx`, and was never externalized by peerDepsExternal
// either, so it stays bundled here exactly as it was under Rollup.
const packageExternals = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
  // ketcher-macromolecules' compiled ESM entry (dist/index.modern.js, bundled
  // here via the dynamic import in src/Editor.tsx) itself imports the real
  // `ketcher-react` package - a documented circular-dependency workaround
  // (see src/Editor.tsx's comment on why it types that import as `unknown`).
  // Rollup only ever warned about this as an "unresolved dependency" and left
  // it external; Rolldown hard-fails unless it is listed explicitly.
  pkg.name,
];

// Grep of src/ found no Node builtin imports in this package (unlike
// ketcher-core, which needed `events`), so no Node-builtin externals list is
// needed here. Left as an explicit empty array so the omission is visible
// rather than silent, mirroring ketcher-macromolecules/vite.config.mjs.
const nodeBuiltinExternals = [];

const allExternals = [...packageExternals, ...nodeBuiltinExternals];

// peerDepsExternal externalizes a package's deep imports too (e.g.
// `lodash/fp`), not just the bare package name. Rolldown's `external` array
// only does exact-string matching, so this is reproduced as a predicate
// function, mirroring ketcher-core/vite.config.mjs and
// ketcher-macromolecules/vite.config.mjs.
const external = (id) =>
  allExternals.some((dep) => id === dep || id.startsWith(`${dep}/`));

// rollup-plugin-typescript2 resolved this package's tsconfig.build.json
// `paths` (`components`, `src/*`) at bundle time via a TS-aware resolveId.
// Rolldown's native TS transform does not do this, so it is reproduced
// explicitly here from the same tsconfig.build.json paths, mirroring the
// other two packages. `tsconfig.json`'s additional `ketcher-core`-internal
// aliases are IDE/typecheck-only (see tsconfig.json comments / notes) and
// must NOT be used for the actual build.
const srcDir = resolve(rootDir, 'src');

const pathAliases = [
  { find: /^components$/, replacement: `${srcDir}/components` },
  { find: /^src(\/.*)?$/, replacement: `${srcDir}$1` },
];

// rollup-plugin-string has no Rolldown equivalent (per SPEC.md): a small
// inline transform imports `.sdf` files (chemical structure template data,
// this package's raw-text extension - `.ket` in ketcher-core/macromolecules)
// as raw-text default exports, matching rollup-plugin-string's output shape.
const sdfRawTextPlugin = () => ({
  name: 'ketcher-react-sdf-raw-text',
  transform(_code, id) {
    if (!id.endsWith('.sdf')) {
      return null;
    }

    const content = readFileSync(id, 'utf8');

    return {
      code: `export default ${JSON.stringify(content)};`,
      map: null,
    };
  },
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
    sdfRawTextPlugin(),
    copySvgAssetsPlugin(),
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
    // explicitly, mirroring ketcher-macromolecules/vite.config.mjs.
    cssMinify: isProduction,
    // Current builds run `rollup -c -m true`. Per SPEC.md.
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
      // Tree-shaking is left at Rolldown's default per SPEC.md - it was
      // measured and rejected for ketcher-core, and this package is not
      // preserveModules so the concern that motivated even trying it there
      // does not apply here.
      output: [output('cjs', 'index.js'), output('es', 'index.js')],
    },
  },
});
