## MODIFIED Requirements

### Requirement: Editing atoms inside an abbreviation is blocked for monomers

When a user applies an incompatible tool to atoms inside a **monomer** S-group in molecules mode, the system SHALL display the "Edit Monomer" dialog (not the "Edit Abbreviation" dialog). For plain functional-group abbreviations the existing "Edit Abbreviation" dialog behavior SHALL remain unchanged.

#### Scenario: Tool action on atom inside a monomer S-group

- **WHEN** the user applies an incompatible tool (bond, eraser, charge, atom, hotkey, etc.) to an atom that belongs to a MonomerMicromolecule S-group
- **THEN** the system blocks the edit and opens the "Edit Monomer" dialog
- **AND** the "Edit Abbreviation" dialog is NOT shown

#### Scenario: Tool action on atom inside a plain functional group (unchanged)

- **WHEN** the user applies an incompatible tool to an atom that belongs to a non-monomer functional group abbreviation
- **THEN** the system blocks the edit and opens the "Edit Abbreviation" dialog as before
- **AND** the "Edit Monomer" dialog is NOT shown
