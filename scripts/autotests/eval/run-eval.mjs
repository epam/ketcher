#!/usr/bin/env node
// Runs the Claude Implement Autotests workflow on the eval set
// (eval-set.json) once per model configuration, then checks what the model
// wrote: the code compiles and passes lint, the spec has one test per
// checklist item, and
// passes against the example app, run several times so a flaky test shows.
// It writes one result file per issue and configuration. Nothing goes to
// GitHub: the issue text is in the eval set, and no branch or PR is made.
//
// Usage:
//   node scripts/autotests/eval/run-eval.mjs --prepare
//   node scripts/autotests/eval/run-eval.mjs [--plan]
//     [--config <name>[,<name>...]] [--issue <N>[,<N>...]] [--runs <N>]
//     [--set <file>] [--results <dir>] [--work-dir <dir>] [--ketcher-url <url>]
//
// --prepare makes the checkout at the set's base commit, installs and builds
// it, and prints the command that serves the app. It runs no model.
// --plan prints the issues and configurations it would run, and runs nothing.
// The `reference` configuration runs no model: it checks the merged spec of
// each issue on the same app, so a test that fails there is the app or the
// machine, not the model.

import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { execa } from 'execa';
import { parseTests } from '../bug-spec.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const REPO_ROOT = resolve(HERE, '../../..');
const WORKFLOW = join(
  REPO_ROOT,
  '.github/workflows/claude-implement-autotests.yml',
);
const AUTOTESTS = 'ketcher-autotests';
const POPUP_PROJECT = 'chromium-popup';

/**
 * One model configuration of the eval.
 * @typedef {object} EvalConfig
 * @property {string} name
 * @property {string} [model] the model that writes the spec; none for `reference`
 */

/** @type {EvalConfig[]} */
export const CONFIGS = [
  // The merged spec of each issue, checked on the same app: the control.
  { name: 'reference' },
  // The default of the workflow (AUTOTEST_MODEL).
  { name: 'sonnet', model: 'claude-sonnet-5-5' },
  { name: 'opus', model: 'claude-opus-5-5' },
];

/** Most a model run may spend; the run stops there. */
export const MAX_BUDGET_USD = 25;

/** Longest time one model run may take: the workflow's job timeout. */
const MODEL_TIMEOUT_MS = 60 * 60 * 1000;

/** Longest time one Playwright run of a spec may take. */
const TEST_TIMEOUT_MS = 45 * 60 * 1000;

/**
 * Variables a model run does not get: the first two mark the eval as running
 * inside a Claude Code session, the rest are tokens that can write.
 */
const HIDDEN_ENV = [
  'CLAUDECODE',
  'CLAUDE_CODE_ENTRYPOINT',
  'GITHUB_TOKEN',
  'GH_TOKEN',
];

const OPTIONS = {
  prepare: { type: 'boolean', default: false },
  plan: { type: 'boolean', default: false },
  config: { type: 'string' },
  issue: { type: 'string' },
  runs: { type: 'string', default: '3' },
  set: { type: 'string', default: join(HERE, 'eval-set.json') },
  results: { type: 'string', default: join(HERE, 'results') },
  'work-dir': {
    type: 'string',
    default: join(tmpdir(), 'ketcher-autotest-eval'),
  },
  'ketcher-url': { type: 'string', default: 'http://127.0.0.1:4002' },
};

/** @param {string | undefined} list a comma-separated list */
const splitList = (list) =>
  list
    ? list
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : undefined;

/**
 * The command line as settings. An unknown option, configuration or issue
 * number throws, so a typo does not start paid runs of the wrong thing.
 * @param {string[]} args
 * @param {EvalConfig[]} [configs]
 */
