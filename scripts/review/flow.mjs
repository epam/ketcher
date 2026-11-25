// One review round, from the pull request to the posted brief. This is the
// hub's workflow: every step is code, and the model runs are the only steps
// that think. GitHub, git and the model runs come in as arguments, so the
// whole round runs in tests with fakes.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RULE_FILE } from '../agent-docs/rules.mjs';
import { parseDiff as parsePanelDiff, pickPanel } from '../review-panel.mjs';
import {
  DUPLICATES_ROLE,
  LINKED_ISSUE_ROLE,
  VERIFIER_ROLE,
} from './config.mjs';
import { runDeepening } from './deepen.mjs';
import { filePath, parseDiff } from './diff.mjs';
import { runDuplicates } from './duplicates.mjs';
import {
  brief,
  inlineComment,
  limitComment,
  splitForPosting,
} from './format.mjs';
import { freshFindings, rankAndCap } from './merge.mjs';
import { ranModels, reviewLabels } from './models.mjs';
import { readRolePrompt, runFinderPasses } from './passes.mjs';
import { prType } from './pr-type.mjs';
import { rulesText, selectRules } from './rules.mjs';
import { DEEPENING_LENSES } from './schemas.mjs';
import { filterDiff, reviewRange } from './scope.mjs';
import { latestState, nextRound } from './state.mjs';
import { runLinkedIssue, runVerification } from './verify.mjs';

/** @typedef {import('./models.mjs').Models} Models */
/** @typedef {import('./merge.mjs').LensFinding} LensFinding */
/** @typedef {import('./merge.mjs').MergedFinding} MergedFinding */
/** @typedef {import('./diff.mjs').DiffFile} DiffFile */
/** @typedef {import('./passes.mjs').ReviewContext} ReviewContext */
/** @typedef {import('./passes.mjs').RunSettings} RunSettings */
/** @typedef {import('./github.mjs').PullRequest} PullRequest */
/** @typedef {ReturnType<import('./github.mjs').createGitHub>} GitHub */

/**
 * Everything a round needs from outside.
 * @typedef {object} ReviewOptions
 * @property {number} prNumber
 * @property {PullRequest} pr read before the round, for the models and labels
 * @property {GitHub} github
 * @property {string} baseDir the base checkout: prompts, rules, documents
 * @property {string} prDir the pull request checkout: what the runs read
 * @property {Models} models
 * @property {string} authMode
 * @property {boolean} dryRun print instead of posting, change no label
 * @property {LensFinding[]} [savedFindings] finder output of an earlier run
 * @property {typeof import('./runner.mjs').runModel} [run] replaced in tests
 * @property {(text: string) => void} [print] where a dry run writes
 * @property {Record<string, unknown>} [log] filled while the round runs
 */

/**
 * What the round reviews, before any model runs.
 * @typedef {object} RoundInput
 * @property {{ round: number, previousHead?: string, posted: string[] }} plan
 * @property {import('./scope.mjs').Range} range
 * @property {string} base the merge base
 * @property {DiffFile[]} files every file of the reviewed range
 * @property {ReturnType<typeof filterDiff>} diff the files the runs see
 * @property {string[]} lenses the panel
 * @property {ReviewContext} context
 * @property {{ number: number, type: string | null }[]} linkedIssues
 * @property {object[]} ruleErrors rule blocks that did not parse
 */

/** The review documents of the base checkout. */
const DOCS = {
  rules: RULE_FILE,
  invariants: '.memory-bank/invariants.md',
  acceptedPatterns: '.memory-bank/accepted-patterns.md',
};

/** @param {string} baseDir @param {string} path */
const readBase = (baseDir, path) => readFileSync(join(baseDir, path), 'utf8');

/** @param {string[]} items */
const unique = (items) => [...new Set(items)];

/** @param {{ costUsd: number }[]} runs */
const totalCost = (runs) => runs.reduce((sum, run) => sum + run.costUsd, 0);

