globalThis.structuredClone ??= require('node:vm').runInThisContext(
  'globalThis.structuredClone',
);
globalThis.TextDecoder ??= require('node:util').TextDecoder;

jest.mock('paper', () => {
  return {};
});
