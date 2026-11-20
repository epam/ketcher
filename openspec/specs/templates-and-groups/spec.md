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

### Requirement: Showing standard S-group labels

The system SHALL show the standard label of an S-group type next to its name in the S-Group Properties dialog, and SHALL draw the standard Copolymer label at the lower-right corner of the Copolymer bracket.

#### Scenario: Type and subtype names in the dialog

- **WHEN** the user opens the Type dropdown of the S-Group Properties dialog
- **THEN** the options read _Multiple group (#)_, _SRU polymer (n)_ and _Copolymer (co)_, and the other types are unchanged
- **AND** for a Copolymer the Subtype dropdown offers _<Blank>_, _Random (ran)_, _Block (blk)_ and _Alternating (alt)_

#### Scenario: Label at the Copolymer bracket

- **WHEN** a Copolymer S-group is on the canvas
- **THEN** its bracket shows `co` when it has no subtype, and `ran`, `blk` or `alt` for the Random, Block and Alternating subtypes
- **AND** a Multiple group still shows its repeat count, an SRU polymer its polymer label, and Data, Superatom, Query component and Nucleotide component S-groups are unchanged

#### Scenario: Saved values stay standard

- **WHEN** a Copolymer is saved to KET or a molfile and opened again
- **THEN** its subtype is still written as `RAN`, `BLO` or `ALT`, and after reopening the bracket and the dialog show the same subtype

## User interaction

- **Templates** — the _Templates_ toolbar and the _Structure Library_ (`Shift+t`) provide rings and predefined structures. Click canvas to place, click an atom for a fused structure, or click/drag on a bond for bond-to-bond fusion. Users can save custom templates (name + default attachment atom/bond) into _User Templates_.
- **Functional Groups** — the _Functional Groups_ library tab (`Shift+f`) inserts predefined groups. They can replace an atom, be dropped on the canvas, or be joined by dragging a single bond. Groups are abbreviated to a label and can be **Expanded**, **Contracted**, or have their **Abbreviation Removed** from the right-click menu.
- **R-Groups (Markush)** — the _R-Group_ toolbox: _R-Group Label_, _R-Group Fragment_, and _Attachment Point_ tools, plus _R-Group Logic_ (occurrence, RestH, If-R(i)-Then conditions).
- **S-Groups** — the _S-Group tool_ (`Mod+g`) marks a fragment as Data, Multiple group, SRU Polymer, Copolymer, Superatom, Query component, or Nucleotide Component.

## Guarantees

- Functional groups and Superatom S-Groups can only be selected/moved/deleted as a whole; their chemical meaning is preserved when contracted.
- Templates keep the initial structure's bond lengths on fusion.
- Functional groups are treated as super atoms when opening/saving `.mol` files.
