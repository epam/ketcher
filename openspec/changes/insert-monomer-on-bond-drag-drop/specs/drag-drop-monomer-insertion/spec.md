## ADDED Requirements

### Requirement: Bond insertion indicator

While the user drags a library monomer or preset and the cursor is within the bond-proximity threshold of a polymer bond, the system SHALL show a circle on that bond. The circle SHALL be larger when the cursor is within the closer threshold. The indicator SHALL NOT be shown while a replacement-target or attachment-point highlight is active.

#### Scenario: Indicator appears near a bond

- **WHEN** the user drags a library monomer within the outer threshold of a polymer bond
- **THEN** a small circle appears on the bond

#### Scenario: Indicator grows when closer

- **WHEN** the cursor moves within the inner threshold of the bond
- **THEN** the circle on the bond becomes larger

#### Scenario: Indicator clears

- **WHEN** the cursor leaves the outer threshold, the drag is cancelled, or the item is dropped
- **THEN** the circle is removed

#### Scenario: Replacement and AP highlights take priority

- **WHEN** a replacement target or an attachment-point highlight is active
- **THEN** no bond indicator is shown

---

### Requirement: Drop inserts between the bonded monomers

Dropping a library monomer or preset while the indicator is shown SHALL remove the original bond and insert the item between its two monomers. The original monomers SHALL keep the attachment points they used in the original bond. The whole insertion SHALL be one undo step.

#### Scenario: Monomer inserted

- **WHEN** the user drops a monomer on a bond with the indicator shown
- **THEN** the original bond is removed and two bonds connect the original monomers to the new monomer

#### Scenario: Original APs preserved

- **WHEN** the original bond was R2 (left) – R1 (right)
- **THEN** the left monomer bonds to the new monomer through its R2 and the right monomer through its R1

#### Scenario: Undo in one step

- **WHEN** the user undoes the insertion
- **THEN** the new monomer and bonds are removed and the original bond is restored in a single step

---

### Requirement: Default attachment points for the new monomer

The new monomer's APs SHALL be chosen so both new bonds are default bonds: R1–R2 between amino acids; R1–R2 between sugars and phosphates; R3–R1 between sugars and bases; R1–R2 between unsplit nucleotides and sugars or phosphates; any AP when both monomers have exactly one available AP; otherwise R1–R2. For a preset, only the sugar and the phosphate (if present) SHALL be used for the two new bonds.

#### Scenario: Amino acid between amino acids

- **WHEN** an amino acid is dropped on an R2 (left) – R1 (right) bond between amino acids
- **THEN** the bonds are R2 (left) – R1 (new) and R2 (new) – R1 (right)

#### Scenario: Fallback to R1–R2

- **WHEN** no listed default rule applies but R1–R2 can be established on both sides
- **THEN** R1–R2 bonds are created

#### Scenario: Preset uses sugar and phosphate

- **WHEN** a phosphate-containing preset is dropped on a bond
- **THEN** the two new bonds attach to the preset's sugar and phosphate, and the base is bonded to the sugar as in the preset

---

### Requirement: Select Attachment Points dialog when no default connection exists

If no default connection exists and the dropped monomer has two or more APs, the system SHALL open the *Select Attachment Points* dialog. After the user picks APs and clicks **Connect**, the monomer SHALL be inserted using them.

#### Scenario: Dialog opens

- **WHEN** a monomer with two or more APs is dropped on a bond and no default connection exists
- **THEN** the *Select Attachment Points* dialog opens

#### Scenario: Connect inserts the monomer

- **WHEN** the user selects APs and clicks **Connect**
- **THEN** the monomer is inserted between the original monomers using the selected APs

---

### Requirement: Error modals when insertion is impossible

When insertion cannot proceed the system SHALL insert nothing and SHALL show a modal whose only action is **Close**.

#### Scenario: Preset without default bonds

- **WHEN** a preset is dropped on a bond and default bonds to its sugar (and phosphate) cannot be established
- **THEN** the modal shows "Preset cannot be inserted because default bonds cannot be established."
- **AND** the canvas is unchanged

