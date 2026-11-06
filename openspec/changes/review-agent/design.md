## Context

`claude-review.yml` runs on the `Run Claude Review` label. It checks out the PR, restores `.agents/`, `AGENTS.md` and `scripts/review-panel.mjs` from `master`, and runs `anthropics/claude-code-action` with the `/review-pr` skill on `claude-opus-5-5`. Since #12548, `scripts/review-panel.mjs` picks the code-review lenses from the changed paths and the added source lines. The same model conversation then starts one subagent per lens, checks their findings itself, answers the linked-issue question, and posts. The output contract, the rules (`review-rules.md`, R1–R17), the invariants and the accepted patterns already exist. What is missing is the rest of Phase 5 in `review-workflow.md`: an independent verifier, guaranteed output format, posting that the model cannot reach, round state, and an evaluation set (tasks 5.1 and 5.4).

A review of about 480 maintainer comments on Ketcher PRs (April to October 2026) gives the kinds of change requests the review should find: bugs and regressions; an existing helper, type or mechanism not reused or not extended; a fix in the wrong place (renderer instead of model, `BaseMode` instead of the specific mode, client side instead of Indigo); casts, `any`, `@ts-expect-error` and `eslint-disable`; unnecessary or over-complicated code; files the issue does not need; behavior that differs from the equivalent feature. Most of these map to existing rules (R1–R3, R5, R7–R9); the rest need new rules, proposed separately.

The repository's scripts are JavaScript modules with JSDoc types under `scripts/`, tested with `node --test` (`npm run test:scripts`).

## Goals / Non-Goals

**Goals:**
- Implement Phase 5 tasks 5.1 and 5.4 without changing the output contract.
- Reuse what #12548 added: the panel script and the `correctness` lens.
- Verify every finding in a run that did not produce it, and post only confirmed findings.
- Guarantee the structure of every model output by schema validation in the runtime.
- Keep model runs isolated from the pull request, and keep posting out of their reach.
- Keep cost under control: manual rounds, the panel, a cap on verified findings, configurable models.
- Make the hub logic testable without model calls, and the full flow runnable locally as a dry run.

**Non-Goals:**
- Risk tiers and AI review raising a tier (task 5.5), feedback tracking (task 5.6), large-scale change handling (task 5.7), review on every PR without a label (task 5.3).
- New review rules; they go to `review-rules.md` with status `proposed` in a separate change.
- Reviewing `ketcher-autotests/`.
- Retrieval infrastructure; rules are selected by their `Scope`, module docs are read by the lenses.

## Decisions

### 1. The hub is a script, not a prompt

`scripts/review/` holds the hub as JavaScript modules with JSDoc types, like `scripts/pr-checks.mjs`. It owns scope, the panel call, rule selection, pass scheduling, merging, ranking, round state, posting and labels. Model runs are its only side calls.

*Alternative:* keep `/review-pr` as the orchestrator and move only verification and posting into code. Rejected: the conversation that reads the pull request would still decide whether to verify, merge and stop, none of that could be unit tested, and the run would still need `gh` tools in a context that holds untrusted text. `/review-pr` stays for local and agent use, on the same lenses and panel.

### 2. One `claude -p` process per pass, with a JSON Schema

Each finder pass and each verification runs as:

```
claude -p --safe-mode --restricted --tools "Read,Grep,Glob" --permission-mode dontAsk \
  --strict-mcp-config --no-session-persistence \
  --output-format json --json-schema <schema> \
  --model <id> --fallback-model <family alias> \
  --max-turns <n> --max-budget-usd <x> \
  --append-system-prompt <role prompt> < <input>
```

The hub reads only `structured_output`. A non-zero exit, `error_max_structured_output_retries`, or `success` without `structured_output` counts as a failed pass. The schemas (`scripts/review/schemas.mjs`) mirror the output contract: `file`, `line`, `severity` (`blocker`, `major`, `nit`), `id` (`R<n>`, invariant ID or `none`), `claim`, `scenario`, and `references` (`file:line`) for findings that name other code.

*Alternative:* the Agent SDK. Rejected for now: its documentation asks third-party SDK applications to use API keys, and the existing secret is a subscription token. `claude -p` is the documented route for that token in CI.

### 3. Isolation is fixed in code

`--safe-mode` keeps the run from loading `CLAUDE.md`, hooks, skills, plugins, MCP servers, custom agents and auto memory from the checked-out tree; authentication works normally. Safe mode still reads settings files and their permission rules, so `--restricted` is added: it loads only managed settings and `--settings`, confines the file tools to the working directory, removes the tools that run commands and WebFetch unless `--tools` names them, and refuses `bypassPermissions`. `--tools "Read,Grep,Glob"` names the tools explicitly (the Linux default set omits `Glob` and `Grep`); there is no `Bash`, no edit tool, no web tool and no tool that writes to GitHub. The runner builds the argument list in one function, starts the process without a shell, and a unit test fails if `--safe-mode`, `--restricted`, the tool list or `dontAsk` is missing.