/**
 * The fingerprints of the findings, with the ones merged into them, so a
 * later round skips every wording of a posted finding.
 * @param {MergedFinding[]} findings
 */
const fingerprints = (findings) =>
  findings.flatMap((finding) => [
    finding.fingerprint,
    ...(finding.absorbed ?? []),
  ]);

/**
 * The commit range of the round. A later round checks that the previous head
 * is still on the branch, and that the merge base is the one that round saw:
 * a base branch merged in since then moved the merge base, and its commits
 * are not this pull request's to review.
 * @param {GitHub} github
 * @param {PullRequest} pr
 * @param {{ round: number, previousHead?: string }} plan
 */
async function roundRange(github, pr, plan) {
  const base = await github.mergeBase(pr.baseSha, pr.headSha);
  const previousHeadIsAncestor = plan.previousHead
    ? await github.isAncestor(plan.previousHead, pr.headSha)
    : false;
  const previousBase = plan.previousHead
    ? await github.mergeBase(pr.baseSha, plan.previousHead)
    : base;
  const range = reviewRange({
    round: plan.round,
    base,
    head: pr.headSha,
    previousHead: plan.previousHead,
    previousHeadIsAncestor,
    baseMoved: previousBase !== base,
  });
  return { base, range };
}

/**
 * What every run of the round reads: the reviewed diff and the review
 * documents from the base, with only the rules whose scope matches. Rule
 * blocks that do not parse come back in `ruleErrors` for the log.
 * @param {string} baseDir
 * @param {ReturnType<typeof filterDiff>} diff
 */
function reviewContext(baseDir, diff) {
  const paths = diff.reviewed.map(filePath);
  const selected = selectRules(readBase(baseDir, DOCS.rules), paths);
  /** @type {ReviewContext} */
  const context = {
    files: diff.reviewed,
    diffText: diff.text,
    rules: rulesText(selected.rules),
    invariants: readBase(baseDir, DOCS.invariants),
    acceptedPatterns: readBase(baseDir, DOCS.acceptedPatterns),
  };
  return { context, ruleErrors: selected.findings };
}

/**
 * The lenses the panel script picks for the reviewed diff.
 * @param {string} diffText
 */
const panelLenses = (diffText) =>
  pickPanel(parsePanelDiff(diffText)).map((item) => item.lens);

/**
 * Reads everything the round reviews: the range, the diff, the panel, the
 * context and the linked issues.
 * @param {ReviewOptions} options
 * @param {PullRequest} pr
 * @param {RoundInput['plan']} plan
 * @returns {Promise<RoundInput>}
 */
async function readRound({ github, baseDir, prNumber }, pr, plan) {
  const { base, range } = await roundRange(github, pr, plan);
  const files = parseDiff(await github.diff(range.from, range.to));
  const diff = filterDiff(files);
  const { context, ruleErrors } = reviewContext(baseDir, diff);
  const linkedIssues = await github.linkedIssues(prNumber);
  const lenses = panelLenses(diff.text);
  return {
    plan,
    range,
    base,
    files,
    diff,
    lenses,
    context,
    linkedIssues,
    ruleErrors,
  };
}

/**
 * The role prompt of every panel lens and of both deepening lenses, from the
 * base checkout.
 * @param {string} baseDir
 * @param {string[]} lenses
 */
function lensPrompts(baseDir, lenses) {
  const names = unique([...lenses, ...DEEPENING_LENSES]);
  return Object.fromEntries(
    names.map((name) => [name, readRolePrompt(baseDir, name)]),
  );
}

/**
 * The run settings of both roles.
 * @param {ReviewOptions} options
 * @returns {{ finder: RunSettings, verifier: RunSettings }}
 */
function roleSettings({ models, authMode, prDir, run }) {
  const common = { authMode, cwd: prDir, run };
  return {
    finder: { ...common, model: models.finder },
    verifier: { ...common, model: models.verifier },
  };
}

