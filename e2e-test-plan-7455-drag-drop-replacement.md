# E2E Test Plan — Issue #7455: Monomer replacement via drag-and-drop from library

> Plan for Playwright E2E tests covering the feature "Support monomer replacement with drag-and-drop from library" (https://github.com/epam/ketcher/issues/7455, implemented in PR #11089).
> Branch: `tests-for-drag-n-drop-replace` (fresh, no commits yet).

## 1. Feature summary (what must be tested)

Dragging a library item (monomer or RNA preset) onto an existing monomer/preset on the macromolecule canvas highlights the target; on drop, the target is **replaced** by the library item and all possible bonds are re-established.

| # | Requirement | Scenario |
|---|-------------|----------|
| 1–3 | Monomer → monomer | Drop a single monomer within range of another monomer's center → it is replaced; all possible bonds re-established |
| 3.1 | Warning modal | If the dragged monomer lacks an attachment point (AP) the original had bonded with → "Deletion of bonds" modal (Cancel default / Yes) |
| — | Monomer onto preset | A monomer dropped onto a preset component replaces **only that component** (preset structure preserved) |
| 4–7 | Preset → preset (same geometry) | Same geometry = same components + same phosphate position. On drop, preset replaced; bonds re-established on corresponding components |
| 7.1 | Warning modal | Same modal when a component lacks appropriate APs |
| 8–10 | Preset → monomer | Preset replaces a single monomer not part of a same-geometry preset; Rn bond attaches to unoccupied Rn with priority sugar > phosphate > base (10.2); modal if no unoccupied Rn (10.3) |
| 11 | Layout: monomer → monomer | No layout re-trigger in any mode |
| 12 | Layout: preset → preset | No layout trigger for standard bond lengths/angles; snake triggers layout for non-standard bonds; flex keeps the new preset's sugar at the replaced one's position |
| 13 | Layout: preset → monomer | Snake: layout triggered. Flex: chain shifts left/right to accommodate new geometry |
| 14 | Viewport | Chain shifting outside viewport uses smooth autochain scroll (#3253) |

QA note: replacement must keep bonds between monomers and small molecules (chems), and hydrogen bonds. Reactions are out of scope (unavailable).

## 2. Verified facts from the codebase (affect test design)

- **Warning modal** is the standard `ConfirmationDialog`
  (`packages/ketcher-macromolecules/src/components/modal/ConfirmationDialog/ConfirmationDialog.tsx`):
  window `data-testid="confirmation-dialog"`, text in `confirmation-text`, buttons `yes-button` / `cancel-button`.
  → The existing POM **`ConfirmYourActionDialog`** (`ketcher-autotests/tests/pages/macromolecules/canvas/ConfirmYourActionDialog.ts`) already covers it: `yes()`, `cancel()`, `getMessageBodyText()`, `isVisible()`. No new dialog POM needed.
- **Replacement logic** lives in `packages/ketcher-core/src/application/editor/libraryItemDragDrop/LibraryItemDragDropHandler.ts` (`executeReplacement`, `computeLostBondsForReplacement`) — useful reference when debugging, not directly testable from E2E.
- **Library POM** (`tests/pages/macromolecules/Library.ts`): `dragMonomerOnCanvas(monomer, { x, y, fromCenter? })` already drops at canvas-relative coordinates → we can drop onto a target by computing the target monomer's center from its bounding box. Presets are supported via `Preset.*` constants (`PresetType`).
- **Canvas monomer locators**: `getMonomerLocator(page, Monomer | Preset | options)` → `[data-testid="monomer"][data-monomeralias=...][data-monomertype=...]`. Replacement is verified by alias/type counts before/after.
- **Preset constants** (`tests/pages/constants/monomers/Presets.ts`): e.g. `Preset.A` (sugar R, base A, phosphate P), `Preset.T`, `Preset.U`, `Preset.C`, `Preset.G`, `Preset.dR_U_P` (deoxy sugar → different geometry), `Preset.R__P` (no base). Same-geometry pairs for req. 4–7: e.g. `A` vs `C`/`G`/`T`/`U` (same R+P, different base); different geometry: `dR(U)P` (deoxyribose).
- **Bonding helpers**: `bondTwoMonomers`, `connectMonomersWithBonds(page, [names], bondType)` to pre-build chains; `Chem` monomers for "bonds with small molecules" QA note.
- **Layout mode switching**: `MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex | Snake)`.
- **No existing coverage**: no spec drops a library item *onto* an existing monomer, and "Deletion of bonds" appears nowhere in `tests/`. This is net-new coverage.

## 3. Where the tests live

New folder: `ketcher-autotests/tests/specs/Chromium-popup/Monomer-Replacement/`
(Chromium-popup project per testing.md — all new tests go there.)

| File | Covers | Mode(s) |
|------|--------|---------|
| `drag-drop-replace-monomer.spec.ts` | Req. 1–3, 3.1, monomer-onto-preset-component, req. 11 (no layout re-trigger) | Flex + Snake |
| `drag-drop-replace-preset.spec.ts` | Req. 4–7, 7.1, req. 12 (layout behavior preset→preset) | Flex + Snake |
| `drag-drop-replace-preset-onto-monomer.spec.ts` | Req. 8–10, 10.1–10.3, req. 13, 14 (chain shift / scroll) | Flex + Snake |

Splitting by scenario type keeps files small and follows the `connection-rules-for-*` precedent.

## 4. Test infrastructure changes

### 4.1 New utility (small)

In `tests/utils/macromolecules/monomer.ts` (or a new `tests/utils/macromolecules/replacement.ts`):

```ts
/** Drop a library item onto the center of an existing canvas monomer/preset. */
async function dragLibraryItemOntoMonomer(
  page: Page,
  libraryItem: Monomer | PresetType,
  target: Locator,          // getMonomerLocator(...) of the replacement target
) {
  const bb = await target.boundingBox();
  const canvasBB = await (await getVisibleCanvas(page)).boundingBox();
  await Library(page).dragMonomerOnCanvas(libraryItem, {
    x: bb.x + bb.width / 2 - canvasBB.x,
    y: bb.y + bb.height / 2 - canvasBB.y,
  });
}
```

(Exact shape to be finalized during implementation — `Library.dragMonomerOnCanvas` already handles hover → mouse.down → move → up with `waitForRender`.)

### 4.2 No new POMs required

- Modal: reuse `ConfirmYourActionDialog`.
- Library, toolbar, monomer locators: existing.
- If the drag-over *highlight* state (req. 1/4/8 visual feedback) turns out to have a stable `data-*` attribute in the rendered SVG (to check during implementation), add a small assertion helper; otherwise cover highlighting via screenshots only.

## 5. Test cases

Conventions: shared-page pattern where a file is single-mode (`initFlexCanvas` / `initSnakeCanvas` + `FlexCanvas`/`SnakeCanvas` auto-cleanup in `beforeEach`); for files mixing modes, use Pattern B (per-test page via `{ page }`, set layout mode per test) — final choice per file during implementation. Every test gets the standard comment block with issue number and description. Coordinates extracted to named constants (no magic numbers).

### 5.1 `drag-drop-replace-monomer.spec.ts`

| Test | Steps | Assert |
|------|-------|--------|
| Replace peptide monomer with another peptide (flex) | Build A–C chain; drag `Peptide.G` onto first `A` | Old alias count −1, new alias count +1; bond between the two monomers still present (screenshot of canvas); no layout reflow (neighbors unchanged — screenshot) |
| Replace monomer at chain end vs. internal position | Same for terminal and internal monomer | Replacement works in both positions; bonds on both sides re-established (internal) |
| Replace peptide with chem monomer | Drag `Chem` item onto a peptide in a chain | Monomer replaced; bond to neighbor kept if AP allows |
| **Monomer dropped onto preset component replaces only that component** | Build preset `A`; drag `Base.G` onto the base component of the preset | Preset structure preserved (sugar + phosphate still present), base changed (screenshot + monomer counts) |
| **Warning modal — lost bond (req. 3.1)** | Set up a monomer bonded via an AP the replacement lacks; drag replacement onto it | `ConfirmYourActionDialog` visible, title "Deletion of bonds", text "Some bonds will get deleted during replacement. Do you wish to proceed." |
| Modal → **Cancel** | …click Cancel | No replacement happened (alias counts unchanged), canvas state restored |
| Modal → **Yes** | …click Yes | Replacement executed; bond(s) without matching AP removed (screenshot / bond count via export or visual) |
| Snake mode: replace monomer, no layout re-trigger (req. 11) | Snake chain; replace internal monomer with same-geometry one | Layout not re-run — neighboring monomers keep positions (screenshot comparison of pre/post state) |

### 5.2 `drag-drop-replace-preset.spec.ts`

| Test | Steps | Assert |
|------|-------|--------|
| Replace preset with same-geometry preset, base change (req. 4–6) | Chain A–C; drag `Preset.G` onto first `A` (same R+P geometry) | First preset now G (screenshot); bond to C intact |
| Sugar / phosphate swap within same geometry | Drag presets differing in sugar/phosphate where geometry still matches | Correct component replaced, bonds re-established on corresponding components (req. 7) |
| **Different geometry is NOT a replacement target** (req. 4/6 negative case) | Drag `Preset.dR_U_P` (deoxy sugar) onto `A` | No highlight/replacement — item is added as a new monomer instead (counts +1, not swap) |
| **Warning modal preset→preset (req. 7.1)** | Bond a preset's phosphate to next nucleotide; replace with a preset lacking phosphate (e.g. `Preset.R__P` if geometry rules allow, else construct case per implementation) | Modal appears; Yes → bond deleted; Cancel → unchanged |
| Layout: standard bonds, no reflow (req. 12.1) | Replace internal preset in snake & flex with same-geometry preset | No layout trigger — positions stable (screenshots) |
| Layout: non-standard bonds, snake (req. 12.2) | Build chain with non-standard bond lengths/angles (e.g. via hand-drawn bonds), replace preset | Snake re-lays-out the chain (screenshot shows reflowed layout) |
| Layout: flex keeps sugar position (req. 12.3) | Same setup in flex | New preset's sugar rendered at the old sugar's position (screenshot / bounding-box comparison of sugar component before vs. after) |

### 5.3 `drag-drop-replace-preset-onto-monomer.spec.ts`

| Test | Steps | Assert |
|------|-------|--------|
| Preset replaces a single monomer (req. 8–9) | Chain A–(single sugar R)–C; drag `Preset.A` onto the lone sugar | Sugar becomes full preset (screenshot); bonds re-established (req. 10) |
| **Rn bond priority sugar > phosphate > base (req. 10.1–10.2)** | Monomer bonded via Rn; replace with a preset where several components have free Rn | Bond attaches to the sugar's Rn (screenshot / attachment-point locator inspection via `getAttachmentPointLocator`) |
| **No unoccupied Rn → modal (req. 10.3)** | Construct case where all preset components' Rn are occupied by internal bonds | "Deletion of bonds" modal appears; Yes/Cancel behavior as in 5.1 |
| Layout: snake reflow (req. 13.1) | Replace internal monomer with a preset in snake mode | Snake layout triggered — chain re-laid-out around the bigger geometry (screenshot) |
| Layout: flex chain shift (req. 13.2) | Same in flex | Chain shifts left/right to accommodate preset; replaced monomer's anchor position kept (screenshot + bounding boxes) |
| **Smooth scroll on viewport overflow (req. 14)** | Long snake/flex chain near viewport edge; replace so the shift pushes content out of view | Canvas auto-scrolls to keep content visible (assert canvas scroll/viewport state after replacement, or screenshot before/after showing content in view). *Feasibility to be confirmed during implementation — if smooth-scroll state is not stably assertable, cover with a final-state screenshot and mark the limitation.* |
| Bonds to small molecules & H-bonds kept (QA note) | Chain containing a chem monomer bonded to the replaced target; repeat replacement | Chem bond survives replacement (screenshot); hydrogen bonds preserved where applicable |

## 6. Verification strategy

1. **Structural assertions (primary):** `getMonomerLocator(page, X).count()` before/after — alias/type presence and counts prove what was replaced and that nothing extra was added/lost.
2. **Bonds:** no stable bond-count utility exists yet; use canvas screenshots (`takeEditorScreenshot(page, { hideMonomerPreview: true })`) for bond presence/reflow, and `getAttachmentPointLocator` where a specific AP occupancy must be checked (req. 10.x). One representative case per scenario file may additionally use `verifyFileExport` (KET) to assert bond count in the serialized structure — decide during implementation if flakiness is acceptable.
3. **Layout behavior:** screenshot comparison of the canvas before/after replacement (positions stable vs. reflowed), plus bounding-box deltas for the specific "sugar keeps position" / "chain shifts" cases (req. 12.3, 13.2).
4. **Modal:** `ConfirmYourActionDialog` visibility + exact title/text + both button outcomes.

## 7. Test data

- Prefer building chains in-canvas (`dragMonomerOnCanvas` + `connectMonomersWithBonds`) — keeps tests self-contained and matches the style of `connection-rules-*` specs where practical.
- For complex pre-built scenarios (non-standard bond lengths, long chains for req. 14), create `.ket` fixtures under `tests/test-data/Monomer-Replacement/` and load with `openFileAndAddToCanvasMacro(page, path)` — generate them once by hand in Ketcher.

## 8. Implementation order

1. **Phase 0 — Spike (confirm feasibility):** manually run one drag-onto-monomer via `dragMonomerOnCanvas` with computed coordinates; confirm replacement works headless, find the drop-distance behavior, check whether the highlight state exposes a stable attribute.
2. **Phase 1:** utility `dragLibraryItemOntoMonomer` + `drag-drop-replace-monomer.spec.ts` (incl. modal cases).
3. **Phase 2:** `drag-drop-replace-preset.spec.ts`.
4. **Phase 3:** `drag-drop-replace-preset-onto-monomer.spec.ts` (layout/scroll cases last — most visually complex).
5. **Phase 4:** generate Linux snapshots via Docker (`npm run docker:build`, `npm run docker:test`, `docker:update` as needed), commit snapshot dirs alongside specs.

Each phase ends with running the new spec locally (`npm run serve` on port 4002 + from `ketcher-autotests/`: `npx playwright test <spec>` or `npm run test:debug -- <spec>`) and fixing before moving on.

## 9. Rules & constraints to respect (from CLAUDE.md / testing.md)

- New tests go in the **chromium-popup** project only.
- Import `test`/`expect`/`Page` from `@fixtures`; use path aliases; no relative imports.
- POMs for reusable UI, `getByTestId` selectors, monomer enum constants (no hardcoded strings).
- No `waitForTimeout` as a wait mechanism; wrap canvas mutations in `waitForRender`.
- One behavior per test; comment block with issue number; named coordinate constants; no magic numbers.
- Memory bank: **do not update during implementation** — only when archiving the OpenSpec change (this work is tracked under the opsx workflow if a change exists for it).
- Per project rules, **ask before starting to write the E2E tests** — this plan is that checkpoint.

## 10. Open questions / risks

| # | Question | Mitigation |
|---|----------|------------|
| 1 | Exact drop distance threshold ("[TBD] px" in issue) | Drop exactly on monomer center; test the highlight range only if a stable attribute is found (Phase 0) |
| 2 | Which preset pairs count as "same geometry" in practice (e.g. base-only swaps, sugar variants with/without phosphate) | Verify against `computeLostBondsForReplacement` / replacement target classification in `LibraryItemDragDropHandler.ts` and empirically in Phase 0 spike |
| 3 | Assertability of smooth scroll (req. 14) | Final-state screenshot fallback; document as limitation if not stably assertable |
| 4 | Non-standard bond length/angle setup (req. 12.2) requires hand-drawn bonds — may be fiddly in E2E | Prepare a `.ket` fixture instead of drawing bonds via mouse |
| 5 | Screenshot stability for layout-reflow tests (animation during re-layout) | Use `waitForRender` + existing banner/spinner waits; add tolerance (`maxDiffPixels`) only where genuinely noisy |
