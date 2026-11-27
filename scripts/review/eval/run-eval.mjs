#!/usr/bin/env node
// Runs the review hub on the eval set (eval-set.json) once per model
// configuration and writes one result file per pull request and
// configuration. Dry run only: GitHub is read, never written, and every
// write call of the GitHub client throws.
//
// Usage:
//   node scripts/review/eval/run-eval.mjs [--plan]
//     [--config <name>[,<name>...]] [--pr <N>[,<N>...]]
//     [--set <file>] [--results <dir>] [--work-dir <dir>]
//
// --plan reads the diffs and prints the panel and the run count of every
// pull request, and runs no model. A configuration with `findersFrom`
// reuses the finder findings of that configuration, so it must run after it;
// the configurations run in the order of CONFIGS.

import {
  existsSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { execa } from 'execa';
import { panelFiles, pickPanel } from '../../review-panel.mjs';
import { AUTH_MODE, MAX_VERIFIED_FINDINGS } from '../config.mjs';
import { parseDiff } from '../diff.mjs';
import { runReview } from '../flow.mjs';
import { createGitHub, githubToken } from '../github.mjs';
import { runModel } from '../runner.mjs';
import { FINDINGS_SCHEMA } from '../schemas.mjs';
import { filterDiff } from '../scope.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const REPO_ROOT = resolve(HERE, '../../..');

/**
 * One model configuration of the eval.
 * @typedef {object} EvalConfig
 * @property {string} name
 * @property {string} finder model of the finder passes
 * @property {string} verifier model of the verifier, duplicates and linked-issue runs
 * @property {string} [findersFrom] configuration whose finder findings this one reuses
 */

/** @type {EvalConfig[]} */
export const CONFIGS = [
  // The default of config.mjs, the baseline the cheaper models are measured against.
  {
    name: 'opus-finders-opus-verifier',
    finder: 'claude-opus-5-5',
    verifier: 'claude-opus-5-5',
  },
  {
    name: 'sonnet-finders-sonnet-verifier',
    finder: 'claude-sonnet-5-5',
    verifier: 'claude-sonnet-5-5',
  },
  {
    name: 'haiku-finders-haiku-verifier',
    finder: 'claude-haiku-5-5',
    verifier: 'claude-haiku-5-5',
  },
  {
    name: 'haiku-finders-sonnet-verifier',
    finder: 'claude-haiku-5-5',
    verifier: 'claude-sonnet-5-5',
    findersFrom: 'haiku-finders-haiku-verifier',
  },
  {
    name: 'sonnet-finders-haiku-verifier',
    finder: 'claude-sonnet-5-5',
    verifier: 'claude-haiku-5-5',
    findersFrom: 'sonnet-finders-sonnet-verifier',
  },
];

/**
 * Variables a nested `claude` run must not see: they mark the eval as
 * running inside a Claude Code session.
 */
const NESTED_SESSION_ENV = ['CLAUDECODE', 'CLAUDE_CODE_ENTRYPOINT'];

const OPTIONS = {
  plan: { type: 'boolean', default: false },
  config: { type: 'string' },
  pr: { type: 'string' },
  set: { type: 'string', default: join(HERE, 'eval-set.json') },
  results: { type: 'string', default: join(HERE, 'results') },
  'work-dir': {
    type: 'string',
    default: join(tmpdir(), 'ketcher-review-eval'),
  },
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
 * The command line as settings. An unknown option, configuration or pull
 * request number throws, so a typo does not start paid runs of the wrong
 * thing.
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
  const prs = splitList(values.pr)?.map(Number);
  if (prs?.some((pr) => !Number.isInteger(pr) || pr < 1)) {
    throw new Error('--pr takes pull request numbers');
  }
  return {
    plan: values.plan,
    configs: configs.filter((item) => names.includes(item.name)),
    prs,
    setPath: resolve(values.set),
    resultsDir: resolve(values.results),
    workDir: resolve(values['work-dir']),
  };
}

/**
 * The entries of the eval set to run.
 * @param {{ entries: object[] }} set
 * @param {number[] | undefined} prs
 */
export function selectEntries(set, prs) {
  if (!prs) {
    return set.entries;
  }
  const missing = prs.filter((pr) => !set.entries.some((e) => e.pr === pr));
  if (missing.length > 0) {
    throw new Error(`Not in the eval set: ${missing.join(', ')}`);
  }
  return set.entries.filter((entry) => prs.includes(entry.pr));
}

const FINDINGS_SCHEMA_TEXT = JSON.stringify(FINDINGS_SCHEMA);

/**
 * The role of a model run, read from its arguments: `finder` for a lens pass
 * (its JSON Schema is the findings schema), `verifier` for the verifier,
 * duplicates and linked-issue runs.
 * @param {string[]} args
 */
export function roleOf(args) {
  const schema = args[args.indexOf('--json-schema') + 1];
  return schema === FINDINGS_SCHEMA_TEXT ? 'finder' : 'verifier';
}

/** @param {string[]} args */
const modelOf = (args) => args[args.indexOf('--model') + 1];

/**
 * One recorded model run.
 * @typedef {object} RunRecord
 * @property {'finder' | 'verifier'} role
 * @property {'finders' | 'after'} phase `finders` for the first finder
 *   passes of the round, `after` for every run from the first verifier-role
 *   run on, deepening finder passes included
 * @property {string} model
 * @property {boolean} ok
 * @property {number} costUsd
 * @property {number} durationMs
 * @property {number} startMs
 * @property {number} endMs
 * @property {string} [error]
 */

/**
 * A model runner that records every run with its role and phase.
 * @param {object} [options]
 * @param {typeof runModel} [options.run] the runner it wraps
 * @param {NodeJS.ProcessEnv} [options.env] the environment of the runs
 * @param {() => number} [options.now]
 */
export function recordingRunner({
  run = runModel,
  env = process.env,
  now = Date.now,
} = {}) {
  /** @type {RunRecord[]} */
  const records = [];
  const runEnv = { ...env };
  for (const name of NESTED_SESSION_ENV) {
    delete runEnv[name];
  }
  let phase = 'finders';
  /** @type {typeof runModel} */
  const recording = async (options) => {
    const role = roleOf(options.args);
    if (role === 'verifier') {
      phase = 'after';
    }
    const startPhase = phase;
    const startMs = now();
    const result = await run({ ...options, env: runEnv });
    records.push({
      role,
      phase: startPhase,
      model: modelOf(options.args),
      ok: result.ok,
      costUsd: result.costUsd,
      durationMs: result.durationMs,
      startMs,
      endMs: now(),
      ...(result.ok ? {} : { error: result.error }),
    });
    return result;
  };
  return { run: recording, records };
}

/** @param {{ pr: number, title: string, base: string, head: string }} entry */
export const evalPullRequest = (entry) => ({
  number: entry.pr,
  title: entry.title,
  body: '',
  baseSha: entry.base,
  headSha: entry.head,
  labels: [],
});

/** @param {string} name */
const refuseWrite = (name) => async () => {
  throw new Error(`The eval never writes to GitHub (${name})`);
};

/**
 * The GitHub client of an eval run. It answers for the reviewed commit
 * instead of the pull request's last one, reports no earlier round, and
 * throws on every write, so a bug in the dry run cannot post.
 * @param {ReturnType<typeof createGitHub>} github
 * @param {{ pr: number, title: string, base: string, head: string }} entry
 */
export function evalGitHub(github, entry) {
  return {
    ...github,
    pullRequest: async () => evalPullRequest(entry),
    comments: async () => [],
    postReview: refuseWrite('postReview'),
    postReviewComment: refuseWrite('postReviewComment'),
    postComment: refuseWrite('postComment'),
    removeLabel: refuseWrite('removeLabel'),
  };
}

/** @param {RunRecord[]} records */
const sumCost = (records) =>
  records.reduce((sum, record) => sum + record.costUsd, 0);

/**
 * Wall time from the first start to the last end of the records, 0 for none.
 * @param {RunRecord[]} records
 */
export function wallTime(records) {
  if (records.length === 0) {
    return 0;
  }
  const start = Math.min(...records.map((record) => record.startMs));
  const end = Math.max(...records.map((record) => record.endMs));
  return end - start;
}

/**
 * A confirmed finding as the result file keeps it.
 * @param {import('../merge.mjs').MergedFinding} finding
 */
const resultFinding = (finding) => ({
  location: `${finding.file}:${finding.line}`,
  severity: finding.severity,
  id: finding.id,
  claim: finding.claim,
  scenario: finding.scenario,
  lenses: finding.lenses,
  fingerprint: finding.fingerprint,
});

/**
 * The result of one pull request under one configuration. Cost and time of
 * reused finder passes come from the source result, so every configuration
 * reports what a real round would cost.
 * @param {object} options
 * @param {{ pr: number, head: string }} options.entry
 * @param {EvalConfig} options.config
 * @param {Record<string, any>} options.log the run log of the round
 * @param {RunRecord[]} options.records
 * @param {number} options.wallMs wall time of the round
 * @param {any} [options.source] result of the `findersFrom` configuration
 */
export function summarize({ entry, config, log, records, wallMs, source }) {
  const initialFinders = records.filter((r) => r.phase === 'finders');
  const own = {
    finderCostUsd: sumCost(records.filter((r) => r.role === 'finder')),
    verifierCostUsd: sumCost(records.filter((r) => r.role === 'verifier')),
  };
  const reused = source
    ? {
        costUsd: source.cost.initialFinderUsd,
        wallMs: source.time.initialFinderMs,
      }
    : { costUsd: 0, wallMs: 0 };
  return {
    pr: entry.pr,
    head: entry.head,
    config: config.name,
    models: { finder: config.finder, verifier: config.verifier },
    findersFrom: config.findersFrom,
    error: log.error,
    panel: log.panel ?? [],
    finderFindings: log.findings ?? [],
    confirmed: (log.confirmed ?? []).map(resultFinding),
    dropped: (log.dropped ?? []).length,
    failed: log.failed ?? [],
    ranModels: log.ranModels ?? [],
    runs: records.length,
    failedRuns: records.filter((record) => !record.ok).length,
    // Why runs failed, each reason once, so a usage limit or an expired token shows.
    runErrors: [
      ...new Set(
        records.filter((record) => !record.ok).map((record) => record.error),
      ),
    ],
    cost: {
      initialFinderUsd: source
        ? source.cost.initialFinderUsd
        : sumCost(initialFinders),
      finderUsd: own.finderCostUsd + reused.costUsd,
      verifierUsd: own.verifierCostUsd,
      totalUsd: own.finderCostUsd + own.verifierCostUsd + reused.costUsd,
    },
    time: {
      initialFinderMs: source
        ? source.time.initialFinderMs
        : wallTime(initialFinders),
      totalMs: wallMs + reused.wallMs,
    },
  };
}

/** @param {string} dir @param {string} config @param {number} pr */
export const resultPath = (dir, config, pr) => join(dir, config, `${pr}.json`);

/** @param {string} path */
const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));

