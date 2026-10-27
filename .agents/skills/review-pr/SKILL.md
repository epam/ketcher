---
name: review-pr
description: Review a Ketcher pull request with the four reviewer agents and post the verified findings and the review brief.
argument-hint: '<PR number> | REPO: <owner/repo> PR_NUMBER: <N>'
disable-model-invocation: true
allowed-tools: Bash(gh pr diff:*),Bash(gh pr view:*),Bash(gh pr comment:*),Bash(gh issue view:*),mcp__github_inline_comment__create_inline_comment
---

Arguments: $ARGUMENTS

The arguments name the pull request (`PR_NUMBER`) and may name the repository (`REPO`, `epam/ketcher` when absent). Run every `gh` call as `gh <command> <PR_NUMBER> --repo <REPO>`.

**CI** means the `mcp__github_inline_comment__create_inline_comment` tool is present: `claude-review.yml` provides it. Every finding follows the [output contract](../../../.memory-bank/review-workflow.md#output-contract).

1. Get the diff with `gh pr diff`.
2. **First pass, on the diff alone.** Run these four subagents in parallel: `code-quality-reviewer`, `performance-reviewer`, `documentation-accuracy-reviewer`, `security-code-reviewer`. They can read files but not run `gh`, so pass each the diff text. Each agent's file loads its own rule and invariant docs. How each tool dispatches them, and what to do in a tool without subagents, is in [ROLES.md](../ketcher-flow/ROLES.md) under the reviewer row. Done when all four have reported.
3. **Verify.** For each finding, open the cited `file:line` and confirm its failing scenario. Done when every finding is confirmed or dropped.
4. **The linked issue.** Read the PR description with `gh pr view`, fetch the issue it links with `gh issue view`, and answer whether the diff fixes it. With no linked issue, the answer is "no linked issue". The answer goes in the brief.
5. **Findings.** In CI, post each verified finding as an inline comment with the CI tool, in the order and within the cap the output contract sets; the rest go in the brief. Outside CI, every verified finding goes in the brief, one line each. Done when each one is posted or in the brief.
6. **The brief.** Write it as [Human review](../../../.memory-bank/review-workflow.md#human-review) sets, even when no finding survives. In CI, post it as one top-level comment with `gh pr comment`. Outside CI, show it to the user and post it only on their approval: it is public on the PR.
