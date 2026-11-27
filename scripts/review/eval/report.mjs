#!/usr/bin/env node
// Scores the eval results against the expected findings and prints one
// table row per configuration. The judgement of each confirmed finding
// lives in matches.json, written by a person or an agent who read the
// finding and the code; this script only counts.
//
// Usage:
//   node scripts/review/eval/report.mjs [--draft] [--size small|large]
//     [--set <file>] [--results <dir>] [--matches <file>]
//
// --draft adds every confirmed finding that matches.json does not judge yet,
// with verdict `todo` and, when one is close, a suggested expected finding.
// The report counts `todo` as unjudged. --size scores only the entries of
// that size; an entry without `size` is small.

import { existsSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { CONFIGS, resultPath } from './run-eval.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));

/** Lines between a finding and an expected finding of the same file that still suggest a match. */
export const SUGGEST_DISTANCE = 6;

/**
 * The judgement of one confirmed finding.
 * - `match`: it is the expected finding named in `expected`.
 * - `valid`: a real defect the maintainer did not raise.
 * - `false-positive`: wrong, or not worth a comment.
 * - `todo`: not judged yet.
 * @typedef {{ fingerprint: string, location: string, expected: string | null, verdict: 'match' | 'valid' | 'false-positive' | 'todo', note?: string }} Judgement
 */

/**
 * What matches.json holds for one pull request under one configuration.
 * `finderHits` lists the expected findings that some finder finding raised,
 * before verification, so a verifier that drops a true finding shows.
 * @typedef {{ finderHits: string[], confirmed: Judgement[] }} RunMatches
 */

const EMPTY_RUN = { finderHits: [], confirmed: [] };

/**
 * The score of one pull request under one configuration.
 * @param {any} result the result file of run-eval.mjs
 * @param {{ expected: { id: string }[] }} entry
 * @param {RunMatches} [matches]
 */
export function scoreEntry(result, entry, matches = EMPTY_RUN) {
  const expectedIds = new Set(entry.expected.map((item) => item.id));
  const byFingerprint = new Map(
    matches.confirmed.map((item) => [item.fingerprint, item]),
  );
  const judged = result.confirmed.map(
    (finding) => byFingerprint.get(finding.fingerprint)?.verdict ?? 'todo',
  );
  const hits = new Set(
    matches.confirmed
      .filter(
        (item) => item.verdict === 'match' && expectedIds.has(item.expected),
      )
      .filter((item) =>
        result.confirmed.some((f) => f.fingerprint === item.fingerprint),
      )
      .map((item) => item.expected),
  );
  const finderHits = new Set(
    matches.finderHits.filter((id) => expectedIds.has(id)),
  );
  const count = (verdict) => judged.filter((item) => item === verdict).length;
  return {
    expected: expectedIds.size,
    hits: hits.size,
    finderHits: Math.max(finderHits.size, hits.size),
    confirmed: result.confirmed.length,
    matched: count('match'),
    valid: count('valid'),
    falsePositives: count('false-positive'),
    unjudged: count('todo'),
    costUsd: result.cost.totalUsd,
    timeMs: result.time.totalMs,
    failedRuns: result.failedRuns,
    error: Boolean(result.error),
  };
}

/** @param {number[]} values */
const sum = (values) => values.reduce((total, value) => total + value, 0);

/** @param {number} part @param {number} whole */
const ratio = (part, whole) => (whole === 0 ? undefined : part / whole);

/**
 * The row of one configuration: the scores of its pull requests added up.
 * @param {string} config
 * @param {ReturnType<typeof scoreEntry>[]} scores
 */
export function configRow(config, scores) {
  const total = (key) => sum(scores.map((score) => score[key]));
  const confirmed = total('confirmed');
  return {
    config,
    prs: scores.length,
    expected: total('expected'),
    hits: total('hits'),
    finderHits: total('finderHits'),
    recall: ratio(total('hits'), total('expected')),
    finderRecall: ratio(total('finderHits'), total('expected')),
    confirmed,
    valid: total('valid'),
    falsePositives: total('falsePositives'),
    unjudged: total('unjudged'),
    precision: ratio(
      total('matched') + total('valid'),
      confirmed - total('unjudged'),
    ),
    costPerPrUsd: ratio(total('costUsd'), scores.length),
    timePerPrMs: ratio(total('timeMs'), scores.length),
    failedRuns: total('failedRuns'),
    errors: total('error'),
  };
}

/** @param {number | undefined} value */
const percent = (value) =>
  value === undefined ? 'n/a' : `${Math.round(value * 100)}%`;

/**
 * The rows as a Markdown table.
 * @param {ReturnType<typeof configRow>[]} rows
 */
export function renderTable(rows) {
  const header = [
    'Configuration',
    'PRs',
    'Recall',
    'Finder recall',
    'Confirmed',
    'Valid extra',
    'False positives',
    'Unjudged',
    'Precision',
    'Cost / PR',
    'Time / PR',
    'Failed runs',
  ];
  const lines = rows.map((row) =>
    [
      `\`${row.config}\``,
      row.prs,
      `${percent(row.recall)} (${row.hits}/${row.expected})`,
      `${percent(row.finderRecall)} (${row.finderHits}/${row.expected})`,
      row.confirmed,
      row.valid,
      row.falsePositives,
      row.unjudged,
      percent(row.precision),
      row.costPerPrUsd === undefined
        ? 'n/a'
        : `$${row.costPerPrUsd.toFixed(2)}`,
      row.timePerPrMs === undefined
        ? 'n/a'
        : `${Math.round(row.timePerPrMs / 1000)} s`,
      row.errors
        ? `${row.failedRuns} (${row.errors} round errors)`
        : row.failedRuns,
    ].join(' | '),
  );
  return [
    `| ${header.join(' | ')} |`,
    `|${header.map(() => ' --- ').join('|')}|`,
    ...lines.map((line) => `| ${line} |`),
  ].join('\n');
}

/**
 * The expected finding a confirmed finding is closest to, in the same file
 * and within SUGGEST_DISTANCE lines, or null.
 * @param {{ location: string }} finding
 * @param {{ id: string, file: string, line: number }[]} expected
 */
export function suggestExpected(finding, expected) {
  const cut = finding.location.lastIndexOf(':');
  const file = finding.location.slice(0, cut);
  const line = Number(finding.location.slice(cut + 1));
  const near = expected
    .filter((item) => item.file === file)
    .map((item) => ({ id: item.id, distance: Math.abs(item.line - line) }))
    .filter((item) => item.distance <= SUGGEST_DISTANCE)
    .toSorted((a, b) => a.distance - b.distance);
  return near[0]?.id ?? null;
}

/**
 * matches.json with a `todo` judgement for every confirmed finding it does
 * not judge yet. Existing judgements stay as they are.
 * @param {any} matches
 * @param {{ config: string, entry: any, result: any }[]} runs
 */
export function draftMatches(matches, runs) {
  const next = structuredClone(matches);
  next.runs ??= {};
  for (const { config, entry, result } of runs) {
    next.runs[config] ??= {};
    const run = (next.runs[config][entry.pr] ??= {
      finderHits: [],
      confirmed: [],
    });
    const known = new Set(run.confirmed.map((item) => item.fingerprint));
    for (const finding of result.confirmed) {
      if (known.has(finding.fingerprint)) {
        continue;
      }
      run.confirmed.push({
        fingerprint: finding.fingerprint,
        location: finding.location,
        expected: suggestExpected(finding, entry.expected),
        verdict: 'todo',
        note: finding.claim,
      });
    }
  }
  return next;
}

/**
 * Every result file that exists, in the order of CONFIGS and the eval set.
 * @param {string} resultsDir
 * @param {{ entries: any[] }} set
 */
export function loadRuns(resultsDir, set) {
  return CONFIGS.flatMap((config) =>
    set.entries
      .map((entry) => ({
        config: config.name,
        entry,
        path: resultPath(resultsDir, config.name, entry.pr),
      }))
      .filter((run) => existsSync(run.path))
      .map((run) => ({
        ...run,
        result: JSON.parse(readFileSync(run.path, 'utf8')),
      })),
  );
}

/**
 * The table rows of all configurations that have results.
 * @param {ReturnType<typeof loadRuns>} runs
 * @param {any} matches
 */
export function reportRows(runs, matches) {
  const configs = [...new Set(runs.map((run) => run.config))];
  return configs.map((config) =>
    configRow(
      config,
      runs
        .filter((run) => run.config === config)
        .map((run) =>
          scoreEntry(
            run.result,
            run.entry,
            matches.runs?.[config]?.[run.entry.pr],
          ),
        ),
    ),
  );
}

/**
 * The eval set with only the entries of the given size, or all of them.
 * @param {{ entries: { size?: string }[] }} set
 * @param {string} [size]
 */
export function entriesOfSize(set, size) {
  if (!size) {
    return set;
  }
  if (!['small', 'large'].includes(size)) {
    throw new Error('--size takes small or large');
  }
  return {
    ...set,
    entries: set.entries.filter((entry) => (entry.size ?? 'small') === size),
  };
}

const OPTIONS = {
  draft: { type: 'boolean', default: false },
  size: { type: 'string' },
  set: { type: 'string', default: join(HERE, 'eval-set.json') },
  results: { type: 'string', default: join(HERE, 'results') },
  matches: { type: 'string', default: join(HERE, 'matches.json') },
};

/** @param {string[]} args */
function main(args) {
  const { values } = parseArgs({ args, options: OPTIONS, strict: true });
  const set = entriesOfSize(
    JSON.parse(readFileSync(resolve(values.set), 'utf8')),
    values.size,
  );
  const matchesPath = resolve(values.matches);
  const matches = existsSync(matchesPath)
    ? JSON.parse(readFileSync(matchesPath, 'utf8'))
    : { runs: {} };
  const runs = loadRuns(resolve(values.results), set);
  if (values.draft) {
    const next = draftMatches(matches, runs);
    writeFileSync(matchesPath, `${JSON.stringify(next, null, 2)}\n`);
    console.log(`Drafted ${matchesPath}`);
    return;
  }
  console.log(renderTable(reportRows(runs, matches)));
}

if (realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2));
}
