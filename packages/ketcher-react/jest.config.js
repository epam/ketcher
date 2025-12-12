module.exports = {
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
    '^ketcher-core$': '<rootDir>/../ketcher-core/src',
    '^application(.*)$': '<rootDir>/../ketcher-core/src/application$1',
    '^domain(.*)$': '<rootDir>/../ketcher-core/src/domain$1',
    '^infrastructure(.*)$': '<rootDir>/../ketcher-core/src/infrastructure$1',
    '^utilities(.*)$': '<rootDir>/../ketcher-core/src/utilities$1',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  setupFiles: ['./jest.setup.js'],
};
