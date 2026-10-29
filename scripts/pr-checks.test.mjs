import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { checkPullRequest, LSC_LABEL, sections } from './pr-checks.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LSC_TEMPLATE = readFileSync(
  join(ROOT, '.github', 'PULL_REQUEST_TEMPLATE', 'large-scale-change.md'),
  'utf8',
);

function file(path, lines = 10, status = 'modified') {
  return { path, status, additions: lines, deletions: 0 };
}

function pr(overrides = {}) {
  return {
    title: '#100 - Atom labels break at 20% zoom',
    body: 'Memory bank: not needed',
    branch: '100-atom-labels-break',
    labels: [],
    isDraft: false,
    requestedReviewers: 1,
    linkedIssues: [{ number: 100, type: 'Task' }],
    files: [file('packages/ketcher-react/src/a.ts')],
    lscTemplate: LSC_TEMPLATE,
    ...overrides,
  };
}

function rules(findings, level) {
  return findings
    .filter((finding) => finding.level === level)
    .map((finding) => finding.rule);
}

test('a PR that follows every rule has no findings', () => {
  assert.deepEqual(checkPullRequest(pr()), []);
});

test('a branch name with # fails', () => {
  const findings = checkPullRequest(pr({ branch: '#100-atom-labels' }));
  assert.deepEqual(rules(findings, 'fail'), ['branch']);
});

test('title: no issue prefix with a linked issue fails', () => {
  for (const title of ['100 - Atom labels', 'Atom labels break']) {
    assert.deepEqual(
      rules(checkPullRequest(pr({ title })), 'fail'),
      ['title'],
      title,
    );
  }
});

test('title: the separator form is not enforced', () => {
  for (const title of [
    '#100-Atom labels',
    '#100 Atom labels',
    '#100 – Atom labels',
  ]) {
    assert.deepEqual(checkPullRequest(pr({ title })), [], title);
  }
});

test('title: a Backmerge prefix and several issues are accepted', () => {
  const findings = checkPullRequest(
    pr({
      title: 'Backmerge: #100, #101 - Atom labels',
      linkedIssues: [
        { number: 100, type: 'Task' },
        { number: 101, type: 'Task' },
      ],
    }),
  );
  assert.deepEqual(findings, []);
});

test('title: an issue in the title that the PR does not link warns', () => {
  const findings = checkPullRequest(pr({ title: '#999 - Atom labels' }));
  assert.deepEqual(rules(findings, 'warn'), ['title']);
});

test('no linked issue warns, and a plain title is then accepted', () => {
  const findings = checkPullRequest(
    pr({ title: 'ci: upgrade CodeQL', linkedIssues: [] }),
  );
  assert.deepEqual(rules(findings, 'fail'), []);
  assert.deepEqual(rules(findings, 'warn'), ['linked-issue']);
});

test('size: over 400 lines warns; lockfiles and snapshots are not counted', () => {
  const big = checkPullRequest(
    pr({ files: [file('packages/ketcher-react/src/a.ts', 401)] }),
  );
  assert.deepEqual(rules(big, 'warn'), ['size']);

  const lockfile = checkPullRequest(
    pr({
      files: [
        file('packages/ketcher-react/src/a.ts', 100),
        file('package-lock.json', 5000),
        file('packages/ketcher-core/__tests__/__snapshots__/a.snap', 900),
      ],
    }),
  );
  assert.deepEqual(rules(lockfile, 'warn'), []);
});

test('size: a large-scale change is not warned about size', () => {
  const findings = checkPullRequest(
    pr({
      labels: [LSC_LABEL],
      files: [file('packages/ketcher-react/src/a.ts', 3000)],
    }),
  );
  assert.ok(!rules(findings, 'warn').includes('size'));
});

test('unit test: domain or operations code without a unit test change warns', () => {
  const domain = file('packages/ketcher-core/src/domain/entities/atom.ts');
  assert.deepEqual(rules(checkPullRequest(pr({ files: [domain] })), 'warn'), [
    'unit-test',
  ]);

  const withTest = checkPullRequest(
    pr({
      files: [
        domain,
        file('packages/ketcher-core/__tests__/domain/entities/atom.test.ts'),
      ],
    }),
  );
  assert.deepEqual(rules(withTest, 'warn'), []);

  const removedOnly = checkPullRequest(
    pr({
      files: [
        file(
          'packages/ketcher-core/src/application/editor/operations/old.ts',
          10,
          'removed',
        ),
      ],
    }),
  );
  assert.deepEqual(rules(removedOnly, 'warn'), []);
});

