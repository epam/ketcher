# Atom Editing

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

## Limitations

- This is a **molecules-mode** feature. In macromolecules mode the equivalent is placing monomers (see [macromolecules](./macromolecules.md)); individual atoms of an abbreviated group / functional group cannot be edited until the abbreviation is removed.
- Query atom features (lists, not-lists, generics) are meaningful only for query-capable export formats.
- Where implicit hydrogens are drawn is decided by Ketcher's own rule. PNG and SVG images rendered by Indigo follow it only once epam/Indigo#4031 lands, so an exported image can differ from the canvas until then.

## Related

- Engine: [editor-engine](../modules/editor-engine.md) · Model: [domain.md](../domain.md) (Atom)
- See also: [bond-editing](./bond-editing.md), [stereochemistry](./stereochemistry.md)
