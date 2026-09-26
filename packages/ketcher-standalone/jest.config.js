module.exports = {
  clearMocks: true,
  testMatch: ['**/__tests__/**/?(*.)+(spec|test).+(ts|js)'],
  testPathIgnorePatterns: ['dist', 'node_modules'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.(js|ts)$': 'ts-jest',
  },
  moduleNameMapper: {
    // Resolved at build time via `resolve.alias` in vite.config.mjs; for unit
    // tests it is pointed at a minimal fake worker instead (see the
    // __mocks__ directory next to the test that needs it).
    '^_indigo-worker-import-alias_$':
      '<rootDir>/__tests__/__mocks__/indigoWorkerAlias.ts',
    // ketcher-core's dist bundle re-exports its render tools, which import
    // d3 as an ESM-only package; mirrors ketcher-core/ketcher-react's own
    // jest config so importing from 'ketcher-core' works under ts-jest/CJS.
    '^d3$': '<rootDir>/../../node_modules/d3/dist/d3.min.js',
  },
};
