# Locations

Where a run writes, and how it gets a worktree and a branch.

## The run directory

`<root>` is the primary checkout: `dirname "$(git rev-parse --path-format=absolute --git-common-dir)"`, the same answer from any worktree.

A run writes into `<root>/.ketcher-flow/`, which is gitignored:

- `<root>/.ketcher-flow/runs/<slug>/` is the **run directory**: tickets, notes, outcome files, patches, check baselines, verify evidence. `<slug>` names the run (`bug-12365`, `hunt-2026-10-27-1430`), so two runs keep apart.
- `<root>/.ketcher-flow/worktrees/<name>/` holds one worktree per subagent that edits code, when the tool does not create its own.

A worktree has no gitignored files, so the run directory exists only in the primary checkout. Hand subagents absolute paths into it. In code, commits, issues, and PR bodies, cite only tracked paths.

## Base

`<base>` is the branch the PR targets: `origin/master`, or the `release/<version>` branch when the user names one. Run `git fetch origin` before reading it.

## Branches

A run's branch is named `<issue number>-<kebab-case title>` (`12365-atom-labels-break-at-20-percent-zoom`), with no `#`. With no issue, use `<kind>-<kebab-case topic>`. Create it with `git switch -c <branch> <base>`.

## Worktrees

Parallel implementers each work in their own worktree. A worktree branches off the last commit, not the working tree, so commit a checkpoint first.

- When the tool isolates a subagent in a worktree itself (Claude Code's `isolation: "worktree"`), use that.
- Otherwise: `git worktree add -b <branch> <root>/.ketcher-flow/worktrees/<name> <start commit>`.

A fresh worktree has no `node_modules`. Run `npm install` from its root. On macOS, `cp -c -R <root>/node_modules <worktree>/` (and the same for each `packages/*/node_modules` and `ketcher-autotests/node_modules` that exists) is a copy-on-write clone and is faster. A ticket that changes `package.json` or the lockfile always runs `npm install`.

Remove a worktree when no further work will run in it — the flow that opened its PR says when, never while review rounds may still dispatch into it: `git worktree remove <path>`. Done when `git worktree list` shows none from this run.