/**
 * The finder findings of the round: the saved ones when given, else one pass
 * per lens.
 * @param {LensFinding[] | undefined} savedFindings
 * @param {Parameters<typeof runFinderPasses>[0]} pass
 */
async function finderFindings(savedFindings, pass) {
  if (savedFindings) {
    return { findings: savedFindings, failed: [], runs: [] };
  }
  return runFinderPasses(pass);
}

/**
 * The linked-issue answer for the brief. The first linked issue is asked
 * about. A run without an answer still names the issue, so the brief says
 * that the check gave no answer.
 * @param {ReviewOptions} options
 * @param {{ linkedIssues: { number: number }[], confirmed: MergedFinding[], context: ReviewContext, settings: RunSettings }} step
 */
async function linkedIssueStep({ github, baseDir }, step) {
  const [first] = step.linkedIssues;
  const issue = first ? await github.issue(first.number) : undefined;
  const result = await runLinkedIssue({
    issue,
    confirmed: step.confirmed,
    prompt: readRolePrompt(baseDir, LINKED_ISSUE_ROLE),
    context: step.context,
    settings: step.settings,
  });
  const answer = result.answer ?? (issue && { number: issue.number });
  return { ...result, answer };
}

/**
 * The findings of the round that go to verification: new ones only, with
 * the duplicates merged, ranked and capped.
 * @param {ReviewOptions} options
 * @param {{ findings: LensFinding[], posted: string[], settings: RunSettings }} step
 */
async function prepareForVerification({ baseDir }, step) {
  const { fresh } = freshFindings(step.findings, step.posted);
  const duplicates = await runDuplicates({
    findings: fresh,
    prompt: readRolePrompt(baseDir, DUPLICATES_ROLE),
    settings: step.settings,
  });
  const { toVerify, overflow } = rankAndCap(duplicates.findings);
  return { toVerify, overflow, duplicates };
}

/**
 * The model runs of a round: finders, duplicates, verification, deepening
 * and the linked issue.
 * @param {ReviewOptions} options
 * @param {RoundInput} input
 */
async function runModels(options, { lenses, context, plan, linkedIssues }) {
  const settings = roleSettings(options);
  const prompts = lensPrompts(options.baseDir, lenses);
  const verifierPrompt = readRolePrompt(options.baseDir, VERIFIER_ROLE);

  const finders = await finderFindings(options.savedFindings, {
    lenses,
    prompts,
    context,
    settings: settings.finder,
  });
  const prepared = await prepareForVerification(options, {
    findings: finders.findings,
    posted: plan.posted,
    settings: settings.verifier,
  });
  const verification = await runVerification({
    findings: prepared.toVerify,
    prompt: verifierPrompt,
    context,
    settings: settings.verifier,
  });
  const merged = [...prepared.toVerify, ...prepared.overflow];
  const deepening = await runDeepening({
    confirmed: verification.confirmed,
    findings: finders.findings,
    known: [...plan.posted, ...fingerprints(merged)],
    verified: prepared.toVerify.length,
    prompts,
    verifierPrompt,
    context,
    finderSettings: settings.finder,
    verifierSettings: settings.verifier,
  });
  const confirmed = [...verification.confirmed, ...deepening.confirmed];
  const linked = await linkedIssueStep(options, {
    linkedIssues,
    confirmed,
    context,
    settings: settings.verifier,
  });
  const { duplicates } = prepared;
  return { finders, duplicates, verification, deepening, confirmed, linked };
}

/** @typedef {Awaited<ReturnType<typeof runModels>>} ModelResults */

/**
 * Every model run of the round, for the cost and the models that ran.
 * @param {ModelResults} results
 */
function allRuns({ finders, duplicates, verification, deepening, linked }) {
  const singleRuns = [duplicates.run, linked.run].filter(Boolean);
  return [
    ...finders.runs,
    ...verification.runs,
    ...deepening.runs,
    ...singleRuns,
  ];
}

/**
 * The passes that gave no result, for the brief.
 * @param {ModelResults} results
 */
