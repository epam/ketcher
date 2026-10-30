# AGENTS.md

Rules for AI coding tools in this repository: Claude Code, Codex, and GitHub Copilot. Tool files (`CLAUDE.md`, `.github/copilot-instructions.md`) point here and add only what one tool needs.

## What Ketcher is

Ketcher is an open-source chemical structure editor written in TypeScript and React. It draws molecules, reactions, macromolecules, and monomers with a custom MVC architecture over SVG.

The repo is an npm workspaces monorepo. The packages are `packages/ketcher-core` (domain and application logic, no React), `packages/ketcher-react` (UI), `packages/ketcher-macromolecules`, and `packages/ketcher-standalone`. `example/` and `demo/` are apps that use them. `ketcher-autotests/` holds the Playwright E2E suite.

## Commands

Run from the repo root unless a line says otherwise. Node.js 24.20.0 or newer and npm 7 or newer are required. [DEVNOTES.md](DEVNOTES.md) has setup details.

- Install: `npm install`. Run it only from the root.
- Build the packages and the example app: `npm run build`.
- Dev server for the example app: `cd example && npm run dev:standalone`.
- Checks for the four packages: `npm test`. It runs each package's `test` script.
- Unit tests in one package: `cd packages/<name> && npm run test:unit`. Unit tests use Jest.
- Types in all workspaces: `npm run test:types`.
- E2E tests: `cd ketcher-autotests && npm test`. Playwright. Conventions are in `.memory-bank/testing/testing.md`.

## Where knowledge lives

`.memory-bank/` is the knowledge base. Read it before any non-trivial task: before implementing, fixing, refactoring, writing tests, or designing a change, and whenever architecture, domain terms, or invariants are unclear. Each fact has one owner file. Other files link to it and do not restate it.

| Fact                                           | Owner                                            | Format                                                                                                 |
| ---------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| Current product behavior (WHEN/THEN scenarios) | `openspec/specs/<capability>/spec.md`            | Requirements with SHALL text and scenarios. Archiving a change merges its deltas here.                 |
| Feature summary and limitations                | `.memory-bank/features/<name>.md`                | Title, problem, link to the spec, Limitations, Related. No second copy of behavior.                    |
| Architecture and data flow                     | `.memory-bank/architecture.md`                   | Package structure, subsystems, data flow                                                               |
| Subsystem                                      | `.memory-bank/modules/<name>.md`                 | Responsibility, Public interfaces, Dependencies, Dependents, Assumptions & constraints                 |
| Domain concepts                                | `.memory-bank/domain.md`                         | Entities, relationships, constraints                                                                   |
| Terms                                          | `.memory-bank/glossary.md`                       | Term, Definition, Used In                                                                              |
| Non-negotiable rules                           | `.memory-bank/invariants.md`                     | Labeled IDs (D1, A1, B1, ...), each a rule that must never break                                       |
| Architecture decisions                         | `.memory-bank/adr/YYYY-MM-DD-<title>.md`         | Decision, Context, Alternatives considered, Rationale, Consequences                                    |
| File formats (KET, MOL)                        | `.memory-bank/formats/`                          | Format specifications and their index                                                                  |
| E2E testing strategy                           | `.memory-bank/testing/testing.md`                | Levels, locations, how to run, selector and fixture rules                                              |
| Plan for a new E2E spec file                   | `.memory-bank/testing/e2e-test-plan-template.md` | Plan structure, approved before spec code                                                              |
| Review rules                                   | `.memory-bank/review-rules.md`                   | `### R<n>` blocks with Scope, Severity, Enforced by, Status, Why, Source                               |
| Accepted review patterns                       | `.memory-bank/accepted-patterns.md`              | `###` per pattern: Where, Why it is accepted, Example                                                  |
| Coding standards                               | `.memory-bank/coding-standards.md`               | Conventions, each with its evidence                                                                    |
| PR types and review output                     | `.memory-bank/review-workflow.md`                | Flows, PR-type table, output contract                                                                  |
| Public API reference                           | `packages/ketcher-core/docs/`                    | Generated TypeDoc output. It is committed and not regenerated, so check the source before you trust it |
| Setup and development                          | `DEVNOTES.md`                                    | Human-facing setup guide                                                                               |
| Agent rules                                    | `AGENTS.md`                                      | Tool files link here                                                                                   |

Rules for updating the memory bank:

- The PR that changes a fact also updates the file that owns it (table above). An OpenSpec change in progress is the exception: it updates the memory bank when it is archived, not before.
- The PR description names the memory-bank file it updated, or says "Memory bank: not needed".
- Features and `domain.md` name no functions, files, or variables. Put those in `modules/` or code comments.
- Edit each file in the format its row above gives.

## Rules

Each rule lives in one owner file. Read the owner before you change code in its area.

