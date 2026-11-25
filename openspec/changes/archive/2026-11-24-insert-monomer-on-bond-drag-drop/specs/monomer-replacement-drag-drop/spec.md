## MODIFIED Requirements

### Requirement: Layout behavior after replacement

The system SHALL apply specific layout rules depending on the replacement type and the active editor mode. For a phosphate-containing preset replacing a single monomer in Flex mode, when the new phosphate's external bond (the bond from the new phosphate to the monomer that was bonded to the original, replaced monomer) is part of a circular structure, the system SHALL extend that bond — instead of shifting the downstream chain — to the same minimum length used for bond-insertion (`2*(A+B)` = 4.5 Å, req. 7.6), shifting only the monomers past the line perpendicular to the bond so angles to their neighbours are preserved. If that bond is already at least 4.5 Å, the system SHALL apply neither the extension nor the downstream-chain shift.

#### Scenario: No re-layout after monomer-on-monomer replacement in Snake mode

- **WHEN** a monomer is replaced by a monomer in Snake mode
- **THEN** no re-layout is triggered

#### Scenario: No shift in Flex after monomer-on-monomer replacement

- **WHEN** a monomer is replaced by a monomer in Flex mode
- **THEN** no downstream shift is applied

#### Scenario: Right part of chain shifts in Flex when preset with sugar and phosphate replaces a single monomer in a non-circular structure

- **WHEN** a preset is dropped onto a single canvas monomer in Flex mode
- **AND** the preset contains both a sugar and a phosphate
- **AND** the new phosphate's external bond is not part of a circular structure
- **THEN** all monomers downstream of the replaced position in the same chain shift right by `(droppedComponentCount - 1) × SnakeLayoutCellWidth`
- **AND** monomers in other chains are not moved
- **AND** the shift is part of the same atomic undo step as the replacement itself

Examples:

- Sugar + phosphate (no base): `(2 - 1) × 60 = 60px` right-shift
- Sugar + base + phosphate: `(3 - 1) × 60 = 120px` right-shift

#### Scenario: Circular structure extends the phosphate's external bond instead of shifting

- **WHEN** a preset with both a sugar and a phosphate is dropped onto a single canvas monomer in Flex mode
- **AND** the new phosphate's external bond is part of a circular structure
- **AND** that bond is shorter than 4.5 Å
- **THEN** the bond is extended to 4.5 Å
- **AND** the monomers past the line perpendicular to the bond are shifted, preserving the angles to their neighbours
- **AND** the downstream-chain shift used for the non-circular case is not applied

#### Scenario: Circular structure with an already-long bond is left unchanged

- **WHEN** a preset with both a sugar and a phosphate is dropped onto a single canvas monomer in Flex mode
- **AND** the new phosphate's external bond is part of a circular structure
- **AND** that bond is already at least 4.5 Å
- **THEN** neither the bond extension nor the downstream-chain shift is applied

#### Scenario: No shift in Flex when preset without phosphate replaces a single monomer

- **WHEN** a preset is dropped onto a single canvas monomer in Flex mode
- **AND** the preset does not contain both a sugar and a phosphate
- **THEN** no downstream shift is applied

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
- **AND** the circular-structure case above does not apply
- **THEN** the chain connected to the replaced monomer is shifted left or right to accommodate the new preset geometry

#### Scenario: Smooth scroll when shift moves monomers off-screen in Flex

- **WHEN** the chain shift after a preset-on-monomer replacement causes any monomer to be positioned outside the viewport
- **THEN** the canvas scrolls smoothly using the same auto-scroll behavior as the autochain feature to bring the off-screen monomers into view
