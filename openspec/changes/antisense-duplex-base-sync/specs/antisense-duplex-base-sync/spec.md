## ADDED Requirements

### Requirement: The targeted strand is tracked separately from the selection

Selection in sequence layout mode is column-based. Several gestures put both strands of a two-stranded position into the selection regardless of which strand the user acted on, and the sense strand is always among them. Selection state therefore cannot answer which strand the user meant to edit, and the system SHALL track that answer separately.

The system SHALL record, for the gesture that produced the current selection, which strand it targeted: the sense strand, the antisense strand, or both. Base replacement SHALL consult that record rather than inferring the strand from which monomers are selected.

A gesture SHALL be recorded as targeting both strands only when it genuinely reaches both, such as a selection rectangle that covers both rows or a select-all. A gesture that acts on one row SHALL be recorded as targeting that row's strand, even though the selection it produces also contains the opposite strand.

#### Scenario: Clicking a symbol on the sense strand

- **WHEN** the user clicks a symbol on the sense row of a duplex
- **THEN** the targeted strand is the sense strand
- **AND** this holds even though the antisense monomer at that position is also selected

#### Scenario: Clicking a symbol on the antisense strand

- **WHEN** the user clicks a symbol on the antisense row of a duplex
- **THEN** the targeted strand is the antisense strand

#### Scenario: Dragging a selection along one row in edit mode

- **WHEN** the user places the caret between symbols and drags a selection along one row
- **THEN** the targeted strand is the strand of the row the drag began on

#### Scenario: A selection rectangle covering both rows

- **WHEN** the user drags a selection rectangle that covers symbols on both rows
- **THEN** both strands are targeted

#### Scenario: The record survives the RNA Builder round trip

- **WHEN** the user selects nodes, opens the RNA Builder, changes a base and confirms
- **THEN** the replacement uses the strand recorded by the original selection gesture

### Requirement: A duplex selection is editable through both replacement paths

The system SHALL allow a selection that covers part of a double-stranded sequence to be modified through the RNA Builder and through the monomer library. Replacement from the library SHALL include replacing the selection with a preset, on the same terms as replacing it with a single monomer. The presence of an antisense partner SHALL NOT by itself disable the "Modify in RNA Builder..." action, and SHALL NOT by itself cause a library replacement to be refused. Only the both-strands-targeted rule specified below refuses these edits, and it SHALL report its reason rather than failing silently.

#### Scenario: RNA Builder is available on a duplex

- **WHEN** the user selects one or more nucleotides on one strand of a duplex
- **AND** opens the sequence context menu
- **THEN** the "Modify in RNA Builder..." action is enabled

#### Scenario: Library replacement acts on a duplex

- **WHEN** the user selects one or more nucleotides on one strand of a duplex
- **AND** clicks a monomer in the library to replace the selection
- **THEN** the replacement is applied

#### Scenario: A refused edit explains itself

- **WHEN** a replacement is refused because the gesture targeted both strands
- **THEN** an error message is shown
- **AND** the canvas is left unchanged

#### Scenario: Preset replacement acts on a duplex

- **WHEN** the user selects one or more nucleotides on one strand of a duplex
- **AND** clicks a preset in the library to replace the selection
- **THEN** the replacement is applied to the targeted strand
- **AND** the opposite strand's nucleotides are not replaced

#### Scenario: Preset replacement on a sense-only selection in non-sync mode

- **WHEN** sync editing is off
- **AND** the user selects nucleotides on the sense strand of a duplex and clicks a preset
- **THEN** the replacement is applied
- **AND** the antisense strand is unchanged

### Requirement: The strand that changes is the strand the gesture targeted

When the user modifies a selection through the RNA Builder or the monomer library, the system SHALL apply the modification to the targeted strand, and SHALL NOT apply it to the opposite strand except through the propagation specified below.

The system SHALL apply the modification once per selected position, not once per strand. A position whose two strands are both selected SHALL yield one edit, on the targeted strand.

#### Scenario: An antisense selection edits the antisense strand

- **WHEN** the user targets a nucleotide on the antisense strand of a duplex
- **AND** modifies its base through the RNA Builder or replaces it through the library
- **THEN** the antisense nucleotide is the one that changes
- **AND** the sense nucleotide at the same position is not directly modified

