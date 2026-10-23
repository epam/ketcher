## ADDED Requirements

### Requirement: Edit Monomer dialog is shown when a tool action targets a single monomer

When a user applies an editing tool (bond, eraser, charge, atom, S-group tool, paste, or a hotkey) to atoms or the group body of a single monomer in molecules mode, the system SHALL display the "Edit Monomer" dialog instead of the "Edit Abbreviation" dialog.

The dialog SHALL have:

- Title: **"Edit Monomer"**
- Body text: `"Edit Monomer" will open the Monomer Creation Wizard and allow editing of this instance of the monomer. "Remove Grouping" will turn the monomer into a purely chemical structure. How do you wish to proceed?`
- Buttons (left-to-right): **Edit Monomer**, **Remove Grouping**, **Cancel** (default / focused)

#### Scenario: Bond tool clicks atom inside a single monomer

- **WHEN** the user activates the bond tool and clicks an atom that belongs to a single MonomerMicromolecule S-group in molecules mode
- **THEN** the "Edit Monomer" dialog is displayed with title "Edit Monomer", the single-monomer body text, and buttons "Edit Monomer", "Remove Grouping", and "Cancel"
- **AND** the "Edit Abbreviation" dialog is NOT shown

#### Scenario: Eraser tool clicks atom inside a single monomer

- **WHEN** the user activates the eraser tool and clicks an atom that belongs to a single MonomerMicromolecule S-group in molecules mode
- **THEN** the "Edit Monomer" dialog is displayed with the single-monomer body text

#### Scenario: Charge tool applied to an atom inside a single monomer

- **WHEN** the user applies a charge change to an atom inside a single MonomerMicromolecule S-group
- **THEN** the "Edit Monomer" dialog is displayed with the single-monomer body text

#### Scenario: S-group tool selected and single monomer already selected

- **WHEN** the user activates the S-group tool while exactly one MonomerMicromolecule S-group is selected on the canvas
- **THEN** the "Edit Monomer" dialog is displayed with the single-monomer body text

#### Scenario: S-group tool double-clicks a single monomer

- **WHEN** the user double-clicks directly on a MonomerMicromolecule S-group body with the S-group tool active
- **THEN** the "Edit Monomer" dialog is displayed with the single-monomer body text

#### Scenario: Cancel dismisses the dialog with no changes

- **WHEN** the "Edit Monomer" dialog is open and the user clicks "Cancel"
- **THEN** the dialog closes and no changes are applied to the monomer or the canvas

---

### Requirement: "Edit Monomer" button opens the Monomer Creation Wizard for a single monomer

When the user clicks "Edit Monomer" in the single-monomer "Edit Monomer" dialog, the system SHALL open the Monomer Creation Wizard pre-populated with the existing monomer's data, allowing in-place editing of that specific monomer instance.

#### Scenario: User confirms Edit Monomer for a single monomer

- **WHEN** the "Edit Monomer" dialog is open for a single monomer and the user clicks "Edit Monomer"
- **THEN** the dialog closes and the Monomer Creation Wizard opens, pre-filled with the monomer's current properties (name, attachment points, structure)
- **AND** saving in the Wizard updates that specific monomer instance on the canvas

---

### Requirement: "Remove Grouping" removes the monomer S-group grouping for a single monomer

When the user clicks "Remove Grouping" in the single-monomer "Edit Monomer" dialog, the system SHALL dissolve the MonomerMicromolecule S-group, leaving the underlying atoms and bonds as a plain chemical structure. Attachment-point leaving-group atoms SHALL be restored or removed according to the existing `fromSgroupDeletion` logic.

#### Scenario: User confirms Remove Grouping for a single monomer

- **WHEN** the "Edit Monomer" dialog is open for a single monomer and the user clicks "Remove Grouping"
- **THEN** the dialog closes and the monomer S-group is dissolved
- **AND** the underlying atoms and bonds remain on the canvas as a plain chemical structure
- **AND** the action is undoable via Undo

---

### Requirement: Edit Monomer dialog for multiple non-identical monomers (no Wizard option)

When a user activates the S-group tool while multiple MonomerMicromolecule S-groups with **different** template identities are selected, the system SHALL display the "Edit Monomer" dialog with a reduced option set: no "Edit Monomer" or "Edit All Monomers" button, only "Remove Grouping" and "Cancel".

The dialog SHALL have:

- Title: **"Edit Monomer"**
- Body text: `"Remove Grouping" will turn the monomers into a purely chemical structures. How do you wish to proceed?`
- Buttons: **Remove Grouping**, **Cancel** (default / focused)

#### Scenario: S-group tool activated with multiple non-identical monomers selected

- **WHEN** the user activates the S-group tool while two or more MonomerMicromolecule S-groups with different monomer template identities are selected
- **THEN** the "Edit Monomer" dialog is shown with the non-identical-monomers body text and only "Remove Grouping" and "Cancel" buttons
- **AND** no "Edit Monomer" or "Edit All Monomers" button is present

#### Scenario: Remove Grouping for multiple non-identical monomers

- **WHEN** the non-identical-monomers "Edit Monomer" dialog is open and the user clicks "Remove Grouping"
- **THEN** all selected monomer S-groups are dissolved
- **AND** their underlying atoms and bonds remain on the canvas as plain chemical structures
- **AND** the action is undoable as a single step via Undo

---

### Requirement: Edit Monomer dialog for multiple identical monomers (Edit All option)

When a user activates the S-group tool while multiple MonomerMicromolecule S-groups that share the **same** template identity are selected, the system SHALL display the "Edit Monomer" dialog offering an "Edit All Monomers" option in addition to "Remove Grouping" and "Cancel".

The dialog SHALL have:

- Title: **"Edit Monomer"**
- Body text: `"Edit All Monomers" will open the Monomer Creation Wizard and allow editing of all selected instances of the monomer. "Remove Grouping" will turn the monomers into a purely chemical structure. How do you wish to proceed?`
- Buttons: **Edit All Monomers**, **Remove Grouping**, **Cancel** (default / focused)

#### Scenario: S-group tool activated with multiple identical monomers selected

- **WHEN** the user activates the S-group tool while two or more MonomerMicromolecule S-groups with the same monomer template identity are selected
- **THEN** the "Edit Monomer" dialog is shown with the identical-monomers body text and buttons "Edit All Monomers", "Remove Grouping", and "Cancel"

#### Scenario: Edit All Monomers opens Wizard for all identical selected monomers

- **WHEN** the identical-monomers "Edit Monomer" dialog is open and the user clicks "Edit All Monomers"
- **THEN** the dialog closes and the Monomer Creation Wizard opens pre-filled with the shared monomer template data
- **AND** saving in the Wizard updates all selected identical monomer instances on the canvas