- **Invariants**: [invariants.md](.memory-bank/invariants.md). Rules that must never break. Findings cite their IDs.
- **Review rules**: [review-rules.md](.memory-bank/review-rules.md). Rules a reviewer checks in a diff, with scope, severity, and status.
- **Accepted patterns**: [accepted-patterns.md](.memory-bank/accepted-patterns.md). Patterns that reviewers do not raise.
- **Coding standards**: [coding-standards.md](.memory-bank/coding-standards.md). Language, React, test, and tooling conventions.
- **E2E tests**: [testing.md](.memory-bank/testing/testing.md). Selectors, fixtures, and the E2E planning steps.
- **Review output**: [review-workflow.md](.memory-bank/review-workflow.md#output-contract). Severity levels and the format of each finding.

## Git and commits

- Work on a feature branch. Commit, push it, and open a PR without asking. `master` is protected, so every change lands through PR review.
- Exception: the `/commit` skill and `prepare-release` show the staged diff and wait for approval before each commit. Their purpose is that review.
- Do not commit to `master` or a release branch, force-push a branch someone else works on, or merge a PR.
- Commit subjects and PR titles use the form in [coding-standards.md](.memory-bank/coding-standards.md#tooling-and-process).

## Skills and tool files

- **Shared skills** live in `.agents/skills/<name>/`. `.claude/skills/<name>` is a relative symlink to that folder (`../../.agents/skills/<name>`), so Claude Code and Codex read one copy. To share a skill, move it there and add the symlink.
- **Claude-only skills** would live directly in `.claude/skills/`. There are none today.
- **Vendored skills**: `diagnosing-bugs`, `tdd`, and `codebase-design` come from `mattpocock/skills`, pinned in `skills-lock.json`. Do not edit them: update them with `npx skills update`, and put Ketcher specifics in the skill that calls them (`ketcher-flow`).
- **Verification skills**: `create-verification-skill` and `maintain-verification-skill` are adapted from pstack and belong to the repo. They generate and maintain `verify-ketcher`.
- **Verify in the app**: before you report a change that a user can see in the editor as done, run `verify-ketcher`. It starts the example app, drives it in a browser, and saves the exported structure, a screenshot, and console errors as evidence. Put its result in the PR under "Verified in the app". Remote mode is not proven yet.
- **OpenSpec skills**: `openspec-propose` starts a change in `openspec/changes/`, `openspec-apply-change` implements its tasks, and `openspec-archive-change` archives it (then update the memory bank, see above). `openspec-explore`, `openspec-sync-specs`, and `openspec-update-change` help along the way. They are generated by the pinned `@fission-ai/openspec` (`npx openspec update --force`); do not edit them by hand. Ketcher rules for them live in `openspec/config.yaml` under `context:`. Using them is optional; the change folder format is what counts.
- **PR body**: write the title and body of every PR with `ketcher-pr` ([SKILL.md](.agents/skills/ketcher-pr/SKILL.md)), the Ketcher adaptation of `pr` from `mattpocock/skills`.
- **PR review**: `/review-pr <PR number>` ([SKILL.md](.agents/skills/review-pr/SKILL.md)) runs the code-review lenses its diff needs as fresh subagents on a PR (`scripts/review-panel.mjs` picks them) and posts the verified findings and the review brief. `claude-review.yml` runs it in CI.
- **Workflow**: `/ketcher-flow <scope>` ([SKILL.md](.agents/skills/ketcher-flow/SKILL.md)) takes a feature, a bug, a refactor, a small change, a list of symptoms, a batch of tasks of any kinds, or review comments on open PRs to a reviewed PR. Features go through the OpenSpec skills. When you take on a task with code changes and your tool cannot run the skill, read that file and follow the flow it picks.
- **E2E tests**: before you write Playwright specs, read [testing.md](.memory-bank/testing/testing.md) and ask the user to proceed. For a new spec file or folder, follow its E2E Test Plans section.
- **Copilot** reads skills from `.agents/skills/` and `.claude/skills/`. `.github/instructions/*.instructions.md` are generated from `review-rules.md`; do not edit them by hand.
- **Subagents**: the repo defines no named agent files. A subagent's instructions live in a skill under `.agents/skills/`, dispatched as [ROLES.md](.agents/skills/ketcher-flow/roles/ROLES.md) says: the prompt names the skill and, where one exists, the lens or role file. Codex and Copilot get the same paths — no generated agent files to maintain.

## Unverified tool behaviors

These are not tested yet. Check each one before you rely on the symlink setup.

- Codex and GitHub Copilot accept SKILL.md frontmatter fields outside the Agent Skills spec, such as `disable-model-invocation`, `argument-hint`, and `user-invocable`.
- GitHub Copilot lists a skill twice when it exists in `.agents/skills/` and is also reached through a `.claude/skills/` symlink.
- Codex and GitHub Copilot CLI let a subagent dispatch subagents, which a `ketcher-flow` batch needs for its task orchestrators. Claude Code allows it by default.
- GitHub Copilot CLI runs the `ketcher-flow` roles as `general-purpose` subagents through its `task` tool, with the model set on each call. GitHub's CLI docs describe this; no run in this repo has tried it.
