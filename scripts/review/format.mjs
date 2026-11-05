// Writes what the hub posts: the inline comments, the review brief and the
// round-limit comment. Every finding follows the output contract in
// .memory-bank/review-workflow.md. Pure: data in, Markdown out.

import { MAX_INLINE_COMMENTS, MAX_ROUNDS } from './config.mjs';
import { isLineInDiff } from './diff.mjs';
import { SEVERITIES } from './schemas.mjs';
import { writeMarker } from './state.mjs';

/** @typedef {import('./merge.mjs').MergedFinding} Finding */
/** @typedef {import('./diff.mjs').DiffFile} DiffFile */

/**
 * The answer of the linked-issue run, with the issue number.
 * @typedef {object} LinkedIssue
 * @property {number} number
 * @property {'yes' | 'partly' | 'no'} fixesIssue
 * @property {string} reason
 */

/**
 * Everything the brief states.
 * @typedef {object} BriefInput
 * @property {import('./state.mjs').ReviewState} state written as the marker
 * @property {{ from: string, kind: 'full' | 'incremental' }} range
 * @property {LinkedIssue | undefined} linkedIssue undefined: no linked issue
 * @property {string | undefined} prType undefined: no PR-type row matches
 * @property {string[]} panel lenses that ran
 * @property {string[]} models models that ran
 * @property {Finding[]} findings every confirmed finding
 * @property {Finding[]} overflow confirmed, did not fit the comment cap
 * @property {Finding[]} outsideDiff confirmed, on a line outside the diff
 * @property {string[]} failedPasses passes that gave no result
 * @property {number} skippedFiles files left out of the finder passes
 */

/** Put after `@`, so GitHub does not notify the named account. */
const ZERO_WIDTH_SPACE = String.fromCodePoint(0x200b);

const ANSWERS = {
  yes: 'the diff fixes it',
  partly: 'the diff fixes it in part',
  no: 'the diff does not fix it',
};

/** @param {string} severity lower is more severe */
const severityRank = (severity) => SEVERITIES.indexOf(severity);

/** @param {Finding} a @param {Finding} b */
const bySeverity = (a, b) =>
  severityRank(a.severity) - severityRank(b.severity);

/**
 * A location as inline code. Model runs write the locations, so a backtick
 * in one cannot end the code span.
 * @param {string} location
 */
const code = (location) => `\`${location.replaceAll('`', "'")}\``;

/**
 * Model text as safe Markdown on one line. The text comes from runs that read
 * the pull request, so it is treated like user input:
 *
 * - Whitespace becomes one space, so the text cannot add headings, lists or
 *   a second line to a comment.
 * - `<` is escaped, so the text cannot add HTML or a hidden `<!-- -->`
 *   comment, such as a fake review marker.
 * - `@` gets a zero-width space after it, so the text cannot notify a person
 *   or a team. GitHub shows the name unchanged.
 *
 * Other Markdown, such as `**bold**` or a link, stays as it is: it can only
 * change how the comment looks, and the hub posts nothing else from it.
 * @param {string} text
 */
export function plain(text) {
  return text
    .replace(/\s+/g, ' ')
    .trim()
    .replaceAll('<', '&lt;')
    .replaceAll('@', `@${ZERO_WIDTH_SPACE}`);
}

/**
 * Splits confirmed findings into inline comments and lines for the brief.
 * Only lines in the diff take a comment. Blockers go first; findings past the
 * cap go to `overflow`.
 * @param {Finding[]} findings confirmed findings
 * @param {DiffFile[]} files the reviewed diff
 * @param {number} [cap]
 */
export function splitForPosting(findings, files, cap = MAX_INLINE_COMMENTS) {
  const sorted = findings.toSorted(bySeverity);
  const inDiff = sorted.filter((finding) =>
    isLineInDiff(files, finding.file, finding.line),
  );
  return {
    inline: inDiff.slice(0, cap),
    overflow: inDiff.slice(cap),
    outsideDiff: sorted.filter(
      (finding) => !isLineInDiff(files, finding.file, finding.line),
    ),
  };
}

