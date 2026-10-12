# E2E Test Plan — Template & Writing Guide

> How to write a plan for a new batch of Playwright E2E tests before writing any spec code.
> The plan is a **living document**: create it before implementation, then update it as findings change the design.

## When to write one

Write a plan like this whenever a request means **a new spec file or folder of specs** for a feature — not for adding one test to an existing suite. Per project rules (CLAUDE.md), **ask the user before starting to write E2E tests**; the finished plan is that checkpoint. Present the plan, get approval, then implement.

## Where the plan lives

Repo root, named `e2e-test-plan-<issue-or-feature>.md`. If the work is tracked as an OpenSpec change, it may live under `openspec/changes/<change>/` instead.

## Structure

### 1. Feature summary (what must be tested)

One paragraph on what the feature does, plus a **numbered requirements table** extracted from the issue/ticket (requirement number, scenario). Numbering matters: every test case later maps to requirement numbers, so coverage is traceable and gaps are visible. Include:

- Happy paths per distinct interaction variant
- **Negative cases** explicitly (what must NOT happen — e.g. "drop outside the radius does not replace")
- Edge/visual-feedback states, layout/mode variations, viewport behavior
- QA notes from the ticket that aren't in the numbered list
- Out-of-scope items, stated explicitly

### 2. Verified facts from the codebase (affect test design)

Before designing tests, verify against source what you assume. Record findings that constrain or enable the design:

- **Existing POMs and utilities** that already cover part of the interaction (dialog POMs, drag helpers, locators) — name them so no duplicate infrastructure is planned
- **Stable `data-testid` / `data-*` attributes** on the elements you will assert on (check the renderers, not just the DOM in one mode — flex vs. snake may differ)
- **Constants catalogs** to use instead of hardcoded values — and check they are *current* (stale constants that match nothing have been found before; verify against the source data file, e.g. `monomers.ket`)
- **Thresholds and rules** from the implementation (distances, priorities, matching rules) — confirm ambiguous ones with the feature owner rather than guessing
- **What is NOT assertable as-is** (states with no stable attributes) — leads to §4.3
- Existing coverage check: does any spec already cover part of this? State that the new work is net-new or extends what

### 3. Where the tests live

Target project + folder (new specs go in **chromium-popup** only, per testing.md), and a table: file → requirements covered → mode(s). Split by scenario type to keep files small; name files after the behavior, not the issue.

### 4. Test infrastructure changes

List anything the tests need that doesn't exist yet:

- **New utilities** — small code sketches are fine; mark exact shape as "to be finalized during implementation"
- **Non-releasing interaction variants** when a test must observe a mid-action state (e.g. start-drag / move / release / cancel primitives) instead of one-shot actions
- **Optional source change to make behavior assertable** — e.g. adding a `data-testid` to a transient UI state. Propose it, note the fallback (screenshot-only coverage) if it proves invasive, and decide during implementation after seeing where the state is rendered

### 5. Test cases

Per spec file: a table with columns **Test | Steps | Assert**. Conventions to state up front: shared-page vs. per-test page pattern choice, standard comment block with issue number, named coordinate constants (no magic numbers). Each row should name the assertion mechanism (locator count, bond attribute helper, bounding-box delta, dialog text) — not just "verify it works".

### 6. Verification strategy

Rank the assertion mechanisms by reliability and say which is primary:

1. **Structural assertions first** — element counts by alias/type/ID, stable data attributes, relationship queries
2. **Bounding-box deltas** for "positions unchanged / shifted" claims (deterministic, snapshot-free; prefer over screenshot comparison when a numeric claim suffices)
3. **Dialogs** — visibility + exact text + both button outcomes
4. **Screenshots last** — only for visual state with no structural representation; never as the sole assertion when a structural one exists

### 7. Test data

- **Prefer fixture files** (`.ket` etc.) over mouse-drawn construction for anything beyond trivially simple setups; store under `tests/test-data/<Feature>/`, load via the standard open-file helpers
- In-canvas construction is acceptable only for 2–3 element chains where a fixture would be overkill
- List the intended fixtures with content and which tests use them (the final set often differs — update this section when fixtures are actually created)

### 8. Implementation order

Numbered phases, each ending with "run the new specs locally and fix before moving on":

1. **Phase 0 — Spike**: a throwaway spec proving the core interaction works headless end-to-end (and that key thresholds behave as expected). Cheap insurance against planning an untestable design
2. Infrastructure (utilities, optional source change)
3. Fixtures
4+ One phase per spec file, most visually/structurally complex last
Last: snapshot generation via Docker **only if** the suite actually uses screenshots — pure structural suites skip this; say so explicitly

**Record results per phase in the plan as you go** (date, pass counts, deviations from the plan table). Findings that change the plan get a "Findings that changed the plan" subsection with the evidence. Temporary spike/probe specs are deleted once their findings are absorbed here — note that.

### 9. Rules & constraints to respect

Short checklist copied/adapted from CLAUDE.md and testing.md so the implementer (possibly a fresh AI session) doesn't have to re-derive them: project choice, imports from `@fixtures`, POM usage, no `waitForTimeout`, one behavior per test, comment blocks, named constants, memory-bank update timing.

### 10. Open questions / risks

Table: question → mitigation. **Resolve in place** as phases answer them (mark "Resolved in Phase N" with the answer) rather than deleting — the record of how uncertainty was retired is part of the value.

## Lessons learned

- **Spike before designing.** A short throwaway spec proving the core interaction works headless end-to-end (and that key thresholds behave as documented) de-risks the whole plan cheaply.
- **Assumptions in a ticket are not facts.** Several planned negative cases turned out to be untriggerable (no such item exists in the library) or described behavior the implementation doesn't have. Verify each against source + a temporary probe spec; when reality differs, **test and document actual behavior** and flag the discrepancy to the team — don't force a test that can't exist.
- **Requirements lists omit cross-cutting concerns.** Undo/redo was absent from the ticket but required by testing.md's "Expectations for New Features" — add it even when the issue doesn't mention it.
- **Partially implemented features:** assert what exists, document the gap in-test and in the plan; don't invent assertions for missing code (check task checklists in archived OpenSpec changes).
- **Structural > visual.** The whole suite ended up screenshot-free because every claim had a structural form (counts, bond attributes, bounding-box deltas) — which also eliminated Docker snapshot generation entirely.
- **Identical elements are a locator trap.** After an operation that duplicates an element, first-match locators resolve to the wrong one; track elements by stable IDs captured *before* the action.
- **One-shot mouse moves can be missed** by hover/drag handlers — move in steps when asserting an intermediate state of a gesture (e.g. mid-drag).
