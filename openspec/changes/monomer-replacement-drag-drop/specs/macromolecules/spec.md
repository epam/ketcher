## MODIFIED Requirements

### Requirement: Adding monomers via drag-and-drop

The macromolecules editor SHALL support two drag-and-drop outcomes when a library item is dragged to the canvas: (1) **placement** of a new monomer/preset (existing behavior), and (2) **replacement** of an existing canvas monomer/preset when the cursor is within the replacement proximity threshold of a canvas monomer or preset center at drop time.

#### Scenario: Monomer placed without bonding (open canvas drop) — unchanged

- **WHEN** the user drags a monomer from the library and releases it on an area of the canvas with no canvas monomer within [TBD] px of its center and no monomer within 25 px of any free AP
- **THEN** the monomer is placed at the drop position without any bond being created

#### Scenario: Monomer placed with bonding (AP proximity drop) — unchanged

- **WHEN** the user drags a monomer from the library and releases it within 25 px of a free AP of a canvas monomer (and the cursor is outside the replacement proximity threshold of any monomer center)
- **THEN** the monomer is placed and a polymer bond is established between the two monomers using default-bond rules
- **AND** if no default bond can be resolved and multiple APs are available, the _Select Attachment Points_ dialog opens

#### Scenario: Monomer replaced by dragged monomer (center proximity drop)

- **WHEN** the user drags a monomer from the library and releases it within [TBD] px of a canvas monomer's center
- **THEN** the canvas monomer is replaced by the library monomer at the same position with bonds re-established per the monomer-replacement-drag-drop spec

#### Scenario: Preset placed with bonding (AP proximity drop) — unchanged

- **WHEN** the user drags an RNA preset from the library and releases it within 25 px of a free AP of a canvas monomer (and the cursor is outside the replacement proximity threshold)
- **THEN** the preset is placed and a polymer bond is established between the resolved preset component and the canvas monomer

#### Scenario: Preset replaces compatible preset (center proximity drop)

- **WHEN** the user drags a preset from the library and releases it within [TBD] px of any monomer center belonging to a canvas preset that contains every component the dragged preset provides (a sugar, a base if the dragged preset has one, and a phosphate on the same side — 5′/left or 3′/right — if the dragged preset has one)
- **THEN** the canvas preset is replaced by the library preset per the monomer-replacement-drag-drop spec
- **AND** during drag-over every canvas component that corresponds to a dragged-preset component is highlighted as the replacement target

#### Scenario: Preset with a 5′ (left) phosphate replaces a matching preset

- **WHEN** the user drags a preset whose phosphate is on the 5′ (left) side and releases it within [TBD] px of any monomer center of a canvas preset that also has its phosphate on the 5′ (left) side
- **THEN** the sugar, base, and left-side phosphate are all highlighted during drag-over and replaced on drop
- **AND** all external inter-preset bonds (including the bond on the left-side phosphate) are re-established on the corresponding new components

#### Scenario: Two-component preset (sugar+base or sugar+phosphate) replaces a matching preset

- **WHEN** the user drags a two-component preset (sugar+base with no phosphate, or sugar+phosphate with no base) and releases it within [TBD] px of any monomer center of a canvas preset that contains those same two components
- **THEN** both matching canvas components are highlighted during drag-over and replaced on drop, and their external bonds are re-established
- **AND** a canvas component the dragged preset does not provide (e.g. a phosphate neighbouring a sugar+base preset) is neither highlighted nor replaced

#### Scenario: Bonds to retained components are preserved after replacement

- **WHEN** the user drops a two-component preset onto a matching canvas preset and a component the dragged preset does not provide remains on the canvas (e.g. dropping a sugar+phosphate preset onto a canvas nucleotide that still has a base)
- **THEN** the retained component's bond to the replaced preset (e.g. the sugar↔base bond) is re-established on the corresponding new component whenever it exposes the required attachment point
- **AND** all preservable connections (chain bonds, bonds to small molecules, hydrogen bonds) are re-established

#### Scenario: Deletion-of-bonds warning when an attachment point is missing

- **WHEN** the replacement would drop a bond because the dragged monomer or preset component lacks the Rn attachment point the original bond used
- **THEN** a confirmation modal titled "Deletion of bonds" opens with the text "Some bonds will get deleted during replacement. Do you wish to proceed." and the options Cancel (default) and Yes — the same confirmation dialog used elsewhere in macro mode
- **AND** choosing Cancel aborts the replacement leaving the canvas unchanged
- **AND** choosing Yes performs the replacement, re-establishing every preservable bond and dropping only the bonds whose attachment point is unavailable

#### Scenario: Preset replaces standalone monomer (center proximity drop)

- **WHEN** the user drags a preset from the library and releases it within [TBD] px of a canvas monomer's center that is not part of a same-geometry preset
- **THEN** the canvas monomer is replaced by the preset per the monomer-replacement-drag-drop spec
