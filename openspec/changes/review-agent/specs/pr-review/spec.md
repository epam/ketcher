## ADDED Requirements

### Requirement: Review runs only on a manual trigger
The review SHALL start only when a person adds one of the review labels to a pull request: `Run Claude Review`, `Claude Review: Quick`, or `Claude Review: Opus`. Opening a pull request or pushing commits SHALL NOT start a review. Pull requests whose title contains `Autotests` SHALL be skipped. When the run ends, successfully or not, the hub SHALL remove the label that started it, so that adding it again starts the next round.

#### Scenario: Label starts a review
- **WHEN** a maintainer adds `Run Claude Review` to an open pull request
- **THEN** the review workflow runs the hub for that pull request

#### Scenario: New commits do not start a review
- **WHEN** the author pushes a commit to a pull request that was already reviewed
- **THEN** no review runs until a review label is added again

#### Scenario: Label is removed after the run
- **WHEN** a review run finishes or fails
- **THEN** the label that started it is no longer on the pull request

### Requirement: Hub orchestrates without judging
The hub SHALL be code without a model. It SHALL compute scope, depth, rule selection, merging, ranking, round state and the posted output itself, and SHALL use separate model runs only to find and to verify. A finding SHALL never be verified by the run that produced it.

#### Scenario: Verification runs in a separate process
- **WHEN** a finder pass reports a finding
- **THEN** a new model run verifies it, and that run receives the finding and access to the code, not the finder's prompt or reasoning

### Requirement: Model runs are isolated from the pull request
Every model run SHALL start in safe mode, so that it loads no `CLAUDE.md`, hooks, skills, plugins, MCP servers or settings from the checked-out tree, and SHALL have only read-only file tools. Prompts, rules and configuration SHALL come from the base branch. These options SHALL be fixed in code, not in configuration.

#### Scenario: Pull request adds a hook
- **WHEN** a pull request adds a hook to `.claude/settings.json` and the review runs on it
- **THEN** no model run loads or executes that hook

### Requirement: Review scope
In the first round the hub SHALL review the diff between the pull request base and head. In later rounds it SHALL review only the diff between the head reviewed in the previous round and the current head, and the full diff again when that head is no longer an ancestor. Files under `ketcher-autotests/`, test snapshots, lockfiles, generated files and build output SHALL be excluded from the finder passes.

#### Scenario: Second round reviews only new commits
- **WHEN** a pull request was reviewed at commit A and a review label is added again at commit B
- **THEN** the finder passes receive only the diff between A and B

#### Scenario: Force push falls back to the full diff
- **WHEN** the previously reviewed commit is not an ancestor of the current head
- **THEN** the finder passes receive the full diff between the base and the current head

### Requirement: Depth selection
The hub SHALL run a Quick review (the `functional-correctness` lens only) when the `Claude Review: Quick` label started it, or when the diff is at or below the Quick line threshold and touches no sensitive path. Otherwise it SHALL run a Standard review with all finder lenses. The threshold and the sensitive paths SHALL be set in one place in the hub configuration.

#### Scenario: Small change outside sensitive paths
- **WHEN** a pull request changes 40 lines in a React dialog component and the label is `Run Claude Review`
- **THEN** only the `functional-correctness` lens runs

#### Scenario: Sensitive path gets a Standard review
- **WHEN** a pull request changes 20 lines in `packages/ketcher-core/src/domain/serializers/`
- **THEN** all finder lenses run

### Requirement: Finder lenses
A Standard review SHALL run the `functional-correctness`, `reuse`, `code-quality`, `security`, `performance` and `documentation-accuracy` lenses of the code-review skill as separate finder passes, in parallel with a configurable concurrency limit.

#### Scenario: Standard review
- **WHEN** the depth is Standard
- **THEN** exactly the six lenses run, each in its own model run

### Requirement: First pass without the description
The finder passes SHALL receive the diff, the changed file list and the selected rules, but not the pull request title or description. After the finder passes, the hub SHALL fetch the linked issue and ask one model run whether the diff fixes it; the answer goes in the brief.

#### Scenario: Pull request with a linked issue
- **WHEN** the pull request description links issue #123
- **THEN** the finder passes do not see the description
- **AND** the brief states whether the diff fixes #123

#### Scenario: No linked issue
- **WHEN** the pull request links no issue
- **THEN** the brief says "no linked issue"

### Requirement: Rule and document selection
Every finder pass and verification SHALL receive `.memory-bank/invariants.md`, `.memory-bank/accepted-patterns.md`, and the rules from `.memory-bank/review-rules.md` whose `Scope` matches at least one changed file. Lenses MAY read further files, including module docs, themselves.

