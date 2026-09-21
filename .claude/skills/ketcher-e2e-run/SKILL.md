---
name: ketcher-e2e-run
description: "Run Ketcher Playwright specs (host or Docker) and triage the result from a compact summary of results.json instead of the raw reporter output. Use to run, re-run or diagnose E2E specs."
argument-hint: "<spec path[:line]> [--project chromium|chromium-popup]"
allowed-tools: Bash(node ${CLAUDE_SKILL_DIR}/scripts/summarize-playwright.mjs*) PowerShell(node ${CLAUDE_SKILL_DIR}/scripts/summarize-playwright.mjs*)
---

# Run and triage Playwright specs

Target: **$ARGUMENTS**. Architecture, fixtures and conventions:
[.memory-bank/testing-e2e.md](../../../.memory-bank/testing-e2e.md) — read it only if you will change
a spec; running and triaging do not need it.

## 1. Make sure the app under test is current

The suite runs against the built example, not against sources:

```sh
npm run build:packages && npm run build:example:standalone   # after any package change
npm run serve:standalone                                     # 127.0.0.1:4002; keep it running
```

In `ketcher-autotests/`: `.env` copied from `.env.example`, Chromium installed once
(`npx playwright install chromium`). Without `KETCHER_URL` and `MODE` the config silently targets the
Vite dev server on port 5173.

## 2. Run narrowly, with the output in a file

From `ketcher-autotests/`, one spec or one line, never the whole suite unless asked:

```sh
npx playwright test "tests/specs/Chromium-popup/<spec>.spec.ts:<line>" --project=chromium-popup > <scratch>/pw.log 2>&1
node ${CLAUDE_SKILL_DIR}/scripts/summarize-playwright.mjs
```

Specs under `tests/specs/Chromium-popup/` use `--project=chromium-popup`, everything else
`--project=chromium`. Quote paths — one folder is `Structure-Creating-&-Editing`. The summary reads
`ketcher-autotests/results.json` (the config always writes it) and exits 0 — no failures, 1 —
failures or a global error, 2 — no report. Open `pw.log` only for what the summary cannot show.

## 3. Visual results need Linux

A host run on Windows or macOS compares against local `-win32`/`-darwin` baselines that are
git-ignored and written on first run: a pass there proves nothing visual. For screenshot assertions
use Docker, from `ketcher-autotests/`:

```sh
npm run docker:build                                   # once, and after dependency changes
npm run docker:test-popup -- "<spec>[:line]"           # or docker:test for project chromium
npm run docker:update-popup -- "<spec>[:line]"         # regenerate baselines — only for an intended UI change
```

Machine-specific setup (Docker inside WSL, sparse checkout without PNG baselines, long paths) is in
the local `ketcher-local-env` skill.

## 4. Triage by kind

| Kind in the summary | Usually means | Next step |
| --- | --- | --- |
| environment | app not served, wrong `KETCHER_URL`, browser missing, page crashed | fix the setup and re-run; the test is not at fault |
| locator | a `data-testid`, text or structure changed, or the element never rendered | grep the test id in `packages/`; a toolbar button's id is its action key |
| timeout | the app never reached the awaited state | check render and spinner waits, Indigo readiness; re-run alone once |
| snapshot | pixels differ from the Linux baseline | open the diff; intended change → regenerate in Docker; otherwise a rendering regression |
| assertion | behaviour differs from the expected value | product regression or an outdated expectation — decide which before touching the spec |
| flaky | passed only on retry | a defect in the test or the app, not green; re-run with `--repeat-each=5` to reproduce |

Report the command, the summary counts, and per failure: spec, kind, the one-line cause, and
whether it is the product, the test, or the environment.
