import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formatReport, judgementProblems, scoreConfig } from './report.mjs';

const result = (overrides = {}) => ({
  issue: 1,
  config: 'sonnet',
  checklist: 2,
  specs: ['ketcher-autotests/tests/specs/a.spec.ts'],
  specNameMatches: true,
  generation: { costUsd: 2, durationMs: 60000 },
  analysis: [
    {
      testCount: 2,
      casesMatchChecklist: true,
      rawSelectors: 1,
      wrongVersionLines: 0,
    },
  ],
  typeErrors: [],
  lint: { errors: 0 },
  playwright: { passed: 1, flaky: 1, failed: 0, skipped: 0 },
  ...overrides,
});

describe('scoreConfig', () => {
  it('sums the mechanical checks, cost and time', () => {
    const score = scoreConfig([
      result(),
      result({
        issue: 2,
        typeErrors: ['x'],
        generation: { costUsd: 4, durationMs: 120000 },
      }),
    ]);
    assert.equal(score.issues, 2);
    assert.equal(score.compiles, 1);
    assert.equal(score.tests, 4);
    assert.equal(score.passed, 2);
    assert.equal(score.flaky, 2);
    assert.equal(score.passRate, '50%');
    assert.equal(score.costPerIssueUsd, 3);
    assert.equal(score.generationSPerIssue, 90);
  });

  it('counts a result with no spec and a failed generation', () => {
    const score = scoreConfig([
      result({
        specs: [],
        analysis: undefined,
        playwright: undefined,
        generation: { costUsd: 1, durationMs: 1, error: 'x' },
      }),
    ]);
    assert.equal(score.noSpec, 1);
    assert.equal(score.generationErrors, 1);
    assert.equal(score.passRate, '-');
  });

  it('adds the hand judgements', () => {
    const score = scoreConfig([result()], {
      1: { cases: ['covered', 'wrong'], conventions: 3 },
    });
    assert.equal(score.judged, 1);
    assert.equal(score.covered, 1);
    assert.equal(score.wrong, 1);
    assert.equal(score.coverage, '50%');
    assert.equal(score.conventionBreaks, 3);
  });
});

describe('judgementProblems', () => {
  const entries = [{ issue: 1, checklist: 2 }];
  it('accepts one known verdict per checklist item', () => {
    assert.deepEqual(
      judgementProblems({ 1: { cases: ['covered', 'skipped'] } }, entries),
      [],
    );
  });
  it('reports a wrong count, an unknown verdict and an unknown issue', () => {
    assert.deepEqual(
      judgementProblems({ 1: { cases: ['fine'] }, 9: { cases: [] } }, entries),
      [
        '#1 has 1 verdicts for 2 checklist items',
        '#1 has unknown verdicts: fine',
        '#9 is not in the eval set',
      ],
    );
  });
});

describe('formatReport', () => {
  it('puts the reference first and leaves it out of the judgements', () => {
    const byConfig = new Map([
      ['sonnet', [result()]],
      ['reference', [result({ config: 'reference', generation: undefined })]],
    ]);
    const text = formatReport(byConfig, {});
    const rows = text
      .split('\n')
      .filter((line) => /^\| (reference|sonnet) \|/.test(line));
    assert.match(rows[0], /^\| reference \|/);
    assert.match(rows[1], /^\| sonnet \|/);
    assert.equal(rows.length, 3);
  });
});
