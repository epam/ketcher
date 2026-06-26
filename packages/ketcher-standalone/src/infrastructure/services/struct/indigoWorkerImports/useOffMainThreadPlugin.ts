// this import processed by '@surma/rollup-plugin-off-main-thread' plugin
// check rollup.config.mjs to see how different build types are handled.
// This plugin can not result cjs modules.

export const indigoWorker: Worker = new Worker(
  new URL('./../indigoWorker.ts', import.meta.url),
  { type: 'module' },
);
