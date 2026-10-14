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
  - **CORRECTION (Phase 2): a preset placed on the canvas is rendered as its component monomers** (sugar / base / phosphate), each with its own `data-monomertype` (`Sugar`/`Base`/`Phosphate`). There is **no** element with `data-monomertype="Preset"` — `getMonomerLocator(page, Preset.X)` matches nothing on the canvas. Verify preset presence via component locators (e.g. `getMonomerLocator(page, Preset.A.base)`), and bond preset chains component-to-component (`phosphate → sugar`), mirroring `tests/specs/Macromolecule-editor/Snake-Mode/snake-bond-tool.spec.ts`.
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
- Final fixture set (created in Phase 2, see "Phase 2 results" in §8): `monomer-chain-simple.ket`, `preset-chain-same-geometry.ket` (also serves as req. 7.1 setup — standard preset chains bond via the phosphate), `preset-non-standard-bonds.ket`, `rn-bond-priority.ket`, `long-chain-viewport-edge.ket`, `chem-bonded-target.ket`. `rn-all-occupied.ket` (req. 10.3) is deferred to Phase 5 and will be constructed per implementation.

## 8. Implementation order

1. **Phase 0 — Spike (confirm feasibility):** manually run one drag-onto-monomer via `dragMonomerOnCanvas` with computed coordinates; confirm replacement works headless and the 10 px radius behaves as expected (drop at center vs. 40 px offset).
2. **Phase 1 — Infrastructure:** utility `dragLibraryItemOntoMonomer` (+ non-releasing drag variant, §4.1) and bond helpers (`tests/utils/macromolecules/bonds.ts`, §4.2); optionally the `data-replacement-target` source change (§4.3) — decide after seeing where the highlight is rendered.
3. **Phase 2:** `.ket` fixtures for Phase-3 scenarios (hand-crafted in Ketcher, stored under `tests/test-data/Monomer-Replacement/`).
4. **Phase 3:** `drag-drop-replace-monomer.spec.ts` (incl. modal cases).
5. **Phase 4:** `drag-drop-replace-preset.spec.ts`.
6. **Phase 5:** `drag-drop-replace-preset-onto-monomer.spec.ts` (layout/scroll cases last — most visually complex).
7. **Phase 6:** generate Linux snapshots via Docker (`npm run docker:build`, `npm run docker:test`, `docker:update` as needed), commit snapshot dirs alongside specs.

Each phase ends with running the new spec locally (`npm run serve` on port 4002 + from `ketcher-autotests/`: `npx playwright test <spec>` or `npm run test:debug -- <spec>`) and fixing before moving on.

### Phase 0 results (done 2026-09-21)

- Spike spec `tests/specs/Chromium-popup/Monomer-Replacement/spike-drag-drop-replacement.spec.ts` — **both tests pass** (chromium-popup, ~6 s):
  - Drop a library monomer on another monomer's center → target replaced (old alias count 0, new alias count 1). Replacement works headless via `dragMonomerOnCanvas` with bounding-box-center coordinates. ✅
  - Drop 40 px away from the center → no replacement, new monomer added (both present). 10 px radius behaves as expected. ✅
- Notes: `Peptide.G` does not exist in the Peptides enum — use existing entries (e.g. `Peptide.C`). Spike file to be deleted/absorbed into Phase 3 spec.

### Phase 1 results (done 2026-09-21)

- **Source change made:** `data-testid="replacement-highlight"` added to the highlight path in `packages/ketcher-core/src/application/render/renderers/TransientView/ReplacementHighlightView.ts` (one line). Rebuilt core + example; attribute verified in served bundles.
- **New utilities:**
  - `ketcher-autotests/tests/utils/macromolecules/replacement.ts` — `getElementCenterInCanvasCoords`, `dragLibraryItemOntoMonomer`, and the non-releasing drag trio `startDragLibraryItem` / `moveDragToCanvasCoords` / `releaseDrag` / `cancelDrag` (cancel = release over the library, which d3-drag treats as no-op since placement only happens inside the canvas wrapper).
  - `ketcher-autotests/tests/utils/macromolecules/bonds.ts` — `getMonomerId`, `getMonomerBonds`, `countMonomerBonds`, `hasBondBetweenMonomers`, `getBondAttachmentPoints` (all built on `data-testid="bond"` + monomer/AP attributes).
