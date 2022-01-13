module.exports = {
  testMatch: ['**/src/**/?(*.)+(spec|test).[jt]s?(x)'],
  testPathIgnorePatterns: ['fixtures', 'dist', 'node_modules'],
  testEnvironment: 'jsdom',
  transform: {
    '\\.(js|jsx)$': 'babel-jest',
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)$':
      '<rootDir>/fileTransformer.js'
  },
  moduleNameMapper: {
    '\\.(css|less)$': 'identity-obj-proxy',
    '^components(.*)$': '<rootDir>/src/components/$1',
    '^state(.*)$': '<rootDir>/src/state/$1',
    '^styles(.*)$': '<rootDir>/src/styles/$1',
    '^hooks(.*)$': '<rootDir>/src/hooks/$1',
    '^test-utils(.*)$': '<rootDir>/src/test-utils/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/src/testsSetup.ts']
}
