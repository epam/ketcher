---
name: ketcher-memory-bank
description: "Keep the Ketcher memory bank true: after a change, find the bank files it invalidated and fix them; or answer a question from the bank and fill the gap when it has none. Also verifies code anchors."
argument-hint: "sync [<base ref>] | <topic or question>"
allowed-tools: Bash(node ${CLAUDE_SKILL_DIR}/scripts/check-anchors.mjs*) PowerShell(node ${CLAUDE_SKILL_DIR}/scripts/check-anchors.mjs*)
---

# Memory bank upkeep

Mode: **$ARGUMENTS**. Formats and writing rules: [.memory-bank/README.md](../../../.memory-bank/README.md).

## `sync` — after a change, in the same change

1. List what changed: `git diff --stat <base>` (default `HEAD`) plus untracked files.
2. Map each change to the bank:

   | The change touched | Update |
   | --- | --- |
   | user-visible behaviour | the matching `features/*.md` (behaviour only, no code names) |
   | a subsystem's responsibility, interfaces or constraints | its `modules/*.md` |
   | a rule that now must never break | `invariants.md`, with a new ID — never renumber old ones |
   | a structural decision with alternatives | a new `adr/<date>-<title>.md` |
   | a term | `glossary.md` |
   | test layout, commands, fixtures | `testing.md` or `testing-e2e.md` |

3. Grep the bank for every renamed or removed symbol and path; each hit is a stale sentence.
4. Run the anchor check and fix every failure:

   ```sh
   node ${CLAUDE_SKILL_DIR}/scripts/check-anchors.mjs
   ```

   It resolves every `` `path#Symbol` `` in `CLAUDE.md`, `.memory-bank/` and `.claude/`; pass extra
   folders to check them too (e.g. the local module's notes). `--strict` also fails on line-number
   anchors.
5. Report which files changed and why, and what you checked but left alone.

An OpenSpec change updates the bank when it is **archived**, not while it is in progress.

## `<topic>` — answer from the bank

1. Pick the file from the routing table in `CLAUDE.md`; decide from its "Read when / Skip when"
   header before reading it. Grep large files (`glossary.md`, the KET specs) instead of reading them.
2. Answer with the file and anchor you relied on.
3. If the bank has no answer, find it in the code, answer, and add it to the right file in the
   format that file uses — with anchors and the commit they were verified on. A gap you found and did
   not record will be found again by the next session, at the same cost.

## Rules

- One fact in one place; link instead of copying. `CLAUDE.md` stays a routing table.
- `features/` and `domain.md` describe behaviour and never name functions or files.
- Anchors are `path#Symbol`, never line numbers.
- New files open with `> **Read when:**` / `> **Skip when:**`.
