module.exports = {
  testMatch: ['**/src/**/?(*.)+(spec|test).[jt]s?(x)'],
  testPathIgnorePatterns: ['fixtures', 'dist', 'node_modules'],
  testEnvironment: 'jsdom',
  transform: {
    '\\.(js|jsx)$': 'babel-jest',
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '\\.svg$': '<rootDir>/testFileTransformer.js'
  },
  moduleNameMapper: {
    '\\.(css|less)$': 'identity-obj-proxy',
    'src(.*)$': '<rootDir>/src/$1'
  }
}
