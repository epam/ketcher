---
paths:
  - ".memory-bank/**"
  - "CLAUDE.md"
  - ".claude/**"
description: "Writing into the memory bank and the assistant configuration"
---

# Writing knowledge and assistant configuration

Document formats: [.memory-bank/README.md](../../.memory-bank/README.md). Syncing the bank after a
change: the `ketcher-memory-bank` skill.

- Every bank file opens with `> **Read when:**` and `> **Skip when:**` so a reader can skip it unread.
- Cite code as `` `path#Symbol` `` — a path from the repository root and a literal that occurs in
  that file — and name the commit it was checked on. No line numbers: they go wrong silently.
  `node .claude/skills/ketcher-memory-bank/scripts/check-anchors.mjs` verifies every anchor.
- One fact, one place. Rules, skills and agents cite invariants by ID instead of restating them;
  `CLAUDE.md` stays a routing table.
- Everything under `.claude/` and `.memory-bank/` is written in English. Keep skill and agent
  `description` lines short: they are loaded into every session.
- `claude-review.yml` and `claude-implement-autotests.yml` run `.claude/commands/review-pr.md` and
  `.claude/agents/*` by name — renaming them breaks CI.

## How Claude Code actually loads this (verified on 2.1.278, where the docs disagree)

- `CLAUDE.md` and `.claude/rules/` load only when this checkout is the session's primary directory
  (or, without `paths:`, with `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD=1`); a rule with `paths:`
  never fires from an additional directory. Skills and agents load from both.
- A skill's `paths:` hides it from the listing until a matching file is read — matched against the
  **primary** directory, even for a skill in an additional one. Product skills here carry no
  `paths:`, so they stay visible when a session starts in a sibling folder.
- A skill with `disable-model-invocation: true` cannot be preloaded by an agent's `skills:`.
- `` !`command` `` in a skill runs through the permission check, in Git Bash unless `shell:` says
  otherwise, and one failing command empties the whole skill. Inject only a script that cannot fail,
  pre-approved by the skill's `allowed-tools`.
- `tools: Bash(<pattern>)` in an agent does not restrict which commands it runs.
