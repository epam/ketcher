## Why

Code review is the main bottleneck of the Ketcher contribution flow (#12246). `.memory-bank/review-workflow.md` plans an AI review rebuild as Phase 5: separate finder passes with a suspicion stance, a verifier that checks each finding against the code before it is posted, verified inline comments, and a review brief (tasks 5.1 and 5.4). Today `claude-review.yml` runs the `/review-pr` skill: one model starts the four code-review lenses, checks their findings itself, and posts. Finding, verifying and posting happen in one conversation, the output format is asked for in prose, and nothing limits rounds or remembers what was already posted.

Most maintainer change requests on Ketcher PRs fall into a few checkable kinds: a bug or regression, an existing helper or mechanism not reused, a fix in the wrong place, weakened type safety, unnecessary code, files the issue does not need, and behavior that differs from the equivalent feature in another mode, canvas or format. The rebuilt review should find these, prove each one, and stay cheap enough to run on demand.

## What Changes

- Add a review **hub** in `scripts/review/` (JavaScript modules in the style of the existing `scripts/*.mjs`). The hub contains no model. It computes the diff and the scope, picks a depth, selects rules and module docs, runs the finder passes, merges duplicates, sends findings to verification, keeps state between rounds, and posts.
- Run every finder pass and every verification as a separate `claude -p` process with `--output-format json --json-schema`, so the runtime validates each output against a schema. Each process runs in safe mode with read-only tools; prompts and configuration come from the base branch, and the PR is only read as data.
- Use the four code-review lenses (`security`, `performance`, `code-quality`, `documentation-accuracy`) as finder passes, and add two lenses to `.agents/skills/code-review/`: `functional-correctness` (bugs, regressions, invariant breaks) and `reuse` (an existing helper, type, constant or mechanism that the new code should use or extend).
- Add a verifier role: one fresh pass per finding that sees only the finding and the code, checks the failing scenario, and confirms or drops the finding.
- Follow the output contract in `.memory-bank/review-workflow.md` unchanged: first pass without the PR description, then the linked-issue question; severities `blocker`, `major`, `nit`; `file:line`, rule or invariant ID and failing scenario on every finding; at most 10 inline comments, blockers first; accepted patterns not raised; no praise and no summary.
- Start each review round by hand with a label, review only new commits after the first round, never repeat a posted finding, and stop after three rounds.
- Make the finder and verifier models configurable, with an Opus label for a stronger run.
- Add an evaluation harness (task 5.1): replay past PRs with known maintainer change requests and clean PRs, compare model configurations, and report recall, false positives, cost and duration.
- Change `claude-review.yml` to run the hub instead of `claude-code-action` with `/review-pr`, and keep `/review-pr` as the local entry point that runs the hub in dry-run mode.
- Out of scope: risk tiers and AI review raising a tier (task 5.5), feedback tracking from 👎 reactions (task 5.6), large-scale change handling (task 5.7), new review rules (they go to `review-rules.md` as `proposed` in a separate change), reviewing `ketcher-autotests/`.

## Capabilities

### New Capabilities

- `pr-review`: on-demand automated review of a pull request: trigger and labels, scope and depth, rule and module-doc selection, schema-validated finder passes, independent verification, the posted comments and brief, and rounds.
- `pr-review-eval`: offline evaluation of the review against past pull requests: the evaluation set, model configurations, reuse of finder output, and the report.

### Modified Capabilities

- none.

## Impact

- New: `scripts/review/**` (hub, schemas, configuration, `node:test` tests, evaluation harness), `.agents/skills/code-review/functional-correctness.md`, `.agents/skills/code-review/reuse.md`, a verifier role file.
- Changed: `.github/workflows/claude-review.yml`, `.agents/skills/review-pr/SKILL.md`, `.agents/skills/code-review/SKILL.md` (the lens list), `.github/workflows/README.md`, `.memory-bank/review-workflow.md` (Phase 5 items move from planned to done when the change is archived).
- Authentication: the hub uses the existing `CLAUDE_CODE_OAUTH_TOKEN` through `claude -p --safe-mode` (bare mode does not read this token). If the AI secrets move to a protected environment (#12513), the review job uses that environment.
- Testing: hub logic is covered by `node:test` tests without model calls. The full flow runs first locally in dry-run mode on past PRs, because the CI secret only exists in the main repository and the first CI run happens after merge.
- No change to the Ketcher packages or their runtime behavior.