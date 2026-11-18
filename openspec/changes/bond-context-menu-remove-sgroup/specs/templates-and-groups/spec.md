## ADDED Requirements

### Requirement: Removing an S-group from the bond context menu

The bond context menu in Molecules mode SHALL offer **Remove S-Group** for a single right-clicked bond that belongs to an S-group, and SHALL remove that S-group while keeping its atoms and bonds.

#### Scenario: Removing the S-group of a bond

- **WHEN** the user right-clicks a bond whose atoms belong to exactly one S-group and chooses **Remove S-Group**
- **THEN** the S-group is removed, its atoms and bonds stay on the canvas, and one undo restores it

#### Scenario: Item follows the bond's S-group membership

- **WHEN** the user right-clicks a bond that belongs to no S-group
- **THEN** **Remove S-Group** is not shown
- **WHEN** the bond belongs to more than one S-group, or the menu holds more than one bond
- **THEN** **Remove S-Group** is disabled

#### Scenario: Functional groups and monomers keep their own removal

- **WHEN** the S-group of the bond is a functional group, a monomer, or a superatom without a label
- **THEN** **Remove S-Group** is not shown

### Requirement: Removing an S-group from the S-Group Properties dialog

The S-Group Properties dialog SHALL offer a **Remove** button when it is opened for an existing S-group, and SHALL remove that S-group while keeping its atoms and bonds.

#### Scenario: Removing the S-group from the dialog

- **WHEN** the user opens S-Group Properties for an existing S-group and presses **Remove**
- **THEN** the dialog closes, the S-group is removed, its atoms and bonds stay on the canvas, and one undo restores it

#### Scenario: No button for a new S-group

- **WHEN** the user opens S-Group Properties to create an S-group
- **THEN** the **Remove** button is not shown
