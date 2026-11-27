## ADDED Requirements

### Requirement: Atom label types rendered correctly

Each atom SHALL display a label depending on its type. The label type is determined in priority order:

1. **Atom allow-list** — elements the atom can be: `[C,N,O]`
2. **Atom not-list** — elements the atom cannot be: `![C,N,O]`
3. **Pseudo atom** — a custom textual label (e.g. `Val`, `Pol`)
4. **Alias** — a user-assigned display name (e.g. `Ala`, `Me`)
5. **R-group** — an R-group attachment point label (e.g. `R1`, `R1R3`)
6. **Regular element symbol** — the standard periodic-table symbol (e.g. `C`, `N`, `Fe`)

#### Scenario: Atom allow-list label displayed

- **WHEN** an atom whose label type is an allow-list (e.g. C, N, O) is on the macromolecules canvas
- **THEN** the label SHALL be displayed as `[C,N,O]`

#### Scenario: Atom not-list label displayed

- **WHEN** an atom whose label type is a not-list (e.g. excluding C and N) is on the macromolecules canvas
- **THEN** the label SHALL be displayed as `![C,N]`

#### Scenario: Single-element atom list label displayed

- **WHEN** an atom list contains exactly one element (e.g. only O)
- **THEN** the label SHALL be displayed as `[O]`

#### Scenario: Pseudo atom label displayed

- **WHEN** an atom whose label type is a pseudo atom (e.g. `Val`) is on the macromolecules canvas
- **THEN** the label SHALL be displayed as the pseudo text, e.g. `Val`

#### Scenario: Alias label displayed

- **WHEN** an atom has an alias assigned (e.g. `Me`) and is on the macromolecules canvas
- **THEN** the label SHALL be displayed as the alias text, e.g. `Me`

#### Scenario: R-group label displayed

- **WHEN** an atom configured as an R-group attachment point (e.g. R1) is on the macromolecules canvas
- **THEN** the label SHALL be displayed as `R1`

#### Scenario: Multiple R-groups on one atom

- **WHEN** an atom is assigned to multiple R-groups (e.g. R1 and R3) and is on the macromolecules canvas
- **THEN** the label SHALL be displayed as `R1R3`

#### Scenario: Regular element symbol displayed

- **WHEN** an atom has no list, alias, pseudo, or R-group assignment and is on the macromolecules canvas
- **THEN** the label SHALL be displayed as the element symbol, e.g. `C`, `N`, `Fe`

### Requirement: Long atom labels are truncated on canvas with a hover tooltip

When a label text is longer than 8 characters, only the first 8 characters SHALL be shown on the canvas followed by `...`, matching the truncation behaviour of micromolecules mode. Hovering over the truncated label SHALL show the full label text in a tooltip overlay.

#### Scenario: Long atom list label truncated

- **WHEN** an atom list produces a label longer than 8 characters (e.g. `[C,N,O,Cl,Br]` — 13 characters)
- **THEN** the canvas SHALL display `[C,N,O,C...` (first 8 characters + `...`)

#### Scenario: Short atom list label not truncated

- **WHEN** an atom list produces a label of 8 characters or fewer (e.g. `[C,N,O]` — 7 characters)
- **THEN** the canvas SHALL display the full label `[C,N,O]` without truncation

#### Scenario: Hover over truncated label shows full text tooltip

- **WHEN** the user hovers over an atom whose canvas label is truncated (e.g. displays `[C,N,O,C...`)
- **THEN** a tooltip overlay SHALL appear showing the full label text, e.g. `[C,N,O,Cl,Br]`

#### Scenario: Hover over non-truncated label shows no tooltip

- **WHEN** the user hovers over an atom whose label is 8 characters or fewer
- **THEN** no tooltip overlay SHALL appear for that atom

### Requirement: Atom list label preserved when switching between modes

When the user switches from micromolecules mode to macromolecules mode and then back to micromolecules mode, the atom list label SHALL remain unchanged.

#### Scenario: Round-trip mode switch preserves atom list label

- **WHEN** a structure containing an atom is open in micromolecules mode
- **AND** the user switches to macromolecules mode and then back to micromolecules mode
- **THEN** the atom SHALL still be displayed in same way
