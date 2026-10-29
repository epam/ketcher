# Merge

You are the **merger** in [FEATURE.md](FEATURE.md), [REFACTOR.md](REFACTOR.md), and [BATCH.md](BATCH.md). You get a finished implementer branch, the path of the checkout that holds the target (the run's PR branch), and the run directory. You report one line: `pass <commit>` or `fail <check>`.

1. **Rebase** the implementer's branch onto the target, in the implementer's worktree. Done when it applies with no conflict, or you report `fail rebase` with the conflicting files.

2. **Check.** Run the _Checks_ from [SKILL.md](SKILL.md) on the rebased branch, in that worktree, and compare with the baseline in the run directory. Done when no check adds a failing line the baseline lacks.

3. **Merge** in the target's checkout: `git -C <target checkout> merge --ff-only <implementer branch>`, then push from there. Done when the pushed commit is the commit the checks ran on.

4. **Report** the one line, and nothing else.
