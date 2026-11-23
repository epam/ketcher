# Templates, Functional Groups & Structural Groups Specification

## Purpose

Drawing common rings, reusable fragments, functional groups, Markush (R-Group) structures, and structural (S-Group) annotations atom-by-atom is slow and error-prone. Ketcher provides libraries and grouping tools so users insert and annotate these constructs directly.

## Requirements

Inserting a template or group produces a well-formed structure; abbreviated groups behave as single units until expanded.

### Requirement: Fusing a ring onto an atom

The system SHALL ensure that the ring is fused to the structure through that atom.

#### Scenario: Fusing a ring onto an atom

- **WHEN** the user selects a ring template and clicks an existing atom
- **THEN** the ring is fused to the structure through that atom

### Requirement: Bond-to-bond template fusion

The system SHALL ensure that the template's default bond replaces the clicked bond without changing that bond's length.

#### Scenario: Bond-to-bond template fusion

- **WHEN** the user clicks a bond with a ring template selected
- **THEN** the template's default bond replaces the clicked bond without changing that bond's length

### Requirement: Expanding and contracting a functional group

The system SHALL ensure that the group's internal atoms/bonds are shown and then re-collapsed to the label, preserving chemistry.

#### Scenario: Expanding and contracting a functional group

- **WHEN** the user chooses _Expand_ on a contracted functional group and later _Contract_
- **THEN** the group's internal atoms/bonds are shown and then re-collapsed to the label, preserving chemistry

### Requirement: Neighbour structures follow an expanding or contracting abbreviation

The system SHALL ensure that each neighbouring fragment is shifted as a rigid piece so that its bonds to the abbreviation keep the length and angle they had before, whether they end on the collapsed label or on the attachment atom; and expanding and then contracting again returns every neighbouring atom to its original position.

#### Scenario: Neighbour structures follow an expanding or contracting abbreviation

- **WHEN** the user expands or contracts an abbreviation that is bonded to surrounding structure
- **THEN** each neighbouring fragment is shifted as a rigid piece so that its bonds to the abbreviation keep the length and angle they had before, whether they end on the collapsed label or on the attachment atom
- **AND** expanding and then contracting again returns every neighbouring atom to its original position

### Requirement: Editing atoms inside an abbreviation is blocked

The system SHALL ensure that Ketcher blocks the edit and offers to _Remove the Abbreviation_.

#### Scenario: Editing atoms inside an abbreviation is blocked

- **WHEN** the user applies an incompatible tool to an atom inside a functional group
- **THEN** Ketcher blocks the edit and offers to _Remove the Abbreviation_

### Requirement: Creating a Markush R-Group member

The system SHALL ensure that the fragment becomes an R-Group member linked to the corresponding R-Group position(s).

#### Scenario: Creating a Markush R-Group member

- **WHEN** the user assigns a fragment to an R-Group label and defines its attachment point(s)
- **THEN** the fragment becomes an R-Group member linked to the corresponding R-Group position(s)

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

## User interaction

- **Templates** — the _Templates_ toolbar and the _Structure Library_ (`Shift+t`) provide rings and predefined structures. Click canvas to place, click an atom for a fused structure, or click/drag on a bond for bond-to-bond fusion. Users can save custom templates (name + default attachment atom/bond) into _User Templates_.
- **Functional Groups** — the _Functional Groups_ library tab (`Shift+f`) inserts predefined groups. They can replace an atom, be dropped on the canvas, or be joined by dragging a single bond. Groups are abbreviated to a label and can be **Expanded**, **Contracted**, or have their **Abbreviation Removed** from the right-click menu.
- **R-Groups (Markush)** — the _R-Group_ toolbox: _R-Group Label_, _R-Group Fragment_, and _Attachment Point_ tools, plus _R-Group Logic_ (occurrence, RestH, If-R(i)-Then conditions).
- **S-Groups** — the _S-Group tool_ (`Mod+g`) marks a fragment as Data, Multiple group, SRU Polymer, Copolymer, Superatom, Mixture (ordered or unordered), Query component, or Nucleotide Component.

## Guarantees

- Functional groups and Superatom S-Groups can only be selected/moved/deleted as a whole; their chemical meaning is preserved when contracted.
- Templates keep the initial structure's bond lengths on fusion.
- Functional groups are treated as super atoms when opening/saving `.mol` files.
