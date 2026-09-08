## ADDED Requirements

### Requirement: Context menu structure for monomers on micromolecules canvas

The `FOR_MACROMOLECULE` right-click context menu SHALL be restructured to display items in the following order, with visual separator lines (—) between groups:

```
"Collapse Monomer" | "Expand Monomer"
"Remove Grouping"
—
"Create Monomer"
—
"Edit Monomer"
"Edit All [monomer_code] (number_of_monomers_on_canvas)"
—
"Delete"
```

#### Scenario: Context menu shows all items when right-clicking a single non-selected monomer

- **WHEN** the user right-clicks a monomer that is not currently selected
- **THEN** the context menu displays "Collapse Monomer" or "Expand Monomer", "Remove Grouping", "Create Monomer" (hidden unless multi-selection qualifies), "Edit Monomer", "Edit All [code] (n)", and "Delete" in the specified order with separators

#### Scenario: Context menu shows all items when right-clicking within a selection containing monomers

- **WHEN** the user right-clicks within a selection that contains at least one monomer
- **THEN** the context menu appears with the full monomer menu structure

---

### Requirement: "Collapse Monomer" and "Expand Monomer" retained

The "Collapse Monomer" and "Expand Monomer" items SHALL remain in the menu with their existing behaviour.

#### Scenario: "Expand Monomer" is hidden when monomer is already expanded

- **WHEN** the user right-clicks a monomer that is already expanded
- **THEN** "Expand Monomer" SHALL NOT be shown in the menu

#### Scenario: "Collapse Monomer" is hidden when monomer is already collapsed

- **WHEN** the user right-clicks a monomer that is already collapsed
- **THEN** "Collapse Monomer" SHALL NOT be shown in the menu

---

### Requirement: "Remove Grouping" item

The context menu SHALL include a "Remove Grouping" item that removes the monomer S-group abbreviation (equivalent to the former "Remove Abbreviation" action).

#### Scenario: "Remove Grouping" is enabled on right-click of a non-selected monomer

- **WHEN** the user right-clicks a non-selected monomer
- **THEN** "Remove Grouping" SHALL be visible and enabled

#### Scenario: "Remove Grouping" is enabled when selection includes at least one monomer

- **WHEN** the user right-clicks within a selection that includes at least one monomer
- **THEN** "Remove Grouping" SHALL be visible and enabled

#### Scenario: "Remove Grouping" expands a collapsed monomer

- **WHEN** the user selects "Remove Grouping" on a collapsed monomer
- **THEN** the monomer SHALL become expanded (internal atoms/bonds shown) and the grouping SHALL be removed

#### Scenario: "Remove Grouping" is disabled for ambiguous monomers

- **WHEN** the user right-clicks a monomer whose library item is ambiguous
- **THEN** "Remove Grouping" SHALL be visible but disabled with a tooltip "Cannot edit unknown or ambiguous monomers"

#### Scenario: "Remove Grouping" is disabled for unknown (unresolved) monomers

- **WHEN** the user right-clicks a monomer whose `props.unresolved` flag is `true`
- **THEN** "Remove Grouping" SHALL be visible but disabled with a tooltip "Cannot edit unknown or ambiguous monomers"

---

### Requirement: "Edit Monomer" item visibility and enabled state

The "Edit Monomer" item SHALL be visible whenever the context menu is shown for a monomer. It SHALL be enabled only when exactly one monomer is in the current context (right-click on a single non-selected monomer, or a selection that contains exactly one monomer).

#### Scenario: "Edit Monomer" is enabled for a single non-selected monomer

- **WHEN** the user right-clicks a non-selected monomer
- **THEN** "Edit Monomer" SHALL be visible and enabled

#### Scenario: "Edit Monomer" is disabled when the selection contains more than one monomer

- **WHEN** the user right-clicks within a selection that contains two or more monomers
- **THEN** "Edit Monomer" SHALL be visible but disabled

#### Scenario: "Edit Monomer" is disabled with a tooltip for multi-monomer selection

- **WHEN** "Edit Monomer" is disabled and the user hovers over it
- **THEN** a tooltip SHALL be shown (content per design-time decision)

---

### Requirement: "Edit All [code] (n)" item visibility and enabled state

The context menu SHALL include an item labelled **"Edit All [monomer_code] (number_of_monomers_on_canvas)"** where `[monomer_code]` is rendered in bold and `(n)` is the total count of that monomer on the canvas (not just selected instances).

The item SHALL be visible and enabled when the right-click target (or any item in the selection) contains instances of an identical monomer.

#### Scenario: "Edit All" item is labelled with monomer code and total count

- **WHEN** the user right-clicks a monomer whose code is "Ala" and there are 3 such monomers on canvas
- **THEN** the menu item text SHALL read "Edit All **Ala** (3)"

#### Scenario: "Edit All" is enabled on right-click of a non-selected monomer

- **WHEN** the user right-clicks a non-selected monomer
- **THEN** "Edit All [code] (n)" SHALL be visible and enabled

#### Scenario: "Edit All" is enabled when all selected monomers share the same code

- **WHEN** the user right-clicks within a selection where all monomers share the same monomer code
- **THEN** "Edit All [code] (n)" SHALL be visible and enabled

#### Scenario: "Edit All" hover highlights all matching canvas instances

- **WHEN** the user hovers over "Edit All [code] (n)"
- **THEN** all instances of that monomer on the canvas SHALL be visually highlighted as though they are hovered

#### Scenario: "Edit All" is disabled for ambiguous monomers

- **WHEN** the user right-clicks a monomer whose library item is ambiguous (mixture of alternatives)
- **THEN** "Edit All [code] (n)" SHALL be visible but disabled with a tooltip "Cannot edit unknown or ambiguous monomers"

#### Scenario: "Edit All" is disabled for unknown (unresolved) monomers

- **WHEN** the user right-clicks a monomer whose `props.unresolved` flag is `true` (monomer not found in the library)
- **THEN** "Edit All [code] (n)" SHALL be visible but disabled with a tooltip "Cannot edit unknown or ambiguous monomers"

---

### Requirement: "Create Monomer" item visibility

The "Create Monomer" item SHALL be visible and enabled only when the context is a continuous selection that contains multiple monomers, or exactly one monomer combined with a chemical structure.

#### Scenario: "Create Monomer" hidden on right-click of a single non-selected monomer with no other selection

- **WHEN** the user right-clicks a non-selected monomer (no other selection exists)
- **THEN** "Create Monomer" SHALL NOT be shown in the menu

#### Scenario: "Create Monomer" visible when selection contains multiple monomers

- **WHEN** the user right-clicks within a selection that contains two or more monomers
- **THEN** "Create Monomer" SHALL be visible and enabled

#### Scenario: "Create Monomer" visible when selection contains one monomer and a chemical structure

- **WHEN** the user right-clicks within a selection that contains exactly one monomer plus a non-monomer chemical structure
- **THEN** "Create Monomer" SHALL be visible and enabled

---

### Requirement: "Delete" item

The "Delete" item SHALL be visible and enabled at all times in the monomer context menu. It SHALL delete the monomer (and any other selected elements).

#### Scenario: "Delete" removes the right-clicked monomer when nothing is selected

- **WHEN** the user right-clicks a non-selected monomer and chooses "Delete"
- **THEN** the monomer SHALL be removed from the canvas

#### Scenario: "Delete" removes all selected elements when invoked on a selection

- **WHEN** the user right-clicks within a selection and chooses "Delete"
- **THEN** all selected elements (including the monomer) SHALL be removed from the canvas
