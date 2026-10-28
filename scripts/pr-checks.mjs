// PR checks that Danger runs on every pull request (dangerfile.ts).
// The rules are pure: dangerfile.ts reads the PR from GitHub and passes it in.
// Each rule's owner doc: .memory-bank/review-workflow.md (the Danger rules,
// the PR-type contract, and the large-scale change protocol). The exact title
// form stays a convention in .memory-bank/coding-standards.md and is not
// enforced here.

export const LSC_LABEL = 'large-scale-change';
export const MAX_CHANGED_LINES = 400;

const UNCOUNTED_FILES = [/(^|\/)package-lock\.json$/, /(^|\/)__snapshots__\//];
const UNIT_TESTED_CODE = [
  /^packages\/ketcher-core\/src\/domain\//,
  /^packages\/ketcher-core\/src\/application\/editor\/operations\//,
];
const UNIT_TEST = /^packages\/.*(\.test\.[jt]sx?$|\/__tests__\/)/;
const E2E_TEST = /^ketcher-autotests\/tests\/.*\.spec\.ts$/;
const OPENSPEC_CHANGE = /^openspec\/changes\//;

const BACKMERGE = /^Backmerge:\s*/i;
const TITLE_ISSUES = /^#\d+(\s*,\s*#\d+)*/;

/**
 * @typedef {{ number: number, type: string | null }} LinkedIssue
 * @typedef {{ path: string, status: string, additions: number, deletions: number }} ChangedFile
 * @typedef {{
 *   title: string,
 *   body: string,
 *   branch: string,
 *   labels: string[],
 *   linkedIssues: LinkedIssue[],
 *   files: ChangedFile[],
 *   lscTemplate: string,
 * }} PullRequest
 * @typedef {{ level: 'fail' | 'warn', rule: string, message: string }} Finding
 */

/** @returns {Finding[]} */
export function checkPullRequest(pr) {
  return [
    ...checkBranch(pr),
    ...checkTitle(pr),
    ...checkLinkedIssue(pr),
    ...checkSize(pr),
    ...checkUnitTests(pr),
    ...checkBugFix(pr),
    ...checkFeature(pr),
    ...checkLargeScaleChange(pr),
  ];
}

function checkBranch({ branch }) {
  if (!branch.includes('#')) return [];
  return [
    fail(
      'branch',
      `Branch \`${branch}\` contains \`#\`. Name it \`<issue>-<kebab-case title>\`.`,
    ),
  ];
}

function checkTitle(pr) {
  const { linkedIssues } = pr;
  const title = pr.title.replace(BACKMERGE, '');
  const findings = [];
  const issuePrefix = title.match(TITLE_ISSUES);
  if (!issuePrefix && linkedIssues.length > 0) {
    findings.push(
      fail(
        'title',
        `Title must start with the linked issue: \`#${linkedIssues[0].number} - <title>\`.`,
      ),
    );
  }
  if (issuePrefix && linkedIssues.length > 0) {
    const linked = new Set(linkedIssues.map((issue) => issue.number));
    const unlinked = issuePrefix[0]
      .match(/\d+/g)
      .map(Number)
      .filter((number) => !linked.has(number));
    if (unlinked.length > 0) {
      findings.push(
        warn(
          'title',
          `Title names ${unlinked.map((n) => `#${n}`).join(', ')}, but the PR does not link it. Add \`Closes #${unlinked[0]}\` to the body.`,
        ),
      );
    }
  }
  return findings;
}

function checkLinkedIssue({ linkedIssues }) {
  if (linkedIssues.length > 0) return [];
  return [
    warn(
      'linked-issue',
      'No linked issue. Add `Closes #<issue>` to the body, or ignore this for a PR with no issue.',
    ),
  ];
}

function checkSize({ files, labels }) {
  if (labels.includes(LSC_LABEL)) return [];
  const changed = files
    .filter((file) => !UNCOUNTED_FILES.some((re) => re.test(file.path)))
    .reduce((sum, file) => sum + file.additions + file.deletions, 0);
  if (changed <= MAX_CHANGED_LINES) return [];
  return [
    warn(
      'size',
      `${changed} changed lines (lockfiles and snapshots not counted). Review quality drops above ${MAX_CHANGED_LINES}. Split the PR, or follow the large-scale change protocol in \`.memory-bank/review-workflow.md\`.`,
    ),
  ];
}

function checkUnitTests({ files }) {
  const code = files.filter(
    (file) =>
      file.status !== 'removed' &&
      UNIT_TESTED_CODE.some((re) => re.test(file.path)),
  );
  if (code.length === 0 || files.some((file) => UNIT_TEST.test(file.path))) {
    return [];
  }
  return [
    warn(
      'unit-test',
      `\`ketcher-core\` domain or operations code changed with no unit test change: ${code
        .map((file) => `\`${file.path}\``)
        .join(', ')}.`,
    ),
  ];
}

function checkBugFix({ linkedIssues, files }) {
  const bug = linkedIssues.find((issue) => issue.type === 'Bug');
  if (!bug) return [];
  if (
    files.some((file) => UNIT_TEST.test(file.path) || E2E_TEST.test(file.path))
  ) {
    return [];
  }
  return [
    warn(
      'bug-fix',
      `#${bug.number} is a Bug, and the PR changes no test. A bug fix carries a regression test (PR-type contract, \`.memory-bank/review-workflow.md\`).`,
    ),
  ];
}

function checkFeature({ title, linkedIssues, files }) {
  const feature = linkedIssues.find((issue) => issue.type === 'Feature');
  if (!feature || BACKMERGE.test(title)) return [];
  if (files.some((file) => OPENSPEC_CHANGE.test(file.path))) return [];
  return [
    fail(
      'feature',
      `#${feature.number} is a Feature, and the PR has no OpenSpec change in \`openspec/changes/\` (PR-type contract, \`.memory-bank/review-workflow.md\`).`,
    ),
  ];
}

function checkLargeScaleChange({ labels, body, lscTemplate }) {
  if (!labels.includes(LSC_LABEL)) return [];
  const template = sections(lscTemplate);
  const filled = sections(body);
  const findings = [];
  for (const [heading, templateText] of template) {
    const text = filled.get(heading);
    if (text === undefined) {
      findings.push(
        fail('large-scale-change', `Section \`${heading}\` is missing.`),
      );
    } else if (text === '' || text === templateText) {
      findings.push(
        fail(
          'large-scale-change',
          `Section \`${heading}\` still holds the template text.`,
        ),
      );
    }
  }
  return findings;
}

/**
 * Splits markdown at `##` and `###` headings.
 * @returns {Map<string, string>} heading → its text, comments removed and whitespace collapsed
 */
export function sections(markdown) {
  const result = new Map();
  let heading = null;
  let lines = [];
  const flush = () => {
    if (heading !== null) result.set(heading, normalize(lines.join('\n')));
  };
  let withoutComments = markdown;
  let previous;
  do {
    previous = withoutComments;
    withoutComments = withoutComments.replace(/<!--[\s\S]*?-->/g, '');
  } while (withoutComments !== previous);
  for (const line of withoutComments.split(/\r?\n/)) {
    const match = line.match(/^#{2,3}\s+(.+?)\s*$/);
    if (match) {
      flush();
      heading = match[1].toLowerCase();
      lines = [];
    } else {
      lines.push(line);
    }
  }
  flush();
  return result;
}

function normalize(text) {
  return text
    .replace(/^-{3,}$/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function fail(rule, message) {
  return { level: 'fail', rule, message };
}

function warn(rule, message) {
  return { level: 'warn', rule, message };
}
