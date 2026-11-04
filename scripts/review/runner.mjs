// Starts one model run: a `claude -p` process with a JSON Schema, and reads
// its validated answer. Every finder pass, verification and linked-issue
// question goes through runModel, so the isolation options live in one place.
//
// The options that isolate a run from the pull request are fixed here, not in
// config.mjs, so that no configuration can turn them off. A test checks them.

import { spawn } from 'node:child_process';

/**
 * Limits of one run, from RUN_LIMITS in config.mjs.
 * @typedef {{ maxTurns: number, maxBudgetUsd: number }} RunLimits
 */

/**
 * What one run gives back. `ok: false` is a failed pass: the review goes on,
 * and the brief names the pass.
 * @typedef {object} RunResult
 * @property {boolean} ok
 * @property {unknown} [output] the validated `structured_output`, when ok
 * @property {string} [error] why the run failed, for the log, when not ok
 * @property {number} costUsd
 * @property {number} durationMs
 * @property {string[]} models the models that ran, from `modelUsage`
 */

/** The only tools a run gets: read files, search them, list them. */
export const READ_ONLY_TOOLS = 'Read,Grep,Glob';

/** Longest time a run may take before the hub stops it. */
const RUN_TIMEOUT_MS = 15 * 60 * 1000;

/** How much of stderr goes into the error of a failed run. */
const STDERR_TAIL = 500;

/**
 * The isolation flag per `authMode`. Safe mode reads the OAuth token, bare
 * mode reads only ANTHROPIC_API_KEY; both skip the checked-out tree's
 * CLAUDE.md, hooks, skills, plugins and MCP servers.
 */
const ISOLATION_FLAGS = {
  oauth: '--safe-mode',
  'api-key': '--bare',
};

/**
 * Variables a run does not get. The model has no use for them, and a run that
 * reads untrusted pull request content should hold no token that can write.
 */
const HIDDEN_ENV = [
  'GITHUB_TOKEN',
  'GH_TOKEN',
  'ACTIONS_RUNTIME_TOKEN',
  'ACTIONS_ID_TOKEN_REQUEST_TOKEN',
  'ACTIONS_ID_TOKEN_REQUEST_URL',
];

/**
 * The isolation flag for an auth mode. An unknown mode is an error, so a typo
 * cannot start a run without isolation.
 * @param {string} authMode
 */
export function isolationFlag(authMode) {
  const flag = ISOLATION_FLAGS[authMode];
  if (!flag) {
    throw new Error(`Unknown authMode: ${authMode}`);
  }
  return flag;
}

/**
 * The family alias of a model ID, for `--fallback-model`, so a retired ID
 * falls back to the current model of the same family.
 * @param {string} model an exact ID such as `claude-sonnet-5-5`
 */
export function familyAlias(model) {
  const match = /^claude-([a-z]+)-\d/.exec(model);
  if (!match) {
    throw new Error(`Not a model ID: ${model}`);
  }
  return match[1];
}

/**
 * The arguments of `claude` for one run.
 * @param {object} options
 * @param {string} options.authMode `oauth` or `api-key`
 * @param {object} options.schema JSON Schema of the answer
 * @param {string} options.model exact model ID
 * @param {RunLimits} options.limits
 * @param {string} options.promptFile role prompt, from the base checkout
 * @returns {string[]}
 */
export function buildArgs({ authMode, schema, model, limits, promptFile }) {
  return [
    '-p',
    isolationFlag(authMode),
    '--restricted',
    '--tools',
    READ_ONLY_TOOLS,
    '--permission-mode',
    'dontAsk',
    '--strict-mcp-config',
    '--no-session-persistence',
    '--output-format',
    'json',
    '--json-schema',
    JSON.stringify(schema),
    '--model',
    model,
    '--fallback-model',
    familyAlias(model),
    '--max-turns',
    String(limits.maxTurns),
    '--max-budget-usd',
    String(limits.maxBudgetUsd),
    '--append-system-prompt-file',
    promptFile,
  ];
}

/**
 * The environment of a run: the hub's environment without HIDDEN_ENV.
 * @param {NodeJS.ProcessEnv} env
 */
export function runEnv(env) {
  const copy = { ...env };
  for (const name of HIDDEN_ENV) {
    delete copy[name];
  }
  return copy;
}

/** @param {string} text */
const tail = (text) => text.trim().slice(-STDERR_TAIL);

/** @param {string} stdout */
function parseJson(stdout) {
  try {
    return JSON.parse(stdout);
  } catch {
    return undefined;
  }
}

/**
 * Why a finished run gave no usable answer, or undefined when it did.
 * @param {number | null} exitCode
 * @param {any} data the parsed JSON output
 */
function failureReason(exitCode, data) {
  if (data === undefined) {
    return 'no JSON output';
  }
  if (data.is_error || data.subtype !== 'success') {
    return `run ended with ${data.subtype ?? 'an error'}`;
  }
  if (data.structured_output === undefined) {
    return 'no structured output';
  }
  if (exitCode !== 0) {
    return `exit code ${exitCode}`;
  }
  return undefined;
}

/**
 * Reads the output of a finished run.
 * @param {{ exitCode: number | null, stdout: string, stderr: string, durationMs: number }} run
 * @returns {RunResult}
 */
export function parseResult({ exitCode, stdout, stderr, durationMs }) {
  const data = parseJson(stdout);
  const common = {
    costUsd: data?.total_cost_usd ?? 0,
    durationMs: data?.duration_ms ?? durationMs,
    models: Object.keys(data?.modelUsage ?? {}),
  };
  const reason = failureReason(exitCode, data);
  if (reason) {
    const details = tail(stderr);
    const error = details ? `${reason}: ${details}` : reason;
    return { ok: false, error, ...common };
  }
  return { ok: true, output: data.structured_output, ...common };
}

/**
 * Runs `claude` once, without a shell, with the input on stdin. Never throws:
 * a run that cannot start, times out or fails gives `ok: false`.
 * @param {object} options
 * @param {string[]} options.args from buildArgs
 * @param {string} options.input the text the model reads
 * @param {string} options.cwd the pull request checkout, read only
 * @param {NodeJS.ProcessEnv} [options.env]
 * @param {typeof spawn} [options.spawnProcess] replaced in tests
 * @param {number} [options.timeoutMs]
 * @returns {Promise<RunResult>}
 */
export function runModel({
  args,
  input,
  cwd,
  env = process.env,
  spawnProcess = spawn,
  timeoutMs = RUN_TIMEOUT_MS,
}) {
  const started = Date.now();
  return new Promise((resolve) => {
    const child = spawnProcess('claude', args, {
      cwd,
      env: runEnv(env),
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => child.kill('SIGTERM'), timeoutMs);
    const fail = (error) => {
      clearTimeout(timer);
      resolve({
        ok: false,
        error,
        costUsd: 0,
        durationMs: Date.now() - started,
        models: [],
      });
    };
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    child.on('error', (error) =>
      fail(`could not start claude: ${error.message}`),
    );
    child.on('close', (exitCode, signal) => {
      clearTimeout(timer);
      if (signal) {
        fail(`stopped by ${signal}`);
        return;
      }
      resolve(
        parseResult({
          exitCode,
          stdout,
          stderr,
          durationMs: Date.now() - started,
        }),
      );
    });
    child.stdin.on('error', () => {});
    child.stdin.end(input);
  });
}