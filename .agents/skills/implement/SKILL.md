---
name: implement
description: 'Implement one ticket, or a set of tickets that meet in one diff, without an OpenSpec change. For work that has a change under openspec/changes/, use /opsx:apply.'
disable-model-invocation: true
---

Implement the work in the ticket or tickets the user names. There is no spec here: the issue body is the requirement.

Use /tdd where possible, at pre-agreed seams.

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

Once done, use /code-review to review the work.

Do not commit from this skill. The caller decides: a ticket agent commits as its own brief says; in an interactive session, show the staged diff and wait for the user's approval before any commit.
