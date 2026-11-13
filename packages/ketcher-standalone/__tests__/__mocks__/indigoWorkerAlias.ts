/**
 * Test double for the `_indigo-worker-import-alias_` module, which is only
 * resolvable at build time via the `resolve.alias` config in
 * `vite.config.mjs` (see `indigoWorkerAlias.d.ts`). Unit tests map the alias
 * to this file instead (see jest.config.js's `moduleNameMapper`) and get a
 * fake `Worker` that never posts anything back, which is enough for tests
 * that only care about what `StandaloneStructService` does before it talks
 * to the worker.
 */
export function getIndigoWorker(): Worker {
  return {
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    postMessage: () => undefined,
    terminate: () => undefined,
  } as unknown as Worker;
}
