# Batch

The **batch** kind of [SKILL.md](../SKILL.md): two or more **tasks**, of any kind (bug, small, feature, refactor), run by one orchestrator across subagents. Each task goes through its own flow file. The batch decides the order and the parallelism, and asks the user at fixed points. You end with one PR per task, or a handoff to a session of its own, and one **brief** per PR.

You dispatch every role, including the ones a flow file's steps dispatch. The work a single flow does alone (fix a bug, make a small change) goes to an **implementer** as a ticket.

## Stops

Ask the user only at the batch stops in _Where a flow stops_ in [SKILL.md](../SKILL.md): the large input set (step 1), the gate (step 4), the paused tasks' questions (step 7), and the tracker writes and worktree cleanup (step 10). Run everything else without them.

Subagents draft every comment in `<run dir>/comments/` and write nothing on GitHub themselves. You post the drafts in step 10.

## Limits

- **Triage**: at most 5 diagnosers at once.
- **Work**: at most 3 implementers and verifiers at once, across all tasks. Count tickets, not tasks: a feature with three ready tickets takes three places.
- **In the batch**: at most one refactor, and features of at most 5 tickets. A larger feature gets the gate here and runs in a session of its own (step 5).

## Steps

1. **Intake.** Create the run directory, slug `batch-<YYYY-MM-DD-HHMM>`. The input is one of:
   - issue numbers the user named;
   - tasks in prose: write each to `<run dir>/tasks/<k>.md` in the user's words;
   - a query: "fix the open bugs" lists the open bugs as TRACKER.md says; other queries go through `gh issue list --search`.

   Drop issues an open PR already closes (`gh pr list --state open --json closingIssuesReferences`) and issues labeled `waiting user reply` or `Questions remain`. When more than 20 remain, show the count by type and area label and ask the user which to take (an area, a priority, or the 20 newest). Then save the _Checks_ baseline: `git fetch origin`, then `git worktree add --detach <root>/.ketcher-flow/worktrees/baseline <base>`, installed as LOCATIONS.md says. Done when you hold the task list and `<run dir>/baseline/` holds every check's output.

2. **Triage.** For each task, create a detached triage worktree, `git worktree add --detach <root>/.ketcher-flow/worktrees/triage-<id> <base>`, and install it. Dispatch one **diagnoser** per task, each with [TRIAGE.md](../roles/TRIAGE.md), its task, its triage worktree, and the run directory. _Parallel runs_ in [VERIFY.md](../roles/VERIFY.md) gives each its port. A task whose outcome is not `ready` leaves the batch for the report. For each `ready` task, create a worktree, `git worktree add -b <branch> <root>/.ketcher-flow/worktrees/<id> <base>`, with the branch named as LOCATIONS.md says, and install it. Done when every task has `<run dir>/triage/<id>.md` and every `ready` task has its worktree.

3. **Prepare the gated tasks.** Dispatch a **designer** for each `ready` feature and refactor, in parallel, in the task's worktree. It writes into `<run dir>/<id>/` in place of a run directory of its own:
   - a feature: FEATURE.md steps 1 and 2, until `npx openspec validate <change> --strict` passes, and a list of the E2E specs its tasks would need;
   - a refactor: REFACTOR.md step 1, writing `<run dir>/<id>/target.md`. A target with no gain leaves the batch as `fair shape`.

   Bugs and small tasks have no gate: start step 5 for them now. Done when every feature has its change and every refactor its target.

4. **Gate.** Send one message:
   - a first line naming the tasks that run without a gate;
   - one block per gated task, three or four lines: its number and title, why, what changes (the spec requirements, or the interface that moves), the path of its proposal or `target.md`, and its E2E question when it has one;
   - one line for the whole batch: the roles from [ROLES.md](../roles/ROLES.md) with the model you run on, and that every implementer works in its own worktree;
   - the reply format: one line per task, `<n> ok`, `<n> change: <what>`, or `<n> skip`.

   A task the user answers `ok` starts step 5. `change` goes back to its designer, and you show only that block again. `skip` leaves the batch for the report. The others keep running while a task waits. Done when every gated task is answered.

