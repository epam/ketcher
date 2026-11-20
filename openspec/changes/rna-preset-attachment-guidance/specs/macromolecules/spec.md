## ADDED Requirements

### Requirement: RNA preset attachment-point direction tooltips

In RNA preset mode of the monomer creation wizard, the system SHALL identify the sugar R1 attachment point with a 5' tooltip and the phosphate R2 attachment point with a 3' tooltip. Other attachment points SHALL NOT receive these direction tooltips.

#### Scenario: Sugar R1 shows the 5' tooltip

- **WHEN** the user hovers the sugar R1 label in the RNA preset wizard
- **THEN** the 5' tooltip is shown

#### Scenario: Phosphate R2 shows the 3' tooltip

- **WHEN** the user hovers the phosphate R2 label in the RNA preset wizard
- **THEN** the 3' tooltip is shown

### Requirement: Confirmation for non-typical RNA preset leaving groups

Before saving an RNA preset, the system SHALL show a confirmation when the sugar R1 leaving group is not H or the phosphate R2 leaving group is not O (hydroxyl). It SHALL combine both mismatches into one message when both differ. The user SHALL be able to cancel or confirm saving the preset with its current attachment points.

#### Scenario: Typical RNA preset leaving groups

- **WHEN** the sugar R1 leaving group is H and the phosphate R2 leaving group is O
- **THEN** the preset is saved without a non-typical attachment-points confirmation

#### Scenario: One non-typical leaving group

- **WHEN** either the sugar R1 leaving group is not H or the phosphate R2 leaving group is not O
- **THEN** a non-typical attachment-points confirmation is shown before the preset is saved

#### Scenario: Both leaving groups are non-typical

- **WHEN** both the sugar R1 leaving group is not H and the phosphate R2 leaving group is not O
- **THEN** one combined non-typical attachment-points confirmation is shown before the preset is saved

#### Scenario: Cancel a non-typical leaving-group confirmation

- **WHEN** the user cancels the non-typical attachment-points confirmation
- **THEN** the RNA preset is not saved

#### Scenario: Confirm a non-typical leaving-group confirmation

- **WHEN** the user confirms the non-typical attachment-points confirmation
- **THEN** the RNA preset is saved with the current attachment points