export function parseCommandLine(args, configs = CONFIGS) {
  const { values } = parseArgs({ args, options: OPTIONS, strict: true });
  const names = splitList(values.config) ?? configs.map((item) => item.name);
  const unknown = names.filter((name) => !configs.some((c) => c.name === name));
  if (unknown.length > 0) {
    throw new Error(`Unknown configuration: ${unknown.join(', ')}`);
  }
  const issues = splitList(values.issue)?.map(Number);
  if (issues?.some((issue) => !Number.isInteger(issue) || issue < 1)) {
    throw new Error('--issue takes issue numbers');
  }
  const runs = Number(values.runs);
  if (!Number.isInteger(runs) || runs < 1) {
    throw new Error('--runs takes a positive whole number');
  }
  return {
    prepare: values.prepare,
    plan: values.plan,
    configs: configs.filter((item) => names.includes(item.name)),
    issues,
    runs,
    setPath: resolve(values.set),
    resultsDir: resolve(values.results),
    workDir: resolve(values['work-dir']),
    ketcherUrl: values['ketcher-url'].replace(/\/+$/, ''),
  };
}

/**
 * The entries of the eval set to run.
 * @param {{ entries: object[] }} set
 * @param {number[] | undefined} issues
 */
export function selectEntries(set, issues) {
  if (!issues) {
    return set.entries;
  }
  const missing = issues.filter(
    (issue) => !set.entries.some((e) => e.issue === issue),
  );
  if (missing.length > 0) {
    throw new Error(`Not in the eval set: ${missing.join(', ')}`);
  }
  return set.entries.filter((entry) => issues.includes(entry.issue));
}

/**
 * The prompt of the Claude step, as the workflow file has it: the `prompt: |`
 * block, without its indentation. Read from the workflow so the eval runs the
 * prompt the workflow runs, and changes with it.
 * @param {string} workflowText
 */
export function promptTemplate(workflowText) {
  const lines = workflowText.split('\n');
  const start = lines.findIndex((line) => /^\s+prompt: \|\s*$/.test(line));
  if (start < 0) {
    throw new Error('The workflow has no `prompt: |` block');
  }
  const block = [];
  let indent;
  for (const line of lines.slice(start + 1)) {
    if (line.trim() === '') {
      block.push('');
      continue;
    }
    const lineIndent = line.length - line.trimStart().length;
    indent ??= lineIndent;
    if (lineIndent < indent) {
      break;
    }
    block.push(line.slice(indent));
  }
  while (block.at(-1) === '') {
    block.pop();
  }
  return `${block.join('\n')}\n`;
}

/**
 * The prompt for one feature entry: the workflow's template with its
 * expressions filled in as the workflow fills them for a feature request.
 * An expression it does not know throws, so a workflow change that adds one
 * stops the eval instead of sending the model a raw `${{ }}`.
 * @param {string} template
 * @param {any} entry
 */
export function buildPrompt(template, entry) {
  const values = {
    'steps.issue.outputs.kind': 'feature',
    'github.event.issue.number': String(entry.issue),
    'github.event.issue.title': entry.title,
    'github.event.issue.html_url': entry.url,
    'steps.issue.outputs.spec_file_name': entry.specFileName,
    'steps.issue.outputs.version': entry.version,
    'steps.issue.outputs.issue_body': entry.body,
    'steps.issue.outputs.bug_details': '',
    'steps.plan.outputs.case_plan': '',
  };
  return template.replace(/\$\{\{\s*([^}]+?)\s*\}\}/g, (_, name) => {
    if (!(name in values)) {
      throw new Error(`Unknown expression in the workflow prompt: ${name}`);
    }
    return values[name];
  });
}

/**
 * The arguments of `claude` for one generation: the tools of the workflow's
 * Claude step, with every other tool refused instead of asked for.
 * `--restricted` drops the tools that run commands and ignores the settings
 * files of this machine; the checkout's CLAUDE.md and skills still load, as
 * in the workflow.
 * @param {string} model
 */
export function modelArgs(model) {
  return [
    '-p',
    '--restricted',
    '--tools',
    'Read,Glob,Grep,Edit,Write',
    '--allowedTools',
    'Read',
    'Glob',
    'Grep',
    `Edit(${AUTOTESTS}/**)`,
    `Write(${AUTOTESTS}/**)`,
    '--disallowedTools',
    'Bash',
    'WebFetch',
    'WebSearch',
    'Read(./.git/**)',
    '--permission-mode',
    'dontAsk',
    '--strict-mcp-config',
    '--no-session-persistence',
    '--output-format',
    'json',
    '--model',
    model,
    '--max-budget-usd',
    String(MAX_BUDGET_USD),
  ];
}

