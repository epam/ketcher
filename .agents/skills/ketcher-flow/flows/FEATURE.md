# Feature

The **feature** kind of [SKILL.md](../SKILL.md). New behavior runs through OpenSpec: the change folder in `openspec/changes/<change>/` is the spec, its `tasks.md` is the task graph, and archiving it updates `openspec/specs/`.

The run ends in one PR that implements the whole change on one branch, with one **gate**: the user approves the proposal before any code is written.

The tickets carry the task graph's blocking edges, and the **frontier** is the tickets ready to run.

## Bug tasks

A ticket whose work is a wrong behavior, not new behavior, starts with the line `Kind: bug`. Its implementer follows [RED.md](../shared/RED.md) first, as IMPLEMENT.md says. Carry a bug the implementer reports green everywhere to the user at the end.

## Steps

1. **Source.** Create the run directory, slug `feature-<topic>`, and the task worktree, as [LOCATIONS.md](../shared/LOCATIONS.md) says. Find what already exists:
   - an OpenSpec change named in the conversation or in `openspec/changes/`: read its `proposal.md`, spec deltas, `design.md`, and `tasks.md`, then go to step 3;
   - a `Feature` issue or a goal in the conversation: go to step 2;

2. **Propose.** Run the `openspec-propose` skill ([its SKILL.md](../../openspec-propose/SKILL.md)) on the issue or the goal, with the rules in `openspec/config.yaml`. Read the specs the change touches in `openspec/specs/` first, so each delta names the requirement it changes. Done when `npx openspec validate <change> --strict` passes.

3. **Gate.** Show the user the proposal: why, what changes, the spec deltas as WHEN/THEN, and the task list. Ask in the same message:
   - whether to change anything;
   - the roles table from [ROLES.md](../roles/ROLES.md), with the model you run on, taking overrides for any row;
   - whether implementers each get their own worktree (the default, per _Worktrees_ in LOCATIONS.md) or share the branch;
   - when the tasks include E2E tests, whether to write those Playwright specs.

   Then **stop**. When the user asks for changes, revise the change and show it again. Done when the user approves: step 4 opens on that reply.

4. **Explore** (optional). Dispatch an **explorer** for code or docs the tasks need. It writes notes to `<run dir>/notes/`, which every later subagent reads by path. Done when every note the tickets need exists.

5. **Tickets.** Slice `tasks.md` into tickets, one file per ticket in `<run dir>/tickets/`. Each names the task numbers it covers, its acceptance lines (the spec scenarios those tasks implement), the tickets it is blocked on, and its **write scope** (the paths it may change). E2E specs are their own tickets, written when the user said yes to them at the step 3 gate. For a new spec file, [testing.md](../../../../.memory-bank/testing/testing.md) also requires an approved E2E test plan, so split it into a plan ticket and a spec ticket blocked on it. When the plan ticket merges, show the plan to the user and dispatch the spec ticket on their approval. Done when every task is in exactly one ticket.

6. **Design.** Give every ticket its **shape**: the types and the structure that organizes them, per _Shape first_ in [QUALITY.md](../shared/QUALITY.md). Start from `design.md`.
   - A ticket that adds or changes an interface other modules call (the public `Ketcher` API, an editor or operation interface, a serializer) goes through _Design It Twice_ from the vendored `codebase-design` skill ([DESIGN-IT-TWICE.md](../../codebase-design/DESIGN-IT-TWICE.md)), with **designers** as its sub-agents and glossary.md as its `GLOSSARY.md`. Show the user the comparison and your pick, and go on with the pick unless they reply. Write it into the ticket with the usage example the winning design gave, and record a decision that changes `design.md` there too.
   - A ticket inside one module gets its shape from you directly, in two or three lines.

   Done when every ticket names its shape.

7. **Plan the dispatch.** Write `<run dir>/plan.md`, four lines, each filled in or marked `n/a: <reason>`:
   - **First**: tickets that must land before any fan-out (shared types, a new domain entity).
   - **Parallel**: tickets whose write scopes do not overlap.
   - **Shared files**: every path two tickets' write scopes both name. Resolve each: add a blocking edge, or merge the two tickets.
   - **Split**: why this is the smallest safe decomposition, or why one implementer is best.

   `tasks.md` itself is in no write scope: you tick its boxes when a ticket merges.

   Done when no two tickets on the same frontier share a path.

8. **Draft PR.** Commit the change folder as the first commit in the task worktree, push, and open a draft PR, per TRACKER.md. Done when the draft PR exists.

9. **Implement.** Save the _Checks_ baseline. Dispatch an **implementer** per ticket on the frontier, each with [IMPLEMENT.md](../roles/IMPLEMENT.md), its ticket file, `<run dir>/notes/`, and its worktree or the shared branch. Done when every ticket on the frontier has an implementer.

10. **Merge.** When an implementer reports, dispatch a **merger** with [MERGE.md](../roles/MERGE.md), the implementer's branch, and the path of the task worktree (it holds the PR branch). On a shared branch, skip the merger: the implementer committed there. Then tick the ticket's tasks in `tasks.md` and commit that. When a frontier changes, go to step 9 for the newly ready tickets.

    An implementer that reports **shape misfit** merges nothing. Take its ticket back to step 6 with the report as evidence. When two tickets report the same misfit, the shared design is wrong: redesign every ticket built on it.

    Done when every ticket is merged and every task in `tasks.md` is ticked.

11. **Verify** on the PR branch: dispatch a **verifier** with [VERIFY.md](../roles/VERIFY.md) and the change's spec deltas as the spec. A `fail` becomes a fix by a new implementer, then verify again. A `could not run` is not a pass: carry it to the PR and the final report. Done when the verdict is `pass`, `n/a`, or `could not run`.

12. **Archive.** Run the `openspec-archive-change` skill ([its SKILL.md](../../openspec-archive-change/SKILL.md)). Then update the memory bank, as `AGENTS.md` says: the feature summary in `.memory-bank/features/`, and the `modules/`, `domain.md`, or `glossary.md` entries the change made true. Done when `npx openspec validate --all --strict` and `npm run check:agent-docs` pass, and the archive is one commit.

13. **Review.** Follow [REVIEW.md](../shared/REVIEW.md) with the archived change folder as the spec, so the archive and the memory-bank edits are reviewed with the code. A fresh implementer does the cleanup, and a fresh one fixes each round's findings. Done when REVIEW.md's rounds have stopped.

14. **Ready.** Update the PR body (the memory-bank files, "Verified in the app"), mark it ready, and remove this run's worktrees. Report: the PR, the verify verdict, the review outcome, and anything left open.
