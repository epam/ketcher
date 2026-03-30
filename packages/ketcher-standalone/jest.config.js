module.exports = {
  testMatch: ['**/__tests__/**/?(*.)+(spec|test).+(ts|js)'],
  testPathIgnorePatterns: ['dist', 'node_modules'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|tsx|js)$': 'babel-jest',
  },
};
