## ADDED Requirements

### Requirement: Delete option visibility on library cards
<<<<<<< HEAD
The `Delete` option in a monomer library card's three-dot menu SHALL be shown only for user-made monomers. A user-made monomer is one that: (a) was created or duplicated via the Monomer Creation Wizard in the current session, or (b) is present in the persisted `localStorage` monomer-library updates (regardless of how it was stored — wizard or API with `shouldPersist:true`). Monomers from the bundled default library and monomers added at runtime without persistence via `ketcher.updateMonomersLibrary` or `ketcher.replaceMonomersLibrary` are NOT user-made.

#### Scenario: Default monomer card has no Delete option
=======

The `Delete` option in a monomer library card's three-dot menu SHALL be shown only for user-made monomers. A user-made monomer is one that: (a) was created or duplicated via the Monomer Creation Wizard in the current session, or (b) is present in the persisted `localStorage` monomer-library updates (regardless of how it was stored — wizard or API with `shouldPersist:true`).

#### Scenario: Default monomer card has no Delete option

Monomers from the bundled default library and monomers added at runtime without persistence via `ketcher.updateMonomersLibrary` or `ketcher.replaceMonomersLibrary` are NOT user-made.

>>>>>>> origin/master
- **WHEN** the user opens the three-dot menu on a card for a monomer that ships with the default library
- **THEN** no `Delete` option is shown in the menu

#### Scenario: Runtime-only API-added monomer card has no Delete option
<<<<<<< HEAD
=======

>>>>>>> origin/master
- **WHEN** the embedding application adds monomers via `ketcher.updateMonomersLibrary` or `ketcher.replaceMonomersLibrary` without `shouldPersist: true`
- **AND** the user opens the three-dot menu on a card for such a monomer
- **THEN** no `Delete` option is shown in the menu

#### Scenario: Persisted API-added monomer card has a Delete option
<<<<<<< HEAD
=======

>>>>>>> origin/master
- **WHEN** the embedding application adds monomers via `ketcher.updateMonomersLibrary` with `shouldPersist: true` (persisting them to `localStorage`)
- **AND** the user opens the three-dot menu on a card for such a monomer
- **THEN** a `Delete` option is shown in the menu

#### Scenario: User-made monomer card has a Delete option
<<<<<<< HEAD
=======

>>>>>>> origin/master
- **WHEN** the user opens the three-dot menu on a card for a monomer created or duplicated via the Monomer Creation Wizard
- **THEN** a `Delete` option is shown in the menu

### Requirement: Immediate deletion when the monomer is unused
<<<<<<< HEAD
When a user-made monomer is neither placed on the canvas nor referenced by any library preset, deleting it SHALL remove it from the library immediately, without a confirmation modal.

#### Scenario: Delete with no canvas instances and no preset participation
=======

When a user-made monomer is neither placed on the canvas nor referenced by any library preset, deleting it SHALL remove it from the library immediately, without a confirmation modal.

#### Scenario: Delete with no canvas instances and no preset participation

>>>>>>> origin/master
- **WHEN** the user clicks `Delete` on a user-made monomer that has no instances on the canvas and does not participate in any preset
- **THEN** the monomer is removed from the library immediately
- **AND** no confirmation modal is shown

### Requirement: Confirmation when the monomer is present on canvas
<<<<<<< HEAD
When a user-made monomer being deleted has at least one instance placed on the canvas and does not participate in any preset, a confirmation modal titled "Monomer present on canvas" SHALL be shown with the message "Deleting the monomer will not delete the instances of the monomer present on canvas. Do you wish to proceed?", offering "Yes" and "Cancel" (default) options.

#### Scenario: Confirming deletion of a monomer present on canvas
=======

When a user-made monomer being deleted has at least one instance placed on the canvas and does not participate in any preset, a confirmation modal titled "Monomer present on canvas" SHALL be shown with the message "Deleting the monomer will not delete the instances of the monomer present on canvas. Do you wish to proceed?", offering "Yes" and "Cancel" (default) options.

#### Scenario: Confirming deletion of a monomer present on canvas

>>>>>>> origin/master
- **WHEN** the user clicks `Delete` on a user-made monomer that has at least one instance on the canvas and participates in no preset, and then clicks "Yes" in the resulting modal
- **THEN** the monomer is removed from the library
- **AND** its instances already placed on the canvas remain unchanged

