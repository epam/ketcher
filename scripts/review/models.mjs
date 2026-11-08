// This module does two things:
// - It picks the model for the finders and the model for the verifier.
// - After the run, it lists the models that really answered. A model can
//   differ from the one we picked, because `--fallback-model` can replace it.
//
// The module reads no files and no environment itself. The caller passes in
// the environment, the flags and the labels.
//
// A later source overrides an earlier one:
// 1. the defaults in config.mjs;
// 2. REVIEW_FINDER_MODEL, REVIEW_VERIFIER_MODEL and REVIEW_STRONG_MODEL,
//    which CI takes from repository variables;
// 3. the local flags --finder-model and --verifier-model;
// 4. the `Claude Review: Opus` label, which sets both roles to `strong`.

import { LABELS, MODELS } from './config.mjs';

/** @typedef {{ finder: string, verifier: string, strong: string }} Models */

/**
 * The object without its undefined and empty values, so that a missing
 * override keeps the value before it.
 * @param {Record<string, string | undefined>} values
 */
const definedOnly = (values) =>
  Object.fromEntries(Object.entries(values).filter(([, value]) => value));

/**
 * The models of a run.
 * @param {object} options
 * @param {NodeJS.ProcessEnv} [options.env]
 * @param {{ finderModel?: string, verifierModel?: string }} [options.flags]
 * @param {string[]} [options.labels] the labels of the pull request
 * @param {Models} [options.defaults]
 * @returns {Models}
 */
export function resolveModels({
  env = {},
  flags = {},
  labels = [],
  defaults = MODELS,
}) {
  const fromEnv = definedOnly({
    finder: env.REVIEW_FINDER_MODEL,
    verifier: env.REVIEW_VERIFIER_MODEL,
    strong: env.REVIEW_STRONG_MODEL,
  });
  const fromFlags = definedOnly({
    finder: flags.finderModel,
    verifier: flags.verifierModel,
  });
  const models = { ...defaults, ...fromEnv, ...fromFlags };
  if (labels.includes(LABELS.opus)) {
    return { ...models, finder: models.strong, verifier: models.strong };
  }
  return models;
}

/**
 * The review labels on the pull request: the ones the hub removes at the end.
 * @param {string[]} labels
 */
export function reviewLabels(labels) {
  return Object.values(LABELS).filter((label) => labels.includes(label));
}

/**
 * One model for the brief, with a note when it is not a configured one: a
 * sign that the configured ID fell back and the default needs an update.
 * @param {string} model
 * @param {Set<string>} configured
 */
const modelName = (model, configured) =>
  configured.has(model) ? model : `${model} (fallback)`;

/**
 * Each item once, in alphabetical order, so the brief lists the models the
 * same way every time.
 * @param {string[]} items
 */
const uniqueSorted = (items) => [...new Set(items)].toSorted();

/**
 * The models that ran, for the brief and the run log.
 * @param {{ models: string[] }[]} runs every model run of the round
 * @param {Models} models the configured models
 */
export function ranModels(runs, models) {
  const configured = new Set([models.finder, models.verifier]);
  const everyModel = runs.flatMap((run) => run.models);
  return uniqueSorted(everyModel).map((model) => modelName(model, configured));
}