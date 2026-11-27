# Monomer Replacement via Drag-Drop

## Purpose

Swapping one monomer or preset for another required deleting the original, placing the new one,
and manually re-establishing all bonds — a slow, error-prone multi-step workflow. This feature
extends the drag-and-drop mechanism so that dropping a library item onto an existing canvas
monomer (or a matching preset) replaces it in place and preserves as many bonds as possible.

## Requirements

### Requirement: Replacement target detection for single monomer drag

While a single library monomer is being dragged over the canvas, the system SHALL detect when the
cursor is within the replacement proximity threshold of a canvas monomer's center and activate a
visual replacement indicator on that monomer, suppressing the AP `+` indicator for it.

#### Scenario: Monomer replacement highlight activates on center proximity

- **WHEN** the user drags a single monomer from the library
- **AND** the cursor comes within the replacement proximity threshold of a canvas monomer's center
- **THEN** the canvas monomer shows the replacement-target visual state
- **AND** no attachment-point `+` indicators are shown for that monomer

#### Scenario: Replacement highlight clears on exit

- **WHEN** the cursor moves beyond the replacement proximity threshold
- **THEN** the replacement-target visual state is removed

### Requirement: Monomer replaced by dragged monomer on drop

When a dragged library monomer is released while a canvas monomer is in the replacement-target
state, the system SHALL replace the canvas monomer with the library monomer and re-establish all
existing bonds on matching attachment points, warning before any bond would be lost.

#### Scenario: Monomer replaced and compatible bonds re-established

- **WHEN** the user releases a dragged monomer over a canvas monomer in replacement-target state
- **THEN** the canvas monomer is removed and the library monomer is placed at the same position
- **AND** all polymer bonds whose attachment point exists and is free on the new monomer are re-established

#### Scenario: Warning shown when replacement would delete bonds

- **WHEN** the new monomer lacks one or more attachment points that the original had active bonds on
- **THEN** the "Deletion of bonds" modal is shown before proceeding

#### Scenario: Replacement aborted on Cancel

- **WHEN** the "Deletion of bonds" modal is shown and the user clicks Cancel
- **THEN** the replacement is aborted and the canvas reverts to its previous state

#### Scenario: Bonds to small molecules and hydrogen bonds preserved

- **WHEN** the original monomer had bonds to small-molecule atoms or hydrogen bonds
- **AND** the new monomer has the corresponding attachment points free
- **THEN** those bonds are re-established on the replacement monomer

### Requirement: Replacement target detection for preset drag (preset-on-preset)

While a library preset is being dragged over the canvas, the system SHALL activate a
replacement indicator on an entire canvas preset of the same geometry (same component types and
phosphate position) when the cursor enters the proximity of any of its component monomers; it
SHALL NOT activate for a canvas preset of a different geometry.

#### Scenario: Preset replacement highlight activates on compatible canvas preset

- **WHEN** the user is dragging a preset from the library
- **AND** the cursor comes within the proximity threshold of any component monomer of a canvas
  preset with the same geometry (same components + same phosphate position)
- **THEN** all monomers of the canvas preset show the replacement-target visual state

#### Scenario: Preset replacement highlight does not activate on incompatible preset

- **WHEN** the canvas preset has a different geometry from the dragged preset
- **THEN** no preset-level replacement indicator is shown; interaction falls through to
  monomer-level replacement detection

### Requirement: Preset replaced by dragged preset on drop

When a dragged library preset is released while a canvas preset of the same geometry is in the
replacement-target state, the system SHALL replace the canvas preset with the library preset and
re-establish all existing inter-preset bonds.

#### Scenario: Preset replaced and compatible bonds re-established

- **WHEN** the user releases a dragged preset over a canvas preset in replacement-target state
- **THEN** canvas preset components are replaced at the same positions (sugar position preserved in Flex)
- **AND** all polymer bonds of the original preset components that have matching free APs on the
  new components are re-established

### Requirement: Replacement target detection for preset drag (preset-on-monomer)

While a library preset is being dragged, the system SHALL activate a monomer-level replacement
indicator on a canvas monomer that does not belong to a same-geometry preset when the cursor
enters its proximity.

#### Scenario: Preset replacement highlight activates on standalone monomer

- **WHEN** the user is dragging a preset from the library
- **AND** the cursor comes within the proximity threshold of a canvas monomer that is not part of
  a same-geometry preset
- **THEN** the canvas monomer shows the preset replacement-target visual state

### Requirement: Preset replaces a single canvas monomer on drop

When a dragged library preset is released while a single canvas monomer (not part of a compatible
preset) is in the replacement-target state, the system SHALL replace the monomer with the preset
and re-route its bonds to the preset component with the matching free attachment point.

#### Scenario: Bond re-routed to preset component with matching free Rn (preset→monomer)

- **WHEN** the user releases a dragged preset over a single canvas monomer in replacement-target state
- **THEN** the original monomer is removed and the preset is placed with its sugar at the
  original monomer's position
- **AND** each original bond is re-established with the preset component that has the same free Rn
- **AND** priority order when multiple components share the Rn: sugar > phosphate > base

### Requirement: Layout behavior after replacement

The system SHALL apply specific layout rules depending on the replacement type and the active
editor mode. For a phosphate-containing preset replacing a single monomer in Flex mode, when the
new phosphate's external bond (to the monomer that was bonded to the original monomer) is part of
a circular structure, the system SHALL extend that bond — instead of shifting the downstream
chain — to the same minimum length used for bond-insertion (4.5 Å, see
[monomer-insertion-drag-drop](./monomer-insertion-drag-drop.md)), shifting only the monomers past
the line perpendicular to the bond so angles to their neighbours are preserved. If that bond is
already at least 4.5 Å, the system SHALL apply neither the extension nor the downstream shift.

