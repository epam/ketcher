## 1. Lenses and roles

- [x] 1.1 Add `.agents/skills/code-review/functional-correctness.md` (bugs, regressions, invariant breaks, undo/redo, serialization round trips, mode and canvas switching), in the format of the existing lens files.
- [x] 1.2 Add `.agents/skills/code-review/reuse.md` (existing helper, type, constant or mechanism the change should use or extend; the finding names it by `file:line`).
- [x] 1.3 Add the verifier role file `.agents/skills/code-review/verifier.md`: checks one finding against the code, confirms or drops it, may change its severity.
- [ ] 1.4 Add both lenses to the lens list in `.agents/skills/code-review/SKILL.md`, and remove output-format wording that the schema now carries.

## 2. Hub foundation

- [ ] 2.1 `scripts/review/config.mjs`: Quick threshold, sensitive paths, N, concurrency, model IDs per role, stronger model, budgets, turn limits, label names, skip globs, `authMode`.
- [ ] 2.2 `scripts/review/schemas.mjs`: JSON Schemas (draft-07) for findings, verdicts and the linked-issue answer, matching the output contract.
- [ ] 2.3 `scripts/review/diff.mjs`: parse a unified diff into files, hunks and changed line sets; changed line count; "is line in diff".
- [ ] 2.4 Tests for 2.3 with fixture patches (added, deleted, renamed, binary files).

## 3. Pure hub logic

- [ ] 3.1 `scope.mjs`: base…head for round 1, previousHead…head later, fallback when previousHead is not an ancestor; skip globs.
- [ ] 3.2 `depth.mjs`: Quick label, threshold, sensitive paths.
- [ ] 3.3 `rules.mjs`: select `review-rules.md` blocks by `Scope`, reusing or following `scripts/agent-docs/rules.mjs`.
- [ ] 3.4 `merge.mjs`: drop findings without a failing scenario, merge by file, rule ID and line distance, fingerprint, drop already posted fingerprints, rank, cap N.
- [ ] 3.5 `state.mjs`: write and read the hidden marker, pick the newest marker from the bot account, round limit.
- [ ] 3.6 `format.mjs`: inline comments (cap 10, blockers first), the brief (linked-issue answer, PR type, counts per severity, overflow and out-of-diff findings, failed passes), the round-limit comment.
- [ ] 3.7 Tests for 3.1–3.6, including parsing the real `review-rules.md`.

## 4. Model runs

- [ ] 4.1 `runner.mjs`: build the `claude -p` arguments (isolation flag by `authMode`, read-only tools, `dontAsk`, strict MCP, no session persistence, schema, model, max turns, budget, role prompt), start without a shell, pipe the input, read `structured_output`, map failures to a failed pass, record cost and duration.
- [ ] 4.2 Test that the arguments always contain the isolation flag, `--tools Read,Grep,Glob` and `dontAsk`, and never `Bash`.
- [ ] 4.3 `passes.mjs`: lenses per depth, concurrency-limited parallel runs.
- [ ] 4.4 `verify.mjs` and the linked-issue run.
- [ ] 4.5 Run one real `claude -p --safe-mode` call locally with `CLAUDE_CODE_OAUTH_TOKEN`; confirm authentication, structured output, and that a test hook in the working tree does not run. Record the result in `design.md`.

## 5. GitHub and entry point

- [ ] 5.1 `github.mjs`: PR metadata, linked issue, diff for a commit range, previous markers, one review with inline comments, top-level comment, label removal; injectable for tests.
- [ ] 5.2 `index.mjs`: CLI (`--pr`, `--dry-run`, `--quick`, `--finder-model`, `--verifier-model`, `--save-findings`, `--findings-from`, `--log`), the full flow, label removal in `finally`, JSON run log.
- [ ] 5.3 Test of the full flow with fake GitHub and fake runner, including the round limit and label removal on failure.
- [ ] 5.4 Local dry runs on 2–3 past PRs; tune prompts and thresholds.

## 6. Evaluation

- [ ] 6.1 `scripts/review/eval/eval-set.json` with 2–3 entries from collected maintainer comments (reviewed head commits, expected findings with comment links) and 1–2 clean PRs.
- [ ] 6.2 Eval runner (configurations, dry run only, finder output reuse) and report script reading `matches.json`.
- [ ] 6.3 Run `sonnet-finders-sonnet-verifier` and `sonnet-finders-opus-verifier`; fill `matches.json`; decide whether to run `opus-finders-opus-verifier`.
- [ ] 6.4 Set the default models in `config.mjs` from the results and record the decision in `design.md`.

## 7. Workflow and docs

- [ ] 7.1 Rewrite `.github/workflows/claude-review.yml`: same trigger and filter, base checkout plus PR head checkout as data, pinned Claude Code install, hub run, permissions `contents: read`, `pull-requests: write`, `issues: write`, actions pinned to SHAs.
- [ ] 7.2 Create the labels `Claude Review: Quick` and `Claude Review: Opus` (maintainer action).
- [ ] 7.3 Change `.agents/skills/review-pr/SKILL.md` to run the hub, in dry-run mode outside CI.
- [ ] 7.4 Update the `claude-review.yml` row in `.github/workflows/README.md`.