---
name: ketcher-memory-bank
description: "Keep the Ketcher memory bank true: after a change, find the bank files it invalidated and fix them; or answer a question from the bank and fill the gap when it has none."
argument-hint: "sync [<base ref>] | <topic or question>"
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
4. Grep the bank for the paths of the changed files and compare each quoted excerpt with the code
   now. An excerpt that no longer matches is a stale fact: fix the sentence it backs, then re-copy the
   excerpt with the current commit.
5. Report which files changed and why, and what you checked but left alone.

An OpenSpec change updates the bank when it is **archived**, not while it is in progress.

## `<topic>` — answer from the bank

1. Pick the file from the routing table in `CLAUDE.md`; decide from its "Read when / Skip when"
   header before reading it. Grep large files (`glossary.md`, the KET specs) instead of reading them.
2. Answer with the bank file you relied on, and the code excerpt when the answer depends on code.
3. If the bank has no answer, find it in the code, answer, and add it to the right file in the
   format that file uses — with the code excerpt that backs it and the commit it was copied on. A gap you found and did
   not record will be found again by the next session, at the same cost.

## Rules

- One fact in one place; link instead of copying. `CLAUDE.md` stays a routing table.
- `features/` and `domain.md` describe behaviour and never name functions or files.
- Code is cited as an excerpt with its path and commit, never by line number.
- New files open with `> **Read when:**` / `> **Skip when:**`.
