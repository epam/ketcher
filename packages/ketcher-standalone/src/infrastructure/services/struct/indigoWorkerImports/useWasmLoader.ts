// this import processed by 'rollup-plugin-web-worker-loader' plugin
// check rollup.config.js to see how different build types are handled
// This plugin can result cjs modules.

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import IndigoWorker from 'web-worker:./../indigoWorker';

export const indigoWorker = new IndigoWorker();
