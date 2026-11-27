// Tests of the eval runner. No model and no GitHub call runs: the review
// round, the model runner, git and GitHub are fakes.

import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { buildArgs } from '../runner.mjs';
import { FINDINGS_SCHEMA, VERDICT_SCHEMA } from '../schemas.mjs';
import {
  CONFIGS,
  evalGitHub,
  hitUsageLimit,
  parseCommandLine,
  planEntry,
  prCheckout,
  recordingRunner,
  roleOf,
  runEntry,
  selectEntries,
  summarize,
  wallTime,
} from './run-eval.mjs';

const evalSet = JSON.parse(
  readFileSync(new URL('./eval-set.json', import.meta.url), 'utf8'),
);

const ENTRY = {
  pr: 7,
  title: '#6 - Fix the label',
  kind: 'with-findings',
  base: 'b'.repeat(40),
  head: 'c'.repeat(40),
  expected: [],
};

/** Arguments of a run with the given schema and model. */
const argsFor = (schema, model = 'claude-haiku-5-5') =>
  buildArgs({
    authMode: 'oauth',
    schema,
    model,
    limits: { maxTurns: 1, maxBudgetUsd: 1 },
    systemPrompt: 'prompt',
  });

/** A clock that moves 10 ms on every read. */
function fakeClock() {
  let now = 0;
  return () => (now += 10);
}

test('every eval set entry names full commits and unique expected IDs', () => {
  const ids = evalSet.entries.flatMap((entry) =>
    entry.expected.map((item) => item.id),
  );
  assert.equal(new Set(ids).size, ids.length);
  for (const entry of evalSet.entries) {
    assert.match(entry.base, /^[0-9a-f]{40}$/);
    assert.match(entry.head, /^[0-9a-f]{40}$/);
    assert.equal(entry.kind === 'clean', entry.expected.length === 0);
    for (const item of entry.expected) {
      assert.match(
        item.comment,
        /^https:\/\/github\.com\/epam\/ketcher\/pull\//,
      );
    }
  }
});

test('a configuration that reuses finders comes after its source', () => {
  for (const [index, config] of CONFIGS.entries()) {
    if (config.findersFrom) {
      const source = CONFIGS.findIndex((c) => c.name === config.findersFrom);
      assert.ok(source !== -1 && source < index, config.name);
      assert.equal(CONFIGS[source].finder, config.finder);
    }
  }
});

test('the command line rejects an unknown configuration', () => {
  assert.throws(() => parseCommandLine(['--config', 'opus']), /Unknown/);
  const settings = parseCommandLine([
    '--config',
    'haiku-finders-haiku-verifier',
    '--pr',
    '12363,12473',
  ]);
  assert.deepEqual(
    settings.configs.map((c) => c.name),
    ['haiku-finders-haiku-verifier'],
  );
  assert.deepEqual(settings.prs, [12363, 12473]);
});

test('a pull request outside the eval set is an error', () => {
  assert.throws(() => selectEntries(evalSet, [1]), /Not in the eval set/);
  assert.equal(
    selectEntries(evalSet, undefined).length,
    evalSet.entries.length,
  );
});

test('the role of a run comes from its JSON Schema', () => {
  assert.equal(roleOf(argsFor(FINDINGS_SCHEMA)), 'finder');
  assert.equal(roleOf(argsFor(VERDICT_SCHEMA)), 'verifier');
});

test('the recording runner tags phases and hides the parent session', async () => {
  const seen = [];
  const run = async ({ env }) => {
    seen.push(env);
    return { ok: true, costUsd: 0.5, durationMs: 5, models: [] };
  };
  const recorder = recordingRunner({
    run,
    env: { CLAUDECODE: '1', PATH: '/bin' },
    now: fakeClock(),
  });
  await recorder.run({ args: argsFor(FINDINGS_SCHEMA), input: '', cwd: '.' });
  await recorder.run({ args: argsFor(VERDICT_SCHEMA), input: '', cwd: '.' });
  await recorder.run({ args: argsFor(FINDINGS_SCHEMA), input: '', cwd: '.' });
  assert.deepEqual(
    recorder.records.map((r) => [r.role, r.phase]),
    [
      ['finder', 'finders'],
      ['verifier', 'after'],
      ['finder', 'after'],
    ],
  );
  assert.equal(seen[0].CLAUDECODE, undefined);
  assert.equal(seen[0].PATH, '/bin');
  assert.equal(recorder.records[0].model, 'claude-haiku-5-5');
});

test('the eval GitHub client reads the reviewed commit and never writes', async () => {
  const github = evalGitHub({ diff: async () => 'diff' }, ENTRY);
  const pr = await github.pullRequest(ENTRY.pr);
  assert.equal(pr.headSha, ENTRY.head);
  assert.equal(pr.baseSha, ENTRY.base);
  assert.deepEqual(await github.comments(ENTRY.pr), []);
  assert.equal(await github.diff(), 'diff');
  for (const write of [
    'postReview',
    'postReviewComment',
    'postComment',
    'removeLabel',
  ]) {
    await assert.rejects(github[write](), /never writes/);
  }
});

test('wall time spans the first start to the last end', () => {
  assert.equal(wallTime([]), 0);
  assert.equal(
    wallTime([
      { startMs: 10, endMs: 50 },
      { startMs: 20, endMs: 80 },
    ]),
    70,
  );
});

