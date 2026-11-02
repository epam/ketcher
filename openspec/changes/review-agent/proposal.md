## Why

Code review is the main bottleneck of the Ketcher contribution flow (#12246). `.memory-bank/review-workflow.md` plans the rest of the AI review as Phase 5: a second, independent verifier pass, suggestion blocks, and an evaluation set (tasks 5.1 and 5.4). Today `claude-review.yml` runs the `/review-pr` skill in one model conversation. `scripts/review-panel.mjs` picks the lenses (#12548), and the same conversation starts one subagent per lens, checks their findings itself, and posts. That conversation reads the pull request and can post comments at the same time, the output format is asked for in prose, and nothing limits rounds or remembers what was already posted.

Most maintainer change requests on Ketcher PRs fall into a few checkable kinds: a bug or regression, an existing helper or mechanism not reused, a fix in the wrong place, weakened type safety, unnecessary code, files the issue does not need, and behavior that differs from the equivalent feature in another mode, canvas or format. The review should find these, prove each one, and stay cheap enough to run on demand.

## What Changes

- Add a review **hub** in `scripts/review/` (JavaScript modules in the style of the existing `scripts/*.mjs`). The hub contains no model. It computes the diff and the scope, takes the panel from `scripts/review-panel.mjs`, selects rules, runs the finder passes, merges duplicates, sends findings to verification, keeps state between rounds, and posts.
- Run every finder pass and every verification as a separate `claude -p` process with `--output-format json --json-schema`, so the runtime validates each output against a schema. Each process runs in safe mode with read-only tools; prompts and configuration come from the base branch, and the PR is only read as data. Only the hub posts.
- Use the code-review lenses as finder passes, as `scripts/review-panel.mjs` picks them. Add a `reuse` lens (an existing helper, type, constant or mechanism that the new code should use or extend) and its trigger in the panel script. Add "fix in the wrong place" to the focus of the `correctness` lens.
- Add a verifier role: one fresh pass per finding that sees only the finding and the code, checks the failing scenario, and confirms or drops the finding.
- Follow the output contract in `.memory-bank/review-workflow.md` unchanged: first pass without the PR description, then the linked-issue question; severities `blocker`, `major`, `nit`; `file:line`, rule or invariant ID and failing scenario on every finding; at most 10 inline comments, blockers first; accepted patterns not raised; no praise and no summary.
- Start each review round by hand with a label, review only new commits after the first round, never repeat a posted finding, and stop after three rounds.
- Make the finder and verifier models configurable, with an Opus label for a stronger run.
- Add an evaluation harness (task 5.1): replay past PRs with known maintainer change requests and clean PRs, compare model configurations, and report recall, false positives, cost and duration. Align it with the evaluation work that the #12548 author has started, so the two do not duplicate each other.
- Change `claude-review.yml` to run the hub instead of `claude-code-action` with `/review-pr`. `/review-pr` stays for local and agent use.
- Out of scope: risk tiers and AI review raising a tier (task 5.5), feedback tracking from 👎 reactions (task 5.6), large-scale change handling (task 5.7), review on every PR without a label (task 5.3), new review rules (they go to `review-rules.md` as `proposed` in a separate change), reviewing `ketcher-autotests/`.

## Capabilities

### New Capabilities

- `pr-review`: on-demand automated review of a pull request: trigger and labels, scope and panel, rule selection, schema-validated finder passes, independent verification, the posted comments and brief, and rounds.
- `pr-review-eval`: offline evaluation of the review against past pull requests: the evaluation set, model configurations, reuse of finder output, and the report.

### Modified Capabilities

- none.

## Impact

- New: `scripts/review/**` (hub, schemas, configuration, `node:test` tests, evaluation harness), `scripts/fixtures/review/**`, `.agents/skills/code-review/reuse.md`, `.agents/skills/code-review/verifier.md`, the `diff` (jsdiff) dev dependency.
- Changed: `scripts/review-panel.mjs` (the `reuse` trigger), `.agents/skills/code-review/SKILL.md` and `correctness.md`, `.github/workflows/claude-review.yml`, `.github/workflows/README.md`, `.memory-bank/review-workflow.md` (Phase 5 items move from planned to done when the change is archived).
- Authentication: the hub uses the existing `CLAUDE_CODE_OAUTH_TOKEN`, a team member's Claude account, through `claude -p --safe-mode` (bare mode does not read this token). Every finder and verifier run counts against that account's limits. If the AI secrets move to a protected environment (#12513), the review job uses that environment.
- Testing: hub logic is covered by `node:test` tests without model calls. The full flow runs first locally in dry-run mode on past PRs, because the CI secret only exists in the main repository and the first CI run happens after merge.
- No change to the Ketcher packages or their runtime behavior.