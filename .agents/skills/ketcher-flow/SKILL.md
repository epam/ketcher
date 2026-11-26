---
name: ketcher-flow
description: 'Route a Ketcher scope (a feature, a bug, a refactor, a small change, a list of symptoms, a batch of tasks of any kinds, or open PRs with review comments) to its flow and run it to a reviewed PR.'
disable-model-invocation: true
---

# Ketcher flow

You have a **scope**: whatever the user wants done. First you name its **kind**. The kind picks the **flow** file you read and run.

## Reference

A file named without a link lives in `flows/` (one per kind), `roles/` (what a dispatched subagent follows), or `shared/` (what flows and roles both read). Read these when the step you are on needs them:

- [LOCATIONS.md](shared/LOCATIONS.md): the run directory, worktrees, `<base>`, branches. Read before the first run directory or worktree.
- [TRACKER.md](shared/TRACKER.md): GitHub issues, the PR title and body, comments. Read when a flow reads, files, or comments on issues, or opens a PR.
- [REVIEW.md](shared/REVIEW.md): the cleanup, the reviewer panel, and the review rounds. Read when the flow reaches its review step.
- [ROLES.md](roles/ROLES.md): the roles a flow dispatches and the model each one runs on, per tool. Read before the first dispatch.
- [QUALITY.md](shared/QUALITY.md): how code is shaped, written, tested, fixed, and reviewed. Every implementer and reviewer dispatch carries its path.

The flows call three vendored skills at fixed steps: `diagnosing-bugs` and `tdd` (from [RED.md](shared/RED.md)) and `codebase-design` (for _Design It Twice_). The Ketcher specifics live in the flow file that calls them, and win where the two differ. Call them with your tool's skill command, or read their `SKILL.md` when it has none.

## Kinds

Read the request and the conversation. Take the first row that fits:

| The scope is                                                                                                                                     | Kind          | Flow                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- | ---------------------------------- |
| open PRs with review comments to address: PR numbers, or "follow up on my PRs"                                                                   | **follow-up** | [FOLLOW-UP.md](flows/FOLLOW-UP.md) |
| two or more **symptoms**: what the user saw go wrong while testing by hand, one per line, in their words                                         | **symptoms**  | [HUNT.md](flows/HUNT.md)           |
| two or more tasks, of any kinds: issue numbers, a list, or a query such as "fix the open bugs"                                                   | **batch**     | [BATCH.md](flows/BATCH.md)         |
| one wrong behavior, in prose or as one issue                                                                                                     | **bug**       | [BUG.md](flows/BUG.md)             |
| new or changed product behavior: a feature request, an OpenSpec change, or a goal in the conversation, including one that also names bugs        | **feature**   | [FEATURE.md](flows/FEATURE.md)     |
| a change to structure that keeps behavior and moves an interface or spans modules: extract, move, dedupe, simplify, rewrite a file in TypeScript | **refactor**  | [REFACTOR.md](flows/REFACTOR.md)   |
| one reason, one PR, and no user sees a difference: a lint-rule cleanup, an `any` removal, copy, config, a dependency bump, docs                  | **small**     | [SMALL.md](flows/SMALL.md)         |

A feature scope that names bugs in the behavior it adds or changes stays one feature run. Each such bug becomes a task with `Kind: bug`, as FEATURE.md says. A bug elsewhere is a second task, and the scope is a batch.

