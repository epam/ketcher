// Vite's `?worker&inline` bundles the worker and embeds it as a Blob, so no
// separate request is made for it. This is the shim the four base64 variants
// use - see INDIGO_WORKER_IMPORTS in build-config/indigo-worker-imports.mjs.
// It can produce cjs output.

import IndigoWorker from './../indigoWorker?worker&inline';

let _indigoWorker: InstanceType<typeof IndigoWorker> | null = null;

export function getIndigoWorker(): Worker {
  if (!_indigoWorker) {
    _indigoWorker = new IndigoWorker();
  }
  return _indigoWorker;
}
