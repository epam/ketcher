import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  changedLineCount,
  filePath,
  isLineInDiff,
  parseDiff,
} from './diff.mjs';

// Fixtures are `git diff -M` output from a scratch repository, kept as is.
// edge-cases.diff keeps the trailing tab that git prints after the
// `dir with space` paths.
const FIXTURES = fileURLToPath(new URL('../fixtures/review/', import.meta.url));
const readFixture = (name) => readFileSync(join(FIXTURES, name), 'utf8');

const files = parseDiff(readFixture('edge-cases.diff'));
const byPath = (path) => files.find((file) => filePath(file) === path);

test('every file in the diff is parsed, in order', () => {
  assert.deepEqual(files.map(filePath), [
    'added.ts',
    'dashes.ts',
    'deleted.ts',
    'dir with space/f.ts',
    'img.bin',
    'mod.ts',
    'nonl.ts',
    'renamed-new.ts',
    'ékezet.ts',
    'moved.ts',
    'run.sh',
  ]);
});

test('an added file has no old path and every line takes a comment', () => {
  const file = byPath('added.ts');
  assert.equal(file.status, 'added');
  assert.equal(file.oldPath, null);
  assert.equal(file.additions, 2);
  assert.deepEqual([...file.commentableLines], [1, 2]);
});

test('a deleted file has no new path and no commentable line', () => {
  const file = byPath('deleted.ts');
  assert.equal(file.status, 'deleted');
  assert.equal(file.newPath, null);
  assert.equal(file.deletions, 2);
  assert.equal(file.commentableLines.size, 0);
});

test('a renamed file keeps both paths and new line numbers', () => {
  const file = byPath('renamed-new.ts');
  assert.equal(file.status, 'renamed');
  assert.equal(file.oldPath, 'renamed-old.ts');
  assert.equal(file.additions, 1);
  assert.deepEqual([...file.commentableLines], [2, 3, 4, 5, 6, 7, 8]);
});

test('a rename without content change and a mode change have no lines', () => {
  const moved = byPath('moved.ts');
  assert.equal(moved.status, 'renamed');
  assert.equal(moved.oldPath, 'mod.ts');
  assert.equal(moved.commentableLines.size, 0);
  const mode = byPath('run.sh');
  assert.equal(mode.status, 'modified');
  assert.equal(mode.additions + mode.deletions, 0);
});

test('a binary file is marked and has no lines', () => {
  const file = byPath('img.bin');
  assert.equal(file.binary, true);
  assert.equal(file.additions + file.deletions, 0);
});

test('a removed line that starts with dashes is content, not a header', () => {
  const file = byPath('dashes.ts');
  assert.equal(file.deletions, 1);
  assert.equal(file.additions, 0);
  assert.deepEqual([...file.commentableLines], [1]);
});

test('"No newline at end of file" markers are not lines', () => {
  const file = byPath('nonl.ts');
  assert.equal(file.additions, 1);
  assert.equal(file.deletions, 1);
});

test('paths with spaces and quoted non-ASCII paths are read', () => {
  const file = byPath('dir with space/f.ts');
  assert.equal(file.oldPath, 'dir with space/f.ts');
  assert.equal(file.additions, 1);
  assert.equal(byPath('ékezet.ts').oldPath, 'ékezet.ts');
});

test('each file keeps its own part of the diff text', () => {
  const patch = byPath('mod.ts').patch;
  assert.ok(patch.startsWith('diff --git a/mod.ts b/mod.ts\n'));
  assert.ok(patch.endsWith('+line6'));
  assert.ok(!patch.includes('nonl.ts'));
});

test('the patches of some files parse back to the same facts', () => {
  const kept = files.filter((file) => !file.binary);
  const again = parseDiff(kept.map((file) => file.patch).join('\n'));
  const facts = (list) =>
    list.map((file) => [
      filePath(file),
      file.status,
      file.additions,
      file.deletions,
      [...file.commentableLines],
    ]);
  assert.deepEqual(facts(again), facts(kept));
});

test('changed lines are added plus removed lines', () => {
  assert.equal(changedLineCount(files), 16);
  assert.equal(changedLineCount([byPath('mod.ts')]), 3);
});

test('only added and context lines of a hunk take a comment', () => {
  assert.equal(isLineInDiff(files, 'mod.ts', 6), true);
  assert.equal(isLineInDiff(files, 'mod.ts', 3), true);
  assert.equal(isLineInDiff(files, 'mod.ts', 7), false);
  assert.equal(isLineInDiff(files, 'renamed-new.ts', 1), false);
  assert.equal(isLineInDiff(files, 'deleted.ts', 1), false);
  assert.equal(isLineInDiff(files, 'not-in-diff.ts', 1), false);
});

test('a diff that adds a diff file is read by its line counts', () => {
  const nested = parseDiff(readFixture('nested.diff'));
  assert.equal(nested.length, 1);
  assert.equal(nested[0].additions, 3);
});

test('an empty diff gives no files', () => {
  assert.deepEqual(parseDiff(''), []);
});
