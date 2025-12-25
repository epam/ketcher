module.exports = {
  clearMocks: true,
  testMatch: ['**/src/**/?(*.)+(spec|test).[jt]s?(x)'],
  testPathIgnorePatterns: ['fixtures', 'dist', 'node_modules'],
  testEnvironment: 'jsdom',
  transform: {
    '\\.(js|jsx)$': [
      'babel-jest',
      {
        presets: ['@babel/preset-env'],
      },
    ],
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '\\.svg$': '<rootDir>/testFileTransformer.js',
    '\\.ket$': '<rootDir>/../ketcher-core/textFileTransformer.js',
  },
  moduleNameMapper: {
    '\\.(css|less|sdf)$': 'identity-obj-proxy',
    '^src(.*)$': '<rootDir>/src/$1',
    '^components$': '<rootDir>/src/components',
    '^domain(.*)$': '<rootDir>/../ketcher-core/src/domain$1',
    '^application(.*)$': '<rootDir>/../ketcher-core/src/application$1',
    '^infrastructure(.*)$': '<rootDir>/../ketcher-core/src/infrastructure$1',
    '^utilities$': '<rootDir>/../ketcher-core/src/utilities',
    '^ketcher-core/(.*)$': '<rootDir>/../ketcher-core/$1',
    '^ketcher-core$': '<rootDir>/../ketcher-core/src',
    '^d3$': '<rootDir>/../../node_modules/d3/dist/d3.min.js',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  setupFiles: ['./jest.setup.js'],
};
