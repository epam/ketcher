## Context

`claude-review.yml` runs on the `Run Claude Review` label. It checks out the PR, restores `.agents/` and `AGENTS.md` from `master`, and runs `anthropics/claude-code-action` with the `/review-pr` skill. That skill asks one model to start the four code-review lenses as subagents, verify their findings itself, answer the linked-issue question, and post. The output contract, the rules (`review-rules.md`, R1–R16), the invariants and the accepted patterns already exist; what is missing is the Phase 5 structure from `review-workflow.md`: separate finder passes, an independent verifier, guaranteed output format, and an evaluation set (tasks 5.1 and 5.4).

A review of about 480 maintainer comments on Ketcher PRs (April to October 2026) gives the kinds of change requests the review should find: bugs and regressions; an existing helper, type or mechanism not reused or not extended; a fix in the wrong place (renderer instead of model, `BaseMode` instead of the specific mode, client side instead of Indigo); casts, `any`, `@ts-expect-error` and `eslint-disable`; unnecessary or over-complicated code; files the issue does not need; behavior that differs from the equivalent feature. Most of these map to existing rules (R1–R3, R5, R7–R9); the rest need new rules, proposed separately.

The repository's scripts are JavaScript modules with JSDoc types under `scripts/`, tested with `node --test` (`npm run test:scripts`).

## Goals / Non-Goals

**Goals:**
- Implement Phase 5 tasks 5.1 and 5.4 without changing the output contract.
- Verify every finding in a run that did not produce it, and post only confirmed findings.
- Guarantee the structure of every model output by schema validation in the runtime.
- Keep model runs isolated from the pull request.
- Keep cost under control: manual rounds, depth by size and risk, a cap on verified findings, configurable models.
- Make the hub logic testable without model calls, and the full flow runnable locally as a dry run.

**Non-Goals:**
- Risk tiers and AI review raising a tier (task 5.5), feedback tracking (task 5.6), large-scale change handling (task 5.7).
- New review rules; they go to `review-rules.md` with status `proposed` in a separate change.
- Reviewing `ketcher-autotests/`.
- Retrieval infrastructure; rules are selected by their `Scope`, module docs are read by the lenses.

## Decisions

### 1. The hub is a script, not a prompt

`scripts/review/` holds the hub as JavaScript modules with JSDoc types, like `scripts/pr-checks.mjs`. It owns scope, depth, rule selection, pass scheduling, merging, ranking, round state, posting and labels. Model runs are its only side calls.

*Alternative:* keep `/review-pr` as the orchestrator. Rejected: the model would still decide whether to verify, merge and stop, and none of that could be unit tested.

### 2. One `claude -p` process per pass, with a JSON Schema

Each finder pass and each verification runs as:

```
claude -p --safe-mode --tools "Read,Grep,Glob" --permission-mode dontAsk \
  --strict-mcp-config --no-session-persistence \
  --output-format json --json-schema <schema> \
  --model <id> --max-turns <n> --max-budget-usd <x> \
  --append-system-prompt-file <role prompt> < <input>
```

The hub reads only `structured_output`. A non-zero exit, `error_max_structured_output_retries`, or `success` without `structured_output` counts as a failed pass. The schemas (`scripts/review/schemas.mjs`) mirror the output contract: `file`, `line`, `severity` (`blocker`, `major`, `nit`), `id` (`R<n>`, invariant ID or `none`), `claim`, `scenario`, and `reference` (`file:line`) for findings that name other code.

*Alternative:* the Agent SDK. Rejected for now: its documentation asks third-party SDK applications to use API keys, and the existing secret is a subscription token. `claude -p` is the documented route for that token in CI.

### 3. Isolation is fixed in code

`--safe-mode` keeps the run from loading `CLAUDE.md`, hooks, skills, plugins, MCP servers and settings from the checked-out tree; authentication works normally. `--tools "Read,Grep,Glob"` names the tools explicitly (the Linux default set omits `Glob` and `Grep`); there is no `Bash`, no edit tool and no web tool. The runner builds the argument list in one function, starts the process without a shell, and a unit test fails if the isolation flag, the tool list or `dontAsk` is missing. Prompts and rules are read from the base checkout; the PR checkout is the working directory and is only read.

`--bare` gives the same isolation but reads only `ANTHROPIC_API_KEY`. The runner has an `authMode` setting (`oauth` → `--safe-mode`, `api-key` → `--bare`), so a switch to an API key is a configuration change.

### 4. Lenses stay in the code-review skill

The finder prompts are the lens files in `.agents/skills/code-review/`, with the shared part of `SKILL.md`. Two lenses are added: `functional-correctness.md` (bugs, regressions, invariant breaks, undo/redo, serialization round trips, mode and canvas switching) and `reuse.md` (existing code that the change should use or extend; the finding names it by `file:line`). The verifier gets its own role file. Output-format text in the prompts is replaced by the schema; the prompts keep the meaning of each field. `/review-pr` and `ketcher-flow` keep using the same lenses.

### 5. Rules come from the existing documents