/** @param {NodeJS.ProcessEnv} env */
export function modelEnv(env) {
  const copy = { ...env };
  for (const name of HIDDEN_ENV) {
    delete copy[name];
  }
  return copy;
}

/**
 * What a finished generation reports: whether it ended well, its cost, time
 * and turns, and why it failed.
 * @param {{ exitCode?: number | null, stdout: string, stderr: string, durationMs: number }} run
 */
export function parseModelOutput({ exitCode, stdout, stderr, durationMs }) {
  let data;
  try {
    data = JSON.parse(stdout);
  } catch {
    data = undefined;
  }
  const common = {
    costUsd: data?.total_cost_usd ?? 0,
    durationMs: data?.duration_ms ?? durationMs,
    turns: data?.num_turns ?? 0,
    models: Object.keys(data?.modelUsage ?? {}),
  };
  let error;
  if (data === undefined) {
    error = `no JSON output: ${stderr.trim().slice(-500)}`;
  } else if (data.subtype !== 'success') {
    error = `run ended with ${data.subtype ?? 'an error'}`;
  } else if (data.is_error) {
    const status = data.api_error_status
      ? ` (HTTP ${data.api_error_status})`
      : '';
    error = `run failed${status}: ${data.result}`;
  } else if (exitCode !== 0) {
    error = `exit code ${exitCode}`;
  }
  return { ok: !error, ...(error ? { error } : {}), ...common };
}

/**
 * Whether a generation failed on the account's usage limit. Such a result is
 * not the model's, so it must not be saved.
 * @param {{ error?: string }} generation
 */
export const hitUsageLimit = (generation) =>
  /HTTP 429/.test(generation?.error ?? '');

