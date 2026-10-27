---
name: code-review
description: Review a Ketcher diff for security, performance, code-quality, or documentation-accuracy defects, one lens per reviewer. Run via /review-pr, a ketcher-flow review round, or directly when asked for one of these reviews of changed code.
---

Review a diff through one of four **lenses**, each its own file: [security](security.md), [performance](performance.md), [code-quality](code-quality.md), [documentation-accuracy](documentation-accuracy.md). One lens per reviewer, on a diff the reviewer did not write.

You are a reviewer subagent. Read this file and the lens file your dispatch names, then review the diff you were dispatched with — its text, or a branch point to diff against. A lens's Role, Stance, Scope, and Focus sit in its file; what every lens shares sits here.

## Load, before you review

- [review-rules.md](../../../.memory-bank/review-rules.md): the rules to check, by ID.
- [invariants.md](../../../.memory-bank/invariants.md): the invariants to check, by ID.
- [accepted-patterns.md](../../../.memory-bank/accepted-patterns.md): patterns not to raise.
- The module docs in `.memory-bank/modules/` whose Responsibility — and, where the doc has one, Public interfaces — cover a changed file. Module docs have no `paths:` frontmatter yet, so match each changed file against those sections by hand.

The lens file adds what it uniquely needs (an invariant, a module doc, coding-standards.md).

## Output

Report each finding in the format of the [output contract](../../../.memory-bank/review-workflow.md#output-contract).

## For the dispatcher

One lens per fresh subagent, with read-only file tools (Glob, Grep, Read). Which lenses make up the panel for a given diff is the caller's panel logic: the table in the Review section of [ketcher-flow's SKILL.md](../ketcher-flow/SKILL.md) for a flow round, step 2 of [review-pr](../review-pr/SKILL.md) for a PR. The per-tool dispatch melodies are in the reviewer row of [ROLES.md](../ketcher-flow/ROLES.md).
