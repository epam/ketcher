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

A run's branch is named `<issue number>-<kebab-case title>` (`12365-atom-labels-break-at-20-percent-zoom`), with no `#`. With no issue, use `<kind>-<kebab-case topic>`.

## Worktrees

Every run works in worktrees and leaves the primary checkout on the branch it found. Create each worktree with `git worktree add` and an explicit start commit, and hand a subagent its path, in place of `isolation: "worktree"`.

- **Task worktree**: holds the run's branch, `git worktree add -b <branch> <root>/.ketcher-flow/worktrees/<id> <base>`, where `<id>` is the issue number or the run's topic. Create it in the flow's first step. Every command of the run that reads, builds, tests, or changes code runs in it, and "your checkout" in a flow means it.
- **Ticket worktree**: one per implementer of a feature or refactor ticket, `git worktree add -b <branch>-<ticket> <root>/.ketcher-flow/worktrees/<id>-<ticket> <branch>`. It starts from the task branch's last commit, so commit a checkpoint there first.
- **Detached worktree**: for work on `<base>` that commits nothing, such as a batch's baseline: `git worktree add --detach <root>/.ketcher-flow/worktrees/<name> <base>`.

A fresh worktree has no `node_modules`. Run `npm install` from its root. On macOS, `cp -c -R <root>/node_modules <worktree>/` (and the same for each `packages/*/node_modules` and `ketcher-autotests/node_modules` that exists) is a copy-on-write clone and is faster. A ticket that changes `package.json` or the lockfile always runs `npm install`.

Remove a ticket worktree when its merger reports. Remove the task worktree after the flow's final report, and keep its branch. A run that ends without a commit removes the task worktree and deletes its branch (`git branch -D <branch>`). Done when `git worktree list` shows none from this run.
