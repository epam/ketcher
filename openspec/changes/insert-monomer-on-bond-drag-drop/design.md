## Context

`LibraryItemDragDropHandler` (ketcher-core) handles library drags in Flex and Snake modes. On every drag-state event it checks, in priority order, replacement-target proximity then attachment-point proximity; on drop it either replaces (`DrawingEntitiesManager.replaceMonomer`), establishes a bond (`handleMonomerConnection`, using `bondConnectionHelpers.ts` default-bond resolution, opening *Select Attachment Points* when none resolves), or places the item freely. Transient hover visuals follow the pattern described in `.memory-bank/modules/transient-views.md`; layout rules are in `.memory-bank/modules/snake-layout.md`.

Insertion is a third drop outcome. Everything it needs exists in pieces: default-bond resolution, preset component placement, monomer/bond add and delete operations, snake layout, and the chain-shift logic written for preset-on-monomer replacement (#7455).

## Goals / Non-Goals

**Goals:** bond-proximity indicator; atomic insert (one undo step); default-bond AP resolution matching sequence-mode replacement; error modals; Flex geometry rules 7.2–7.6.1; replacement bond-extension (req. 8); redesigned AP dialogs.

**Non-Goals:** bond establishment (#7926); adding a whole preset to the middle section of the AP dialog (waits on the Indigo layout work); Sequence mode (drag is disabled there); the exact pixel thresholds (TBD with UX — named constants only).

## Decisions

### Decision 1 — Check order: replacement > AP > bond

A bond lies between two monomers, so the cursor is often near monomers too. Replacement and AP highlights keep priority; the bond indicator is shown only when neither is active. This keeps the three highlights mutually exclusive, consistent with the existing guarantee.

**Alternative:** bond first — rejected, it would make dropping near a monomer at the end of a bond ambiguous and change shipped behaviour.

### Decision 2 — One resolver for default APs, shared with sequence-mode replacement

AP choice for the new monomer reuses the default-bond table in `bondConnectionHelpers.ts` (plus the R1–R2 fallback the ticket asks for). The resolver takes the two original monomers with their existing APs and returns the new monomer's pair of APs, or a failure reason (`no-default-preset` / `no-default-single-ap` / `no-default-multi-ap`) that selects the modal or dialog.

**Alternative:** a separate insertion-only table — rejected: the ticket asks for consistency with #4878 and two tables would drift.

### Decision 3 — Insertion is a single command in `DrawingEntitiesManager`

`insertMonomerOnBond` builds one `Command`: delete the original bond, add monomer(s), add two bonds, apply positional shifts. The handler pushes it to history once, so undo/redo is atomic. Dialog-driven insertion (after **Connect**) builds the same command with user-chosen APs.

### Decision 4 — Geometry as pure functions

Bond extension (3 Å minimum; variable `2C` for phosphate presets) and the shift set (right/bottom part of the chain; for circular structures all monomers past the line perpendicular to the bond) are pure functions in the replacement/repositioning helpers, unit-testable without a canvas. Req. 8 reuses the `2C` function from the replacement path.

For the phosphate preset: B = 0.75 Å (component offset from midpoint along bond axis), A = 1.5 Å (external bond from original monomer to preset component). Both components sit ON the bond axis, shifted ±B from the midpoint. The external bond is therefore `extendedLength/2 − B`; for it to equal A the required extended bond is `2*(A+B) = 4.5 Å`, a constant independent of the bond angle. The bond is extended to 4.5 Å only when its current length is smaller. (The earlier angle-dependent triangle formula was correct only for horizontal bonds; at other angles it produced shorter external bonds.)

The base is placed at `SnakeLayoutCellWidth / macroModeScale` model-units from the sugar in the direction perpendicular to the bond (90° CCW rotation of the bond direction vector). For a horizontal bond this places the base directly below the sugar, matching the snake-layout convention. For non-horizontal bonds the base is perpendicular to the sugar–phosphate axis.

### Decision 5 — Circular-structure detection via cycle membership of the bond

A bond is "in a circular structure" if removing it leaves its endpoints connected. This is evaluated on the polymer-bond graph before the bond is removed.

### Decision 6 — Indicator as a transient view

The circle is a transient SVG element attached to the bond renderer, with two sizes (near / nearer). It is cleared on drag end, cancel (right-click), and when the cursor leaves the threshold. Sizes and thresholds are constants.

### Decision 7 — Error modals reuse the existing modal infrastructure

Two Close-only modals with strings in `macromoleculesDialogs.json`. The AP dialog redesign is scoped to presentation (orange LGA outline, drop-down) and keeps the existing data flow.

## Risks / Trade-offs

- **Thresholds TBD** → constants with provisional values; flagged in the spec as to-be-agreed.
- **Preset flipping on antisense chains** → reuse replacement's flip logic; add tests for both bond orientations (R1–R2 and R2–R1 in 7.6.1).
- **Large shifts in Flex** may move monomers off-screen → out of scope, same as the replacement limitation.
- **Dialog redesign touches two existing dialogs** → keep the change presentational and cover with snapshot/unit tests plus E2E.
