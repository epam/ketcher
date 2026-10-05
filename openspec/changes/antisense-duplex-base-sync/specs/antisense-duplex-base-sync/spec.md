## ADDED Requirements

### Requirement: The edited strand is read from the selection itself

Whether a position's sense monomer, its antisense monomer, or both are being edited SHALL be decided from which of them are actually selected. The system SHALL NOT keep a separate record of the strand a selection gesture was aimed at, and SHALL NOT treat a selected monomer as unselected because of how the selection was made.

Gestures differ in what they select, and the rule follows what they select rather than which row the pointer was on:

- Dragging over symbols on one row in view mode selects only the symbols it covers, so it selects one strand.
- Shift+drag adds the symbols it covers to the existing selection, so it can select unpaired symbols on both rows.
- Clicking a symbol, shift-clicking, select-all, and every selection made in edit mode (dragging between symbols, or shift with the arrow keys) select both strands of each position they touch.

#### Scenario: Dragging over one row in view mode

- **WHEN** the user drags over symbols on the antisense row of a duplex in view mode
- **THEN** only those antisense monomers are selected
- **AND** a base modification edits the antisense strand

#### Scenario: Shift+drag adds symbols on the other row

- **WHEN** the user drags over symbols on the sense row and then shift+drags over symbols on the antisense row that are not paired with them
- **THEN** both sets of symbols are selected
- **AND** no selected base has its H-bonded partner selected

#### Scenario: Clicking a symbol selects both strands

- **WHEN** the user clicks a symbol on either row of a duplex
- **THEN** the sense and antisense monomers at that position are both selected
- **AND** the position is treated as a selected H-bonded pair

#### Scenario: Selecting in edit mode selects both strands

- **WHEN** the user selects a range in edit mode, by dragging between symbols or with shift and the arrow keys
- **THEN** both strands of every position in the range are selected
- **AND** each such position is treated as a selected H-bonded pair, whichever row the caret was on

### Requirement: A duplex selection is editable through both replacement paths

The system SHALL allow a selection that covers part of a double-stranded sequence to be modified through the RNA Builder and through the monomer library. Replacement from the library SHALL include replacing the selection with a preset, on the same terms as replacing it with a single monomer. The presence of an antisense partner SHALL NOT by itself disable the "Modify in RNA Builder..." action, and SHALL NOT by itself cause a library replacement to be refused. Only the selected-pair rule specified below refuses these edits, and it SHALL report its reason rather than failing silently.

#### Scenario: RNA Builder is available on a duplex

- **WHEN** the user selects one or more nucleotides on one strand of a duplex
- **AND** opens the sequence context menu
- **THEN** the "Modify in RNA Builder..." action is enabled

#### Scenario: Library replacement acts on a duplex

- **WHEN** the user selects one or more nucleotides on one strand of a duplex
- **AND** clicks a monomer in the library to replace the selection
- **THEN** the replacement is applied

#### Scenario: A refused edit explains itself

- **WHEN** a replacement is refused because the selection contains both bases of an H-bonded pair
- **THEN** an error message is shown
- **AND** the canvas is left unchanged

#### Scenario: Preset replacement acts on a duplex

- **WHEN** the user selects one or more nucleotides on one strand of a duplex
- **AND** clicks a preset in the library to replace the selection
- **THEN** the replacement is applied to the selected strand
- **AND** the opposite strand's nucleotides are not replaced

#### Scenario: Preset replacement on a sense-only selection in non-sync mode

- **WHEN** sync editing is off
- **AND** the user selects nucleotides on the sense strand of a duplex and clicks a preset
- **THEN** the replacement is applied
- **AND** the antisense strand is unchanged

### Requirement: The strand that changes is the strand that is selected

When the user modifies a selection through the RNA Builder or the monomer library, the system SHALL apply the modification to the selected monomers, and SHALL NOT apply it to an unselected monomer on the opposite strand except through the propagation specified below.

#### Scenario: An antisense selection edits the antisense strand

- **WHEN** the user selects a nucleotide on the antisense strand of a duplex, and not its sense partner
- **AND** modifies its base through the RNA Builder or replaces it through the library
- **THEN** the antisense nucleotide is the one that changes
- **AND** the sense nucleotide at the same position is not directly modified

#### Scenario: A one-strand selection counts N

- **WHEN** the user selects N nucleotides on one strand of a duplex
- **THEN** the sequence context menu title names N nucleotides
- **AND** the update modifies N nucleotides directly

#### Scenario: A both-strands selection counts every selected nucleotide

