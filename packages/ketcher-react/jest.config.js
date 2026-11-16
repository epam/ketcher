module.exports = {
  cache: false,
  clearMocks: true,
  testMatch: ['**/src/**/?(*.)+(spec|test).[jt]s?(x)'],
  testPathIgnorePatterns: ['fixtures', 'dist', 'node_modules'],
  testEnvironment: 'jsdom',
  transform: {
    '\\.(js|jsx)$': 'babel-jest',
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '\\.svg$': '<rootDir>/testFileTransformer.js',
  },
  moduleNameMapper: {
    '\\.(css|less|sdf)$': 'identity-obj-proxy',
    '^src(.*)$': '<rootDir>/src/$1',
    '^components$': '<rootDir>/src/components',
    '^d3$': '<rootDir>/../../node_modules/d3/dist/d3.min.js',
    // intl-messageformat@10 sits in the workspace-local node_modules while
    // i18next-icu is hoisted to root node_modules; resolve explicitly so Jest
    // can bridge the two. Consumers get intl-messageformat hoisted to their own
    // node_modules (CJS) and need no extra config.
    '^intl-messageformat$': require.resolve('intl-messageformat'),
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  setupFiles: ['./jest.setup.js'],
};
