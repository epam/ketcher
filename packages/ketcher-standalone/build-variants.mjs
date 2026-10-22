import { INDIGO_WORKER_IMPORTS } from '../../build-config/indigo-worker-imports.mjs';

// The six published build variants, selected by INDIGO_MODULE_NAME exactly as
// the Rollup build did. `dir` and `format` are part of the frozen published
// contract - see package.json's `exports` map. `separateIndigoRender` is read
// by scripts/build.mjs, which sets SEPARATE_INDIGO_RENDER for that build.
// Kept free of side effects so the build script can import it without
// loading the Vite config.
export const VARIANTS = {
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
    separateIndigoRender: true,
  },
  base64WithoutRenderCjs: {
    dir: 'dist/cjs/jsNoRender',
    format: 'cjs',
    indigo: 'indigo-ketcher/jsNoRender',
    worker: INDIGO_WORKER_IMPORTS.INLINE,
    separateIndigoRender: true,
  },
  wasmWithoutRender: {
    dir: 'dist/binaryWasmNoRender',
    format: 'es',
    indigo: 'indigo-ketcher/binaryWasmNoRender',
    worker: INDIGO_WORKER_IMPORTS.WORKER_URL,
    copyWasm: true,
    separateIndigoRender: true,
  },
};