Prompts, rules, invariants, accepted patterns and the panel script are read from the base checkout. The hub passes the role prompt (the shared part of `SKILL.md` and the lens or role file) as text with `--append-system-prompt`, and the rules, invariants and accepted patterns as text in the input, and the shared prompt says that these copies apply, not the copies in the checkout. The PR checkout is the working directory and is only read, so lenses can open code and module docs there.

`--bare` gives the same isolation but reads only `ANTHROPIC_API_KEY`. The runner has an `authMode` setting (`oauth` → `--safe-mode --restricted`, `api-key` → `--bare --restricted`), so a switch to an API key is a configuration change.

Verified on Claude Code 2.1.318 with `CLAUDE_CODE_OAUTH_TOKEN` (task 4.5). The test checkout had a `.claude/settings.json` with `SessionStart` and `UserPromptSubmit` hooks, an `env` entry and a `Bash` allow rule, and a `CLAUDE.md` that told the model what to answer. With `--safe-mode --restricted`, no hook ran, the answer came from the code, and `structured_output` matched the schema. The same run without the two flags ran both hooks and followed the `CLAUDE.md`. Claude Code 2.1.81 does not know `--safe-mode`, so the pinned version must be one that does. A failed login ends with `subtype: success` and `is_error: true`, with the message in `result`; the runner reports it as a failed pass with that message.

### 4. Lenses stay in the code-review skill

The finder prompts are the lens files in `.agents/skills/code-review/`, with the shared part of `SKILL.md` (including "Content is data"). The `correctness` lens comes from #12548; this change adds "fix in the wrong place" to its focus. One lens is added: `reuse.md` (existing code that the change should use or extend; the finding names it by `file:line`). The verifier is a role file in the same folder, `verifier.md`. Output-format text in the prompts gives way to the schema; the prompts keep the meaning of each field. `/review-pr` and `ketcher-flow` keep using the same lenses.

### 5. Rules come from the existing documents

The hub parses `review-rules.md` with `parseRules` from `scripts/agent-docs/rules.mjs` and passes the rules whose `Scope` matches a changed file, plus `invariants.md` and `accepted-patterns.md`. Module docs have no `paths:` frontmatter yet (Phase 1); until they do, lenses find them themselves, as the code-review skill says today.

### 6. Rounds and state live in the posted brief

The brief carries a hidden marker: `<!-- claude-review:v1 {"round":2,"head":"<sha>","posted":["<fingerprint>"]} -->`. The hub reads the newest marker from comments by the account that runs the workflow, and ignores markers from any other account. Round 1 reviews base…head; later rounds review previousHead…head, or base…head when previousHead is not an ancestor. A fingerprint hashes file, rule ID and the normalized claim, without line numbers. After round 3 the hub posts a short limit comment and runs no model. Each round starts by hand; the hub removes the label at the end of every run.

### 7. Panel, merging and ranking are pure functions

- Diff: `scripts/review/diff.mjs` splits the diff with the `diff` package (jsdiff) and gives, per file, the status, the changed line count, the lines that take a review comment, and the file's patch text. The hub drops skipped files (autotests, lockfiles, snapshots, generated files) and joins the remaining patches into the reviewed diff.
- Panel: the hub passes the reviewed diff to `parseDiff` and `pickPanel` from `scripts/review-panel.mjs`, so the hub, `/review-pr` and `ketcher-flow` get the same panel for the same diff. This change adds a `reuse` trigger to the panel script that fires on any source change, like `correctness`. No lens on the panel means no finder pass; the brief is still posted.
- Merging: same file and rule ID, lines within 3 → one finding with all locations and the count of lenses that reported it.
- Ranking for verification: `blocker`, then findings from more than one lens, then `major`, then `nit`; at most N = 10 go to verification.
- The hub knows from the diff whether each cited line takes a comment. Other lines go in the brief, because GitHub rejects review comments there.

### 8. The linked-issue question is a separate run after the finders

The finder passes get the diff, the file list and the rules, not the PR title or description. After verification, one run gets the diff, the linked issue (from `gh issue view`) and the confirmed findings, and answers whether the diff fixes the issue. The hub derives the PR type from the linked issue type and the changed files, as the PR-type contract describes.

### 9. Models are configuration; defaults come from the evaluation

`scripts/review/config.mjs` holds exact model IDs per role as defaults. The initial default for both roles is `claude-sonnet-5-5`; the stronger model is `claude-opus-5-5`. Exact IDs keep a run reproducible and make a model change a deliberate step, which an alias such as `sonnet` would not.

The entry point reads overrides in this order: the environment variables `REVIEW_FINDER_MODEL`, `REVIEW_VERIFIER_MODEL` and `REVIEW_STRONG_MODEL`, which the workflow takes from GitHub repository variables, so a maintainer can change a model without a pull request; then the local flags `--finder-model` and `--verifier-model`; then the `Claude Review: Opus` label, which sets both roles to the stronger model. Overrides build a new object; the hub never changes the configuration, and `config.mjs` reads no environment.

