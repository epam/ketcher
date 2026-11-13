# Spec Delta

## ADDED Requirements

### Requirement: Atom mapping labels in macromolecules mode
The system SHALL display existing atom mapping numbers in macromolecules mode at the same relative position as in molecules mode, without changing atom hover or selection behavior.

#### Scenario: Rendering mapped atoms in macromolecules mode
- **WHEN** an atom with a mapping number is rendered in macromolecules mode
- **THEN** its mapping number is visible at the same relative position as in molecules mode
- **AND** hovering or selecting the atom continues to behave as before
