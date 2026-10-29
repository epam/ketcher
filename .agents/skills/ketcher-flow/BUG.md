# Bug

The **bug** kind of [SKILL.md](SKILL.md): the path from one bug, in prose or as one issue, to a PR, with one **gate** in the middle: the user approves the report before anything is filed or changed. You run it yourself, without subagents, until review.

Phases 3 onward live in [BUG-FIX.md](BUG-FIX.md). Read it only once the gate opens.

## Phase 1: Diagnose

Create the run directory, slug `bug-<issue number>` or `bug-<topic>`. When the bug is an issue, read it with its comments. Follow [RED.md](RED.md). If the loop stays green everywhere you can reach, say so, show what you ran, and stop: nothing is filed.

## Phase 2: Report

Write the report to `<run dir>/report.md` **as the issue body**. On approval it is filed or posted as written, so there is one artifact, not a summary and an issue that drift apart.

Propose the fix per _Fixes_ in [QUALITY.md](QUALITY.md), which starts with the specs and ADRs.

<report-template>

## Why

What the user sees, and the code paths that disagree. Cite `file.ts:line` for each. This is the evidence that it is a bug, so it carries the cause, not the symptom.

## What

The fix, as the changes it takes: the plan the user is approving. Name the seam each change lands on, and call out anything it makes dead.

## Acceptance

Checkable statements about behavior after the fix, one per line. The **red** loop from Phase 1 is one of them. A `verify-ketcher` recipe is another when the bug shows in the editor.

</report-template>

A bug worth a design decision gets one more section between **Why** and **What**, naming the mismatch and resolving it. Molecules mode and macromolecules mode modelling one concept differently is the recurring shape: say which model wins and why the other would surprise a user.

### Post it and stop

Show the report to the user with one question that covers the tracker too:

- the bug came as an issue: "post this as a comment on #N, or keep it in the run directory?";
- the bug came as prose: "file this as a new `Bug` issue, or fix without an issue?".

Done when the report is shown. Then **stop**. Phase 3 opens on the user's reply. If they want the plan changed, revise and show it again.
