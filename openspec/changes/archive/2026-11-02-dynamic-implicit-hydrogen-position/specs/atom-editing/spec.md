## ADDED Requirements

### Requirement: Implicit hydrogens of a terminal atom sit opposite its bond

The system SHALL draw the implicit hydrogens of an atom that has at most one visible bond on the side of the atom symbol opposite that bond: on the left when the bond points into the right half of the plane, on the right when it points into the left half. An atom with no bond, or with a bond vertical to within half a degree, SHALL show them on the right.

#### Scenario: Bond to the right puts hydrogens on the left

- **WHEN** a carbon atom has one single bond going to the right (for example up and to the right at 30°)
- **THEN** its hydrogens are drawn to the left of the symbol (`H3C`)

#### Scenario: Bond to the left puts hydrogens on the right

- **WHEN** a carbon atom has one single bond going to the left (for example down and to the left at 210°)
- **THEN** its hydrogens are drawn to the right of the symbol (`CH3`)

#### Scenario: Vertical bond puts hydrogens on the right

- **WHEN** a carbon atom has one bond going straight up or straight down
- **THEN** its hydrogens are drawn to the right of the symbol

#### Scenario: Atom without bonds puts hydrogens on the right

- **WHEN** an isolated oxygen atom is placed on the canvas
- **THEN** its two hydrogens are drawn to the right of the symbol (`OH2`)

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

The system SHALL treat the symbol, the implicit hydrogens, and the atom's other label parts as one label. The hover highlight, the selection highlight, and S-group brackets SHALL be sized from a bounding box that includes the hydrogens, wherever they are drawn. A bond SHALL stop at the edge of the label part it reaches.

#### Scenario: Hydrogens on top extend the hover and selection highlight upward

- **WHEN** an atom draws its hydrogens above the symbol and the user hovers or selects it
- **THEN** the highlight covers the symbol and the hydrogens

#### Scenario: Bonds are not shortened by hydrogens on another side

- **WHEN** an atom draws its hydrogens in a quadrant where no bond runs
- **THEN** each bond of the atom stops at the edge of the symbol it reaches, not at the edge of the hydrogens

### Requirement: Charge and valence stay clear of stacked hydrogens

The system SHALL draw an atom's charge and explicit valence so that they do not overprint the hydrogen count when the hydrogens are drawn above or below the symbol.

#### Scenario: Charge beside a stacked hydrogen count

- **WHEN** a nitrogen atom with charge +1 has two bonds at 210° and 330° and two implicit hydrogens
- **THEN** the hydrogens are drawn above the symbol and the charge sign is drawn to the right of the hydrogen count, not over it

### Requirement: Implicit hydrogen placement is the same in macromolecules mode

The system SHALL place implicit hydrogens of atoms drawn in macromolecules mode by the same rules as in molecules mode.

#### Scenario: Terminal atom in macromolecules mode

- **WHEN** a structure with a terminal atom bonded to its left is shown in macromolecules mode
- **THEN** the hydrogens of that atom are drawn to the right of its symbol

#### Scenario: Internal atom in macromolecules mode

- **WHEN** a structure with an internal atom is switched from molecules to macromolecules mode
- **THEN** the hydrogens of that atom are drawn in the same quadrant as before the switch

#### Scenario: Bond to a monomer counts in macromolecules mode

- **WHEN** an atom is bonded to another atom on its left and to a monomer on its right
- **THEN** the atom is an internal atom and its hydrogens are drawn above the symbol, as in molecules mode

#### Scenario: Hydrogens follow the bonds after an edit in macromolecules mode

- **WHEN** a bond of an atom is deleted, or an atom bonded to it is moved, in macromolecules mode
- **THEN** the hydrogens of that atom are drawn on the side the rules give for its new bonds
