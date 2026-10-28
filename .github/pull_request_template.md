## Summary

<diagram, diff-sketch, or tree>

## Evidence

- **Before:** <screenshot/output/failing test run>
  **After:** <screenshot/output/passing test run>

## Merge Danger

**Door:** <one-way or two-way>

<optional: description>

**Blast Radius:** <one-word description>

<optional: potential ramifications of merge>

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
