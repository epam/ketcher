# Autotest Workflows

This repository has two GitHub Actions workflows that automate the autotest lifecycle for feature work.

## 1. `create-autotest-request.yml`

This workflow creates a follow-up issue for autotest implementation.

How it starts:
- It runs when an issue gets a label.
- It only continues if the added label is `Run TA creation workflow`.
- It also checks that the labeled issue is a `Feature` issue.

What it does:
- Reads the source feature issue title, description, and link.
- Sends that information to Anthropic with a prompt asking for a concise markdown checklist of test scenarios.
- Validates that the response actually contains checklist items in `- [ ] ...` format.
- Creates a new issue:
  - title: `Autotests: <feature title>`
  - label: `Autotests`
  - type: `Task`
  - body: source issue link plus the generated checklist
- Posts a comment back to the original feature issue with a link to the created autotest request.

Result:
- A feature issue is converted into a dedicated autotest request issue that contains suggested scenarios for automation.

## 2. `implement-autotest.yml`

This workflow turns an autotest request issue into Playwright test code and opens a pull request.

How it starts:
- It runs when a new comment is added to an issue.
- It only continues if all of the following are true:
  - the commenter is a `COLLABORATOR`, `MEMBER`, or `OWNER`
  - the issue has the `Autotests` label
  - the comment contains `@claude implement autotest`
- It also checks that the labeled issue is a `Task` issue.

What it does:
- Checks out the repository.
- Reads the autotest issue and validates that its body contains at least one markdown checklist item.
- Derives a feature-specific target folder from the issue title:
  - `Autotests: Some Feature` becomes a directory under
    `ketcher-autotests/tests/specs/Chromium-popup/Features/<Feature-Name>`
- Invokes Claude Code with instructions to:
  - implement all checklist scenarios as Playwright autotests
  - create the target directory if needed
  - place the generated spec file inside that directory
- Reads the current git branch name.
- Creates a pull request against `master`.
- Adds a comment to the autotest issue with the generated PR link.

Result:
- An `Autotests` issue is translated into Playwright test implementation and a PR that references and closes that issue.

## End-to-end flow

1. A product or engineering task is created as a `Feature` issue.
2. Someone adds the `Run TA creation workflow` label.
3. GitHub Action generates an `Autotests: ...` issue with a checklist of scenarios.
4. The checklist can be reviewed or adjusted in that issue.
5. An authorized contributor comments `@claude implement autotest`.
6. GitHub Action generates the Playwright test implementation and opens a PR.

In short, the first workflow creates the autotest request, and the second workflow implements it.
