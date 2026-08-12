# Drag-Drop Bond Establishment

## Problem

Building polymer chains required the user to drag a monomer from the library to place it, then manually draw a bond with the Bond tool. This two-step flow was slow when assembling long sequences. This feature extends drag-and-drop so that releasing a dragged item near a free attachment point automatically creates a polymer bond.

## User interaction

- **Proximity highlight** — while dragging a monomer or preset from the library, all free attachment points of any canvas monomer within 25 px become visible; the nearest AP extends it's size.
- **Bond on drop** — releasing the drag over a highlighted AP creates a polymer bond using the same default-bond rules as the Bond tool (R1-R2 for backbone, R3-R1 for sugar-base, etc.).
- **Dialog fallback** — when no default bond can be resolved and the dropped entity has two or more free APs, the _Select Attachment Points_ dialog opens pre-populated with the target AP.
- **Non-standard bond notification** — if the resolved bond pairs same-group attachment points (Rn–Rn), a toast notification is shown.

## Expected behavior

#### Scenario: AP highlight appears during drag

- **WHEN** the user is dragging a monomer or preset from the library
- **AND** the cursor comes within 25 px of a free attachment point on any canvas monomer
- **THEN** all free APs of that canvas monomer become visible
- **AND** the AP nearest the cursor shows a `+` indicator

#### Scenario: Highlight clears on exit

- **WHEN** the cursor moves more than 25 px away from all free APs of a previously highlighted monomer
- **THEN** the AP visibility and `+` indicator are removed

#### Scenario: Default bond established on drop (monomer)

- **WHEN** the user releases a dragged monomer over a highlighted free AP
- **AND** a default bond can be resolved (e.g. R1-R2)
- **THEN** a polymer bond is created automatically; no dialog is shown

#### Scenario: Default bond established on drop (sugar to base)

- **WHEN** the user releases a dragged RNABase over a highlighted free R3 AP of a canvas Sugar
- **THEN** a bond is created connecting the RNABase's R1 to the Sugar's R3

#### Scenario: Dialog when no default bond can be resolved

- **WHEN** the user releases a dragged monomer over a highlighted AP
- **AND** no default bond can be resolved
- **AND** the dropped monomer has two or more free APs
- **THEN** the _Select Attachment Points_ dialog opens pre-populated with the target AP

#### Scenario: Non-standard bond notification

- **WHEN** a bond is established where both APs belong to the same group (Rn–Rn)
- **THEN** a notification toast is shown: "You have connected monomers with attachment points of the same group"

#### Scenario: Preset drop — component resolved by AP type

- **WHEN** the user releases a dragged preset over a highlighted free R1 of a canvas monomer
- **THEN** the preset component with a free R2 is bonded (and vice-versa for R2 target)
- **AND** if no component satisfies that rule, the fallback order is sugar → phosphate → base

#### Scenario: Flex-mode Dropped monomer repositioned to standard bond length

- **WHEN** a bond is established via drag-drop in Flex mode
- **THEN** the dropped monomer is repositioned so the bond has the standard bond length along the target AP direction

#### Scenario: Preset mirroring in Flex mode

- **WHEN** in Flex mode, the bond connects the first monomer of the dropped preset's chain to the first monomer of the target chain (or last-to-last)
- **THEN** the dropped preset is mirrored horizontally to maintain a natural chain direction

#### Scenario: Snake-mode re-layout after drop bond

- **WHEN** a bond is established via drag-drop while Snake mode is active
- **THEN** the snake layout algorithm runs and repositions all connected monomers

#### Scenario: Undo atomicity

- **WHEN** a drag-drop creates both a new monomer placement and a bond
- **AND** the user triggers undo
- **THEN** both the placed monomer and the bond are removed together in one step

## Guarantees

- A proximity bond is only attempted when `dragDropBondTarget` is set (cursor within 25 px of a free AP at release); open-canvas drops are never bonded.
- The proximity threshold is `DRAG_BOND_PROXIMITY_THRESHOLD_PX = 25` px (screen space).
- Only free (unoccupied) attachment points are eligible as bond targets.
- The bond-on-drop undo step is atomic — placement and bond creation share one history entry.
- The behavior in Sequence layout mode is unchanged (drag from library is disabled there).

## Limitations

- In Flex mode the dropped monomer is snapped to bond-length distance from the target; it does not land exactly at the cursor position.
- Hydrogen bonds cannot be established via drag-drop.
- Drag-drop bonding is only available between library items and canvas monomers, not between two existing canvas monomers.

## Related

- Feature: [macromolecules](./macromolecules.md)
- Module: [editor-engine](../modules/editor-engine.md)
