globalThis.structuredClone ??= require('node:vm').runInThisContext(
  'globalThis.structuredClone',
);

jest.mock('paper', () => {
  return {};
});

globalThis.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
