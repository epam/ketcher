import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseDiff, pickPanel } from './review-panel.mjs';

const diffOf = (path, added = []) =>
  [
    `diff --git a/${path} b/${path}`,
    'index 1111111..2222222 100644',
    `--- a/${path}`,
    `+++ b/${path}`,
    '@@ -1,1 +1,2 @@',
    ' unchanged',
    ...added.map((line) => `+${line}`),
  ].join('\n');

const lensesFor = (...diffs) =>
  pickPanel(parseDiff(diffs.join('\n'))).map((entry) => entry.lens);

test('parseDiff keeps the new path of a rename and only lines added in hunks', () => {
  const diff = [
    'diff --git a/old.ts b/new.ts',
    'similarity index 90%',
    'rename from old.ts',
    'rename to new.ts',
    '--- a/old.ts',
    '+++ b/new.ts',
    '@@ -1 +1 @@',
    '-before',
    '+after',
  ].join('\n');
  assert.deepEqual(parseDiff(diff), [{ path: 'new.ts', added: ['after'] }]);
});

test('a diff of skills and docs outside the memory bank gets no lens', () => {
  assert.deepEqual(
    lensesFor(
      diffOf('.agents/skills/review-pr/SKILL.md'),
      diffOf('documentation/help.md'),
    ),
    [],
  );
});

test('a test-only change gets code-quality and not correctness', () => {
  assert.deepEqual(
    lensesFor(diffOf('packages/ketcher-core/src/domain/x.test.ts')),
    ['code-quality'],
  );
});

test('plain source code gets correctness and code-quality', () => {
  assert.deepEqual(
    lensesFor(diffOf('packages/ketcher-react/src/script/ui/App.tsx', ['a'])),
    ['correctness', 'code-quality'],
  );
});

test('a render file or a cloneDeep in source brings performance', () => {
  assert.ok(
    lensesFor(
      diffOf('packages/ketcher-core/src/application/render/restruct.ts'),
    ).includes('performance'),
  );
  assert.ok(
    lensesFor(
      diffOf('packages/ketcher-react/src/a.ts', ['const s = cloneDeep(x);']),
    ).includes('performance'),
  );
});

test('an HTML sink added to source brings security; the same text in a test does not', () => {
  assert.ok(
    lensesFor(
      diffOf('packages/ketcher-react/src/a.tsx', ['el.innerHTML = info;']),
    ).includes('security'),
  );
  assert.ok(
    !lensesFor(
      diffOf('packages/ketcher-react/src/a.test.tsx', [
        'document.body.innerHTML = "";',
      ]),
    ).includes('security'),
  );
});

test('a package barrel or a memory-bank doc brings documentation-accuracy', () => {
  assert.ok(
    lensesFor(diffOf('packages/ketcher-core/src/index.ts')).includes(
      'documentation-accuracy',
    ),
  );
  assert.deepEqual(lensesFor(diffOf('.memory-bank/modules/rendering.md')), [
    'documentation-accuracy',
  ]);
});

test('each lens names the first file that matched', () => {
  const panel = pickPanel(
    parseDiff(
      [
        diffOf('README.md'),
        diffOf('packages/ketcher-core/src/application/formatters/f.ts'),
      ].join('\n'),
    ),
  );
  assert.deepEqual(
    panel.find((entry) => entry.lens === 'security'),
    {
      lens: 'security',
      because: 'packages/ketcher-core/src/application/formatters/f.ts',
    },
  );
});
