import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  acceptedPairs,
  candidatePairs,
  duplicatesInput,
  mergePairs,
  runDuplicates,
} from './duplicates.mjs';

const fixture = (name) =>
  readFileSync(new URL(`../fixtures/review/${name}`, import.meta.url), 'utf8');

const finding = (fields) => ({
  file: 'src/a.ts',
  line: 10,
  locations: [`${fields.file ?? 'src/a.ts'}:${fields.line ?? 10}`],
  severity: 'major',
  id: 'none',
  claim: 'The label reaches innerHTML.',
  scenario: 'A label with an img tag runs script.',
  references: [],
  lenses: ['correctness'],
  fingerprint: `fp-${fields.line ?? 10}`,
  ...fields,
});

const xss = finding({ line: 10 });
const xssAgain = finding({
  line: 11,
  severity: 'blocker',
  claim: 'Untrusted text is written as HTML.',
  lenses: ['security'],
});
const naming = finding({ line: 12, claim: 'The name el says nothing.' });
const farAway = finding({ line: 40 });
const otherFile = finding({ file: 'src/b.ts', line: 10 });

test('only close findings in the same file become pairs, up to the cap', () => {
  const findings = [xss, xssAgain, naming, farAway, otherFile];
  assert.deepEqual(candidatePairs(findings), [
    { first: 0, second: 1 },
    { first: 0, second: 2 },
    { first: 1, second: 2 },
  ]);
  assert.equal(candidatePairs(findings, { cap: 2 }).length, 2);
});

test('the input numbers the findings from 1 and marks them as data', () => {
  const input = duplicatesInput([xss, xssAgain], [{ first: 0, second: 1 }]);
  assert.equal(input, fixture('duplicates-input.md').trimEnd());
});

test('only a sure answer about an asked pair merges', () => {
  const asked = [
    { first: 0, second: 1 },
    { first: 0, second: 2 },
  ];
  const answers = [
    { first: 1, second: 2, same: true, confidence: 'high' },
    { first: 1, second: 3, same: true, confidence: 'low' },
    { first: 2, second: 3, same: true, confidence: 'high' },
  ];
  assert.deepEqual(acceptedPairs(asked, answers), [{ first: 0, second: 1 }]);
});

test('a merged finding keeps the most severe one and everything of both', () => {
  const [merged, kept] = mergePairs(
    [xss, xssAgain, naming],
    [{ first: 0, second: 1 }],
  );
  assert.equal(merged.severity, 'blocker');
  assert.equal(merged.claim, 'Untrusted text is written as HTML.');
  assert.deepEqual(merged.locations, ['src/a.ts:10', 'src/a.ts:11']);
  assert.deepEqual(merged.lenses, ['correctness', 'security']);
  assert.equal(merged.fingerprint, 'fp-11');
  assert.deepEqual(merged.absorbed, ['fp-10']);
  assert.equal(kept, naming);
});

test('pairs that share a finding make one group', () => {
  const merged = mergePairs(
    [xss, xssAgain, naming],
    [
      { first: 1, second: 2 },
      { first: 0, second: 1 },
    ],
  );
  assert.equal(merged.length, 1);
  assert.deepEqual([...merged[0].absorbed].sort(), ['fp-10', 'fp-12']);
});

const settingsWith = (run) => ({
  model: 'claude-sonnet-5-5',
  authMode: 'oauth',
  cwd: '/pr',
  run,
});

test('without pairs no model runs', async () => {
  const run = async () => assert.fail('no run expected');
  const result = await runDuplicates({
    findings: [xss, farAway],
    prompt: 'Duplicates prompt',
    settings: settingsWith(run),
  });
  assert.deepEqual(result.findings, [xss, farAway]);
  assert.equal(result.run, undefined);
});

test('a run merges the pairs it is sure about', async () => {
  const run = async () => ({
    ok: true,
    costUsd: 0,
    durationMs: 1,
    models: [],
    output: {
      pairs: [
        { first: 1, second: 2, same: true, confidence: 'high', reason: 'R.' },
        { first: 1, second: 3, same: false, confidence: 'high', reason: 'R.' },
        { first: 2, second: 3, same: false, confidence: 'high', reason: 'R.' },
      ],
    },
  });
  const result = await runDuplicates({
    findings: [xss, xssAgain, naming],
    prompt: 'Duplicates prompt',
    settings: settingsWith(run),
  });
  assert.equal(result.findings.length, 2);
  assert.deepEqual(result.merged, [{ first: 0, second: 1 }]);
});

test('a failed run merges nothing and is named', async () => {
  const run = async () => ({
    ok: false,
    reason: 'max turns',
    costUsd: 0,
    durationMs: 1,
    models: [],
  });
  const result = await runDuplicates({
    findings: [xss, xssAgain],
    prompt: 'Duplicates prompt',
    settings: settingsWith(run),
  });
  assert.deepEqual(result.findings, [xss, xssAgain]);
  assert.deepEqual(result.failed, ['duplicates']);
});