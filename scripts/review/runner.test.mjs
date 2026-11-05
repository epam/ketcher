import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { execa } from 'execa';
import { FINDINGS_SCHEMA } from './schemas.mjs';
import {
  buildArgs,
  familyAlias,
  isolationFlag,
  parseResult,
  READ_ONLY_TOOLS,
  runEnv,
  runModel,
} from './runner.mjs';

const fixture = (name) =>
  readFileSync(new URL(`../fixtures/review/${name}`, import.meta.url), 'utf8');

const options = (fields) => ({
  authMode: 'oauth',
  schema: FINDINGS_SCHEMA,
  model: 'claude-sonnet-5-5',
  limits: { maxTurns: 30, maxBudgetUsd: 2 },
  systemPrompt: 'You review a diff through the correctness lens.',
  ...fields,
});

/** The value after a flag in an argument list. */
const valueOf = (args, flag) => args[args.indexOf(flag) + 1];

/**
 * A fake execa: records each call and returns the given result, with the
 * fields execa sets when the process runs to its end.
 */
function fakeExec(result) {
  const calls = [];
  const exec = async (command, args, options) => {
    calls.push({ command, args, options });
    return { timedOut: false, exitCode: 0, stdout: '', stderr: '', ...result };
  };
  return { exec, calls };
}

test('every run is isolated, read only and never asks for permission', () => {
  for (const authMode of ['oauth', 'api-key']) {
    const args = buildArgs(options({ authMode }));
    assert.ok(args.includes(isolationFlag(authMode)));
    assert.ok(args.includes('--restricted'));
    assert.equal(valueOf(args, '--tools'), READ_ONLY_TOOLS);
    assert.equal(valueOf(args, '--permission-mode'), 'dontAsk');
    assert.ok(args.includes('--strict-mcp-config'));
    assert.ok(args.includes('--no-session-persistence'));
    assert.ok(!args.some((arg) => /Bash|Edit|Write|WebFetch/.test(arg)));
  }
  assert.equal(READ_ONLY_TOOLS, 'Read,Grep,Glob');
});

test('oauth runs in safe mode, an API key runs in bare mode', () => {
  assert.equal(isolationFlag('oauth'), '--safe-mode');
  assert.equal(isolationFlag('api-key'), '--bare');
  assert.throws(() => isolationFlag('none'), /Unknown authMode/);
});

test('model, fallback, limits, schema and prompt are passed', () => {
  const args = buildArgs(options({}));
  assert.equal(valueOf(args, '--model'), 'claude-sonnet-5-5');
  assert.equal(valueOf(args, '--fallback-model'), 'sonnet');
  assert.equal(valueOf(args, '--max-turns'), '30');
  assert.equal(valueOf(args, '--max-budget-usd'), '2');
  assert.deepEqual(JSON.parse(valueOf(args, '--json-schema')), FINDINGS_SCHEMA);
  assert.equal(
    valueOf(args, '--append-system-prompt'),
    'You review a diff through the correctness lens.',
  );
});

test('the fallback is the family of the model', () => {
  assert.equal(familyAlias('claude-opus-5-5'), 'opus');
  assert.equal(familyAlias('claude-haiku-5-5'), 'haiku');
  assert.throws(() => familyAlias('sonnet'), /Not a model ID/);
});

test('a run does not get tokens that can write to GitHub', () => {
  const env = runEnv({
    PATH: '/bin',
    CLAUDE_CODE_OAUTH_TOKEN: 'oauth',
    GITHUB_TOKEN: 'gh',
    GH_TOKEN: 'gh',
    ACTIONS_RUNTIME_TOKEN: 'actions',
  });
  assert.deepEqual(env, { PATH: '/bin', CLAUDE_CODE_OAUTH_TOKEN: 'oauth' });
});

test('a successful run gives the structured output, cost and model', () => {
  const result = parseResult({
    exitCode: 0,
    stdout: fixture('run-success.json'),
    stderr: '',
    durationMs: 5,
  });
  assert.deepEqual(result, {
    ok: true,
    output: { findings: [] },
    costUsd: 0.0017,
    durationMs: 1479,
    models: ['claude-sonnet-5-5'],
  });
});

test('a run that hit its turn limit is a failed pass, with its cost', () => {
  const result = parseResult({
    exitCode: 1,
    stdout: fixture('run-max-turns.json'),
    stderr: '',
    durationMs: 5,
  });
  assert.equal(result.ok, false);
  assert.equal(result.error, 'run ended with error_max_turns');
  assert.equal(result.costUsd, 1.2);
});

test('a run that cannot log in is a failed pass with the API message', () => {
  const result = parseResult({
    exitCode: 1,
    stdout: fixture('run-not-logged-in.json'),
    stderr: '',
    durationMs: 5,
  });
  assert.equal(result.ok, false);
  assert.equal(
    result.error,
    'run failed (HTTP 401): Not logged in · Please run /login',
  );
});

test('output that is not JSON, or has no structured output, is a failed pass', () => {
  const broken = parseResult({
    exitCode: 1,
    stdout: 'Error: not logged in',
    stderr: 'auth failed',
    durationMs: 5,
  });
  assert.equal(broken.ok, false);
  assert.equal(broken.error, 'no JSON output: auth failed');
  assert.equal(broken.durationMs, 5);

  const success = JSON.parse(fixture('run-success.json'));
  delete success.structured_output;
  const empty = parseResult({
    exitCode: 0,
    stdout: JSON.stringify(success),
    stderr: '',
    durationMs: 5,
  });
  assert.equal(empty.error, 'no structured output');
});

test('runModel starts claude with the input, the checkout and a clean env', async () => {
  const { exec, calls } = fakeExec({ stdout: fixture('run-success.json') });
  const result = await runModel({
    args: buildArgs(options({})),
    input: 'diff text',
    cwd: '/pr',
    env: { PATH: '/bin', GITHUB_TOKEN: 'gh' },
    exec,
  });
  assert.equal(result.ok, true);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].command, 'claude');
  assert.equal(calls[0].options.input, 'diff text');
  assert.equal(calls[0].options.cwd, '/pr');
  assert.equal(calls[0].options.shell, undefined);
  assert.equal(calls[0].options.extendEnv, false);
  assert.deepEqual(calls[0].options.env, { PATH: '/bin' });
});

test('a run that times out, is stopped or cannot start is a failed pass', async () => {
  const cases = [
    [
      { timedOut: true, exitCode: undefined, signal: 'SIGTERM' },
      'stopped after 1000 ms',
    ],
    [{ exitCode: undefined, signal: 'SIGKILL' }, 'stopped by SIGKILL'],
    [
      { exitCode: undefined, shortMessage: 'spawn claude ENOENT' },
      'could not start claude: spawn claude ENOENT',
    ],
  ];
  for (const [child, error] of cases) {
    const { exec } = fakeExec(child);
    const result = await runModel({
      args: [],
      input: '',
      cwd: '/pr',
      env: {},
      exec,
      timeoutMs: 1000,
    });
    assert.equal(result.ok, false);
    assert.equal(result.error, error);
  }
});

test('runModel passes options that execa accepts', async () => {
  // Runs node in place of claude: it prints its input, the success fixture.
  const echo = (command, args, execOptions) =>
    execa(
      process.execPath,
      ['-e', 'process.stdin.pipe(process.stdout)'],
      execOptions,
    );
  const result = await runModel({
    args: [],
    input: fixture('run-success.json'),
    cwd: '.',
    env: {},
    exec: echo,
  });
  assert.equal(result.ok, true);
  assert.deepEqual(result.output, { findings: [] });
});