# Refactor

The **refactor** kind of [SKILL.md](SKILL.md): a change to the structure of code that keeps its behavior.

The behavior is held by a **pin**: tests that capture what the code does today, through its interface, written before any structure moves. Type check and lint are not a pin. The run ends on one branch whose commits read as an argument: the pin, then the subtraction, then the reshape.

Every ticket names its write scope. The pin and subtract tickets add no new structure, so their shape line reads `Shape: n/a` with that reason.

A refactor that turns up a real bug keeps going against the pin. The bug becomes a new scope of kind bug, listed in the final report. The pin captures today's behavior, bug included.

## Steps

1. **Target.** Create the run directory, slug `refactor-<topic>`. Read the code in scope, with an **explorer** for anything large, and the `modules/` docs that own it. Write `<run dir>/target.md`:
   - **Now**: the current shape, and what makes it hard to read: the layers a reader traces, the state a reader holds, the rules repeated across files.
   - **Target**: the shape you would build today, per _Shape first_ in [QUALITY.md](QUALITY.md): module layout, types, call graph. A target that changes an interface other modules call goes through _Design It Twice_, as [FEATURE.md](FEATURE.md) step 6 says. Use the `codebase-design` vocabulary (module, interface, seam, depth) in `target.md`.
   - **Gain**: how a reader answers "where does X come from?" and "what can change X?" faster in the target.
   - **Size**: whether the diff will qualify as a large-scale change. When it will, add the split decision from the [large-scale change protocol](../../../.memory-bank/review-workflow.md#large-scale-change-protocol) and run each split as its own branch and PR.

   Done when `target.md` exists. When you cannot write the gain, stop and tell the user the code is already in a fair shape: that is a finished run, not a failure.

2. Show the user `target.md` and the roles table from [ROLES.md](ROLES.md), and ask about worktrees: each implementer in its own worktree by default (parallel implementers on one branch collide), or the shared branch. Then **stop**: step 3 opens on the user's reply. Create the branch as _Branches_ in LOCATIONS.md says, and save the _Checks_ baseline.

3. **Pin.** Dispatch an **implementer** with [IMPLEMENT.md](IMPLEMENT.md) and a ticket `<run dir>/tickets/pin.md`: Jest tests through the interface for every behavior `target.md` touches, per _Tests_ in QUALITY.md, passing on today's code. Where the behavior shows only in the editor, record a `verify-ketcher` run on `<base>` as the pin's app half, in `<run dir>/verify/before/`. Done when the pin is one commit and green.

4. **Subtract.** Dispatch an **implementer** with a ticket `<run dir>/tickets/subtract.md`: delete the dead code, one-caller wrappers, redundant checks, and orphan references in scope, with the pin green. Done when the subtraction is one commit, or there was nothing to delete.

5. **Reshape.** Slice the move from the subtracted code to the target into tickets, each small, each keeping the pin green, each with its write scope and its slice of the target as its shape. An interface change moves every caller and deletes the old interface in the same ticket. Dispatch them one at a time with IMPLEMENT.md, since they move the same code, each through a **merger** with [MERGE.md](MERGE.md). Done when every ticket is merged with the pin green.

6. **Prove.** Run the pin and the _Checks_ against the baseline. When the code reaches the editor, dispatch a **verifier** with [VERIFY.md](VERIFY.md): it repeats the step 3 run on the branch, and the exports must match `before/`. Done when the pin is green, the checks pass, and the verdict is `pass` or `n/a`.

7. **Keep or revert.** Read the diff against `target.md`'s gain. When the reshape does not make the answer to its two questions faster, revert the reshape commits and keep the pin and the subtraction. Done when you have decided, with one line of why.

8. Follow [REVIEW.md](REVIEW.md) with `target.md` as the spec. A fresh implementer does the cleanup, and a fresh one fixes each round's findings.

9. **Land** as SKILL.md says, with the issue when there is one. Report: the structure that changed, the pin it held against, the verify verdict, what was reverted and why, and any bugs found on the way.
