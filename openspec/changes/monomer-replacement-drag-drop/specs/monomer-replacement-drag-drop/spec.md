## ADDED Requirements

### Requirement: Replacement target detection for single monomer drag

When a single library monomer is being dragged over the canvas, the system SHALL detect when the cursor is within the replacement proximity threshold of a canvas monomer's center and activate a visual replacement indicator on that monomer.

#### Scenario: Replacement highlight activates on monomer center proximity

- **WHEN** the user is dragging a single monomer from the library
- **AND** the cursor comes within [TBD] px of the center of a canvas monomer
- **THEN** the canvas monomer changes its visual appearance to indicate it is the replacement target
- **AND** no attachment-point `+` indicators are shown for that monomer

#### Scenario: Replacement highlight clears on exit

- **WHEN** the cursor moves beyond [TBD] px from the center of the previously highlighted canvas monomer
- **THEN** the replacement-target visual appearance is removed from that monomer

#### Scenario: Replacement takes priority over AP bond-establishment

- **WHEN** the cursor is within the replacement proximity threshold of a canvas monomer's center
- **THEN** the system treats the interaction as a replacement, not as a proximity AP bond-establishment

---

### Requirement: Monomer replaced by dragged monomer on drop

When a dragged library monomer is released while a canvas monomer is in the replacement-target state, the system SHALL replace the canvas monomer with the library monomer and re-establish all existing bonds on matching attachment points.

#### Scenario: Monomer replaced and compatible bonds re-established

- **WHEN** the user releases a dragged monomer over a canvas monomer in replacement-target state
- **THEN** the canvas monomer is removed and the library monomer is placed at the same canvas position
- **AND** all polymer bonds of the original monomer that have a matching free attachment point on the new monomer are re-established

#### Scenario: Warning shown when replacement would delete bonds

- **WHEN** the new monomer lacks one or more attachment points that the original monomer had active bonds on
- **THEN** a "Deletion of bonds" modal is shown with title "Deletion of bonds", text "Some bonds will get deleted during replacement. Do you wish to proceed.", and buttons "Cancel" (default) and "Yes"

#### Scenario: Replacement aborted on Cancel

- **WHEN** the "Deletion of bonds" modal is shown and the user clicks Cancel
- **THEN** the replacement is aborted and the canvas reverts to its previous state

#### Scenario: Replacement proceeds and incompatible bonds deleted on Yes

- **WHEN** the "Deletion of bonds" modal is shown and the user clicks Yes
- **THEN** the canvas monomer is replaced, compatible bonds are re-established, and bonds whose attachment points are absent on the new monomer are deleted

#### Scenario: Bonds to small molecules and hydrogen bonds preserved

- **WHEN** the original monomer had bonds to small-molecule atoms or hydrogen bonds
- **AND** the new monomer has the corresponding attachment points free
- **THEN** those bonds are re-established on the replacement monomer

#### Scenario: Single monomer cannot replace an entire preset

- **WHEN** the cursor is over a canvas monomer that is a component of a preset
- **THEN** the dragged single monomer replaces only that specific preset component, not the whole preset

---

### Requirement: Replacement target detection for preset drag (preset-on-preset)

When a library preset is being dragged over the canvas and the cursor enters the proximity of any monomer center that belongs to a canvas preset of the same geometry, the system SHALL activate a replacement indicator on the entire canvas preset.

A preset of the same geometry is defined as a preset containing the same components (sugar, base, phosphate presence) and the same phosphate position (5′ or 3′).

#### Scenario: Preset replacement highlight activates on compatible canvas preset

- **WHEN** the user is dragging a preset from the library
- **AND** the cursor comes within [TBD] px of any component monomer center of a canvas preset with the same geometry
- **THEN** all monomers of the canvas preset change their visual appearance to indicate they form the replacement target

#### Scenario: Preset replacement highlight does not activate on incompatible preset

- **WHEN** the cursor is within [TBD] px of a canvas preset monomer's center
- **AND** the canvas preset has different geometry from the dragged preset
- **THEN** no preset-level replacement indicator is shown; the interaction falls through to monomer-level replacement detection

---

### Requirement: Preset replaced by dragged preset on drop

When a dragged library preset is released while a canvas preset of the same geometry is in the replacement-target state, the system SHALL replace the canvas preset with the library preset and re-establish all existing inter-preset bonds.

#### Scenario: Preset replaced and compatible bonds re-established

