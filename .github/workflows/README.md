# Autotest Workflows

This document describes how to start and use the autotest automation defined in:

- `create-autotest-request.yml`
- `create-autotest.yml`

## Prerequisites

- The repository secret `ANTHROPIC_API_KEY` must be configured.
- The user who starts the workflow must have GitHub association `COLLABORATOR`, `MEMBER`, or `OWNER`.

## Flow 1. Create an autotest request from an issue or PR comment

Use this flow when you want the system to prepare an Autotests issue automatically.

### Manual step

Add this exact comment to the source issue or pull request:

```text
@claude suggest Autotest Request
```

### Automatic steps

After the comment is added, `create-autotest-request.yml` does the following automatically:

1. Reads the source issue or PR.
2. If the comment was added to a PR, tries to resolve the linked feature issue from:
   - PR title pattern `#1234 - ...`
   - PR body keywords like `Closes #1234`, `Fixes #1234`, `Resolves #1234`
3. Generates suggested test scenarios.
4. Creates a new issue with title `Autotests: <feature title>`.
5. Adds the `Autotests` label.
6. Sends a `repository_dispatch` event to start `create-autotest.yml`.
7. Posts a link to the created Autotest Request back in the source issue or PR.

## Flow 2. Create an autotest request manually

Use this flow when you want to write or adjust the Autotest Request yourself.

### Manual steps

1. Open the `Autotest request` issue template.
2. Set the title to:

```text
Autotests: <feature title>
```

3. Fill in `Source task(s)`.
4. Add or refine the requested test scenarios in the issue body.
5. Make sure the issue has the `Autotests` label.
6. Create the issue.

### Automatic steps

After the issue is created manually, `create-autotest.yml` starts automatically on the `issues.opened` event.

If the issue was created first and labeled later, `create-autotest.yml` starts automatically on the `issues.labeled` event when the added label is `Autotests`.

## Flow 3. Generate the autotest and pull request

This flow is started automatically:

- from `repository_dispatch` after `create-autotest-request.yml` creates an Autotest Request
- from `issues.opened` when an Autotest Request is created manually with the `Autotests` label
- from `issues.labeled` when the `Autotests` label is added later

`create-autotest.yml` then does the following automatically:

1. Reads the Autotest Request issue title and body.
2. Generates the main Playwright spec.
3. Reuses existing page objects from `ketcher-autotests/tests/pages` and helpers from `ketcher-autotests/tests/utils` when possible.
4. Creates new page objects or helper files under those directories if they are needed and missing.
5. Writes the generated spec to:

```text
ketcher-autotests/tests/specs/Chromium-popup/Features/#<issue id> - <feature title>/
```

6. Creates a branch named:

```text
autotest/issue-<issue id>-<slug>
```

7. Commits the generated files.
8. Pushes the branch.
9. Creates a pull request with title:

```text
#<autotest issue id> - <autotest issue title>
```

10. Adds a comment with the generated PR link to the Autotest Request issue.

## Manual review after generation

The following steps are not automated and must be done manually:

1. Review the generated spec, page objects, and helper functions.
2. Check imports, selectors, assertions, and test naming.
3. Run the relevant autotests if needed.
4. Update the generated code if the AI output is incomplete or incorrect.
5. Review and merge the pull request.

## Expected naming conventions

- Autotest Request issue title:

```text
Autotests: <feature title>
```

- Generated pull request title:

```text
#1234 - Autotests: <feature title>
```

- Generated spec directory:

```text
ketcher-autotests/tests/specs/Chromium-popup/Features/#1234 - <feature title>/
```
