## Summary

How the feature works, or how you fixed the issue. Add a diagram, a diff sketch, or a tree when it makes the change clearer.

## Evidence

Before and after: screenshots, videos, or GIFs for a visual change; a test run or console output otherwise.

- **Before:**
- **After:**

## Merge danger

- **Door:** one-way or two-way (can the change be rolled back cheaply?)
- **Blast radius:** what else this change can break (other modes, file formats, API consumers, layout)

## PR type

Tick the row that matches this PR. The full contract is in `.memory-bank/review-workflow.md`.

- [ ] Bug fix: linked issue and a regression test
- [ ] Feature: OpenSpec change in `openspec/changes/<change>/` and tests
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
