// Tests of the eval report: scoring, the table and the matches draft.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  configRow,
  draftMatches,
  renderTable,
  scoreEntry,
  suggestExpected,
} from './report.mjs';

const ENTRY = {
  pr: 7,
  expected: [
    { id: 'e1', file: 'a.ts', line: 10 },
    { id: 'e2', file: 'b.ts', line: 40 },
  ],
};

const CLEAN = { pr: 8, expected: [] };

/** A confirmed finding of a result file. */
const finding = (fingerprint, location) => ({
  fingerprint,
  location,
  claim: `Claim ${fingerprint}.`,
});

/** A result file with the given confirmed findings. */
const result = (confirmed, { costUsd = 1, timeMs = 2000 } = {}) => ({
  confirmed,
  cost: { totalUsd: costUsd },
  time: { totalMs: timeMs },
  failedRuns: 0,
});

test('a score counts hits, false positives and unjudged findings', () => {
  const score = scoreEntry(
    result([
      finding('f1', 'a.ts:11'),
      finding('f2', 'c.ts:1'),
      finding('f3', 'd.ts:2'),
    ]),
    ENTRY,
    {
      finderHits: ['e1', 'e2'],
      confirmed: [
        {
          fingerprint: 'f1',
          location: 'a.ts:11',
          expected: 'e1',
          verdict: 'match',
        },
        {
          fingerprint: 'f2',
          location: 'c.ts:1',
          expected: null,
          verdict: 'false-positive',
        },
      ],
    },
  );
  assert.equal(score.expected, 2);
  assert.equal(score.hits, 1);
  assert.equal(score.finderHits, 2);
  assert.equal(score.falsePositives, 1);
  assert.equal(score.unjudged, 1);
});

test('two findings that match one expected finding count it once', () => {
  const score = scoreEntry(
    result([finding('f1', 'a.ts:10'), finding('f2', 'a.ts:12')]),
    ENTRY,
    {
      finderHits: [],
      confirmed: [
        {
          fingerprint: 'f1',
          location: 'a.ts:10',
          expected: 'e1',
          verdict: 'match',
        },
        {
          fingerprint: 'f2',
          location: 'a.ts:12',
          expected: 'e1',
          verdict: 'match',
        },
      ],
    },
  );
  assert.equal(score.hits, 1);
  assert.equal(score.matched, 2);
  // A confirmed hit was also raised by a finder.
  assert.equal(score.finderHits, 1);
});

test('a judgement of a finding the run did not confirm is ignored', () => {
  const score = scoreEntry(result([]), ENTRY, {
    finderHits: [],
    confirmed: [
      {
        fingerprint: 'gone',
        location: 'a.ts:10',
        expected: 'e1',
        verdict: 'match',
      },
    ],
  });
  assert.equal(score.hits, 0);
});

test('a configuration row adds up its pull requests', () => {
  const row = configRow('cfg', [
    scoreEntry(
      result([finding('f1', 'a.ts:10')], { costUsd: 2, timeMs: 4000 }),
      ENTRY,
      {
        finderHits: ['e1'],
        confirmed: [
          {
            fingerprint: 'f1',
            location: 'a.ts:10',
            expected: 'e1',
            verdict: 'match',
          },
        ],
      },
    ),
    scoreEntry(
      result([finding('f9', 'z.ts:1')], { costUsd: 1, timeMs: 2000 }),
      CLEAN,
      {
        finderHits: [],
        confirmed: [
          {
            fingerprint: 'f9',
            location: 'z.ts:1',
            expected: null,
            verdict: 'valid',
          },
        ],
      },
    ),
  ]);
  assert.equal(row.recall, 0.5);
  assert.equal(row.precision, 1);
  assert.equal(row.costPerPrUsd, 1.5);
  assert.equal(row.timePerPrMs, 3000);
  const table = renderTable([row]);
  assert.match(table, /\| `cfg` \| 2 \| 50% \(1\/2\) \|/);
  assert.match(table, /\$1\.50/);
});

test('a row without judged findings has no precision', () => {
  const row = configRow('cfg', [scoreEntry(result([]), CLEAN)]);
  assert.equal(row.precision, undefined);
  assert.equal(row.recall, undefined);
  assert.match(renderTable([row]), /n\/a/);
});

test('a suggestion needs the same file and a near line', () => {
  assert.equal(suggestExpected({ location: 'a.ts:14' }, ENTRY.expected), 'e1');
  assert.equal(suggestExpected({ location: 'a.ts:30' }, ENTRY.expected), null);
  assert.equal(suggestExpected({ location: 'c.ts:10' }, ENTRY.expected), null);
});

test('the draft adds only findings that have no judgement yet', () => {
  const matches = {
    runs: {
      cfg: {
        7: {
          finderHits: ['e1'],
          confirmed: [
            {
              fingerprint: 'f1',
              location: 'a.ts:10',
              expected: 'e1',
              verdict: 'match',
            },
          ],
        },
      },
    },
  };
  const next = draftMatches(matches, [
    {
      config: 'cfg',
      entry: ENTRY,
      result: result([finding('f1', 'a.ts:10'), finding('f2', 'b.ts:41')]),
    },
  ]);
  const run = next.runs.cfg[7];
  assert.equal(run.confirmed.length, 2);
  assert.equal(run.confirmed[0].verdict, 'match');
  assert.deepEqual(
    { ...run.confirmed[1], note: undefined },
    {
      fingerprint: 'f2',
      location: 'b.ts:41',
      expected: 'e2',
      verdict: 'todo',
      note: undefined,
    },
  );
  assert.equal(matches.runs.cfg[7].confirmed.length, 1, 'input unchanged');
});

test('matches.json judges only findings with a known verdict', () => {
  const matches = JSON.parse(
    readFileSync(new URL('./matches.json', import.meta.url), 'utf8'),
  );
  const verdicts = new Set(['match', 'valid', 'false-positive', 'todo']);
  for (const runs of Object.values(matches.runs)) {
    for (const run of Object.values(runs)) {
      assert.ok(Array.isArray(run.finderHits));
      for (const item of run.confirmed) {
        assert.ok(verdicts.has(item.verdict), item.verdict);
        if (item.verdict !== 'todo') {
          assert.equal(item.verdict === 'match', Boolean(item.expected));
        }
      }
    }
  }
});
