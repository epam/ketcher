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
    '^components(.*)$': '<rootDir>/src/components/$1',
    '^state(.*)$': '<rootDir>/src/state/$1',
    '^theming(.*)$': '<rootDir>/src/theming/$1',
    '^hooks(.*)$': '<rootDir>/src/hooks/$1',
    '^assets(.*)$': '<rootDir>/src/assets/$1',
    '^helpers(.*)$': '<rootDir>/src/helpers/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.tsx']
}
