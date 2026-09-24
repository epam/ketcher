---
name: handle-tickets
description: 'Deliver a batch of tickets as opened PRs. Use when given a single issue to work, a cluster confirmed for delivery, a label, or a tracker view.'
argument-hint: '[tracker view | label | issue numbers] [repo]'
---

# Handle tickets

Turns a **batch** of tickets — one, or a cluster that shares a fix shape — into opened PRs. Those PRs are the whole output: every finding, bypass, and open question rides in a PR body, so an unattended run leaves nothing behind that needed a human watching it.

**One ticket, one sub-agent, one PR** — unless tickets share a file, and then those tickets are one sub-agent and one PR together. Stage 3 settles which; nothing later revisits it. Every stage runs without asking — a decision that genuinely blocks becomes a draft PR carrying the question, so the run still ends in something reviewable.

Each stage carries its own completion bar — advance once the bar is met for every ticket in the batch.

## 1. Scope

Resolve the batch to a concrete, numbered issue list, one repo, one base branch (default `master`). The current repository is the scope — resolve it with `gh repo view` and work there; use another repo only when an argument names one. The argument is either explicit issue numbers, a label, or a tracker view (`org/project number`) — resolve a label or view via `gh issue list` / `gh project item-list` and filter to open, unassigned-to-someone-else items. Issue numbers arriving pre-filtered (e.g. from `find-ticket-clusters`) satisfy this trivially — no need to re-run the open/unassigned filter.

**Done when:** you can print a table of issue number → title, for every issue in the batch.

## 2. Claim

For every issue in the batch: assign it to `@me`, and move its tracker item to **In progress**. Look up the tracker's Status field id and option id with `gh project field-list` each run — they change per board.

**Done when:** `gh issue view <n>` shows you as assignee, and the tracker item's Status reads "In progress", for every issue.

## 3. Partition

One ticket is one **unit** by default. Tickets naming the same file are one unit together, as are tickets whose files must change together — they meet in one diff, so one agent writes it and one PR carries it.

The paths live in the issue bodies — a "Problem locations" field or equivalent. Send one **search sub-agent** to fetch them: it reads every issue in the batch and returns one line per ticket, number → the path(s) that ticket names. The bodies stay in its context; grouping needs only the paths.

**Done when:** every ticket in the batch belongs to exactly one unit, and no file appears in two units.

## 4. Dedupe

Before delegating a unit, search for a PR that already targets its issue number(s) (`gh pr list --search "<issue> in:body"`, plus a search by branch-name pattern in case the body search misses it). A hit against the *current* base branch is a duplicate — reuse it, skip delegation for that unit. A hit whose diff no longer applies (opened before a since-merged fix landed) is stale — delegate anyway, and carry the old PR's number into stage 6 so the new PR names what it supersedes. Closing the old one belongs to the human.

**Done when:** every unit carries one verdict — `new`, `reuse`, or `supersede` — before you spawn anything.

## 5. Explore

Exploration buys two different things. Across a cluster, the units share one fix shape, so the discovery is shared — run it once here rather than N times inside stage 6. On a single unit, it buys context isolation: the explorer spends the search tokens, and the implementer opens with notes instead of a cold codebase.

Judge whether the shape is already settled by the issue bodies. A lint rule quoting its own remedy needs nothing. A shape that turns on a codebase convention, a rule's edge cases, or a util the fix should reuse needs one **exploration sub-agent**: it reads the issue bodies and the files the units name, then writes markdown notes to a directory outside the repo that every stage 6 agent can read.

Notes carry what the issue bodies leave out — the convention to follow, the existing helper to reuse, the edge case that changes the fix. The issue text is already going to each agent verbatim, so notes that restate it cost tokens and add nothing.

**Done when:** either you have recorded that the shape needs no exploration, or a notes file exists at a path you can hand to stage 6.

## 6. Deliver

Every `new`/`supersede` unit goes to its own **`ticket-implementer`** sub-agent (`isolation: "worktree"`), a lone unit included; launch them in a single message so they run in parallel. That agent definition carries the brief — how to work the unit and what the PR body must hold. Your spawn message carries only what is unit-specific:

- the unit's issue numbers
- the base branch to branch off and target
- the stage 5 notes path, when there is one
- the issue number this PR supersedes, when stage 4 named one

**Done when:** every `new`/`supersede` unit has an open PR URL, or a named reason it produced none. That list of URLs is the run's output.
