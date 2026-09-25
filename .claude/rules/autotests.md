---
paths:
  - "ketcher-autotests/**/*.ts"
description: "Playwright autotests: read testing-e2e.md first, plus the rules broken most often"
---

# Autotests

**Read [.memory-bank/testing-e2e.md](../../.memory-bank/testing-e2e.md) before writing or changing a
spec.** It has the fixture system, the page-object style, the utility catalogue and the full
anti-pattern list. This rule exists to trigger that read, not to restate it.

The failures that recur regardless:

1. **`page.waitForTimeout` as a wait.** Use `waitForRender`, `waitForSpinnerFinishedWork`, or
   `waitFor({ state })`. A raw timeout is allowed only with a comment saying why nothing else works.
2. **Fragile selectors.** `getByTestId` and the monomer/UI enum constants — never CSS Module class
   names, never XPath, never a hard-coded `'A___Alanine'` string.
3. **Imports from `@playwright/test`.** Spec files import `test`, `expect`, `Page` and `Locator` from
   `@fixtures`; paths use the `@tests/...` and `@utils` aliases, not `../../`. Page-object files are
   the exception — they import `Page`/`Locator` from `@playwright/test`.
4. **Order-dependent tests.** Each test must run alone. In a shared-page suite, heavy setup goes in
   `beforeAll`, and `page.reload()` in `beforeEach` destroys the shared page.
5. **New specs in the legacy project.** New specs go under `tests/specs/Chromium-popup/` (project
   `chromium-popup`); the `chromium` project is for existing tests.

Snapshots are Linux artefacts rendered by the Playwright Docker image (`*-chromium-linux.png`); never
regenerate them from a Windows or macOS run — and a regeneration run rewrites `*-expected.*` data
files too, so review those diffs.

Skills: `ketcher-e2e-write` (authoring a spec, page objects, verification choice, quarantine tags),
`ketcher-e2e-run` (running and triaging), `ketcher-e2e-baselines` (regenerating baselines, finding
orphans). Generating a spec from an Autotest Request: the `autotests-generator` agent.

Before starting a large E2E suite, agree the scope with the requester: these tests are long and
consume a great deal of context.