test('a result with reused finders adds their cost and time', () => {
  const config = CONFIGS.find((c) => c.findersFrom);
  const source = {
    cost: { initialFinderUsd: 1.5 },
    time: { initialFinderMs: 4000 },
  };
  const records = [
    {
      role: 'verifier',
      phase: 'after',
      ok: true,
      costUsd: 0.25,
      startMs: 0,
      endMs: 1,
    },
  ];
  const result = summarize({
    entry: ENTRY,
    config,
    log: { confirmed: [], findings: [] },
    records,
    wallMs: 1000,
    source,
  });
  assert.equal(result.cost.totalUsd, 1.75);
  assert.equal(result.cost.finderUsd, 1.5);
  assert.equal(result.time.totalMs, 5000);
  assert.equal(result.cost.initialFinderUsd, 1.5);
  assert.deepEqual(result.runErrors, []);
});

test('a result lists each reason a run failed once', () => {
  const failed = {
    role: 'finder',
    phase: 'finders',
    costUsd: 0,
    startMs: 0,
    endMs: 1,
  };
  const result = summarize({
    entry: ENTRY,
    config: CONFIGS[0],
    log: { confirmed: [], findings: [] },
    records: [
      { ...failed, ok: false, error: 'run failed (HTTP 429): limit' },
      { ...failed, ok: false, error: 'run failed (HTTP 429): limit' },
      { ...failed, ok: true },
    ],
    wallMs: 1,
  });
  assert.equal(result.failedRuns, 2);
  assert.deepEqual(result.runErrors, ['run failed (HTTP 429): limit']);
});

test('a round runs as a dry run on the configured models', async () => {
  const config = CONFIGS.find(
    (c) => c.name === 'haiku-finders-sonnet-verifier',
  );
  const saved = [{ lens: 'correctness', file: 'a.ts', line: 1 }];
  let options;
  const review = async (given) => {
    options = given;
    await given.run({ args: argsFor(VERDICT_SCHEMA), input: '', cwd: '.' });
    given.log.confirmed = [
      {
        file: 'a.ts',
        line: 1,
        severity: 'major',
        id: 'none',
        claim: 'Claim.',
        scenario: 'Scenario.',
        lenses: ['correctness'],
        fingerprint: 'f1',
      },
    ];
  };
  const result = await runEntry({
    entry: ENTRY,
    config,
    github: {},
    baseDir: '/base',
    prDir: '/pr',
    repo: 'epam/ketcher',
    source: {
      finderFindings: saved,
      cost: { initialFinderUsd: 1 },
      time: { initialFinderMs: 100 },
    },
    run: async () => ({ ok: true, costUsd: 0.1, durationMs: 1, models: [] }),
    review,
    now: fakeClock(),
  });
  assert.equal(options.dryRun, true);
  assert.equal(options.savedFindings, saved);
  assert.equal(options.models.finder, 'claude-haiku-5-5');
  assert.equal(options.models.verifier, 'claude-sonnet-5-5');
  assert.deepEqual(result.confirmed[0].location, 'a.ts:1');
  assert.equal(result.cost.totalUsd, 1.1);
});

test('a round that throws is kept as an error result', async () => {
  const result = await runEntry({
    entry: ENTRY,
    config: CONFIGS[0],
    github: {},
    baseDir: '/base',
    prDir: '/pr',
    repo: 'epam/ketcher',
    review: async () => {
      throw new Error('boom');
    },
    now: fakeClock(),
  });
  assert.match(result.error, /boom/);
  assert.deepEqual(result.confirmed, []);
});

test('reusing finders without a source result is an error', async () => {
  const config = CONFIGS.find((c) => c.findersFrom);
  await assert.rejects(
    runEntry({ entry: ENTRY, config, github: {}, baseDir: '', prDir: '' }),
    /has no result/,
  );
});

test('the plan picks the panel from the diff without a model', () => {
  const diff = readFileSync(
    new URL('../../fixtures/review/flow-source.diff', import.meta.url),
    'utf8',
  );
  const plan = planEntry(diff);
  assert.ok(plan.lenses.includes('correctness'));
  assert.equal(plan.files, 1);
  assert.ok(plan.maxRuns > plan.lenses.length);
});

test('the checkout fetches a missing commit and adds a worktree', async () => {
  const calls = [];
  const exec = async (command, args) => {
    calls.push(args.slice(2).join(' '));
    const missing = args.includes('cat-file') && args.at(-1).startsWith('c');
    return { exitCode: missing ? 1 : 0, stdout: '' };
  };
  const workDir = mkdtempSync(join(tmpdir(), 'review-eval-test-'));
  const dir = await prCheckout({
    baseDir: '/base',
    workDir,
    entry: ENTRY,
    exec,
  });
  assert.equal(dir, join(workDir, 'pr-7'));
  assert.ok(calls.includes(`fetch --quiet origin ${ENTRY.head}`));
  assert.ok(!calls.includes(`fetch --quiet origin ${ENTRY.base}`));
  assert.ok(calls.includes(`worktree add --detach ${dir} ${ENTRY.head}`));
});

test('a usage limit failure marks the round as incomplete', () => {
  assert.equal(
    hitUsageLimit({
      runErrors: ["run failed (HTTP 429): You've hit your 5-hour limit"],
    }),
    true,
  );
  assert.equal(
    hitUsageLimit({ runErrors: ['stopped after 900000 ms'] }),
    false,
  );
  assert.equal(hitUsageLimit({ runErrors: [undefined] }), false);
  assert.equal(hitUsageLimit({}), false);
});
