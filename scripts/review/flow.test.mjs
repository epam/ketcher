// Test of a whole review round with a fake GitHub and a fake model runner.
// It covers what the unit tests cannot see and what costs money or touches
// someone else's pull request when it breaks: the round limit, the dry run,
// label removal on failure, a review GitHub refuses, and no repeat in a later
// round. The prompts, rules and documents are the real ones of this checkout.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { BOT_LOGIN, LABELS } from './config.mjs';
import { runReview } from './flow.mjs';
import { fingerprint } from './merge.mjs';
import { readMarker, writeMarker } from './state.mjs';

const fixture = (name) =>
  readFileSync(new URL(`../fixtures/review/${name}`, import.meta.url), 'utf8');

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));

const FILE = 'packages/ketcher-core/src/utilities/label.ts';
const BASE = 'b'.repeat(40);
const HEAD = 'c'.repeat(40);
const PREVIOUS_HEAD = 'd'.repeat(40);
const MODEL = 'claude-sonnet-5-5';

/** What the fake correctness finder reports. */
const FINDING = {
  file: FILE,
  line: 2,
  otherLocations: [],
  severity: 'major',
  id: 'none',
  claim: 'An atom without a label throws on trim.',
  scenario: 'Calling label on an atom whose label is undefined throws.',
  references: [],
};

/** What the fake verifier answers. */
const VERDICT = {
  verdict: 'confirmed',
  reason: 'Line 2 calls trim on atom.label.',
  line: 2,
  severity: 'major',
  id: 'none',
  scenario: 'Calling label on an atom whose label is undefined throws.',
  alsoCheck: 'none',
};

/**
 * An error in the shape Octokit throws, so the flow reads its status.
 * @param {number} status
 * @param {string} message
 */
const httpError = (status, message) =>
  Object.assign(new Error(message), { status });

/** The role of a run, read from its JSON Schema. */
function roleOf(args) {
  const schema = args[args.indexOf('--json-schema') + 1];
  if (schema.includes('"pairs"')) return 'duplicates';
  if (schema.includes('"fixesIssue"')) return 'linked-issue';
  if (schema.includes('"verdict"')) return 'verifier';
  return 'finder';
}

/** The lens of a finder run, read from its input. */
const lensOf = (input) => /through the `([^`]+)` lens/.exec(input)?.[1];

/**
 * A fake model runner: a finder answers the given findings of its lens, the
 * other roles a fixed answer. Every call is recorded with its role.
 * @param {Record<string, object[]>} [findings] findings per lens
 */
function fakeRunner(findings = {}) {
  const calls = [];
  const outputs = {
    finder: (input) => ({ findings: findings[lensOf(input)] ?? [] }),
    verifier: () => VERDICT,
    duplicates: () => ({ pairs: [] }),
    'linked-issue': () => ({ fixesIssue: 'partly', reason: 'Only trim.' }),
  };
  const run = async ({ args, input }) => {
    const role = roleOf(args);
    calls.push({ role });
    const output = outputs[role](input);
    return { ok: true, output, costUsd: 0.01, durationMs: 1, models: [MODEL] };
  };
  return { run, calls };
}

/** The brief of an earlier round, as the workflow account posted it. */
const earlierBrief = (state) => ({
  user: { login: BOT_LOGIN },
  created_at: '2026-11-01T10:00:00Z',
  body: `${writeMarker(state)}\n\n## Claude review`,
});

/**
 * A fake GitHub. Reads answer from the options; writes are recorded.
 * Every range has the diff of flow-source.diff.
 * @param {object} [options]
 * @param {object[]} [options.comments] earlier comments on the pull request
 * @param {Error} [options.failLinkedIssues] thrown by linkedIssues
 * @param {Error} [options.failPostReview] thrown by postReview
 * @param {(comment: object) => boolean} [options.refuseComment] refused alone
 * @param {string} [options.previousBase] merge base of the previous head
 */
function fakeGitHub({
  comments = [],
  failLinkedIssues,
  failPostReview,
  refuseComment,
  previousBase,
} = {}) {
  const writes = [];
  const diffs = [];
  const github = {
    comments: async () => comments,
    mergeBase: async (_base, sha) =>
      sha === PREVIOUS_HEAD ? (previousBase ?? BASE) : BASE,
    isAncestor: async () => true,
    diff: async (from, to) => {
      diffs.push([from, to]);
      return fixture('flow-source.diff');
    },
    linkedIssues: async () => {
      if (failLinkedIssues) throw failLinkedIssues;
      return [];
    },
    issue: async (number) => ({ number, title: 'Label', body: 'Fix label.' }),
    postReview: async (number, review) => {
      if (failPostReview) throw failPostReview;
      writes.push(['review', review]);
    },
    postReviewComment: async (number, { comment }) => {
      if (refuseComment?.(comment)) {
        throw httpError(422, 'line must be part of the diff');
      }
      writes.push(['reviewComment', comment]);
    },
    postComment: async (number, body) => writes.push(['comment', body]),
    removeLabel: async (number, label) => writes.push(['label', label]),
  };
  return { github, writes, diffs };
}

