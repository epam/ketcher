## ADDED Requirements

### Requirement: Add to Canvas in macromolecules flex mode

The system SHALL preview an imported structure in macromolecules flex mode and place it only when the user clicks the canvas.

#### Scenario: Add to Canvas in macromolecules flex mode

- **WHEN** the user chooses _Add to Canvas_ in flex mode
- **THEN** the imported structure appears as a ghost at the active zoom, centered under the mouse cursor
- **AND** mouse movement repositions the ghost; clicking adds it at that position, while Escape cancels without changing the canvas
- **AND** the added structure is not automatically selected, unlike a clipboard paste
- **AND** _Open as New_ still replaces the canvas directly; snake and sequence modes still add structures directly
