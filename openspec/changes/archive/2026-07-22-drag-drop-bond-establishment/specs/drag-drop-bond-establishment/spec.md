## ADDED Requirements

### Requirement: AP proximity highlight on library item drag

When a library monomer or preset is being dragged over the canvas, the system SHALL monitor the cursor position and activate attachment-point highlighting on canvas monomers that are within the proximity threshold.

#### Scenario: Free AP becomes visible when cursor enters proximity

- **WHEN** the user is dragging a monomer or preset from the library
- **AND** the cursor comes within 25 px of a free attachment point on any canvas monomer
- **THEN** all free (unoccupied) attachment points of that canvas monomer become visible
- **AND** the attachment point nearest the cursor shows a `+` indicator in its center

#### Scenario: Highlight clears when cursor leaves proximity

- **WHEN** the cursor moves more than 25 px away from all free attachment points on a previously highlighted canvas monomer
- **THEN** the attachment-point visibility and `+` indicator are removed from that monomer

#### Scenario: Only the nearest AP shows the `+` indicator

- **WHEN** a canvas monomer has multiple free attachment points and the cursor is within 25 px of more than one
- **THEN** only the attachment point closest to the cursor shows the `+` indicator
- **AND** all other free APs of that monomer remain visible without the `+` indicator

---

### Requirement: Bond establishment on drop over highlighted AP

When a dragged monomer or preset is released while a canvas monomer's AP is highlighted, the system SHALL create a polymer bond between the dropped entity and the target AP.

#### Scenario: Default bond established on drop (monomer-to-monomer, backbone)

- **WHEN** the user releases a dragged monomer over a highlighted free AP of a canvas monomer
- **AND** a default bond can be resolved (e.g. R1-R2 for amino acids, R1-R2 for sugar-phosphate)
- **THEN** a polymer bond is created automatically between the resolved AP of the dropped monomer and the highlighted AP of the canvas monomer
- **AND** no dialog is shown

#### Scenario: Default bond established on drop (sugar to base, R3-R1)

- **WHEN** the user releases a dragged RNABase monomer over a highlighted free AP of a canvas Sugar
- **AND** the Sugar's R3 is free
- **THEN** a bond is created connecting the RNABase's R1 to the Sugar's R3

#### Scenario: Select Attachment Points dialog when no default bond can be resolved

- **WHEN** the user releases a dragged monomer over a highlighted free AP of a canvas monomer
- **AND** no default bond can be resolved between the two monomers
- **AND** the dropped monomer has two or more free attachment points
- **THEN** the _Select Attachment Points_ dialog opens pre-populated with the target AP on one side
- **AND** the user selects the source AP to confirm the bond

#### Scenario: Non-standard bond notification

- **WHEN** a bond is established where both attachment points belong to the same group (Rn–Rn same-group)
- **THEN** a notification toast is shown: "You have connected monomers with attachment points of the same group"

---

### Requirement: Preset drop with AP targeting

When a preset (RNA nucleotide: sugar + optional base + optional phosphate) is dragged and released near a canvas monomer's highlighted AP, the system SHALL resolve which component within the preset is bonded.

#### Scenario: Preset dropped near R1 bonds via component with free R2

- **WHEN** the user releases a dragged preset over a highlighted free R1 of a canvas monomer
- **THEN** the bond is established with the preset component that has a free R2

#### Scenario: Preset dropped near R2 bonds via component with free R1

- **WHEN** the user releases a dragged preset over a highlighted free R2 of a canvas monomer
- **THEN** the bond is established with the preset component that has a free R1

#### Scenario: Preset drop fallback to sugar, phosphate, then base

- **WHEN** the user releases a dragged preset over a highlighted free AP that is neither R1 nor R2 (or no component satisfies the above rules)
- **THEN** the bond is established with the preset's sugar if it has any free APs
- **AND** if the sugar has no free APs, with the phosphate if it has any free APs
- **AND** if neither sugar nor phosphate have free APs, with the base if it has any free APs

#### Scenario: Select Attachment Points dialog when preset bonding is ambiguous

- **WHEN** no preset component uniquely resolves for bonding and multiple APs are available across the preset
- **THEN** the _Select Attachment Points_ dialog opens

---

### Requirement: Flex-mode bond geometry on drop

In Flex layout mode, bonds established via drag-drop SHALL respect standard bond length and follow the direction of the target attachment point.

#### Scenario: Dropped monomer placed at standard distance from target AP

- **WHEN** a bond is established via drag-drop in Flex mode
- **THEN** the dropped monomer is positioned such that the new bond has the standard bond length
- **AND** the spatial orientation follows the direction of the target AP

#### Scenario: Preset mirroring when connecting chain-topology ends in Flex mode

- **WHEN** in Flex mode a bond is established between the first monomer of the dropped preset's internal chain and the first monomer of the target canvas chain (first-to-first)
- **OR** between the last monomer of the dropped preset's internal chain and the last monomer of the target canvas chain (last-to-last)
- **THEN** the dropped preset is mirrored horizontally to maintain a natural chain orientation

---

### Requirement: Drop-and-bond undo atomicity

A drag-drop placement that results in a bond creation SHALL be undoable as a single atomic undo step — undoing removes both the placed monomer/preset and the bond together.

#### Scenario: Undo removes both monomer and bond in one step

- **WHEN** the user performs a drag-drop that places a monomer and creates a bond
- **AND** the user triggers undo
- **THEN** both the newly placed monomer and the newly created bond are removed together
- **AND** the canvas returns to its state before the drag-drop

#### Scenario: Redo restores both monomer and bond in one step

- **WHEN** the user triggers redo after the undo described above
- **THEN** both the monomer placement and the bond are restored together

---

### Requirement: Snake-mode re-layout after drop bond

In Snake layout mode, the layout SHALL be re-executed after every bond established via drag-drop.

#### Scenario: Canvas re-lays out after drag-drop bond in Snake mode

- **WHEN** a bond is established via drag-drop while Snake mode is active
- **THEN** the snake layout algorithm runs and repositions all connected monomers into the snake grid
