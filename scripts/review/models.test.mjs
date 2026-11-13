import assert from 'node:assert/strict';
import { test } from 'node:test';
import { LABELS } from './config.mjs';
import { ranModels, resolveModels, reviewLabels } from './models.mjs';

const defaults = {
  finder: 'f-default',
  verifier: 'v-default',
  strong: 's-default',
};

test('without overrides the defaults apply', () => {
  assert.deepEqual(resolveModels({ defaults }), defaults);
});

test('the environment overrides the defaults, and the flags override both', () => {
  const models = resolveModels({
    defaults,
    env: { REVIEW_FINDER_MODEL: 'f-env', REVIEW_VERIFIER_MODEL: 'v-env' },
    flags: { verifierModel: 'v-flag' },
  });
  assert.deepEqual(models, {
    finder: 'f-env',
    verifier: 'v-flag',
    strong: 's-default',
  });
});

test('an empty variable keeps the value before it', () => {
  const models = resolveModels({ defaults, env: { REVIEW_FINDER_MODEL: '' } });
  assert.equal(models.finder, 'f-default');
});

test('the Opus label sets both roles to the strong model, also an overridden one', () => {
  const models = resolveModels({
    defaults,
    env: { REVIEW_STRONG_MODEL: 's-env' },
    flags: { finderModel: 'f-flag' },
    labels: [LABELS.opus],
  });
  assert.deepEqual(models, {
    finder: 's-env',
    verifier: 's-env',
    strong: 's-env',
  });
});

test('only the review labels are removed', () => {
  assert.deepEqual(reviewLabels(['bug', LABELS.standard, LABELS.opus]), [
    LABELS.standard,
    LABELS.opus,
  ]);
});

test('a model that is not configured is marked as a fallback', () => {
  const runs = [
    { models: ['f-default'] },
    { models: ['v-default', 'f-default'] },
    { models: ['sonnet-older'] },
  ];
  assert.deepEqual(ranModels(runs, defaults), [
    'f-default',
    'sonnet-older (fallback)',
    'v-default',
  ]);
});