#### Scenario: Single-AP monomer

- **WHEN** a monomer with only one AP is dropped on a bond and no default connection exists
- **THEN** the modal shows "The monomer cannot be inserted because it only has one attachment point."
- **AND** the canvas is unchanged

---

### Requirement: Snake-mode layout after insertion

In Snake mode the system SHALL run the snake layout after insertion.

#### Scenario: Layout triggered

- **WHEN** an item is inserted on a bond in Snake mode
- **THEN** the snake layout runs and repositions the chain

---

### Requirement: Flex-mode layout for monomer insertion

In Flex mode, for a non-circular chain with a bond shorter than 3 Å, the bond SHALL be extended to 3 Å, the monomer placed at its midpoint, and the right/bottom part of the chain shifted. For a bond of 3 Å or longer the monomer SHALL be placed at the midpoint with no shift. For a circular structure with a bond shorter than 3 Å, the bond SHALL be extended to 3 Å and all monomers past the line perpendicular to the bond SHALL be shifted so angles to the right/bottom neighbour are preserved.

#### Scenario: Short bond, linear chain

- **WHEN** a monomer is dropped on a bond shorter than 3 Å in a non-circular chain
- **THEN** the bond becomes 3 Å, the monomer sits at its midpoint, and the right/bottom part of the chain is shifted

#### Scenario: Long bond

- **WHEN** a monomer is dropped on a bond of 3 Å or longer
- **THEN** the monomer sits at the bond midpoint and nothing is shifted

#### Scenario: Short bond, circular structure

- **WHEN** a monomer is dropped on a bond shorter than 3 Å inside a circular structure
- **THEN** the bond becomes 3 Å and monomers beyond the perpendicular line shift, preserving angles to the right/bottom neighbour

---

### Requirement: Flex-mode layout for preset insertion

A phosphateless preset SHALL be inserted like a monomer with the sugar at the midpoint and the base in its default position below the sugar. For a phosphate-containing preset the bond extension SHALL be variable: with B = 0.75 Å (preset component to sugar–phosphate bond centre), A = 1.5 Å (original monomer to preset component) and α the angle between the original bond and the horizontal, side C of the resulting triangle is computed and the bond is extended to 2C if shorter. The centre of the sugar–phosphate bond SHALL be placed at the midpoint of the extended bond. The preset MAY be flipped when dropped on an antisense chain.

#### Scenario: Phosphateless preset

- **WHEN** a preset without phosphate is dropped on a bond in Flex mode
- **THEN** the sugar is at the bond midpoint and the base is below the sugar

#### Scenario: Phosphate preset on short bond

- **WHEN** a phosphate-containing preset is dropped on a bond shorter than 2C
- **THEN** the bond is extended to 2C and the sugar–phosphate bond centre is at the midpoint

#### Scenario: Orientation follows original bond

- **WHEN** the original bond is R1(C)–R2(D)
- **THEN** the new bonds are R1(C)–R2(P) and R1(R)–R2(D)
- **WHEN** the original bond is R2(C)–R1(D)
- **THEN** the mirrored arrangement is used

---

## MODIFIED Requirements

### Requirement: Dialog when no default bond can be resolved

The system SHALL ensure that the _Select Attachment Points_ dialog opens pre-populated with the target AP. In both the bond-establishment and bond-insertion flows the dialog, and the *Edit Attachment Points* dialog, SHALL show attachment points as leaving groups with an orange outline and SHALL select APs through a drop-down instead of buttons.

#### Scenario: Dialog when no default bond can be resolved

- **WHEN** the user releases a dragged monomer over a highlighted AP
- **AND** no default bond can be resolved
- **AND** the dropped monomer has two or more free APs
- **THEN** the _Select Attachment Points_ dialog opens pre-populated with the target AP

#### Scenario: New AP presentation

- **WHEN** either attachment-point dialog is open
- **THEN** leaving groups of attachment points are outlined in orange
- **AND** the AP is chosen from a drop-down
