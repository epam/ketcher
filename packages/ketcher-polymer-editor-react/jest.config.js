module.exports = {
  testMatch: ['**/src/**/?(*.)+(spec|test).[jt]s?(x)'],
  testPathIgnorePatterns: ['fixtures', 'dist', 'node_modules'],
  testEnvironment: 'jsdom',
  transform: {
    '\\.(js|jsx)$': 'babel-jest',
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '\\.svg$': '<rootDir>/src/testFileTransformer.js'
  },
  moduleNameMapper: {
    '\\.(css|less)$': 'identity-obj-proxy',
    '^components(.*)$': '<rootDir>/src/components/$1',
    '^state(.*)$': '<rootDir>/src/state/$1',
    '^styles(.*)$': '<rootDir>/src/styles/$1',
    '^hooks(.*)$': '<rootDir>/src/hooks/$1',
    '^icons(.*)$': '<rootDir>/src/icons/$1',
    '^test-utils(.*)$': '<rootDir>/src/test-utils/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/src/testsSetup.ts']
}
