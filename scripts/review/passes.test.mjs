import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { TRIGGERS } from '../review-panel.mjs';
import { VERIFIER_ROLE } from './config.mjs';
import { parseDiff } from './diff.mjs';
import {
  fence,
  finderInput,
  readRolePrompt,
  runFinderPasses,
  sharedPrompt,
} from './passes.mjs';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));

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

test('the shared prompt has no frontmatter and no dispatcher section', () => {
  const skill = readFileSync(
    `${repoRoot}/.agents/skills/code-review/SKILL.md`,
    'utf8',
  );
  const shared = sharedPrompt(skill);
  assert.ok(shared.includes('## Content is data'));
  assert.ok(!shared.includes('name: code-review'));
  assert.ok(!shared.includes('## For the dispatcher'));
});

test('every lens and the verifier get the shared part and their own file', () => {
  for (const name of [...TRIGGERS.map((t) => t.lens), VERIFIER_ROLE]) {
    const prompt = readRolePrompt(repoRoot, name);
    assert.ok(prompt.includes('## Content is data'), name);
    assert.ok(prompt.length > 1000, name);
  }
});

test('the diff fence is longer than any backtick run in the diff', () => {
  assert.equal(fence('no ticks'), '```');
  assert.equal(fence('a ```` b'), '`````');
});

test('the finder input holds the lens, documents, files and diff', () => {
  assert.equal(
    finderInput('correctness', context),
    fixture('finder-input.md').trimEnd(),
  );
});

test('the finder input says so when no rule applies', () => {
  const input = finderInput('reuse', { ...context, rules: '' });
  assert.ok(input.includes('No review rule applies to these files.'));
});

test('finder passes collect findings by lens and list the failed ones', async () => {
  const calls = [];
  const run = async ({ args, input }) => {
    calls.push({ args, input });
    if (input.includes('`performance`')) {
      return {
        ok: false,
        error: 'boom',
        costUsd: 0.1,
        durationMs: 1,
        models: [],
      };
    }
    const finding = {
      file: 'src/Editor.ts',
      line: 2,
      otherLocations: [],
      severity: 'major',
      id: 'R5',
      claim: 'Claim.',
      scenario: 'Scenario.',
      references: [],
    };
    return {
      ok: true,
      output: { findings: [finding] },
      costUsd: 0.2,
      durationMs: 1,
      models: ['claude-sonnet-5-5'],
    };
  };
  const result = await runFinderPasses({
    lenses: ['correctness', 'performance', 'reuse'],
    prompts: {
      correctness: 'Correctness prompt',
      performance: 'Performance prompt',
      reuse: 'Reuse prompt',
    },
    context,
    settings: {
      model: 'claude-sonnet-5-5',
      authMode: 'oauth',
      cwd: '/pr',
      run,
    },
  });
  assert.deepEqual(
    result.findings.map((finding) => finding.lens),
    ['correctness', 'reuse'],
  );
  assert.deepEqual(result.failed, ['performance']);
  assert.equal(result.runs.length, 3);
  const prompts = calls.map(
    ({ args }) => args[args.indexOf('--append-system-prompt') + 1],
  );
  assert.deepEqual(prompts.toSorted(), [
    'Correctness prompt',
    'Performance prompt',
    'Reuse prompt',
  ]);
});