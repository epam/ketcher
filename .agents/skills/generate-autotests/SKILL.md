---
name: generate-autotests
description: Generate a Playwright autotest for Ketcher from an Autotest Request issue. Use when asked to write an autotest from an Autotest Request, or when the claude-implement-autotests workflow dispatches it.
---

You are a QA automation engineer for Ketcher, an open-source chemical structure editor (TypeScript/React). Generate a Playwright autotest based on Autotest Request issue number (AUTOTEST_REQUEST_NUMBER), title (AUTOTEST_REQUEST_TITLE), url (AUTOTEST_REQUEST_URL) and details (AUTOTEST_REQUEST_DETAILS).

## Conventions

`.memory-bank/testing/testing.md` is the only source for E2E conventions: imports, fixtures, page objects, selectors, naming, the comment block, and what to avoid. Read it before writing anything and follow it. This file covers only what is specific to generating tests from an Autotest Request.

## Steps

1. Read `.memory-bank/testing/testing.md` and the Autotest Request details. Find the existing page objects and helpers that cover the scenario (testing.md, "Page Objects and Helpers").
2. Before writing spec code in an interactive run, get approval as testing.md requires ("E2E Test Plans").
   - Known exception: the `claude-implement-autotests.yml` workflow runs this skill with no user to answer, so it writes the spec without asking.
3. Write the spec under `ketcher-autotests/tests/specs/`, following testing.md for file location and for any page object or helper you add.
4. Run the new spec with the commands in testing.md ("How to Run E2E Tests") and record the result.
   - Known exception: the `claude-implement-autotests.yml` workflow gives no tool that runs commands, so it skips this step. CI runs the spec on the PR that the workflow opens, but only after a user with write access clicks "Approve workflows to run" on that PR.

## Checklist coverage

For a bug ticket, see "Bug ticket" below. For a feature request, write one test for each checklist item in AUTOTEST_REQUEST_DETAILS, in the same order. Start each test title with the item number, such as `Case 3 - ...`. If an item cannot be automated, do not leave it out: add it as `test.skip` with the same title, and a comment that gives the reason and links AUTOTEST_REQUEST_URL (testing.md, "Test Design Anti-Patterns").

## Comment block

The `Test task` line of the comment block is AUTOTEST_REQUEST_URL. For a feature request, the `Version` line comes from the milestone of the feature issue, as testing.md says; the `claude-implement-autotests.yml` workflow gives it as KETCHER_VERSION. The rest of the block follows testing.md.

## Bug ticket

An Autotest Request titled "Autotests for Ketcher <version> bugs" (usually with "- Part N") asks for tests of fixed Ketcher or Indigo bugs, not of a feature. Each checklist item links one bug, and a checked item is already done. testing.md gives the spec file, the case numbers, the comment block with its `Bug` line and `Version`, and the test-data folder ("Naming", and the comment block in "Test Structure"). For each unchecked item:

- Write one test, in checklist order, and keep the tests already in the file, and their test data, as they are. Create the file only when it does not exist.
- Take the scenario from the text of the bug: the workflow gives it as BUG_DETAILS, and in an interactive run you read the bug issue. `Description` is the bug title.
- When the text gives no steps you can automate, add a `test.skip` with the same kind of title, and a comment that gives the reason and links the bug.

## Output

- The spec file path, and the path of every page object or helper you created.
- The result of the spec run.
- Any testing.md convention you could not follow, with the reason.
- Git commits follow the git rules in `AGENTS.md`.