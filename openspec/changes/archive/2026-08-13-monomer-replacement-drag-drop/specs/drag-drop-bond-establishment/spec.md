## MODIFIED Requirements

### Requirement: AP proximity highlight on library item drag

When a library monomer or preset is being dragged over the canvas, the system SHALL monitor the cursor position and activate replacement-target highlighting when the cursor is within the replacement proximity threshold of a canvas monomer's center; when no replacement target is active, the system SHALL fall through to attachment-point highlighting as already specified.

#### Scenario: Replacement highlight takes priority over AP highlight

- **WHEN** the user is dragging a monomer or preset from the library
- **AND** the cursor comes within [TBD] px of the center of a canvas monomer
- **THEN** the canvas monomer shows the replacement-target visual state
- **AND** no attachment-point `+` indicators are shown for that monomer

#### Scenario: AP highlight activates when outside replacement proximity

- **WHEN** the user is dragging a monomer or preset from the library
- **AND** the cursor is NOT within [TBD] px of any canvas monomer's center
- **AND** the cursor comes within 25 px of a free attachment point on any canvas monomer
- **THEN** all free (unoccupied) attachment points of that canvas monomer become visible
- **AND** the attachment point nearest the cursor shows a `+` indicator in its center

#### Scenario: Highlight clears when cursor leaves proximity

- **WHEN** the cursor moves more than 25 px away from all free attachment points on a previously highlighted canvas monomer (and is also outside the replacement threshold)
- **THEN** the attachment-point visibility and `+` indicator are removed from that monomer

#### Scenario: Only the nearest AP shows the `+` indicator

- **WHEN** a canvas monomer has multiple free attachment points and the cursor is within 25 px of more than one
- **THEN** only the attachment point closest to the cursor shows the `+` indicator
- **AND** all other free APs of that monomer remain visible without the `+` indicator
