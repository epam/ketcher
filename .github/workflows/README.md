# Autotest Workflows

This directory contains two issue-driven GitHub Actions for autotest generation.

Workflow files:

- `create-autotest-request.yml`
- `create-autotest.yml`

## Before use

Repository setup required:

- Secret: `ANTHROPIC_API_KEY`
- Issue labels:
  - `Run TA creation workflow`
  - `Autotests`
- Issue types:
  - `Feature`
  - `Task`

## Workflow 1: Create Autotest Request

Use this when you have a product or feature issue and want a test-request issue prepared from it.

How to use:

1. Open or find a `Feature` issue.
2. Add the label `Run TA creation workflow`.

Final result:

- A new `Task` issue is created with title `Autotests: <feature title>`.
- The new issue gets the `Autotests` label.
- The body contains:
  - link to the source feature issue
  - suggested test scenarios as a checklist
- The source feature issue gets a comment with a link to the created autotest request.

## Workflow 2: Generate Playwright Tests

Use this when the autotest request is ready to be turned into code.

How to use:

1. Open the `Task` issue created for autotests.
2. Confirm it has the `Autotests` label.
3. Confirm its body includes at least one markdown checklist item.
4. Add the label `Run TA creation workflow`.

Final result:

- A new branch with generated Playwright autotest files is pushed.
- A pull request to the default branch is created automatically.
- The autotest request issue gets a comment with a link to the PR.

## Expected flow

1. Start from a `Feature` issue.
2. Run Workflow 1 to create the autotest request.
3. Review or adjust the checklist in the new `Task` issue.
4. Run Workflow 2 to generate the PR with tests.
