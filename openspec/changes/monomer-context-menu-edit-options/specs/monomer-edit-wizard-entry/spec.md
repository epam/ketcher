## ADDED Requirements

### Requirement: "Edit Monomer" entry into the monomer creation wizard

When the user selects "Edit Monomer" from the context menu, the system SHALL open the monomer creation wizard pre-loaded with the selected monomer's existing properties for single-instance editing.

#### Scenario: "Edit Monomer" opens wizard with existing monomer data

- **WHEN** the user right-clicks a single monomer and selects "Edit Monomer"
- **THEN** the monomer creation wizard SHALL open with the monomer's current properties pre-populated (name, symbol, attachment points, etc.)

#### Scenario: Wizard is not opened when "Edit Monomer" is disabled

- **WHEN** "Edit Monomer" is disabled (multiple monomers in selection)
- **THEN** clicking the disabled item SHALL have no effect

---

### Requirement: "Edit All [code] (n)" confirmation modal before wizard entry

Before opening the monomer creation wizard via "Edit All [code] (n)", the system SHALL display a confirmation modal with:

- Title: "Editing monomers"
- Body: "You are going to edit (n) monomers. Are you sure?"
- Two actions: "Cancel" (dismisses modal, no wizard opened) and "OK" (proceeds to wizard)

#### Scenario: Confirmation modal is shown on "Edit All" click

- **WHEN** the user clicks "Edit All [code] (n)"
- **THEN** a confirmation modal SHALL appear with the title "Editing monomers" and the body "You are going to edit (n) monomers. Are you sure?"

#### Scenario: Confirming with "OK" opens the wizard

- **WHEN** the confirmation modal is displayed and the user clicks "OK"
- **THEN** the monomer creation wizard SHALL open pre-loaded with the monomer's current properties for all-instances editing

#### Scenario: "Cancel" dismisses the modal without opening the wizard

- **WHEN** the confirmation modal is displayed and the user clicks "Cancel"
- **THEN** the modal SHALL close and the monomer creation wizard SHALL NOT open

---

### Requirement: "Edit All [code] (n)" entry into the monomer creation wizard

After confirmation, the system SHALL open the monomer creation wizard pre-loaded with the monomer's existing properties for all-instances editing. The wizard SHALL apply any saved changes to all instances of that monomer on the canvas.

#### Scenario: Wizard opens with monomer data for all-instances editing after confirmation

- **WHEN** the user confirms "Edit All [code] (n)"
- **THEN** the monomer creation wizard SHALL open pre-populated with the current monomer properties in an all-instances editing mode

#### Scenario: Count (n) in the confirmation matches the count in the menu item label

- **WHEN** the confirmation modal is shown
- **THEN** the number (n) in the modal body SHALL match the number shown in the "Edit All [code] (n)" menu item label
