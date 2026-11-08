import assert from 'node:assert/strict';
import { test } from 'node:test';
import { LSC_LABEL } from '../pr-checks.mjs';
import { prType } from './pr-type.mjs';

/** A diff file with only the fields prType reads. */
const file = (newPath, status = 'modified') => ({
  oldPath: newPath,
  newPath,
  status,
});

const source = file('packages/ketcher-core/src/a.ts');

test('a linked Bug makes a bug fix', () => {
  const type = prType({
    linkedIssues: [{ number: 1, type: 'Bug' }],
    files: [source, file('openspec/changes/x/proposal.md', 'added')],
    labels: [],
  });
  assert.equal(type, 'bug fix');
});

test('a new OpenSpec change makes a feature', () => {
  const type = prType({
    linkedIssues: [{ number: 1, type: 'Feature' }],
    files: [source, file('openspec/changes/x/proposal.md', 'added')],
    labels: [],
  });
  assert.equal(type, 'feature');
});

test('a move into the archive makes an archive', () => {
  const type = prType({
    linkedIssues: [],
    files: [file('openspec/changes/archive/2026-11-06-x/tasks.md', 'renamed')],
    labels: [],
  });
  assert.equal(type, 'archive of an OpenSpec change');
});

test('without a matching row there is no type', () => {
  const type = prType({
    linkedIssues: [{ number: 1, type: null }],
    files: [source],
    labels: [],
  });
  assert.equal(type, undefined);
});

test('the large-scale change label adds to the row', () => {
  const bug = [{ number: 1, type: 'Bug' }];
  assert.equal(
    prType({ linkedIssues: bug, files: [source], labels: [LSC_LABEL] }),
    'bug fix, large-scale change',
  );
  assert.equal(
    prType({ linkedIssues: [], files: [source], labels: [LSC_LABEL] }),
    'large-scale change',
  );
});