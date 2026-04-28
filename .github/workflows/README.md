# Autotest Automation Workflows

This directory contains two GitHub Actions that support AI-assisted Playwright test generation for Ketcher:

- `create-autotest-request.yml`
- `create-autotest.yml`

They are both triggered by the same issue label:

- `Run TA creation workflow`

The label does different work depending on the issue type:

- `Feature` issue -> create an Autotest Request issue
- `Task` issue with the `Autotests` label -> generate test files and open a pull request

## What the workflows do

### 1. Create an Autotest Request from a feature issue

Workflow: `create-autotest-request.yml`

This workflow runs when:

- the label `Run TA creation workflow` is added to an issue
- the issue type is `Feature`

What it does:

1. Reads the feature issue title and body.
2. Sends that content to Anthropic.
3. Asks for a markdown checklist of suggested automation scenarios.
4. Creates a new GitHub issue with:
   - title `Autotests: <feature title>`
   - type `Task`
   - label `Autotests`
5. Adds the following body structure to the created issue:
   - `Source task(s):` with a link to the original feature issue
   - `Suggested test scenarios:` with AI-generated checklist items
6. Posts a comment back on the source feature issue with a link to the created Autotest Request.

### 2. Generate Playwright autotests from an Autotest Request

Workflow: `create-autotest.yml`

This workflow runs when:

- the label `Run TA creation workflow` is added to an issue
- the issue type is `Task`

Before generation starts, the workflow validates that the issue:

- has the `Autotests` label
- contains at least one markdown checklist item like `- [ ] Scenario`

What it does:

1. Reads the Autotest Request issue title and body.
2. Uses the issue content as the prompt for Anthropic.
3. Requests a JSON response with:
   - one Playwright spec file
   - optional reusable helper/page-object files
4. Writes the generated spec under:

```text
ketcher-autotests/tests/specs/Chromium-popup/Features/#<issue number> - <feature title>/<slug>-<issue number>.spec.ts
```

5. Writes any additional generated files only under:
   - `ketcher-autotests/tests/pages/`
   - `ketcher-autotests/tests/utils/`
6. Creates a branch named:

```text
autotest/issue-<issue number>-<slug>
```

7. Commits the generated files.
8. Pushes the branch to `origin`.
9. Opens a pull request against the repository default branch with title:

```text
#<issue number> - <issue title>
```

10. Posts the PR link back to the Autotest Request issue.

## Required repository setup

The workflows depend on the following repository configuration:

- Secret `ANTHROPIC_API_KEY` must exist.
- GitHub Issues must support issue types, because the workflows check for `Feature` and `Task`.
- The repository should have these issue labels available:
  - `Run TA creation workflow`
  - `Autotests`
- GitHub Actions must be allowed to:
  - create issues
  - comment on issues
  - push branches
  - create pull requests
