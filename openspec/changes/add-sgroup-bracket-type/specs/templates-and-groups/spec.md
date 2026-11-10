# Spec Delta

## ADDED Requirements

### Requirement: S-group bracket type picker

The system SHALL provide a horizontal "Bracket type" radio picker with square `[ ]`, round `( )`, and curly `{ }` options, in that order, below the existing fields in the supported non-DATA S-Group Properties dialogs. Exactly one option SHALL be selected for each supported pair. Existing property validation SHALL remain unchanged.

#### Scenario: Picker for supported dialog types

- **WHEN** the user creates or edits a Multiple group, SRU polymer, Copolymer, Superatom, Query component, or Nucleotide Component
- **THEN** the properties dialog shows the three-option picker below the existing type-specific fields
- **AND** its layout follows the UX attached to #10469

#### Scenario: DATA remains unchanged

- **WHEN** the user selects the DATA S-group type
- **THEN** no bracket-type picker is shown
- **AND** the DATA fields and validation behave as before

#### Scenario: Keyboard and accessible selection

- **WHEN** the user focuses the bracket picker and selects an option using the keyboard
- **THEN** the option becomes the sole selected option
- **AND** the group and each option expose accessible names identifying their meaning

### Requirement: Default and existing S-group bracket styles

The system SHALL select square brackets for a newly created S-group and for an existing group without stored bracket data. When editing a group whose represented brackets share a supported type, the picker SHALL select that type.

#### Scenario: New group default

- **WHEN** the user opens a properties dialog to create a non-DATA S-group
- **THEN** square brackets are selected without requiring a user action

#### Scenario: Editing an existing styled group

- **WHEN** the user opens properties for a group stored with square, round, or curly brackets
- **THEN** the corresponding option is selected
- **AND** applying an unrelated property edit preserves the bracket style

#### Scenario: Legacy group default

- **WHEN** the user edits a group loaded without a stored bracket style
- **THEN** square brackets are selected

### Requirement: Reversible bracket style edits

The system SHALL apply bracket style through the existing S-group editing history. Cancelling a dialog SHALL leave the group unchanged. Undo and redo SHALL restore the previous and applied styles, respectively. Cloning or copying a group SHALL preserve its style.

#### Scenario: Apply and reopen

- **WHEN** the user selects a different bracket style, applies the dialog, and reopens properties
- **THEN** the selected style is applied and shown in the picker
- **AND** both opening and closing brackets use that style without changing either stored position
- **AND** the group's other properties and membership are preserved

#### Scenario: Cancel a pending style change

- **WHEN** the user selects a different style and cancels the dialog
- **THEN** the canvas and stored group retain their original style

#### Scenario: Undo and redo

- **WHEN** the user changes a group's bracket style and then performs undo followed by redo
- **THEN** undo restores the original style and redo restores the chosen style
- **AND** both canvas rendering and reopened properties reflect the restored state

#### Scenario: Copy a styled group

- **WHEN** the user copies and pastes an S-group with a supported bracket style
- **THEN** the pasted group retains that style

### Requirement: Canvas bracket shape rendering

The system SHALL render supported bracket pairs using their stored types and supplied positions when both positions have non-zero length in both editor canvas pipelines, and SHALL anchor labels to the closing bracket when the pair is drawn. Automatic placement SHALL separate visible same-atom groups in hierarchy order.

#### Scenario: Render the selected shape

- **WHEN** a visible S-group has a uniform square, parenthetic, or curly bracket pair
- **THEN** both canvas brackets show the corresponding shape
- **AND** opening the same KET in either editor mode preserves those shapes wherever brackets are displayed

#### Scenario: Render supplied bracket positions

- **WHEN** a visible S-group has non-zero-length positions for both brackets
- **THEN** each bracket is drawn at its supplied position, regardless of endpoint order
- **AND** the group's label is anchored to the closing bracket
- **AND** automatically separating same-atom peers does not move an explicitly positioned bracket

#### Scenario: Automatic placement without stored positions

- **WHEN** a visible S-group has no stored bracket positions
- **THEN** a pair is drawn using the existing automatic placement rules
- **AND** the pair uses its stored type, or square when no type is stored

### Requirement: Do not draw a pair with a zero-length position

When either opening or closing position has identical start and end points, the system SHALL draw no brackets for that S-group in either editor canvas pipeline. It SHALL NOT substitute an automatically positioned pair or discard the group because of those positions.

#### Scenario: Only the opening bracket is stored as a point

- **WHEN** opening has start and end at `(1, 1)` and closing runs from `(3, 0)` to `(3, 1)`
- **THEN** neither bracket is drawn in either canvas pipeline
- **AND** no automatic replacement pair is drawn
- **AND** the S-group, its atoms, and both bracket positions remain present

#### Scenario: Only the closing bracket is stored as a point

- **WHEN** opening runs from `(2, 0)` to `(2, 1)` and closing has start and end at `(3, 3)`
- **THEN** neither bracket is drawn in either canvas pipeline
- **AND** no automatic replacement pair is drawn
- **AND** the S-group, its atoms, and both bracket positions remain present

#### Scenario: Both brackets are stored as points

- **WHEN** opening has start and end at `(0, 0)` and closing also has start and end at `(0, 0)`
- **THEN** neither bracket is drawn in either canvas pipeline
- **AND** no automatic replacement pair is drawn
- **AND** the S-group, its atoms, and its bracket data remain present

### Requirement: Preserve automatic bracket layout and manipulation

The system SHALL retain existing automatic placement and manipulation rules for supported bracket styles, including hierarchy-ordered separation of visible same-atom groups. Invalidating stored positions after an atom edit SHALL restore automatic placement while retaining types.

#### Scenario: Restore automatic placement after an atom edit

- **WHEN** the user moves an atom of a group or changes its atom membership
- **THEN** the group's stored positions are dropped and its brackets use automatic placement
- **AND** their individual types remain unchanged
- **AND** undo restores the previous positions and types

#### Scenario: Existing square rendering

- **WHEN** a group uses automatic placement, uses square brackets or has no stored bracket style, and has no visible same-atom bracketed peer
- **THEN** its bracket geometry and label placement match existing square-bracket behavior

#### Scenario: Distinguish groups with the same atoms

- **WHEN** two or more visible bracketed S-groups using automatic placement contain exactly the same set of atoms
- **THEN** each group has its own visibly separated bracket pair in hierarchy order in both canvas pipelines
- **AND** each pair shows that group's chosen style, labels, and icons
- **AND** selecting or hovering a group follows its displayed bracket position

#### Scenario: Reflow after group visibility or history changes

- **WHEN** one of several same-atom S-groups is added, removed, contracted, expanded, undone, or redone
- **THEN** the visible bracket pairs are recalculated without overlapping
- **AND** a remaining group without a visible same-atom peer returns to its original placement
- **AND** DATA and other groups without visible brackets, including pairs suppressed by a zero-length position, do not create an empty bracket position

#### Scenario: Positioning and manipulation

- **WHEN** the user switches a visible group's style and then moves, rotates, selects, or nests the group
- **THEN** the same bracket placement and manipulation rules apply as for square brackets, including the same-atom separation above
- **AND** atoms, bonds, repeat counts, connectivity, and group membership do not change merely because of the style selection

#### Scenario: Collapsed and expanded superatoms

- **WHEN** a superatom with a chosen style is contracted and then expanded
- **THEN** existing bracket visibility rules remain unchanged
- **AND** the style is retained for the next state in which brackets are visible
