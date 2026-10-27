---
name: ketcher-flow
description: 'Route a Ketcher scope (a feature, a bug, a refactor, a small change, a list of symptoms, or a set of open bugs) to its flow and run it to a reviewed PR.'
disable-model-invocation: true
---

# Ketcher flow

You have a **scope**: whatever the user wants done. First you name its **kind**. The kind picks the **flow** file you read and run.

## Reference

Read these when the step you are on needs them:

- [LOCATIONS.md](LOCATIONS.md): the run directory, worktrees, `<base>`, branches. Read before the first run directory or worktree.
- [TRACKER.md](TRACKER.md): GitHub issues, the PR title and body, comments. Read when a flow reads, files, or comments on issues, or opens a PR.
- [ROLES.md](ROLES.md): the roles a flow dispatches and the model each one runs on, per tool. Read before the first dispatch.
- [QUALITY.md](QUALITY.md): how code is shaped, written, tested, fixed, and reviewed. Every implementer and reviewer dispatch carries its path.

The flows call three vendored skills from `mattpocock/skills`, at fixed steps: `diagnosing-bugs` and `tdd` (from [RED.md](RED.md)) and `codebase-design` (for _Design It Twice_). They are pinned and never edited: the Ketcher specifics live in the flow file that calls them, and win where the two differ. Call them with your tool's skill command, or read their `SKILL.md` when it has none.

## Kinds

Read the request and the conversation. Take the first row that fits:

| The scope is                                                                                                                                     | Kind         | Flow                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------ | -------------------------- |
| two or more **symptoms**: what the user saw go wrong while testing by hand, one per line, in their words                                         | **symptoms** | [HUNT.md](HUNT.md)         |
| several open GitHub issues of type `Bug`, or "fix the open bugs"                                                                                 | **backlog**  | [SWEEP.md](SWEEP.md)       |
| one wrong behavior, in prose or as one issue                                                                                                     | **bug**      | [BUG.md](BUG.md)           |
| new or changed product behavior: a feature request, an OpenSpec change, or a goal in the conversation, including one that also names bugs        | **feature**  | [FEATURE.md](FEATURE.md)   |
| a change to structure that keeps behavior and moves an interface or spans modules: extract, move, dedupe, simplify, rewrite a file in TypeScript | **refactor** | [REFACTOR.md](REFACTOR.md) |
| one reason, one PR, and no user sees a difference: a lint-rule cleanup, an `any` removal, copy, config, a dependency bump, docs                  | **small**    | [SMALL.md](SMALL.md)       |

A feature scope that names bugs in the behavior it adds or changes stays one feature run. Each such bug becomes a task with `Kind: bug`, as FEATURE.md says. A bug elsewhere is a second scope.

A scope whose diff will qualify as a large-scale change (the _Qualifies_ rule in [review-workflow.md](../../../.memory-bank/review-workflow.md#large-scale-change-protocol)) runs its flow and also follows that protocol: the split decision comes before the first branch.

When no row fits, or the scope holds two unrelated kinds side by side (one bug and one new behavior), ask the user, offering the kinds that fit. Done when you have told the user the kind in one line ("Kind: bug, #12365") and read its flow file. Then run the flow.

## Checks

The repo's **checks** are its full validation:

- `npm test` from the root: prettier, eslint, types, circular imports, and Jest in the four packages.
- `npm run test:types` when `example/` or `demo/` changed.
- `npm run check:agent-docs` when `AGENTS.md`, `.memory-bank/`, `.agents/`, or `.claude/` changed.
- `npx openspec validate --all --strict` when `openspec/` changed.

Playwright E2E runs in CI. Run only the specs a change touches locally (`.memory-bank/testing/testing.md` says how).

A check can already fail on `<base>`, so compare, never count. Each run saves a **baseline** once, before its first fix: every check's output on `<base>` in `<run dir>/baseline/<check>.txt`. A branch passes a check when its output adds no failing line the baseline lacks. Name the pre-existing failures rather than folding them into the work.

A test that times out only while several builds run at once is load, not code. Assertion failures and missing exports are real.

## Proof in the app

Every change a user can see in the editor is proven with the `verify-ketcher` skill ([its SKILL.md](../verify-ketcher/SKILL.md)) before review: the **verifier** role follows [VERIFY.md](VERIFY.md). The verdict and its evidence go in the PR under "Verified in the app".

## Review

Review runs from the branch's worktree, against the run's spec (the issue, the report, the OpenSpec change, or `target.md`), in this order:

1. **Cleanup.** An **implementer** reads the diff since the branch point against _Write_ in [QUALITY.md](QUALITY.md) and removes what a careful author would not have written: narrating comments, defensive checks inside trusted code, casts that only silence the compiler, leftover debug output. Behavior stays the same and the checks still pass against the baseline. Done when the cleanup is one commit, or the diff had nothing to clean.

2. **Round 1.** Pick the round's **panel** from the table below by reading `git diff <branch point>...HEAD`, and tell the user the panel in one line, naming who is off the panel and why ("Panel: spec, code-quality. No render or tool code, no input parsing, no public API"). When a trigger might match, the reviewer is on the panel. Dispatch the panel as fresh **reviewers** in parallel on that diff.

   | Reviewer                          | On the panel when the diff                                                                                                                                               |
   | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
   | **spec reviewer**                 | always. Its dispatch is the spec path and _Review lens_ in QUALITY.md: does the diff do what the spec asks, all of it, and nothing it does not?                             |
   | `code-quality-reviewer`           | changes code, tests included                                                                                                                                             |
   | `performance-reviewer`            | changes rendering, a tool or pointer handler, a loop over atoms, bonds, or monomers, a call to Indigo, or an import in a published package                               |
   | `documentation-accuracy-reviewer` | changes behavior a user can see, a package's exports, a public interface named in a `.memory-bank/modules/` doc, KET reading or writing, or a README example             |
   | `security-code-reviewer`          | changes an HTML sink, code built from a string, the reading of opened, pasted, or dropped text, a handler on the Indigo worker boundary, or a service URL, key, or token |

   The four agents live in `.claude/agents/`, and each file is its reviewer's instructions. Every finding follows the [output contract](../../../.memory-bank/review-workflow.md#output-contract). Check each one against the code and drop those whose failing scenario does not hold.

3. **Fix.** Every finding ends fixed in a new commit or declined with a one-line reason. The flow names which implementer fixes. Blockers and majors are fixed. Batch accepted nits into one commit or decline them.

4. **Next round.** Review again with the commit before the fixes as the branch point, so the round reads only the fix diff. Its panel is the spec reviewer, each reviewer whose finding the fixes address, and any reviewer whose trigger the fix diff matches. Stop when a round has nothing left to act on. After round 3, stop anyway and report the open findings, what kind of failure they point to (a wrong shape, a missing test, a misread spec), and your recommendation.

A **reviewer** reads a diff it did not write. That separation is the point of the role, so every round goes to fresh reviewers, as [ROLES.md](ROLES.md) says.

A finding that reveals a new bug is a new scope of kind bug, not work added here: list it in the final report.

## Landing

Every flow ends in a PR on its own branch, per [TRACKER.md](TRACKER.md): you commit, push, and open it without asking (`AGENTS.md`, Git and commits). The PR body fills the PR template, names the memory-bank file the PR updated or says "Memory bank: not needed", and carries "Verified in the app". You never merge.
