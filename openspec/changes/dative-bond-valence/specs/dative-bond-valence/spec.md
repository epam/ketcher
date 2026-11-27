# Spec Delta

## Purpose

Defines how dative-bond direction and atom properties affect valence errors and implicit hydrogen counts in molecular structures.

## ADDED Requirements

### Requirement: Calculate dative bonding capacity

The system SHALL calculate an atom's eligible electrons and orbitals from its element, charge, non-dative covalent bond orders, and radical electrons.

#### Scenario: Charge and covalent bonds affect capacity

- **WHEN** an atom with a supported element participates in dative bonding and has a charge, covalent bonds, or radicals
- **THEN** its donor and acceptor capacities reflect those atom properties

### Requirement: Cancel opposing dative bonds

The system SHALL cancel one donor bond against one acceptor bond on the same atom before calculating remaining capacity and implicit hydrogens.

#### Scenario: An atom both donates and accepts

- **WHEN** an atom has one or more dative bonds in each direction
- **THEN** matching donor and acceptor bonds do not consume its remaining dative capacity or implicit-hydrogen resources

### Requirement: Mark dative valence errors

The system SHALL mark an atom with a valence error when its unmatched donor or acceptor dative bonds exceed the capacity calculated for that role.

#### Scenario: Donor or acceptor capacity is exceeded

- **WHEN** an atom has more unmatched dative bonds in either role than its calculated capacity
- **THEN** the atom is shown with a valence error

### Requirement: Calculate implicit hydrogens for dative atoms

The system SHALL calculate implicit hydrogens for supported atoms with dative bonds from their remaining eligible electrons and orbitals after accounting for covalent bonds, radicals, and unmatched dative bonds.

#### Scenario: Donor and acceptor bonds affect implicit hydrogens

- **WHEN** a supported atom with dative bonds has available electrons and orbitals for implicit hydrogens
- **THEN** its implicit-hydrogen count reflects the remaining electron and orbital capacity

### Requirement: Use aromatic bond orders for dative valence

The system SHALL use a Kekulé bond-order assignment when calculating dative valence for an aromatic system that can be kekulized.

#### Scenario: Aromatic system can be kekulized

- **WHEN** an atom with a dative bond belongs to a supported aromatic system with a valid Kekulé structure
- **THEN** the atom's dative capacity and implicit hydrogens are calculated using that structure without changing the molecule's aromatic representation

#### Scenario: Aromatic system cannot be kekulized

- **WHEN** an aromatic system with a dative atom is unsupported or has no valid Kekulé structure
- **THEN** the atom retains the legacy implicit-hydrogen calculation and uses a conservative dative-capacity check

### Requirement: Recalculate dative valence after bond edits

The system SHALL recalculate affected dative atoms when a dative bond is added, removed, flipped, or changed to or from another bond type.

#### Scenario: Dative bond direction or type changes

- **WHEN** a user flips a dative bond or changes its type
- **THEN** both endpoint atoms show implicit-hydrogen counts and valence errors consistent with the updated bond
