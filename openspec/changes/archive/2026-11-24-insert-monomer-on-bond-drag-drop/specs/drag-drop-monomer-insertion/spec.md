## ADDED Requirements

### Requirement: Bond insertion indicator

While the user drags a library monomer or preset and the cursor is within the bond-proximity threshold of a polymer bond, the system SHALL show a circle on that bond. The circle SHALL be larger when the cursor is within the closer threshold. The indicator SHALL NOT be shown while a replacement target is active. When both the bond indicator and an attachment-point highlight are within range at the same time and no replacement target is active, the system SHALL show only whichever is geometrically closer to the cursor and suppress the other.

#### Scenario: Indicator appears near a bond

- **WHEN** the user drags a library monomer within the outer threshold of a polymer bond
- **THEN** a small circle appears on the bond

#### Scenario: Indicator grows when closer

- **WHEN** the cursor moves within the inner threshold of the bond
- **THEN** the circle on the bond becomes larger

#### Scenario: Indicator clears

- **WHEN** the cursor leaves the outer threshold, the drag is cancelled, or the item is dropped
- **THEN** the circle is removed

#### Scenario: Replacement always takes priority

- **WHEN** a replacement target is active, regardless of its distance from the cursor
- **THEN** no bond indicator and no attachment-point highlight is shown

#### Scenario: AP highlight and bond indicator compete by distance

- **WHEN** no replacement target is active
- **AND** the cursor is within range of both a free attachment point and a polymer bond
- **THEN** whichever of the two is geometrically closer to the cursor is shown
- **AND** the other is suppressed

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

On each side, the new monomer's AP SHALL be the complement of the original monomer's AP on that side (R1↔R2), except that a sugar bonds to a base through R3 (sugar)–R1 (base). This single rule is what makes R1–R2 the default between amino acids, between sugars and phosphates, and between unsplit nucleotides and sugars or phosphates — those pairings never reach the sugar/base case, so they always resolve through the R1↔R2 complement. If an original AP is neither R1 nor R2 (and the sugar/base case does not apply), or the resolved AP is not free on the new monomer, or both sides resolve to the same AP, no default connection exists for that side. For a preset, only the sugar and the phosphate (if present) SHALL be used for the two new bonds.

#### Scenario: Amino acid between amino acids

- **WHEN** an amino acid is dropped on an R2 (left) – R1 (right) bond between amino acids
- **THEN** the bonds are R2 (left) – R1 (new) and R2 (new) – R1 (right)

#### Scenario: No default when the original AP is not R1, R2, or the sugar/base case

- **WHEN** an original monomer is bonded through an AP other than R1 or R2, and the sugar/base R3–R1 case does not apply
- **THEN** no default AP can be resolved for that side and the dialog opens instead

#### Scenario: Preset uses sugar and phosphate

- **WHEN** a phosphate-containing preset is dropped on a bond
- **THEN** the two new bonds attach to the preset's sugar and phosphate, and the base is bonded to the sugar as in the preset

---

### Requirement: Select Attachment Points dialog when no default connection exists

If no default connection exists and the dropped monomer has two or more APs, the system SHALL open a single *Select Attachment Points* dialog showing all three monomers (left original, new, right original). The new monomer SHALL show two AP button groups — one for each new bond. The two groups SHALL never have the same AP selected: picking an AP already selected in the other group SHALL move that group's previous selection into the group being changed, instead of being blocked. After the user picks both APs and clicks **Connect**, the monomer SHALL be inserted in one step.

#### Scenario: Dialog opens

- **WHEN** a monomer with two or more APs is dropped on a bond and no default connection exists
- **THEN** the *Select Attachment Points* dialog opens showing the left original monomer, the new monomer, and the right original monomer

#### Scenario: Original monomer APs are pre-populated

- **WHEN** the dialog is open
- **THEN** the left and right original monomers show their bond APs as fixed labels (not selectable)
- **AND** the new monomer shows two AP button groups for choosing its left-side and right-side APs
- **AND** a 50px-tall `#B4B9D6` separator line sits between the left-side and right-side AP button groups

#### Scenario: AP presentation matches the existing dialogs

- **WHEN** this dialog is open
- **THEN** a selected attachment point on any of the three structure previews shows the same filled blue pill as the bond-establishment and *Edit Attachment Points* dialogs
- **AND** opening this dialog does not change the presentation of the bond-establishment or *Edit Attachment Points* dialogs

#### Scenario: Swapping the new monomer's APs

- **WHEN** the new monomer's left-side AP button group has AP X selected and the right-side group has AP Y selected
- **AND** the user selects AP Y in the left-side group
- **THEN** the left-side group has AP Y selected
- **AND** the right-side group has AP X selected

#### Scenario: Connect inserts the monomer

- **WHEN** the user selects both APs on the new monomer and clicks **Connect**
- **THEN** the monomer is inserted between the original monomers using the selected APs in a single step

#### Scenario: Many APs stay within the dialog's width

- **WHEN** the dropped monomer has more APs than fit on one line
- **THEN** its AP options wrap onto additional lines
- **AND** the dialog keeps its normal width instead of growing to fit them on one line

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

In Snake mode the system SHALL run the snake layout after insertion. The insertion and the layout SHALL be a single undo step, so that undoing the insertion also reverts the layout and leaves no stray bonds on the canvas.

#### Scenario: Layout triggered

- **WHEN** an item is inserted on a bond in Snake mode
- **THEN** the snake layout runs and repositions the chain

#### Scenario: Undo in Snake mode

- **WHEN** an item is inserted on a bond in Snake mode and the user undoes
- **THEN** the new monomer and bonds are removed, the original bond is restored, and no extra bonds remain on the canvas

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

A phosphateless preset SHALL be inserted like a monomer with the sugar at the midpoint and the base placed perpendicular to the bond direction at the standard side-chain distance (`SnakeLayoutCellWidth / macroModeScale`). For a phosphate-containing preset, B = 0.75 Å (component offset from midpoint along bond) and A = 1.5 Å (external bond length from original monomer to preset component). The minimum extended bond is 2*(A+B) = 4.5 Å, independent of bond angle. The bond SHALL be extended to 2*(A+B) if shorter. The centre of the sugar–phosphate bond SHALL be placed at the midpoint of the extended bond, giving external bonds of exactly A. The base SHALL be placed perpendicular to the sugar–phosphate bond at the standard side-chain distance. The preset MAY be flipped when dropped on an antisense chain.

#### Scenario: Phosphateless preset

- **WHEN** a preset without phosphate is dropped on a bond in Flex mode
- **THEN** the sugar is at the bond midpoint and the base is perpendicular to the bond at the standard side-chain distance

#### Scenario: Phosphate preset base position

- **WHEN** a phosphate-containing preset is dropped on a bond in Flex mode
- **THEN** the base is placed perpendicular to the sugar–phosphate axis at the standard side-chain distance (90° to sugar–phosphate)

#### Scenario: Phosphate preset on short bond

- **WHEN** a phosphate-containing preset is dropped on a bond shorter than 2C
- **THEN** the bond is extended to 2C and the sugar–phosphate bond centre is at the midpoint

#### Scenario: Orientation follows original bond

- **WHEN** the original bond is R1(C)–R2(D)
- **THEN** the new bonds are R1(C)–R2(P) and R1(R)–R2(D)
- **WHEN** the original bond is R2(C)–R1(D)
- **THEN** the mirrored arrangement is used