- **WHEN** the user's selection covers both strands of N positions
- **THEN** the sequence context menu title names 2N nucleotides

#### Scenario: The RNA Builder shows the selected strand's symbols

- **WHEN** the user selects a nucleotide on the antisense strand only and opens the RNA Builder
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

When sync editing is on in sequence layout mode and a selected base is replaced, the system SHALL rewrite the H-bonded base on the opposite strand so the pair remains complementary, provided the replacement changes the base's natural analogue and the opposite base is not itself selected. The decision is made separately for each selected base. This applies to both the RNA Builder update flow and the select-and-replace-from-library flow.

#### Scenario: Replacement changes the natural analogue

- **WHEN** sync editing is on
- **AND** the user replaces the base of a selected nucleotide or nucleoside whose opposite base is H-bonded to it
- **AND** the opposite base is not selected
- **AND** the replacement changes the base's natural analogue
- **THEN** the opposite base is replaced by the complement of the new natural analogue
- **AND** both changes are applied as a single undo step

#### Scenario: Replacement with a preset changes the natural analogue

- **WHEN** sync editing is on
- **AND** the opposite base is not selected
- **AND** the user replaces a selected nucleotide with a preset whose base has a different natural analogue
- **THEN** the opposite base is replaced by the complement of the preset's natural analogue
- **AND** both changes are applied as a single undo step

#### Scenario: Unpaired selections on both rows each mirror their own partner

- **WHEN** sync editing is on
- **AND** the selection holds sense bases and antisense bases, none of them H-bonded to another selected base
- **AND** the user replaces them such that their natural analogues change
- **THEN** each selected base's opposite base is rewritten to its complement
- **AND** all changes are applied as a single undo step

#### Scenario: Replacement preserves the natural analogue

- **WHEN** the user replaces a base with a different modification of the same natural analogue, for example cytosine with 5-methylcytosine
- **THEN** the opposite base is left unchanged

#### Scenario: Replacement with a preset preserving the natural analogue

- **WHEN** the user replaces a selected nucleotide with a preset whose base has the same natural analogue as the one it replaces
- **THEN** the opposite base is left unchanged

#### Scenario: A preset with no base

- **WHEN** the user replaces a selected nucleotide with a preset that has no base
- **THEN** the selected strand is replaced
- **AND** the opposite base is left unchanged

#### Scenario: A change that alters nothing adds nothing to history

- **WHEN** a replacement leaves the opposite strand unchanged
- **THEN** no empty entry is added to the undo history for the opposite strand

#### Scenario: The opposite base is selected too

- **WHEN** the opposite base is itself selected
- **THEN** no propagation is applied to it

#### Scenario: Editing the antisense strand mirrors back to the sense strand

- **WHEN** sync editing is on
- **AND** the user replaces a selected antisense base such that its natural analogue changes
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
- **AND** only the selected monomers are modified

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

### Requirement: The update confirmation names the additional nucleotides

Before the RNA Builder applies an update, the confirmation SHALL state how many nucleotides the user is modifying directly (n) and, when propagation will rewrite any unselected opposite bases, how many of those will change (m). m SHALL count only opposite bases that the update will actually rewrite, so it SHALL agree with the result of confirming.

The confirmation SHALL be shown when n is greater than 1 or m is greater than 0. Otherwise the update SHALL be applied without a confirmation, as before.

#### Scenario: The update will change additional nucleotides

- **WHEN** sync editing is on
- **AND** the user confirms an RNA Builder edit of n selected nucleotides that will rewrite m unselected opposite bases, with m greater than 0
- **THEN** the confirmation reads "You are going to modify n nucleotides, and that will change m additional nucleotides. Are you sure?"

#### Scenario: The update changes nothing beyond the selection

- **WHEN** an RNA Builder edit of n selected nucleotides, with n greater than 1, will rewrite no opposite base
- **THEN** the confirmation reads "You are going to modify n nucleotides. Are you sure?"

#### Scenario: A single nucleotide whose partner will change

- **WHEN** sync editing is on
- **AND** the user edits one selected nucleotide in the RNA Builder such that its unselected H-bonded partner will be rewritten
- **THEN** the confirmation is shown, reading "You are going to modify 1 nucleotides, and that will change 1 additional nucleotides. Are you sure?"

#### Scenario: A single nucleotide with nothing to propagate

- **WHEN** the user edits one selected nucleotide in the RNA Builder and no opposite base will be rewritten
- **THEN** the update is applied without a confirmation

#### Scenario: Cancelling changes nothing