/** @param {string} path @param {unknown} value */
function writeJson(path, value) {
  mkdirSync(resolve(path, '..'), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

/**
 * A detached worktree of the base checkout at the reviewed commit, which
 * the model runs read. Fetches the commit when the clone lacks it.
 * @param {object} options
 * @param {string} options.baseDir
 * @param {string} options.workDir
 * @param {{ pr: number, base: string, head: string }} options.entry
 * @param {typeof execa} [options.exec]
 */
export async function prCheckout({ baseDir, workDir, entry, exec = execa }) {
  const dir = join(workDir, `pr-${entry.pr}`);
  const git = (args, options) => exec('git', ['-C', baseDir, ...args], options);
  for (const commit of [entry.base, entry.head]) {
    const found = await git(['cat-file', '-e', `${commit}^{commit}`], {
      reject: false,
    });
    if (found.exitCode !== 0) {
      await git(['fetch', '--quiet', 'origin', commit]);
    }
  }
  if (!existsSync(dir)) {
    mkdirSync(workDir, { recursive: true });
    await git(['worktree', 'add', '--detach', dir, entry.head]);
  }
  return dir;
}

/**
 * Runs one pull request under one configuration and returns its result.
 * @param {object} options
 * @param {any} options.entry
 * @param {EvalConfig} options.config
 * @param {ReturnType<typeof createGitHub>} options.github
 * @param {string} options.baseDir
 * @param {string} options.prDir
 * @param {string} options.repo
 * @param {any} [options.source] result of the `findersFrom` configuration
 * @param {typeof runModel} [options.run]
 * @param {typeof runReview} [options.review]
 * @param {() => number} [options.now]
 */
export async function runEntry({
  entry,
  config,
  github,
  baseDir,
  prDir,
  repo,
  source,
  run,
  review = runReview,
  now = Date.now,
}) {
  if (config.findersFrom && !source) {
    throw new Error(
      `${config.name} reuses the finders of ${config.findersFrom}, which has no result for #${entry.pr}`,
    );
  }
  const recorder = recordingRunner({ run, now });
  const log = {};
  const started = now();
  try {
    await review({
      prNumber: entry.pr,
      pr: evalPullRequest(entry),
      github: evalGitHub(github, entry),
      repo,
      baseDir,
      prDir,
      models: {
        finder: config.finder,
        verifier: config.verifier,
        strong: config.verifier,
      },
      authMode: AUTH_MODE,
      dryRun: true,
      savedFindings: source?.finderFindings,
      run: recorder.run,
      print: () => {},
      log,
    });
  } catch (error) {
    log.error = String(error?.stack ?? error);
  }
  return summarize({
    entry,
    config,
    log,
    records: recorder.records,
    wallMs: now() - started,
    source,
  });
}

/**
 * The panel and the most model runs of one pull request, without a model.
 * @param {string} diffText the diff from base to head
 */
export function planEntry(diffText) {
  const diff = filterDiff(parseDiff(diffText));
  const lenses = pickPanel(panelFiles(diff.reviewed)).map((item) => item.lens);
  return {
    lenses,
    files: diff.reviewed.length,
    skipped: diff.skipped.length,
    diffChars: diff.text.length,
    // finders + verifier per finding + duplicates + linked issue + two
    // deepening passes with their verifications
    maxRuns: lenses.length + MAX_VERIFIED_FINDINGS + 2 + 2 * 2,
  };
}

/** @param {ReturnType<typeof parseCommandLine>} settings */
async function printPlan(settings, entries) {
  const baseDir = REPO_ROOT;
  for (const entry of entries) {
    const prDir = await prCheckout({
      baseDir,
      workDir: settings.workDir,
      entry,
    });
    const { stdout } = await execa('git', [
      '-C',
      prDir,
      'diff',
      '--no-color',
      '--no-ext-diff',
      '--find-renames',
      entry.base,
      entry.head,
    ]);
    const plan = planEntry(stdout);
    console.log(
      `#${entry.pr} (${entry.kind}): ${plan.files} files, ${plan.diffChars} diff chars, panel ${plan.lenses.join(', ') || 'none'}, at most ${plan.maxRuns} runs per configuration`,
    );
  }
  console.log(
    `Configurations: ${settings.configs.map((c) => c.name).join(', ')}`,
  );
}

/**
 * Whether a run of the round failed on the account's usage limit. Such a
 * round is incomplete, so it must not replace an earlier result.
 * @param {{ runErrors?: (string | undefined)[] }} result
 */
export const hitUsageLimit = (result) =>
  (result.runErrors ?? []).some((reason) => /HTTP 429/.test(reason ?? ''));

/** @param {string[]} args */
async function main(args) {
  const settings = parseCommandLine(args);
  const set = readJson(settings.setPath);
  const entries = selectEntries(set, settings.prs);
  if (settings.plan) {
    await printPlan(settings, entries);
    return;
  }
  const token = await githubToken();
  for (const entry of entries) {
    const prDir = await prCheckout({
      baseDir: REPO_ROOT,
      workDir: settings.workDir,
      entry,
    });
    const github = createGitHub({ repo: set.repo, prDir, token });
    for (const config of settings.configs) {
      const source = config.findersFrom
        ? readJson(
            resultPath(settings.resultsDir, config.findersFrom, entry.pr),
          )
        : undefined;
      console.log(`#${entry.pr} ${config.name}: running`);
      const result = await runEntry({
        entry,
        config,
        github,
        baseDir: REPO_ROOT,
        prDir,
        repo: set.repo,
        source,
      });
      console.log(
        `#${entry.pr} ${config.name}: ${result.confirmed.length} confirmed, $${result.cost.totalUsd.toFixed(2)}, ${Math.round(result.time.totalMs / 1000)} s${result.error ? ', ERROR' : ''}`,
      );
      if (result.error) {
        console.log(`  round error: ${result.error}`);
      }
      if (result.failedRuns > 0) {
        console.log(`  ${result.failedRuns} failed runs:`);
        for (const reason of result.runErrors) {
          console.log(`  - ${reason}`);
        }
      }
      if (hitUsageLimit(result)) {
        console.log(
          'Usage limit reached: this result is not saved and the eval stops. Rerun this configuration and the PRs after it once the limit resets.',
        );
        return;
      }
      writeJson(resultPath(settings.resultsDir, config.name, entry.pr), result);
    }
  }
}

if (realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
