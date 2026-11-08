import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { parseDiff } from './diff.mjs';
import {
  brief,
  briefLine,
  inlineComment,
  limitComment,
  plain,
  splitForPosting,
} from './format.mjs';
import { readMarker } from './state.mjs';

const fixture = (name) =>
  readFileSync(new URL(`../fixtures/review/${name}`, import.meta.url), 'utf8');

const HEAD = 'a'.repeat(40);

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

test('a brief line cannot break out of its code span', () => {
  assert.equal(
    briefLine(finding({ file: 'a`b.ts' })),
    "- `a'b.ts:2` · **major** · R5 · The cast hides a wrong type.",
  );
});

test('the brief states everything the output contract asks for', () => {
  const blocker = finding({ severity: 'blocker' });
  const overflow = finding({ line: 3, severity: 'nit', claim: 'Odd name.' });
  const outside = finding({ line: 40, claim: 'Old code repeats it.' });
  const text = brief({
    state: { round: 2, head: HEAD, posted: ['0123456789abcdef'] },
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