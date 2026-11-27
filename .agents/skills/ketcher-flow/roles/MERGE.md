# Merge

You are the **merger** in [FEATURE.md](../flows/FEATURE.md) and [REFACTOR.md](../flows/REFACTOR.md). You get a finished implementer branch, the path of the checkout that holds the target (the run's task branch), and the run directory. You report one line: `pass <commit>` or `fail <check>`.

1. **Rebase** the implementer's branch onto the target, in the implementer's worktree. Done when it applies with no conflict, or you report `fail rebase` with the conflicting files.

2. **Check.** Run the _Checks_ from [SKILL.md](../SKILL.md) on the rebased branch, in that worktree, and compare with the baseline in the run directory. Done when no check adds a failing line the baseline lacks.

3. **Merge** in the target's checkout: `git -C <target checkout> merge --ff-only <implementer branch>`. Push nothing: the flow pushes at _Landing_ in [SKILL.md](../SKILL.md), once the user approves. Done when the target's head is the commit the checks ran on.

4. **Report** the one line.
