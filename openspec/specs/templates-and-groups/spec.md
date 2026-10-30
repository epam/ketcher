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

## User interaction

- **Templates** — the _Templates_ toolbar and the _Structure Library_ (`Shift+t`) provide rings and predefined structures. Click canvas to place, click an atom for a fused structure, or click/drag on a bond for bond-to-bond fusion. Users can save custom templates (name + default attachment atom/bond) into _User Templates_.
- **Functional Groups** — the _Functional Groups_ library tab (`Shift+f`) inserts predefined groups. They can replace an atom, be dropped on the canvas, or be joined by dragging a single bond. Groups are abbreviated to a label and can be **Expanded**, **Contracted**, or have their **Abbreviation Removed** from the right-click menu.
- **R-Groups (Markush)** — the _R-Group_ toolbox: _R-Group Label_, _R-Group Fragment_, and _Attachment Point_ tools, plus _R-Group Logic_ (occurrence, RestH, If-R(i)-Then conditions).
- **S-Groups** — the _S-Group tool_ (`Mod+g`) marks a fragment as Data, Multiple group, SRU Polymer, Copolymer, Superatom, Query component, or Nucleotide Component.

## Guarantees

- Functional groups and Superatom S-Groups can only be selected/moved/deleted as a whole; their chemical meaning is preserved when contracted.
- Templates keep the initial structure's bond lengths on fusion.
- Functional groups are treated as super atoms when opening/saving `.mol` files.