#### Scenario: Only matching rules are passed
- **WHEN** a pull request changes only files under `packages/ketcher-react/src/`
- **THEN** rules whose `Scope` matches that path are passed
- **AND** a rule scoped only to `packages/ketcher-core/src/domain/**` is not passed

### Requirement: Schema-validated output
Every finder and verifier run SHALL be a separate `claude -p` process with `--output-format json` and a JSON Schema through `--json-schema`, and the hub SHALL read only the validated `structured_output`. A run that fails or returns no structured output SHALL NOT stop the review; the brief SHALL name the passes that produced no result.

#### Scenario: Failed pass is reported, not fatal
- **WHEN** the `performance` pass exits with an error and the other passes succeed
- **THEN** the findings of the other passes are verified and posted
- **AND** the brief states that the `performance` pass produced no result

### Requirement: Findings follow the output contract
Each finding SHALL give `file:line`, a severity (`blocker`, `major` or `nit`), the rule or invariant ID (`R<n>`, `D1`, `A1`, … or `none`) and a failing scenario, as the output contract in `.memory-bank/review-workflow.md` defines them. A finding without a failing scenario SHALL be dropped. Patterns in `.memory-bank/accepted-patterns.md` SHALL NOT be raised.

#### Scenario: Reuse finding names the existing solution
- **WHEN** the `reuse` lens reports that new code repeats an existing helper
- **THEN** the finding names the existing helper by `file:line`
- **AND** a finding that names no existing code is dropped

### Requirement: Merging and ranking
The hub SHALL merge findings of the same file and rule within a few lines of each other into one finding with all locations, SHALL drop findings already posted in an earlier round, and SHALL send at most N findings to verification, blockers first. N SHALL be configurable.

#### Scenario: Duplicate findings are merged
- **WHEN** two lenses report the same rule at `Editor.ts:120` and `Editor.ts:122`
- **THEN** one finding with both locations is sent to verification

#### Scenario: Posted finding is not repeated
- **WHEN** a finding was posted in round 1 and is reported again in round 2
- **THEN** it is not verified or posted again

### Requirement: Independent verification
Each finding sent to verification SHALL get its own verifier run, which SHALL open the cited code, check the failing scenario, and confirm or drop the finding, and MAY change its severity. The hub SHALL tell the verifier whether the cited line is part of the diff. Only confirmed findings SHALL be posted.

#### Scenario: Dropped finding is not posted
- **WHEN** the verifier finds that the named existing helper behaves differently from the new code
- **THEN** the finding is dropped and not posted

### Requirement: Posted output
The hub SHALL post at most 10 confirmed findings as inline comments on lines in the diff, blockers first, and SHALL post one brief as a top-level comment. Findings that do not fit the cap, and findings on lines outside the diff, SHALL go in the brief, one line each. Nothing posted SHALL praise or summarize the diff.

#### Scenario: More than ten findings
- **WHEN** 13 findings are confirmed
- **THEN** 10 are posted inline, blockers first
- **AND** the other 3 are listed in the brief

### Requirement: Review brief
The brief SHALL state whether the diff fixes the linked issue, the pull request type, the count of findings per severity, and the findings not posted inline, as `.memory-bank/review-workflow.md` sets for the brief. It SHALL contain a hidden marker with the round number, the reviewed head commit and fingerprints of the posted findings.

#### Scenario: Review without findings
- **WHEN** no finding is confirmed
- **THEN** a brief is still posted, with the linked-issue answer, the pull request type and zero findings

### Requirement: Round limit
The hub SHALL read the round number from the marker of the previous brief. After three rounds it SHALL NOT run any model, SHALL post a short comment that the round limit is reached, and SHALL remove the label.

#### Scenario: Fourth trigger
- **WHEN** a review label is added to a pull request that already has three review rounds
- **THEN** no model runs
- **AND** a comment states that the round limit is reached

### Requirement: Configurable models
The finder model and the verifier model SHALL each be set by exact model identifier in the hub configuration. Command-line flags SHALL override them locally, and the `Claude Review: Opus` label SHALL use the configured stronger model for both roles.

#### Scenario: Opus label
- **WHEN** a maintainer adds `Claude Review: Opus`
- **THEN** finder and verifier runs use the configured stronger model

### Requirement: Local dry run
The hub SHALL run locally against an existing pull request with the developer's own Claude Code login. In dry-run mode it SHALL print the inline comments and the brief instead of posting them and SHALL NOT change labels. Every run SHALL write a JSON log with the configuration, findings, verdicts, cost and duration.

#### Scenario: Dry run on a past pull request
- **WHEN** a developer runs the hub with `--dry-run` for a merged pull request
- **THEN** the comments and the brief are printed
- **AND** nothing is posted and no label changes