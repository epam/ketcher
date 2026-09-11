## ADDED Requirements

### Requirement: A duplex selection is editable through both replacement paths

The system SHALL allow a selection that covers part of a double-stranded sequence to be modified through the RNA Builder and through the monomer library. The presence of an antisense partner SHALL NOT by itself disable the "Modify in RNA Builder..." action, and SHALL NOT by itself cause a library replacement to be refused. Only the both-strands-of-a-pair rule specified below refuses these edits, and it SHALL report its reason rather than failing silently.

#### Scenario: RNA Builder is available on a duplex

- **WHEN** the user selects one or more nucleotides on one strand of a duplex
- **AND** opens the sequence context menu
- **THEN** the "Modify in RNA Builder..." action is enabled

#### Scenario: Library replacement acts on a duplex

- **WHEN** the user selects one or more nucleotides on one strand of a duplex
- **AND** clicks a monomer in the library to replace the selection
- **THEN** the replacement is applied

#### Scenario: A refused edit explains itself

- **WHEN** a replacement is refused because the selection spans both strands of an H-bonded pair
- **THEN** an error message is shown
- **AND** the canvas is left unchanged

### Requirement: The strand that changes is the strand that was selected

When the user modifies a selection through the RNA Builder or the monomer library, the system SHALL apply the modification to the strand whose monomers are selected, and SHALL NOT apply it to the opposite strand except through the propagation specified below.

#### Scenario: An antisense selection edits the antisense strand

- **WHEN** the user selects a nucleotide on the antisense strand of a duplex
- **AND** modifies its base through the RNA Builder or replaces it through the library
- **THEN** the antisense nucleotide is the one that changes
- **AND** the sense nucleotide at the same position is not directly modified

#### Scenario: The RNA Builder shows the selected strand's symbols

- **WHEN** the user selects a nucleotide on the antisense strand and opens the RNA Builder
- **THEN** the sugar, base and phosphate sections show that antisense nucleotide's symbols

#### Scenario: The backbone survives an antisense replacement

- **WHEN** a nucleotide in the middle of an antisense strand is replaced through the library
- **THEN** the new monomer is connected to the same antisense neighbors the replaced node had
- **AND** the antisense strand remains a single chain

### Requirement: Base replacement propagates to the paired strand

When sync editing is on in sequence layout mode and a base is replaced, the system SHALL rewrite the H-bonded base on the opposite strand so the pair remains complementary, provided the replacement changes the base's natural analogue and the opposite base is not itself selected. This applies to both the RNA Builder update flow and the select-and-replace-from-library flow.

#### Scenario: Replacement changes the natural analogue

- **WHEN** sync editing is on
- **AND** the user replaces a selected nucleotide or nucleoside base whose opposite base is H-bonded to it and is not selected
- **AND** the replacement changes the base's natural analogue
- **THEN** the opposite base is replaced by the complement of the new natural analogue
- **AND** both changes are applied as a single undo step

#### Scenario: Replacement preserves the natural analogue

- **WHEN** the user replaces a base with a different modification of the same natural analogue, for example cytosine with 5-methylcytosine
- **THEN** the opposite base is left unchanged

#### Scenario: Opposite base is itself selected

- **WHEN** the selection contains both a base and the base it is H-bonded to
- **THEN** no propagation is applied for that pair

#### Scenario: Editing the antisense strand mirrors back to the sense strand

- **WHEN** sync editing is on
- **AND** the user replaces a base on the antisense strand such that its natural analogue changes
- **AND** the paired sense base is H-bonded to it and is not selected
- **THEN** the paired sense base is rewritten to the complement of the new natural analogue
- **AND** the complement table is chosen from the sense nucleotide's own sugar
- **AND** both changes are applied as a single undo step

#### Scenario: No paired base exists

- **WHEN** the replaced base has no hydrogen bond to a base on another strand
- **THEN** only the selected base is replaced and nothing else changes

#### Scenario: Non-sync mode leaves the opposite strand alone

- **WHEN** sync editing is off
- **AND** the user replaces a base through the RNA Builder or through the library
- **THEN** the opposite strand is unchanged

### Requirement: The complement table is chosen by the paired nucleotide's sugar

When the system rewrites a paired base, it SHALL select the DNA complement table when the opposite nucleotide's sugar is deoxyribose and the RNA complement table otherwise.

#### Scenario: Paired nucleotide carries deoxyribose

- **WHEN** a sense base is replaced such that its new natural analogue is adenine
- **AND** the opposite nucleotide's sugar is deoxyribose
- **THEN** the opposite base becomes thymine

#### Scenario: Paired nucleotide carries ribose

- **WHEN** a sense base is replaced such that its new natural analogue is adenine
- **AND** the opposite nucleotide's sugar is not deoxyribose
- **THEN** the opposite base becomes uracil

#### Scenario: Paired nucleotide keeps its own sugar and phosphate

- **WHEN** a paired base is rewritten
- **THEN** only the base of the opposite nucleotide changes
- **AND** its sugar and phosphate are unchanged

### Requirement: Modifications on the rewritten base are not preserved

When the system rewrites a paired base that carried a modification, it SHALL replace it with the plain natural complement.

#### Scenario: Modified base is reset to its natural complement

- **WHEN** the opposite base is a modified base such as 5-methylcytosine
- **AND** the sense change requires that base to become a different natural analogue
- **THEN** the opposite base becomes the unmodified complement and the modification is discarded

### Requirement: Base modification is blocked when a selection spans both strands of a pair

When sync editing is on and a selection contains at least one pair of H-bonded sense and antisense bases, where each such base connects through R1 to R3 to a sugar that has at least one backbone connection, the system SHALL block base modification and SHALL report the reason. The bases do not have to be complementary, only opposite one another. When sync editing is off, base modification SHALL NOT be blocked, since that is the mode the error message directs the user to.

#### Scenario: All selected bases are identical

- **WHEN** sync editing is on
- **AND** the selection contains at least one H-bonded sense/antisense base pair
- **AND** every selected base is the same symbol
- **THEN** the RNA Builder bases section shows that symbol
- **AND** clicking the bases section disables every base in the library
- **AND** the error message "Modification of bases is disabled in sync mode when both the sense and antisense strands are selected. Go to non-sync mode for base modification." is shown

#### Scenario: Selected bases differ

- **WHEN** sync editing is on
- **AND** the selection contains at least one H-bonded sense/antisense base pair
- **AND** the selected bases are not all the same symbol
- **THEN** the RNA Builder bases section shows `[disabled]` rather than `[multiple]`
- **AND** clicking the bases section disables every base in the library and shows the same error message

#### Scenario: Sugar and phosphate stay editable

- **WHEN** the bases section is blocked
- **THEN** the sugar and phosphate sections of the RNA Builder remain fully editable

#### Scenario: Library replace is blocked the same way

- **WHEN** sync editing is on
- **AND** the selection contains at least one H-bonded sense/antisense base pair
- **AND** the user clicks a base in the monomer library to replace the selection
- **THEN** the replacement is refused
- **AND** the same error message is shown

#### Scenario: Non-sync mode allows the modification

- **WHEN** sync editing is off
- **AND** the selection contains at least one H-bonded sense/antisense base pair
- **THEN** base modification is not blocked in the RNA Builder or through the library
- **AND** the bases section behaves normally, showing `[multiple]` when the selected bases differ
- **AND** each selected base is replaced without any change to the opposite strand

#### Scenario: Only one strand selected

- **WHEN** the selection covers bases on one strand only, even though those bases are H-bonded to an unselected opposite strand
- **THEN** base modification is not blocked
- **AND** the normal propagation behavior applies
