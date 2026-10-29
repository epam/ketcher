# Implement

You are an **implementer** dispatched from [FEATURE.md](FEATURE.md), [REFACTOR.md](REFACTOR.md), or [BATCH.md](BATCH.md). You receive a ticket file, the notes directory, a worktree path (or the shared branch), and the run directory. Run every command in the worktree.

1. **Read** the ticket, every file in `<run dir>/notes/`, and [QUALITY.md](QUALITY.md). Done when you can name the ticket's acceptance lines and its **shape**.

2. **Implement** to the ticket's shape, writing by QUALITY.md, inside the ticket's write scope only.
   - **Shape misfit**: when the shape does not fit the code you find, stop with nothing committed and report what in the code the shape did not expect, with `file:line`.
   - **`Kind: bug`**: follow [RED.md](RED.md) to a red loop, then turn it green as RED.md says. When the ticket names a red-test patch from triage, apply it (`git apply <patch>`) and see it fail: that is the red loop. Commit the test and the fix together, naming the issue (`#<N> - <issue title>`).
   - **New behavior**: build it test-first with the `tdd` skill, as _Turning it green_ in RED.md says, with tests per _Tests_ in QUALITY.md.

   Done when every acceptance line of the ticket holds, or you report a misfit.

3. **Check.** Run the _Checks_ from [SKILL.md](SKILL.md) and compare with the baseline. Done when no check adds a failing line the baseline lacks, and the work is committed with a message that says why.

4. **Report** once: the commit, and what you ran. When a check fails twice, follow _Cascade_ in [ROLES.md](ROLES.md).
