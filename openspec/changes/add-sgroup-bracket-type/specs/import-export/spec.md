# Spec Delta

## ADDED Requirements

### Requirement: Lossless S-group bracket types in KET

The system SHALL represent supported S-group bracket styles in an optional `brackets` object containing exactly `opening` and `closing`. Each entry SHALL allow an optional type: `square`, `parenthetic`, or `curly`. An absent `brackets` object or absent type on a bracket SHALL mean square. Both effective bracket types SHALL match.

#### Scenario: Round-trip a uniform bracket pair

- **WHEN** the user opens and saves KET containing a complete pair whose opening and closing brackets have the same supported type
- **THEN** both bracket types are retained
- **AND** its other properties, atom membership, and bonds remain equivalent

#### Scenario: Read an older KET

- **WHEN** the user opens a KET document whose S-group objects have no `brackets` object
- **THEN** those groups use square brackets
- **AND** no warning or error is introduced solely by the missing optional object

#### Scenario: Default square type

- **WHEN** a present bracket has no `type`, or its type is `square`
- **THEN** that bracket uses a square shape
- **AND** a newly created default square group need not write a `brackets` object

#### Scenario: Equivalent square defaults

- **WHEN** one bracket omits `type` and the other specifies `square`
- **THEN** the pair is accepted as having the same effective square type
- **AND** saving and reopening retains the square style

### Requirement: S-group bracket positions in KET

A bracket position SHALL contain `start` and `end` points with numeric `x` and `y` values in atom coordinates, in either endpoint order. Positions SHALL be present for both brackets or for neither, and each bracket SHALL retain its own coordinates. Without positions, brackets SHALL use automatic bounding-box placement.

#### Scenario: Preserve positions

- **WHEN** KET supplies positions for all brackets of a group and its atom coordinates and membership remain unchanged
- **THEN** saving and reopening retains those positions and their associated types
- **AND** each position remains in the same coordinate system as the saved atoms

#### Scenario: Invalidate positions after editing atoms

- **WHEN** an atom of a group moves, or an atom is added to or removed from the group
- **THEN** saving omits all positions for that group's bracket set
- **AND** retains the individual bracket types
- **AND** undo and redo restore the appropriate positions and types with the rest of the group state

### Requirement: Preserve zero-length bracket positions in KET

When either stored bracket position has identical start and end points, the system SHALL preserve both positions and types during an unchanged KET round trip. It SHALL NOT remove or replace them merely because one or both have zero length.

#### Scenario: Reopen a group with a zero-length opening position

- **WHEN** the opening position has zero length, the closing position has non-zero length, and the group's atom coordinates and membership remain unchanged
- **THEN** saving and reopening retains both original positions and their types
- **AND** neither bracket is drawn or replaced with an automatically positioned bracket

#### Scenario: Reopen a group with a zero-length closing position

- **WHEN** the closing position has zero length, the opening position has non-zero length, and the group's atom coordinates and membership remain unchanged
- **THEN** saving and reopening retains both original positions and their types
- **AND** neither bracket is drawn or replaced with an automatically positioned bracket

#### Scenario: Reopen a group with two zero-length positions

- **WHEN** both opening and closing positions have zero length and the group's atom coordinates and membership remain unchanged
- **THEN** saving and reopening retains both zero-length positions and their types
- **AND** the group's brackets remain undrawn instead of becoming an automatically positioned pair

### Requirement: Migrate the provisional branch format

The system SHALL read the earlier provisional `bracketType` field when `brackets` is absent, give `brackets` precedence when both exist, and emit only the new representation.

#### Scenario: Migrate a provisional branch file

- **WHEN** a KET file produced by the earlier version of this branch has `bracketType` but no `brackets`
- **THEN** its `square`, `round`, or `curly` value is read as the corresponding uniform bracket style
- **AND** subsequent output uses the new `brackets` representation instead of `bracketType`

#### Scenario: New representation takes precedence

- **WHEN** a KET S-group contains a supported uniform `brackets` pair and the provisional `bracketType`
- **THEN** the types and positions in `brackets` are retained
- **AND** the provisional property is not written back

### Requirement: Preserve S-group identity in KET

The system SHALL preserve distinct S-groups, their membership, and their hierarchy through KET round trips without serializing calculated layout offsets.

#### Scenario: Groups with identical atom membership

- **WHEN** distinct S-groups cover the same atoms and use different bracket types
- **THEN** saving and reopening KET retains both groups, their atom membership, and each group's own bracket data
- **AND** their hierarchy order survives copying and KET round trips, including after an outer group is removed and restored
- **AND** automatic visual bracket separation does not alter serialized atom coordinates or add calculated positions to KET

### Requirement: Query components preserve bracket data

The system SHALL preserve supported Query component bracket types and positions in KET using the same `brackets` representation as other eligible S-groups.

#### Scenario: Round-trip a styled Query component

- **WHEN** the user saves and reopens a Query component with a supported non-square bracket pair
- **THEN** its opening and closing types are retained in `brackets`
- **AND** any stored positions follow the same preservation and invalidation rules as other eligible S-groups
- **AND** its query properties and atom membership are unchanged

### Requirement: Exclude DATA S-groups

The system SHALL NOT emit `brackets` for DATA S-groups.

#### Scenario: DATA output remains unchanged

- **WHEN** the user saves a DATA S-group as KET
- **THEN** no `brackets` object is emitted for that group

### Requirement: Invalid KET bracket data is reported

The system SHALL reject invalid bracket values, positions, and object shapes through the existing invalid-KET error path. The system SHALL NOT silently substitute square for an invalid present type.

#### Scenario: Unsupported style value

- **WHEN** a KET bracket contains an unsupported type value
- **THEN** loading reports invalid KET instead of silently changing its style

#### Scenario: Different types in one pair

- **WHEN** opening and closing have different effective types after applying the square default
- **THEN** loading reports an error through the existing invalid-KET path
- **AND** neither type is silently changed to match the other

#### Scenario: Incorrect style value type

- **WHEN** a KET bracket has a numeric, null, object, or array type instead of a supported string
- **THEN** loading reports invalid KET through the existing error handling

#### Scenario: Incomplete or invalid positions

- **WHEN** only one bracket has a position, an endpoint is missing, a coordinate is not numeric, or an unexpected property is present within a bracket or position
- **THEN** loading reports invalid KET through the existing error handling

#### Scenario: Incomplete bracket pair

- **WHEN** a present `brackets` object is empty or lacks either `opening` or `closing`
- **THEN** loading reports invalid KET instead of inventing or discarding a bracket

#### Scenario: Third or unexpected bracket

- **WHEN** a `brackets` object contains `branch` or any key other than `opening` and `closing`
- **THEN** loading reports invalid KET through the existing error handling