function failedPasses({
  finders,
  duplicates,
  verification,
  deepening,
  linked,
}) {
  return [
    ...finders.failed,
    ...duplicates.failed,
    ...verification.failed,
    ...deepening.failed,
    ...linked.failed,
  ];
}

/**
 * The files of the whole pull request, for the PR type. A full round already
 * has them, so the diff is not read twice.
 * @param {GitHub} github
 * @param {PullRequest} pr
 * @param {RoundInput} input
 */
async function pullRequestFiles(github, pr, { base, range, files }) {
  if (range.kind === 'full') {
    return files;
  }
  return parseDiff(await github.diff(base, pr.headSha));
}

/**
 * What the round posts: the inline comments and the brief.
 * @param {ReviewOptions} options
 * @param {PullRequest} pr
 * @param {RoundInput} input
 * @param {ModelResults} results
 */
async function roundOutput(options, pr, input, results) {
  const split = splitForPosting(results.confirmed, input.diff.reviewed);
  const files = await pullRequestFiles(options.github, pr, input);
  const posted = unique([
    ...input.plan.posted,
    ...fingerprints(results.confirmed),
  ]);
  /** @type {import('./format.mjs').BriefInput} */
  const briefInput = {
    state: { round: input.plan.round, head: pr.headSha, posted },
    range: input.range,
    linkedIssue: results.linked.answer,
    prType: prType({
      linkedIssues: input.linkedIssues,
      files,
      labels: pr.labels,
    }),
    panel: input.lenses,
    models: ranModels(allRuns(results), options.models),
    findings: results.confirmed,
    overflow: split.overflow,
    outsideDiff: split.outsideDiff,
    failedPasses: failedPasses(results),
    skippedFiles: input.diff.skipped.length,
  };
  return {
    comments: split.inline.map(inlineComment),
    findings: split.inline,
    briefText: (failure) =>
      brief({
        ...briefInput,
        inlineFailure: failure?.error,
        inline: failure?.findings,
      }),
  };
}

/**
 * Posts the round, or prints it on a dry run. The brief is written after the
 * inline review, so that it can name a review GitHub refused and carry the
 * findings that got no inline comment.
 * @param {ReviewOptions} options
 * @param {PullRequest} pr
 * @param {{ comments: { path: string, line: number, body: string }[], briefText: (inlineFailure?: string) => string }} output
 */
async function publish({ github, prNumber, dryRun, print }, pr, output) {
  if (dryRun) {
    for (const comment of output.comments) {
      print(`--- ${comment.path}:${comment.line}\n${comment.body}\n`);
    }
    print(output.briefText());
    return;
  }
  const failure = await postInline(github, prNumber, pr, output);
  await github.postComment(prNumber, output.briefText(failure));
}

/** @typedef {{ error: string, findings: MergedFinding[] }} InlineFailure */

/** @param {any} error */
const message = (error) => String(error?.message ?? error);

/** @param {any} error the HTTP status of a GitHub error, when it has one */
const httpStatus = (error) => error?.status ?? error?.response?.status;

/**
 * Sends the inline comments as one review, and gives back what stayed out
 * instead of throwing. The brief carries the round state in its marker, so it
 * has to go out even when GitHub takes no comment: a round that posts nothing
 * is paid for, is not counted, and is repeated by the next round.
 *
 * GitHub answers 422 for a review whose comments it will not take, and it
 * takes a review whole or not at all, so one comment on a line the pull
 * request diff does not hold would keep every other finding off the pull
 * request. The comments are then sent one by one, and only the ones GitHub
 * refuses again go to the brief. Another status is not about a single
 * comment, so it is reported as it is.
 * @param {GitHub} github
 * @param {number} prNumber
 * @param {PullRequest} pr
 * @param {{ comments: { path: string, line: number, body: string }[], findings: MergedFinding[] }} output
 * @returns {Promise<InlineFailure | undefined>}
 */
