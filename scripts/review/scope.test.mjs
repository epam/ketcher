import assert from 'node:assert/strict';
import { test } from 'node:test';
import { filePath, parseDiff } from './diff.mjs';
import { filterDiff, reviewRange } from './scope.mjs';

test('round 1 reviews the whole pull request', () => {
  assert.deepEqual(reviewRange({ round: 1, base: 'B', head: 'H' }), {
    from: 'B',
    to: 'H',
    kind: 'full',
  });
});

test('a later round reviews only the commits since the previous head', () => {
  assert.deepEqual(
    reviewRange({
      round: 2,
      base: 'B',
      head: 'H',
      previousHead: 'P',
      previousHeadIsAncestor: true,
    }),
    { from: 'P', to: 'H', kind: 'incremental' },
  );
});

test('a later round falls back to the whole pull request after a force push', () => {
  assert.deepEqual(
    reviewRange({
      round: 2,
      base: 'B',
      head: 'H',
      previousHead: 'P',
      previousHeadIsAncestor: false,
    }),
    { from: 'B', to: 'H', kind: 'full' },
  );
});

test('a later round without a previous head reviews the whole pull request', () => {
  assert.equal(reviewRange({ round: 2, base: 'B', head: 'H' }).kind, 'full');
});

const diffOf = (path) =>
  [
    `diff --git a/${path} b/${path}`,
    'index 1111111..2222222 100644',
    `--- a/${path}`,
    `+++ b/${path}`,
    '@@ -1 +1 @@',
    '-old',
    '+new',
  ].join('\n');

test('skipped files are left out of the reviewed diff and listed', () => {
  const files = parseDiff(
    [
      diffOf('packages/ketcher-react/src/App.tsx'),
      diffOf('package-lock.json'),
      diffOf('ketcher-autotests/tests/specs/a.spec.ts'),
      diffOf('packages/ketcher-core/src/utils.ts'),
    ].join('\n'),
  );
  const { reviewed, skipped, text } = filterDiff(files);
  assert.deepEqual(reviewed.map(filePath), [
    'packages/ketcher-react/src/App.tsx',
    'packages/ketcher-core/src/utils.ts',
  ]);
  assert.deepEqual(skipped, [
    'package-lock.json',
    'ketcher-autotests/tests/specs/a.spec.ts',
  ]);
  assert.ok(text.includes('diff --git a/packages/ketcher-react/src/App.tsx'));
  assert.ok(!text.includes('package-lock.json'));
});

test('the reviewed diff text parses back to the reviewed files', () => {
  const files = parseDiff(
    [diffOf('a/src/x.ts'), diffOf('package-lock.json'), diffOf('b.ts')].join(
      '\n',
    ),
  );
  const { reviewed, text } = filterDiff(files);
  assert.deepEqual(parseDiff(text).map(filePath), reviewed.map(filePath));
});

test('a diff with only skipped files gives an empty reviewed diff', () => {
  const { reviewed, text } = filterDiff(parseDiff(diffOf('package-lock.json')));
  assert.deepEqual(reviewed, []);
  assert.equal(text, '');
});
