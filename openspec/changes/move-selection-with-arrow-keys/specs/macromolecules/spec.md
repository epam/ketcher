## ADDED Requirements

### Requirement: Moving a selection with arrow keys

In Flex and Snake modes, the system SHALL move the current selection by 1 px in the direction of the pressed arrow key, and by 10 px when `Shift` is held. Each key press SHALL be a single undo step. In Sequence mode, the selection SHALL NOT move.

#### Scenario: Arrow key moves the selection by 1 px

- **WHEN** the user presses an arrow key with a selection in Flex or Snake mode
- **THEN** the selection moves 1 px in that direction

#### Scenario: Shift multiplies the step by 10

- **WHEN** the user presses an arrow key while holding `Shift` with a selection in Flex or Snake mode
- **THEN** the selection moves 10 px in that direction

#### Scenario: Each key press is one undo step

- **WHEN** the user presses an arrow key twice and then undoes once
- **THEN** only the second move is reverted

#### Scenario: No selection

- **WHEN** the user presses an arrow key with nothing selected in Flex or Snake mode
- **THEN** nothing moves and no undo step is added

#### Scenario: Sequence mode is unchanged

- **WHEN** the user presses an arrow key with a selection in Sequence mode
- **THEN** the selection does not move