async function postInline(github, prNumber, pr, output) {
  try {
    await github.postReview(prNumber, {
      commitId: pr.headSha,
      comments: output.comments,
    });
    return undefined;
  } catch (error) {
    if (httpStatus(error) === 422) {
      return postOneByOne(github, prNumber, pr, output);
    }
    return { error: message(error), findings: output.findings };
  }
}

/**
 * Posts each inline comment on its own, after GitHub refused them as one
 * review, and gives back the findings whose comment it refused again.
 * @param {GitHub} github
 * @param {number} prNumber
 * @param {PullRequest} pr
 * @param {{ comments: { path: string, line: number, body: string }[], findings: MergedFinding[] }} output
 * @returns {Promise<InlineFailure | undefined>}
 */
async function postOneByOne(github, prNumber, pr, output) {
  const refused = [];
  for (const [index, comment] of output.comments.entries()) {
    try {
      await github.postReviewComment(prNumber, {
        commitId: pr.headSha,
        comment,
      });
    } catch (error) {
      refused.push({ finding: output.findings[index], error });
    }
  }
  if (refused.length === 0) {
    return undefined;
  }
  return {
    error: message(refused[0].error),
    findings: refused.map((item) => item.finding),
  };
}

/**
 * The run log of a reviewed round.
 * @param {RoundInput} input
 * @param {ModelResults} results
 * @param {Models} models
 */
function roundLog(input, results, models) {
  const runs = allRuns(results);
  return {
    range: input.range,
    panel: input.lenses,
    skipped: input.diff.skipped,
    ruleErrors: input.ruleErrors,
    findings: results.finders.findings,
    duplicates: results.duplicates.merged,
    verifierRuns: results.verification.runs,
    dropped: results.verification.dropped,
    deepening: results.deepening.passes,
    confirmed: results.confirmed,
    linkedIssue: results.linked.answer,
    failed: failedPasses(results),
    ranModels: ranModels(runs, models),
    costUsd: totalCost(runs),
  };
}

/**
 * The round between reading the pull request and removing the labels.
 * After the last round it posts the limit comment and runs no model.
 * @param {ReviewOptions & { log: Record<string, unknown> }} options
 * @param {PullRequest} pr
 */
async function reviewRound(options, pr) {
  const { github, prNumber, models, log } = options;
  const plan = nextRound(latestState(await github.comments(prNumber)));
  Object.assign(log, {
    pr: prNumber,
    head: pr.headSha,
    round: plan.round,
    models,
  });
  if (plan.limitReached) {
    log.limitReached = true;
    await publish(options, pr, {
      comments: [],
      findings: [],
      briefText: () => limitComment(),
    });
    return;
  }
  const input = await readRound(options, pr, plan);
  const results = await runModels(options, input);
  const output = await roundOutput(options, pr, input, results);
  Object.assign(log, roundLog(input, results, models));
  await publish(options, pr, output);
}

/**
 * Removes the review labels. A failed removal goes to the log, so it does
 * not hide an error of the round itself.
 * @param {ReviewOptions & { log: Record<string, unknown> }} options
 * @param {string[]} labels
 */
async function removeLabels({ github, prNumber, dryRun, log }, labels) {
  if (dryRun) {
    return;
  }
  const results = await Promise.allSettled(
    labels.map((label) => github.removeLabel(prNumber, label)),
  );
  log.labelErrors = results
    .filter((result) => result.status === 'rejected')
    .map((result) => String(result.reason));
}

/**
 * Runs one review round. The review labels come off at the end, also when
 * the round fails, so adding a label again starts the next round.
 * @param {ReviewOptions} options
 * @returns {Promise<Record<string, unknown>>} the run log
 */
export async function runReview(options) {
  const log = options.log ?? {};
  const settings = { ...options, print: options.print ?? console.log, log };
  try {
    await reviewRound(settings, options.pr);
  } finally {
    await removeLabels(settings, reviewLabels(options.pr.labels));
  }
  return log;
}
