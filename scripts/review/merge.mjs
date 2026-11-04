// Turns the findings of all finder passes into the list that goes to
// verification: drops findings without a failing scenario, merges duplicates,
// drops findings posted in an earlier round, ranks the rest and caps them.
// Pure: data in, data out.

import { createHash } from 'node:crypto';
import { MAX_VERIFIED_FINDINGS, MERGE_LINE_DISTANCE } from './config.mjs';
import { SEVERITIES } from './schemas.mjs';

/**
 * A finding from a finder pass, with the lens that reported it.
 * @typedef {object} LensFinding
 * @property {string} lens
 * @property {string} file
 * @property {number} line
 * @property {string[]} otherLocations
 * @property {'blocker' | 'major' | 'nit'} severity
 * @property {string} id
 * @property {string} claim
 * @property {string} scenario
 * @property {string[]} references
 */

/**
 * One finding after merging.
 * @typedef {object} MergedFinding
 * @property {string} file
 * @property {number} line the first line of the merged findings
 * @property {string[]} locations `file:line` of every place, primary first
 * @property {'blocker' | 'major' | 'nit'} severity the highest of the merged findings
 * @property {string} id
 * @property {string} claim taken from the most severe merged finding
 * @property {string} scenario taken from the most severe merged finding
 * @property {string[]} references
 * @property {string[]} lenses the lenses that reported it
 * @property {string} fingerprint
 */

/** Findings without a rule are merged only with themselves. */
const NO_RULE = 'none';

/** @param {string} severity lower is more severe */
const severityRank = (severity) => SEVERITIES.indexOf(severity);

/** @param {string[]} items */
const unique = (items) => [...new Set(items)];

/** @param {LensFinding} finding */
const hasScenario = (finding) => finding.scenario.trim() !== '';

/**
 * Key of the findings that may be merged. A finding without a rule gets a key
 * of its own, because two of them near each other can be about different
 * things.
 * @param {LensFinding} finding
 * @param {number} index
 */
function groupKey(finding, index) {
  if (finding.id === NO_RULE) {
    return `${finding.file}\n${NO_RULE}\n${index}`;
  }
  return `${finding.file}\n${finding.id}`;
}

/**
 * Splits findings of the same file and rule into clusters. A finding joins the
 * current cluster when it is at most MERGE_LINE_DISTANCE lines below the last
 * finding of that cluster.
 * @param {LensFinding[]} findings
 * @param {number} distance
 * @returns {LensFinding[][]}
 */
function clusterByLine(findings, distance) {
  const sorted = [...findings].sort((a, b) => a.line - b.line);
  const clusters = [];
  for (const finding of sorted) {
    const current = clusters.at(-1);
    if (current && finding.line - current.at(-1).line <= distance) {
      current.push(finding);
    } else {
      clusters.push([finding]);
    }
  }
  return clusters;
}

/**
 * Normalizes a claim for the fingerprint: lower case, no digits, no
 * punctuation, single spaces. Digits go, so a claim that names a line number
 * gives the same fingerprint after the code moves.
 * @param {string} claim
 */
export function normalizeClaim(claim) {
  return claim
    .toLowerCase()
    .replace(/[^a-z]+/g, ' ')
    .trim();
}

/**
 * Stable ID of a finding across rounds: a hash of the file, the rule ID and
 * the normalized claim, without line numbers.
 * @param {{ file: string, id: string, claim: string }} finding
 */
export function fingerprint({ file, id, claim }) {
  return createHash('sha256')
    .update([file, id, normalizeClaim(claim)].join('\n'))
    .digest('hex')
    .slice(0, 16);
}

/**
 * Makes one finding from a cluster. Severity, claim and scenario come from the
 * most severe finding; locations, references and lenses from all of them.
 * @param {LensFinding[]} cluster findings of one file and rule, sorted by line
 * @returns {MergedFinding}
 */
function mergeCluster(cluster) {
  const [lead] = [...cluster].sort(
    (a, b) => severityRank(a.severity) - severityRank(b.severity),
  );
  const first = cluster[0];
  const merged = {
    file: first.file,
    line: first.line,
    locations: unique(
      cluster.flatMap((finding) => [
        `${finding.file}:${finding.line}`,
        ...finding.otherLocations,
      ]),
    ),
    severity: lead.severity,
    id: lead.id,
    claim: lead.claim,
    scenario: lead.scenario,
    references: unique(cluster.flatMap((finding) => finding.references)),
    lenses: unique(cluster.map((finding) => finding.lens)),
  };
  return { ...merged, fingerprint: fingerprint(merged) };
}

/**
 * Merges findings of the same file and rule that are at most `distance` lines
 * apart. The result is in the order of file, then line.
 * @param {LensFinding[]} findings
 * @param {number} [distance]
 * @returns {MergedFinding[]}
 */
export function mergeFindings(findings, distance = MERGE_LINE_DISTANCE) {
  const groups = Map.groupBy(findings, groupKey);
  return [...groups.values()]
    .flatMap((group) => clusterByLine(group, distance).map(mergeCluster))
    .sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
}

/**
 * Rank for verification, lower first: blockers, then findings from more than
 * one lens, then majors, then nits.
 * @param {MergedFinding} finding
 */
export function verificationRank(finding) {
  if (finding.severity === 'blocker') {
    return 0;
  }
  if (finding.lenses.length > 1) {
    return 1;
  }
  return 1 + severityRank(finding.severity);
}

/**
 * The findings of one round, ready for verification.
 * @param {LensFinding[]} findings every finding of every finder pass
 * @param {{ posted?: string[], limit?: number }} [options]
 *   `posted`: fingerprints from the marker of earlier rounds;
 *   `limit`: at most this many go to verification
 */
export function prepareFindings(
  findings,
  { posted = [], limit = MAX_VERIFIED_FINDINGS } = {},
) {
  const withScenario = findings.filter(hasScenario);
  const merged = mergeFindings(withScenario);
  const postedSet = new Set(posted);
  const fresh = merged.filter((finding) => !postedSet.has(finding.fingerprint));
  const ranked = fresh.toSorted(
    (a, b) => verificationRank(a) - verificationRank(b),
  );
  return {
    toVerify: ranked.slice(0, limit),
    overflow: ranked.slice(limit),
    noScenario: findings.length - withScenario.length,
    alreadyPosted: merged.length - fresh.length,
  };
}