#### Scenario: No re-layout after monomer-on-monomer replacement

- **WHEN** a monomer is replaced by a monomer (in any layout mode)
- **THEN** no re-layout is triggered

#### Scenario: Preset-on-preset replacement — no re-layout for standard angles

- **WHEN** a preset is replaced by a preset and all original components have standard bond angles
- **THEN** no re-layout is triggered in either Flex or Snake mode

#### Scenario: Preset-on-preset replacement in Flex with non-standard angles

- **WHEN** a preset is replaced by a preset in Flex mode and any original component has non-standard angles
- **THEN** the new preset's sugar is placed at the same canvas position as the original sugar

#### Scenario: Snake re-layout after preset-on-monomer replacement

- **WHEN** a preset replaces a single monomer in Snake mode
- **THEN** the snake layout algorithm runs and repositions all connected monomers

#### Scenario: Chain shift in Flex after preset-on-monomer replacement (non-circular)

- **WHEN** a preset (containing both a sugar and a phosphate) replaces a single monomer in Flex mode
- **AND** the new phosphate's external bond is not part of a circular structure
- **THEN** all downstream monomers in the same chain shift right by `(droppedComponentCount − 1) × SnakeLayoutCellWidth`
- **AND** the shift is part of the same atomic undo step as the replacement

#### Scenario: No shift in Flex when preset without phosphate replaces a monomer

- **WHEN** the dropped preset does not contain both a sugar and a phosphate
- **THEN** no downstream shift is applied

#### Scenario: Circular structure extends the bond instead of shifting

- **WHEN** a preset with both a sugar and a phosphate replaces a single monomer in Flex mode
- **AND** the new phosphate's external bond is part of a circular structure
- **AND** that bond is shorter than 4.5 Å
- **THEN** the bond is extended to 4.5 Å and the monomers past the line perpendicular to it shift,
  preserving the angles to their neighbours
- **AND** the downstream-chain shift used for the non-circular case is not applied

#### Scenario: Circular structure with an already-long bond is left unchanged

- **WHEN** the same circular case applies but the bond is already at least 4.5 Å
- **THEN** neither the bond extension nor the downstream-chain shift is applied

### Requirement: Replacement undo atomicity

A monomer or preset replacement SHALL be undoable as a single atomic undo step, restoring the
original monomer/preset and all its original bonds.

#### Scenario: Replacement undo in one step

- **WHEN** the user triggers undo after a replacement
- **THEN** the new monomer/preset is removed and the original with all its original bonds is restored
- **AND** the canvas returns to the state immediately before the replacement

#### Scenario: Redo reapplies the replacement in one step

- **WHEN** the user triggers redo after undoing a replacement
- **THEN** the replacement is reapplied with all bond changes in one step

## User interaction

- **Replacement highlight** — while dragging a library monomer or preset, if the cursor comes
  within the replacement proximity threshold of a canvas monomer's center, that monomer (or the
  entire matching preset) changes its visual appearance to a replacement-target state.
- **Priority over AP highlight and bond-insertion indicator** — the replacement check fires
  before both the AP proximity check and the bond-insertion check (see
  [monomer-insertion-drag-drop](./monomer-insertion-drag-drop.md)); while a replacement target is
  active, neither the attachment-point `+` indicator nor the bond-insertion circle is shown.
- **Drop to replace** — releasing the drag over a highlighted target replaces the canvas entity
  with the library item at the same canvas position, re-establishing all compatible bonds.
- **Bond-deletion warning** — if the new monomer/preset lacks an attachment point that the
  original had an active bond on, a "Deletion of bonds" modal opens (title: "Deletion of bonds",
  text: "Some bonds will get deleted during replacement. Do you wish to proceed.", buttons:
  Cancel / Yes). Cancel aborts; Yes proceeds with compatible bonds re-established and
  incompatible bonds deleted.
- **Single monomer onto a preset component** — a dragged single monomer replaces only the
  specific preset component under the cursor, not the whole preset.

## Guarantees

- The replacement proximity check fires **before** both the AP proximity check and the
  bond-insertion check; a replacement target always suppresses the other two.
- For a phosphate-containing preset replacing a monomer in a circular structure, the bond-extension
  geometry is shared with [monomer-insertion-drag-drop](./monomer-insertion-drag-drop.md): the
  minimum extended bond is the same 4.5 Å.
- Replacement is always atomic — placement, bond deletion, and bond re-establishment share one `CommandsHistory` entry.
- Bond re-establishment covers polymer bonds, monomer-to-atom bonds, and hydrogen bonds.
- A single dragged monomer replaces at most one canvas monomer (never an entire preset).
- Same-geometry preset equality: same set of component types (sugar/base/phosphate presence) **and** same phosphate position (5′ or 3′).

## Limitations

- Monomer replacement via drag-drop is not available in Sequence layout mode (drag from library is disabled there).
- Smooth auto-scroll after chain shift (task 7.8) is not yet implemented.
- The exact value of `DRAG_REPLACE_PROXIMITY_THRESHOLD_PX` is TBD (to be agreed with UX).
- E2E acceptance tests (tasks 9.1–9.9) are not yet written.

## Related

- Feature: [drag-drop-bond-establishment](./drag-drop-bond-establishment.md)
- Feature: [monomer-insertion-drag-drop](./monomer-insertion-drag-drop.md) — the related "insert
  into a bond" drop outcome; shares priority ordering and bond-extension geometry with this feature.
- Feature: [macromolecules](./macromolecules.md)
