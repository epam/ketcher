---
name: review-pr
description: Review a Ketcher pull request with the code-review lenses its diff needs and post the verified findings and the review brief.
argument-hint: '<PR number> | REPO: <owner/repo> PR_NUMBER: <N>'
disable-model-invocation: true
allowed-tools: Bash(gh pr diff:*),Bash(node scripts/review-panel.mjs:*),Bash(gh pr view:*),Bash(gh pr comment:*),Bash(gh issue view:*),mcp__github_inline_comment__create_inline_comment
---

Arguments: $ARGUMENTS

The arguments name the pull request (`PR_NUMBER`) and may name the repository (`REPO`, `epam/ketcher` when absent). Run every `gh` call as `gh <command> <PR_NUMBER> --repo <REPO>`.

**CI** means the `mcp__github_inline_comment__create_inline_comment` tool is present: `claude-review.yml` provides it. Every finding follows the [output contract](../../../.memory-bank/review-workflow.md#output-contract).

1. Get the diff with `gh pr diff`.
2. **Panel.** Run `node scripts/review-panel.mjs --pr <PR_NUMBER> --repo <REPO>` and take the lenses it prints, as [Panel](../code-review/SKILL.md#panel) in the code-review skill says. With `No lens applies.`, go to step 5. Done when you have the panel.
3. **First pass, on the diff alone.** Run one review subagent per lens on the panel, in parallel, each with the [code-review skill](../code-review/SKILL.md) and its lens file. They can read files but not run `gh`, so pass each the diff text, with read-only file tools. Per-tool dispatch melodies, and what to do in a tool without subagents, are in [ROLES.md](../ketcher-flow/roles/ROLES.md) under the reviewer row. Done when every lens on the panel has reported.
4. **Verify.** For each finding, open the cited `file:line` and confirm its failing scenario, as the output contract says. Done when every finding is confirmed, dropped, or an open question.
5. **The linked issue.** Read the PR description with `gh pr view`, fetch the issue it links with `gh issue view`, and answer whether the diff fixes it. With no linked issue, the answer is "no linked issue". The answer goes in the brief.
6. **Findings.** In CI, post each confirmed finding as an inline comment with the CI tool, in the order and within the cap the output contract sets; the rest, and the open questions, go in the brief. Outside CI, every finding goes in the brief, one line each. Done when each one is posted or in the brief.
7. **The brief.** Write it as [Human review](../../../.memory-bank/review-workflow.md#human-review) sets, even when no finding survives. In CI, post it as one top-level comment with `gh pr comment`. Outside CI, show it to the user and post it only on their approval: it is public on the PR.
