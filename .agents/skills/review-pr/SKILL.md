---
name: review-pr
description: Review a Ketcher pull request with the code-review lenses its diff needs, and write the verified findings and the review brief.
argument-hint: '<PR number> | REPO: <owner/repo> PR_NUMBER: <N>'
disable-model-invocation: true
allowed-tools: Bash(gh pr diff:*),Bash(node scripts/review-panel.mjs:*),Bash(gh pr view:*),Bash(gh pr comment:*),Bash(gh issue view:*)
---

Arguments: $ARGUMENTS

The arguments name the pull request (`PR_NUMBER`) and may name the repository (`REPO`, `epam/ketcher` when absent). Run every `gh` call as `gh <command> <PR_NUMBER> --repo <REPO>`.

This skill is the local and agent review. In CI the review runs as a workflow in code, the hub in `scripts/review/`, which `claude-review.yml` starts from a review label; this skill posts nothing on its own. Both share the panel script, the lens files and the role prompts, so the two reviews stay close. Every finding follows the [output contract](../../../.memory-bank/review-workflow.md#output-contract).

1. Get the diff with `gh pr diff`.
2. **Panel.** Run `node scripts/review-panel.mjs --pr <PR_NUMBER> --repo <REPO>` and take the lenses it prints, as [Panel](../code-review/SKILL.md#panel) in the code-review skill says. With `No lens applies.`, go to step 5. Done when you have the panel.
3. **First pass, on the diff alone.** Run one review subagent per lens on the panel, in parallel, each with the [code-review skill](../code-review/SKILL.md) and its lens file. They can read files but not run `gh`, so pass each the diff text, with read-only file tools. Per-tool dispatch melodies, and what to do in a tool without subagents, are in [ROLES.md](../ketcher-flow/roles/ROLES.md) under the reviewer row. Done when every lens on the panel has reported.
4. **Verify.** Check each finding with the [verifier role](../code-review/verifier.md), the one the hub uses: open the cited `file:line`, confirm its failing scenario, and confirm, drop or re-rate the finding. A finding is never verified by the subagent that found it. Done when every finding is confirmed, dropped, or an open question.
5. **The linked issue.** Read the PR description with `gh pr view`, fetch the issue it links with `gh issue view`, and answer whether the diff fixes it, as the [linked-issue role](../code-review/linked-issue.md) sets. With no linked issue, the answer is "no linked issue". The answer goes in the brief.
6. **Findings.** Every finding goes in the brief, one line each, in the order the output contract sets, with the open questions after them. Done when each one is in the brief.
7. **The brief.** Write it as [Human review](../../../.memory-bank/review-workflow.md#human-review) sets, even when no finding survives. Show it to the user and post it with `gh pr comment` only on their approval: it is public on the PR.