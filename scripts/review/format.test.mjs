import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { parseDiff } from './diff.mjs';
import {
  brief,
  briefLine,
  feedbackAsk,
  findingLabel,
  inlineComment,
  limitComment,
  locationText,
  plain,
  splitForPosting,
} from './format.mjs';
import { readMarker } from './state.mjs';

const fixture = (name) =>
  readFileSync(new URL(`../fixtures/review/${name}`, import.meta.url), 'utf8');

const HEAD = 'a'.repeat(40);
const SOURCE = { repo: 'epam/ketcher', head: HEAD };
const blob = `https://github.com/epam/ketcher/blob/${HEAD}`;

const finding = (fields) => ({
  file: 'src/Editor.ts',
  line: 2,
  locations: ['src/Editor.ts:2'],
  severity: 'major',
  id: 'R5',
  claim: 'The cast hides a wrong type.',
  scenario: 'Opening a KET file without atoms throws.',
  references: [],
  lenses: ['correctness'],
  fingerprint: '0123456789abcdef',
  ...fields,
});

// src/Editor.ts: lines 1 to 3 of the new file are in the diff.
const files = parseDiff(
  [
    'diff --git a/src/Editor.ts b/src/Editor.ts',
    '--- a/src/Editor.ts',
    '+++ b/src/Editor.ts',
    '@@ -1,3 +1,3 @@',
    ' one',
    '-two',
    '+TWO',
    ' three',
  ].join('\n'),
);

test('model text is one line, without HTML and without mentions', () => {
  assert.equal(
    plain('Calls <b>@octocat</b>\n  twice'),
    `Calls &lt;b>@${String.fromCodePoint(0x200b)}octocat&lt;/b> twice`,
  );
});

test('code spans keep < and @, the text around them does not', () => {
  const space = String.fromCodePoint(0x200b);
  assert.equal(
    plain('`a < b` is not <b>, `@Input()` is not @team'),
    `\`a < b\` is not &lt;b>, \`@Input()\` is not @${space}team`,
  );
  assert.equal(plain('one ` <!-- x'), 'one ` &lt;!-- x');
  assert.equal(plain('\\`<b>\\`'), '`<b>`');
});

test('only lines in the diff get a comment, blockers first, up to the cap', () => {
  const { inline, overflow, outsideDiff } = splitForPosting(
    [
      finding({ line: 1, severity: 'nit' }),
      finding({ line: 3 }),
      finding({ line: 2, severity: 'blocker' }),
      finding({ line: 40 }),
      finding({ file: 'src/Other.ts', line: 2 }),
    ],
    files,
    2,
  );
  assert.deepEqual(
    inline.map((f) => `${f.severity}:${f.line}`),
    ['blocker:2', 'major:3'],
  );
  assert.deepEqual(
    overflow.map((f) => `${f.severity}:${f.line}`),
    ['nit:1'],
  );
  assert.deepEqual(
    outsideDiff.map((f) => `${f.file}:${f.line}`),
    ['src/Editor.ts:40', 'src/Other.ts:2'],
  );
});

test('an inline comment gives severity, ID, claim, scenario and locations', () => {
  const comment = inlineComment(
    finding({
      locations: ['src/Editor.ts:2', 'src/A.ts:5'],
      references: ['src/util.ts:9'],
    }),
  );
  assert.equal(comment.path, 'src/Editor.ts');
  assert.equal(comment.line, 2);
  assert.equal(comment.body, fixture('inline-comment.md').trimEnd());
});

test('the label names a rule or an invariant and leaves out none', () => {
  assert.equal(findingLabel(finding({ id: 'R5' })), '**major** · Rule R5');
  assert.equal(findingLabel(finding({ id: 'D1' })), '**major** · Invariant D1');
  assert.equal(findingLabel(finding({ id: 'none' })), '**major**');
  assert.ok(
    briefLine(finding({ id: 'none', severity: 'nit' }), 1).startsWith(
      '1. `src/Editor.ts:2` · **nit** · The cast hides a wrong type.\n',
    ),
  );
});

