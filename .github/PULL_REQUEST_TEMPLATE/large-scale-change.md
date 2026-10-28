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

## PR type

Tick every row that matches this PR: Large-scale change and Archive go with another type. The full contract is in `.memory-bank/review-workflow.md`.

- [ ] Bug fix: linked issue and a regression test
- [ ] Feature: OpenSpec change in `openspec/changes/<change>/` and tests
- [ ] Refactor: behavior kept, held by tests written before the code moved
- [ ] Small change: no behavior change, held by the existing tests and the type check
- [ ] Large-scale change: opened with `?template=large-scale-change.md`
- [ ] Archive of an OpenSpec change: no unchecked tasks

## Check list

- [ ] unit-tests written
- [ ] e2e-tests written
- [ ] memory bank updated (name the file), or not needed
- [ ] PR name follows the pattern `#1234 - issue name`
- [ ] branch name doesn't contain '#'
- [ ] PR is linked with the issue
- [ ] base branch (master or release/xx) is correct
- [ ] task status changed to "Code review"
- [ ] reviewers are notified about the pull request
