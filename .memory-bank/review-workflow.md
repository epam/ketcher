# Review workflow

> How does a change get from branch to merge, and who checks what?

Items marked **planned** do not exist yet. Each names the phase (and task) of the review-harness plan that builds it, so no reader takes it for a current mechanism. Unmarked items exist in the repo today.

## Flows

Three flows lead to a merge. The PR type decides what the PR must contain, whichever flow produced it (see the PR-type contract below).

### OpenSpec feature flow

For features and high-risk changes. Only those need a spec.

1. **Propose.** Add `openspec/changes/<change>/` with `proposal.md`, spec deltas, `design.md`, and `tasks.md`.
2. **Implement.** Tick each task when it is done, one at a time.
3. **Archive.** Move the change to `openspec/changes/archive/`. Archiving also updates the owner of current behavior, `openspec/specs/`.

Agents run this flow with the `ketcher-flow` skill, which calls the `openspec-*` skills. Using the skills is optional for people. OpenSpec is pinned in the root `devDependencies`, so `npm install` provides them. CI does not run `openspec validate` yet (planned: Phase 3, task 3.10).

### Ticket flow

For bugs, refactors, and lint cleanups. No spec: one ticket, one PR, linked to the issue. Agents run it with the `ketcher-flow` skill (`.agents/skills/ketcher-flow/`): a bug is diagnosed to a failing test and approved by the user before the fix, a refactor is pinned by tests before code moves, and a small change goes straight to a PR.

### Large-scale change flow

