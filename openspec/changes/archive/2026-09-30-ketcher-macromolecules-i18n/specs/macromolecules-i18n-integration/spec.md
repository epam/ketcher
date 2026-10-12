## ADDED Requirements

### Requirement: `ketcher-macromolecules` reuses the shared `i18next` instance

The system SHALL register `ketcher-macromolecules`'s translation namespaces into the same `i18next` instance already shared with `ketcher-react`, without creating a second provider, a second language switcher, or a second persisted-language mechanism.

#### Scenario: Language switch in Settings affects both editors

- **WHEN** the user changes the active language via the existing Settings language switcher
- **THEN** both `ketcher-react`'s UI chrome and `ketcher-macromolecules`'s UI chrome SHALL reflect the new language, since both render inside the same `<I18nextProvider>`

#### Scenario: `ketcher-macromolecules` declares its i18n dependency explicitly

- **WHEN** `packages/ketcher-macromolecules/package.json` is inspected
- **THEN** `react-i18next` SHALL be listed as an explicit dependency, not only reachable via npm-workspace hoisting of `ketcher-react`'s copy

### Requirement: Two new namespaces, `macromolecules` and `macromoleculesDialogs`

The system SHALL organize `ketcher-macromolecules` translation keys under two namespaces — `macromolecules` for always-visible chrome and `macromoleculesDialogs` for modal dialogs/monomer library/context menus — loaded from `packages/ketcher-macromolecules/src/locales/<locale>/<namespace>.json`, following the same `<namespace>:<key.path>` convention as `ketcher-react`'s existing six namespaces.

#### Scenario: Cross-cutting strings reuse the existing `common` namespace

- **WHEN** a string in `ketcher-macromolecules` duplicates an existing `common` namespace string (e.g. Cancel/OK/Apply/Close)
- **THEN** it SHALL resolve through `common:*` rather than being redefined in `macromolecules`/`macromoleculesDialogs`

### Requirement: RTL-safe styling for `ketcher-macromolecules` chrome

The system SHALL use logical CSS properties (via Emotion `css`/`styled` templates and MUI `sx` props) instead of physical directional properties in `ketcher-macromolecules` UI-chrome styling, excluding anything tied to sequence/canvas-rendering geometry.

#### Scenario: Sequence and monomer canvas rendering is never mirrored

- **WHEN** a future RTL locale sets `dir="rtl"` on the UI-chrome root
- **THEN** sequence letters, monomer/bond canvas positions, and other chemistry-meaningful geometry in `ketcher-macromolecules` SHALL continue to render left-to-right, unaffected by the chrome's direction