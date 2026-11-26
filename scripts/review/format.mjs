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
 * Where the reviewed code is, so that a location can link to it: the
 * `owner/name` of the repository and the commit the round reviewed.
 * @typedef {{ repo: string, head: string }} CodeSource
 */

/**
 * The answer of the linked-issue run, with the issue number. Without
 * `fixesIssue` the run gave no answer.
 * @typedef {object} LinkedIssue
 * @property {number} number
 * @property {'yes' | 'partly' | 'no'} [fixesIssue]
 * @property {string} [reason]
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
 * @property {Finding[]} [inline] confirmed, meant for an inline comment
 * @property {string} [inlineFailure] why the inline review could not be posted
 * @property {CodeSource} [source] makes every location a link
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

/** `path:line`, as the location schema writes it. */
const LOCATION = /^(?<path>.+):(?<line>[1-9][0-9]*)$/;

/**
 * A rule of `review-rules.md`. Every other ID the schema takes names an
 * invariant, which `invariants.md` labels `D1`, `A1`, `B1` and so on.
 */
const RULE_ID = /^R[0-9]+$/;

/**
 * Characters `encodeURI` leaves as they are and that would end the path of
 * the link: `)` closes the Markdown destination, `#` starts the fragment
 * the line number needs, and `?` starts a query string. `(` goes with `)`,
 * so a reader of the link sees a balanced pair.
 */
