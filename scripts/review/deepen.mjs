// Deepening (design decision 12): the verifier can name one more lens for a
// confirmed finding. The hub decides whether that lens runs: once per lens in
// a round, only on the flagged files where that lens reported nothing. The
// extra findings are merged and verified like the others, and their verdicts
// start no further pass.

import { MAX_VERIFIED_FINDINGS } from './config.mjs';
import { filePath } from './diff.mjs';
import { prepareFindings } from './merge.mjs';
import { runFinderPasses } from './passes.mjs';
import { DEEPENING_LENSES } from './schemas.mjs';
import { runVerification } from './verify.mjs';

/** @typedef {import('./merge.mjs').LensFinding} LensFinding */
/** @typedef {import('./merge.mjs').MergedFinding} MergedFinding */
/** @typedef {import('./passes.mjs').ReviewContext} ReviewContext */
/** @typedef {import('./passes.mjs').RunSettings} RunSettings */

/**
 * One extra finder pass: a lens and the files it reviews.
 * @typedef {{ lens: string, files: string[] }} ExtraPass
 */

/** @param {string[]} items */
const unique = (items) => [...new Set(items)];

/**
 * The files of the confirmed findings whose verdict names the lens.
 * @param {(MergedFinding & { alsoCheck: string })[]} confirmed
 * @param {string} lens
 */
function flaggedFiles(confirmed, lens) {
  const flagged = confirmed.filter((finding) => finding.alsoCheck === lens);
  return unique(flagged.map((finding) => finding.file));
}

/**
 * The files the lens reported a finding on in this round.
 * @param {LensFinding[]} findings every finding of the round's finder passes
 * @param {string} lens
 */
function reportedFiles(findings, lens) {
  const reported = findings.filter((finding) => finding.lens === lens);
  return new Set(reported.map((finding) => finding.file));
}

/**
 * The extra passes of a round: at most one per deepening lens, on the flagged
 * files where that lens reported nothing.
 * @param {object} options
 * @param {(MergedFinding & { alsoCheck: string })[]} options.confirmed
 * @param {LensFinding[]} options.findings
 * @returns {ExtraPass[]}
 */
export function planDeepening({ confirmed, findings }) {
  return DEEPENING_LENSES.flatMap((lens) => {
    const reported = reportedFiles(findings, lens);
    const files = flaggedFiles(confirmed, lens).filter(
      (file) => !reported.has(file),
    );
    if (files.length === 0) {
      return [];
    }
    return [{ lens, files }];
  });
}

/**
 * The context of an extra pass: only the given files of the diff.
 * @param {ReviewContext} context
 * @param {string[]} paths
 * @returns {ReviewContext}
 */
export function narrowContext(context, paths) {
  const files = context.files.filter((file) => paths.includes(filePath(file)));
  const diffText = files.map((file) => file.patch).join('\n');
  return { ...context, files, diffText };
}

/**
 * Runs the extra passes of a round and verifies their findings.
 * @param {object} options
 * @param {(MergedFinding & { alsoCheck: string })[]} options.confirmed the confirmed findings of the round
 * @param {LensFinding[]} options.findings every finding of the round's finder passes
 * @param {string[]} options.known fingerprints posted before or found in this round
 * @param {number} options.verified findings already sent to verification in this round
 * @param {Record<string, string>} options.prompts role prompt per lens
 * @param {string} options.verifierPrompt
 * @param {ReviewContext} options.context
 * @param {RunSettings} options.finderSettings
 * @param {RunSettings} options.verifierSettings
 * @param {number} [options.limit] at most this many go to verification in a round
 */
export async function runDeepening({
  confirmed,
  findings,
  known,
  verified,
  prompts,
  verifierPrompt,
  context,
  finderSettings,
  verifierSettings,
  limit = MAX_VERIFIED_FINDINGS,
}) {
  const passes = planDeepening({ confirmed, findings });
  const room = limit - verified;
  if (passes.length === 0 || room <= 0) {
    return { passes: [], confirmed: [], dropped: [], failed: [], runs: [] };
  }
  const passResults = await Promise.all(
    passes.map((pass) =>
      runFinderPasses({
        lenses: [pass.lens],
        prompts,
        context: narrowContext(context, pass.files),
        settings: finderSettings,
      }),
    ),
  );
  const extra = passResults.flatMap((result) => result.findings);
  const { toVerify } = prepareFindings(extra, { posted: known, limit: room });
  const verification = await runVerification({
    findings: toVerify,
    prompt: verifierPrompt,
    context,
    settings: verifierSettings,
  });
  const failedPasses = passResults.flatMap((result) =>
    result.failed.map((lens) => `extra ${lens}`),
  );
  return {
    passes,
    confirmed: verification.confirmed,
    dropped: verification.dropped,
    failed: [...failedPasses, ...verification.failed],
    runs: [
      ...passResults.flatMap((result) => result.runs),
      ...verification.runs,
    ],
  };
}