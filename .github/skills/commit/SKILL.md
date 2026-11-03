---
name: commit
description: 'Stage task changes for user review, then commit them in Ketcher using the canonical issue-derived title after approval. Use when the user invokes /commit or asks to stage and commit current work.'
argument-hint: '[issue number or URL]'
user-invocable: true
disable-model-invocation: true
---

# Stage, Review, and Commit Task Changes

Stage only the changes for the current task, ask the user to review the staged diff, and commit only after they explicitly approve. The commit subject must also be the exact PR title format used by this repository.

## Title Rule

Use this exact format for both the commit subject and PR title:

`#<task number> – <canonical issue title>`

Get the task number and canonical title from the issue URL or number supplied by the user or current conversation. If only a number is available and GitHub CLI is installed and authenticated, retrieve the title with `gh issue view <number> --json title --jq .title`. Do not guess or paraphrase the issue title. If the issue number or canonical title cannot be determined, ask the user before staging or committing.

## Procedure

1. Run `git status --short --branch` and inspect both staged and unstaged diffs, including untracked files relevant to the task.
2. Identify which changed files and hunks belong to the current task. Preserve all pre-existing user changes. Do not stage unrelated files or use `git add -A` as a shortcut.
3. If the staged index contains unrelated changes, or file-level staging would include unrelated edits within a mixed file, pause and ask the user what to include. Do not reset or discard any changes.
4. Resolve the issue number and canonical issue title, then construct the exact title `#<task number> – <canonical issue title>`.
5. Stage the task-related paths with `git add -- <paths>`. Review `git diff --cached` and confirm it contains only the intended changes.
6. Show the user the staged paths and a concise summary of `git diff --cached`, and ask them to review the staged changes. Do not commit yet.
7. Wait for explicit user approval. If the user requests changes, make only the requested changes, stage them, review the updated cached diff, and ask for approval again. Do not commit while approval is pending or ambiguous.
8. After approval, create the local commit with the exact title as its subject: `git commit -m "#<task number> – <canonical issue title>"`. Do not add a body unless the user asks for one.
9. Do not push, amend, or rewrite history. If a hook blocks the commit, report the failure and do not bypass the hook.
10. Report the commit hash, exact subject, and committed paths. State that the same subject is the PR title to use.
