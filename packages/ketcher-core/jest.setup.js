globalThis.structuredClone ??= require('node:vm').runInThisContext(
  'globalThis.structuredClone',
);

jest.mock('paper', () => {
  return {};
});
