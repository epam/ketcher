## ADDED Requirements

### Requirement: Positioning a pasted structure in flex mode

The system SHALL display a paste preview in macromolecules flex mode, keep the canvas and undo history unchanged while the preview moves, and place the structure at the previewed position as one undoable action when clicked.

#### Scenario: Positioning a pasted structure in flex mode

- **WHEN** the user pastes in macromolecules flex mode
- **THEN** a ghost appears at the active zoom, with its visual center under the mouse cursor
- **AND** mouse movement moves the ghost without changing the canvas contents or undo history
- **AND** clicking the canvas adds the structure at the previewed position as one undoable step
- **AND** the added structure stays selected, and the selection tool becomes active
- **AND** pressing Escape discards the ghost without adding a structure

#### Scenario: Direct paste remains in snake and sequence modes

- **WHEN** the user pastes in macromolecules snake or sequence mode
- **THEN** the structure is placed directly without a preview

#### Scenario: Pending paste is cancelled by an editor transition

- **WHEN** a paste preview or clipboard operation is pending
- **AND** the user presses Escape, changes tools or layouts, or replaces the document
- **THEN** the pending paste is cancelled and a late clipboard or conversion result cannot restore its preview