- **Verification:** all 4 spike tests pass (chromium-popup, ~6 s): replacement, 10 px radius, highlight attribute appears mid-drag and clears on cancel, bond helpers on two bonded monomers. Type-check (`tsc --noEmit`) passes.
- **Gotcha found:** in popup mode with the library open, canvas-relative x beyond ~450 lands on the library panel (drop silently cancelled). Keep drop coordinates ≤ ~420 or use full-screen mode for wide layouts.

### Phase 2 results (done 2026-09-22)

Fixtures generated in Ketcher via a temporary Playwright script (`tests/specs/Chromium-popup/Monomer-Replacement/generate-fixtures.spec.ts` — builds each structure on a live canvas, exports via `window.ketcher.getKet()`, then re-opens every file to verify the round trip; **12/12 pass**). Stored under `tests/test-data/Monomer-Replacement/`:

| Fixture | Content | Used by |
|---------|---------|---------|
| `monomer-chain-simple.ket` | Peptide A–C–D chain (terminal + internal replacement targets) | Phase 3 (req. 1–3, 3.1, 11) |
| `preset-chain-same-geometry.ket` | RNA presets A–C, standard bond **phosphate(R2) → sugar(R1)** | Phase 4 (req. 4–7, 12) |
| `preset-non-standard-bonds.ket` | Same A–C chain placed diagonally (non-standard bond length/angle) | Phase 4 (req. 12.2) |
| `rn-bond-priority.ket` | Preset A – lone sugar R – preset C; bonds: A.phosphate→R, R(R2)→C.phosphate(R2) | Phase 5 (req. 8–10) |
| `preset-lone-phosphate.ket` | Preset A – lone phosphate P – preset C; bonds: A.P(R2)→P(R1), P(R2)→C.S(R1) | Phase 5 (req. 13.2 — flex shift needs the backbone to continue through the new P's R2) |
| `long-chain-lone-monomer.ket` | 4-preset RNA chain extended with a terminal lone phosphate + lone sugar (downward, canvas is narrow) | Phase 5 (req. 14) |
| `long-chain-viewport-edge.ket` | 16-preset RNA chain (A-C-G-U ×4, pasted as sequence) | superseded by `long-chain-lone-monomer.ket` in Phase 5 (a preset→monomer replacement needs a lone monomer target; an all-preset chain only triggers the preset→preset path) |
| `chem-bonded-target.ket` | Peptide A–C chain, C bonded to chem EG via C.R2(OH)/EG.R1(H) | Phase 5 (QA note) |

Decisions / findings from Phase 2:

- **`preset-phosphate-bonded.ket` NOT created** — redundant: the standard preset chain already bonds through the phosphate (APs `R2`→`R1`, logged above). `preset-chain-same-geometry.ket` serves as the req. 7.1 setup; the replacement item for that modal case is still to be chosen in Phase 4 (no same-geometry R+P preset lacks a phosphate — see open question #5).
- **`rn-all-occupied.ket` not needed** — resolved in Phase 5: the req. 10.3 modal case is built from `monomer-chain-simple.ket` + inline EG (cysteine R1/R2/R3 all occupied; Preset.A offers only free R1 + R2).
- **Connection rules (empirical):** sugar→sugar bonding between a lone sugar and a preset is rejected; sugar→phosphate is allowed but opens the attachment-point dialog (handle via `AttachmentPointsDialog` POM with explicit APs — ribose R1 / phosphate R1 are disabled when occupied). Peptide→chem bonding also opens the dialog (cysteine R1 disabled once backbone-bonded → use R2(OH)).
- **Preset drop target center (to verify in Phase 4):** for `dragLibraryItemOntoMonomer` onto a preset, pass the **sugar component** locator as the target (presets are anchored on their sugar); confirm the 10 px radius behaves from that point.
- Both temporary files (`spike-drag-drop-replacement.spec.ts`, `generate-fixtures.spec.ts`) stay on this branch until Phases 3–5 absorb/replace them; delete before archiving.

### Phase 3 results (done 2026-09-22)

`tests/specs/Chromium-popup/Monomer-Replacement/drag-drop-replace-monomer.spec.ts` — **9/9 pass** (chromium-popup, ~24 s), shared-page pattern (`initFlexCanvas`); the snake test switches mode via `selectLayoutModeTool(LayoutMode.Snake)` (precedent: `snake-layout-for-micromolecules.spec.ts`).

| Test | Req. covered |
|------|--------------|
| Replaces a terminal peptide monomer, keeps neighbor bond, neighbors don't move | 1–2, 11 (flex) |
| Replaces an internal monomer, re-establishes bonds on both sides (`countMonomerBonds` = 2) | 3 |
| Replaces a peptide with chem EG, backbone bond kept (`countMonomerBonds(EG)` = 1) | QA note (chem bonds) |
| Drop 40 px from center does NOT replace — new monomer added | 1 (negative) |
| `replacement-highlight` appears mid-drag over target, clears on cancel | 1 (visual feedback) |
| Monomer dropped onto preset base replaces only that component (sugar + phosphate kept) | monomer-onto-preset |
| "Deletion of bonds" modal (exact text asserted) — Cancel leaves canvas unchanged | 3.1 |
| Modal — Yes: replacement done, C–EG side bond deleted (`countMonomerBonds(EG)` = 0), new monomer re-bonded to both neighbors | 3.1 |
| Snake mode: internal replacement, neighbors keep positions | 11 (snake) |

Implementation notes / deviations from the plan table:

- **Modal setup** (req. 3.1): fixture A–C–D chain + chem EG bonded to cysteine's side AP via `bondTwoMonomers(page, C, EG, AttachmentPoint.R3, AttachmentPoint.R1)` (peptide→chem opens the AP dialog; handled by the POM). Replacement item is Alanine (only left/right APs) → the C–EG bond would be lost. The new alanine is disambiguated from the original one by proximity to the replaced monomer's former center (`getMonomerClosestToPoint` helper, local to the spec).
- **"No layout re-trigger" (req. 11) is asserted via bounding-box deltas** of the neighbor monomers (±1 px tolerance), not screenshots — deterministic and snapshot-free; screenshot comparison would only prove the same thing noisily. Same approach available for req. 12/13 in Phases 4–5.
- **`Peptide.F` constant fixed**: `testId` was stale (`F___Phenylalanine-ethylthiocysteine`) and matched no library card; corrected to `F___Phenylalanine` per `monomers.ket`. Only affects library drags (canvas locators are alias+type based), so existing specs are unaffected.
- EG has left+right APs (`monomers.ket`), so dropping it on a chain-end peptide re-establishes the backbone bond without a modal — verified by the passing chem test.
- Spike spec `spike-drag-drop-replacement.spec.ts` **deleted** — all four spike cases are absorbed into this spec (tests 1/2, 4, 5; bond helpers used throughout). `generate-fixtures.spec.ts` stays until Phases 4–5 are done (may be reused for the deferred `rn-all-occupied.ket`).
- Environment note: local Playwright needed `npx playwright install chromium` (cache had a different build); root `npx eslint` is broken in this checkout (`@eslint/css` missing) — pre-existing, unrelated.

### Phase 4 results (done 2026-09-23)

`tests/specs/Chromium-popup/Monomer-Replacement/drag-drop-replace-preset.spec.ts` — **9/9 pass** (chromium-popup, ~10 s), shared-page pattern (`initFlexCanvas`); snake tests switch mode via `selectLayoutModeTool(LayoutMode.Snake)`.

| Test | Req. covered |
|------|--------------|
| Same-geometry preset replacement (base change), inter-preset bond re-established | 4–6 |
| Drop onto any component (base) replaces the whole preset | 4 |
| Different-sugar preset (`dR(U)P`) still replaces a ribose preset | 4/6 (re-scoped, see below) |
| "Deletion of bonds" modal — `12ddR()P` lacks R3 → bond to kept base would be lost; Cancel keeps original | 7.1 |
| Modal — Yes: kept base orphaned (`countMonomerBonds` = 0), new phosphate re-bonded internally + inter-preset (2 bonds) | 7.1 |
| No layout re-trigger, standard bonds (flex) — neighbor preset keeps positions | 12.1 |
| No layout re-trigger, standard bonds (snake) | 12.1 |
| No layout re-trigger even with non-standard bond geometry (re-scoped req. 12.2) | 12 |
| Flex keeps the new preset's sugar at the replaced one's position (non-standard fixture) | 12.3 |

Findings that changed the plan (all verified empirically via temporary probe specs, since deleted):

- **Open question #5 RESOLVED — the req. 7.1 modal IS triggerable for preset→preset**, but not with standard R+P presets: in a standard chain the inter-preset bond runs through phosphate R2, which is free on every R+P preset, so same-geometry swaps never lose bonds (probes showed `dialog=false` for `C`/`G`/`dR(U)P` onto `A`). The working case: drop **`12ddR()P`** (sugar+phosphate, no base) onto a full preset — the 12ddR sugar template has only R1/R2 APs (no R3), so the bond to the *kept* base is lost → modal. Cancel/Yes both covered; after Yes the kept base stays on canvas but orphaned.
- **Open question #3 RESOLVED / re-scoped — "different geometry" negative cases as written do not exist in the library:**
  - `dR(U)P` onto `A` **is** a whole-preset replacement (sugar R→dR, base A→U). `presetsHaveSameGeometry`/`getMatchingPresetComponents` (`replacementHelpers.ts`) compare slot composition + phosphate side only and intentionally ignore monomer identities. The plan's "different sugar = not same geometry" note is not what the implementation does — test documents actual behavior instead.
  - **No left-phosphate library preset exists** (group templates carry no connections; `getRnaPresetPhosphatePosition` defaults to `'right'`), so the "phosphate on opposite side" negative cannot be triggered by a library drag at all. Documented, not tested.
- **Req. 12.2 re-scoped — same-geometry preset replacement NEVER re-runs the layout** (explicit in `LibraryItemDragDropHandler.buildReplacementCommand`: "No re-layout for same-geometry preset replacement (task 7.2, 7.3)"). The snake layout trigger (`applySnakeLayout`) exists only on the **preset→monomer** path — that is req. 13, covered in Phase 5. Also: snake mode normalizes non-standard bond geometry *on file load*, so a reflow-on-replacement was unobservable anyway; flex keeps the hand-adjusted diagonal (probe offsets confirmed). The spec instead asserts the chain's non-standard geometry survives replacement untouched.
- **Test-design gotcha:** after replacing preset A with another C, two identical presets exist and first-match locators resolve to the *replaced* components (they keep their original DOM order). Neighbors are tracked by stable `data-monomerid` (`getMonomerId` + `getMonomerLocator({ monomerId })`) — see `capturePresetC()` in the spec.
- **Stale constants found:** `Presets.ts` lists 38 presets but the library only contains 21 group templates — e.g. `R()P` (`Preset.R__P`) and `R(A)` have no library card (hover times out). The only base-less R+P-style preset actually available is `12ddR()P` (`Preset._12ddR__P`).
- Temporary probe specs (`probe-preset-replacement.spec.ts`, `probe-preset-layout.spec.ts`) deleted — findings absorbed above. `generate-fixtures.spec.ts` stays until Phase 5.

### Phase 6 results (done 2026-09-24)

**Docker snapshot generation not applicable:** none of the three specs use `toHaveScreenshot` or `verifyFileExport` — Phases 3–5 deliberately replaced screenshot assertions with deterministic structural checks (alias/type counts, bond data attributes, bounding-box deltas), so there are no snapshot directories to generate or commit. The Docker step from §8 is dropped.

- **Full suite verified:** all three specs run together — **26/26 pass** (chromium-popup, ~25 s), confirmed on 2026-09-24 against a local build containing this branch's Phase-1 source change. (An earlier run showed 25/26 because the then-served build predated the Phase-1 `replacement-highlight` commit — environmental, not a test defect.)
- **Stability fix in `tests/utils/macromolecules/replacement.ts`:** `moveDragToCanvasCoords` / `cancelDrag` now move the mouse in steps (`DRAG_MOVE_STEPS = 10`) instead of a single jump — a one-shot move can be missed by the drag-over handler, which made mid-drag highlight assertions flaky.
- **Cleanup:** temporary specs deleted — `probe-preset-onto-monomer.spec.ts`, `generate-long-chain-lone-monomer.spec.ts`, `generate-fixtures.spec.ts` (all findings absorbed into Phases 2–5 notes above; no OpenSpec change exists for this work, so nothing is held back for archiving). Superseded fixture `long-chain-viewport-edge.ket` deleted. Final state: 3 specs + 7 `.ket` fixtures under `tests/test-data/Monomer-Replacement/`.
- **Committed** on branch `tests-for-drag-n-drop-replace`.

### Post-completion addition (2026-09-24): undo/redo coverage

The original plan was scoped strictly to the issue #7455 requirement list, which omitted undo/redo — a gap against testing.md's "Expectations for New Features" (undo/redo behavior when applicable). Replacement is a proper `EditorHistory` command (`buildReplacementCommand` in `LibraryItemDragDropHandler.ts`), so it is applicable. Added 3 tests (suite now **29/29 pass**):

- Monomer spec: undo restores the original monomer with its bonds; redo re-applies the replacement
- Preset spec: undo of a same-geometry preset replacement restores all components and the inter-preset bond

### Phase 5 results (done 2026-09-23)

`tests/specs/Chromium-popup/Monomer-Replacement/drag-drop-replace-preset-onto-monomer.spec.ts` — **8/8 pass** (chromium-popup, ~13 s), shared-page pattern (`initFlexCanvas`); flex tests select `LayoutMode.Flex` explicitly, the snake test opens the file first and then switches to snake (mode state persists across tests on the shared page).

| Test | Req. covered |
|------|--------------|
| Preset replaces a single monomer; new sugar anchored at the old position | 8–9 |
| R1 bond re-established on the new sugar (AP attributes asserted); R2 bond dropped without a modal because the new sugar's R2 is consumed by the internal sugar–phosphate bond | 10 |
| "Deletion of bonds" modal when no preset component has a free Rn — Cancel keeps the original | 10.3 |
| Modal Yes: R1 → new sugar, R2 falls back to the phosphate (priority), R3 deleted and the chem EG orphaned | 10.1–10.3 |
| Snake mode: `applySnakeLayout` re-lays out the downstream preset (≥30 px shift); upstream preset keeps positions | 13.1 |
| Flex mode: downstream backbone (sugar + phosphate) shifts one cell; side-branch base stays put; downstream bond re-established on the new phosphate's R2; upstream R1 bond dropped | 13.2 |
| Chem bond kept: C–EG re-routed to the new phosphate's free R2 | QA note (small-molecule bonds) |
| Terminal monomer of a long chain replaced near the viewport edge; upstream bond kept (req. 14 limitation documented in-test) | 14 (limited, see below) |

Findings that changed the plan (verified against source + temporary probes, deleted after absorption):

- **Req. 10 routing is role-locked for RNA targets**: `findNewPresetComponentForBond` (`DrawingEntitiesManager.ts`) routes a bond to the new component of the *same role* as the original component (sugar → sugar). The sugar > phosphate > base priority only applies to standalone monomers that are not recognised RNA components (peptides/chem) — covered by the peptide modal tests. Consequence: when a lone sugar is replaced by a full preset, its R2 bond is **silently dropped** even though `computeLostBondsForReplacement` predicts 0 lost bonds (it unions template free APs across all components), so no modal appears. Documented in the test; possible implementation inconsistency worth flagging to the team.
- **Flex shift only reaches monomers downstream of the new phosphate's R2**: `shiftDownstreamChainMonomers` traverses `getNextMonomerInChain(anchor)`. When the backbone does not continue through the new P's R2 (e.g. the replaced lone sugar's R2 bond was dropped), nothing shifts even though the preset has sugar + phosphate. To observe a real shift, the target must be a **lone phosphate** (`preset-lone-phosphate.ket`): the downstream bond re-establishes on the new P's R2 and C's sugar + P shift one cell; the side-branch base is not shifted (not part of the backbone traversal) — asserted.
- **Req. 14 smooth auto-scroll is NOT implemented**: task 7.8 in the archived change `2026-08-13-monomer-replacement-drag-drop` is unchecked and no scroll code exists in the replacement flow. The long-chain test asserts structural final state only; limitation documented in-test and here (open question #1 closed).
- **New fixtures**: `preset-lone-phosphate.ket` (A – lone P – C) and `long-chain-lone-monomer.ket` (4-preset chain + terminal lone P + lone S). The long chain extends *downward* because pasted RNA sequences end with a sugar (no terminal phosphate), the popup canvas area is narrow (~530 px wide, library panel on the right), and sugar→sugar bonding is rejected by the connection rules.
- **Structural target selection**: the lone monomer is found as the only sugar without an R3 bond (`findLoneSugar`). Median-x heuristics break in snake mode — the P-to-P bond in `rn-bond-priority.ket` splits the backbone into two chains, reordering x positions (a probe run accidentally replaced preset C instead of the lone sugar).
- **Anchor tolerance**: the new sugar is anchored at the target's model position, but bounding-box centers carry a per-glyph offset — ~0 px when replacing a sugar with a sugar, ~5 px when replacing a phosphate (different glyph) — hence `ANCHOR_TOLERANCE_PX = 6`.
- **`rn-all-occupied.ket` not needed**: the req. 10.3 modal case is built from `monomer-chain-simple.ket` + inline EG (cysteine R1/R2/R3 all occupied; Preset.A offers only free R1 + R2) — no extra fixture required.
- Temporary files deleted: `probe-preset-onto-monomer.spec.ts`, `generate-long-chain-lone-monomer.spec.ts`. `generate-fixtures.spec.ts` stays until archiving (Phase 6).

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
| 1 | Assertability of smooth scroll (req. 14) | **Resolved in Phase 5:** the auto-scroll is not implemented at all (task 7.8 unchecked, no scroll code in the replacement flow) — nothing to assert; covered by a structural long-chain test with the limitation documented |
| 2 | Screenshot stability for layout-reflow tests (animation during re-layout) | Use `waitForRender` + existing banner/spinner waits; add tolerance (`maxDiffPixels`) only where genuinely noisy |
| 3 | Which concrete preset pairs in `Presets.ts` match each same-geometry rule, incl. phosphate-side variants (negative case in 5.2) | **Resolved in Phase 4:** slot composition + phosphate side only — monomer identity ignored (`dR(U)P` replaces `A`). No left-phosphate library preset exists, so the opposite-side negative is untestable via library drag (documented) |
| 4 | Whether the §4.3 highlight data attribute is worth adding vs. screenshot-only coverage | Resolved in Phase 1: attribute added (`data-testid="replacement-highlight"`) |
| 5 | Req. 7.1 modal case: which same-geometry replacement item lacks the bonded AP? All R+P presets (A/C/G/T/U) have a phosphate, so dropping one onto a phosphate-bonded preset may never trigger "Deletion of bonds" | **Resolved in Phase 4:** standard R+P swaps never trigger it (inter-preset bond uses phosphate R2, free on all R+P presets). Working case: `12ddR()P` (no base; 12ddR lacks R3) onto a full preset → bond to kept base lost → modal. Both Cancel/Yes covered |

Resolved during planning (no longer open): drop distance threshold = **10 px**; "same geometry" rule = matching component composition (sugar+base+phosphate / sugar+base / sugar+phosphate) with phosphate on the same side of the sugar; bond verification via bond data attributes (helpers in §4.2); `.ket` fixtures as the primary way to build chains (§7).
