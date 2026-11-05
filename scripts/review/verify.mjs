// Verifies the merged findings: one verifier run per finding, a few at a
// time. The verifier sees the finding and the code, not the finder's prompt or
// reasoning, and confirms or drops the finding. Only confirmed findings are
// posted.

import pMap from 'p-map';
import { CONCURRENCY, RUN_LIMITS } from './config.mjs';
import { isLineInDiff } from './diff.mjs';
import { contextText } from './passes.mjs';
import { buildArgs, runModel } from './runner.mjs';
import { VERDICT_SCHEMA } from './schemas.mjs';

/** @typedef {import('./merge.mjs').MergedFinding} MergedFinding */
/** @typedef {import('./diff.mjs').DiffFile} DiffFile */
/** @typedef {import('./passes.mjs').ReviewContext} ReviewContext */
/** @typedef {import('./passes.mjs').RunSettings} RunSettings */

/**
 * Splits `file:line` at its last colon.
 * @param {string} location
 */
export function parseLocation(location) {
  const colon = location.lastIndexOf(':');
  return {
    file: location.slice(0, colon),
    line: Number(location.slice(colon + 1)),
  };
}

/**
 * A location with a note whether the diff changes that line.
 * @param {string} location `file:line`
 * @param {DiffFile[]} files
 */
function locationLine(location, files) {
  const { file, line } = parseLocation(location);
  const where = isLineInDiff(files, file, line)
    ? 'in the diff'
    : 'not in the diff';
  return `- \`${location}\` (${where})`;
}

/**
 * The finding as the verifier reads it. Its text comes from a finder run, so
 * it stays data: the verifier is told so in its role prompt.
 * @param {MergedFinding} finding
 * @param {DiffFile[]} files
 */
function findingText(finding, files) {
  const lines = [
    '## Finding',
    '',
    'Locations:',
    '',
    ...finding.locations.map((location) => locationLine(location, files)),
    '',
    `Rule or invariant: ${finding.id}`,
    `Severity: ${finding.severity}`,
    `Claim: ${finding.claim}`,
    `Failing scenario: ${finding.scenario}`,
  ];
  if (finding.references.length > 0) {
    const names = finding.references.map((ref) => `\`${ref}\``).join(', ');
    lines.push(`Existing code it names: ${names}`);
  }
  return lines.join('\n');
}

/**
 * The input of one verifier run.
 * @param {MergedFinding} finding
 * @param {ReviewContext} context
 */
export function verifierInput(finding, context) {
  return [
    'Check this finding. Confirm it only when the code shows the failing scenario.',
    '',
    findingText(finding, context.files),
    '',
    contextText(context),
  ].join('\n');
}

/**
 * The finding as the verifier left it: line, severity, ID and scenario come
 * from the verdict. The fingerprint stays the one from merging, so the next
 * round recognizes the finding when a finder reports it again.
 * @param {MergedFinding} finding
 * @param {{ line: number, severity: string, id: string, scenario: string, reason: string }} verdict
 * @returns {MergedFinding & { reason: string }}
 */
export function applyVerdict(finding, verdict) {
  const primary = `${finding.file}:${finding.line}`;
  const corrected = `${finding.file}:${verdict.line}`;
  const locations = finding.locations.map((location) =>
    location === primary ? corrected : location,
  );
  return {
    ...finding,
    line: verdict.line,
    locations: [...new Set(locations)],
    severity: verdict.severity,
    id: verdict.id,
    scenario: verdict.scenario,
    reason: verdict.reason,
  };
}

/**
 * What came of one verifier run. A run without a valid verdict counts as
 * failed, so its finding is not posted.
 * @param {import('./runner.mjs').RunResult} result
 * @returns {'confirmed' | 'dropped' | 'failed'}
 */
function outcome(result) {
  const verdict = result.ok ? result.output?.verdict : undefined;
  if (verdict === 'confirmed' || verdict === 'dropped') {
    return verdict;
  }
  return 'failed';
}

/**
 * A verifier run together with the finding it checked.
 * @typedef {import('./runner.mjs').RunResult & { finding: MergedFinding }} VerifierRun
 */

/** @param {VerifierRun} result */
const confirmedFinding = (result) =>
  applyVerdict(result.finding, result.output);

/** @param {VerifierRun} result */
const droppedFinding = (result) => ({
  finding: result.finding,
  reason: result.output.reason,
});

/** @param {VerifierRun} result */
const failedPass = (result) =>
  `verifier ${result.finding.file}:${result.finding.line}`;

/**
 * Sorts verifier runs into confirmed findings, dropped findings with the
 * verifier's reason, and the names of runs that gave no verdict.
 * @param {VerifierRun[]} runs
 */
export function sortByOutcome(runs) {
  const groups = Map.groupBy(runs, outcome);
  return {
    confirmed: (groups.get('confirmed') ?? []).map(confirmedFinding),
    dropped: (groups.get('dropped') ?? []).map(droppedFinding),
    failed: (groups.get('failed') ?? []).map(failedPass),
  };
}

/**
 * The arguments of every verifier run of a round.
 * @param {string} prompt the verifier role prompt
 * @param {RunSettings} settings
 */
function verifierArgs(prompt, { model, authMode }) {
  return buildArgs({
    authMode,
    schema: VERDICT_SCHEMA,
    model,
    limits: RUN_LIMITS.verifier,
    systemPrompt: prompt,
  });
}

/**
 * Runs the verifier on one finding.
 * @param {MergedFinding} finding
 * @param {{ prompt: string, context: ReviewContext, settings: RunSettings }} options
 * @returns {Promise<VerifierRun>}
 */
async function verifyOne(finding, { prompt, context, settings }) {
  const { cwd, run = runModel } = settings;
  const args = verifierArgs(prompt, settings);
  const input = verifierInput(finding, context);
  const result = await run({ args, input, cwd });
  return { finding, ...result };
}

/**
 * Verifies each finding in its own run, at most CONCURRENCY at a time. A run
 * that fails leaves its finding unposted and is named in `failed`.
 * @param {object} options
 * @param {MergedFinding[]} options.findings
 * @param {string} options.prompt the verifier role prompt
 * @param {ReviewContext} options.context
 * @param {RunSettings} options.settings
 * @param {number} [options.concurrency]
 */
export async function runVerification({
  findings,
  prompt,
  context,
  settings,
  concurrency = CONCURRENCY,
}) {
  const runs = await pMap(
    findings,
    (finding) => verifyOne(finding, { prompt, context, settings }),
    { concurrency },
  );
  const { confirmed, dropped, failed } = sortByOutcome(runs);
  return { confirmed, dropped, failed, runs };
}