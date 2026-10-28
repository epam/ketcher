<!--
Large-scale change PR. Read the protocol in .memory-bank/review-workflow.md before filling this in.
Open the PR with ?template=large-scale-change.md in the URL.
-->

## Summary

<diagram, diff-sketch, or tree>

## Split decision

Which option you used (split by package with parallel change, stack, or one PR with separated commits), and why the earlier options do not work.

## Codemod

- Script: `scripts/codemods/<name>.mjs` (or "none" when the change is manual commits only)
- How to run it:
- Known cases the script skips:

## Evidence of equivalence

Paste the output of the compare scripts, before and after the change.

- Test runner migration: test count per package; tests added, removed, skipped, or renamed; coverage before and after.
- Build tool upgrade: `dist/` file list and sizes before and after; diff of the public `.d.ts` exports; standalone consumer check passes; E2E passes.

## Review map

The 5 to 10 files with a decision, one line each. Add self-review comments on those lines.

- `path/to/file`:

## Merge Danger

**Door:** <one-way or two-way>

**Blast Radius:** <one-word description>

<optional: potential ramifications of merge>

### Revert plan

How to roll back, and what else must roll back with it.

---

Closes #<issue>

Memory bank: <the file this PR updated, or "not needed">
