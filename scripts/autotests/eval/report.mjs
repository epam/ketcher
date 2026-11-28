#!/usr/bin/env node
// Scores the results of run-eval.mjs: per configuration, how many specs
// compile, pass lint, have one test per checklist item and pass against the
// app, with cost and time per issue. The hand judgements in judgements.json
// add what a script cannot tell: whether each test checks what its checklist
// item asks for, and how many testing.md conventions the spec breaks.
//
// Usage:
//   node scripts/autotests/eval/report.mjs [--results <dir>]
//     [--judgements <file>] [--set <file>]

import { existsSync, readFileSync, readdirSync, realpathSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const HERE = fileURLToPath(new URL('.', import.meta.url));

/** The verdicts a checklist item can get in judgements.json. */
export const CASE_VERDICTS = [
  'covered',
  'partial',
  'failing',
  'skipped',
  'missing',
  'wrong',
];

/** @param {string} path */
const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));

/**
 * Every result file under the results folder, by configuration.
 * @param {string} dir
 * @returns {Map<string, any[]>}
 */
export function loadResults(dir) {
  const byConfig = new Map();
  if (!existsSync(dir)) {
    return byConfig;
  }
  for (const config of readdirSync(dir, { withFileTypes: true })) {
    if (!config.isDirectory()) {
      continue;
    }
    const files = readdirSync(join(dir, config.name)).filter((f) =>
      /^\d+\.json$/.test(f),
    );
    byConfig.set(
      config.name,
      files.map((file) => readJson(join(dir, config.name, file))),
    );
  }
  return byConfig;
}

/**
 * Checks the judgements of one configuration against the eval set: one
 * verdict per checklist item, each a known verdict.
 * @param {Record<string, any>} judged by issue number
 * @param {{ issue: number, checklist: number }[]} entries
 * @returns {string[]} the problems, empty when the file is sound
 */
export function judgementProblems(judged, entries) {
  const problems = [];
  for (const [issue, judgement] of Object.entries(judged ?? {})) {
    const entry = entries.find((e) => String(e.issue) === issue);
    if (!entry) {
      problems.push(`#${issue} is not in the eval set`);
      continue;
    }
    if (judgement.cases.length !== entry.checklist) {
      problems.push(
        `#${issue} has ${judgement.cases.length} verdicts for ${entry.checklist} checklist items`,
      );
    }
    const unknown = judgement.cases.filter((v) => !CASE_VERDICTS.includes(v));
    if (unknown.length > 0) {
      problems.push(`#${issue} has unknown verdicts: ${unknown.join(', ')}`);
    }
  }
  return problems;
}

/** @param {number[]} values */
const sum = (values) => values.reduce((total, value) => total + value, 0);

/** @param {number} part @param {number} whole */
const percent = (part, whole) =>
  whole === 0 ? '-' : `${Math.round((100 * part) / whole)}%`;

/**
 * The scores of one configuration.
 * @param {any[]} results
 * @param {Record<string, any>} [judged] hand judgements by issue number
 */
export function scoreConfig(results, judged = {}) {
  const generated = results.filter((r) => r.generation);
  const withSpecs = results.filter((r) => r.specs.length > 0);
  const tests = (r) => sum((r.analysis ?? []).map((a) => a.testCount));
  const pw = (key) => sum(withSpecs.map((r) => r.playwright?.[key] ?? 0));
  const ran = pw('passed') + pw('flaky') + pw('failed');
  const judgedResults = results.filter((r) => judged[r.issue]);
  const verdicts = judgedResults.flatMap((r) => judged[r.issue].cases);
  const count = (verdict) => verdicts.filter((v) => v === verdict).length;
  return {
    issues: results.length,
    generationErrors: generated.filter((r) => r.generation.error).length,
    noSpec: results.length - withSpecs.length,
    specNameMatches: results.filter((r) => r.specNameMatches).length,
    compiles: withSpecs.filter((r) => r.typeErrors?.length === 0).length,
    lintClean: withSpecs.filter((r) => r.lint?.errors === 0).length,
    casesMatch: withSpecs.filter((r) =>
      (r.analysis ?? []).some((a) => a.casesMatchChecklist),
    ).length,
    tests: sum(results.map(tests)),
    checklist: sum(results.map((r) => r.checklist)),
    passed: pw('passed'),
    flaky: pw('flaky'),
    failed: pw('failed'),
    skipped: pw('skipped'),
    passRate: percent(pw('passed'), ran),
    rawSelectors: sum(
      withSpecs.flatMap((r) => (r.analysis ?? []).map((a) => a.rawSelectors)),
    ),
    wrongVersionLines: sum(
      withSpecs.flatMap((r) =>
        (r.analysis ?? []).map((a) => a.wrongVersionLines),
      ),
    ),
    costPerIssueUsd:
      generated.length === 0
        ? 0
        : sum(generated.map((r) => r.generation.costUsd)) / generated.length,
    generationSPerIssue:
      generated.length === 0
        ? 0
        : sum(generated.map((r) => r.generation.durationMs)) /
          generated.length /
          1000,
    judged: judgedResults.length,
    covered: count('covered'),
    partial: count('partial'),
    failing: count('failing'),
    skippedJudged: count('skipped'),
    missing: count('missing'),
    wrong: count('wrong'),
    coverage: percent(count('covered'), verdicts.length),
    conventionBreaks: sum(
      judgedResults.map((r) => judged[r.issue].conventions ?? 0),
    ),
  };
}

