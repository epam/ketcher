## ADDED Requirements

### Requirement: CSS logical properties in UI-chrome stylesheets

`ketcher-react` UI-chrome stylesheets SHALL use CSS logical directional properties (`inset-inline-start/end`, `margin-inline-start/end`, `padding-inline-start/end`, `border-inline-start/end`, `text-align: start/end`) instead of physical directional properties (`left`/`right`), so a future RTL locale can render correctly without a second styling pass.

#### Scenario: LTR layout is visually unchanged after conversion

- **WHEN** a stylesheet's physical directional properties are converted to logical equivalents
- **THEN** the rendered layout in LTR mode SHALL be pixel-equivalent to before the conversion

#### Scenario: Canvas styles are excluded from conversion

- **WHEN** the logical-properties audit runs
- **THEN** styles governing the `StructEditor` chemical structure canvas rendering SHALL be excluded, since the canvas must never mirror regardless of locale direction

---

### Requirement: Directional icon inventory

The system SHALL produce a documented inventory of `ketcher-react` UI-chrome icons that are direction-sensitive (require mirroring under RTL) versus direction-neutral, as an artifact for a future RTL-locale change.

#### Scenario: Inventory distinguishes direction-sensitive icons

- **WHEN** the icon inventory is produced
- **THEN** each UI-chrome icon SHALL be classified as either requiring mirroring under RTL or not, with its file location recorded

#### Scenario: No mirroring CSS is implemented yet

- **WHEN** the inventory task completes
- **THEN** no `[dir="rtl"]` mirroring CSS SHALL be implemented as part of this change, since no RTL locale ships yet — the inventory is preparatory only