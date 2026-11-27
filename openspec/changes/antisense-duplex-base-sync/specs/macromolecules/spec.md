## MODIFIED Requirements

### Requirement: Synced double-stranded editing

When the sync toggle is on in sequence layout mode, the system SHALL propagate deletion, typing, and base replacement (through the RNA Builder or the monomer library) on one strand of a double-stranded sequence to the complementary strand, in either direction. When the sync toggle is off, the complementary strand SHALL be left unchanged by these edits.

#### Scenario: Synced double-stranded editing

- **WHEN** the sync toggle is on and the user edits one strand of a double-stranded sequence
- **THEN** the complementary strand is updated to match; **WHEN** the toggle is off, the other strand is left unchanged

#### Scenario: Deletion propagates

- **WHEN** the sync toggle is on and the user deletes a symbol on one strand
- **THEN** the paired symbol on the complementary strand is deleted as well

#### Scenario: Typing propagates

- **WHEN** the sync toggle is on and the user types a base into one strand
- **THEN** a complementary base is inserted into the other strand and a hydrogen bond is created between them

#### Scenario: Base replacement propagates

- **WHEN** the sync toggle is on and the user replaces a base such that its natural analogue changes
- **AND** the paired base is H-bonded to it and is not itself selected
- **THEN** the paired base is rewritten to the complement of the new natural analogue as specified in the antisense-duplex-base-sync capability

#### Scenario: Base replacement propagates in either direction

- **WHEN** the sync toggle is on and the user replaces a base on the antisense strand such that its natural analogue changes
- **AND** the paired sense base is H-bonded to it and is not itself selected
- **THEN** the paired sense base is rewritten to the complement of the new natural analogue

#### Scenario: Sync toggle off

- **WHEN** the sync toggle is off
- **AND** the user deletes, types, or replaces a base on one strand
- **THEN** the other strand is left unchanged
