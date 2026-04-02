// indigo-ketcher ships as CommonJS/AMD, but the worker build imports it as ESM.
// This shim normalizes both CJS and synthetic-default interop into one default export.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const indigoModule = require('_indigo-ketcher-import-alias_');

export default indigoModule.default || indigoModule;
