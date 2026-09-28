// Tests exercise the full multi-language build regardless of the production
// default, since the i18n parity/regression guards (src/i18n/i18n.test.ts)
// need every registered language's resource bundle loaded to check it.
process.env.KETCHER_MULTI_LANGUAGE_BUILD = 'true';

jest.mock('paper', () => {
  return {};
});

globalThis.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