#### Scenario: Every count names the targeted positions

- **WHEN** the user targets N positions on one strand of a duplex
- **THEN** the sequence context menu title names N nucleotides, not 2N
- **AND** the RNA Builder confirmation before updating the sequence names N nucleotides, not 2N
- **AND** the update modifies N nucleotides

#### Scenario: The RNA Builder shows the targeted strand's symbols

- **WHEN** the user targets a nucleotide on the antisense strand and opens the RNA Builder
- **THEN** the sugar, base and phosphate sections show that antisense nucleotide's symbols

#### Scenario: The backbone survives an antisense replacement

- **WHEN** a nucleotide in the middle of an antisense strand is replaced through the library
- **THEN** the new monomer is connected to the same antisense neighbors the replaced node had
- **AND** the antisense strand remains a single chain

#### Scenario: The backbone survives an antisense preset replacement

- **WHEN** a nucleotide in the middle of an antisense strand is replaced with a preset
- **THEN** the preset's monomers are connected to the same antisense neighbors the replaced node had
- **AND** the antisense strand remains a single chain
- **AND** the hydrogen bond to the opposite strand is carried over to the preset's base

### Requirement: Base replacement propagates to the paired strand

When sync editing is on in sequence layout mode and a base is replaced, the system SHALL rewrite the H-bonded base on the opposite strand so the pair remains complementary, provided the replacement changes the base's natural analogue and the gesture targeted one strand only. This applies to both the RNA Builder update flow and the select-and-replace-from-library flow.

#### Scenario: Replacement changes the natural analogue

- **WHEN** sync editing is on
- **AND** the user replaces the base of a targeted nucleotide or nucleoside whose opposite base is H-bonded to it
- **AND** the gesture targeted one strand only
- **AND** the replacement changes the base's natural analogue
- **THEN** the opposite base is replaced by the complement of the new natural analogue
- **AND** both changes are applied as a single undo step

#### Scenario: Replacement with a preset changes the natural analogue

- **WHEN** sync editing is on
- **AND** the gesture targeted one strand only
- **AND** the user replaces a targeted nucleotide with a preset whose base has a different natural analogue
- **THEN** the opposite base is replaced by the complement of the preset's natural analogue
- **AND** both changes are applied as a single undo step

#### Scenario: Replacement preserves the natural analogue

- **WHEN** the user replaces a base with a different modification of the same natural analogue, for example cytosine with 5-methylcytosine
- **THEN** the opposite base is left unchanged

#### Scenario: Replacement with a preset preserving the natural analogue

- **WHEN** the user replaces a targeted nucleotide with a preset whose base has the same natural analogue as the one it replaces
- **THEN** the opposite base is left unchanged

#### Scenario: A preset with no base

- **WHEN** the user replaces a targeted nucleotide with a preset that has no base
- **THEN** the targeted strand is replaced
- **AND** the opposite base is left unchanged

#### Scenario: A change that alters nothing adds nothing to history

- **WHEN** a replacement leaves the opposite strand unchanged
- **THEN** no empty entry is added to the undo history for the opposite strand

#### Scenario: Both strands targeted

- **WHEN** the gesture targeted both strands
- **THEN** no propagation is applied

#### Scenario: Editing the antisense strand mirrors back to the sense strand

- **WHEN** sync editing is on
- **AND** the user replaces a base on the targeted antisense strand such that its natural analogue changes
- **AND** the paired sense base is H-bonded to it
- **THEN** the paired sense base is rewritten to the complement of the new natural analogue
- **AND** the complement table is chosen from the sense nucleotide's own sugar
- **AND** both changes are applied as a single undo step

#### Scenario: No paired base exists

- **WHEN** the replaced base has no hydrogen bond to a base on another strand
- **THEN** only the targeted base is replaced and nothing else changes

#### Scenario: Non-sync mode leaves the opposite strand alone

- **WHEN** sync editing is off
- **AND** the user replaces a base through the RNA Builder or through the library
- **THEN** the opposite strand is unchanged
- **AND** only the targeted strand is modified

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

### Requirement: Base modification is blocked when the gesture targets both strands