The hub parses `review-rules.md` (`### R<n>` blocks, `Scope`) and passes the rules whose scope matches a changed file, plus `invariants.md` and `accepted-patterns.md`. The parser reuses or follows `scripts/agent-docs/rules.mjs`. Module docs have no `paths:` frontmatter yet (Phase 1); until they do, lenses find them themselves, as the code-review skill says today.

### 6. Rounds and state live in the posted brief

The brief carries a hidden marker: `<!-- claude-review:v1 {"round":2,"head":"<sha>","posted":["<fingerprint>"]} -->`. The hub reads the newest marker written by the workflow's bot account. Round 1 reviews base…head; later rounds review previousHead…head, or base…head when previousHead is not an ancestor. A fingerprint hashes file, rule ID and the normalized claim, without line numbers. After round 3 the hub posts a short limit comment and runs no model. Each round starts by hand; the hub removes the label at the end of every run.

### 7. Depth, merging and ranking are pure functions

- Quick (the `functional-correctness` lens only): the Quick label, or at most 100 changed lines with no sensitive path. Standard (all six lenses) otherwise. Sensitive paths: `packages/ketcher-core/src/application/editor/`, `packages/ketcher-core/src/application/formatters/`, `packages/ketcher-core/src/domain/serializers/`.
- Merging: same file and rule ID, lines within 3 → one finding with all locations and the count of lenses that reported it.
- Ranking for verification: `blocker`, then findings from more than one lens, then `major`, then `nit`; at most N = 10 go to verification.
- The hub computes from the patch whether each cited line is in the diff. Lines outside the diff go in the brief, because GitHub rejects review comments there.

### 8. The linked-issue question is a separate run after the finders

The finder passes get the diff, the file list and the rules, not the PR title or description. After verification, one run gets the diff, the linked issue (from `gh issue view`) and the confirmed findings, and answers whether the diff fixes the issue. The hub derives the PR type from the linked issue type and the changed files, as the PR-type contract describes.

### 9. Models are configuration; defaults come from the evaluation

`scripts/review/config.mjs` holds exact model IDs per role. The initial default for both roles is `claude-sonnet-5-5`; the stronger model is `claude-opus-5-5`. Local flags `--finder-model` and `--verifier-model` override them; the `Claude Review: Opus` label sets both roles to the stronger model.

### 10. Evaluation reuses the hub

`scripts/review/eval/` holds `eval-set.json`, a runner that calls the hub in dry-run mode per configuration, `--save-findings` and `--findings-from` so that verifier-only configurations reuse finder output, a `matches.json` that a person fills in, and a report script. The first entries come from maintainer comments already collected (for example #12111, #12173, #11833, #12050, #10230, #11501) and from clean PRs. It starts with 2–3 PRs and grows only if the results are usable.

### 11. The workflow runs the hub

`claude-review.yml` keeps the `pull_request` `labeled` trigger and the `Autotests` title filter. It checks out the base branch for the hub and the prompts, checks out the PR head into a separate directory, installs a pinned Claude Code version, and runs the hub with `CLAUDE_CODE_OAUTH_TOKEN` and `GITHUB_TOKEN`. Permissions: `contents: read`, `pull-requests: write`, `issues: write` (labels). If the AI secrets move to a protected environment (#12513), the job uses it.

## Risks / Trade-offs

- **Subscription limits** → A Standard review is up to six finder runs, one linked-issue run and up to N verifications on the token owner's subscription. Mitigated by manual rounds, depth, the cap N, Sonnet defaults and `--max-budget-usd` per run.
- **First CI run after merge** → The secret exists only in the main repository. Mitigated by local dry runs and unit tests; the first CI runs use `Claude Review: Quick`.
- **Safe mode with the OAuth token is not yet run** → Verified in the first local run (task 4.5); if it fails, run with `--setting-sources` limited and the same tool list, and record the change here.
- **Prompt injection from PR content** → Model runs cannot run commands, edit files, use the network or post. The worst case is a wrong or missing finding, which verification and the human reviewer still filter.
- **Document format as a contract** → A change to the `review-rules.md` block format could drop rules silently. Mitigated by tests that parse the real file, and by `check:agent-docs`.
- **CLI flag changes** → The workflow installs a pinned Claude Code version.

## Migration Plan

1. Add the hub, schemas, lenses, verifier role and tests; leave the workflow unchanged.
2. Run the hub locally with `--dry-run` on past PRs; tune prompts and thresholds; run the first evaluation.
3. Switch `claude-review.yml` to the hub; make `/review-pr` run the hub locally in dry-run mode; update `.github/workflows/README.md`.
4. After merge, start with `Claude Review: Quick` on a few PRs.

Rollback: revert `claude-review.yml` to the `claude-code-action` step.

## Open Questions

- Does Phase 5 of `review-workflow.md` belong to #12246, and who else works on it?
- Who owns `CLAUDE_CODE_OAUTH_TOKEN`, on which plan, and when does it expire?
- Initial values for N, concurrency, `--max-budget-usd` and the Quick threshold, after the first local runs.