5. **Plan.** Give each task its tickets, in `<run dir>/<id>/tickets/`:
   - a **bug**: one ticket, `Kind: bug`, naming its red-test patch, its cause, and its fix direction as the shape (_Fixes_ in [QUALITY.md](../shared/QUALITY.md)), with the triage's _Touches_ as its write scope;
   - a **small** task: one ticket, with the triage's list as its write scope and `Shape: n/a`;
   - a **feature**: FEATURE.md steps 4 and 5 (explore, tickets). When it comes to more than 5 tickets, hand it off: give the user the command `/ketcher-flow feature handoff <run dir>/<id>` for a new session (in T3 Code, offer a new thread), and take no further step on it. FEATURE.md step 1 says where that session starts. Otherwise go on with FEATURE.md step 6 (design), with the designers it names;
   - a **refactor**: the pin, subtract, and reshape tickets of REFACTOR.md steps 3 to 5, each blocked on the one before.

   Then write `<run dir>/plan.md` as FEATURE.md step 7 says, over every ticket of the batch. Count shared paths across tasks too: two tasks that touch one path get a blocking edge and keep separate tickets. For each feature, commit its change folder and open its draft PR as FEATURE.md step 8 says, from its worktree: the branch already exists. Done when no two tickets on the same frontier share a path.

6. **Run the frontier.** Compare every check against step 1's baseline, and save no other. Dispatch an **implementer** with [IMPLEMENT.md](../roles/IMPLEMENT.md) per ready ticket, within the limits:
   - bug and small tickets run in their task's worktree;
   - feature and refactor tickets each run in a worktree of their own, branched from the task's branch. When the implementer reports, dispatch a **merger** with [MERGE.md](../roles/MERGE.md) and the task's worktree as the target. Reshape tickets run one at a time, as REFACTOR.md step 5 says.

   **Shape misfit** sends the ticket back to step 5's design. A check that fails twice follows _Cascade_ in [ROLES.md](../roles/ROLES.md). A bug ticket still red after the cascade: reset the task's worktree to `<base>`, draft a comment on what was tried, and the bug is **handed to a human**.

   When a task's last ticket is in, prove it: dispatch a **verifier** with [VERIFY.md](../roles/VERIFY.md), the task's worktree, and its spec (the issue and its triage outcome, the change's spec deltas, or `target.md` with the pin's `before/` run). A feature is then archived as FEATURE.md step 12 says. A refactor gets REFACTOR.md step 7, keep or revert. When a ticket finishes, start the tickets it unblocked. Done when every ticket is in or paused.

7. **Pauses.** A ticket that stops for the user (an escalation in BUG.md, an E2E spec to write, a product decision) pauses its task. The other tasks go on. When the frontier has nothing else to run, ask every paused task's question in one message, one numbered block each. Done when every pause is answered.

8. **Review and land**, each task as soon as its proof is done. Follow [REVIEW.md](../shared/REVIEW.md) from the task's worktree, with `<base>` as the branch point and the task's spec: the issue and triage outcome for a bug, the triage list for a small task, the archived change for a feature, `target.md` for a refactor. A fresh implementer does the cleanup, and a fresh one fixes each round's findings, in the task's worktree. Then land as _Landing_ in SKILL.md says, with the brief at the top of the PR body. Mark a feature's draft PR ready. Done when every task left in the batch has its PR.

9. **Report.** Print, in this order:
   - the **run report**: one line per task, with its kind and outcome: in PR, handed off to its own session, already done, stale, handed to a human, self-gated, skipped at the gate, or fair shape;
   - the brief of each new PR (the top of its body, up to the `---` rule);
   - the **Lessons** of all tasks, as _Landing_ in SKILL.md says.

   Done when every task of step 1 has its line.

10. **Tracker writes and cleanup.** Do this step yourself.
    - **Tracker.** `<run dir>/comments/` holds a draft for each `already-done`, `stale`, and `handed-to-human` task. Show them, one line each, and ask once whether to post them, and whether to close the `already-done` ones. Post and close what the user approved.
    - **Worktrees.** List this run's baseline and triage worktrees, its ticket worktrees, the worktrees of tasks that ended without a PR, and the task worktrees whose PR is merged (`gh pr list --state merged --head <branch>`). Ask once whether to remove them. On yes: `git worktree remove --force` for the baseline, triage, and no-PR worktrees (red tests are saved as patches), then `git branch -D <branch>` for each no-PR task; `git worktree remove` for ticket worktrees; and `git worktree remove`, then `git branch -D <branch>`, for merged ones. Keep a task worktree whose PR is open, and a handed-off feature's.

    Done when every approved draft is posted and every approved worktree is removed.

## The brief

Write it so the user can decide from it in under 30 seconds, without reading the diff:

```markdown
### #<N> <title>

- **Kind:** <bug | small | feature | refactor>
- **Cause:** <bug only: one line, file:line>
- **Change:** <one to three lines>
- **Proof:** <for a bug, `<test name>` was red, is green>; app: <verdict>
- **Review:** clean | <each declined finding and its reason>
```

Review comments that arrive on the PR later belong to a later **follow-up** run ([FOLLOW-UP.md](FOLLOW-UP.md)).
