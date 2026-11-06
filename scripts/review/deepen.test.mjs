import assert from 'node:assert/strict';
import { test } from 'node:test';
import { narrowContext, planDeepening, runDeepening } from './deepen.mjs';
import { filePath, parseDiff } from './diff.mjs';
import { fingerprint } from './merge.mjs';

const diffOf = (path) =>
  [
    `diff --git a/${path} b/${path}`,
    `--- a/${path}`,
    `+++ b/${path}`,
    '@@ -1,2 +1,2 @@',
    ' one',
    '-two',
    '+TWO',
  ].join('\n');

const diffText = [diffOf('src/a.ts'), diffOf('src/b.ts')].join('\n');

const context = {
  files: parseDiff(diffText),
  diffText,
  rules: '',
  invariants: '# Invariants\n',
  acceptedPatterns: '# Accepted patterns\n',
};

const confirmedFinding = (fields) => ({
  file: 'src/a.ts',
  line: 2,
  locations: ['src/a.ts:2'],
  severity: 'major',
  id: 'none',
  claim: 'The input reaches innerHTML.',
  scenario: 'A label with <img onerror> runs script.',
  references: [],
  lenses: ['correctness'],
  fingerprint: '0123456789abcdef',
  reason: 'Line 2 sets innerHTML.',
  alsoCheck: 'none',
  ...fields,
});

const lensFinding = (fields) => ({
  lens: 'correctness',
  file: 'src/a.ts',
  line: 2,
  otherLocations: [],
  severity: 'major',
  id: 'none',
  claim: 'Some claim.',
  scenario: 'Some scenario.',
  references: [],
  ...fields,
});

test('a confirmed finding that names a lens plans one pass on its file', () => {
  const plan = planDeepening({
    confirmed: [confirmedFinding({ alsoCheck: 'security' })],
    findings: [lensFinding({})],
  });
  assert.deepEqual(plan, [{ lens: 'security', files: ['src/a.ts'] }]);
});

test('no pass when no verdict names a lens', () => {
  const plan = planDeepening({
    confirmed: [confirmedFinding({})],
    findings: [],
  });
  assert.deepEqual(plan, []);
});

test('two verdicts for the same lens give one pass on both files', () => {
  const plan = planDeepening({
    confirmed: [
      confirmedFinding({ alsoCheck: 'reuse' }),
      confirmedFinding({ file: 'src/b.ts', alsoCheck: 'reuse' }),
      confirmedFinding({ line: 9, alsoCheck: 'reuse' }),
    ],
    findings: [],
  });
  assert.deepEqual(plan, [{ lens: 'reuse', files: ['src/a.ts', 'src/b.ts'] }]);
});

test('a file the lens already reported on gets no extra pass', () => {
  const plan = planDeepening({
    confirmed: [
      confirmedFinding({ alsoCheck: 'security' }),
      confirmedFinding({ file: 'src/b.ts', alsoCheck: 'security' }),
    ],
    findings: [lensFinding({ lens: 'security', file: 'src/a.ts' })],
  });
  assert.deepEqual(plan, [{ lens: 'security', files: ['src/b.ts'] }]);
});

test('the extra pass sees only its files', () => {
  const narrow = narrowContext(context, ['src/b.ts']);
  assert.deepEqual(narrow.files.map(filePath), ['src/b.ts']);
  assert.ok(narrow.diffText.includes('b/src/b.ts'));
  assert.ok(!narrow.diffText.includes('src/a.ts'));
  assert.equal(narrow.invariants, context.invariants);
});

/** The role prompt a fake run was started with. */
const promptOf = (args) => args[args.indexOf('--append-system-prompt') + 1];

const settingsWith = (run) => ({
  model: 'claude-sonnet-5-5',
  authMode: 'oauth',
  cwd: '/pr',
  run,
});

/** What the fake security lens reports on a file. */
const securityFinding = (file) => ({
  file,
  line: 2,
  otherLocations: [],
  severity: 'major',
  id: 'none',
  claim: `Untrusted text reaches HTML in ${file}.`,
  scenario: 'Some scenario.',
  references: [],
});

/** What the fake verifier answers: confirmed, and `security` again. */
const confirmedVerdict = {
  verdict: 'confirmed',
  reason: 'Checked.',
  line: 2,
  severity: 'major',
  id: 'none',
  scenario: 'Some scenario.',
  alsoCheck: 'security',
};

/**
 * A fake run: the security lens reports one finding on each file it sees,
 * and the verifier confirms every finding.
 */
function fakeRun() {
  const calls = [];
  const run = async ({ args, input }) => {
    const prompt = promptOf(args);
    calls.push({ prompt, input });
    const done = { ok: true, costUsd: 0, durationMs: 1, models: [] };
    if (prompt === 'Security prompt') {
      const findings = ['src/a.ts', 'src/b.ts']
        .filter((file) => input.includes(`b/${file}`))
        .map(securityFinding);
      return { ...done, output: { findings } };
    }
    return { ...done, output: confirmedVerdict };
  };
  return { run, calls };
}

test('the extra pass runs once, and its findings are verified', async () => {
  const { run, calls } = fakeRun();
  const result = await runDeepening({
    confirmed: [confirmedFinding({ file: 'src/b.ts', alsoCheck: 'security' })],
    findings: [],
    known: [],
    verified: 1,
    prompts: { security: 'Security prompt' },
    verifierPrompt: 'Verifier prompt',
    context,
    finderSettings: settingsWith(run),
    verifierSettings: settingsWith(run),
  });
  assert.deepEqual(result.passes, [{ lens: 'security', files: ['src/b.ts'] }]);
  const prompts = calls.map((call) => call.prompt);
  assert.deepEqual(prompts, ['Security prompt', 'Verifier prompt']);
  assert.ok(!calls[0].input.includes('src/a.ts'));
  assert.equal(result.confirmed.length, 1);
  assert.equal(result.confirmed[0].file, 'src/b.ts');
});

test('a finding found before is not verified again', async () => {
  const { run, calls } = fakeRun();
  const known = fingerprint({
    file: 'src/b.ts',
    id: 'none',
    claim: 'Untrusted text reaches HTML in src/b.ts.',
  });
  const result = await runDeepening({
    confirmed: [confirmedFinding({ file: 'src/b.ts', alsoCheck: 'security' })],
    findings: [],
    known: [known],
    verified: 0,
    prompts: { security: 'Security prompt' },
    verifierPrompt: 'Verifier prompt',
    context,
    finderSettings: settingsWith(run),
    verifierSettings: settingsWith(run),
  });
  assert.deepEqual(
    calls.map((call) => call.prompt),
    ['Security prompt'],
  );
  assert.deepEqual(result.confirmed, []);
});

test('no extra pass when the round already used its verification cap', async () => {
  const { run, calls } = fakeRun();
  const result = await runDeepening({
    confirmed: [confirmedFinding({ alsoCheck: 'security' })],
    findings: [],
    known: [],
    verified: 10,
    prompts: { security: 'Security prompt' },
    verifierPrompt: 'Verifier prompt',
    context,
    finderSettings: settingsWith(run),
    verifierSettings: settingsWith(run),
    limit: 10,
  });
  assert.equal(calls.length, 0);
  assert.deepEqual(result.passes, []);
});