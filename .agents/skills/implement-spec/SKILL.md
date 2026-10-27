---
name: implement-spec
description: 'Implement an OpenSpec change (openspec/changes/<change>/) task by task.'
disable-model-invocation: true
---

Implement the OpenSpec change the user names, in `openspec/changes/<change>/`. The change folder is the spec:

- `proposal.md`: why the change exists and its scope
- `specs/`: the requirements
- `design.md`: how it is built
- `tasks.md`: the checklist to implement

## Steps

1. Read `proposal.md`, `design.md`, `specs/`, and `tasks.md`. Read the `.memory-bank/` files for the area you touch before writing code.

2. Work the tasks in `tasks.md` in order. Before a task, check it still fits the code. If the design does not fit the code, stop and tell the user. Do not change the design silently.

3. For each task, implement it with /tdd at pre-agreed seams, then mark it `- [x]` in `tasks.md` before you start the next one. Mark tasks one at a time, never all at the end.

4. Run typechecking and the single test files for what changed. Run the full test suite once at the end. Validate the change with `openspec validate <change> --strict`.

5. Once all tasks are done, use /code-review on the diff against the base branch.

6. Ask before writing Playwright E2E tests. First read `.memory-bank/testing/testing.md`, then draft a plan from `.memory-bank/testing/e2e-test-plan-template.md` and get approval before you write spec code.

7. Update `.memory-bank/` only when archiving the change, not while it is in progress.

8. Do not create a branch, open a PR, or commit until the user approves. Show the staged diff first, then commit only on approval. Do not merge.

The ticket pipeline (`handle-tickets` with `ticket-implementer`) is a separate flow with no spec. Use `implement` for a single ticket.
