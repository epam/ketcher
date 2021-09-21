module.exports = {
  roots: ['<rootDir>/src/'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)'
  ],
  testPathIgnorePatterns: ['fixtures'],
  transform: {
    '\\.js?$': 'babel-jest',
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  moduleNameMapper: {
    'application(.*)$': '<rootDir>/src/application/$1',
    'domain(.*)$': '<rootDir>/src/domain/$1',
    'infrastructure(.*)$': '<rootDir>/src/infrastructure/$1',
    'utils(.*)$': '<rootDir>/src/utils/$1'
  }
}
