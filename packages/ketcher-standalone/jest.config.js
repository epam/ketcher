module.exports = {
  testMatch: ['**/__tests__/**/?(*.)+(spec|test).+(ts|js)'],
  testPathIgnorePatterns: ['fixtures', 'dist', 'node_modules'],
  testEnvironment: 'node',
  transform: {
    '\\.js?$': 'babel-jest',
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        diagnostics: {
          warnOnly: true,
        },
      },
    ],
  },
  moduleNameMapper: {
    '^_indigo-worker-import-alias_$':
      '<rootDir>/src/infrastructure/services/struct/indigoWorkerImports/useWasmLoader',
    '^_indigo-ketcher-import-alias_$': 'indigo-ketcher',
    '^d3$': '<rootDir>/../../node_modules/d3/dist/d3.min.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(d3|d3-array|d3-axis|d3-brush|d3-chord|d3-color|d3-contour|d3-delaunay|d3-dispatch|d3-drag|d3-dsv|d3-ease|d3-fetch|d3-force|d3-format|d3-geo|d3-hierarchy|d3-interpolate|d3-path|d3-polygon|d3-quadtree|d3-random|d3-scale|d3-scale-chromatic|d3-selection|d3-shape|d3-time|d3-time-format|d3-timer|d3-transition|d3-zoom)/)',
  ],
};
