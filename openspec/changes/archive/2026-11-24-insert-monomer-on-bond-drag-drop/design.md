## Context

`LibraryItemDragDropHandler` (ketcher-core) handles library drags in Flex and Snake modes. On every drag-state event it checks, in priority order, replacement-target proximity then attachment-point proximity; on drop it either replaces (`DrawingEntitiesManager.replaceMonomer`), establishes a bond (`handleMonomerConnection`, using `bondConnectionHelpers.ts` default-bond resolution, opening *Select Attachment Points* when none resolves), or places the item freely. Transient hover visuals follow the pattern described in `.memory-bank/modules/transient-views.md`; layout rules are in `.memory-bank/modules/snake-layout.md`.

Insertion is a third drop outcome. Everything it needs exists in pieces: default-bond resolution, preset component placement, monomer/bond add and delete operations, snake layout, and the chain-shift logic written for preset-on-monomer replacement (#7455).

## Goals / Non-Goals

**Goals:** bond-proximity indicator; atomic insert (one undo step); default-bond AP resolution matching sequence-mode replacement; error modals; Flex geometry rules 7.2–7.6.1; replacement bond-extension (req. 8); redesigned AP dialogs.

**Non-Goals:** bond establishment (#7926); adding a whole preset to the middle section of the AP dialog (waits on the Indigo layout work); Sequence mode (drag is disabled there); the exact pixel thresholds (TBD with UX — named constants only).

## Decisions

### Decision 1 — Check order: replacement first, then AP vs. bond by distance

A bond lies between two monomers, so the cursor is often near monomers too. Replacement keeps absolute priority — while a replacement target is active, neither the AP highlight nor the bond indicator shows. Below that, the AP highlight and the bond indicator are not a strict priority pair: both proximity checks run, and whichever target is geometrically closer to the cursor wins, suppressing the other. This keeps all highlights mutually exclusive without making the bond indicator unreachable whenever an AP happens to be nearby (true on dense or circular chains), at the cost of the indicator sometimes yielding to a farther-but-still-in-range AP highlight and vice versa.

**Alternative (originally decided, not what shipped):** a strict replacement > AP > bond priority order, where any active AP highlight unconditionally suppresses the bond indicator — rejected during implementation because on circular or dense chains it made the indicator effectively unreachable near chain ends; the distance race was adopted instead. (`LibraryItemDragDropHandler.onLibraryItemDragOver`, replacement check then AP/bond distance race.)

### Decision 2 — Independent default-AP resolver (not shared with sequence-mode replacement)

AP choice for the new monomer is resolved by `resolveMonomerInsertion`/`resolvePresetInsertion` in `insertionHelpers.ts`: a sugar bonds to a base through R3 (sugar)–R1 (base); otherwise the new monomer's AP is the complement of the original AP (R1↔R2). This is a new, insertion-only implementation — it does not call into `bondConnectionHelpers.ts` (which only decides whether to show the bond-establishment modal and which preset component to bond, not a default-AP table) or into `SequenceMode.ts`'s own inline R1/R2 handling for sequence-mode replacement (#4878).

**Originally decided:** one resolver shared with sequence-mode replacement, specifically to avoid two tables drifting apart. **What shipped instead:** a third, independent place encoding the same R1–R2-complement idea. The risk the original decision called out is real today — `bondConnectionHelpers.ts`, `SequenceMode.ts`, and `insertionHelpers.ts` each encode default-AP logic separately — but is accepted for now rather than refactored as part of this change; unifying them is follow-up work, not a blocker for this feature.

### Decision 3 — Insertion command building lives in the handler, not `DrawingEntitiesManager`

**Originally decided:** a `DrawingEntitiesManager.insertMonomerOnBond` method, mirroring how `replaceMonomer` owns replacement there. **What shipped instead:** `LibraryItemDragDropHandler.executeInsertion` (and its `finishInsertion` helper) builds the single `Command` — delete the original bond, add monomer(s), add two bonds, apply positional shifts — using the pure functions in `insertion.ts`/`insertionHelpers.ts`, and pushes it to history once so undo/redo is atomic. Dialog-driven insertion (after **Connect**) builds the same command with user-chosen APs. This is accepted as the shipped location rather than refactored into `DrawingEntitiesManager`: it keeps the orchestration next to the other drag-state handling (replacement, AP hover) it has to coordinate with, at the cost of being less consistent with `replaceMonomer`'s placement.

### Decision 4 — Geometry as pure functions

Bond extension (3 Å minimum; variable `2C` for phosphate presets) and the shift set (right/bottom part of the chain; for circular structures all monomers past the line perpendicular to the bond) are pure functions in the replacement/repositioning helpers, unit-testable without a canvas. Req. 8 reuses the `2C` function from the replacement path.

For the phosphate preset: B = 0.75 Å (component offset from midpoint along bond axis), A = 1.5 Å (external bond from original monomer to preset component). Both components sit ON the bond axis, shifted ±B from the midpoint. The external bond is therefore `extendedLength/2 − B`; for it to equal A the required extended bond is `2*(A+B) = 4.5 Å`, a constant independent of the bond angle. The bond is extended to 4.5 Å only when its current length is smaller. (The earlier angle-dependent triangle formula was correct only for horizontal bonds; at other angles it produced shorter external bonds.)

The base is placed at `SnakeLayoutCellWidth / macroModeScale` model-units from the sugar in the direction perpendicular to the bond (90° CCW rotation of the bond direction vector). For a horizontal bond this places the base directly below the sugar, matching the snake-layout convention. For non-horizontal bonds the base is perpendicular to the sugar–phosphate axis.

### Decision 5 — Circular-structure detection via cycle membership of the bond

A bond is "in a circular structure" if removing it leaves its endpoints connected. This is evaluated on the polymer-bond graph before the bond is removed.

### Decision 6 — Indicator as a transient view

The circle is a transient SVG element attached to the bond renderer, with two sizes (near / nearer). It is cleared on drag end, cancel (right-click), and when the cursor leaves the threshold. Sizes and thresholds are constants.

### Decision 7 — Error modals reuse the existing modal infrastructure

Two Close-only modals via the existing `openErrorModal` infrastructure. **Originally decided:** their strings would live in `macromoleculesDialogs.json`, like the rest of this dialog layer. **What shipped instead:** `INSERT_PRESET_ERROR_MESSAGE` / `INSERT_SINGLE_AP_ERROR_MESSAGE` are hardcoded English constants in `LibraryItemDragDropHandler.ts` (`ketcher-core`), bypassing i18n — accepted for now, pending product sign-off on whether that's an intentional exception. The new `InsertionConnection` dialog is its own component with its own `UsageInMacromolecule` value, styled to match the existing `MonomerConnections` (*Select Attachment Points* / *Edit Attachment Points*) dialog's filled-blue-pill presentation; the separate enum value keeps the two dialogs' styling independently editable without the other one, but today they render identically.

## Risks / Trade-offs

- **Thresholds TBD** → constants with provisional values; flagged in the spec as to-be-agreed.
- **Preset flipping on antisense chains** → reuse replacement's flip logic; add tests for both bond orientations (R1–R2 and R2–R1 in 7.6.1).
- **Large shifts in Flex** may move monomers off-screen → out of scope, same as the replacement limitation.
- **Dialog redesign touches two existing dialogs** → keep the change presentational and cover with snapshot/unit tests plus E2E.
