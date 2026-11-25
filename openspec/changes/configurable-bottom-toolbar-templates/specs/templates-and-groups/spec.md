# Spec Delta

## ADDED Requirements

### Requirement: Runtime template configuration

The system SHALL let an embedding application add named molecular templates to a library group during an initialized editor session without changing the drawing canvas.

#### Scenario: Adding a template to the library

- **WHEN** an embedding application supplies a supported structure string and a non-empty name without a group
- **THEN** the parsed structure is added to _User Templates_ with leading and trailing name whitespace removed
- **AND** the canvas stays unchanged until the user selects and places the template

#### Scenario: Adding to a custom group

- **WHEN** an embedding application supplies a valid structure, name, and custom group
- **THEN** the template is available in that group with the supplied display name

#### Scenario: Adding templates sequentially

- **WHEN** an application waits for each successful addition before adding another template
- **THEN** the library preserves that insertion order
- **AND** each successful call appends a template, including repeated submissions

### Requirement: Invalid template additions are rejected

The system SHALL reject missing, empty, or non-string structures, non-string or whitespace-only names, and non-string groups before parsing. It SHALL reject parsing failures without adding a template.

#### Scenario: Invalid input

- **WHEN** a caller supplies an invalid structure, name, or group value
- **THEN** the asynchronous addition rejects without changing the library or canvas

#### Scenario: Parsing failure

- **WHEN** the configured structure service cannot parse the supplied structure
- **THEN** the asynchronous addition rejects with the parsing error and publishes no template

### Requirement: Database templates configure the bottom toolbar

The system SHALL display templates from _DB Templates_ in insertion order instead of the default bottom-toolbar templates whenever that group is non-empty. It SHALL retain access to the Structure Library when templates exceed the available width.

#### Scenario: Database templates are present

- **WHEN** the library contains one or more templates in _DB Templates_
- **THEN** those templates replace the default toolbar templates in insertion order
- **AND** each button retains the supplied display name even when it resembles a translation key

#### Scenario: No database templates are present

- **WHEN** the library has no templates in _DB Templates_
- **THEN** the bottom toolbar displays its built-in templates and their existing shortcut labels

#### Scenario: More templates than fit on the toolbar

- **WHEN** database templates exceed the available toolbar width or the number of built-in template icons
- **THEN** all database templates remain available through horizontal scrolling
- **AND** the Structure Library button remains visible

#### Scenario: Selecting and placing a database template

- **WHEN** a user selects a database-template button and clicks an empty canvas
- **THEN** the corresponding structure is placed on the canvas
- **AND** the database-template button does not advertise a built-in shortcut that selects a different structure

#### Scenario: Template editing is disabled or hidden

- **WHEN** the editor disables or hides the template action
- **THEN** database-template buttons, including those beyond the built-in icon count, respect that action state

### Requirement: Runtime templates have session lifetime

The system SHALL retain runtime templates through library initialization and settings reloads without automatically persisting them across browser reloads. Editor cleanup SHALL stop further additions from updating the disposed editor.

#### Scenario: Library initialization finishes after an addition

- **WHEN** an application adds a template before asynchronous library initialization finishes
- **THEN** completion of initialization preserves the runtime template

#### Scenario: Settings reload the library

- **WHEN** library initialization runs again during the same editor session
- **THEN** existing runtime templates remain present without being duplicated by initialization
- **AND** runtime templates previously deleted from the library remain deleted

#### Scenario: Saving user-library changes

- **WHEN** user-library changes are saved while runtime templates are present
- **THEN** the runtime templates are excluded from automatic persistent storage

#### Scenario: Editor cleanup

- **WHEN** an editor is cleaned up and another editor receives a runtime addition
- **THEN** the cleaned-up editor is not updated
- **AND** repeating cleanup is safe

### Requirement: Shared-window integration constraints are explicit

Runtime additions SHALL be shared by active editors in the same browser window. The integration guide SHALL explain separate-frame isolation and the initialized global editor instance required for database-template previews.

#### Scenario: Editors share a browser window

- **WHEN** two initialized editors share the same window and a runtime template is added
- **THEN** both active editors receive the addition

#### Scenario: Independent runtime libraries are required

- **WHEN** an integrator needs independently configured runtime template libraries
- **THEN** the documentation directs the integrator to host the editors in separate frames

#### Scenario: Toolbar previews are enabled

- **WHEN** the embedding page exposes its initialized editor instance through the documented global integration
- **THEN** database-template buttons can generate and display structure previews
