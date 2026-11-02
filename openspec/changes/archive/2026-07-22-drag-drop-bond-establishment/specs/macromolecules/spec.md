## MODIFIED Requirements

### Requirement: Adding monomers via drag-and-drop

The system SHALL allow users to add monomers and presets to the canvas by dragging them from the monomer library. When the dragged item is released within the canvas boundary, it SHALL be placed at the drop position. When the dragged item is released within 25 px of a free attachment point of an existing canvas monomer, it SHALL additionally establish a polymer bond with that monomer using default-bond rules, or open the _Select Attachment Points_ dialog when no default can be resolved.

#### Scenario: Monomer placed without bonding (open canvas drop)

- **WHEN** the user drags a monomer from the library and releases it on an area of the canvas with no monomer within 25 px of any free AP
- **THEN** the monomer is placed at the drop position without any bond being created

#### Scenario: Monomer placed with bonding (proximity drop)

- **WHEN** the user drags a monomer from the library and releases it within 25 px of a free AP of a canvas monomer
- **THEN** the monomer is placed and a polymer bond is established between the two monomers using default-bond rules
- **AND** if no default bond can be resolved and multiple APs are available, the _Select Attachment Points_ dialog opens

#### Scenario: Preset placed with bonding (proximity drop)

- **WHEN** the user drags an RNA preset from the library and releases it within 25 px of a free AP of a canvas monomer
- **THEN** the preset is placed and a polymer bond is established between the resolved preset component and the canvas monomer
