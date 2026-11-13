// `new Worker(new URL(...), { type: 'module' })` is the form Vite recognises
// natively, so the worker is emitted as a separate chunk and fetched at
// runtime. This is the shim the two binaryWasm variants use - see
// INDIGO_WORKER_IMPORTS in build-config/indigo-worker-imports.mjs.
// It cannot produce cjs output.

// A new worker on every call: the caller owns it. Services that share a worker
// overwrite each other's `onmessage`, and `destroy()` of one would terminate
// the worker of the others.
export function getIndigoWorker(): Worker {
  return new Worker(new URL('./../indigoWorker.ts', import.meta.url), {
    type: 'module',
  });
}
