---
name: implement
description: 'Implement one ticket, or a set of tickets that meet in one diff, without an OpenSpec change. For work that has a change under openspec/changes/, use openspec-apply-change.'
disable-model-invocation: true
---

Implement the work in the ticket or tickets the user names. There is no spec here: the issue body is the requirement.

Use /tdd where possible, at pre-agreed seams.

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

Once done, use /code-review to review the work.

Before delivery, check whether the diff changes a fact that the owner table in `AGENTS.md` (Where knowledge lives) assigns to a file. If it does, update that file in the same PR. Name the file in the PR description, or write "Memory bank: not needed".

Commit on the feature branch as `AGENTS.md` (Git and commits) says.
