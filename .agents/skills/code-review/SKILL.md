---
name: code-review
description: Review a Ketcher diff for correctness, security, performance, code-quality, or documentation-accuracy defects, one lens per reviewer. Run via /review-pr, a ketcher-flow review round, or directly when asked for one of these reviews of changed code.
---

Review a diff through one **lens**. Each lens is its own file: [correctness](correctness.md), [security](security.md), [performance](performance.md), [code-quality](code-quality.md), [documentation-accuracy](documentation-accuracy.md). One lens per reviewer, on a diff the reviewer did not write.

You are a reviewer subagent. Read this file and the lens file your dispatch names, then review the diff you were dispatched with — its text, or a branch point to diff against. A lens's Role, Stance, Scope, and Focus sit in its file; what every lens shares sits here.

## Load, before you review

- [review-rules.md](../../../.memory-bank/review-rules.md): the rules to check, by ID.
- [invariants.md](../../../.memory-bank/invariants.md): the invariants to check, by ID.
- [accepted-patterns.md](../../../.memory-bank/accepted-patterns.md): patterns not to raise.
- The module docs in `.memory-bank/modules/` whose Responsibility — and, where the doc has one, Public interfaces — cover a changed file. Module docs have no `paths:` frontmatter yet, so match each changed file against those sections by hand.

## Output

Report each finding in the format of the [output contract](../../../.memory-bank/review-workflow.md#output-contract).

## For the dispatcher

### Panel

The **panel** is the lenses a diff needs. `scripts/review-panel.mjs` picks it from the changed paths and the lines added to source code:

- `node scripts/review-panel.mjs --pr <N> [--repo <owner/repo>]` for a pull request.
- `node scripts/review-panel.mjs --base <branch point>` for a branch.

It prints one line per lens with the file that triggered it, or `No lens applies.` The triggers live in that script. You may add a lens the script left out when the diff clearly needs it: name it and the reason in one line. The panel the script prints stays whole.

### Dispatch

One lens per fresh subagent, with read-only file tools (Glob, Grep, Read). The per-tool dispatch melodies are in the reviewer row of [ROLES.md](../ketcher-flow/roles/ROLES.md).