const BREAKS_LINK = /[()#?]/g;

/** `%28` and so on, for a character that would end the link's path. */
const percent = (character) =>
  `%${character.codePointAt(0).toString(16).toUpperCase()}`;

/**
 * A location as inline code, and as a link to that line on GitHub when the
 * round knows where the reviewed code is. A reader opens the code from the
 * comment instead of searching for the line by hand. A location the schema
 * would not accept stays plain code.
 * @param {string} location
 * @param {CodeSource} [source]
 */
export function locationText(location, source) {
  const match = source && LOCATION.exec(location);
  if (!match?.groups) {
    return code(location);
  }
  const { path, line } = match.groups;
  // A path is written by a model run, so anything that would end the link
  // early is encoded: the link cannot break out of its destination, and it
  // keeps pointing at the line.
  const target = encodeURI(path).replaceAll(BREAKS_LINK, percent);
  return `[${code(location)}](https://github.com/${source.repo}/blob/${source.head}/${target}#L${line})`;
}

/**
 * The locations of one list, separated by commas.
 * @param {string[]} locations
 * @param {CodeSource} [source]
 */
const locationList = (locations, source) =>
  locations.map((location) => locationText(location, source)).join(', ');

/** A closed inline code span, such as `a < b`. */
const CODE_SPAN = /(`[^`]*`)/;

/**
 * Text outside code spans, made safe: `<` is escaped and `@` gets a
 * zero-width space after it.
 * @param {string} text
 */
const escapeText = (text) =>
  text.replaceAll('<', '&lt;').replaceAll('@', `@${ZERO_WIDTH_SPACE}`);

/** @param {string} part a code span or the text between two spans */
const safePart = (part) => (CODE_SPAN.test(part) ? part : escapeText(part));

/**
 * Model text as safe Markdown on one line. The text comes from runs that read
 * the pull request, so it is treated like user input:
 *
 * - Whitespace becomes one space, so the text cannot add headings, lists or
 *   a second line to a comment.
 * - Outside code spans, `<` is escaped, so the text cannot add HTML or a
 *   hidden `<!-- -->` comment, such as a fake review marker.
 * - Outside code spans, `@` gets a zero-width space after it, so the text
 *   cannot notify a person or a team. GitHub shows the name unchanged.
 *
 * Inside a code span GitHub shows the text as it is: no HTML, no mention.
 * Escaping there would show `&lt;` instead of `<`, so code spans stay as
 * they are. A backtick without its pair starts no span. A backslash before a
 * backtick goes first: on GitHub it would turn the backtick into text, and
 * what this function takes for a code span would then be raw HTML.
 *
 * Other Markdown, such as `**bold**` or a link, stays as it is: it can only
 * change how the comment looks, and the hub posts nothing else from it.
 * @param {string} text
 */
export function plain(text) {
  const oneLine = text.replace(/\s+/g, ' ').trim().replaceAll('\\`', '`');
  return oneLine.split(CODE_SPAN).map(safePart).join('');
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
 * The severity and, when one covers the finding, the rule or invariant:
 * `**major** · Rule R5`. A `none` ID is left out, since it tells the reader
 * nothing.
 * @param {Finding} finding
 */
export function findingLabel(finding) {
  const parts = [`**${finding.severity}**`];
  if (finding.id !== 'none') {
    const kind = RULE_ID.test(finding.id) ? 'Rule' : 'Invariant';
    parts.push(`${kind} ${finding.id}`);
  }
  return parts.join(' · ');
}

/**
 * One inline review comment, in the fields the GitHub API takes. GitHub
 * anchors it on the line itself, so only the other locations are written.
 * @param {Finding} finding
 * @param {CodeSource} [source]
 */
export function inlineComment(finding, source) {
  const primary = `${finding.file}:${finding.line}`;
  const others = finding.locations.filter((location) => location !== primary);
  const lines = [
    `${findingLabel(finding)} · ${plain(finding.claim)}`,
    '',
    `Failing scenario: ${plain(finding.scenario)}`,
  ];
  if (others.length > 0) {
    lines.push('', `Also at: ${locationList(others, source)}`);
  }
  if (finding.references.length > 0) {
    lines.push(
      '',
      `Existing code: ${locationList(finding.references, source)}`,
    );
  }
  return { path: finding.file, line: finding.line, body: lines.join('\n') };
}

/**
 * One finding of the brief, numbered so that a reply can name it: the claim
 * on the first line, the failing scenario under it. The brief is one
 * comment, so the number is all a reply has to point at. The scenario is
 * indented to the item's text, so Markdown keeps it in the list item.
 * @param {Finding} finding
 * @param {number} number its place among the findings the brief states
 * @param {CodeSource} [source]
 */
export function briefLine(finding, number, source) {
  const marker = `${number}. `;
  const location = locationText(`${finding.file}:${finding.line}`, source);
  return [
    `${marker}${location} · ${findingLabel(finding)} · ${plain(finding.claim)}`,
    '',
    `${' '.repeat(marker.length)}Failing scenario: ${plain(finding.scenario)}`,
  ].join('\n');
}

/**
 * The findings of one section of the brief, numbered on from `first`, with a
 * blank line between two of them.
 * @param {Finding[]} findings
 * @param {number} first the number of the first one
 * @param {CodeSource} [source]
 */
const briefLines = (findings, first, source) =>
  findings.flatMap((finding, index) => [
    ...(index > 0 ? [''] : []),
    briefLine(finding, first + index, source),
  ]);

/** @param {LinkedIssue | undefined} issue */
function linkedIssueLine(issue) {
  if (!issue) {
    return '**Linked issue:** no linked issue.';
  }
  if (!issue.fixesIssue) {
    return `**Linked issue:** #${issue.number}: the check gave no answer.`;
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
 * A section of the brief with its items, or nothing when empty.
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
 * The findings of a refused inline review, which the brief states in their
 * place.
 * @param {BriefInput} input
 */
const refusedInline = (input) =>
  input.inlineFailure === undefined ? [] : (input.inline ?? []);

/**
 * The findings of a review that GitHub would not take, with the reason.
 * GitHub rejects a whole review when one comment sits on a line outside the
 * pull request diff, so without this section a round would state a count of
 * findings that nothing on the pull request shows.
 * @param {BriefInput} input
 */
function inlineFailureSection(input) {
  if (input.inlineFailure === undefined) {
    return [];
  }
  return section('Findings without an inline comment', [
    `GitHub did not take these findings as comments: ${plain(input.inlineFailure)}`,
    '',
    ...briefLines(refusedInline(input), 1, input.source),
  ]);
}

/**
 * The feedback ask. A wrong finding is what improves the reviewer, so the ask
 * names it first. A reaction can only be counted; the reason in a reply is
 * what changes a rule, so the ask gives the `Dismissed` prefix that a later
 * script can find. An inline comment has its own thread to react and reply
 * in; a finding of the brief has only its number, so its reply names it. The
 * feedback loop in `review-workflow.md` owns the rule.
 * @param {number} inlineCount findings posted as inline comments
 * @param {number} briefCount findings the brief numbers
 */
export function feedbackAsk(inlineCount, briefCount) {
  if (inlineCount + briefCount === 0) {
    return [];
  }
  const asks = [];
  if (inlineCount > 0) {
    asks.push(
      '👎 an inline comment that is wrong. Better still, reply in its thread with `Dismissed: <why>` — one sentence.',
    );
  }
  if (briefCount > 0) {
    asks.push(
      'For a finding numbered here, comment on the pull request with `Dismissed <n>: <why>`, where `<n>` is its number.',
    );
  }
  return [
    '',
    `**Feedback:** ${asks.join(' ')} A reaction can only be counted, a reason can change a rule or add an accepted pattern. 👍 marks a good catch.`,
  ];
}

/**
 * The review brief: one top-level comment, with the marker on its first line.
 * The findings it states are numbered across its sections.
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
  // Numbered in the order the sections state them.
  const firstOverflow = refusedInline(input).length + 1;
  const firstOutside = firstOverflow + input.overflow.length;
  const briefCount = firstOutside + input.outsideDiff.length - 1;
  return [
    ...lines,
    ...inlineFailureSection(input),
    ...section(
      'Over the comment cap',
      briefLines(input.overflow, firstOverflow, input.source),
    ),
    ...section(
      'Outside the diff',
      briefLines(input.outsideDiff, firstOutside, input.source),
    ),
    ...section(
      'Passes without a result',
      input.failedPasses.map((pass) => `- ${code(pass)}`),
    ),
    ...feedbackAsk(input.findings.length - briefCount, briefCount),
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
