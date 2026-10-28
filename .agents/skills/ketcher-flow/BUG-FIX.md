# Bug fix

Phases 3 to 6 of [the bug flow](BUG.md), reached only once the user has approved the report. _Checks_, _Review_, and _Landing_ in [SKILL.md](SKILL.md), with [LOCATIONS.md](LOCATIONS.md) and [TRACKER.md](TRACKER.md), apply here as written.

## Phase 3: Record

The approved report **is** the spec. Give it the home the user chose:

- **New issue**: file it with type `Bug` and the area labels, per TRACKER.md. Report the issue URL.
- **Comment**: post it on the issue, per TRACKER.md.
- **No issue**: it stays in `<run dir>/report.md`. Say so.

Start work in the same turn.

## Phase 4: Fix

Create the fix branch off `<base>` as _Branches_ in LOCATIONS.md says, and save the _Checks_ baseline.

Turn the **red** loop from Phase 1 green, as _Turning it green_ in [RED.md](RED.md) says. The report's **What** already agreed the seams. Write the fix per _Fixes_ and _Write_ in [QUALITY.md](QUALITY.md).

Then follow [VERIFY.md](VERIFY.md) yourself, with the report as the spec: when Phase 1 made a repro in `<run dir>/repro/`, run it on the branch and compare. A bug the user saw in the app is proven fixed there too.

Done when the red loop is green, the branch passes every check, the test and the fix are one commit, and the verdict is `pass` or `n/a`. A `fail` means the fix is not done: back to the loop. A `could not run` goes in the PR and the Phase 6 report.

If the fix has to leave the approved **What**, show what changed and why, and wait. The gate covers the plan, not just the diagnosis.

## Phase 5: Review

Run _Review_, with the report as the spec. You do the cleanup and the fixes yourself. Each round's reviewers stay fresh.

## Phase 6: Land

Open the PR as _Landing_ says, with `Closes #N` when there is an issue, and the repro and the fix evidence under "Verified in the app". When review has stopped, mark it ready.

Report: the issue URL or report path, the PR, what the checks said, the verify verdict, and anything left open.
