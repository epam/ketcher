import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { license } from '../../license-banner.mjs';
import { mode } from '../../build-config/replace-values.mjs';
import { createExternalPredicate } from '../../build-config/external-predicate.mjs';
import { INDIGO_WORKER_IMPORTS } from '../../build-config/indigo-worker-imports.mjs';

const pkg = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
);

const isProduction = process.env.NODE_ENV === mode.PRODUCTION;
const rootDir = new URL('.', import.meta.url).pathname;

// INDIGO_WORKER_IMPORTS paths are relative to the directory that performs the
// `_indigo-worker-import-alias_` import, so they are resolved against it here.
const workerShim = (shim) =>
  resolve(rootDir, 'src/infrastructure/services/struct', shim);

// The six published build variants, selected by INDIGO_MODULE_NAME exactly as
// the Rollup build did. `dir` and `format` are part of the frozen published
// contract - see package.json's `exports` map.
const VARIANTS = {
  base64: {
    dir: 'dist',
    format: 'es',
    indigo: 'indigo-ketcher',
    worker: INDIGO_WORKER_IMPORTS.INLINE,
    clean: true,
  },
  base64Cjs: {
    dir: 'dist/cjs',
    format: 'cjs',
    indigo: 'indigo-ketcher',
    worker: INDIGO_WORKER_IMPORTS.INLINE,
  },
  wasm: {
    dir: 'dist/binaryWasm',
    format: 'es',
    indigo: 'indigo-ketcher/binaryWasm',
    worker: INDIGO_WORKER_IMPORTS.WORKER_URL,
    copyWasm: true,
  },
  base64WithoutRender: {
    dir: 'dist/jsNoRender',
    format: 'es',
    indigo: 'indigo-ketcher/jsNoRender',
    worker: INDIGO_WORKER_IMPORTS.INLINE,
  },
  base64WithoutRenderCjs: {
    dir: 'dist/cjs/jsNoRender',
    format: 'cjs',
    indigo: 'indigo-ketcher/jsNoRender',
    worker: INDIGO_WORKER_IMPORTS.INLINE,
  },
  wasmWithoutRender: {
    dir: 'dist/binaryWasmNoRender',
    format: 'es',
    indigo: 'indigo-ketcher/binaryWasmNoRender',
    worker: INDIGO_WORKER_IMPORTS.WORKER_URL,
    copyWasm: true,
  },
};

const variant = VARIANTS[process.env.INDIGO_MODULE_NAME] || VARIANTS.base64;

const { external } = createExternalPredicate({ pkg, nodeBuiltins: ['events'] });

// The two fetch-based variants exist precisely so the .wasm is downloaded at
// runtime instead of embedded. Indigo's emscripten glue locates it with
// `new URL('<name>.wasm', import.meta.url)`, which Vite's asset pipeline
// rewrites - and in library mode it inlines every asset it rewrites,
// regardless of `assetsInlineLimit` (see shouldInline in vite's asset plugin:
// `if (environment.config.build.lib) return true`). That would collapse these
// two variants into the base64 ones and add ~16 MB to the worker chunk.
//
// `?no-inline` is the one escape hatch checked ahead of that lib-mode branch,
// so tagging the reference makes Vite emit the .wasm as a real file and point
// the URL at it. That replaces the Rollup build's rollup-plugin-copy step,
// and is strictly safer than it was: the emitted path and the URL now come
// from the same rewrite instead of relying on a copy glob matching by hand.
// (That glob silently matched nothing for three weeks - see the fix in
// commit 964c0f36.)
const wasmUrlRE = /(new URL\((["'])[^"']+\.wasm)(\2,\s*import\.meta\.url\))/g;

const noInlineWasmPlugin = () => ({
  name: 'ketcher-standalone-no-inline-wasm',
  enforce: 'pre',
  transform(code, id) {
    if (!id.includes('indigo-ketcher')) return null;
    wasmUrlRE.lastIndex = 0;
    if (!wasmUrlRE.test(code)) return null;
    wasmUrlRE.lastIndex = 0;
    return code.replace(wasmUrlRE, '$1?no-inline$3');
  },
});

export default defineConfig({
  // These bundles are consumed from `node_modules/ketcher-standalone/dist/...`,
  // not served from a site root. Vite's default `base: '/'` would emit the
  // worker and .wasm URLs as `/assets/...`, which only resolves if the
  // consumer happens to copy them to their web root. `'./'` makes both
  // resolve relative to the importing chunk, matching the Rollup baseline.
  base: './',
  resolve: {
    alias: {
      _indigo_ketcher_import_alias_: variant.indigo,
      '_indigo-ketcher-import-alias_': variant.indigo,
      '_indigo-worker-import-alias_': workerShim(variant.worker),
    },
    extensions: ['.mjs', '.js', '.mts', '.ts', '.json'],
  },
  define: {
    'process.env.SEPARATE_INDIGO_RENDER': JSON.stringify(
      process.env.SEPARATE_INDIGO_RENDER,
    ),
  },
  // Vite bundles workers through a separate plugin pipeline, so a plugin
  // registered under `plugins` never sees the worker's module graph - and the
  // indigo import that pulls in the .wasm lives entirely inside the worker.
  worker: {
    format: 'es',
    plugins: () => (variant.copyWasm ? [noInlineWasmPlugin()] : []),
  },
  build: {
    minify: false,
    sourcemap: true,
    emptyOutDir: Boolean(variant.clean),
    modulePreload: false,
    outDir: variant.dir,
    // Without build.lib, Vite builds this as an *app*: it tree-shakes the
    // public API away entirely (the bundle ends up with no `export` clause at
    // all) because nothing in the graph consumes it. The Rollup baseline
    // emitted `export { StandaloneStructService, ... }`, so the entry
    // signatures must be preserved.
    lib: {
      entry: {
        main: resolve(rootDir, 'src/index.ts'),
        index: resolve(rootDir, 'src/emptyIndex.js'),
      },
      formats: [variant.format],
    },
    rolldownOptions: {
      input: {
        main: resolve(rootDir, 'src/index.ts'),
        index: resolve(rootDir, 'src/emptyIndex.js'),
      },
      external,
      output: {
        dir: variant.dir,
        format: variant.format,
        exports: 'named',
        banner: license,
        entryFileNames: '[name].js',
      },
    },
  },
});