test('a location links to its line of the reviewed commit', () => {
  assert.equal(
    locationText('src/Editor.ts:2', SOURCE),
    `[\`src/Editor.ts:2\`](${blob}/src/Editor.ts#L2)`,
  );
});

test('a location stays plain code without a source or without a line', () => {
  assert.equal(locationText('src/Editor.ts:2'), '`src/Editor.ts:2`');
  assert.equal(locationText('src/Editor.ts', SOURCE), '`src/Editor.ts`');
});

test('a path cannot end the link destination early', () => {
  // These are harmless in the link text; in the destination a parenthesis
  // ends the link, `#` starts the fragment and `?` starts a query string.
  assert.equal(
    locationText('src/a (copy).ts:7', SOURCE),
    `[\`src/a (copy).ts:7\`](${blob}/src/a%20%28copy%29.ts#L7)`,
  );
  assert.equal(
    locationText('src/a#b.ts:5', SOURCE),
    `[\`src/a#b.ts:5\`](${blob}/src/a%23b.ts#L5)`,
  );
  assert.equal(
    locationText('src/a?b.ts:5', SOURCE),
    `[\`src/a?b.ts:5\`](${blob}/src/a%3Fb.ts#L5)`,
  );
});

test('the label tells a rule from an invariant by its ID', () => {
  assert.equal(findingLabel(finding({ id: 'R12' })), '**major** · Rule R12');
  assert.equal(findingLabel(finding({ id: 'A8' })), '**major** · Invariant A8');
});

test('a brief line links the finding to its line', () => {
  assert.ok(
    briefLine(finding(), 1, SOURCE).startsWith(
      `1. [\`src/Editor.ts:2\`](${blob}/src/Editor.ts#L2) · **major** · Rule R5 · The cast hides a wrong type.\n`,
    ),
  );
});

test('an inline comment links the other locations and the existing code', () => {
  const comment = inlineComment(
    finding({
      locations: ['src/Editor.ts:2', 'src/A.ts:5'],
      references: ['src/util.ts:9'],
    }),
    SOURCE,
  );
  assert.ok(
    comment.body.includes(`Also at: [\`src/A.ts:5\`](${blob}/src/A.ts#L5)`),
    comment.body,
  );
  assert.ok(
    comment.body.includes(
      `Existing code: [\`src/util.ts:9\`](${blob}/src/util.ts#L9)`,
    ),
    comment.body,
  );
});

test('a brief line cannot break out of its code span', () => {
  assert.ok(
    briefLine(finding({ file: 'a`b.ts' }), 1).startsWith(
      "1. `a'b.ts:2` · **major** · Rule R5 · The cast hides a wrong type.\n",
    ),
  );
});

test('a brief line puts the failing scenario on its own line', () => {
  assert.equal(
    briefLine(finding({ scenario: 'Undo\nkeeps the bond.' }), 3),
    [
      '3. `src/Editor.ts:2` · **major** · Rule R5 · The cast hides a wrong type.',
      '',
      '   Failing scenario: Undo keeps the bond.',
    ].join('\n'),
  );
});

test('a two-digit number indents the scenario to the item text', () => {
  const [, , scenario] = briefLine(finding(), 10).split('\n');
  assert.equal(
    scenario,
    '    Failing scenario: Opening a KET file without atoms throws.',
  );
});

test('the brief numbers its findings on across its sections', () => {
  const refused = finding({ severity: 'blocker', claim: 'Refused.' });
  const overflow = finding({ line: 3, severity: 'nit', claim: 'Over.' });
  const outside = finding({ line: 40, claim: 'Outside.' });
  const text = brief({
    state: { round: 1, head: HEAD, posted: [] },
    range: { from: 'b'.repeat(40), kind: 'full' },
    prType: undefined,
    panel: [],
    models: [],
    findings: [refused, overflow, outside],
    overflow: [overflow],
    outsideDiff: [outside],
    failedPasses: [],
    skippedFiles: 0,
    inline: [refused],
    inlineFailure: 'line must be part of the diff',
  });
  assert.match(text, /^1\. .* · Refused\.$/m);
  assert.match(text, /^2\. .* · Over\.$/m);
  assert.match(text, /^3\. .* · Outside\.$/m);
  // Every finding is in the brief, so there is no inline comment to answer.
  assert.ok(!text.includes('in its thread'), text);
  assert.ok(text.includes('`Dismissed <n>: <why>`'), text);
});