const pullRequest = {
  number: 7,
  title: '#5 - Upper-case labels',
  body: '',
  baseSha: BASE,
  headSha: HEAD,
  labels: [LABELS.standard],
};

/** Runs one round with the fakes. */
function review({ github, run, dryRun = false, print }) {
  return runReview({
    prNumber: 7,
    pr: pullRequest,
    github,
    baseDir: repoRoot,
    prDir: '/pr',
    models: { finder: MODEL, verifier: MODEL, strong: 'claude-opus-5-5' },
    authMode: 'oauth',
    dryRun,
    run,
    print,
  });
}

/** The writes of one kind. */
const writesOf = (writes, kind) =>
  writes.filter(([name]) => name === kind).map(([, value]) => value);

test('after the last round only the limit comment is posted, and no model runs', async () => {
  const comments = [
    earlierBrief({ round: 3, head: PREVIOUS_HEAD, posted: [] }),
  ];
  const { github, writes } = fakeGitHub({ comments });
  const { run, calls } = fakeRunner();
  const log = await review({ github, run });

  assert.equal(calls.length, 0);
  assert.equal(log.limitReached, true);
  const [limit] = writesOf(writes, 'comment');
  assert.match(limit, /round limit reached/);
  assert.equal(readMarker(limit), undefined);
  assert.deepEqual(writesOf(writes, 'label'), [LABELS.standard]);
});

test('a refused review is sent comment by comment, and only what stays out goes in the brief', async () => {
  const other = { ...FINDING, claim: 'The trim drops a space that matters.' };
  const { github, writes } = fakeGitHub({
    failPostReview: httpError(422, 'line must be part of the diff'),
    refuseComment: (comment) => comment.body.includes('trim drops'),
  });
  const { run } = fakeRunner({ correctness: [FINDING, other] });
  await review({ github, run });

  const posted = writesOf(writes, 'reviewComment');
  assert.equal(posted.length, 1);
  assert.ok(posted[0].body.includes(FINDING.claim));

  const [briefText] = writesOf(writes, 'comment');
  assert.match(briefText, /### Findings without an inline comment/);
  assert.ok(briefText.includes(other.claim));
  assert.ok(!briefText.includes(FINDING.claim));
});

test('a review GitHub refuses still gets a brief that carries the findings', async () => {
  const { github, writes } = fakeGitHub({
    failPostReview: new Error('line must be part of the diff'),
  });
  const { run } = fakeRunner({ correctness: [FINDING] });
  await review({ github, run });

  const [briefText] = writesOf(writes, 'comment');
  assert.notEqual(readMarker(briefText), undefined);
  assert.match(briefText, /### Findings without an inline comment/);
  assert.match(briefText, /line must be part of the diff/);
  assert.ok(briefText.includes(FINDING.claim));
  assert.deepEqual(writesOf(writes, 'label'), [LABELS.standard]);
});

test('a round that fails still removes the label, and the error goes on', async () => {
  const { github, writes } = fakeGitHub({
    failLinkedIssues: new Error('GitHub is down'),
  });
  const { run } = fakeRunner();
  await assert.rejects(review({ github, run }), /GitHub is down/);

  assert.deepEqual(writesOf(writes, 'label'), [LABELS.standard]);
  assert.deepEqual(writesOf(writes, 'comment'), []);
});

test('a later round reviews the new commits and does not repeat a posted finding', async () => {
  const posted = fingerprint({
    file: FILE,
    id: 'none',
    claim: FINDING.claim,
  });
  const comments = [
    earlierBrief({ round: 1, head: PREVIOUS_HEAD, posted: [posted] }),
  ];
  const { github, writes, diffs } = fakeGitHub({ comments });
  const { run, calls } = fakeRunner({ correctness: [FINDING] });
  const log = await review({ github, run });

  assert.equal(log.round, 2);
  assert.deepEqual(diffs[0], [PREVIOUS_HEAD, HEAD]);
  assert.equal(calls.filter((call) => call.role === 'verifier').length, 0);
  assert.deepEqual(writesOf(writes, 'review')[0].comments, []);
  const [briefText] = writesOf(writes, 'comment');
  assert.match(briefText, /round 2 of 3/);
  assert.deepEqual(readMarker(briefText).posted, [posted]);
});

test('a later round reviews the whole pull request after a merge of master', async () => {
  const comments = [
    earlierBrief({ round: 1, head: PREVIOUS_HEAD, posted: [] }),
  ];
  const { github, diffs } = fakeGitHub({
    comments,
    previousBase: 'e'.repeat(40),
  });
  const { run } = fakeRunner();
  const log = await review({ github, run });

  assert.equal(log.round, 2);
  assert.equal(log.range.kind, 'full');
  assert.deepEqual(diffs[0], [BASE, HEAD]);
});

test('a dry run prints the round and writes nothing to GitHub', async () => {
  const { github, writes } = fakeGitHub();
  const { run } = fakeRunner({ correctness: [FINDING] });
  const printed = [];
  await review({
    github,
    run,
    dryRun: true,
    print: (text) => printed.push(text),
  });

  assert.deepEqual(writes, []);
  assert.ok(printed.some((text) => text.startsWith(`--- ${FILE}:2`)));
  assert.ok(printed.some((text) => text.includes('round 1 of 3')));
});