test('bug fix: a Bug issue with no unit or E2E test change warns', () => {
  const bug = [{ number: 100, type: 'Bug' }];
  assert.deepEqual(rules(checkPullRequest(pr({ linkedIssues: bug })), 'warn'), [
    'bug-fix',
  ]);

  const withE2E = checkPullRequest(
    pr({
      linkedIssues: bug,
      files: [
        file('packages/ketcher-react/src/a.ts'),
        file('ketcher-autotests/tests/specs/zoom/atom-labels.spec.ts'),
      ],
    }),
  );
  assert.deepEqual(rules(withE2E, 'warn'), []);
});

test('feature: a Feature issue with no OpenSpec change fails, except a backmerge', () => {
  const feature = [{ number: 100, type: 'Feature' }];
  assert.deepEqual(
    rules(checkPullRequest(pr({ linkedIssues: feature })), 'fail'),
    ['feature'],
  );

  const withChange = checkPullRequest(
    pr({
      linkedIssues: feature,
      files: [
        file('packages/ketcher-react/src/a.ts'),
        file('openspec/changes/atom-labels/proposal.md'),
      ],
    }),
  );
  assert.deepEqual(rules(withChange, 'fail'), []);

  const backmerge = checkPullRequest(
    pr({ title: 'Backmerge: #100 - Atom labels', linkedIssues: feature }),
  );
  assert.deepEqual(rules(backmerge, 'fail'), []);
});

test('large-scale change: the unedited template fails on every section', () => {
  const findings = checkPullRequest(
    pr({ labels: [LSC_LABEL], body: LSC_TEMPLATE }),
  );
  const failed = findings.filter((f) => f.rule === 'large-scale-change');
  assert.equal(failed.length, sections(LSC_TEMPLATE).size);
  assert.ok(failed.every((f) => f.message.includes('template text')));
});

test('large-scale change: a missing section fails, filled sections pass', () => {
  const filled = [...sections(LSC_TEMPLATE).keys()]
    .filter((heading) => heading !== 'review map')
    .map((heading) => `## ${heading}\n\nFilled in by the author.`)
    .join('\n\n');
  const findings = checkPullRequest(pr({ labels: [LSC_LABEL], body: filled }));
  assert.deepEqual(
    findings
      .filter((f) => f.rule === 'large-scale-change')
      .map((f) => f.message),
    ['Section `review map` is missing.'],
  );
});

test('large-scale change: without the label, the body is not checked', () => {
  assert.deepEqual(
    checkPullRequest(pr({ body: 'Memory bank: not needed' })),
    [],
  );
});

test('sections: splits at ## and ###, drops comments, lowercases headings', () => {
  const result = sections(
    '<!-- note -->\n## Merge Danger\n\nDoor\n\n### Revert plan\n\nRoll back.\n',
  );
  assert.deepEqual(
    [...result],
    [
      ['merge danger', 'Door'],
      ['revert plan', 'Roll back.'],
    ],
  );
});

test('memory bank: a missing line warns, any line passes', () => {
  assert.deepEqual(rules(checkPullRequest(pr({ body: '' })), 'warn'), [
    'memory-bank',
  ]);
  for (const body of [
    'Memory bank: not needed',
    '- Memory bank: `.memory-bank/domain.md`',
    'memory bank:updated',
  ]) {
    assert.deepEqual(checkPullRequest(pr({ body })), [], body);
  }
});

test('memory bank: a backmerge is skipped', () => {
  const title = 'Backmerge: release/3.0 into master';
  assert.deepEqual(
    rules(checkPullRequest(pr({ title, body: '' })), 'warn'),
    [],
  );
});

test('reviewers: no reviewer warns, a draft is skipped', () => {
  assert.deepEqual(
    rules(checkPullRequest(pr({ requestedReviewers: 0 })), 'warn'),
    ['reviewers'],
  );
  assert.deepEqual(
    checkPullRequest(pr({ requestedReviewers: 0, isDraft: true })),
    [],
  );
});

test('feature: no test warns, a unit or E2E test passes', () => {
  const linkedIssues = [{ number: 100, type: 'Feature' }];
  const change = file('openspec/changes/x/proposal.md');
  assert.deepEqual(
    rules(checkPullRequest(pr({ linkedIssues, files: [change] })), 'warn'),
    ['feature-test'],
  );
  for (const test of [
    'packages/ketcher-core/src/a.test.ts',
    'ketcher-autotests/tests/a/b.spec.ts',
  ]) {
    const findings = checkPullRequest(
      pr({ linkedIssues, files: [change, file(test)] }),
    );
    assert.deepEqual(findings, [], test);
  }
});