- **WHEN** the confirmation is shown and the user cancels
- **THEN** neither strand is modified

#### Scenario: m excludes partners that already match

- **WHEN** an edit changes a base's natural analogue
- **AND** its unselected partner already carries the resulting complement
- **THEN** that partner is not counted in m

### Requirement: Base modification is blocked when the selection holds both bases of a pair

When sync editing is on and the selection contains at least one pair of H-bonded sense and antisense bases that are both selected, where each such base connects through R1 to R3 to a sugar that has at least one backbone connection, the system SHALL block base modification and SHALL report the reason. The bases do not have to be complementary, only opposite one another. When sync editing is off, base modification SHALL NOT be blocked, since that is the mode the error message directs the user to.

The block SHALL apply to every way of setting a new base, whatever the edit came from: the RNA Builder, and a library replacement with any item that carries a base — a base monomer, an unsplit nucleotide, or a preset that has a base. A library item that sets no base SHALL NOT be blocked. The refusal SHALL be reported before any confirmation dialog the replacement would otherwise raise, and SHALL leave the canvas unchanged.

A selection that holds bases on both strands, none of which has its H-bonded partner selected, SHALL NOT be blocked.

#### Scenario: All selected bases are identical

- **WHEN** sync editing is on
- **AND** the selection contains at least one H-bonded sense/antisense base pair with both bases selected
- **AND** every selected base is the same symbol
- **THEN** the RNA Builder bases section shows that symbol
- **AND** clicking the bases section disables every base in the library
- **AND** the error message "Modification of bases is disabled in sync mode when both the sense and antisense strands are selected. Go to non-sync mode for base modification." is shown

#### Scenario: Selected bases differ

- **WHEN** sync editing is on
- **AND** the selection contains at least one H-bonded sense/antisense base pair with both bases selected
- **AND** the selected bases are not all the same symbol
- **THEN** the RNA Builder bases section shows `[disabled]` rather than `[multiple]`
- **AND** clicking the bases section disables every base in the library and shows the same error message

#### Scenario: A selection made in edit mode is blocked

- **WHEN** sync editing is on
- **AND** the user selects a range across a duplex in edit mode
- **THEN** base modification is blocked in the RNA Builder and through the library
- **AND** the same error message is shown

#### Scenario: Sugar and phosphate stay editable

- **WHEN** the bases section is blocked
- **THEN** the sugar and phosphate sections of the RNA Builder remain fully editable

#### Scenario: Library replace is blocked the same way

- **WHEN** sync editing is on
- **AND** the selection contains at least one H-bonded sense/antisense base pair with both bases selected
- **AND** the user clicks a base in the monomer library to replace the selection
- **THEN** the replacement is refused
- **AND** the same error message is shown

#### Scenario: Replacing with an unsplit nucleotide is blocked the same way

- **WHEN** sync editing is on
- **AND** the selection contains at least one H-bonded sense/antisense base pair with both bases selected
- **AND** the user clicks an unsplit nucleotide in the library to replace the selection
- **THEN** the replacement is refused
- **AND** the same error message is shown
- **AND** neither strand is modified

#### Scenario: Replacing with a preset is blocked the same way

- **WHEN** sync editing is on
- **AND** the selection contains at least one H-bonded sense/antisense base pair with both bases selected
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
- **AND** the selection contains at least one H-bonded sense/antisense base pair with both bases selected
- **AND** the user clicks a sugar, a phosphate or a CHEM monomer in the library
- **THEN** the replacement is not blocked by this rule

#### Scenario: Non-sync mode allows the modification

- **WHEN** sync editing is off
- **AND** the selection contains both bases of an H-bonded pair
- **THEN** base modification is not blocked in the RNA Builder or through the library
- **AND** the bases section behaves normally, showing `[multiple]` when the selected bases differ
- **AND** each selected base is replaced without any change to an unselected base on the opposite strand

#### Scenario: Unpaired selections on both rows are not blocked

- **WHEN** sync editing is on
- **AND** the selection holds bases on both strands
- **AND** no selected base has its H-bonded partner selected
- **THEN** base modification is not blocked
- **AND** the normal propagation behavior applies

### Requirement: The refusal message fits its container

The error message shown when base modification is refused SHALL be fully readable. The container SHALL grow to fit the text rather than clipping it or overlapping neighboring content.

#### Scenario: The mandated message is displayed in full

- **WHEN** the base modification refusal message is shown
- **THEN** the whole message is legible
- **AND** no part of it is clipped or overlapped
