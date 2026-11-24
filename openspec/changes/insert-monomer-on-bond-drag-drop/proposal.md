## Why

Dragging a library monomer or preset onto the canvas can already establish a bond at a free attachment point (#6404) and replace an existing monomer (#7455). There is still no way to put a new monomer *into* an existing chain: the user must delete the bond, place the monomer, and re-create two bonds by hand, and in Flex mode must also move the rest of the chain to make room. Issue #7925 extends drag-and-drop so that dropping onto a bond inserts the item between the two bonded monomers, using the same default-bond rules as sequence-mode replacement (#4878).

## What Changes

**Insertion indicator**

- While a library monomer/preset is dragged within a proximity threshold of a polymer bond, the bond shows a small circle; the circle grows as the cursor gets closer. Both distances are TBD in the ticket and become named constants.
- Dropping while the indicator is shown inserts the item between the bond's two monomers.

**Attachment points**

- The original monomers keep the attachment points of the bond being broken.
- The new monomer's AP on each side is the complement of the original monomer's AP there (R1↔R2), except sugar–base bonds through R3 (sugar)–R1 (base); this is what makes R1–R2 the default for amino acids, sugar–phosphate, and unsplit-nucleotide bonds alike, since none of those reach the sugar/base case.
- For a preset only the sugar and phosphate (if present) are used for the two new bonds.

**Insertion not possible**

- If no default connection exists and the monomer has two or more APs, the new *Select Attachment Points* dialog opens; **Connect** completes the insertion.
- If no default connection exists for a preset, nothing is inserted and a modal with only **Close** shows: "Preset cannot be inserted because default bonds cannot be established."
- If no default connection exists and the monomer has one AP, a **Close**-only modal shows: "The monomer cannot be inserted because it only has one attachment point."
- The new *Select Attachment Points* dialog (three structures) matches the existing dialogs' presentation: a selected AP shows the same filled blue pill, chosen via buttons for the new monomer's two sides. The existing *Select Attachment Points* (two structures) and *Edit Attachment Points* dialogs are untouched.

**Layout**

- Snake mode: run the snake layout after insertion.
- Flex mode, non-circular: bond < 3 Å is extended to 3 Å, item placed at the midpoint, the right/bottom part of the chain shifts. Bond ≥ 3 Å: item placed at the midpoint, no shift.
- Flex mode, circular structure: bond < 3 Å is extended to 3 Å and every monomer past the perpendicular line through the bond shifts so angles to the right/bottom neighbour are preserved.
- Phosphateless preset: same as a monomer, sugar at midpoint, base in its default position below.
- Phosphate-containing preset: the bond extension is variable (triangle with sides 0.75 Å and 1.5 Å, angle α to horizontal gives side C; extend the bond to 2C if shorter). Presets may flip when dropped on an antisense chain.

**Replacement update (req. 8)**

- The same variable bond-extension is applied when a phosphate-containing preset replaces a monomer in a circular structure.

## Capabilities

### New Capabilities

- `drag-drop-monomer-insertion`: Bond-proximity indicator, drop-to-insert behaviour, AP resolution, the two error modals, the new *Select Attachment Points* dialog, and Flex/Snake layout rules for inserting a library monomer or preset into an existing polymer bond.

### Modified Capabilities

- `monomer-replacement-drag-drop` (req. 8): when a phosphate-containing preset replaces a single monomer in Flex mode and the new phosphate's external bond is part of a circular structure, that bond is extended (reusing insertion's bond-extension geometry) instead of shifting the downstream chain.

## Impact

- **`ketcher-core`** — `LibraryItemDragDropHandler` gains a bond-proximity check, racing by distance against the AP-proximity check once neither is beaten by an active replacement target, and an insertion path built in the handler (`executeInsertion`/`finishInsertion`) from pure helpers in `insertion.ts`/`insertionHelpers.ts` (delete-bond / add-monomer / add-bond operations in one history entry), not as a `DrawingEntitiesManager` method; `LibraryItemDragDropHandler`'s replacement path reuses the same bond-extension geometry for req. 8; default-AP resolution for insertion is its own table in `insertionHelpers.ts` (R1↔R2 complement, R3–R1 for sugar/base) — independent of `bondConnectionHelpers.ts`'s modal/preset-component logic and of `SequenceMode.ts`'s inline R1/R2 handling; `UsageInMacromolecule` gains a value dedicated to the new dialog's presentation so the existing *Select Attachment Points* / *Edit Attachment Points* dialogs keep their current look.
- **`ketcher-macromolecules`** — a bond-hover circle (transient view) driven by drag state; two new error modals, titled via the hardcoded strings `INSERT_PRESET_ERROR_MESSAGE` / `INSERT_SINGLE_AP_ERROR_MESSAGE` in `ketcher-core` rather than `macromoleculesDialogs.json`; the new `InsertionConnection` dialog. The existing `MonomerConnections` (*Select Attachment Points* / *Edit Attachment Points*) dialog is not modified.
- **`ketcher-autotests`** — new `data-testid`s and Playwright specs (to be planned per `testing.md`, user approval required before writing).
- No public API changes, no format/serialization impact. Depends on the layout work in #7455 and relates to #7926.
