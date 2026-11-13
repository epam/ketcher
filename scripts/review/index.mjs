#!/usr/bin/env node
// Entry point of the review hub. Reads the command line, connects GitHub and
// git, picks the models, runs one review round and writes the run log.
//
// Usage:
//   node scripts/review/index.mjs --pr <N> [--dry-run]
//     [--repo <owner/name>] [--base-dir <dir>] [--pr-dir <dir>]
//     [--finder-model <id>] [--verifier-model <id>]
//     [--save-findings <file>] [--findings-from <file>] [--log <file>]
//
// --base-dir is the base checkout (prompts, rules, documents), --pr-dir the
// pull request checkout that the model runs read. Both default to the
// current folder, which suits a local run on a checked-out pull request.

import { readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { AUTH_MODE } from './config.mjs';
import { runReview } from './flow.mjs';
import { createGitHub, githubToken } from './github.mjs';
import { resolveModels } from './models.mjs';

const DEFAULT_REPO = 'epam/ketcher';
const DEFAULT_LOG = 'review-run.json';

const OPTIONS = {
  pr: { type: 'string' },
  repo: { type: 'string' },
  'base-dir': { type: 'string', default: '.' },
  'pr-dir': { type: 'string', default: '.' },
  'dry-run': { type: 'boolean', default: false },
  'finder-model': { type: 'string' },
  'verifier-model': { type: 'string' },
  'save-findings': { type: 'string' },
  'findings-from': { type: 'string' },
  log: { type: 'string', default: DEFAULT_LOG },
};

/**
 * The command line as settings. An unknown option or a missing `--pr`
 * throws, so a typo does not start a review of the wrong thing.
 * @param {string[]} args command-line arguments after the script path
 * @param {NodeJS.ProcessEnv} env
 */
export function parseCommandLine(args, env = {}) {
  const { values } = parseArgs({ args, options: OPTIONS, strict: true });
  const prNumber = Number(values.pr);
  if (!Number.isInteger(prNumber) || prNumber < 1) {
    throw new Error('--pr <number> is required');
  }
  return {
    prNumber,
    repo: values.repo ?? env.GITHUB_REPOSITORY ?? DEFAULT_REPO,
    baseDir: resolve(values['base-dir']),
    prDir: resolve(values['pr-dir']),
    dryRun: values['dry-run'],
    flags: {
      finderModel: values['finder-model'],
      verifierModel: values['verifier-model'],
    },
    saveFindings: values['save-findings'],
    findingsFrom: values['findings-from'],
    logPath: values.log,
  };
}

/**
 * Finder findings saved by an earlier run, or undefined.
 * @param {string | undefined} path
 */
function readSavedFindings(path) {
  if (!path) {
    return undefined;
  }
  return JSON.parse(readFileSync(path, 'utf8'));
}

/**
 * Writes a value as formatted JSON.
 * @param {string} path
 * @param {unknown} value
 */
const writeJson = (path, value) =>
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);

/**
 * Runs one review round and writes the run log, also when the round fails.
 * @param {string[]} args command-line arguments after the script path
 * @param {NodeJS.ProcessEnv} env
 */
async function main(args, env) {
  const settings = parseCommandLine(args, env);
  const token = await githubToken({ env });
  const github = createGitHub({
    repo: settings.repo,
    prDir: settings.prDir,
    token,
  });
  const pr = await github.pullRequest(settings.prNumber);
  const models = resolveModels({
    env,
    flags: settings.flags,
    labels: pr.labels,
  });
  const log = { startedAt: new Date().toISOString(), dryRun: settings.dryRun };
  try {
    await runReview({
      prNumber: settings.prNumber,
      pr,
      github,
      baseDir: settings.baseDir,
      prDir: settings.prDir,
      models,
      authMode: AUTH_MODE,
      dryRun: settings.dryRun,
      savedFindings: readSavedFindings(settings.findingsFrom),
      log,
    });
    if (settings.saveFindings) {
      writeJson(settings.saveFindings, log.findings ?? []);
    }
  } catch (error) {
    log.error = String(error?.stack ?? error);
    throw error;
  } finally {
    writeJson(settings.logPath, log);
  }
}

// Run only when the script is started directly, not when a test imports it.
// realpathSync resolves a start through a symlink.
if (realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2), process.env).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
