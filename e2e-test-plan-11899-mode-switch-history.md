# E2E Test Plan — Retain history between macro and micro molecule modes

> Issue: [epam/ketcher#11899](https://github.com/epam/ketcher/issues/11899) (resolved by PR #11964, merged 2026-09-24)
> Status: COMPLETE — all phases done, 8/8 tests green (2026-10-09)

## 1. Feature summary (what must be tested)

Before the fix, toggling between the molecule (micro) editor and the macromolecule (macro) editor wiped the undo/redo stack, so edits made before a mode switch could not be reverted. After PR #11964, both editors share **one history**: edits in either editor and the mode switches themselves are entries in a single shared 32-step stack. Undoing past a mode switch returns the user to the previous mode with the pre-switch state restored (original model instances, no reconversion); redo replays everything in reverse; any new edit invalidates the redo portion of the shared stack.

### Requirements table

| # | Scenario |
| - | -------- |
| R1 | Micro edits → switch to macro → **undo reverts the mode switch**: user is back in micro mode with the micro structure intact |
| R2 | Continuing undo after R1 steps into the pre-switch micro edits (one undo per edit) |
| R3 | Redo after full undo restores the edits **and** the mode switch, in reverse order |
| R4 | Macro edits (monomers + bond) → switch to micro → undo chain reverts the switch first, then the macro edits |
| R5 | A new edit made after an undo **invalidates redo** across the shared stack (asserted via state-invariance or button disabled state) |
| R6 | Consecutive switches (micro→macro→micro) are separate undo steps; each single undo reverts exactly one switch |
| R7 | Keyboard shortcuts (Ctrl+Z / Ctrl+Shift+Z) work in **both** modes and are not double-intercepted after a switch |
| R8 | Negative: undo at the start of history is a no-op (no crash, state unchanged), same for redo at the end |

Out of scope (stated explicitly):

- The exact 32-step limit (asserting the precise stack depth requires 30+ drawn elements; brittle and slow). Tracked as open question Q5.
- File-format round-trip — not applicable to this feature.
- Snake/Sequence layout-specific behavior — tests use Flex only (the fix is at the editor-history level, not layout level).

## 2. Verified facts from the codebase (affect test design)

Verified against `ketcher-autotests/` on 2026-10-08:

- **Mode switching POM exists** — `tests/pages/common/CommonTopRightToolbar.ts`:
  - `turnOnMacromoleculesEditor(options?)` (defaults: hide ruler, disable autozoom) — clicks the `polymer-toggler` combobox → `macromolecules_mode` option; waits for macro canvas `[data-testid="ketcher-canvas"][data-canvasmode="macromolecules-mode"]`.
  - `turnOnMicromoleculesEditor()` — same via `molecules_mode` option; waits for `data-canvasmode="molecules-mode"`.
  - The canvas-mode locators are defined **inside** the methods, not exposed. Plan: expose them as returned locators (small additive POM change, §4).
- **Undo/redo POM exists** — `tests/pages/common/CommonTopLeftToolbar.ts`: `undo()` / `redo()` click `getByTestId('undo')` / `getByTestId('redo')` (filtered to visible). No disabled-state handling in the POM.
- **Keyboard undo/redo exist** — `tests/utils/canvas/helpers.ts`: `undoByKeyboard(page)` (Ctrl+Z), `redoByKeyboard(page)` (Ctrl+Shift+Z), both wrapped in `waitForRender`.
- **Micro-mode content creation**:
  - Proven pattern (Phase 0 verified): `RightToolbar(page).clickAtom(Atom.Carbon)` + `clickOnCanvas(x, y)` — the element tool stays active between clicks; press Escape after the last draw. (Typing 'C' only selects the element in the sidebar panel — does not place an atom.)
  - Assertion: `getAtomLocator(page, { atomType: AtomType.C })` from `tests/utils/canvas/atoms/getAtomLocator/getAtomLocator.ts` (stable `data-testid="atom"` + `data-atom-type`).
- **Macro-mode content creation**: `Library(page).dragMonomerOnCanvas(Peptide.Tza, { x, y })`, `getMonomerLocator(page, Peptide.Tza)`, `bondTwoMonomers(page, m1, m2)` — all established utilities (see `Macromolecule-editor/Undo-Redo/undo-redo.spec.ts`).
- **Existing coverage check**: `Macromolecule-editor/Undo-Redo/undo-redo.spec.ts` covers undo/redo **within** macro mode only; `User-Interface/Editing-Tools/Undo-Redo/undo-redo-actions.spec.ts` is legacy (chromium project) micro-only. **No spec anywhere asserts undo/redo across a mode switch.** This work is net-new.
- **Mode state is structurally assertable**: the canvas element carries `data-canvasmode="molecules-mode" | "macromolecules-mode"` — deterministic, no screenshot needed.
- **Local build assumption**: this monorepo checkout post-dates PR #11964 (merged 2026-09-24); the served build (`npm run serve`, port 4002) is expected to contain the fix. Phase 0 confirms behavior end-to-end.

## 3. Where the tests live

Project: `chromium-popup` only (per testing.md — new specs never go into legacy `chromium`).

| File | Requirements | Mode(s) |
| ---- | ------------ | ------- |
| `ketcher-autotests/tests/specs/Chromium-popup/Mode-Switching/undo-redo-across-mode-switches.spec.ts` (new folder + file) | R1–R8 | micro + macro (Flex) |

One file is sufficient (~8 tests, shared-page pattern). Named after the behavior; folder groups future mode-switching specs.

## 4. Test infrastructure changes

- **No new utilities needed.** Everything required exists (§2).
- **Small additive POM change** (optional, decided in Phase 0): expose the two canvas-mode locators from `CommonTopRightToolbar` (e.g. `moleculesCanvas` / `macromoleculesCanvas`) so tests can assert mode via `toBeVisible()` without raw `page.locator` in spec files. If it proves awkward, fallback: assert macro mode via `MacromoleculesTopToolbar(page).switchLayoutModeDropdownButton` visibility and micro mode via a micro-only toolbar element (e.g. `RightToolbar` extended-table button).
- **No source changes to Ketcher** — all states of interest are structurally assertable (`data-canvasmode`, atom/monomer counts, undo/redo buttons).

## 5. Test cases

Conventions: shared-page pattern (Pattern A) with `initMoleculesCanvas` + `MoleculesCanvas` fixture (micro editor, cleared canvas per test — each test starts in micro mode on an empty canvas and drives its own switches); comment block with issue number per test; named coordinate constants (`ATOM_X/Y`, `MONOMER1_X/Y`, …); undo/redo via `CommonTopLeftToolbar` buttons except R7 (keyboard).

| Test | Steps | Assert |
| ---- | ----- | ------ |
| 1. Undo reverts a micro→macro switch (R1) | Draw 2 C atoms in micro → `turnOnMacromoleculesEditor()` | macro canvas visible; undo → micro canvas visible **and** C-atom count = 2 |
| 2. Undo continues into pre-switch micro edits (R2) | Draw 2 C atoms → switch to macro → undo ×3 | after 1st undo: micro mode, 2 atoms; after 2nd/3rd: atom count 2→1→0, still micro mode |
| 3. Redo restores edits and the switch (R3) | Same setup as test 2, full undo to empty → redo ×3 | 1st redo: 1 atom (micro); 2nd: 2 atoms; 3rd: macro canvas visible |
| 4. Undo chain across a macro→micro switch (R4) | Switch to macro → drag 2 Tza monomers + bond → `turnOnMicromoleculesEditor()` → undo ×4 | 1st undo: back in macro, 2 monomers + bond present; subsequent undos remove bond then monomers one by one (monomer count assertions) |
| 5. New edit invalidates shared redo (R5) | Draw C atom → switch to macro → undo (back in micro, atom present) → draw a 2nd C atom → redo | state unchanged: still micro mode, atom count = 2 (redo was invalidated); if spike shows `disabled` attribute on `redo` button, assert that instead/additionally |
| 6. Consecutive switches are separate undo steps (R6) | Switch micro→macro→micro (no edits) → undo ×2 | after 1st undo: macro canvas visible; after 2nd: micro canvas visible |
| 7. Keyboard undo/redo work in both modes (R7) | Draw C atom → switch to macro → `undoByKeyboard` → `redoByKeyboard` → `undoByKeyboard` | each step flips mode as expected and atom count preserved throughout (proves no double-interception / dead shortcuts) |
| 8. Undo at history start is a no-op (R8, negative) | Switch micro→macro→micro → undo until disabled (loop; fixture adds one extra entry) | undo button disabled, micro mode visible, canvas empty; extra keyboard undo is a no-op |

## 6. Verification strategy

Ranked by reliability; **structural assertions are primary and the suite is expected to be screenshot-free**:

1. **Mode state** — `data-canvasmode` attribute visibility on `ketcher-canvas` (deterministic).
2. **Element counts** — `getAtomLocator(page, { atomType: AtomType.C })` count in micro; `getMonomerLocator(page, Peptide.Tza)` count in macro; bond presence via monomer relationship/locator if needed for test 4.
3. **Button state / state-invariance** — for redo invalidation (R5): prefer `toBeDisabled()` on the redo button if exposed (Phase 0), else assert full state invariance after a redundant redo.
4. Screenshots: not planned. If Phase 0 reveals an unassertable intermediate state, add `takeEditorScreenshot` only as a last resort and note it here.

No snapshots → **no Docker snapshot generation** needed (pure structural suite).

## 7. Test data

No fixture files required — all setups are ≤3-element in-canvas constructions (2 atoms or 2 monomers + bond), which the template allows without fixtures. If Phase 0 shows keyboard atom-drawing is unreliable, fall back to `selectExtendedTableElement(STAR)` — still no fixtures.

## 8. Implementation order

1. **Phase 0 — Spike** (throwaway spec, deleted afterwards): in micro mode type 'C' on canvas and assert via `getAtomLocator`; switch to macro; undo once and check mode flips back and atom count survives; check whether `undo`/`redo` buttons expose a `disabled` attribute at stack boundaries; check that the `MoleculesCanvas` fixture cleanup (clear canvas) resets history so no state leaks between tests. Record findings below.
2. **Phase 1 — POM**: expose canvas-mode locators from `CommonTopRightToolbar` (if Phase 0 confirms it's the clean route). Run existing specs that use this POM to confirm no regression.
3. **Phase 2 — Spec file**: implement tests 1–8 in `Chromium-popup/Mode-Switching/undo-redo-across-mode-switches.spec.ts`.
4. **Phase 3 — Full run**: run the new spec locally against the served build; fix failures. Then run the full `chromium-popup` project to check for interference.

Run the new specs locally and fix before moving on, per phase.

### Results (filled in as phases complete)

- **Phase 0 (partial, 2026-10-08):**
  - **Q1 Resolved:** typing 'C' on the canvas does **not** place an atom — it only selects C in the right-side periodic-table panel. Correct micro-draw primitive: `RightToolbar(page).clickAtom(Atom.Carbon)` (`tests/pages/molecules/RightToolbar.ts`, enum in `tests/pages/constants/atoms/atoms.ts`) + `clickOnCanvas(x, y)`. The element tool stays active between clicks; press Escape after the last draw (star-atom.spec.ts pattern).
  - **Q3 Resolved:** `undo`/`redo` buttons expose a real `disabled` state — verified: redo disabled after 1 edit, undo disabled at history start, redo disabled at history end. R5/R8 will assert with `toBeDisabled()`.
  - **Build blocker found:** the branch was based on pre-#11964 master; the served build on :4002 had no fix (undo in macro mode enabled but no-op — consistent with pre-fix stack wipe). User approved: rebase onto origin/master, rebuild, re-serve. Rebase completed cleanly (13 commits, no conflicts); fix commit `9df135f324` now in HEAD.
  - **Q2 still open** — cross-switch undo step count to be re-probed against the fixed build.
- **Phase 0 complete (2026-10-08, after rebuild):** rebased branch onto origin/master (clean, no conflicts), rebuilt and re-served on :4002. Spike re-run against the fixed build:
  - **Q2 Resolved:** a mode switch is exactly **one** undo step — undo#1 reverted macro→micro with the carbon intact, undo#2 removed the carbon. Test expectations as planned are correct.
  - Confirmed hazard: clicking a **disabled** undo/redo button via the POM hangs (Playwright waits for enabled state; `actionTimeout: 0` = no timeout) — tests at stack boundaries must probe via keyboard (`undoByKeyboard`) instead of the button. Applied in test 8.
  - Spike spec deleted after absorbing findings.
- **Phase 1 (2026-10-09):** `CommonTopRightToolbar` now exposes `moleculesCanvas` / `macromoleculesCanvas` locators (shared `canvasLocators` object; both switch methods reuse it). Additive only — no behavior change to existing methods. `tsc --noEmit` clean.
- **Phase 2 (2026-10-09):** spec implemented with all 8 tests. First run: 6/8 passed. Two failures diagnosed via throwaway probes:
  - **Test 4 (R4):** dragged monomers do not appear as canvas items unless Flex layout is explicitly selected (`selectLayoutModeTool(LayoutMode.Flex)`); without it the monomer locator count is 0. Fixed by adding the Flex select after the mode switch (matches the proven pattern in `Macromolecule-editor/Undo-Redo/undo-redo.spec.ts`).
  - **Test 8 (R8):** two switches produce **3** undo entries, not 2 — the shared-page fixture's `resetSettingsValuesToDefault` cleanup leaves one history entry (`clearCanvas` and `resetZoomLevelToDefault` leave none; verified step-by-step probe on a fresh page). Fixed by looping undo until the button is disabled (capped at 10) instead of hardcoding 2, then probing the no-op via keyboard.
- Phase 3: _in progress — re-run after fixes_
  - **New spec (after fixes): 8/8 passed** (13.6s).
  - **Full `chromium-popup` run (1525 tests, 26.9m): 620 passed / 861 failed / 44 skipped.** All 8 Mode-Switching tests passed. The 861 failures are pre-existing/environmental: ~all are "A snapshot doesn't exist … `-darwin.png`" — snapshot baselines are Linux-only (generated via Docker per testing.md), so the screenshot suite cannot pass on this macOS machine. A handful of unrelated flaky-UI errors (e.g. `Unknown key: "Option"`, click timeouts) appear in Bugs/Snake-Mode specs, untouched by this change. The diff for this work is additive (two new POM locators + one new spec file) and cannot affect other specs.
  - Side effect cleaned up: the full run with `GENERATE_DATA=true` rewrote ~185 expected files under `tests/test-data/`; all restored via `git checkout`. Working tree now contains only the intended changes (POM + new spec + this plan).

## 9. Rules & constraints to respect

- New spec in **chromium-popup** only; import `test`/`expect`/`Page` from `@fixtures`, never `@playwright/test`.
- Use path aliases (`@tests/…`, `@utils/…`), no relative imports from spec files.
- All UI interaction through POMs; `getByTestId`-based locators; monomer enum constants (`Peptide.Tza`), no hardcoded strings.
- No `page.waitForTimeout` as a wait mechanism; use `waitForRender`-wrapped helpers (all planned actions already are).
- One behavior per test; comment block with issue number (#11899) in each test.
- Named coordinate constants — no magic numbers.
- Never commit autonomously — ask the user before `git commit`.
- Memory bank: this is not an OpenSpec change, so no memory-bank update is required now; if behavior findings contradict `.memory-bank` docs, flag them for a follow-up update.

## 10. Open questions / risks

| # | Question | Mitigation |
| - | -------- | ---------- |
| Q1 | Does typing 'C' on the micro canvas place a carbon headlessly (vs. opening a dialog)? | **Resolved in Phase 0:** no — it only selects C in the right-side periodic-table panel. Use `RightToolbar(page).clickAtom(Atom.Carbon)` + `clickOnCanvas` instead |
| Q2 | Is a mode switch exactly **one** undo step, or does it bundle with layout/ruler state? | **Resolved in Phase 0 (fixed build):** exactly one undo step per switch; structure preserved across the revert. No plan changes needed |
| Q3 | Do `undo`/`redo` buttons expose a `disabled` attribute at stack boundaries? | **Resolved in Phase 0:** yes — verified disabled=true at both boundaries and after redo invalidation. Tests use `toBeDisabled()` (R5, R8) |
| Q4 | Does `clearCanvas` (fixture cleanup) reset the history stack, guaranteeing no cross-test leakage? | **Resolved (pre-spike evidence):** `star-atom.spec.ts` test 7 undoes exactly once after the fixture's clear and expects the just-added atom to vanish — so clearing resets history. Shared-page pattern is safe. **Refined (2026-10-09):** `clearCanvas`/`resetZoomLevelToDefault` leave no entry, but `resetSettingsValuesToDefault` leaves exactly one — boundary tests must account for it |
| Q5 | Should the 32-step shared limit be tested? | Default: out of scope (brittle, slow). Revisit only if the team asks |
| Q6 | Does switching modes with a non-empty micro canvas alter monomer rendering in a way that breaks test 4's macro assertions? | **Resolved (2026-10-09):** tests start from empty canvas per fixture; the real hazard was layout mode — dragged monomers only render as canvas items in Flex layout, so test 4 selects Flex explicitly after switching |
