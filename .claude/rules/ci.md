---
paths:
  - ".github/**"
  - "ketcher-autotests/Dockerfile*"
  - "ketcher-autotests/docker-compose.yml"
  - "ketcher-autotests/*.sh"
  - "sonar-project.properties"
description: "GitHub Actions workflows, the E2E containers and the AI workflows that depend on .claude/"
---

# CI and the E2E containers

| Workflow | What it runs |
| --- | --- |
| `ci.yml` | `npm ci`, `npm audit --all --audit-level=critical`, full build (packages + example twice), `npm test`, example-ssr build/lint/types — the only gate for lint, types and unit tests |
| `run-tests.yml` | build job → 10 Playwright shards of project `chromium` in the `mcr.microsoft.com/playwright` image on `self-hosted-a` → merged HTML report |
| `run-tests-popup.yml` | the same shape with one shard of project `chromium-popup` |
| `sonar.yml`, `codeql-analysis.yml` | static analysis |
| `claude-review.yml` | label `Run Claude Review` → `/review-pr` → the four `.claude/agents/*-reviewer.md` |
| `claude-implement-autotests.yml` | labels `Autotests` + `Run TA creation workflow` → `.claude/agents/autotests-generator.md` → spec, branch, PR |
| `claude-create-autotest-request.yml`, `openai-create-autotest-request.yml` | the same label on a Feature issue → an `Autotests: <title>` issue with a checklist; the Claude one is disabled, the OpenAI one is live |

- Renaming `.claude/commands/review-pr.md` or the agents it names breaks the AI workflows.
- The Playwright image tag in the workflows and `ketcher-autotests/Dockerfile` must equal the
  `@playwright/test` version in the root `package.json`: Linux baselines are rendered by that image.
  Bump them together.
- Node is hard-coded in `ci.yml` (duplicating `.nvmrc`) and floats as `node:24` in the container
  jobs; pin deliberately when you touch a workflow.
- `DOCKER`, `IGNORE_UNSTABLE_TESTS` and `USE_SEPARATE_INDIGO_WASM` are set by workflows and read by
  nothing.
- Never interpolate issue or PR text into a prompt or a `run:` line; pass it through `env:`.
- A new job gets a least-privilege `permissions:` block and a `concurrency:` group.
- Diagnosing a red run: the `ketcher-ci-triage` skill or the `ketcher-devops` agent (local module).