test('the feedback ask names only the ways a round can be answered', () => {
  assert.deepEqual(feedbackAsk(0, 0), []);
  const inlineOnly = feedbackAsk(2, 0).join('\n');
  assert.ok(inlineOnly.includes('`Dismissed: <why>`'), inlineOnly);
  assert.ok(!inlineOnly.includes('<n>'), inlineOnly);
  const briefOnly = feedbackAsk(0, 2).join('\n');
  assert.ok(briefOnly.includes('`Dismissed <n>: <why>`'), briefOnly);
  assert.ok(!briefOnly.includes('in its thread'), briefOnly);
});

test('the brief states everything the output contract asks for', () => {
  const blocker = finding({ severity: 'blocker' });
  const overflow = finding({ line: 3, severity: 'nit', claim: 'Odd name.' });
  const outside = finding({ line: 40, claim: 'Old code repeats it.' });
  const text = brief({
    state: { round: 2, head: HEAD, posted: ['0123456789abcdef'] },
    source: SOURCE,
    range: { from: 'b'.repeat(40), kind: 'incremental' },
    linkedIssue: {
      number: 123,
      fixesIssue: 'partly',
      reason: 'Undo is not fixed.',
    },
    prType: 'Bug fix',
    panel: ['correctness', 'reuse'],
    models: ['claude-sonnet-5-5'],
    findings: [blocker, overflow, outside],
    overflow: [overflow],
    outsideDiff: [outside],
    failedPasses: ['performance'],
    skippedFiles: 2,
  });
  assert.equal(text, fixture('brief.md').trimEnd());
  assert.deepEqual(readMarker(text), {
    round: 2,
    head: HEAD,
    posted: ['0123456789abcdef'],
  });
});

test('a refused review puts its findings and the reason in the brief', () => {
  const inline = finding({ severity: 'blocker' });
  const text = brief({
    state: { round: 1, head: HEAD, posted: [] },
    range: { from: 'b'.repeat(40), kind: 'full' },
    prType: 'Bug fix',
    panel: ['correctness'],
    models: ['claude-sonnet-5-5'],
    findings: [inline],
    overflow: [],
    outsideDiff: [],
    failedPasses: [],
    skippedFiles: 0,
    inline: [inline],
    inlineFailure: 'line must be part of the diff',
  });
  assert.match(text, /### Findings without an inline comment/);
  assert.match(
    text,
    /GitHub did not take these findings as comments: line must/,
  );
  assert.ok(text.includes(inline.claim));
});

test('a brief without findings, issue or panel still says so', () => {
  const text = brief({
    state: { round: 1, head: HEAD, posted: [] },
    range: { from: 'b'.repeat(40), kind: 'full' },
    linkedIssue: undefined,
    prType: undefined,
    panel: [],
    models: [],
    findings: [],
    overflow: [],
    outsideDiff: [],
    failedPasses: [],
    skippedFiles: 0,
  });
  assert.equal(text, fixture('brief-empty.md').trimEnd());
});

test('the limit comment has no marker', () => {
  const text = limitComment(3);
  assert.match(text, /3 review rounds/);
  assert.equal(readMarker(text), undefined);
});

test('a linked-issue run without an answer still names the issue', () => {
  const text = brief({
    state: { round: 1, head: HEAD, posted: [] },
    range: { from: 'b'.repeat(40), kind: 'full' },
    linkedIssue: { number: 42 },
    prType: undefined,
    panel: [],
    models: [],
    findings: [],
    overflow: [],
    outsideDiff: [],
    failedPasses: ['linked issue #42'],
    skippedFiles: 0,
  });
  assert.ok(text.includes('**Linked issue:** #42: the check gave no answer.'));
});
