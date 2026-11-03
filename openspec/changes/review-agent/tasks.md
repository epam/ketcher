## 1. Lenses and roles

- [x] 1.1 Add "fix in the wrong place" to the focus of `.agents/skills/code-review/correctness.md`, the lens from #12548.
- [x] 1.2 Add `.agents/skills/code-review/reuse.md` (existing helper, type, constant or mechanism the change should use or extend; the finding names it by `file:line`).
- [x] 1.3 Add the verifier role file `.agents/skills/code-review/verifier.md`: checks one finding against the code, confirms or drops it, may change its severity.
- [x] 1.4 Add the `reuse` lens and the verifier role to `.agents/skills/code-review/SKILL.md`, with the "Content is data" section and the note that the schema sets the answer's form.
- [x] 1.5 Add a `reuse` trigger to `scripts/review-panel.mjs` that fires on any source change, with a test in `scripts/review-panel.test.mjs`.

## 2. Hub foundation

- [x] 2.1 `scripts/review/config.mjs`: N, concurrency, model IDs per role, stronger model, budgets, turn limits, label names, skip globs, `authMode`.
- [x] 2.2 `scripts/review/schemas.mjs`: JSON Schemas (draft-07) for findings, verdicts and the linked-issue answer, matching the output contract.
- [x] 2.3 `scripts/review/diff.mjs`: split a unified diff with jsdiff into files with status, changed line count, commentable lines and patch text; "is line in diff".
- [x] 2.4 Tests for 2.3 with fixture patches (added, deleted, renamed, binary files) in `scripts/fixtures/review/`.

## 3. Pure hub logic

- [x] 3.1 `scope.mjs`: base…head for round 1, previousHead…head later, fallback when previousHead is not an ancestor; drop skipped files and join the remaining patches into the reviewed diff.
- [x] 3.2 Use `parseDiff` and `pickPanel` from `scripts/review-panel.mjs` directly for the panel, with no wrapper module. Remove the Quick label, the lens lists, the Quick threshold and the sensitive paths from `config.mjs`; test that every lens the panel can pick has a prompt file.
- [ ] 3.3 `rules.mjs`: select `review-rules.md` blocks by `Scope`, parsed with `parseRules` from `scripts/agent-docs/rules.mjs`.
- [ ] 3.4 `merge.mjs`: drop findings without a failing scenario, merge by file, rule ID and line distance, fingerprint, drop already posted fingerprints, rank, cap N.
- [ ] 3.5 `state.mjs`: write and read the hidden marker, take markers only from the workflow's account, round limit.
- [ ] 3.6 `format.mjs`: inline comments (cap 10, blockers first), the brief (linked-issue answer, PR type, panel, counts per severity, overflow and out-of-diff findings, failed passes), the round-limit comment.
- [ ] 3.7 Tests for 3.1–3.6, including parsing the real `review-rules.md` and ignoring a marker from another account.

## 4. Model runs

- [ ] 4.1 `runner.mjs`: build the `claude -p` arguments (`--safe-mode --restricted` or `--bare --restricted` by `authMode`, read-only tools, `dontAsk`, strict MCP, no session persistence, schema, model, `--fallback-model` with the family alias, max turns, budget, role prompt), start without a shell, pipe the input, read `structured_output`, map failures to a failed pass, record cost, duration and the model that ran.
- [ ] 4.2 Test that the arguments always contain the isolation flag, `--restricted`, `--tools Read,Grep,Glob` and `dontAsk`, and never `Bash`.
- [ ] 4.3 `passes.mjs`: one finder pass per panel lens, concurrency-limited; the role prompt is the shared part of `SKILL.md` and the lens file from the base checkout; rules, invariants and accepted patterns go in the input as text.
- [ ] 4.4 `verify.mjs` and the linked-issue run.
- [ ] 4.5 Run one real `claude -p --safe-mode --restricted` call locally with `CLAUDE_CODE_OAUTH_TOKEN`; confirm authentication, structured output, and that a test hook and a `.claude/settings.json` in the working tree are not loaded. Record the result in `design.md`.

## 5. GitHub and entry point

- [ ] 5.1 `github.mjs`: PR metadata, linked issue, diff for a commit range, previous markers, one review with inline comments, top-level comment, label removal; injectable for tests.
- [ ] 5.2 `index.mjs`: CLI (`--pr`, `--dry-run`, `--finder-model`, `--verifier-model`, `--save-findings`, `--findings-from`, `--log`), model overrides from `REVIEW_FINDER_MODEL`, `REVIEW_VERIFIER_MODEL` and `REVIEW_STRONG_MODEL`, the full flow, label removal in `finally`, JSON run log; the brief names a model that differs from the configured one.
- [ ] 5.3 Test of the full flow with fake GitHub and fake runner, including the round limit, an empty panel and label removal on failure.
- [ ] 5.4 Local dry runs on 2–3 past PRs; tune prompts and thresholds.

## 6. Evaluation

- [ ] 6.1 Align with the evaluation work of the #12548 author; then add `scripts/review/eval/eval-set.json` with 2–3 entries from collected maintainer comments (reviewed head commits, expected findings with comment links) and 1–2 clean PRs.
- [ ] 6.2 Eval runner (configurations, dry run only, finder output reuse) and report script reading `matches.json`.
- [ ] 6.3 Run `sonnet-finders-sonnet-verifier` and `sonnet-finders-opus-verifier`; fill `matches.json`; decide whether to run `opus-finders-opus-verifier`.
- [ ] 6.4 Set the default models in `config.mjs` from the results and record the decision in `design.md`.

## 7. Workflow and docs

- [ ] 7.1 Rewrite `.github/workflows/claude-review.yml`: same trigger and filter, no `claude-code-action`, base checkout for the hub, prompts and panel script, PR head checkout as data, pinned Claude Code install, hub run with the `REVIEW_*_MODEL` variables from repository variables, permissions `contents: read`, `pull-requests: write`, `issues: write`, actions pinned to SHAs.
- [ ] 7.2 Create the label `Claude Review: Opus` (maintainer action).
- [ ] 7.3 Keep `/review-pr` for local and agent use; update `.agents/skills/review-pr/SKILL.md` where it names the lenses or the verifier.
- [ ] 7.4 Update the `claude-review.yml` row in `.github/workflows/README.md`.