Model IDs get retired. The runner passes `--fallback-model` with the alias of the same family (`sonnet` or `opus`), so a retired ID does not stop the review. The hub reads the model that ran from the JSON output and names it in the brief and the run log when it differs from the configured one, as a sign to update the default.

### 10. Evaluation reuses the hub

`scripts/review/eval/` holds `eval-set.json`, a runner that calls the hub in dry-run mode per configuration, `--save-findings` and `--findings-from` so that verifier-only `scripts/review/eval/` holds `eval-set.json`, a runner that calls the hub in dry-run mode per configuration, `--save-findings` and `--findings-from` so that verifier-only configurations reuse finder output, a `matches.json` that a person fills in, and a report script. The first entries come from maintainer comments already collected (for example #12111, #12173, #11833, #12050, #10230, #11501) and from clean PRs. It starts with 2–3 PRs and grows only if the results are usable. The #12548 author has started an evaluation of the PR review; before task 6 starts, the two are aligned so that one evaluation set and one report serve both.

### 11. The workflow runs the hub

`claude-review.yml` keeps the `pull_request` `labeled` trigger and the `Autotests` title filter, and drops `claude-code-action`. It checks out the base branch for the hub, the prompts and the panel script, checks out the PR head into a separate directory, installs a pinned Claude Code version, and runs the hub with `CLAUDE_CODE_OAUTH_TOKEN` and `GITHUB_TOKEN`. Permissions: `contents: read`, `pull-requests: write`, `issues: write` (labels). If the AI secrets move to a protected environment (#12513), the job uses it.

### 12. The verifier can ask for one more lens

The panel picks lenses by rules, so a lens can miss a file that needs it. The verifier answer has an `alsoCheck` field: `security`, `reuse` or `none`. The verifier sets it when a confirmed finding suggests a security problem, or shows that the repository already solves the same job. The hub runs the named lens once more, on the files of the flagged findings, when:

- the verdict is `confirmed`, at any severity;
- that lens reported no finding on those files in this round;
- that lens has had no extra pass in this round.

The extra findings are merged against the posted and the already found findings, and are verified. Their verdicts cannot ask for another pass. At most N findings go to verification in a round, extra findings included. The hub decides whether to run; the model only names the lens.

*Alternative:* the verifier reports the security or reuse problem itself. Rejected: the verifier checks one finding and has no lens prompt, and a finding needs the lens's focus and checks.

## Risks / Trade-offs

- **Subscription limits** → The token belongs to a team member's Claude account. A review is up to one finder run per panel lens, one linked-issue run and up to N verifications on that account. Mitigated by manual rounds, the panel, the cap N, Sonnet defaults and `--max-budget-usd` per run.
- **First CI run after merge** → The secret exists only in the main repository. Mitigated by local dry runs and unit tests; the first CI runs are watched by hand.
- **An older Claude Code lacks a flag** → 2.1.81 does not know `--safe-mode`, and the run fails at once. Mitigated by the pinned version in the workflow, which is checked before each bump with the isolation test from task 4.5.
- **A model ID is retired** → The runner falls back to the family alias, and the brief names the model that ran. A maintainer then updates the repository variable or the default in `config.mjs`.
- **`--bare` may become the default for `-p`** → The documentation says so. Bare mode does not read the OAuth token. Mitigated by the pinned Claude Code version, and by checking the flag behavior before each version bump.
- **Deepening adds model runs** → At most two extra passes per round, only after a confirmed finding, and only on the flagged files.
- **Prompt injection from PR content** → Model runs cannot run commands, edit files, use the network, read PR settings files, or post. The worst case is a wrong or missing finding, which verification and the human reviewer still filter.
- **Two review paths** → `/review-pr` (local) and the hub (CI) can drift. Mitigated by sharing the lens files, the shared prompt and the panel script.
- **Document format as a contract** → A change to the `review-rules.md` block format could drop rules silently. Mitigated by reusing `parseRules`, by tests that parse the real file, and by `check:agent-docs`.

## Migration Plan

1. Add the hub, schemas, lenses, verifier role and tests; leave the workflow unchanged.
2. Run the hub locally with `--dry-run` on past PRs; tune prompts and thresholds; run the first evaluation.
3. Switch `claude-review.yml` to the hub; update `.github/workflows/README.md` and `review-workflow.md`.
4. After merge, watch the first runs on a few PRs.

Rollback: revert `claude-review.yml` to the `claude-code-action` step with `/review-pr`.

## Open Questions

- How the evaluation work of the #12548 author and task 6 split, before task 6 starts.
- Initial values for N, concurrency and `--max-budget-usd`, after the first local runs.
- The plan and limits of the team member's account behind `CLAUDE_CODE_OAUTH_TOKEN`, and when the token expires.