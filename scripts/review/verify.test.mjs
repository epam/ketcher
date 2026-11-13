import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { parseDiff } from './diff.mjs';
import {
  applyVerdict,
  linkedIssueInput,
  parseLocation,
  runLinkedIssue,
  runVerification,
  verifierInput,
} from './verify.mjs';

const fixture = (name) =>
  readFileSync(new URL(`../fixtures/review/${name}`, import.meta.url), 'utf8');

const diffText = [
  'diff --git a/src/Editor.ts b/src/Editor.ts',
  '--- a/src/Editor.ts',
  '+++ b/src/Editor.ts',
  '@@ -1,2 +1,2 @@',
  ' one',
  '-two',
  '+TWO',
].join('\n');

const context = {
  files: parseDiff(diffText),
  diffText,
  rules: '### R5: Rule 5',
  invariants: '# Invariants\n\nD1. Rule.\n',
  acceptedPatterns: '# Accepted patterns\n',
};

const finding = (fields) => ({
  file: 'src/Editor.ts',
  line: 2,
  locations: ['src/Editor.ts:2', 'src/Other.ts:9'],
  severity: 'major',
  id: 'R5',
  claim: 'The cast hides a wrong type.',
  scenario: 'Opening a KET file without atoms throws.',
  references: ['src/util.ts:4'],
  lenses: ['correctness'],
  fingerprint: '0123456789abcdef',
  ...fields,
});

const verdict = (fields) => ({
  verdict: 'confirmed',
  reason: 'Line 2 casts `list[0]`.',
  line: 2,
  severity: 'major',
  id: 'R5',
  scenario: 'Opening a KET file without atoms throws.',
  alsoCheck: 'none',
  ...fields,
});

test('a location splits at its last colon', () => {
  assert.deepEqual(parseLocation('src/a:b.ts:12'), {
    file: 'src/a:b.ts',
    line: 12,
  });
});

test('the verifier input holds the finding, the diff notes and the context', () => {
  assert.equal(
    verifierInput(finding({}), context),
    fixture('verifier-input.md').trimEnd(),
  );
});

test('a verdict corrects line, severity, ID and scenario, not the fingerprint', () => {
  const checked = applyVerdict(
    finding({}),
    verdict({
      line: 3,
      severity: 'blocker',
      id: 'D1',
      scenario: 'Fixed.',
      alsoCheck: 'security',
    }),
  );
  assert.equal(checked.line, 3);
  assert.deepEqual(checked.locations, ['src/Editor.ts:3', 'src/Other.ts:9']);
  assert.equal(checked.severity, 'blocker');
  assert.equal(checked.id, 'D1');
  assert.equal(checked.scenario, 'Fixed.');
  assert.equal(checked.reason, 'Line 2 casts `list[0]`.');
  assert.equal(checked.alsoCheck, 'security');
  assert.equal(checked.fingerprint, '0123456789abcdef');
});

test('each finding gets its own run; only confirmed findings are kept', async () => {
  const answers = [
    { ok: true, output: verdict({}) },
    { ok: true, output: verdict({ verdict: 'dropped', reason: 'Guarded.' }) },
    { ok: false, error: 'boom' },
  ];
  const inputs = [];
  const run = async ({ input }) => {
    inputs.push(input);
    const answer = answers[inputs.length - 1];
    return { costUsd: 0, durationMs: 1, models: [], ...answer };
  };
  const result = await runVerification({
    findings: [
      finding({ line: 2 }),
      finding({ line: 3 }),
      finding({ line: 1 }),
    ],
    prompt: 'Verifier prompt',
    context,
    settings: {
      model: 'claude-sonnet-5-5',
      authMode: 'oauth',
      cwd: '/pr',
      run,
    },
    concurrency: 1,
  });
  assert.equal(inputs.length, 3);
  assert.deepEqual(
    result.confirmed.map((f) => f.line),
    [2],
  );
  assert.deepEqual(
    result.dropped.map((d) => [d.finding.line, d.reason]),
    [[3, 'Guarded.']],
  );
  assert.deepEqual(result.failed, ['verifier src/Editor.ts:1']);
});

test('the verifier never sees the finder prompt or other findings', async () => {
  const inputs = [];
  const run = async ({ args, input }) => {
    inputs.push({ args, input });
    return {
      ok: true,
      output: verdict({}),
      costUsd: 0,
      durationMs: 1,
      models: [],
    };
  };
  await runVerification({
    findings: [
      finding({ claim: 'First claim.' }),
      finding({ claim: 'Second claim.' }),
    ],
    prompt: 'Verifier prompt',
    context,
    settings: {
      model: 'claude-sonnet-5-5',
      authMode: 'oauth',
      cwd: '/pr',
      run,
    },
  });
  const [first, second] = inputs;
  assert.ok(first.input.includes('First claim.'));
  assert.ok(!first.input.includes('Second claim.'));
  assert.ok(!second.input.includes('First claim.'));
  const prompt = first.args[first.args.indexOf('--append-system-prompt') + 1];
  assert.equal(prompt, 'Verifier prompt');
});

const issue = {
  number: 123,
  title: 'Undo does not restore the bond',
  body: 'Steps: draw a bond, delete it, press Undo.\n',
};

const settingsWith = (run) => ({
  model: 'claude-sonnet-5-5',
  authMode: 'oauth',
  cwd: '/pr',
  run,
});

test('the linked-issue input holds the issue, the findings and the diff', () => {
  assert.equal(
    linkedIssueInput(issue, [finding({ severity: 'blocker' })], context),
    fixture('linked-issue-input.md').trimEnd(),
  );
});

test('the linked-issue input says so when no finding was confirmed', () => {
  const input = linkedIssueInput(issue, [], context);
  assert.ok(input.includes('No finding was confirmed.'));
});

test('without a linked issue no model runs', async () => {
  const run = async () => assert.fail('no run expected');
  const result = await runLinkedIssue({
    issue: undefined,
    confirmed: [],
    prompt: 'Linked-issue prompt',
    context,
    settings: settingsWith(run),
  });
  assert.deepEqual(result, { answer: undefined, failed: [], run: undefined });
});

test('the answer carries the issue number', async () => {
  const run = async () => ({
    ok: true,
    output: { fixesIssue: 'partly', reason: 'Redo is not fixed.' },
    costUsd: 0,
    durationMs: 1,
    models: [],
  });
  const result = await runLinkedIssue({
    issue,
    confirmed: [],
    prompt: 'Linked-issue prompt',
    context,
    settings: settingsWith(run),
  });
  assert.deepEqual(result.answer, {
    number: 123,
    fixesIssue: 'partly',
    reason: 'Redo is not fixed.',
  });
  assert.deepEqual(result.failed, []);
});

test('a failed linked-issue run gives no answer and is named', async () => {
  const run = async () => ({
    ok: false,
    error: 'boom',
    costUsd: 0,
    durationMs: 1,
    models: [],
  });
  const result = await runLinkedIssue({
    issue,
    confirmed: [],
    prompt: 'Linked-issue prompt',
    context,
    settings: settingsWith(run),
  });
  assert.equal(result.answer, undefined);
  assert.deepEqual(result.failed, ['linked issue #123']);
});