/**
 * One inline review comment, in the fields the GitHub API takes.
 * @param {Finding} finding
 */
export function inlineComment(finding) {
  const primary = `${finding.file}:${finding.line}`;
  const others = finding.locations.filter((location) => location !== primary);
  const lines = [
    `**${finding.severity}** · ${finding.id} · ${plain(finding.claim)}`,
    '',
    `Failing scenario: ${plain(finding.scenario)}`,
  ];
  if (others.length > 0) {
    lines.push('', `Also at: ${others.map(code).join(', ')}`);
  }
  if (finding.references.length > 0) {
    lines.push('', `Existing code: ${finding.references.map(code).join(', ')}`);
  }
  return { path: finding.file, line: finding.line, body: lines.join('\n') };
}

/**
 * One finding as a line of the brief.
 * @param {Finding} finding
 */
export function briefLine(finding) {
  const location = code(`${finding.file}:${finding.line}`);
  return `- ${location} · **${finding.severity}** · ${finding.id} · ${plain(finding.claim)}`;
}

/** @param {LinkedIssue | undefined} issue */
function linkedIssueLine(issue) {
  if (!issue) {
    return '**Linked issue:** no linked issue.';
  }
  const answer = ANSWERS[issue.fixesIssue];
  return `**Linked issue:** #${issue.number}: ${answer}. ${plain(issue.reason)}`;
}

/** @param {{ from: string, kind: 'full' | 'incremental' }} range */
function rangeLine(range) {
  if (range.kind === 'incremental') {
    return `**Reviewed:** the commits after ${code(range.from.slice(0, 7))}.`;
  }
  return '**Reviewed:** the whole pull request.';
}

/** @param {string[]} items @param {string} none */
const listOr = (items, none) => (items.length > 0 ? items.join(', ') : none);

/** @param {Finding[]} findings */
function countLine(findings) {
  const counts = SEVERITIES.map((severity) => {
    const count = findings.filter((f) => f.severity === severity).length;
    return `${count} ${severity}`;
  });
  return `**Findings:** ${counts.join(', ')}.`;
}

/**
 * A section of the brief with one line per item, or nothing when empty.
 * @param {string} title
 * @param {string[]} lines
 */
function section(title, lines) {
  if (lines.length === 0) {
    return [];
  }
  return ['', `### ${title}`, '', ...lines];
}

/**
 * The review brief: one top-level comment, with the marker on its first line.
 * @param {BriefInput} input
 * @param {number} [maxRounds]
 */
export function brief(input, maxRounds = MAX_ROUNDS) {
  const lines = [
    writeMarker(input.state),
    '',
    `## Claude review: round ${input.state.round} of ${maxRounds}`,
    '',
    linkedIssueLine(input.linkedIssue),
    `**PR type:** ${input.prType ?? 'no PR-type row matches'}.`,
    rangeLine(input.range),
    `**Panel:** ${listOr(input.panel, 'no lens applies')}.`,
    `**Models:** ${listOr(input.models, 'none ran')}.`,
    countLine(input.findings),
  ];
  if (input.skippedFiles > 0) {
    lines.push(
      `**Not reviewed:** ${input.skippedFiles} generated, lock or autotest files.`,
    );
  }
  return [
    ...lines,
    ...section('Over the comment cap', input.overflow.map(briefLine)),
    ...section('Outside the diff', input.outsideDiff.map(briefLine)),
    ...section(
      'Passes without a result',
      input.failedPasses.map((pass) => `- ${code(pass)}`),
    ),
  ].join('\n');
}

/**
 * The comment after the last round. It has no marker, so the next run still
 * reads the round number from the last brief.
 * @param {number} [maxRounds]
 */
export function limitComment(maxRounds = MAX_ROUNDS) {
  return [
    `## Claude review: round limit reached`,
    '',
    `This pull request has had ${maxRounds} review rounds. No model ran, and no new review will run on it.`,
  ].join('\n');
}