#### Scenario: Cancelling deletion of a monomer present on canvas
<<<<<<< HEAD
=======

>>>>>>> origin/master
- **WHEN** the user clicks `Delete` on a user-made monomer that has at least one instance on the canvas and participates in no preset, and then clicks "Cancel" (or dismisses the modal)
- **THEN** the monomer is not removed from the library
- **AND** the library and canvas are left unchanged

### Requirement: Confirmation when the monomer participates in a preset
<<<<<<< HEAD
When a user-made monomer being deleted participates in at least one library preset and has no instances on the canvas, a confirmation modal titled "Monomer participates in a preset" SHALL be shown with the message "This monomer participates in a preset. Deleting it will delete the library presets it participates in. Do you wish to proceed?", offering "Yes" and "Cancel" (default) options.

#### Scenario: Confirming deletion of a monomer that participates in a preset
=======

When a user-made monomer being deleted participates in at least one library preset and has no instances on the canvas, a confirmation modal titled "Monomer participates in a preset" SHALL be shown with the message "This monomer participates in a preset. Deleting it will delete the library presets it participates in. Do you wish to proceed?", offering "Yes" and "Cancel" (default) options.

#### Scenario: Confirming deletion of a monomer that participates in a preset

>>>>>>> origin/master
- **WHEN** the user clicks `Delete` on a user-made monomer that has no canvas instances but participates in one or more presets, and then clicks "Yes" in the resulting modal
- **THEN** the monomer is removed from the library
- **AND** every library preset that referenced the monomer is also removed from the library

#### Scenario: Cancelling deletion of a monomer that participates in a preset
<<<<<<< HEAD
=======

>>>>>>> origin/master
- **WHEN** the user clicks `Delete` on a user-made monomer that has no canvas instances but participates in one or more presets, and then clicks "Cancel" (or dismisses the modal)
- **THEN** neither the monomer nor any preset is removed from the library

### Requirement: Combined confirmation when both conditions apply
<<<<<<< HEAD
When a user-made monomer being deleted has at least one instance on the canvas and also participates in at least one library preset, a confirmation modal titled "Monomer present on canvas and participates in a preset" SHALL be shown with the message "Deleting the monomer will not delete the instances of the monomer present on canvas, but will delete all library presets it participates in. Do you wish to proceed?", offering "Yes" and "Cancel" (default) options.

#### Scenario: Confirming combined deletion
=======

When a user-made monomer being deleted has at least one instance on the canvas and also participates in at least one library preset, a confirmation modal titled "Monomer present on canvas and participates in a preset" SHALL be shown with the message "Deleting the monomer will not delete the instances of the monomer present on canvas, but will delete all library presets it participates in. Do you wish to proceed?", offering "Yes" and "Cancel" (default) options.

#### Scenario: Confirming combined deletion

>>>>>>> origin/master
- **WHEN** the user clicks `Delete` on a user-made monomer that has canvas instances and participates in one or more presets, and then clicks "Yes" in the resulting modal
- **THEN** the monomer is removed from the library
- **AND** its canvas instances remain unchanged
- **AND** every library preset that referenced the monomer is removed from the library

#### Scenario: Cancelling combined deletion
<<<<<<< HEAD
=======

>>>>>>> origin/master
- **WHEN** the user clicks `Delete` on a user-made monomer that has canvas instances and participates in one or more presets, and then clicks "Cancel" (or dismisses the modal)
- **THEN** neither the monomer, its canvas instances, nor any preset is affected

### Requirement: Preset removal stays consistent across storage layers
<<<<<<< HEAD
Removing a library preset as part of monomer deletion SHALL remove it from the KET library template data, from the in-memory preset list, and from any persisted preset cache, so the preset no longer appears in the library or in future sessions.

#### Scenario: Deleted preset does not reappear after reload
=======

Removing a library preset as part of monomer deletion SHALL remove it from the KET library template data, from the in-memory preset list, and from any persisted preset cache, so the preset no longer appears in the library or in future sessions.

#### Scenario: Deleted preset does not reappear after reload

>>>>>>> origin/master
- **WHEN** a monomer is deleted and a preset referencing it is removed as a consequence
- **THEN** that preset is absent from the library panel for the remainder of the session
- **AND** it remains absent after the library is reloaded from persisted settings
