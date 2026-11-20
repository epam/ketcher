import assert from 'node:assert/strict';
import { test } from 'node:test';
import { findMacromoleculesChunkViolations } from './check-example-chunks.mjs';

test('matches macromolecules source and package-local node_modules modules', () => {
  const violations = findMacromoleculesChunkViolations([
    {
      name: 'ketcher-macromolecules-components',
      modules: [
        '/repo/packages/ketcher-macromolecules/src/components/Editor.tsx',
        '/repo/packages/ketcher-macromolecules/node_modules/@scope/helper/index.js',
      ],
    },
  ]);

  assert.deepEqual(violations, []);
});

test('finds non-macromolecules modules in macromolecules-named chunks', () => {
  const violations = findMacromoleculesChunkViolations([
    {
      name: 'ketcher-macromolecules',
      modules: [
        '/repo/packages/ketcher-macromolecules/src/index.tsx',
        '/repo/packages/ketcher-react/src/Editor.tsx',
      ],
    },
  ]);

  assert.deepEqual(violations, [
    {
      chunkName: 'ketcher-macromolecules',
      unexpectedModules: ['/repo/packages/ketcher-react/src/Editor.tsx'],
    },
  ]);
});
