## ADDED Requirements

### Requirement: Query properties of atoms are displayed in macromolecules mode

The system SHALL display query properties (ring bond count, H count, substitution count, unsaturated, aromaticity, implicit H count, ring membership, ring size, connectivity, chirality, custom query) of single atoms, atom lists and special atoms on the macromolecules canvas with the same text as in molecules mode.

#### Scenario: Query property displayed

- **WHEN** an atom with ring bond count 2 is on the macromolecules canvas
- **THEN** the text `rb2` is displayed near the atom

#### Scenario: Custom query displayed

- **WHEN** an atom with custom query `x2&D3,D2` is on the macromolecules canvas
- **THEN** the text `x2&D3,D2` is displayed near the atom

#### Scenario: Query property of atom list displayed

- **WHEN** an atom list `[N,O]` with substitution count 2 is on the macromolecules canvas
- **THEN** the text `s2` is displayed near the atom list label

### Requirement: Long query text is truncated

The system SHALL display only the first 8 characters of the query text followed by `...` when the text is longer than 8 characters, and SHALL show the full text in a tooltip on hover of the atom.

#### Scenario: Long query text truncated

- **WHEN** an atom has several query properties and the query text is `a;u;x2;D3;H1;R2;r6;X3`
- **THEN** the canvas displays `a;u;x2;D...`

#### Scenario: Hover shows full query text

- **WHEN** the user hovers an atom with truncated query text
- **THEN** a tooltip with the full query text is shown

### Requirement: Atoms with query properties do not show implicit hydrogens

The system SHALL NOT display implicit hydrogens on atoms that have query properties in macromolecules mode. When implicit H count is the only query property of a single atom, the system SHALL display that number of hydrogens.

#### Scenario: Query atom without hydrogens

- **WHEN** a nitrogen atom with one bond and substitution count 1 is on the macromolecules canvas
- **THEN** its label is `N`

#### Scenario: Implicit H count only

- **WHEN** a nitrogen atom has implicit H count 2 and no other query properties
- **THEN** its label is `NH2`

### Requirement: Query properties preserved when switching between modes

The system SHALL keep query properties of atoms unchanged when the user switches from molecules mode to macromolecules mode and back.

#### Scenario: Round-trip mode switch

- **WHEN** a structure with query atoms is open in molecules mode
- **AND** the user switches to macromolecules mode and back to molecules mode
- **THEN** the atoms have the same query properties and are displayed in the same way
