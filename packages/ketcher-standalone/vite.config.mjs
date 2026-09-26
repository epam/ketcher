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

// In watch builds, an inlined worker is embedded as a Blob, so its sourcemap
// cannot be fetched: its `sourceMappingURL` resolves against a `blob:` origin.
// Strip these orphaned maps while retaining maps for emitted fetch-variant
// worker chunks.
const dropInlineWorkerMapsPlugin = () => ({
  name: 'ketcher-standalone-drop-inline-worker-maps',
  generateBundle(_options, bundle) {
    for (const fileName of Object.keys(bundle)) {
      if (/assets\/indigoWorker-[^/]+\.js\.map$/.test(fileName)) {
        delete bundle[fileName];
      }
    }
  },
});

// Rolldown emits cross-chunk asset references (the worker constructor in
// `main.js`, and the .wasm lookup inside the worker chunk itself, both from
// `?no-inline`/native-worker handling above) as a computed expression -
// `new URL("" + new URL('<file>', import.meta.url).href, "" +
// import.meta.url)` - so the URL still resolves correctly regardless of
// which chunk ends up referencing it. Consumer bundlers (webpack 5's
// asset-modules worker plugin, Vite's own `?worker` detection) only
// statically recognise the literal form - `new Worker(new URL('./file.js',
// import.meta.url), { type: 'module' })` and `new URL('./file.wasm',
// import.meta.url)` - and otherwise copy the call through unchanged, so the
// worker/.wasm are never emitted into the consumer's own build (#10326;
// see the ADR: .memory-bank/adr/2026-08-28-vite-for-library-builds.md;
// 404 at runtime). Both chunks in every `copyWasm` variant sit
// flat in the same `assets/` output directory (`base: './'`, no
// `preserveModules`), so the two forms resolve to the same URL here -
// rewriting the computed form to the literal one after the bundle is
// assembled is safe.
const workerUrlRE =
  /new Worker\(new URL\(\s*(?:\/\*\s*@vite-ignore\s*\*\/\s*)?"" \+ new URL\((["'])([^"']+)\1, import\.meta\.url\)\.href,\s*"" \+ import\.meta\.url\s*\), \{ type: "module" \}\)/g;

const wasmUrlHrefRE =
  /new URL\("" \+ new URL\((["'])([^"']+\.wasm)\1, import\.meta\.url\)\.href, "" \+ import\.meta\.url\)\.href/g;

// Rewrites every match of `regex` in `code` via its capture groups (passed
// straight through to `buildReplacement`, same signature as the function
// form of `String.prototype.replace`), returning how many replacements were
// made alongside the result. Counting and rewriting happen in the same
// `replace` pass instead of a `test()` + `replace()` pair, so there's only
// one place that needs to reset the shared regex's `lastIndex` (`test()`
// alone would otherwise require it twice: once before testing, once before
// replacing, since both advance the same stateful `g`-flagged regex).
const rewriteAndCount = (code, regex, buildReplacement) => {
  let count = 0;
  regex.lastIndex = 0;
  const result = code.replace(regex, (...matchArgs) => {
    count += 1;
    return buildReplacement(...matchArgs);
  });
  return { code: result, count };
};

const literalWorkerUrlPlugin = () => ({
  name: 'ketcher-standalone-literal-worker-url',
  generateBundle(_options, bundle) {
    let workerRewrites = 0;
    let wasmRewrites = 0;

    for (const file of Object.values(bundle)) {
      // The main lib entry (`main.js`, containing the `new Worker(...)`
      // call) comes through as a rollup/rolldown `chunk`. The worker itself
      // was already built by Vite's separate worker pipeline and is
      // injected here as a pre-built `asset` (its own `findWasmBinary()`
      // call lives in that asset's source) - so both shapes need checking.
      const isChunk = file.type === 'chunk';
      const isJsAsset = file.type === 'asset' && file.fileName.endsWith('.js');
      if (!isChunk && !isJsAsset) continue;

      const key = isChunk ? 'code' : 'source';
      const code = file[key];
      if (typeof code !== 'string') continue;

      const worker = rewriteAndCount(
        code,
        workerUrlRE,
        (_match, _quote, fileName) =>
          `new Worker(new URL('./${fileName}', import.meta.url), { type: 'module' })`,
      );
      workerRewrites += worker.count;

      const wasm = rewriteAndCount(
        worker.code,
        wasmUrlHrefRE,
        (_match, _quote, fileName) =>
          `new URL('./${fileName}', import.meta.url).href`,
      );
      wasmRewrites += wasm.count;

      file[key] = wasm.code;
    }

    // This plugin is only ever wired in for the two `copyWasm` variants
    // (see `plugins:` below), where both patterns MUST appear somewhere in
    // the bundle - the worker constructor in `main.js`, the wasm lookup
    // inside the worker chunk. Silently emitting 0 rewrites would mean
    // Rolldown changed how it renders these cross-chunk references and this
    // plugin stopped matching anything, silently reintroducing the #10326
    // regression fixed here (see the comment above `workerUrlRE`, and the
    // ADR: .memory-bank/adr/2026-08-28-vite-for-library-builds.md) with no
    // build-time signal at all.
    if (workerRewrites === 0 || wasmRewrites === 0) {
      this.error(
        'ketcher-standalone-literal-worker-url: expected at least one ' +
          `worker-URL and one wasm-URL rewrite in this copyWasm build, got ` +
          `${workerRewrites} worker rewrite(s) and ${wasmRewrites} wasm ` +
          'rewrite(s). The computed-URL patterns this plugin matches no ' +
          'longer appear in the bundle - either the fix (#10326) is ' +
          'silently broken or Rolldown changed its output shape and the ' +
          'regexes need updating.',
      );
    }
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
  plugins: variant.copyWasm
    ? [literalWorkerUrlPlugin()]
    : [dropInlineWorkerMapsPlugin()],
  build: {
    minify: false,
    sourcemap: !isProduction,
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
        // Rollup 2 emitted the `__esModule` marker on CJS output; Rolldown
        // does not by default. Without it, TypeScript's and Babel's interop
        // treat this as a non-ES module and build a namespace of
        // NON-CONFIGURABLE getters, silently changing behaviour for every
        // CJS consumer using interop. Restored explicitly, matching
        // ketcher-core/ketcher-react's vite.config.mjs. (Ignored for the
        // `es` format variants, where it has no meaning.)
        esModule: true,
      },
    },
  },
});
