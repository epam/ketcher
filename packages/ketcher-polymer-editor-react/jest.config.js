module.exports = {
  testMatch: ['**/src/**/?(*.)+(spec|test).[jt]s?(x)'],
  testPathIgnorePatterns: ['fixtures', 'dist', 'node_modules'],
  testEnvironment: 'jsdom',
  transform: {
    '\\.(js|jsx)$': 'babel-jest',
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '\\.svg$': '<rootDir>/testFileTransformer.js',
    '\\.sdf$': '<rootDir>/textFileTransformer.js',
  },
  moduleNameMapper: {
    '\\.(css|less)$': 'identity-obj-proxy',
    'src(.*)$': '<rootDir>/src/$1',
    '^components(.*)$': '<rootDir>/src/components/$1',
    '^state(.*)$': '<rootDir>/src/state/$1',
    '^theming(.*)$': '<rootDir>/src/theming/$1',
    '^hooks(.*)$': '<rootDir>/src/hooks/$1',
    '^assets(.*)$': '<rootDir>/src/assets/$1',
    '^helpers(.*)$': '<rootDir>/src/helpers/$1',
    '\\.sdf$': '<rootDir>/textFileTransformer.js',
    '^d3$': '<rootDir>/../../node_modules/d3/dist/d3.min.js',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.tsx'],
};
