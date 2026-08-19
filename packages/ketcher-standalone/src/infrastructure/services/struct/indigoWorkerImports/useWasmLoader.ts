// this import processed by 'rollup-plugin-web-worker-loader' plugin
// check rollup.config.mjs to see how different build types are handled
// This plugin can result cjs modules.

import IndigoWorker from 'web-worker:./../indigoWorker';

let _indigoWorker: InstanceType<typeof IndigoWorker> | null = null;

export function getIndigoWorker(): Worker {
  if (!_indigoWorker) {
    _indigoWorker = new IndigoWorker();
  }
  return _indigoWorker;
}
