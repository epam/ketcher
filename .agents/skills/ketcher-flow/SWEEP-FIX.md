# Fix one area

You are an **implementer** in a sweep. You own one **area**: a branch, its worktree under `<root>/.ketcher-flow/worktrees/` (created from `<base>` and installed), and a set of issues. You work only inside that worktree.

Read _Checks_ in [SKILL.md](SKILL.md) for how the branch is checked against the baseline in the run directory, and [TRACKER.md](TRACKER.md) for the PR format.

You run in one of two modes. The orchestrator tells you which.

## Fix mode

You get the worktree, the issue numbers, and for each issue its triage outcome file `<run dir>/<N>.md` and red-test patch `<run dir>/<N>.patch`.

For each bug, one at a time:

1. Apply the patch: `git -C <worktree> apply <run dir>/<N>.patch`. Run the test and see it go **red**.
2. Turn it green at the root cause, as _Turning it green_ in [RED.md](RED.md) says, per _Fixes_ in [QUALITY.md](QUALITY.md).
3. Commit the test and the fix together, naming the issue (`#<N> - <issue title>`).
4. If the test will not go green after a real attempt, `git reset --hard` to the previous bug's commit and write a draft comment to `<run dir>/comments/<N>.md` with what you tried. The bug is then **handed to a human**.

Then check the whole branch. Done when the branch passes every check: each changed test file alone first, then the full suites once.

Report to the orchestrator: each bug committed or handed to a human, and the check results. Then wait: the orchestrator sends the cleanup request, then the review findings.

## Review findings

The orchestrator runs _Review_ from SKILL.md and sends you its steps one message at a time:

- **Cleanup**: apply _Cleanup_ from that section to your branch's diff, as one commit. Rerun the checks and report.
- **Findings** from a round: fix each in a new commit, or decline it with one line of reason. Rerun the checks and report the commits and the declines.

When the orchestrator says review is done, open the PR as TRACKER.md says. Review has stopped, so open it ready, not as a draft. Title: `#<N> - <title>` of the first issue, naming the others after it. The body is the **brief**, then a `---` rule, then the PR template sections with PR type "Bug fix", `Closes #<N>` for each committed bug, and "Verified in the app" from the verifier's report.

### The brief

The user reads the brief instead of the diff, so it must be decision-ready in under 30 seconds. One block per committed bug:

```markdown
### #<N> <issue title>

- **Cause:** <one line, file:line>
- **Change:** <one to three lines>
- **Proof:** `<test name>` was red, is green; app: <verdict>
```

Then once:

```markdown
**Review:** clean | <each declined finding and its reason>
**Handed to a human:** <#N and why, or omit>
```

Done when the PR exists and its body starts with the brief.

## Follow-up mode

You get an open PR number. Its worktree is under `<root>/.ketcher-flow/worktrees/`. If it is gone, `git fetch origin`, recreate it with `git worktree add <path> <branch>`, and install it as LOCATIONS.md says.

1. Read every unresolved review thread and every "changes requested" review. Only GraphQL shows which threads are resolved:

   ```sh
   gh api graphql -f query='query { repository(owner: "epam", name: "ketcher") { pullRequest(number: <PR>) { reviewThreads(first: 100) { nodes { id isResolved path line comments(first: 20) { nodes { author { login } body } } } } reviews(last: 20) { nodes { state body } } } } }'
   ```

2. Address each comment in a new commit. Rerun the checks. Report to the orchestrator and wait for the review findings. Handle them as in _Review findings_, without opening a PR.
3. Push to the same branch.
4. Draft a reply for each thread in `<run dir>/comments/pr-<PR>-<thread id>.md`: what changed, or why nothing did. The orchestrator posts them after the user approves. Leave threads unresolved: the reviewer resolves them.
5. Report a **follow-up brief**: the PR link, then one line per comment with what changed or why nothing did.

Done when every unresolved comment has a drafted reply, and the branch is pushed.
