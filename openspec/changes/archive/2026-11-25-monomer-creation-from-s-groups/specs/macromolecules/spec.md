## ADDED Requirements

### Requirement: Creating a monomer from a selection with S-groups

The system SHALL enable _Create monomer_ when the selection contains S-groups that are each fully selected and are not monomers, and SHALL load only their chemical structure into the monomer creation wizard, with abbreviations expanded.

#### Scenario: Selection holds a whole data S-group

- **WHEN** the selection contains every atom of a data S-group
- **THEN** _Create monomer_ is enabled
- **AND** the wizard opens the atoms and bonds without the data S-group

#### Scenario: Selection holds contracted abbreviations

- **WHEN** the selection contains a contracted functional-group or salt/solvent abbreviation
- **THEN** _Create monomer_ is enabled
- **AND** the wizard opens the abbreviation expanded into its atoms

#### Scenario: Selection holds part of an S-group

- **WHEN** the selection contains only some atoms of an S-group
- **THEN** _Create monomer_ is disabled

#### Scenario: Selection holds a monomer

- **WHEN** the selection contains a monomer
- **THEN** _Create monomer_ is disabled