const VERSION_LINE = /^\s*\*\s*Version:?\s+(\S+)/gm;
const TEST_TASK_LINE = /^\s*\*\s*Test task:?\s+(\S+)/gm;
/** Selector calls that R15 wants in a page object, not in a spec. */
const RAW_SELECTOR = /\bpage\s*\.\s*(?:getByTestId|locator)\s*\(/g;

/**
 * What can be checked in a spec without running it, against its entry.
 * @param {string} specText
 * @param {{ checklist: number, version: string, url: string }} entry
 */
export function analyzeSpec(specText, entry) {
  const tests = parseTests(specText).map((test) => ({
    title: test.title,
    caseNumber: test.caseNumber,
    skip: /^\s*test\s*\.\s*skip\s*\(/.test(test.text),
  }));
  const numbers = tests.map((test) => test.caseNumber);
  const expected = Array.from({ length: entry.checklist }, (_, i) => i + 1);
  const versions = [...specText.matchAll(VERSION_LINE)].map((m) => m[1]);
  const testTasks = [...specText.matchAll(TEST_TASK_LINE)].map((m) => m[1]);
  return {
    tests,
    testCount: tests.length,
    skipCount: tests.filter((test) => test.skip).length,
    // One test per checklist item, numbered 1..N in checklist order.
    casesMatchChecklist:
      numbers.length === expected.length &&
      numbers.every((number, i) => number === expected[i]),
    wrongVersionLines: versions.filter((v) => v !== entry.version).length,
    versionLines: versions.length,
    wrongTestTaskLines: testTasks.filter((url) => url !== entry.url).length,
    rawSelectors: (specText.match(RAW_SELECTOR) ?? []).length,
  };
}

/**
 * The TypeScript errors of the given files, from `tsc --pretty false` output.
 * @param {string} output
 * @param {string[]} files paths relative to the ketcher-autotests folder
 */
export function tscErrors(output, files) {
  return output
    .split('\n')
    .filter((line) => / error TS\d+:/.test(line))
    .filter((line) => files.some((file) => line.startsWith(`${file}(`)));
}

/**
 * Error and warning counts from `eslint --format json` output.
 * @param {string} output
 */
export function eslintCounts(output) {
  let files;
  try {
    files = JSON.parse(output);
  } catch {
    return { errors: -1, warnings: -1, rules: [] };
  }
  const messages = files.flatMap((file) => file.messages ?? []);
  return {
    errors: messages.filter((m) => m.severity === 2).length,
    warnings: messages.filter((m) => m.severity === 1).length,
    rules: [...new Set(messages.map((m) => m.ruleId ?? 'parse'))].sort(),
  };
}

/**
 * The first line of a Playwright error, without the terminal colour codes
 * its messages carry.
 * @param {string | undefined} message
 */
export const firstLine = (message) =>
  message
    // eslint-disable-next-line no-control-regex
    ?.replace(/\u001b\[[0-9;]*m/g, '')
    .split('\n')[0];

/**
 * Each test of a Playwright JSON report with its status, in file order.
 * A report that did not load the spec at all gives its errors instead.
 * @param {any} report
 */
export function playwrightTests(report) {
  const tests = [];
  const walk = (suite, titles) => {
    const path = suite.title ? [...titles, suite.title] : titles;
    for (const spec of suite.specs ?? []) {
      for (const test of spec.tests ?? []) {
        const last = test.results?.at(-1);
        tests.push({
          title: [...path.slice(1), spec.title].join(' > '),
          status:
            test.status === 'skipped' ? 'skipped' : (last?.status ?? 'none'),
          error: firstLine(last?.error?.message),
        });
      }
    }
    for (const child of suite.suites ?? []) {
      walk(child, path);
    }
  };
  for (const suite of report?.suites ?? []) {
    walk(suite, []);
  }
  const errors = (report?.errors ?? []).map((e) => firstLine(e.message));
  return { tests, errors };
}

/**
 * The runs of one spec, summed per test: how many runs it passed, and
 * whether it passed in all, in some (flaky) or in none.
 * @param {{ tests: { title: string, status: string, error?: string }[] }[]} runs
 */
export function combineRuns(runs) {
  const byTitle = new Map();
  for (const run of runs) {
    for (const test of run.tests) {
      const entry = byTitle.get(test.title) ?? {
        title: test.title,
        passed: 0,
        skipped: false,
        errors: [],
      };
      if (test.status === 'passed') {
        entry.passed += 1;
      } else if (test.status === 'skipped') {
        entry.skipped = true;
      } else if (test.error && !entry.errors.includes(test.error)) {
        entry.errors.push(test.error);
      }
      byTitle.set(test.title, entry);
    }
  }
  const tests = [...byTitle.values()].map((test) => ({
    ...test,
    outcome: test.skipped
      ? 'skipped'
      : test.passed === runs.length
        ? 'passed'
        : test.passed === 0
          ? 'failed'
          : 'flaky',
  }));
  const count = (outcome) => tests.filter((t) => t.outcome === outcome).length;
  return {
    runs: runs.length,
    tests,
    passed: count('passed'),
    flaky: count('flaky'),
    failed: count('failed'),
    skipped: count('skipped'),
  };
}

/**
 * The absolute path of a repository path in the checkout. A path that leaves
 * the checkout throws, so a bad eval-set entry cannot delete outside it.
 * @param {string} checkout
 * @param {string} path
 */
export function insideCheckout(checkout, path) {
  const full = resolve(checkout, path);
  if (!full.startsWith(`${resolve(checkout)}${sep}`)) {
    throw new Error(`Path leaves the checkout: ${path}`);
  }
  return full;
}

/** @param {string} dir @param {string} config @param {number} issue */
export const resultPath = (dir, config, issue) =>
  join(dir, config, `${issue}.json`);

/** @param {string} path */
const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));

/** @param {string} path @param {unknown} value */
function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

/** @param {string} workDir */
const checkoutDir = (workDir) => join(workDir, 'checkout');

/**
 * Puts the checkout's ketcher-autotests folder back to the base commit:
 * restores changed and deleted files and removes new ones.
 * @param {string} checkout
 * @param {string} base
 */
async function resetAutotests(checkout, base) {
  await execa('git', ['-C', checkout, 'checkout', base, '--', AUTOTESTS]);
  await execa('git', ['-C', checkout, 'clean', '-fdq', '--', AUTOTESTS]);
}

/**
 * The files under ketcher-autotests that differ from the base commit, new
 * ones included.
 * @param {string} checkout
 */
async function changedFiles(checkout) {
  const { stdout } = await execa('git', [
    '-C',
    checkout,
    '-c',
    'core.quotePath=false',
    'status',
    '--porcelain',
    '--untracked-files=all',
    '--',
    AUTOTESTS,
  ]);
  return stdout
    .split('\n')
    .filter(Boolean)
    .map((line) => ({ status: line.slice(0, 2).trim(), path: line.slice(3) }));
}

/**
 * Copies the files the model wrote into the result folder, so they can be
 * read and judged after the checkout moves on.
 * @param {string} checkout
 * @param {{ status: string, path: string }[]} files
 * @param {string} target
 */
function keepFiles(checkout, files, target) {
  rmSync(target, { recursive: true, force: true });
  for (const file of files.filter((f) => f.status !== 'D')) {
    const to = join(target, file.path);
    mkdirSync(dirname(to), { recursive: true });
    cpSync(join(checkout, file.path), to);
  }
}

/** The project a spec runs in, from its folder (testing.md, "Playwright Projects"). */
const projectOf = (spec) =>
  spec.includes('/Chromium-popup/') ? POPUP_PROJECT : 'chromium';

/**
 * Compiles, lints and runs the specs, and analyzes their text.
 * @param {object} options
 * @param {string} options.checkout
 * @param {string[]} options.specs repository paths of the specs
 * @param {string[]} options.codeFiles repository paths of every TypeScript
 *   file to compile and lint: the specs and the page objects and helpers the
 *   model wrote or changed
 * @param {any} options.entry
 * @param {number} options.runs
 * @param {string} options.ketcherUrl
 * @param {string} options.reportDir where the Playwright reports go
 */
async function checkSpecs({
  checkout,
  specs,
  codeFiles,
  entry,
  runs,
  ketcherUrl,
  reportDir,
}) {
  const autotests = join(checkout, AUTOTESTS);
  const local = specs.map((spec) => relative(AUTOTESTS, spec));
  const analysis = specs.map((spec) => ({
    spec,
    ...analyzeSpec(readFileSync(join(checkout, spec), 'utf8'), entry),
  }));

  const tsc = await execa('npx', ['tsc', '--noEmit', '--pretty', 'false'], {
    cwd: autotests,
    reject: false,
  });
  const typeErrors = tscErrors(
    tsc.stdout,
    codeFiles.map((file) => relative(AUTOTESTS, file)),
  );

  // From the repository root, where the ESLint config is. That config
  // ignores spec files, so this lints the page objects and helpers only.
  const eslint = await execa(
    'npx',
    ['eslint', '--format', 'json', '--no-warn-ignored', ...codeFiles],
    { cwd: checkout, reject: false },
  );
  const lint = eslintCounts(eslint.stdout);

  const testEnv = {
    ...process.env,
    KETCHER_URL: ketcherUrl,
    MODE: 'standalone',
    CI_ENVIRONMENT: 'false',
    IGNORE_UNSTABLE_TESTS: 'true',
    GENERATE_DATA: 'false',
  };
  const projects = [...new Set(specs.map(projectOf))];
  const runResults = [];
  const loadErrors = [];
  for (let run = 1; run <= runs; run += 1) {
    const reportFile = join(reportDir, `run-${run}.json`);
    mkdirSync(reportDir, { recursive: true });
    // The first run writes the screenshots that have no baseline yet, so
    // later runs compare against them: a new spec has no baseline of its own.
    await execa(
      'npx',
      [
        'playwright',
        'test',
        ...local,
        ...projects.flatMap((project) => ['--project', project]),
        '--reporter=json',
        `--update-snapshots=${run === 1 ? 'missing' : 'none'}`,
      ],
      {
        cwd: autotests,
        env: { ...testEnv, PLAYWRIGHT_JSON_OUTPUT_FILE: reportFile },
        reject: false,
        timeout: TEST_TIMEOUT_MS,
      },
    );
    const report = existsSync(reportFile) ? readJson(reportFile) : undefined;
    const parsed = playwrightTests(report);
    if (!report) {
      parsed.errors.push('no report: the run did not finish');
    }
    loadErrors.push(...parsed.errors.filter((e) => !loadErrors.includes(e)));
    runResults.push(parsed);
  }
  return {
    analysis,
    typeErrors,
    lint,
    loadErrors,
    playwright: combineRuns(runResults),
  };
}

/**
 * Runs one entry under one configuration and returns its result, or
 * undefined when the usage limit stopped the model run.
 * @param {object} options
 * @param {any} options.entry
 * @param {EvalConfig} options.config
 * @param {string} options.base
 * @param {string} options.checkout
 * @param {string} options.template
 * @param {ReturnType<typeof parseCommandLine>} options.settings
 */
async function runEntry({ entry, config, base, checkout, template, settings }) {
  const outDir = join(settings.resultsDir, config.name, String(entry.issue));
  await resetAutotests(checkout, base);
  const started = Date.now();
  let generation;
  let specs;
  let files = [];
  if (config.model) {
    for (const path of entry.reference.remove) {
      rmSync(insideCheckout(checkout, path), { recursive: true, force: true });
    }
    const child = await execa('claude', modelArgs(config.model), {
      cwd: checkout,
      env: modelEnv(process.env),
      extendEnv: false,
      input: buildPrompt(template, entry),
      timeout: MODEL_TIMEOUT_MS,
      reject: false,
    });
    generation = parseModelOutput({
      exitCode: child.exitCode,
      stdout: child.stdout ?? '',
      stderr: child.timedOut ? 'timed out' : (child.stderr ?? ''),
      durationMs: Date.now() - started,
    });
    if (hitUsageLimit(generation)) {
      return undefined;
    }
    // As the workflow does after the Claude step.
    const moved = await execa(
      'node',
      ['scripts/autotests/move-test-data.mjs', entry.specFileName],
      { cwd: checkout, reject: false },
    );
    generation.testDataReport = moved.stdout.trim();
    // The eval deleted the reference itself; that is not the model's change.
    const removedByEval = (file) =>
      file.status === 'D' &&
      entry.reference.remove.some(
        (path) => file.path === path || file.path.startsWith(`${path}/`),
      );
    files = (await changedFiles(checkout)).filter((f) => !removedByEval(f));
    keepFiles(checkout, files, join(outDir, 'files'));
    specs = files
      .filter((file) => file.status !== 'D' && file.path.endsWith('.spec.ts'))
      .map((file) => file.path);
  } else {
    specs = entry.reference.specs;
  }
  const result = {
    issue: entry.issue,
    config: config.name,
    model: config.model,
    base,
    generation,
    files: files.map((file) => `${file.status} ${file.path}`),
    specs,
    expectedSpecName: entry.specFileName,
    specNameMatches: specs.some((spec) =>
      spec.endsWith(`/${entry.specFileName}`),
    ),
    checklist: entry.checklist,
  };
  if (specs.length > 0) {
    Object.assign(
      result,
      await checkSpecs({
        checkout,
        specs,
        codeFiles: [
          ...new Set([
            ...specs,
            ...files
              .filter((f) => f.status !== 'D' && /\.tsx?$/.test(f.path))
              .map((f) => f.path),
          ]),
        ],
        entry,
        runs: settings.runs,
        ketcherUrl: settings.ketcherUrl,
        reportDir: join(outDir, 'playwright'),
      }),
    );
  }
  result.totalMs = Date.now() - started;
  return result;
}

/** @param {ReturnType<typeof parseCommandLine>} settings @param {any} set */
async function prepare(settings, set) {
  const checkout = checkoutDir(settings.workDir);
  if (!existsSync(checkout)) {
    mkdirSync(settings.workDir, { recursive: true });
    await execa(
      'git',
      ['-C', REPO_ROOT, 'fetch', '--quiet', 'origin', set.base],
      {
        reject: false,
      },
    );
    await execa(
      'git',
      ['-C', REPO_ROOT, 'worktree', 'add', '--detach', checkout, set.base],
      { stdio: 'inherit' },
    );
  }
  for (const [command, args] of [
    ['npm', ['ci']],
    ['npm', ['run', 'build']],
    ['npx', ['playwright', 'install', 'chromium']],
  ]) {
    console.log(`$ ${command} ${args.join(' ')}`);
    await execa(command, args, {
      cwd: command === 'npx' ? join(checkout, AUTOTESTS) : checkout,
      stdio: 'inherit',
    });
  }
  console.log(
    `Ready. Serve the app in another terminal and leave it running:\n  cd ${checkout} && npm run serve:standalone`,
  );
}

/**
 * Stops before any paid run when the checkout is not at the base commit or
 * the app does not answer.
 * @param {string} checkout
 * @param {string} base
 * @param {string} ketcherUrl
 */
async function checkReady(checkout, base, ketcherUrl) {
  if (!existsSync(checkout)) {
    throw new Error('No checkout: run with --prepare first');
  }
  const { stdout } = await execa('git', ['-C', checkout, 'rev-parse', 'HEAD']);
  if (stdout.trim() !== base) {
    throw new Error(
      `The checkout is at ${stdout.trim()}, not at the base ${base}`,
    );
  }
  const url = `${ketcherUrl}/popup.html`;
  const response = await fetch(url).catch((error) => ({ ok: false, error }));
  if (!response.ok) {
    throw new Error(
      `The app does not answer at ${url}: serve it first (see --prepare)`,
    );
  }
}

/** @param {string[]} args */
async function main(args) {
  const settings = parseCommandLine(args);
  const set = readJson(settings.setPath);
  const entries = selectEntries(set, settings.issues);
  if (settings.prepare) {
    await prepare(settings, set);
    return;
  }
  if (settings.plan) {
    for (const entry of entries) {
      console.log(
        `#${entry.issue}: ${entry.checklist} checklist items, reference ${entry.reference.specs.join(', ')}`,
      );
    }
    const paid = settings.configs.filter((c) => c.model);
    console.log(
      `Configurations: ${settings.configs.map((c) => c.name).join(', ')}; ${entries.length * paid.length} model runs, ${settings.runs} test runs per spec`,
    );
    return;
  }
  const checkout = checkoutDir(settings.workDir);
  await checkReady(checkout, set.base, settings.ketcherUrl);
  const template = promptTemplate(readFileSync(WORKFLOW, 'utf8'));
  try {
    for (const entry of entries) {
      for (const config of settings.configs) {
        console.log(`#${entry.issue} ${config.name}: running`);
        const result = await runEntry({
          entry,
          config,
          base: set.base,
          checkout,
          template,
          settings,
        });
        if (!result) {
          console.log(
            'Usage limit reached: this result is not saved and the eval stops. Rerun this configuration and the issues after it once the limit resets.',
          );
          return;
        }
        writeJson(
          resultPath(settings.resultsDir, config.name, entry.issue),
          result,
        );
        const pw = result.playwright;
        console.log(
          `#${entry.issue} ${config.name}: ${result.specs.length} specs, ${result.analysis?.reduce((n, a) => n + a.testCount, 0) ?? 0}/${entry.checklist} tests, ${result.typeErrors?.length ?? '-'} type errors, ` +
            `${pw ? `${pw.passed} passed, ${pw.flaky} flaky, ${pw.failed} failed, ${pw.skipped} skipped` : 'not run'}` +
            `${result.generation ? `, $${result.generation.costUsd.toFixed(2)}, ${Math.round(result.generation.durationMs / 1000)} s` : ''}` +
            `${result.generation?.error ? `, ERROR: ${result.generation.error}` : ''}`,
        );
      }
    }
  } finally {
    await resetAutotests(checkout, set.base);
  }
}

if (realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
