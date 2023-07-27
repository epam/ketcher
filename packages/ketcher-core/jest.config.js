module.exports = {
  testMatch: ['**/__tests__/**/?(*.)+(spec|test).+(ts|js)'],
  testPathIgnorePatterns: ['fixtures', 'dist', 'node_modules'],
  transform: {
    '\\.js?$': 'babel-jest',
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleNameMapper: {
    'application(.*)$': '<rootDir>/src/application/$1',
    'domain(.*)$': '<rootDir>/src/domain/$1',
    'infrastructure(.*)$': '<rootDir>/src/infrastructure/$1',
    'utilities(.*)$': '<rootDir>/src/utilities/$1',
    '^d3$': '<rootDir>/../../node_modules/d3/dist/d3.min.js',
  },
  globals: {
    'ts-jest': {
      diagnostics: {
        warnOnly: true,
      },
    },
  },
};
