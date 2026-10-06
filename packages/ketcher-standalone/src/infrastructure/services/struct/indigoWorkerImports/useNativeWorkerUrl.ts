// `new Worker(new URL(...), { type: 'module' })` is the form Vite recognises
// natively, so the worker is emitted as a separate chunk and fetched at
// runtime. This is the shim the two binaryWasm variants use - see
// INDIGO_WORKER_IMPORTS in build-config/indigo-worker-imports.mjs.
// It cannot produce cjs output.

let _indigoWorker: Worker | null = null;

export function getIndigoWorker(): Worker {
  if (!_indigoWorker) {
    _indigoWorker = new Worker(
      new URL('./../indigoWorker.ts', import.meta.url),
      { type: 'module' },
    );
  }
  return _indigoWorker;
}
