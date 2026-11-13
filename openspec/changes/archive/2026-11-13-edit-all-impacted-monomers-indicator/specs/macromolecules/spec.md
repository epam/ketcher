## MODIFIED Requirements

### Requirement: Editing canvas monomers

The system SHALL ensure that _Edit Monomer_ and _Edit All [code] (count)_ appear above _Delete_; and hovering _Edit All_ marks the affected instances with the same indicator as _Modify amino acids_; saving replaces those instances with the new library monomer; and both editing options remain visible but disabled for sequence symbols representing multiple monomers.

#### Scenario: Editing canvas monomers

- **WHEN** the user right-clicks a single monomer or a sequence symbol representing one monomer
- **THEN** _Edit Monomer_ and _Edit All [code] (count)_ appear above _Delete_
- **AND** hovering _Edit All_ marks the affected instances; saving replaces those instances with the new library monomer
- **AND** both editing options remain visible but disabled for sequence symbols representing multiple monomers

#### Scenario: Indicating the monomers Edit All will change

- **WHEN** the user hovers an enabled _Edit All [code] (count)_ option
- **THEN** every monomer it will edit is marked with the _Modify amino acids_ indicator: a ring around the monomer in Flex and Snake modes, a highlighted tile behind its symbol in Sequence mode
- **AND** no other monomer is marked, and the monomers' own hover state does not change
- **AND** the marks disappear when the pointer leaves the option, when the menu closes, or when the option is chosen
