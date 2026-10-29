# Batch

The **batch** kind of [SKILL.md](../SKILL.md): two or more **tasks**, of any kind. Each task runs whole through its own flow, in a **task orchestrator**: a subagent that follows _Dispatched by a batch_ in SKILL.md. You start the task orchestrators, collect their stops into one message, and report. You end with one PR per task that reached one, and one **brief** per PR.

## Stops

Ask the user only at the batch stops in _Where a flow stops_ in SKILL.md: the large input set (step 1), the tasks' stops (step 4), and the tracker writes (step 6). Run everything else without them.

## Steps

1. **Intake.** Create the run directory, slug `batch-<YYYY-MM-DD-HHMM>`. The input is one of:
   - issue numbers the user named;
   - tasks in prose: write each to `<run dir>/tasks/<k>.md` in the user's words;
   - a query: "fix the open bugs" lists the open bugs as [TRACKER.md](../shared/TRACKER.md) says; other queries go through `gh issue list --search`.

   Drop issues an open PR already closes (`gh pr list --state open --json closingIssuesReferences`) and issues labeled `waiting user reply` or `Questions remain`. When more than 20 remain, show the count by type and area label and ask the user which to take (an area, a priority, or the 20 newest). Done when you hold the task list.

2. **Baseline and roles.** `git fetch origin`, then create a detached worktree on `<base>` named `baseline`, as [LOCATIONS.md](../shared/LOCATIONS.md) says, install it, and save the _Checks_ baseline from it in `<run dir>/baseline/`. Take the roles table from [ROLES.md](../roles/ROLES.md) and the worktree choice at their defaults. Done when `<run dir>/baseline/` holds every check's output.

3. **Start.** Dispatch one **task orchestrator** per task, at most 3 running at once, each with: SKILL.md, its task, `<run dir>/<id>/` as its task run directory, the baseline path, the roles table, and the port block `4002 + 100·k` to `4092 + 100·k` for the task's position `k`. When one ends or stops, start the next waiting task. Done when every task has started.

4. **Stops.** When no task orchestrator is running, send one message with every new `stop.md`, one numbered block each, then one line with the roles table, the model you run on, and the worktree choice, then the reply format: `roles: <change>` moves a row for the work still to run, and one line per block, `<n> ok`, `<n> change: <what>`, `<n> skip`, or `<n> <answer>`. Resume each answered task orchestrator with its line and any `roles:` change (SendMessage in Claude Code). `skip` ends the task for the report. Repeat until every task has ended. Done when every task orchestrator has sent its final report.

5. **Report.** Print, in this order:
   - the **run report**: one line per task, with its kind and outcome: in PR, already done, stale, handed to a human, self-gated, skipped, or fair shape;
   - the **overlaps**: each path that two tasks' branches both changed, with the two PRs, so the user merges them in order;
   - the brief of each new PR (the top of its body, up to the `---` rule);
   - the **Lessons** of all tasks, as _Landing_ in SKILL.md says.

   Done when every task of step 1 has its line.

6. **Tracker writes and cleanup.** Show every `<run dir>/<id>/comment.md`, one line each, and ask once whether to post them, and whether to close the `already-done` issues. Post and close what the user approved. Remove the `baseline` worktree. Done when every approved draft is posted and `git worktree list` shows no worktree of this run.

## No nesting

When a task orchestrator reports that it cannot dispatch subagents, run the tasks yourself, one at a time: follow _Dispatched by a batch_ in SKILL.md for each, and at a stop go on with the next task. Steps 4 to 6 stay the same.

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