- **WHEN** the user releases a dragged preset over a canvas preset in replacement-target state
- **THEN** the canvas preset components are replaced by the library preset components at the same canvas positions (sugar position preserved in Flex mode)
- **AND** all polymer bonds that the original sugar/phosphate/base had and that the corresponding new component also supports are re-established

#### Scenario: Warning shown when preset replacement would delete bonds

- **WHEN** any new preset component lacks an attachment point that the original had an active bond on
- **THEN** the "Deletion of bonds" modal is shown before the replacement proceeds

---

### Requirement: Replacement target detection for preset drag (preset-on-monomer)

When a library preset is being dragged and the cursor enters the proximity of a canvas monomer center that does not belong to a compatible preset, the system SHALL activate a monomer-level replacement indicator on that canvas monomer.

#### Scenario: Preset replacement highlight activates on standalone monomer

- **WHEN** the user is dragging a preset from the library
- **AND** the cursor comes within [TBD] px of a canvas monomer that is not part of a same-geometry preset
- **THEN** the canvas monomer changes its visual appearance to indicate it is the preset replacement target

---

### Requirement: Preset replaces a single canvas monomer on drop

When a dragged library preset is released while a single canvas monomer (not part of a compatible preset) is in the replacement-target state, the system SHALL replace the monomer with the preset and re-route its bonds to the appropriate preset component.

#### Scenario: Bond re-routed to preset component with matching free Rn

- **WHEN** the user releases a dragged preset over a single canvas monomer in replacement-target state
- **THEN** the original monomer is removed and the preset is placed such that the sugar is at the original monomer's position
- **AND** each bond the original monomer had is re-established with the preset component that has the same free Rn
- **AND** if multiple components have that Rn free, priority order is sugar > phosphate > base

#### Scenario: Warning shown when no preset component has the required Rn

- **WHEN** no preset component has a free Rn that matches any of the original monomer's active bond attachment points
- **THEN** the "Deletion of bonds" modal is shown before proceeding

---

### Requirement: Layout behavior after replacement

The system SHALL apply specific layout rules depending on the replacement type and the active editor mode.

#### Scenario: No re-layout after monomer-on-monomer replacement

- **WHEN** a monomer is replaced by a monomer
- **THEN** no re-layout is triggered in either Flex or Snake mode

#### Scenario: No re-layout after preset-on-preset replacement when bond lengths are standard

- **WHEN** a preset is replaced by a preset
- **AND** all monomers of the original preset have standard bond lengths and angles
- **THEN** no re-layout is triggered in either Flex or Snake mode

#### Scenario: No re-layout in Snake after preset-on-preset replacement with non-standard angles

- **WHEN** a preset is replaced by a preset
- **AND** any monomer of the original preset has non-standard bond lengths or angles
- **THEN** no re-layout is triggered in Snake mode

#### Scenario: Sugar position preserved in Flex after preset-on-preset replacement with non-standard angles

- **WHEN** a preset is replaced by a preset in Flex mode
- **AND** any monomer of the original preset has non-standard bond lengths or angles
- **THEN** the sugar of the new preset is placed at the same canvas position as the sugar of the original preset

#### Scenario: Snake re-layout triggered after preset-on-monomer replacement

- **WHEN** a monomer is replaced by a preset while Snake mode is active
- **THEN** the snake layout algorithm runs and repositions all connected monomers

#### Scenario: Chain shifted in Flex after preset-on-monomer replacement

- **WHEN** a monomer is replaced by a preset while Flex mode is active
- **THEN** the chain connected to the replaced monomer is shifted left or right to accommodate the new preset geometry

#### Scenario: Smooth scroll when shift moves monomers off-screen in Flex

- **WHEN** the chain shift after a preset-on-monomer replacement causes any monomer to be positioned outside the viewport
- **THEN** the canvas scrolls smoothly using the same auto-scroll behavior as the autochain feature to bring the off-screen monomers into view

---

### Requirement: Replacement undo atomicity

A monomer or preset replacement SHALL be undoable as a single atomic undo step.

#### Scenario: Undo restores original monomer/preset and all bonds in one step

- **WHEN** the user performs a replacement via drag-drop
- **AND** the user triggers undo
- **THEN** the new monomer/preset is removed and the original monomer/preset with all its original bonds is restored
- **AND** the canvas returns to its state immediately before the replacement

#### Scenario: Redo reapplies the replacement in one step

- **WHEN** the user triggers redo after undoing a replacement
- **THEN** the replacement is reapplied together with its bond changes in one step
