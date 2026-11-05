// Runs the finder passes: one model run per lens on the panel, a few at a
// time. Builds each run's role prompt from the code-review skill and its
// input from the diff and the review documents, and collects the findings.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CONCURRENCY, PROMPT_DIR, RUN_LIMITS } from './config.mjs';
import { filePath } from './diff.mjs';
import { buildArgs, runModel } from './runner.mjs';
import { FINDINGS_SCHEMA } from './schemas.mjs';

/** @typedef {import('./diff.mjs').DiffFile} DiffFile */
/** @typedef {import('./merge.mjs').LensFinding} LensFinding */
/** @typedef {import('./runner.mjs').RunResult} RunResult */

/**
 * What every finder pass of a round reads, besides its lens.
 * @typedef {object} ReviewContext
 * @property {DiffFile[]} files the reviewed files
 * @property {string} diffText the reviewed diff
 * @property {string} rules the selected rules, from rulesText
 * @property {string} invariants `.memory-bank/invariants.md` from the base
 * @property {string} acceptedPatterns `.memory-bank/accepted-patterns.md` from the base
 */

/**
 * How a pass runs: model, auth mode, the pull request checkout, and the
 * function that starts a run (a fake in tests).
 * @typedef {object} RunSettings
 * @property {string} model
 * @property {string} authMode
 * @property {string} cwd
 * @property {typeof runModel} [run]
 */

/** Where the shared part of SKILL.md ends: the rest is for the dispatcher. */
const DISPATCHER_HEADING = '\n## For the dispatcher';

const FRONTMATTER = /^---\n[\s\S]*?\n---\n/;

/**
 * The part of the code-review SKILL.md that every lens and role shares:
 * without the frontmatter and without the section for the dispatcher.
 * @param {string} skillText
 */
export function sharedPrompt(skillText) {
  const body = skillText.replace(FRONTMATTER, '');
  const end = body.indexOf(DISPATCHER_HEADING);
  const shared = end === -1 ? body : body.slice(0, end);
  return shared.trim();
}

/**
 * The role prompt of a lens or role: the shared part, then its own file.
 * @param {string} skillText
 * @param {string} roleText the lens or role file
 */
export function rolePrompt(skillText, roleText) {
  return `${sharedPrompt(skillText)}\n\n${roleText.trim()}`;
}

/**
 * Reads the role prompt of a lens or role from the base checkout.
 * @param {string} baseDir root of the base checkout
 * @param {string} name a lens such as `correctness`, or `verifier`
 */
export function readRolePrompt(baseDir, name) {
  const dir = join(baseDir, PROMPT_DIR);
  const read = (file) => readFileSync(join(dir, file), 'utf8');
  return rolePrompt(read('SKILL.md'), read(`${name}.md`));
}

/**
 * A code fence that the text cannot close: one backtick longer than the
 * longest run of backticks in it, and at least three.
 * @param {string} text
 */
export function fence(text) {
  const runs = text.match(/`+/g) ?? [];
  const longest = Math.max(2, ...runs.map((run) => run.length));
  return '`'.repeat(longest + 1);
}

/** @param {DiffFile} file */
const fileLine = (file) =>
  `- \`${filePath(file)}\` (${file.status}, +${file.additions} -${file.deletions})`;

/**
 * The input of one finder pass. The pull request title and description are
 * not part of it: the first pass reads the diff alone.
 * @param {string} lens
 * @param {ReviewContext} context
 */
export function finderInput(lens, context) {
  const diffFence = fence(context.diffText);
  return [
    `Review this diff through the \`${lens}\` lens.`,
    '',
    'The rules, invariants and accepted patterns below come from the base branch. They apply, not the copies in the checkout. The working directory is the pull request checkout: read its files to check the code.',
    '',
    '## Review rules',
    '',
    context.rules || 'No review rule applies to these files.',
    '',
    '## Invariants',
    '',
    context.invariants.trim(),
    '',
    '## Accepted patterns',
    '',
    context.acceptedPatterns.trim(),
    '',
    '## Changed files',
    '',
    ...context.files.map(fileLine),
    '',
    '## Diff',
    '',
    `${diffFence}diff`,
    context.diffText.trimEnd(),
    diffFence,
  ].join('\n');
}

/**
 * Maps the items with an async function, at most `limit` at a time, and
 * keeps the order of the items.
 * @template T, R
 * @param {T[]} items
 * @param {number} limit
 * @param {(item: T) => Promise<R>} fn
 * @returns {Promise<R[]>}
 */
export async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const index = next;
      next += 1;
      results[index] = await fn(items[index]);
    }
  };
  const workers = Math.min(limit, items.length);
  await Promise.all(Array.from({ length: workers }, worker));
  return results;
}

/**
 * The findings of a pass, each with its lens. A run that is ok has an answer
 * that matches FINDINGS_SCHEMA; the check here only guards the hub.
 * @param {string} lens
 * @param {RunResult} result
 * @returns {LensFinding[]}
 */
function lensFindings(lens, result) {
  const findings = result.output?.findings;
  if (!result.ok || !Array.isArray(findings)) {
    return [];
  }
  return findings.map((finding) => ({ lens, ...finding }));
}

/**
 * Runs one finder pass per lens, at most CONCURRENCY at a time. A failed
 * pass does not stop the others; its lens is listed in `failed`.
 * @param {object} options
 * @param {string[]} options.lenses the panel, or the lens of an extra pass
 * @param {Record<string, string>} options.prompts role prompt per lens
 * @param {ReviewContext} options.context
 * @param {RunSettings} options.settings
 * @param {number} [options.concurrency]
 */
export async function runFinderPasses({
  lenses,
  prompts,
  context,
  settings,
  concurrency = CONCURRENCY,
}) {
  const { model, authMode, cwd, run = runModel } = settings;
  const runs = await mapLimit(lenses, concurrency, async (lens) => {
    const args = buildArgs({
      authMode,
      schema: FINDINGS_SCHEMA,
      model,
      limits: RUN_LIMITS.finder,
      systemPrompt: prompts[lens],
    });
    const result = await run({ args, input: finderInput(lens, context), cwd });
    return { lens, ...result };
  });
  return {
    findings: runs.flatMap((result) => lensFindings(result.lens, result)),
    failed: runs.filter((result) => !result.ok).map((result) => result.lens),
    runs,
  };
}