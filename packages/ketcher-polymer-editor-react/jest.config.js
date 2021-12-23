module.exports = {
  testMatch: ['**/src/**/?(*.)+(spec|test).[jt]s?(x)'],
  testPathIgnorePatterns: ['fixtures', 'dist', 'node_modules'],
  testEnvironment: 'jsdom',
  transform: {
    '\\.(js|jsx)$': 'babel-jest',
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  moduleNameMapper: {
    '\\.(css|less)$': 'identity-obj-proxy',
    '^components(.*)$': '<rootDir>/src/components/$1',
    '^state(.*)$': '<rootDir>/src/state/$1'
  }
}
