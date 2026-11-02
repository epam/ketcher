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

### Requirement: Adjusting charge

The system SHALL ensure that the atom's charge increases or decreases by one and implicit hydrogens are recalculated.

#### Scenario: Adjusting charge

- **WHEN** the user clicks an atom with the _Charge Plus_ or _Charge Minus_ tool
- **THEN** the atom's charge increases or decreases by one and implicit hydrogens are recalculated

### Requirement: Implicit hydrogens of a terminal atom sit opposite its bond

The system SHALL draw the implicit hydrogens of an atom that has at most one visible bond on the side of the atom symbol opposite that bond: on the left when the bond points into the right half of the plane, on the right when it points into the left half. An atom with no bond, or with a bond exactly vertical, SHALL show them on the right.

#### Scenario: Bond to the right puts hydrogens on the left

- **WHEN** a carbon atom has one single bond going to the right (for example up and to the right at 30°)
- **THEN** its hydrogens are drawn to the left of the symbol (`H3C`)

#### Scenario: Bond to the left puts hydrogens on the right

- **WHEN** a carbon atom has one single bond going to the left (for example down and to the left at 210°)
- **THEN** its hydrogens are drawn to the right of the symbol (`CH3`)

#### Scenario: Vertical bond puts hydrogens on the right

- **WHEN** a carbon atom has one bond going exactly up or exactly down
- **THEN** its hydrogens are drawn to the right of the symbol

#### Scenario: Atom without bonds puts hydrogens on the right

- **WHEN** an isolated oxygen atom is placed on the canvas
- **THEN** its hydrogens are drawn to the right of the symbol (`OH`)

### Requirement: Implicit hydrogens of an internal atom sit in a free quadrant

The system SHALL draw the implicit hydrogens of an atom that has two or more visible bonds in the quadrant around the atom symbol that contains no bond and no radical. The quadrants are right [315°, 45°), top [45°, 135°), left [135°, 225°), and bottom [225°, 315°), with 0° pointing right and 90° pointing up. When several quadrants are free, the system SHALL use the first free one in the order right, left, top, bottom. A radical always occupies the top quadrant.

#### Scenario: Hydrogens go top for a vertex with two bonds pointing down

- **WHEN** a nitrogen atom has two bonds pointing down and to the left (210°) and down and to the right (330°)
- **THEN** the left and right quadrants are occupied, the top and bottom quadrants are free, and the hydrogens are drawn above the symbol

#### Scenario: Right quadrant is preferred

- **WHEN** an atom has two bonds in the top and bottom quadrants only
- **THEN** its hydrogens are drawn to the right of the symbol

#### Scenario: A radical occupies the top quadrant

- **WHEN** an atom has bonds in the right and left quadrants and a radical
- **THEN** the radical is drawn above the symbol and the hydrogens are drawn below it

#### Scenario: No free quadrant

- **WHEN** every quadrant of an atom contains a bond or a radical
- **THEN** its hydrogens are drawn to the right of the symbol

#### Scenario: A bond on a quadrant boundary belongs to the quadrant that starts there

- **WHEN** an atom has a bond at exactly 45°
- **THEN** that bond occupies the top quadrant, not the right quadrant

### Requirement: Atom label bounds include the implicit hydrogens

The system SHALL treat the symbol, the implicit hydrogens, and the atom's other label parts as one label. Bonds, S-group brackets, the hover highlight, and the selection highlight SHALL be sized from that label's bounding box, wherever the hydrogens are drawn.

#### Scenario: Hydrogens on top extend the hover and selection highlight upward

- **WHEN** an atom draws its hydrogens above the symbol and the user hovers or selects it
- **THEN** the highlight covers the symbol and the hydrogens

#### Scenario: Bonds are not shortened by hydrogens on another side

- **WHEN** an atom draws its hydrogens in a quadrant where no bond runs
- **THEN** each bond of the atom stops at the edge of the symbol it reaches, not at the edge of the hydrogens

### Requirement: Implicit hydrogen placement is the same in macromolecules mode

The system SHALL place implicit hydrogens of atoms drawn in macromolecules mode by the same rules as in molecules mode.

#### Scenario: Terminal atom in macromolecules mode

- **WHEN** a structure with a terminal atom bonded to its left is shown in macromolecules mode
- **THEN** the hydrogens of that atom are drawn to the right of its symbol

#### Scenario: Internal atom in macromolecules mode

- **WHEN** a structure with an internal atom is switched from molecules to macromolecules mode
- **THEN** the hydrogens of that atom are drawn in the same quadrant as before the switch

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