For changes too large to read line by line. Follow the [large-scale change protocol](#large-scale-change-protocol) at the end of this file. The `large-scale-change` label starts it (planned: the label does not exist yet; routing is Phase 4, task 4.6).

## PR-type contract

Checked for every PR, whatever flow the author used. A PR that matches no row follows the PR template checklist only.

| PR type                       | Must contain                                             | Checked by                                                                                                                 |
| ----------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Bug fix                       | Linked issue, a regression test                          | PR template checklist today. Planned: Danger warns when a bug fix has no test change (Phase 3, task 3.4)                   |
| Feature                       | An OpenSpec change (or a spec in the same format), tests | Planned: Danger fails the PR without an OpenSpec change, and `openspec validate --all --strict` (Phase 3, tasks 3.4, 3.10) |
| Large-scale change            | The large-scale change protocol sections                 | Planned: Danger fails the PR when a section is missing, and the codemod replay check (Phase 3, tasks 3.4, 3.8)             |
| Archive of an OpenSpec change | No unchecked tasks                                       | Planned: `openspec validate --archived` (Phase 3, task 3.10)                                                               |

## Review pipeline

The stages run in this order: gates, risk tier, AI review, human review.

### Gates

Today, `.github/workflows/ci.yml` runs on every PR: dependency audit, build, `npm test`, and the example-ssr build, lint, and test. `run-tests.yml` and `run-tests-popup.yml` run the Playwright suite. `sonar.yml` runs the SonarQube quality gate, and `codeql-analysis.yml` runs CodeQL.

Planned:

- Danger on every PR (Phase 3, task 3.4).
- `check:agent-docs` in CI. It runs locally today: `npm run check:agent-docs`.
- `check:autotests` in CI (Phase 3, task 3.5).
- Codemod replay check and compare scripts, on large-scale change PRs only (Phase 3, tasks 3.8, 3.9).
- `openspec validate` in CI (Phase 3, task 3.10).

### Risk tier (planned: Phase 4)

- Each PR gets a `risk:*` label, set from changed paths, changed line count, dependency changes, and public exports (planned: tasks 4.1, 4.2). The highest file tier wins. Over 400 changed lines raises the tier one level.
- A `large-scale-change` PR is at least `high` (planned: task 4.6).
- Code owners per module, so that high-tier PRs need one (planned: task 4.3; decision D3).

### AI review (planned rebuild: Phase 5)

Today, the `Run Claude Review` label starts `claude-review.yml`, which runs the `/review-pr` skill with four reviewer agents. The rebuild replaces that with these steps:

1. **Inputs.** The diff. On the first pass, the PR description is withheld. Then the linked issue. Rules from `.memory-bank/review-rules.md`, `.memory-bank/invariants.md`, and the module docs whose `paths:` match the diff (planned: `paths:` lists from Phase 1).
2. **Finders.** Separate passes that read the diff with a suspicion stance (planned: task 5.4).
3. **Verifier.** A second pass checks each finding against the code before it is posted (planned: task 5.4).
4. **Output.** Verified inline comments with suggestion blocks, and the review brief as one top-level comment (planned: task 5.4). Every finding follows the [output contract](#output-contract).

AI review may raise a risk tier, never lower it (planned: task 5.5).

### Human review

- The reviewer reads the review brief first (planned: Phase 5), then, for large-scale change PRs, the review map.
- Today, `.github/auto_assign.yml` assigns one reviewer from the `core` group.
- Large-scale change PRs need two reviewers, one of them a code owner (planned: task 4.3; decision D9). A 30-minute walkthrough call replaces the first async review round.
- The brief is one top-level comment. It states whether the diff fixes the linked issue, the PR type, the count of findings per severity, the findings that did not fit the comment cap, and, for large-scale changes, the review map.

## Output contract

Applies to every AI reviewer, including `/review-pr` and the reviewer agents. Other documents link here instead of restating it.

1. **Order.** The first pass reads the diff without the PR description. Then fetch the linked issue and answer one question: does the diff fix it? The answer goes in the brief.
2. **Severity.**
   - `blocker`: an invariant break, a regression, or a bug. Fix before merge.
   - `major`: breaks a rule in `.memory-bank/review-rules.md` or a PR-type requirement, with no change in behavior. Fix before merge.
   - `nit`: style or wording. Optional, never blocks.
3. **Content.** Each finding gives `file:line`, the rule or invariant ID, and a failing scenario: the input or sequence that gives the wrong result. The ID is `R<n>` for a rule, `D1`, `A1`, `B1`, and so on for an invariant (see `.memory-bank/invariants.md`), or `none` for a bug that no rule covers. A finding without a failing scenario is dropped.
4. **Comment cap.** At most 10 inline comments per pass, blockers first. Other findings go in the brief, one line each.
5. **Accepted patterns.** Patterns listed in `.memory-bank/accepted-patterns.md` are not raised.
6. **No praise, and no summary** of what the diff does.

## Feedback loop and rule life cycle

Feedback (planned):

- A 👎 on a bot comment makes the pattern a candidate for `.memory-bank/accepted-patterns.md` (planned: tracking in Phase 5, task 5.6).
- A finding that repeats three times becomes a rule proposal (planned: Phase 6, task 6.3).
- Each escaped defect becomes a case in the golden set for the eval (planned: Phase 5, task 5.1; Phase 6, task 6.3).

Rules live in `.memory-bank/review-rules.md` with a `Status` field:

| Status          | Meaning                                                                                   | Moves to                                             |
| --------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `proposed`      | Drafted from review comments or escaped defects. Owners have not approved it.             | `approved`, when the owners approve it (decision D3) |
| `approved`      | The owners accepted the rule.                                                             | `active`                                             |
| `active`        | In the rules file. Generated into `.github/instructions/` unless lint or tsc enforces it. | `moved-to-lint`, or `retired`                        |
| `moved-to-lint` | A lint rule enforces it, and the entry says `Enforced by: lint` (planned: task 3.7).      | `retired`                                            |
| `retired`       | The rule no longer applies. The entry stays, so its ID is not reused.                     | none                                                 |

## Large-scale change protocol

For a change that is too large to read line by line but mostly mechanical. The protocol moves review from reading lines to checking the tool and the evidence. It draws on Google's Large-Scale Changes, codemods, parallel change (expand and contract, strangler fig), stacked PRs, and commit-by-commit review as used for Linux kernel patch series.

**Qualifies (decision D9):** more than 400 changed lines, and either a toolchain or framework upgrade, or at least 80% of changed lines in codemod commits.

**Split options.** Use the first option that works.

1. **Split by package with parallel change.** Old and new tools run side by side, and each PR moves one package. For example, Jest and Vitest coexist: migrate `ketcher-core`, then `ketcher-react`, then `ketcher-macromolecules`, one PR each. Remove the old tool in a last, small PR.
2. **Stack.** When one repo-wide switch cannot be avoided (for example, one root Vite version): a prep PR fixes deprecations on the old version, then the bump PR (mechanical), then follow-up fix PRs.
3. **One PR with separated commits.** Only when options 1 and 2 are impossible.
   - Codemod commits hold the script `scripts/codemods/<name>.mjs` and its output, and nothing else. Trailer: `Codemod: scripts/codemods/<name>.mjs`. The replay check that verifies them is planned (Phase 3, task 3.8).
   - Manual commits hold one reason each, and the message says why.
   - No `Merge master` commits during review. Rebase, then re-run the codemod.

**Required PR body sections** when the `large-scale-change` label is set. Open the PR with `?template=large-scale-change.md` to get them from `.github/PULL_REQUEST_TEMPLATE/large-scale-change.md`.

- **Split decision:** which option, and why the earlier options do not work.
- **Codemod:** script path, how to run it, and the known cases it skips.
- **Evidence of equivalence:** output of the compare scripts (planned: Phase 3, task 3.9), before and after the change.
  - Test runner migration: test count per package; tests added, removed, skipped, or renamed; coverage.
  - Build tool upgrade: `dist/` file list and sizes; diff of the public `.d.ts` exports; standalone consumer check passes; E2E passes.
- **Review map:** the 5 to 10 files with decisions, one line each. The author adds self-review comments on those lines.
- **Revert plan:** how to roll back, and what else must roll back with it.

**Process**

- Risk tier is at least `high` (planned: Phase 4, task 4.6). Category: Ask (Ship/Show/Ask). The author waits for approval before merge.
- Two reviewers, one of them a code owner (decision D9; code owners are planned: Phase 4, task 4.3). A 30-minute walkthrough call replaces the first async review round.
- AI review covers the codemod script and the manual commits only. It skips files that the replay check proves are generated (planned: Phase 5, task 5.7).
- Merge window: agree on a time, ask the authors of conflicting PRs to wait, and merge fast. A long-lived branch collects conflicts.
