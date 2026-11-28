## ADDED Requirements

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
