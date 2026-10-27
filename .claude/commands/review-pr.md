---
allowed-tools: Bash(gh pr diff:*),Bash(gh pr view:*),Bash(gh pr comment:*),Bash(gh issue view:*),mcp__github_inline_comment__create_inline_comment
description: Review a pull request
---

Arguments: $ARGUMENTS

The arguments name the repository (`REPO`) and the pull request (`PR_NUMBER`). Pass both to every `gh` call.

Review the pull request in these steps. The [output contract](../../.memory-bank/review-workflow.md#output-contract) sets the order of work and the format of every finding, so follow it and do not restate it here.

1. Get the diff with `gh pr diff`. Run the first pass on the diff alone. Do not read the PR description yet.
2. Run these four subagents in parallel, each on the diff: `code-quality-reviewer`, `performance-reviewer`, `documentation-accuracy-reviewer`, `security-code-reviewer`. Tell each to report only noteworthy findings. Each subagent loads the rule and invariant docs itself.
3. Check each returned finding against the code. Open the cited `file:line`, confirm the failing scenario, and drop any finding that does not hold.
4. Read the PR description with `gh pr view` to find the linked issue. Fetch it with `gh issue view`, and answer whether the diff fixes it. That answer goes in the brief.
5. Post each surviving finding as an inline comment with `mcp__github_inline_comment__create_inline_comment`, in the order and within the cap that the output contract sets.
6. Post the review brief as one top-level comment with `gh pr comment`. Its content is set by [Human review](../../.memory-bank/review-workflow.md#human-review). Post it even when no finding survives.
