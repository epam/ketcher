import assert from 'node:assert/strict';
import { test } from 'node:test';
import { redact, secretValues } from './redact.mjs';

test('the secret values of an environment are read by name', () => {
  assert.deepEqual(
    secretValues({
      CLAUDE_CODE_OAUTH_TOKEN: 'sk-ant-oat01-aaaaaaaaaaaa',
      GITHUB_TOKEN: 'ghs_bbbbbbbbbbbbbbbb',
      PATH: '/bin',
    }),
    ['sk-ant-oat01-aaaaaaaaaaaa', 'ghs_bbbbbbbbbbbbbbbb'],
  );
});

test('a short or missing value is not treated as a secret', () => {
  assert.deepEqual(secretValues({ GITHUB_TOKEN: 'gh', GH_TOKEN: '' }), []);
});

test('the same value under two names is taken out once', () => {
  assert.deepEqual(
    secretValues({
      GITHUB_TOKEN: 'ghs_cccccccccccccccc',
      GH_TOKEN: 'ghs_cccccccccccccccc',
    }),
    ['ghs_cccccccccccccccc'],
  );
});

test('every occurrence of a secret value is replaced', () => {
  const text = 'ghs_dddddddddddddddd twice: ghs_dddddddddddddddd.';
  assert.equal(
    redact(text, ['ghs_dddddddddddddddd']),
    '[redacted] twice: [redacted].',
  );
});

test('text without a secret is unchanged, and no secret is no change', () => {
  assert.equal(
    redact('A finding on src/A.ts:2.', []),
    'A finding on src/A.ts:2.',
  );
  assert.equal(
    redact('A finding on src/A.ts:2.', ['ghs_eeeeeeeeeeeeeeee']),
    'A finding on src/A.ts:2.',
  );
});
