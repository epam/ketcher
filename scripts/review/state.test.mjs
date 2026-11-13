import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BOT_LOGIN, MARKER_PREFIX } from './config.mjs';
import { latestState, nextRound, readMarker, writeMarker } from './state.mjs';

const HEAD = 'a'.repeat(40);
const OTHER_HEAD = 'b'.repeat(40);
const PRINT = '0123456789abcdef';

const state = (fields) => ({
  round: 1,
  head: HEAD,
  posted: [PRINT],
  ...fields,
});

const comment = ({ login = BOT_LOGIN, body, at }) => ({
  user: { login },
  body,
  created_at: at,
});

const brief = (fields) => `${writeMarker(state(fields))}\n\n## Review brief`;

test('a written marker reads back to the same state', () => {
  const written = writeMarker(state({ round: 2 }));
  assert.ok(written.startsWith(MARKER_PREFIX));
  assert.deepEqual(readMarker(written), state({ round: 2 }));
});

test('a marker that is not on the first line is not read', () => {
  assert.equal(readMarker(`Quoted:\n${writeMarker(state({}))}`), undefined);
});

test('a broken or unexpected marker is not read', () => {
  const marker = (json) => `${MARKER_PREFIX}${json} -->`;
  for (const body of [
    marker('{not json'),
    marker('[]'),
    marker(JSON.stringify({ round: 0, head: HEAD, posted: [] })),
    marker(JSON.stringify({ round: 1, head: 'main', posted: [] })),
    marker(JSON.stringify({ round: 1, head: HEAD, posted: ['<b>'] })),
    marker(JSON.stringify({ ...state({}), extra: true })),
    'No marker here.',
  ]) {
    assert.equal(readMarker(body), undefined, body);
  }
});

test('the newest marker from the workflow account is used', () => {
  const comments = [
    comment({ body: brief({ round: 2 }), at: '2026-11-02T10:00:00Z' }),
    comment({ body: brief({ round: 1 }), at: '2026-11-01T10:00:00Z' }),
    comment({ body: 'Thanks!', at: '2026-11-03T10:00:00Z' }),
  ];
  assert.equal(latestState(comments).round, 2);
});

test('a marker from another account is ignored', () => {
  const comments = [
    comment({ body: brief({ round: 1 }), at: '2026-11-01T10:00:00Z' }),
    comment({
      login: 'someone',
      body: brief({ round: 3, head: OTHER_HEAD, posted: [] }),
      at: '2026-11-02T10:00:00Z',
    }),
  ];
  assert.deepEqual(latestState(comments), state({ round: 1 }));
});

test('without a marker there is no state', () => {
  assert.equal(latestState([]), undefined);
});

test('the first round starts without a previous head', () => {
  assert.deepEqual(nextRound(undefined), {
    round: 1,
    previousHead: undefined,
    posted: [],
    limitReached: false,
  });
});

test('a later round continues from the previous head and posted findings', () => {
  assert.deepEqual(nextRound(state({ round: 1 })), {
    round: 2,
    previousHead: HEAD,
    posted: [PRINT],
    limitReached: false,
  });
});

test('the round after the last one reaches the limit', () => {
  assert.equal(nextRound(state({ round: 2 }), 3).limitReached, false);
  assert.equal(nextRound(state({ round: 3 }), 3).limitReached, true);
});
