# E2E Test Plan — #9370 Editing monomers from macromolecules mode in the monomer creation wizard

> Living document: update as findings change the design. Created 2026-10-12, before any spec code.

## 1. Feature summary (what must be tested)

Issue [#9370](https://github.com/epam/ketcher/issues/9370) extends the monomer creation wizard entry points from molecules mode to **macromolecules mode**:

1. In flex/snake/sequence, right-clicking a selection that contains chemical structure (and optionally monomers) shows **"Create monomer"**; clicking it switches to Molecules mode and opens the wizard with the structure loaded. On submit/discard the editor returns to the previous macro sub-mode (flex: the molecule is replaced by the new monomer; snake/sequence: layout re-runs).
2. Right-clicking a single monomer (flex/snake) or a sequence symbol shows **"Edit Monomer"** and **"Edit All [code] (N)"** in their own section above Delete. Composite sequence symbols (one symbol = several monomers) show the options **disabled**. "Edit All" highlights all matching monomers on hover and opens a confirmation dialog before the wizard.
3. Every non-ambiguous library card's three-dot menu gains **"Edit"** and **"Duplicate and Edit"** (in that order, above Delete, separated by a line). "Duplicate and Edit" saves as a *new* library monomer (canvas untouched); "Edit" re-saves the original — changing type and/or code adds a new library entry and replaces all canvas instances; keeping both overwrites the library entry in place. Preset-participating monomers get an entry warning and a submit-time validation error if they would lose preset eligibility.

### Requirements table

| # | Scenario |
|---|----------|
| 1.1 | Right-click a selection of exactly one small molecule (flex, snake) → "Create monomer" visible & enabled; not shown for empty canvas right-click |
| 1.2 | Right-click a continuous selection of 1 monomer + ≥1 more monomer or structure → "Create monomer" visible |
| 1.3 | "Create monomer" sits in its own section (separator lines) above "Delete" |
| 1.4 | Clicking "Create monomer" auto-switches to Molecules mode and opens the wizard with the selected structure loaded |
| 1.5 | Submit or discard → back to Macromolecules mode, previous sub-mode: flex — molecule replaced by new monomer(s); snake/sequence — layout triggered after save |
| 2.0 | Right-click a single monomer (flex/snake) or a sequence symbol → "Edit Monomer" + "Edit All [code] (N)" visible |
| 2.1 | Both in a separate section above "Delete", "Edit Monomer" listed first |
| 2.2 | Sequence symbol representing >1 monomer (e.g. nucleotide preset, "@" for two CHEMs) → options visible but **disabled** |
| 2.3 | "Edit Monomer" opens the wizard with that monomer's structure/properties; saving updates that instance on canvas |
| 2.4 | "Edit All" hover highlights all matching monomers/symbols; click opens confirmation dialog ("You are going to edit N monomers…"); confirm → wizard in "all" mode; saving updates all instances |
| 2.5 | Post-wizard exit follows 1.5 (return to previous sub-mode) |
| 3.0 | Non-ambiguous library card three-dot menu shows "Edit" then "Duplicate and Edit", above "Delete", with a separator; ambiguous cards have no dots button |
| 3.1 | "Duplicate and Edit" → wizard loads the monomer's properties; saving adds a **new** library monomer; original canvas instances unchanged |
| 3.2 | "Edit" → wizard loads the original monomer, all properties unchanged |
| 3.2.2 | Editing a preset-participating monomer (sugar/base/phosphate in a nucleotide preset) shows an entry warning about keeping type + required attachment points; dismissible via OK — *exact text to be verified in spike* |
| 3.2.3 | Changing type or removing a required AP on such a monomer → exactly one submit error, saving prohibited — *to be verified in spike* |
| 3.2.4 | "Edit" save with type and/or code changed → all canvas instances replaced; new library entry added; original remains visible/usable |
| 3.2.5 | "Edit" save with type + code unchanged → canvas instances replaced; library entry overwritten (default version hidden) |
| 3.2.6 | Duplicates/autorecognition section hidden until structure/APs/type modified — **out of scope** unless spike shows it is implemented (depends on the autorecognition ticket) |
| 3.3 | Post-wizard exit follows 1.5 |

Cross-cutting (required by testing.md even though the ticket omits them): undo/redo after a canvas-replacing save (where applicable); "Edit All" cancel path leaves canvas unchanged.

**Explicitly out of scope:** molecules-mode entry points (#8921/#8927 — separate tickets, `MonomerOnMicroOption.*` testids), file-format round-trips of created/edited monomers (covered by the existing `monomer-creation*.spec.ts` suite), wizard field validation (covered by the same suite).

## 2. Verified facts from the codebase (affect test design)

**Which UI is under test.** The served demo (`example/` app, popup URL) mounts the new `ketcher-react` `Editor`, which lazy-loads **`ketcher-macromolecules`** for macro mode. Therefore:

- Macro-canvas right-click menus are react-contexify menus from `packages/ketcher-macromolecules/src/components/contextMenu/`. Item `data-testid` = item `name`:
  - `create_monomer` ("Create monomer"), `edit_monomer` ("Edit Monomer"), `edit_all_monomers` ("Edit All {code} ({count})") — from `useMonomerCreationMenu.ts`; rendered in both `SelectedMonomersContextMenu` (flex/snake) and `SequenceItemContextMenu` (sequence).
  - Library card three-dot menu (`MonomerLibraryContextMenu.tsx`): testids `edit`, `duplicateandedit`, `delete`. "Delete" is **hidden** for non-user-made monomers; Edit/Duplicate are **disabled** when the item is unresolved or has an empty structure. The dots button itself has no `data-testid` — only `aria-label="Actions for <label>"` (class `dots`); right-clicking the card also opens the menu (`onContextMenu`).
- The ketcher-react micro-mode monomer menu (`"Create Monomer-option"` etc., `MonomerOnMicroOption`) is a **different** menu — do not confuse; it is for molecules mode and out of scope here.

**Empirical menu routing in macro mode (Phase 0, verified):** right-click dispatch depends on selection contents:

| Selection | Menu source | Create/Edit entry testids |
|-----------|-------------|---------------------------|
| Atoms only (small molecule) | ketcher-react micro atom menu (`FOR_ATOMS`) | `Create a monomer-option` (`MicroAtomOption.CreateAMonomer`), enabled; no edit options in this menu |
| Monomer(s) + structure, connected | ketcher-react `FOR_MACROMOLECULE` menu | `Create Monomer-option` (`MonomerOnMicroOption.CreateMonomer`), enabled; plus Expand/Remove Grouping/Edit Monomer/Edit All/Delete `-option` items |
| Collapsed monomers only | ketcher-macromolecules macro menu (`SelectedMonomersContextMenu`) | `create_monomer` (≥2 connected monomers — code-verified, first empirical assertion in test 1.2c), `edit_monomer`, `edit_all_monomers`, separator, `delete` |
| Sequence symbol | `SequenceItemContextMenu` (macro) | same macro testids; composite symbols → edit options visible but **disabled** (round 8 confirmed) |

The three menus have different testid schemes — each test must use the enum matching its selection type.

**Menu-state rules** (`monomerCreation.helpers.ts`, verified against source):
- `create_monomer` visible iff the selection is a connected set (atoms + monomers, via bonds/polymer bonds/monomer-to-atom bonds), contains ≥1 atom or ≥2 monomers (a lone single monomer → not creatable), all selected monomers are editable (not ambiguous/unresolved/micromolecule-fragment), and no reaction arrows are selected.
- `edit_monomer` visible whenever a monomer is in the selection. Empirical (Phase 0): enabled for a lone monomer and for selections of identical monomers; **disabled** when atoms are co-selected or on composite sequence symbols (round 8: visible but disabled). Mixed/different-monomer selections → disabled per source.
- `edit_all_monomers` disabled for composite sequence symbols, when atoms are co-selected, or when the selection mixes different/non-editable monomers. Observed titles: "Edit All A (2)" (flex), "Edit All R (1)" (composite sequence symbol) — assert with regex `Edit All <code> \(\d+\)` rather than a hardcoded count (selection-vs-canvas counting semantics not pinned down).
- Sequence mode: `isCompositeSymbol = single selected symbol with >1 monomer` → both edit options disabled (req 2.2 confirmed in code).
- "Edit All" click dispatches a **confirmation dialog** ("Editing monomers" / "You are going to edit N monomers. Are you sure?") before opening the wizard in `all` mode — an extra step the ticket doesn't list; test both confirm and cancel.

**Wizard.** Existing POM `CreateMonomerDialog(page)` (`tests/pages/molecules/canvas/CreateMonomerDialog.ts`) covers window (`monomer-creation-wizard`), type select, code/name inputs, AP controls, aliases, `submit({ignoreWarning})`, `discard()`. Wizard entry modes in source: `create | instance | all | library | duplicate` (dispatched via `openMonomerCreationWizard`).

**Preset-participation validation (3.2.2/3.2.3).** The exact strings from the ticket ("…must be the same monomer type and must have attachment point [union]…", "The changes made to the monomer prevent it from participating in a preset…") are **not found verbatim** in `ketcher-react` wizard sources; only the *delete*-flow warning ("Monomer participates in a preset") exists in `MonomerLibraryContextMenu.utils.ts`. → Treat as unverified; Phase 0 spike probes actual behavior. If not implemented: document actual behavior in-test, flag to team (lesson: ticket assumptions are not facts).

**Existing coverage.** The wizard itself (fields, validation, save, round-trips) is covered by `tests/specs/Chromium-popup/Monomer-creation/monomer-creation*.spec.ts` (~4300 lines) and preset specs. **No E2E exists** for macro-mode entry points, Edit Monomer/Edit All from canvas, or library Edit/Duplicate-and-Edit (`MonomerOnMicroOption.EditMonomer/.EditAll` constants exist but are unused; `LibraryPresetOption.Edit/DuplicateAndEdit` are used only by legacy RNA-builder specs). This plan is net-new.

**Reusable infrastructure (do not duplicate):**
- `ContextMenu(page, element: Locator | {x,y})` (`tests/pages/common/ContextMenu.ts`) — `open/click/hover/isOptionVisible/isOptionEnabled/getOptionLocator`.
- Monomer constants catalogs `Peptide/Sugar/Base/Chem/Preset` (`tests/pages/constants/monomers/`) with `{alias, testId}`.
- `getMonomerLocator(page, …)` (flex/snake), `getSymbolLocator(page, …)` (sequence) in `tests/utils/macromolecules/`.
- `Library(page)` POM: `getMonomerLibraryCardLocator(monomer)`, `dragMonomerOnCanvas`, tabs.
- Mode switching: `CommonTopRightToolbar(page).turnOnMacromoleculesEditor()/turnOnMicromoleculesEditor()`, `MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex|Snake|Sequence)`.
- File opening: `openFileAndAddToCanvasAsNewProjectMacro(page, filename)` etc.
- Dialog POMs: `ConfirmMessageDialog(page)`, `WarningMessageDialog(page)` under `tests/pages/molecules/canvas/createMonomer/`.

**What is NOT assertable as-is (leads to §4):** the Edit-All hover highlight has no obvious stable attribute (`turnOnHover`/`redrawHover` are renderer-internal); sequence-mode "layout triggered" has no direct flag — assert via symbol positions/bounding boxes.

## 3. Where the tests live

Project: `ketcher-autotests`, **chromium-popup** only. Folder: `tests/specs/Chromium-popup/Monomer-creation/` (co-located with the existing wizard suite).

| File | Requirements | Mode(s) |
|------|--------------|---------|
| `create-monomer-from-macro-selection.spec.ts` | 1.1–1.5 | Flex, Snake (+ Sequence if spike shows structures are placeable there) |
| `edit-monomer-from-macro-canvas.spec.ts` | 2.0–2.5 | Flex, Snake, Sequence |
| `edit-library-monomer.spec.ts` | 3.0–3.3 | Macro (library panel; canvas assertions in flex) |

## 4. Test infrastructure changes

1. **New constants** in `tests/pages/constants/contextMenu/Constants.ts`:
   ```ts
   export enum MacroMonomerOption {
     CreateMonomer = 'create_monomer',
     EditMonomer = 'edit_monomer',
     EditAllMonomers = 'edit_all_monomers',
   }
   ```
   added to the `ContextMenuOption` union. (Reuse existing `LibraryPresetOption.Edit/DuplicateAndEdit` for the card menu despite the "Preset" name — renaming is a wider refactor; note in code comment.)
2. **Hover-highlight assertion helper** (req 2.4) — shape fixed by Phase 0 (S7): hovering `edit_all_monomers` adds exactly one child node to each matching `g.monomer` and sets `style=cursor: move;`. Helper: capture `childElementCount` + `style` of every monomer element before/after hover; assert +1 and the cursor style on matches, unchanged on non-matches. No screenshot fallback needed.
3. **No source changes planned.** If the spike finds a state that is genuinely unassertable (e.g. "library entry overwritten / default version hidden"), prefer asserting via observable UI (card count in library, canvas instance code) over adding testids.

## 5. Test cases

Conventions: shared-page pattern (Pattern A) with `initFlexCanvas`/`initSnakeCanvas`/`initSequenceCanvas`, one `describe` per layout mode; switch to Pattern B if state leakage appears. Standard comment block with issue number per test. Named coordinate constants. Assertion mechanisms named in the table.

### 5.1 `create-monomer-from-macro-selection.spec.ts` (R1) — IMPLEMENTED, 12/12 passing (2026-10-13)

**Implementation deviations from the original design (empirically re-verified while writing the spec):**
- In macro mode **all** canvas right-clicks open ketcher-macromolecules menus — atom selections included. The create entry is `create_monomer` in the selected-entities menu (`MacroMonomerOption.CreateMonomer`) for every selection type; the micro-menu testids from Phase 0 were not used.
- A small molecule **bonded to a polymer** auto-groups into a CHEM fragment monomer ("F1") on file-open in flex; fragments are non-editable, so monomer+fragment selections do NOT offer create (documented in test 1.2a as actual behavior).
- `benzene-ring-with-atoms.ket` is actually a six-membered **heterocycle** ring (N/S/O/Cl/P/F), chemically over-bonded — none of its atoms can be marked as attachment points (no implicit H, all have 2 neighbors). Submit tests therefore use `chain-with-singleup-bond.ket` (pentane; terminal carbons qualify).
- A new monomer needs ≥1 AP: the submit tests mark a chain atom as connection point **inside the wizard** (right-click → "Mark as connection point"). The wizard canvas keeps the macro-mode layer in the DOM with zero-size atom elements — atom locators must use `.filter({ visible: true })`.
- Closing a macro context menu clears the selection; a right-click alone does not re-select, so tests that open the menu twice (visibility check + click) must re-select (`Ctrl+A`) in between.

| Test | Steps | Assert |
|------|-------|--------|
| 1.1a Flex: single small molecule → create option visible & enabled | Open heterocycle-ring fixture, Ctrl+A, right-click an atom | `create_monomer` visible & enabled |
| 1.1b Flex: empty canvas right-click → no create option | Right-click empty area | No `create_monomer` in DOM |
| 1.1c Flex: lone monomer → no create, edit options shown | Drag one peptide, right-click it | `create_monomer` absent; `edit_monomer` visible |
| 1.2a Flex: monomer + bonded structure → no create (fragment) | Open mixed fixture, select-all, right-click | `create_monomer` absent; `edit_monomer` present (actual behavior — fragment F1 not editable) |
| 1.2b Flex: two disconnected monomers → hidden | Drag A and C apart, rubber-band both, right-click | `create_monomer` absent |
| 1.2c Flex: two bonded monomers → visible & enabled | Bond A–C on canvas, select both, right-click | `create_monomer` visible & enabled |
| 1.3 Menu section layout | Open the small-molecule menu | Create item above Delete; ≥1 `.contexify_separator` in the menu |
| 1.4a Flex: click → wizard opens with structure loaded | Select all, click `create_monomer` | Wizard visible; atom count ≥ 6 (explicit Hs added on mode switch) |
| 1.4b Snake: same flow | Switch to snake, select-all (re-select after visibility check), click | Same assertions |
| 1.5a Flex: submit → molecule replaced by new monomer | Chain fixture; mark AP in wizard; set CHEM/ZZ/name; submit | Back in flex; monomer "ZZ" count 1; atom count 0 |
| 1.5b Flex: discard → structure intact | Open via menu, discard | Flex restored; atom count unchanged; no new monomer |
| 1.5c Snake: submit → back in snake with new monomer | Chain fixture in snake; mark AP; submit | Back in snake; "ZZ" visible; atom count 0 |

### 5.2 `edit-monomer-from-macro-canvas.spec.ts` (R2) — IMPLEMENTED, 11/11 passing (2026-10-13)

**Implementation deviations from the original design (probed while writing the spec):**
- "Edit Monomer" opens the wizard directly (no dialog); the code field is pre-filled **`<code>_Copy`** (not the original code), type pre-filled from the monomer. Saving with a new code replaces exactly that instance; saving without changing the code renames it to `_Copy`.
- Edit save is **NOT an undo entry** (Ctrl+Z leaves the canvas unchanged — Q4 resolved, cross-test dropped and documented in the spec header).
- "Edit All" confirmation dialog is the ketcher-macromolecules `ConfirmationDialog` (testids `confirmation-dialog`/`confirmation-text`/`yes-button`/`cancel-button`) — POM `ConfirmYourActionDialog`, not the ketcher-react `ConfirmMessageDialog`. Text: "You are going to edit N monomers. Are you sure?".
- Sequence tests run in a second describe with `initSequenceCanvas` (separate page; `@fixtures` merges all canvas fixtures). Right-clicking a sequence symbol yields its menu without any prior selection.
- One worker page per describe; mode switches happen on an empty canvas only (safe path).

| Test | Steps | Assert |
|------|-------|--------|
| 2.0a Flex: single monomer → edit options visible & enabled | Drag two As, right-click one | `edit_monomer` + `edit_all_monomers` visible & enabled; title `/^Edit All A \(\d+\)$/` |
| 2.1 Section above Delete, Edit Monomer first | Drag one A, right-click | y-order edit < editAll < delete; a `.contexify_separator` between editAll and delete |
| 2.0c Sequence: composite symbol shows edit options | Open sequence fixture, right-click "A" symbol | Both options visible |
| 2.2a Composite symbol options disabled | Same | Both `isOptionEnabled` false; title `/^Edit All R \(\d+\)$/` (menu reopened after the enabled checks close it) |
| 2.3a Edit Monomer opens wizard with properties | Click `edit_monomer` | Wizard visible; code = "A_Copy"; type matches /Amino acid/ |
| 2.3b Save updates only that instance | Set code ZZ, submit | Back in flex; ZZ count 1; remaining A count 1 |
| 2.4a Edit All hover highlights matches only | Drag A, C, A; hover `edit_all_monomers` | Helper: each A +1 child & `cursor: move`; C unchanged |
| 2.4b Edit All confirm flow | Click `edit_all_monomers` | Dialog "You are going to edit 2 monomers. Are you sure?"; yes → wizard opens |
| 2.4c Edit All cancel leaves canvas unchanged | Cancel the dialog | Wizard closed; both As at their original bboxes |
| 2.4d Edit All save updates all instances | Confirm, set code ZZ, submit | Both instances ZZ; A count 0 |
| 2.5 Discard in snake returns to snake | Open edit in snake, discard | Snake mode back; monomers at original positions |

### 5.3 `edit-library-monomer.spec.ts` (R3) — IMPLEMENTED, 10/10 passing (2026-10-13)

**Implementation deviations from the original design (probed while writing the spec):**
- The card menu contains exactly `edit` then `duplicateandedit` — **no separator line**, and `delete` is hidden for default (non-user-made) monomers (absent from the DOM).
- The menu eases into its final position after opening (~0.3px/frame decay), which perpetually fails Playwright's stability check; regular clicks time out at 60s. Items are clicked via `dispatchEvent('click')` instead.
- "Duplicate and Edit" pre-fills code/name with a `_Copy` suffix (`A_Copy`/`Alanine_Copy`); "Edit" pre-fills the originals (`A`/`Alanine`). Card testid format: `${code}___${name}`.
- **3.2.4 gap (probed):** saving "Edit" with only the code changed is a **silent no-op** — the wizard closes as if saved, but no new library entry appears, the original entry is untouched and canvas instances keep their code. (Contrast: changing the *type* does create a new entry — see 3.2.3.) The test documents actual behavior.
- Preset-participation entry warning (3.2.2) and submit-time preset validation (3.2.3) are **not implemented** — documented as gaps in the tests.

Setup: no canvas needed for menu tests; drag monomers from library onto flex canvas for replacement assertions. Peptide `Peptide.A`/`Peptide.C` and preset sugar `Sugar.R` (Ribose).

| Test | Steps | Assert |
|------|-------|--------|
| 3.0a Card menu options & order | Right-click a non-ambiguous card (or click dots) | Menu shows `edit` then `duplicateandedit`, separator, then `delete`; all enabled for a default monomer (delete hidden? — verify: default monomers are not user-made → delete **hidden**; assert accordingly) |
| 3.0b Ambiguous card has no menu | Find an ambiguous card in library | No `.dots` button inside the card locator |
| 3.1a Duplicate and Edit loads properties | Click `duplicateandedit` on a peptide | Wizard visible; code/name/type pre-filled from the card values |
| 3.1b Duplicate save → new library entry, canvas untouched | Change code, submit | Library shows both old and new cards (card locator counts); canvas instances still show old code (monomer locator count by alias) |
| 3.2a Edit loads original properties unchanged | Click `edit` on a peptide | Wizard fields equal card values (code, name, type) |
| 3.2.2 (gap) Preset-participating entry warning — **not implemented** | Open `edit` on `Sugar.Ribose` (RNA tab) | No warning dialog; wizard opens directly with Sugar type pre-filled (Phase 0 verified). Test asserts the *actual* behavior and documents the gap vs ticket |
| 3.2.3 (gap) Preset validation on submit — **not implemented** | In that wizard change type to Amino acid + code ZZ, dismiss non-typical-AP warning (OK), submit | Save **succeeds**: new "ZZ" card appears in the Peptides tab, original Ribose retained (Phase 0 verified). Generic wizard validation still applies (e.g. "The code must be unique amongst peptide, RNA, or CHEM monomers."). Test documents the gap; flag to team |
| 3.2.4 (gap) Edit save with code changed → **silent no-op** | Place A on canvas, edit library A → new code ZE, submit | Wizard closes; `ZE___Alanine` card count 0; original A card intact; canvas monomer still "A" (new-code count 0) — documents the gap vs ticket |
| 3.2.5 Edit save unchanged type+code → overwrite | Edit library A (same code), change name only, submit | Canvas instances replaced (name/props updated); library card count for that code unchanged; default version "hidden" — assert via observable UI (card shows edited values / no duplicate card) |
| 3.3 Post-exit mode behavior | Start edit from macro mode with canvas content, submit/discard | Returns to previous macro sub-mode (toolbar/canvasmode assertions) |

## 6. Verification strategy

Ranked by reliability:

1. **Structural assertions (primary):** context-menu option visibility/enabled state via `ContextMenu` POM; wizard field values via `CreateMonomerDialog` locators; monomer presence/counts by alias/testid (`getMonomerLocator`, `getSymbolLocator`); library card counts by testid; dialog text exact-match.
2. **Bounding-box deltas** for "positions unchanged / layout re-triggered / molecule replaced in place" claims (deterministic, snapshot-free).
3. **Dialogs:** visibility + exact text + both button outcomes (Edit All confirmation, preset warning, submit errors).
4. **Screenshots last:** only if the spike finds a visual state with no structural form (hover highlight fallback). No Docker snapshot generation planned for pure-structural suites — revisit if screenshots become necessary.

## 7. Test data

**Phase 0 outcome: no new fixture files needed** — every scenario maps to existing files or in-canvas construction:

| Test data | Content / behavior (verified) | Used by |
|-----------|-------------------------------|---------|
| `KET/Chromium-popup/monomer-and-micro-structure.ket` | Opens in flex; small molecule usable for atom selection (the alanine renders expanded, 0 `g.monomer`) | 5.1 (1.1) |
| `KET/Micro structures connected to polymer chains are not shown on Sequence mode canvas.ket` | Alanine sgroup bonded to a 6-atom molecule; opens in flex; select-all → FOR_MACROMOLECULE menu | 5.1 (1.2/1.3/1.4/1.5) |
| In-canvas construction: drag `Peptide.A` + `Peptide.C`, `bondTwoMonomers` | Verified working in flex (Phase 0) | 5.1 (1.2b/1.2c), 5.2 (flex/snake setup) |
| `KET/Chromium-popup/Bugs/ketcher-3.9.0-bugs/micro-and-macro-structures.ket` + `initSequenceCanvas` fixture | Opens with sequence symbols (composite nucleotide "A") **only when the page is already in macro mode**; switching from flex with micro structures present hangs — do not use that path | 5.2 (sequence tests) |
| Library drag (`Peptide.A`, `Sugar.R`) | Verified working; right-click yields macro menu | 5.2, 5.3 canvas-instance assertions |

Do **not** use for sequence probes: `KET/dna-AAAAAA-sequence-expected.ket`, `KET/rna-sequence-without-small-molecules.ket` (do not reliably switch to sequence layout from flex).

## 8. Implementation order

### Phase 0 — Spike results (2026-10-12, rounds 1–8; COMPLETE — spike spec deleted after absorption)

**Menu routing in flex mode (empirical):** right-click dispatch depends on what is selected:
- **Atoms only** (small molecule) → ketcher-react micro atom menu (`FOR_ATOMS`): item **`Create a monomer-option`** ("Create a monomer"), enabled. This is the req 1.1 entry point.
- **Monomer(s) + structure** (connected selection) → ketcher-react `FOR_MACROMOLECULE` menu: "Expand monomer-option", "Remove Grouping-option", **`Create Monomer-option`** (enabled), `Edit Monomer-option`, `Edit All-option` ("Edit All A (1)"), `Delete Monomer-option`. This is the req 1.2 entry point.
- **Collapsed monomers only** → ketcher-macromolecules macro menu (`SelectedMonomersContextMenu`): copy/paste/modify_amino_acids/layout_circular/edit_attachment_points, then **`edit_monomer`**, **`edit_all_monomers`** ("Edit All A (N)"), separator, `delete`. For ≥2 connected monomers (no structure) the same menu should also show **`create_monomer`** per `canCreateMonomer` (code-verified; not yet empirically probed — first assertion lands in test 1.2c).
- The macro-menu testids (`create_monomer`/`edit_monomer`/`edit_all_monomers`) and the micro-menu testids (`…-option`) are **different menus**; tests must use the right enum per selection type. `MacroMonomerOption` (new) + existing `MicroAtomOption.CreateAMonomer` + `MonomerOnMicroOption.CreateMonomer` all come into play.

**R2 (flex):** lone monomer → macro menu with `edit_monomer` enabled, `edit_all_monomers` "Edit All A (1)" enabled, above `delete`. Edit-All hover adds a child node and `style=cursor: move;` to each matching `g.monomer` — structural assertion possible (child-count delta on the monomer element).

**R3:** library card three-dot menu → `edit` + `duplicateandedit` visible & enabled; **`delete` hidden for default (non-user-made) monomers**. "Edit" on Ribose (sugar of nucleotide presets) opens the wizard directly — **no preset-participation entry warning** (req 3.2.2). Source check: `getReferencingPresets` is only used by the delete flow; no preset validation exists in the wizard save path → req 3.2.3 expected unimplemented too (*confirm with round-3 P4 probe: after dismissing the non-typical-AP warning, does submit succeed or error?*).

**Fixtures (verified):**
- `KET/Chromium-popup/Bugs/ketcher-3.9.0-bugs/micro-and-macro-structures.ket` — opens **directly in sequence mode**; contains a composite nucleotide symbol "A" (Adenine+Ribose+Phosphate) + micro structure. Use for req 2.2.
- `KET/Micro structures connected to polymer chains are not shown on Sequence mode canvas.ket` — Alanine monomer bonded to a 6-atom molecule; opens in flex; the monomer renders as an sgroup (0 `g.monomer` elements) → FOR_MACROMOLECULE menu on select-all. Use for req 1.2.
- `KET/Chromium-popup/monomer-and-micro-structure.ket` — Alanine also renders expanded here (0 monomer elements); only the small molecule is usable → req 1.1 atom-only case.
- `KET/dna-AAAAAA-sequence-expected.ket` and `KET/rna-sequence-without-small-molecules.ket` do **not** reliably switch to sequence layout from flex — do not use for sequence probes.
- Dragging monomers from the library in flex works; right-clicking them yields the macro menu (used as the canonical R2 setup).

**Rounds 4–8 (complete):**
- **P5 (wizard entry, req 1.4/1.5b):** clicking `Create Monomer-option` from a mixed selection opens the wizard with the structure loaded; discard returns to macro mode with the atom count restored. `data-canvasmode` stays `macromolecules-mode` while the wizard is open → assert mode via wizard visibility + atom counts, not the canvasmode attribute.
- **P4 (preset validation, 3.2.3):** editing Ribose, changing type to Amino acid (code ZZ + analogue), dismissing the non-typical-AP warning (OK) → **submit succeeds**; a new "ZZ" card appears in the Peptides tab and the original Ribose entry is retained. No preset-participation error exists (consistent with source: `getReferencingPresets` is delete-flow only). Generic validation errors do fire (code uniqueness, mandatory fields).
- **S7 (Edit All hover, req 2.4):** hovering `edit_all_monomers` adds one child node to each matching `g.monomer` and sets `style=cursor: move;` (childCount 4→5 observed) — structural assertion viable. Also observed: two identical As selected → both edit options enabled, title "Edit All A (2)".
- **Round 8 (sequence composite, req 2.2):** with the page already in macro mode (`initSequenceCanvas`), `micro-and-macro-structures.ket` opens with sequence symbols (3 total). Right-clicking the composite "A" symbol → `edit_monomer` visible=true **enabled=false**, `edit_all_monomers` "Edit All R (1)" visible=true **enabled=false**, `delete` disabled; copy/paste disabled, `edit_sequence` enabled. Req 2.2 confirmed.
- **Sequence-mode access pattern (reusable):** sequence layout is only reached reliably when the page is already in macro mode via a canvas fixture (`initSequenceCanvas`) before `openFileAndAddToCanvasAsNewProjectMacro`; switching from flex with micro structures present hangs.

**Phase 0 status: COMPLETE.** All requirement behaviors empirically verified; spike spec deleted after this update. No new fixtures needed — all test data is existing files or in-canvas construction (§7).

### Phases

1. **Phase 0 — Spike** (throwaway spec, deleted afterwards): in flex mode select benzene from a fixture → right-click → dump menu DOM (confirm `create_monomer` testid + separator structure); click it → confirm mode switch + wizard; open `edit` on a preset-participating library monomer → capture any warning dialog text/testid; change type → capture submit error; hover `edit_all_monomers` → inspect DOM diff for highlight representation; right-click a composite sequence symbol → confirm disabled state. **Record findings in §10 and fix the plan.** Run locally, fix before moving on.
2. **Phase 1 — Infrastructure:** `MacroMonomerOption` constants + union; hover-highlight helper (shape from spike). Run a trivial probe spec to sanity-check constants.
3. **Phase 2 — Fixtures:** create/verify the three fixtures (§7); verify they open in macro mode without errors.
4. **Phase 3 — `create-monomer-from-macro-selection.spec.ts`** (R1). **DONE 2026-10-13: 12/12 passing.** Deviations recorded in §5.1.
5. **Phase 4 — `edit-monomer-from-macro-canvas.spec.ts`** (R2). **DONE 2026-10-13: 11/11 passing.** Deviations recorded in §5.2; Q4 resolved (edit save is not an undo entry).
6. **Phase 5 — `edit-library-monomer.spec.ts`** (R3). **DONE 2026-10-13: 10/10 passing.** Deviations recorded in §5.3; gaps documented in tests: 3.2.2 no entry warning, 3.2.3 no preset validation on submit, 3.2.4 code-only change is a silent no-op (no new entry, canvas untouched), card menu has no separator.
7. **Docker snapshot phase — SKIPPED** (structural suite; no screenshot assertions were needed — stated explicitly per plan).

**All phases complete: 33/33 tests passing across the three specs (2026-10-13).**

## 9. Rules & constraints to respect

- New specs in **chromium-popup** project only; import `test`/`expect`/`Page` from `@fixtures`; POMs for all reusable UI; no raw `page.locator` for stable testids.
- No `waitForTimeout` as a wait mechanism (the 100 ms settle inside `ContextMenu.click` is existing infrastructure, not something to add).
- One behavior per test; comment block with issue number (#9370 + requirement number); named coordinate constants; no `as any`.
- Monomer enum catalogs (`Peptide.*`, `Sugar.*`, …) instead of hardcoded strings.
- Shared-page pattern by default (state-isolation caveat: canvas fixtures don't fully reset undo history — loop-to-disabled if asserting stack boundaries).
- Memory bank updated **only at archive time** (per CLAUDE.md opsx rules); reusable E2E lessons added to `.memory-bank/testing/` as they surface.
- Never commit autonomously — ask before `git commit`.

## 10. Open questions / risks

| # | Question | Resolution (all resolved) |
|---|----------|-----------------------------------------------|
| Q1 | Does sequence mode allow free micro-structures (req 1.1 "in any of the three modes")? | **No** — sequence fixtures contain only symbols; req 1.1/1.4 scoped to flex/snake, documented in §5.1 |
| Q2 | Preset-participation entry warning (3.2.2) / submit error (3.2.3)? | **Not implemented** — no entry warning on Edit; changing type saves as a *new* library entry (Ribose→ZZ case). Tests document actual behavior (§5.3); flag to team |
| Q3 | How does the Edit-All hover highlight surface in the DOM? | Child-count delta (+1) on each matching `g.monomer` + `style=cursor: move;` — structural helper per §4.2, no screenshots needed |
| Q4 | Is "Edit save replaces canvas instances" an undo entry? | **No** (Phase 4 probe, 2026-10-13) — Ctrl+Z after an edit save leaves the canvas unchanged; cross-test dropped and documented in the spec header |
| Q5 | Which default-library monomers are preset-participating for 3.2.x? | `Sugar.Ribose` (RNA tab) confirmed to participate in nucleotide presets — used to establish the gap; no longer needed for positive coverage since validation is absent |
| Q6 | Edit options disabled when atoms co-selected — intended per ticket? | Code-verified (`monomerCreation.helpers.ts`); assert actual behavior in 5.1/5.2 and note the ticket discrepancy |
| Q7 | "Library entry overwritten / default version hidden" (3.2.5) — observable difference? | Card count by testid unchanged + card shows edited values, no duplicate card — assert via library DOM only |
| Q8 | Why is an "Edit" save with a changed code a silent no-op (3.2.4)? | Probed 2026-10-13: wizard closes, but no new entry, original untouched, canvas unchanged (before/after card dumps identical). Changing the *type* does create a new entry (Q2/P4) — likely the code-only path hits an update branch that fails silently. **Flag to team as probable bug** |
