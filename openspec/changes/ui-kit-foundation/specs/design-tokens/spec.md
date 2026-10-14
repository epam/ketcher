## ADDED Requirements

### Requirement: Single token source for UI chrome

UI-chrome design values (colours, typography, radii, shadows, borders, transitions, z-indices, and spacing when needed) SHALL be defined once as `--ketcher-*` CSS custom properties in a two-tier model:

- **primitive tokens**, which hold raw values;
- **semantic tokens**, which reference primitives.

Kit components SHALL reference only semantic tokens.

#### Scenario: A token change reaches every styling system

- **WHEN** a semantic token's value is changed
- **THEN** kit components, `ketcher-react` LESS styles that use the matching LESS variable, and macromolecules Emotion styles that use the matching UI-chrome theme key SHALL all render the new value, without editing those consumers

#### Scenario: The canvas is not driven by UI tokens

- **WHEN** a UI-chrome token is changed
- **THEN** the structure and macromolecule canvas rendering SHALL be unaffected

---

### Requirement: Pixel-neutral token seeding

Token values SHALL be seeded from the current `ketcher-react` LESS variables and the current macromolecules default theme, so introducing tokens causes no visual change. Where the two packages use different values for the same role, both values SHALL be kept as separate tokens, and the difference SHALL be recorded in a token discrepancy list.

#### Scenario: E2E baselines are unchanged by the foundation

- **WHEN** the foundation sub-project is merged
- **THEN** the existing Playwright e2e suite SHALL pass without any baseline image being updated

#### Scenario: Discrepancies are recorded

- **WHEN** the two packages define different values for the same semantic role
- **THEN** the discrepancy list SHALL record the role, both values and both source locations

---

### Requirement: Token placement and overriding

Default token values SHALL be declared on `:root`. A host application or an individual editor instance SHALL be able to override any token by declaring it on any ancestor element of the editor, and the nearest declaration SHALL win.

#### Scenario: Host overrides a token for one editor

- **WHEN** a host declares `--ketcher-color-accent` on the wrapper element of one of two Ketcher instances on a page
- **THEN** only that instance's UI chrome SHALL use the overridden value

#### Scenario: Content portaled to the body resolves tokens

- **WHEN** a not-yet-migrated MUI popover renders into `<body>` and its styles reference `var(--ketcher-*)`
- **THEN** the tokens SHALL resolve to their default values

---

### Requirement: LESS consumes tokens

`ketcher-react`'s shared LESS variables SHALL resolve to the corresponding `var(--ketcher-*)` custom properties. LESS colour functions SHALL NOT be applied to token-backed variables:

- each `fade()` SHALL be expressed with `color-mix()` against `transparent`;
- each `lighten()`, `darken()` and `mix()` SHALL be replaced by a primitive token holding its previously compiled value.

#### Scenario: fade is converted without pixel change

- **WHEN** a LESS rule that used `fade(@color, 20%)` is converted to `color-mix(in srgb, var(--…) 20%, transparent)`
- **THEN** the rendered colour SHALL be identical to before

#### Scenario: Leftover colour functions fail the build

- **WHEN** a LESS colour function is applied to a token-backed variable
- **THEN** the build SHALL fail rather than emit incorrect CSS

---

### Requirement: Emotion theme consumes tokens for UI chrome only

The UI-chrome keys of the macromolecules default theme SHALL hold `var(--ketcher-*)` references. Theme keys read by the `ketcher-core` canvas renderer SHALL keep literal values. The duplicated `theme.less` custom-property file SHALL be removed.

#### Scenario: Canvas colours are unaffected

- **WHEN** the Emotion bridge is applied
- **THEN** monomer, peptide and other canvas colours SHALL render identically, because the canvas still receives literal values

#### Scenario: JS colour maths is not broken

- **WHEN** a theme value is passed to a JavaScript colour or string function
- **THEN** that key SHALL either keep a literal value or have its consumer converted to CSS before the key becomes a `var()` reference

---

### Requirement: Theming API for hosts

Overriding `--ketcher-*` custom properties SHALL be the supported way to theme UI chrome. The macromolecules `theme` prop SHALL keep controlling the canvas palette. Its UI-chrome overrides SHALL be deprecated and documented as such in the changelog.

#### Scenario: Canvas palette via the theme prop still works

- **WHEN** a host passes `theme` with a modified monomer colour scheme to the macromolecules editor
- **THEN** the canvas SHALL render with the modified scheme

#### Scenario: Chrome override via the theme prop is deprecated

- **WHEN** a release migrates a component whose look a host could previously override through `theme`
- **THEN** that release's changelog SHALL state that the override no longer applies and name the replacement `--ketcher-*` custom properties