/**
 * The report as markdown.
 * @param {Map<string, any[]>} byConfig
 * @param {Record<string, Record<string, any>>} judgements by config, then issue
 */
export function formatReport(byConfig, judgements) {
  const names = [...byConfig.keys()].sort((a, b) =>
    a === 'reference' ? -1 : b === 'reference' ? 1 : a.localeCompare(b),
  );
  const scores = names.map((name) => [
    name,
    scoreConfig(byConfig.get(name), judgements[name]),
  ]);
  const lines = [
    '## Mechanical checks',
    '',
    '| Config | Issues | No spec | Spec name | Compiles | Lint clean | Cases 1..N | Tests / items | Passed | Flaky | Failed | Skipped | Pass rate | Raw selectors | Wrong Version | $ / issue | s / issue |',
    '| --- | --: | --: | --: | --: | --: | --: | --: | --: | --: | --: | --: | --: | --: | --: | --: | --: |',
    ...scores.map(
      ([name, s]) =>
        `| ${name} | ${s.issues} | ${s.noSpec} | ${s.specNameMatches} | ${s.compiles} | ${s.lintClean} | ${s.casesMatch} | ${s.tests} / ${s.checklist} | ${s.passed} | ${s.flaky} | ${s.failed} | ${s.skipped} | ${s.passRate} | ${s.rawSelectors} | ${s.wrongVersionLines} | ${s.costPerIssueUsd.toFixed(2)} | ${Math.round(s.generationSPerIssue)} |`,
    ),
    '',
    'Pass rate counts the tests that ran (not skipped) and passed in every run. A test that fails in the reference row fails on this machine or app, not because of the model. Lint covers the page objects and helpers the model wrote or changed: the ESLint config ignores spec files.',
    '',
    '## Hand judgements',
    '',
    '| Config | Issues judged | Covered | Partial | Failing | Skipped | Missing | Wrong | Coverage | Convention breaks |',
    '| --- | --: | --: | --: | --: | --: | --: | --: | --: | --: |',
    ...scores
      .filter(([name]) => name !== 'reference')
      .map(
        ([name, s]) =>
          `| ${name} | ${s.judged} | ${s.covered} | ${s.partial} | ${s.failing} | ${s.skippedJudged} | ${s.missing} | ${s.wrong} | ${s.coverage} | ${s.conventionBreaks} |`,
      ),
    '',
    '## Per issue',
    '',
  ];
  for (const [name] of scores) {
    lines.push(`### ${name}`, '');
    lines.push(
      '| Issue | Tests / items | Type errors | Lint errors | Passed | Flaky | Failed | Skipped | $ | Error |',
    );
    lines.push('| --- | --: | --: | --: | --: | --: | --: | --: | --: | --- |');
    for (const r of [...byConfig.get(name)].sort((a, b) => a.issue - b.issue)) {
      const tests = sum((r.analysis ?? []).map((a) => a.testCount));
      const p = r.playwright;
      lines.push(
        `| #${r.issue} | ${tests} / ${r.checklist} | ${r.typeErrors?.length ?? '-'} | ${r.lint?.errors ?? '-'} | ${p?.passed ?? '-'} | ${p?.flaky ?? '-'} | ${p?.failed ?? '-'} | ${p?.skipped ?? '-'} | ${r.generation ? r.generation.costUsd.toFixed(2) : '-'} | ${r.generation?.error ?? r.toolErrors?.[0] ?? r.loadErrors?.[0] ?? ''} |`,
      );
    }
    lines.push('');
  }
  return lines.join('\n');
}

/** @param {string[]} args */
function main(args) {
  const { values } = parseArgs({
    args,
    strict: true,
    options: {
      results: { type: 'string', default: join(HERE, 'results') },
      judgements: { type: 'string', default: join(HERE, 'judgements.json') },
      set: { type: 'string', default: join(HERE, 'eval-set.json') },
    },
  });
  const set = readJson(resolve(values.set));
  const judgements = existsSync(values.judgements)
    ? readJson(resolve(values.judgements)).judgements
    : {};
  const problems = Object.values(judgements).flatMap((judged) =>
    judgementProblems(judged, set.entries),
  );
  if (problems.length > 0) {
    throw new Error(`judgements.json:\n${problems.join('\n')}`);
  }
  console.log(formatReport(loadResults(resolve(values.results)), judgements));
}

if (realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
