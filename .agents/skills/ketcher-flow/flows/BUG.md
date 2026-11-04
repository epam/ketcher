# Bug

The **bug** kind of [SKILL.md](../SKILL.md): the path from one bug, in prose or as one issue, to a PR. You run it yourself until review, dispatching only the designers of _Design It Twice_. You go on without asking, and go back to the user only at an **escalation**.

## Escalations

Stop, say what you found and what you need, and wait, when:

- **Green everywhere.** The loop stays green everywhere you can reach (RED.md). Show what you ran. Nothing is filed.
- **Design decision.** The fix needs a choice that `openspec/specs/` and `.memory-bank/adr/` do not make: molecules mode and macromolecules mode model one concept differently, and the bug is the mismatch. Name both models and the one you would pick. The user picks.
- **Product change.** The fix changes what a user sees beyond the **Acceptance** lines of the report.
- **Unexplained screenshot.** A reference screenshot changes in a way no **Acceptance** line of the report says ([SNAPSHOTS.md](../shared/SNAPSHOTS.md)).
- **Stuck.** A fix attempt fails the same check twice, and the **premise** both attempts shared (_Premise_ in [QUALITY.md](../shared/QUALITY.md)) fails when you test it directly.

Everything else you decide and record: in `report.md` while you work, in the PR when it opens.

## Phase 1: Diagnose

Create the run directory, slug `bug-<issue number>` or `bug-<topic>`, and the task worktree, as [LOCATIONS.md](../shared/LOCATIONS.md) says. Save the _Checks_ baseline from [SKILL.md](../SKILL.md) there. When the bug is an issue, read it with its comments. Follow [RED.md](../shared/RED.md). Done when RED.md's _Done when_ holds, or an escalation applies.

## Phase 2: Report

Write the report to `<run dir>/report.md`. It is the spec for the run, and `ketcher-pr` builds the PR body from it: **Why** and **What** feed Summary, **Acceptance** and the repro feed Evidence. The tracker hears of the run only through the PR: `Closes #N` links an issue, and a bug that came as prose gets no new issue.

Propose the fix per _Fixes_ in [QUALITY.md](../shared/QUALITY.md), which starts with the specs and ADRs.

<report-template>

## Why

What the user sees, and the code paths that disagree, each cited as `file.ts:line`. It names the cause, not only the symptom.

## What

The fix, as the changes it takes. Name the seam each change lands on, and call out anything it makes dead. When the fix has to leave this plan, revise it here and go on, unless an escalation applies.

## Acceptance

Checkable statements about behavior after the fix, one per line. The **red** loop from Phase 1 is one of them. A `verify-ketcher` recipe is another when the bug shows in the editor.

</report-template>

A bug worth a design decision gets one more section between **Why** and **What**, naming the mismatch and resolving it. Say which model wins and why the other would surprise a user.

A fix that crosses a module boundary goes through _Design It Twice_ before **What** is written. It crosses one when it changes an interface other modules call (the public `Ketcher` API, an editor or operation interface, a serializer), or lands in both editor modes. Run it as FEATURE.md step 6 says, and put the chosen seam, and the seams you rejected, in the design section.

Done when `report.md` holds all three sections. Start Phase 3 in the same turn.

## Phase 3: Fix

1. **Red commit.** Commit the red test from Phase 1 alone.
2. **Fix commit.** Turn the red loop green as _Turning it green_ in [RED.md](../shared/RED.md) says. Write the fix per _Fixes_ and _Write_ in QUALITY.md.

**Evidence.** Every changed line traces to the cause in **Why** or to an **Acceptance** line; a guard or retry that only "might help" traces to neither. When a result refutes a hypothesis, revert what it motivated.

Then follow [VERIFY.md](../roles/VERIFY.md) yourself, with the report as the spec: when Phase 1 made a repro in `<run dir>/repro/`, run it on the branch and compare.

Done when the red commit fails on its own, the fix commit turns it green, the branch passes every check, and the verdict is `pass` or `n/a`. A `fail` means the fix is not done: back to the loop. A `could not run` goes in the PR and the Phase 5 report.

## Phase 4: Review

Follow [REVIEW.md](../shared/REVIEW.md) with the report as the spec. You do the cleanup and the fixes yourself. Done when REVIEW.md's rounds have stopped.

## Phase 5: Land

Open the PR as _Landing_ in SKILL.md says. Under "Verified in the app", paste the repro output as it ran: failing before the fix, passing after, plus the fix evidence. Mark it ready once the [SNAPSHOTS.md](../shared/SNAPSHOTS.md) run, when there is one, is green.

Report to the user: what was broken, the root cause, the fix, how you verified it, the PR, what the checks said, and anything left open.
