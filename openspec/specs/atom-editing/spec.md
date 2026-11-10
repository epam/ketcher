# Atom Editing Specification

## Purpose

Chemists need to place, replace, and annotate atoms in a 2D structure — choosing any element, adjusting charge, and setting atom-level properties (isotope, valence, radical, query attributes) — without editing raw file formats.

## Requirements

Placing or replacing an atom keeps implicit hydrogen counts and valence consistent, and each change is a single undoable step.

### Requirement: Placing a new element on empty canvas

The system SHALL ensure that a single atom of that element is created with implicit hydrogens filling its valence.

#### Scenario: Placing a new element on empty canvas

- **WHEN** the user selects an element and clicks empty canvas
- **THEN** a single atom of that element is created with implicit hydrogens filling its valence

### Requirement: Growing a chain from an existing atom

The system SHALL ensure that a new atom is created and joined to the clicked atom by a single bond, and implicit hydrogens are recalculated for both atoms.

#### Scenario: Growing a chain from an existing atom

- **WHEN** the user selects an element, clicks an existing atom, and drags
- **THEN** a new atom is created and joined to the clicked atom by a single bond, and implicit hydrogens are recalculated for both atoms

### Requirement: Changing an atom's element

The system SHALL ensure that the atom's element changes and its implicit hydrogen count and valence are recalculated.

#### Scenario: Changing an atom's element

- **WHEN** the user clicks an existing atom with a different element selected
- **THEN** the atom's element changes and its implicit hydrogen count and valence are recalculated

### Requirement: Invalid valence is surfaced

The system SHALL ensure that the atom is displayed underlined in red to flag the error.

#### Scenario: Invalid valence is surfaced

- **WHEN** an element/charge change produces an impossible valence
- **THEN** the atom is displayed underlined in red to flag the error

### Requirement: Explicit valence takes precedence

The system SHALL use explicitly specified valence and bond connectivity to calculate implicit hydrogens and valence warnings, ignoring charge and radical contributions while preserving those atom properties.

#### Scenario: Charged atom with explicit valence

- **WHEN** oxygen with two single bonds has explicit valence II and charge -1
- **THEN** it has zero implicit hydrogens and no valence warning, and its charge remains -1

#### Scenario: Radical with explicit valence

- **WHEN** a radical or charge is changed while explicit valence and bonds stay unchanged
- **THEN** the implicit hydrogen count and valence warning remain unchanged

#### Scenario: Bonds exceed explicit valence

- **WHEN** oxygen with two single bonds has explicit valence I
- **THEN** it is underlined in red and has zero implicit hydrogens

#### Scenario: Explicit valence is cleared

- **WHEN** the user clears explicit valence
- **THEN** the normal element, charge, and radical rules determine implicit hydrogens and valence warnings again

### Requirement: Adjusting charge

The system SHALL ensure that the atom's charge increases or decreases by one and implicit hydrogens are recalculated.

#### Scenario: Adjusting charge

- **WHEN** the user clicks an atom with the _Charge Plus_ or _Charge Minus_ tool
- **THEN** the atom's charge increases or decreases by one and implicit hydrogens are recalculated

## User interaction

- **Place / replace an atom** — select an element on the _Atoms_ toolbar and click empty canvas to place it, or click an existing atom to change its element.
- **Grow a structure** — select an element, click an existing atom, and drag; a single bond is added and vacant valences are filled with implicit hydrogens.
- **Less common elements** — open the _Periodic Table_ (single atom, atom _List_, or _Not List_) or the _Extended Table_ (generic groups, special nodes, pseudo-atoms) when the element is not on the toolbar.
- **Charge** — the _Charge Plus_ / _Charge Minus_ tools increment/decrement an atom's charge on each click.
- **Type-to-edit** — click an atom with the _Selection tool_ and start typing to change its label.
- **Atom Properties dialog** — double-click an atom (or press `/`) to edit element, charge, isotope, valence, radical, and query features.

## Guarantees

- Implicit hydrogen counts stay consistent with element, charge, isotope, and bond changes.
- Every atom edit is one atomic entry in the undo history (see [undo-redo](../undo-redo/spec.md)).
- Structures remain as chemically well-formed as the editor can enforce; remaining issues are reported by [Structure Check](../import-export/spec.md).
