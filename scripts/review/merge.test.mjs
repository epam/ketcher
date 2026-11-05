import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  fingerprint,
  mergeFindings,
  normalizeClaim,
  prepareFindings,
  verificationRank,
} from './merge.mjs';

const finding = (fields) => ({
  lens: 'correctness',
  file: 'src/Editor.ts',
  line: 120,
  otherLocations: [],
  severity: 'major',
  id: 'R5',
  claim: 'The cast hides a wrong type.',
  scenario: 'Opening a KET file without atoms throws.',
  references: [],
  ...fields,
});

test('two lenses on the same rule within 3 lines give one finding', () => {
  const merged = mergeFindings([
    finding({ lens: 'correctness', line: 120 }),
    finding({ lens: 'code-quality', line: 122, severity: 'blocker' }),
  ]);
  assert.equal(merged.length, 1);
  assert.deepEqual(merged[0].locations, [
    'src/Editor.ts:120',
    'src/Editor.ts:122',
  ]);
  assert.deepEqual(merged[0].lenses, ['correctness', 'code-quality']);
  assert.equal(merged[0].severity, 'blocker');
  assert.equal(merged[0].line, 120);
});

test('findings further apart, of another rule or file stay separate', () => {
  const merged = mergeFindings([
    finding({ line: 120 }),
    finding({ line: 124 }),
    finding({ line: 121, id: 'R7' }),
    finding({ line: 120, file: 'src/Other.ts' }),
  ]);
  assert.equal(merged.length, 4);
});

test('a chain of close findings is merged step by step', () => {
  const merged = mergeFindings([
    finding({ line: 100 }),
    finding({ line: 103 }),
    finding({ line: 106 }),
  ]);
  assert.equal(merged.length, 1);
  assert.equal(merged[0].locations.length, 3);
});

test('findings without a rule are never merged', () => {
  const merged = mergeFindings([
    finding({ id: 'none', line: 120 }),
    finding({ id: 'none', line: 121, claim: 'Another problem.' }),
  ]);
  assert.equal(merged.length, 2);
});

test('other locations and references are kept without duplicates', () => {
  const [merged] = mergeFindings([
    finding({ otherLocations: ['src/A.ts:5'], references: ['src/util.ts:9'] }),
    finding({
      line: 121,
      otherLocations: ['src/A.ts:5'],
      references: ['src/util.ts:9'],
    }),
  ]);
  assert.deepEqual(merged.locations, [
    'src/Editor.ts:120',
    'src/A.ts:5',
    'src/Editor.ts:121',
  ]);
  assert.deepEqual(merged.references, ['src/util.ts:9']);
});

test('the fingerprint ignores line numbers, case and punctuation', () => {
  assert.equal(
    normalizeClaim('Line 120: the Cast hides a wrong type!'),
    'line the cast hides a wrong type',
  );
  const a = fingerprint({ file: 'a.ts', id: 'R5', claim: 'Bad cast at 12.' });
  const b = fingerprint({ file: 'a.ts', id: 'R5', claim: 'bad cast at 40' });
  const c = fingerprint({ file: 'a.ts', id: 'R7', claim: 'Bad cast at 12.' });
  assert.equal(a, b);
  assert.notEqual(a, c);
});

test('rank: blockers, then several lenses, then majors, then nits', () => {
  const rank = (severity, lenses) => verificationRank({ severity, lenses });
  assert.equal(rank('blocker', ['a']), 0);
  assert.equal(rank('nit', ['a', 'b']), 1);
  assert.equal(rank('major', ['a']), 2);
  assert.equal(rank('nit', ['a']), 3);
});

test('findings without a failing scenario are dropped and counted', () => {
  const result = prepareFindings([
    finding({ line: 10 }),
    finding({ line: 50, scenario: '   ' }),
  ]);
  assert.equal(result.toVerify.length, 1);
  assert.equal(result.noScenario, 1);
});

test('a finding posted in an earlier round is not verified again', () => {
  const posted = fingerprint(finding({}));
  const result = prepareFindings([finding({}), finding({ id: 'R7' })], {
    posted: [posted],
  });
  assert.deepEqual(
    result.toVerify.map((merged) => merged.id),
    ['R7'],
  );
  assert.equal(result.alreadyPosted, 1);
});

test('at most N go to verification, blockers first, the rest is overflow', () => {
  const result = prepareFindings(
    [
      finding({ line: 10, severity: 'nit' }),
      finding({ line: 30 }),
      finding({ line: 50, severity: 'blocker' }),
    ],
    { limit: 2 },
  );
  assert.deepEqual(
    result.toVerify.map((merged) => merged.severity),
    ['blocker', 'major'],
  );
  assert.deepEqual(
    result.overflow.map((merged) => merged.severity),
    ['nit'],
  );
});