When sync editing is on and the gesture targeted both strands, and the selection contains at least one pair of H-bonded sense and antisense bases, where each such base connects through R1 to R3 to a sugar that has at least one backbone connection, the system SHALL block base modification and SHALL report the reason. The bases do not have to be complementary, only opposite one another. When sync editing is off, base modification SHALL NOT be blocked, since that is the mode the error message directs the user to.

The block SHALL apply to every way of setting a new base, whatever the edit came from: the RNA Builder, and a library replacement with any item that carries a base — a base monomer, an unsplit nucleotide, or a preset that has a base. A library item that sets no base SHALL NOT be blocked. The refusal SHALL be reported before any confirmation dialog the replacement would otherwise raise, and SHALL leave the canvas unchanged.

A selection that contains both strands only because the gesture targeted one strand SHALL NOT be blocked.

#### Scenario: All selected bases are identical

- **WHEN** sync editing is on
- **AND** the gesture targeted both strands
- **AND** the selection contains at least one H-bonded sense/antisense base pair
- **AND** every selected base is the same symbol
- **THEN** the RNA Builder bases section shows that symbol
- **AND** clicking the bases section disables every base in the library
- **AND** the error message "Modification of bases is disabled in sync mode when both the sense and antisense strands are selected. Go to non-sync mode for base modification." is shown

#### Scenario: Selected bases differ

- **WHEN** sync editing is on
- **AND** the gesture targeted both strands
- **AND** the selection contains at least one H-bonded sense/antisense base pair
- **AND** the selected bases are not all the same symbol
- **THEN** the RNA Builder bases section shows `[disabled]` rather than `[multiple]`
- **AND** clicking the bases section disables every base in the library and shows the same error message

#### Scenario: Sugar and phosphate stay editable

- **WHEN** the bases section is blocked
- **THEN** the sugar and phosphate sections of the RNA Builder remain fully editable

#### Scenario: Library replace is blocked the same way

- **WHEN** sync editing is on
- **AND** the gesture targeted both strands
- **AND** the selection contains at least one H-bonded sense/antisense base pair
- **AND** the user clicks a base in the monomer library to replace the selection
- **THEN** the replacement is refused
- **AND** the same error message is shown

#### Scenario: Replacing with an unsplit nucleotide is blocked the same way

- **WHEN** sync editing is on
- **AND** the gesture targeted both strands
- **AND** the selection contains at least one H-bonded sense/antisense base pair
- **AND** the user clicks an unsplit nucleotide in the library to replace the selection
- **THEN** the replacement is refused
- **AND** the same error message is shown
- **AND** neither strand is modified

#### Scenario: Replacing with a preset is blocked the same way

- **WHEN** sync editing is on
- **AND** the gesture targeted both strands
- **AND** the selection contains at least one H-bonded sense/antisense base pair
- **AND** the user clicks a preset that has a base in the library
- **THEN** the replacement is refused
- **AND** the same error message is shown
- **AND** neither strand is modified

#### Scenario: The refusal precedes any confirmation dialog

- **WHEN** a replacement would be refused by this rule
- **AND** the selection would otherwise raise a confirmation dialog, such as one covering a `@` linker node or a node with side chain connections
- **THEN** the error message is shown without the confirmation dialog appearing first

#### Scenario: A library item that sets no base is not blocked

- **WHEN** sync editing is on
- **AND** the gesture targeted both strands
- **AND** the user clicks a sugar, a phosphate or a CHEM monomer in the library
- **THEN** the replacement is not blocked by this rule

#### Scenario: Non-sync mode allows the modification

- **WHEN** sync editing is off
- **AND** the gesture targeted both strands
- **THEN** base modification is not blocked in the RNA Builder or through the library
- **AND** the bases section behaves normally, showing `[multiple]` when the selected bases differ
- **AND** each targeted base is replaced without any change to the opposite strand

#### Scenario: One strand targeted on a duplex

- **WHEN** the gesture targeted one strand only
- **AND** the selection also contains the H-bonded opposite strand because selection is column-based
- **THEN** base modification is not blocked
- **AND** the normal propagation behavior applies

### Requirement: The refusal message fits its container

The error message shown when base modification is refused SHALL be fully readable. The container SHALL grow to fit the text rather than clipping it or overlapping neighboring content.

#### Scenario: The mandated message is displayed in full

- **WHEN** the base modification refusal message is shown
- **THEN** the whole message is legible
- **AND** no part of it is clipped or overlapped
