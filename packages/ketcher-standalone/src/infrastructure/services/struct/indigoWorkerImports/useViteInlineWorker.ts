// Vite's `?worker&inline` bundles the worker and embeds it as a Blob, so no
// separate request is made for it. This is the shim the four base64 variants
// use - see INDIGO_WORKER_IMPORTS in build-config/indigo-worker-imports.mjs.
// It can produce cjs output.

import IndigoWorker from './../indigoWorker?worker&inline';

// A new worker on every call: the caller owns it. Services that share a worker
// overwrite each other's `onmessage`, and `destroy()` of one would terminate
// the worker of the others.
export function getIndigoWorker(): Worker {
  return new IndigoWorker();
}
