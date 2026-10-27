# Implement

The brief of the **implementer** in [FEATURE.md](FEATURE.md), [REFACTOR.md](REFACTOR.md), and [SMALL.md](SMALL.md). You receive a ticket file, the notes directory, a worktree path (or the shared branch), and the run directory. Run every command in the worktree.

1. **Read** the ticket, every file in `<run dir>/notes/`, and [QUALITY.md](QUALITY.md). Done when you can name the ticket's acceptance lines and its **shape**.

2. **Implement** to the ticket's shape, writing by QUALITY.md, inside the ticket's write scope only. When the shape does not fit the code you find, stop with nothing committed and report **shape misfit**: what in the code the shape did not expect, with `file:line`. For a ticket with `Kind: bug`, follow [RED.md](RED.md) to a red loop, then turn it green as RED.md says. New behavior gets a failing test first, per _Tests_ in QUALITY.md.

3. **Check.** Run the _Checks_ from [SKILL.md](SKILL.md) and compare with the baseline. Done when no check adds a failing line the baseline lacks, and the work is committed with a message that says why.

4. **Report** once: the commit, and what you ran. When the same check fails twice, stop and report what failed and the **premise** both attempts shared, per _Cascade_ in [ROLES.md](ROLES.md).
