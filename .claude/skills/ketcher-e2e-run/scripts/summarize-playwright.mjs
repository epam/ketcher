#!/usr/bin/env node
/*
 * Summarises a Playwright JSON report (ketcher-autotests/results.json by default): totals, then every
 * failed and flaky test with its location, project, attempts, the first lines of the error, the
 * attachments to open, and a failure kind. Reading this instead of the raw reporter output keeps a
 * large run to a few dozen lines.
 *
 *   node summarize-playwright.mjs [report.json] [--lines <n>] [--max <n>]
 *
 * Exit codes: 0 no failures, 1 failed tests or global errors, 2 report missing or unreadable.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, '..', '..', '..', '..');
const DEFAULT_REPORT = path.join(ROOT, 'ketcher-autotests', 'results.json');

const USAGE = `Usage: node summarize-playwright.mjs [report.json] [--lines <n>] [--max <n>]

  report.json   Playwright JSON report (default: ketcher-autotests/results.json)
  --lines <n>   error lines shown per failed test (default 6)
  --max <n>     failed tests listed in full (default 30)`;

// Checked in order; the first match names the failure.
const KINDS = [
  ['environment', /ECONNREFUSED|ERR_CONNECTION_REFUSED|net::ERR_|Executable doesn't exist|browserType\.launch|Target page, context or browser has been closed|window\.ketcher is undefined/i],
  ['snapshot', /snapshot doesn't exist|toHaveScreenshot|toMatchSnapshot|Screenshot comparison failed|pixels \(ratio/i],
  ['locator', /strict mode violation|waiting for (locator|getBy)|element\(s\) not found|resolved to \d+ elements/i],
  ['timeout', /Test timeout of \d+ms exceeded|Timeout \d+ms exceeded/i],
  ['assertion', /expect\(/],
];

const HINTS = {
  environment: 'fix the setup, not the test: is the app served on KETCHER_URL, is Chromium installed, did the page crash?',
  snapshot: 'open the diff image; an intended UI change is regenerated in Docker (npm run docker:update[-popup] -- "<spec>"), never from a Windows or macOS run',
  locator: 'a data-testid, text or structure changed, or the element never rendered: grep the test id in packages/',
  timeout: 'the app never reached the awaited state: check the render/spinner waits and whether Indigo finished loading',
  assertion: 'behaviour differs from the expectation: a product regression or an outdated expected value',
  other: 'read the full error in the HTML report (npm run report)',
};

class UsageError extends Error {}

const stripAnsi = (text) => text.replace(/\[[0-9;]*[A-Za-z]/g, '');

function parseArgs(argv) {
  const opts = { report: DEFAULT_REPORT, lines: 6, max: 30, help: false };
  const positive = (flag, value) => {
    const n = Number(value);
    if (!Number.isInteger(n) || n < 1) throw new UsageError(`${flag} needs a positive integer`);
    return n;
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--lines') opts.lines = positive(arg, argv[++i]);
    else if (arg === '--max') opts.max = positive(arg, argv[++i]);
    else if (arg === '-h' || arg === '--help') opts.help = true;
    else if (arg.startsWith('--')) throw new UsageError(`unknown option: ${arg}`);
    else opts.report = path.resolve(process.cwd(), arg);
  }
  return opts;
}

function readReport(file) {
  if (!fs.existsSync(file)) {
    return { error: `no report at ${file} — run the specs first; the Ketcher config always writes results.json` };
  }
  try {
    const report = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!Array.isArray(report.suites)) return { error: `${file} is not a Playwright JSON report (no "suites")` };
    return { report };
  } catch (error) {
    return { error: `${file} is not valid JSON: ${error.message}` };
  }
}

function* walk(suite, titles) {
  for (const spec of suite.specs ?? []) {
    for (const test of spec.tests ?? []) yield { spec, test, titles };
  }
  for (const child of suite.suites ?? []) {
    yield* walk(child, child.title ? [...titles, child.title] : titles);
  }
}

function errorText(result) {
  const errors = result?.errors?.length ? result.errors : [result?.error].filter(Boolean);
  return stripAnsi(errors.map((e) => e.message ?? e.value ?? '').join('\n')).trim();
}

function classify(result, message) {
  const match = KINDS.find(([, pattern]) => pattern.test(message));
  if (match) return match[0];
  return result?.status === 'timedOut' ? 'timeout' : 'other';
}

function attachmentsOf(result) {
  return (result?.attachments ?? [])
    .filter((a) => a.path && (a.contentType?.startsWith('image/') || ['trace', 'video'].includes(a.name)))
    .map((a) => a.path)
    .slice(0, 4);
}

function collect(report) {
  const failed = [];
  const flaky = [];
  let passed = 0;
  let skipped = 0;
  for (const top of report.suites) {
    for (const { spec, test, titles } of walk(top, [])) {
      const results = test.results ?? [];
      const location = `${spec.file ?? top.file}:${spec.line ?? 0}`;
      const name = [...titles, spec.title].join(' › ');
      if (test.status === 'skipped') skipped++;
      else if (test.status === 'expected') passed++;
      else if (test.status === 'flaky') {
        const attempt = results.findIndex((r) => r.status === 'passed') + 1;
        flaky.push({ location, name, project: test.projectName, attempt });
      } else {
        const last = [...results].reverse().find((r) => r.status !== 'passed' && r.status !== 'skipped') ?? results.at(-1);
        const message = errorText(last);
        failed.push({ location, name, project: test.projectName, attempts: results.length, message, kind: classify(last, message), files: attachmentsOf(last) });
      }
    }
  }
  return { failed, flaky, passed, skipped };
}

function formatDuration(ms) {
  if (!Number.isFinite(ms)) return 'unknown duration';
  const total = Math.round(ms / 1000);
  return `${Math.floor(total / 60)}m${String(total % 60).padStart(2, '0')}s`;
}

function printFailures(failed, opts) {
  console.log(`FAILED (${failed.length})`);
  failed.slice(0, opts.max).forEach((f, i) => {
    const attempts = f.attempts > 1 ? `, ${f.attempts} attempts` : '';
    console.log(` ${i + 1}. [${f.kind}] ${f.location} › ${f.name}  (${f.project}${attempts})`);
    f.message
      .split(/\r?\n/)
      .filter((l) => l.trim() !== '')
      .slice(0, opts.lines)
      .forEach((l) => console.log(`      ${l.trim()}`));
    if (f.files.length) console.log(`      files: ${f.files.join(', ')}`);
  });
  if (failed.length > opts.max) console.log(` … ${failed.length - opts.max} more failed test(s): raise --max or open the HTML report`);
}

function summarize(report, opts, file) {
  const { failed, flaky, passed, skipped } = collect(report);
  const globalErrors = (report.errors ?? []).map((e) => stripAnsi(e.message ?? e.value ?? '').split(/\r?\n/)[0]);
  const root = report.config?.rootDir ? `, rootDir ${report.config.rootDir}` : '';
  const started = report.stats?.startTime ? `, started ${report.stats.startTime}` : '';
  console.log(`Playwright report ${file}${root}${started}, ${formatDuration(report.stats?.duration)}`);
  console.log(`  ${passed} passed · ${failed.length} failed · ${flaky.length} flaky · ${skipped} skipped`);
  if (failed.length) printFailures(failed, opts);
  if (flaky.length) {
    console.log(`FLAKY (${flaky.length}) — passed on retry; treat as a defect in the test or the app, not as green`);
    flaky.slice(0, opts.max).forEach((f) => console.log(` - ${f.location} › ${f.name}  (${f.project}, passed on attempt ${f.attempt})`));
  }
  if (globalErrors.length) {
    console.log(`GLOBAL ERRORS (${globalErrors.length}) — the run itself failed, results are incomplete`);
    globalErrors.forEach((e) => console.log(` - ${e}`));
  }
  const kinds = new Map();
  failed.forEach((f) => kinds.set(f.kind, (kinds.get(f.kind) ?? 0) + 1));
  if (kinds.size) {
    console.log(`Kinds: ${[...kinds].map(([k, n]) => `${k} ${n}`).join(', ')}`);
    [...kinds.keys()].forEach((k) => console.log(`  ${k}: ${HINTS[k]}`));
  }
  return failed.length || globalErrors.length ? 1 : 0;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    console.log(USAGE);
    return 0;
  }
  const { report, error } = readReport(opts.report);
  if (error) {
    console.error(`summarize-playwright: ${error}`);
    return 2;
  }
  return summarize(report, opts, path.relative(process.cwd(), opts.report) || opts.report);
}

try {
  process.exitCode = main();
} catch (error) {
  const message = error instanceof UsageError ? `${error.message}\n\n${USAGE}` : `unexpected failure: ${error.stack ?? error}`;
  console.error(`summarize-playwright: ${message}`);
  process.exitCode = 2;
}
