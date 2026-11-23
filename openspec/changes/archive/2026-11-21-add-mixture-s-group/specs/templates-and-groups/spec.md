# Spec Delta

## ADDED Requirements

### Requirement: Creating a mixture S-group

The S-Group Properties dialog SHALL offer the type `Mixture` directly after `Superatom`. When `Mixture` is selected, the dialog SHALL show a `Subtype` selector with the options `Ordered` and `Unordered`, with neither preselected, and SHALL NOT allow applying until one is selected.

#### Scenario: Mixture is listed after Superatom

- **WHEN** the user opens the type list of the S-Group Properties dialog
- **THEN** the list shows Data, Multiple group, SRU polymer, Copolymer, Superatom, Mixture, Query component, Nucleotide Component, in this order

#### Scenario: Subtype is mandatory

- **WHEN** the user selects the type `Mixture` and has not selected a subtype
- **THEN** the `Subtype` selector shows no selected value and the Apply button is disabled

#### Scenario: Creating an unordered mixture

- **WHEN** the user selects two separate structures, opens the S-Group Properties dialog, selects `Mixture` and `Unordered`, and applies
- **THEN** one unordered mixture S-group contains the atoms of both structures

### Requirement: Drawing a mixture S-group

A mixture S-group SHALL be drawn with brackets around its atoms. The abbreviation `f` for an ordered mixture or `mix` for an unordered mixture SHALL be drawn outside the closing bracket at its lower right.

#### Scenario: Ordered mixture on the canvas

- **WHEN** an ordered mixture S-group is on the canvas
- **THEN** brackets enclose its atoms and `f` is shown at the lower right of the closing bracket

#### Scenario: Unordered mixture on the canvas

- **WHEN** an unordered mixture S-group is on the canvas
- **THEN** brackets enclose its atoms and `mix` is shown at the lower right of the closing bracket

### Requirement: Editing a mixture S-group

Opening the S-Group Properties dialog for a mixture S-group SHALL show the type `Mixture` and its current subtype. Applying a different subtype SHALL change the group and its abbreviation as one undoable step.

#### Scenario: Changing the subtype

- **WHEN** the user opens the dialog for an unordered mixture, selects `Ordered`, and applies
- **THEN** the group is an ordered mixture with the same atoms and its abbreviation is `f`

#### Scenario: Changing a mixture to another type

- **WHEN** the user opens the dialog for a mixture and selects the type `Copolymer`
- **THEN** the Copolymer subtype is blank and the Apply button is enabled

#### Scenario: Undoing a subtype change

- **WHEN** the user undoes that change
- **THEN** the group is an unordered mixture again and its abbreviation is `mix`

### Requirement: Mixture S-groups in MOL and KET files

Ketcher SHALL load the Molfile S-group types `MIX` (unordered mixture) and `FOR` (ordered mixture) from V2000 and V3000 files, and the same types from KET files, without asking to remove them. Saving to KET, Molfile V2000 or Molfile V3000 SHALL keep each mixture's type and atoms.

#### Scenario: Opening a Molfile with a mixture

- **WHEN** the user opens a Molfile that contains a `FOR` S-group
- **THEN** no "Unsupported S-group type" question is shown and the group is on the canvas as an ordered mixture

#### Scenario: KET round trip

- **WHEN** a structure with an ordered and an unordered mixture is saved to KET and that KET is opened again
- **THEN** both groups are present with the same subtype and the same atoms

#### Scenario: Nested mixtures in a KET file

- **WHEN** a KET file lists an unordered mixture before the ordered mixture that contains it, and the user opens it
- **THEN** the canvas has the same atoms as the file, with no duplicates, and both mixtures