A scope whose diff will qualify as a large-scale change (the _Qualifies_ rule in [review-workflow.md](../../../.memory-bank/review-workflow.md#large-scale-change-protocol)) runs its flow and also follows that protocol: the split decision comes before the first branch.

When the scope is an issue, check that no open PR already closes it before the first branch: `gh pr list --state open --json number,title,closingIssuesReferences`. When one does, name the PR to the user and stop. A batch drops such issues itself (BATCH.md step 1).

When no row fits, ask the user, offering the kinds that fit. Done when you have told the user the kind in one line ("Kind: bug, #12365") and read its flow file. Then run the flow.

## Where a flow stops

Code on a branch, a draft PR, and files in the run directory are reversible, so a flow goes on without asking. It stops for the user only at a decision that is theirs (product or design) or a write other people see on the tracker, and decides and records everything else. Each flow names its stops, on top of the open-PR stop in _Kinds_:

| Kind          | Stops                                                                         |
| ------------- | ----------------------------------------------------------------------------- |
| **follow-up** | a comment that needs a product decision, posting the replies (FOLLOW-UP.md)   |
| **bug**       | the escalations in BUG.md                                                     |
| **small**     | none                                                                          |
| **feature**   | the proposal (FEATURE.md step 3)                                              |
| **refactor**  | `target.md` and the worktree choice (REFACTOR.md step 2)                      |
| **symptoms**  | the issues to file (HUNT.md step 4)                                           |
| **batch**     | a large input set, its tasks' stops in one message, tracker writes (BATCH.md) |

## Dispatched by a batch

A batch dispatches you as a **task orchestrator**: one task, a **task run directory** `<batch run dir>/<id>/`, the baseline path, a port block, and the roles table with the user's overrides. Run the task as one flow:

1. **Triage.** When your tool gives you no way to dispatch a subagent, report `cannot dispatch` and end. Otherwise create the task worktree as [LOCATIONS.md](shared/LOCATIONS.md) says, then follow [TRIAGE.md](roles/TRIAGE.md). An outcome other than `ready` ends the run: remove the worktree, delete its branch, and report the outcome.
2. **Flow.** Read the flow file of the kind triage named and run it whole, with the task run directory as its run directory. Use the baseline you were given in place of saving one, and take every app port from your block. At a gate, put only the work in `stop.md`: the roles table and the worktree choice come with the dispatch.
3. **Stops.** At each stop of the flow, write what you would show the user to `<task run dir>/stop.md`, and end with the report `stopped: <step>`. The batch resumes you with the user's answer: go on from that step.
4. **Report** when the flow ends: the PR, one outcome line for the run report, the paths the branch changed, and the Lessons. Put the brief (_The brief_ in [BATCH.md](flows/BATCH.md)) at the top of the PR body. Draft tracker comments in `<task run dir>/comment.md` in place of posting them.

Done when you have reported `stopped: <step>` or the final report.

## Checks

The repo's **checks** are its full validation:

- `npm test` from the root.
- `npm run test:types` when `example/` or `demo/` changed.
- `npm run check:agent-docs` when `AGENTS.md`, `.memory-bank/`, `.agents/`, or `.claude/` changed.
- `npx openspec validate --all --strict` when `openspec/` changed.

Playwright E2E runs in CI. Run only the specs a change touches locally (`.memory-bank/testing/testing.md` says how).

A check can already fail on `<base>`, so compare, never count. Each run saves a **baseline** once, before its first fix: every check's output on `<base>` in `<run dir>/baseline/<check>.txt`. A branch passes a check when its output adds no failing line the baseline lacks. Name the pre-existing failures rather than folding them into the work.

A test that times out only while several builds run at once is load, not code. Assertion failures and missing exports are real.

## Proof in the app

Every change a user can see in the editor is proven with the `verify-ketcher` skill ([its SKILL.md](../verify-ketcher/SKILL.md)) before review: the **verifier** role follows [VERIFY.md](roles/VERIFY.md). The verdict and its evidence go in the PR body, as `ketcher-pr` says.

## Landing

Every flow ends in a PR on its own branch, per [TRACKER.md](shared/TRACKER.md): you commit, push, and open it without asking (`AGENTS.md`, Git and commits). A change that alters what the canvas draws also runs [SNAPSHOTS.md](shared/SNAPSHOTS.md) once the PR is open. You never merge.

Every flow's final report ends with **Lessons**: each blocker or major that review found and that a rule could have caught before review (a lint rule, a rule in [review-rules.md](../../../.memory-bank/review-rules.md), a line in [QUALITY.md](shared/QUALITY.md)), with the rule you would add. Propose it only: a new rule is a scope of its own, not part of this PR. Write `Lessons: none` when no finding fits.
