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
- **Drop distance threshold is 10 px** (from the monomer's center) — confirmed with the feature owner. Dropping within 10 px triggers replacement; dropping farther away just adds a new monomer.
- **"Same geometry" rule for presets** (confirmed): same component composition — sugar+base+phosphate = sugar+base+phosphate, sugar+base = sugar+base, sugar+phosphate = sugar+phosphate — **and** the phosphate must be on the same side of the sugar (left vs. right). E.g. `A` vs `C`/`G`/`T`/`U` (same R + P, different base) are same-geometry; `A` vs `dR(U)P` is not (different sugar); a preset whose phosphate sits on the opposite side of the sugar from the target is also not same-geometry even with identical components.
- **Bonds carry stable data attributes** in both flex and snake renderers (`MonomerToAtomBondRenderer.ts`, `FlexModePolymerBondRenderer.ts`, `SnakeModePolymerBondRenderer.ts`): `data-testid="bond"`, `data-bondid`, `data-frommonomerid`, `data-tomonomerid`, `data-fromattachmentpoint`, `data-toattachmentpoint`. Monomer IDs come from `data-monomerid` on the monomer locator → bond existence/structure can be asserted structurally, no screenshots needed.
- **The drag-over highlight state currently has NO data attributes** in the rendered SVG — it cannot be asserted as-is. We may add one (see §4.3).

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

For the drag-over *highlight* test (5.1) we additionally need a non-releasing variant that stops mid-drag so the highlight can be asserted before the drop, e.g. `startDragLibraryItem(page, item)` (hover + `mouse.down()`) and `releaseAt(page, { x, y })` / `cancelDrag(page)` (move away + `up`). Keep both built on the same primitives as `dragMonomerOnCanvas`.

### 4.2 New bond-inspection utilities (primary means of bond verification)

New file `tests/utils/macromolecules/bonds.ts` (or extend `monomer.ts`), built on the bond data attributes listed in §2:

```ts
/** All bonds connected to a given canvas monomer. */
function getMonomerBonds(page: Page, monomerId: string): Locator;
// page.locator('[data-testid="bond"][data-frommonomerid="<id>"], [data-testid="bond"][data-tomonomerid="<id>"]')

/** Assert a bond exists between two monomers (either direction). */
async function hasBondBetweenMonomers(page: Page, monomerA: Locator, monomerB: Locator): Promise<boolean>;

/** Count bonds of a monomer; optionally filtered by attachment point. */
function countMonomerBonds(page: Page, monomerId: string, attachmentPoint?: string): number;
```

Monomer IDs are read via `getMonomerLocator(...).getAttribute('data-monomerid')`. These helpers replace screenshots for all "bonds re-established / bond deleted" assertions (req. 3, 7, 10, modal Yes/Cancel outcomes, chem-bond QA note).

### 4.3 Optional source change: data attribute for the drag-over highlight state

The replacement-target highlight (req. 1/4/8 visual feedback) currently has no stable attributes in the rendered SVG. **Proposed:** add a data attribute to the highlighted monomer element in the renderer while it is a replacement target, e.g. `data-replacement-target="true"` (exact name/location decided during implementation, kept consistent with existing `data-*` conventions). This makes "target changes appearance on hover" assertable without screenshots and also lets tests wait for the highlight before dropping (more stable than relying on render timing alone). If adding it proves invasive, fall back to covering highlighting via screenshots only.

## 5. Test cases

Conventions: shared-page pattern where a file is single-mode (`initFlexCanvas` / `initSnakeCanvas` + `FlexCanvas`/`SnakeCanvas` auto-cleanup in `beforeEach`); for files mixing modes, use Pattern B (per-test page via `{ page }`, set layout mode per test) — final choice per file during implementation. Every test gets the standard comment block with issue number and description. Coordinates extracted to named constants (no magic numbers).

### 5.1 `drag-drop-replace-monomer.spec.ts`

| Test | Steps | Assert |
|------|-------|--------|
| Replace peptide monomer with another peptide (flex) | Load `.ket` fixture with A–C chain; drag `Peptide.G` onto first `A` | Old alias count −1, new alias count +1; bond between the two monomers still present (`hasBondBetweenMonomers`); no layout reflow (neighbors unchanged — screenshot) |
| Replace monomer at chain end vs. internal position | Same for terminal and internal monomer | Replacement works in both positions; bonds on both sides re-established (internal: `countMonomerBonds` of the new monomer = 2, correct neighbor IDs via bond attributes) |
| Replace peptide with chem monomer | Drag `Chem` item onto a peptide in a chain | Monomer replaced; bond to neighbor kept if AP allows (`getMonomerBonds`) |
| **Drop outside the 10 px radius does NOT replace** (negative, req. 1) | Drag replacement so it lands >10 px from the target's center (e.g. 40 px offset) | No replacement — a new monomer is added instead (alias counts +1 for dragged item, target unchanged) |
| **Highlight state on drag-over** (req. 1 visual feedback) | Hover during drag over the target without dropping | Target has `data-replacement-target` attribute (if §4.3 implemented); otherwise screenshot of highlighted state |
| **Monomer dropped onto preset component replaces only that component** | Build preset `A`; drag `Base.G` onto the base component of the preset | Preset structure preserved (sugar + phosphate still present), base changed (screenshot + monomer counts) |
| **Warning modal — lost bond (req. 3.1)** | Set up a monomer bonded via an AP the replacement lacks; drag replacement onto it | `ConfirmYourActionDialog` visible, title "Deletion of bonds", text "Some bonds will get deleted during replacement. Do you wish to proceed." |
| Modal → **Cancel** | …click Cancel | No replacement happened (alias counts unchanged), canvas state restored |
| Modal → **Yes** | …click Yes | Replacement executed; the specific bond(s) without a matching AP are gone (`hasBondBetweenMonomers` → false for that pair), all other bonds of the new monomer intact (`getMonomerBonds`) |
| Snake mode: replace monomer, no layout re-trigger (req. 11) | Snake chain; replace internal monomer with same-geometry one | Layout not re-run — neighboring monomers keep positions (screenshot comparison of pre/post state) |

### 5.2 `drag-drop-replace-preset.spec.ts`

| Test | Steps | Assert |
|------|-------|--------|
| Replace preset with same-geometry preset, base change (req. 4–6) | Load `.ket` fixture with A–C chain; drag `Preset.G` onto first `A` (same R+P geometry) | First preset now G (screenshot); bond to C intact (`hasBondBetweenMonomers`) |
| Sugar / phosphate swap within same geometry | Drag presets differing in sugar/phosphate where the component composition still matches | Correct component replaced, bonds re-established on corresponding components (req. 7) — verified via bond attributes (`data-fromattachmentpoint`/`data-toattachmentpoint`) |
| **Different geometry is NOT a replacement target** (req. 4/6 negative case) | Drag `Preset.dR_U_P` (deoxy sugar) onto `A` | No highlight/replacement — item is added as a new monomer instead (counts +1, not swap) |
| **Phosphate on opposite side of sugar is NOT same geometry** (negative case) | Find in `Presets.ts` a preset with the same components as the target but phosphate on the other side of the sugar; drag it onto the target | No replacement — item added as new monomer (counts +1, target unchanged) |
| **Warning modal preset→preset (req. 7.1)** | `.ket` fixture: preset bonded via its phosphate to the next nucleotide; replace with a same-geometry preset lacking that AP (e.g. `Preset.R__P` if geometry rules allow, else construct case per implementation) | Modal appears; **Yes** → inter-nucleotide bond gone (`hasBondBetweenMonomers` → false), replacement done; **Cancel** → alias counts and bonds unchanged |
| Layout: standard bonds, no reflow (req. 12.1) | Replace internal preset in snake & flex with same-geometry preset | No layout trigger — positions stable (screenshots) |
| Layout: non-standard bonds, snake (req. 12.2) | Build chain with non-standard bond lengths/angles (e.g. via hand-drawn bonds), replace preset | Snake re-lays-out the chain (screenshot shows reflowed layout) |
| Layout: flex keeps sugar position (req. 12.3) | Same setup in flex | New preset's sugar rendered at the old sugar's position (screenshot / bounding-box comparison of sugar component before vs. after) |

### 5.3 `drag-drop-replace-preset-onto-monomer.spec.ts`

| Test | Steps | Assert |
|------|-------|--------|
| Preset replaces a single monomer (req. 8–9) | `.ket` fixture: chain A–(single sugar R)–C; drag `Preset.A` onto the lone sugar | Sugar becomes full preset (screenshot); bonds re-established on both sides (`hasBondBetweenMonomers` to A and to C) |
| **Rn bond priority sugar > phosphate > base (req. 10.1–10.2)** | Monomer bonded via Rn; replace with a preset where several components have free Rn | Bond attaches to the sugar's Rn — assert via bond attribute `data-toattachmentpoint`/`data-fromattachmentpoint` on the re-established bond (fallback: `getAttachmentPointLocator`) |
| **No unoccupied Rn → modal (req. 10.3)** | `.ket` fixture where all preset components' Rn are occupied by internal bonds | "Deletion of bonds" modal appears; Yes/Cancel behavior as in 5.1 (bond assertions via helpers) |
| Layout: snake reflow (req. 13.1) | Replace internal monomer with a preset in snake mode | Snake layout triggered — chain re-laid-out around the bigger geometry (screenshot); bonds still correct per helpers |
| Layout: flex chain shift (req. 13.2) | Same in flex | Chain shifts left/right to accommodate preset; replaced monomer's anchor position kept (screenshot + bounding boxes) |
| **Smooth scroll on viewport overflow (req. 14)** | `.ket` fixture: long snake/flex chain near viewport edge; replace so the shift pushes content out of view | Canvas auto-scrolls to keep content visible (assert canvas scroll/viewport state after replacement, or screenshot before/after showing content in view). *Feasibility to be confirmed during implementation — if smooth-scroll state is not stably assertable, cover with a final-state screenshot and mark the limitation.* |
| Bonds to small molecules & H-bonds kept (QA note) | `.ket` fixture: chem monomer bonded to the replacement target; perform replacement | Chem bond survives replacement (`getMonomerBonds` — `data-testid="bond"` + `data-toatomid` on the monomer-to-atom bond); hydrogen bonds preserved where applicable |

## 6. Verification strategy

1. **Structural assertions (primary):** `getMonomerLocator(page, X).count()` before/after — alias/type presence and counts prove what was replaced and that nothing extra was added/lost.
2. **Bonds (data attributes, not screenshots):** the new bond helpers from §4.2 (`hasBondBetweenMonomers`, `getMonomerBonds`, `countMonomerBonds`) built on `data-testid="bond"` + `data-frommonomerid`/`data-tomonomerid`/`data-fromattachmentpoint`/`data-toattachmentpoint`. Screenshots are used for bonds only as a secondary visual check, never as the sole assertion.
3. **Layout behavior:** screenshot comparison of the canvas before/after replacement (positions stable vs. reflowed), plus bounding-box deltas for the specific "sugar keeps position" / "chain shifts" cases (req. 12.3, 13.2).
4. **Modal:** `ConfirmYourActionDialog` visibility + exact title/text + both button outcomes.
5. **Highlight state:** `data-replacement-target` attribute assertion if the §4.3 source change is made; screenshots otherwise.

## 7. Test data

- **Prefer `.ket` fixture files** over drawing chains via mouse: create fixtures under `tests/test-data/Monomer-Replacement/` (generate once by hand in Ketcher) and load with `openFileAndAddToCanvasMacro(page, path)`. This is the primary approach for all pre-built chains — including non-standard bond lengths/angles (req. 12.2), Rn-occupancy setups (req. 10.3), and long chains near the viewport edge (req. 14).
- In-canvas construction (`dragMonomerOnCanvas` + `connectMonomersWithBonds`) is acceptable only for trivially simple chains (2–3 monomers) where a fixture would be overkill.
- Suggested fixtures (final set decided during implementation):
  - `monomer-chain-simple.ket` — A–C peptide chain (terminal + internal replacement targets)
  - `preset-chain-same-geometry.ket` — A–C nucleotide presets, standard bonds
  - `preset-non-standard-bonds.ket` — preset chain with non-standard bond lengths/angles (req. 12.2)
  - `preset-phosphate-bonded.ket` — preset bonded via phosphate to next nucleotide (req. 7.1)
  - `rn-bond-priority.ket` / `rn-all-occupied.ket` — req. 10.2 / 10.3 setups
  - `long-chain-viewport-edge.ket` — long chain positioned so a replacement shift pushes content out of view (req. 14)
  - `chem-bonded-target.ket` — chem monomer bonded to the replacement target (QA note)

## 8. Implementation order

1. **Phase 0 — Spike (confirm feasibility):** manually run one drag-onto-monomer via `dragMonomerOnCanvas` with computed coordinates; confirm replacement works headless and the 10 px radius behaves as expected (drop at center vs. 40 px offset).
2. **Phase 1 — Infrastructure:** utility `dragLibraryItemOntoMonomer` (+ non-releasing drag variant, §4.1) and bond helpers (`tests/utils/macromolecules/bonds.ts`, §4.2); optionally the `data-replacement-target` source change (§4.3) — decide after seeing where the highlight is rendered.
3. **Phase 2:** `.ket` fixtures for Phase-3 scenarios (hand-crafted in Ketcher, stored under `tests/test-data/Monomer-Replacement/`).
4. **Phase 3:** `drag-drop-replace-monomer.spec.ts` (incl. modal cases).
5. **Phase 4:** `drag-drop-replace-preset.spec.ts`.
6. **Phase 5:** `drag-drop-replace-preset-onto-monomer.spec.ts` (layout/scroll cases last — most visually complex).
7. **Phase 6:** generate Linux snapshots via Docker (`npm run docker:build`, `npm run docker:test`, `docker:update` as needed), commit snapshot dirs alongside specs.

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
| 1 | Assertability of smooth scroll (req. 14) | Final-state screenshot fallback; document as limitation if not stably assertable |
| 2 | Screenshot stability for layout-reflow tests (animation during re-layout) | Use `waitForRender` + existing banner/spinner waits; add tolerance (`maxDiffPixels`) only where genuinely noisy |
| 3 | Which concrete preset pairs in `Presets.ts` match each same-geometry rule, incl. phosphate-side variants (negative case in 5.2) | Pick pairs from `tests/pages/constants/monomers/Presets.ts` during Phase 2; verify empirically in the spike |
| 4 | Whether the §4.3 highlight data attribute is worth adding vs. screenshot-only coverage | Decide in Phase 1 based on where/how the highlight is rendered in the SVG |

Resolved during planning (no longer open): drop distance threshold = **10 px**; "same geometry" rule = matching component composition (sugar+base+phosphate / sugar+base / sugar+phosphate) with phosphate on the same side of the sugar; bond verification via bond data attributes (helpers in §4.2); `.ket` fixtures as the primary way to build chains (§7).
