## ADDED Requirements

### Requirement: Kit location and single entry point

The UI kit SHALL live in a self-contained folder inside `ketcher-react` and SHALL expose its public surface through one entry module, which `ketcher-react` re-exports. `ketcher-macromolecules` SHALL consume kit components only through `'ketcher-react'`. No new npm package SHALL be published for the kit.

#### Scenario: One runtime copy

- **WHEN** a host renders both the molecules and the macromolecules editor
- **THEN** exactly one copy of the kit's components and providers SHALL be loaded

#### Scenario: Kit CSS reaches hosts through the existing stylesheet

- **WHEN** a host imports `ketcher-react/dist/index.css` as it does today
- **THEN** all kit styles SHALL be included, with no additional import or setup step

---

### Requirement: Enforced import boundaries

Lint rules SHALL enforce that:

- kit code imports only kit code, the headless library, React and the class-name utility;
- code outside the kit imports kit code only through the kit entry module;
- no file outside an explicit allowlist imports `@mui/*` or `@emotion/*`.

#### Scenario: Kit code reaches into editor code

- **WHEN** a kit file imports from `ketcher-core`, Redux state, i18n or any non-kit `ketcher-react` module
- **THEN** linting SHALL fail

#### Scenario: New MUI usage is introduced

- **WHEN** a file not on the allowlist imports from `@mui/material`
- **THEN** linting SHALL fail

#### Scenario: Deep import of kit internals

- **WHEN** code outside the kit imports a kit component by its internal file path
- **THEN** linting SHALL fail

---

### Requirement: Kit provider with portal container and direction

Each editor root (molecules and macromolecules) SHALL mount a kit provider that supplies:

- a portal container, which SHALL be a dedicated element placed as a direct child of that editor root;
- the text direction taken from the consumer's active language.

Kit overlays (tooltips, popovers, menus, dialogs) SHALL render into that portal container.

#### Scenario: Overlay inherits the editor's tokens and direction

- **WHEN** a kit tooltip opens inside an editor whose language is right-to-left and whose wrapper overrides a token
- **THEN** the tooltip SHALL render inside the editor root, use the overridden token and lay out right-to-left

#### Scenario: Overlay in fullscreen mode

- **WHEN** the editor is in fullscreen mode and a kit tooltip opens
- **THEN** the tooltip SHALL be visible and positioned next to its anchor

#### Scenario: Overlay is not clipped by panels

- **WHEN** a kit tooltip's anchor sits inside a scrolling or `overflow: hidden` panel
- **THEN** the tooltip SHALL NOT be clipped by that panel

---

### Requirement: Component contract

Every kit component SHALL:

- define its own prop types, without exposing headless-library types;
- merge a `className` prop onto its root element;
- pass `data-*` and `aria-*` attributes (including `data-testid`) through to its root element;
- forward refs in a way that works on React 18.2 and 19;
- express `variant` and `size` props as `data-variant` and `data-size` attributes;
- support controlled and uncontrolled use where it holds a value;
- accept all user-visible text as props or children, without translating it.

Kit modules SHALL NOT access `window` or `document` at module scope.

#### Scenario: Test IDs survive migration

- **WHEN** a call site migrates from a legacy component to the kit component and passes the same `data-testid`
- **THEN** the same `data-testid` SHALL appear on the equivalent rendered element

#### Scenario: Server-side import

- **WHEN** a kit component module is imported in a server-side rendering environment
- **THEN** the import SHALL NOT throw

---

### Requirement: Kit styling rules

Kit styles SHALL be written as plain CSS Modules (`.module.css`) and SHALL:

- use only class selectors, optionally combined with attribute or state selectors;
- use no element selectors, no `:global` and no `!important`;
- use logical CSS properties instead of physical left/right properties;
- take design values only from `--ketcher-*` tokens.

Kit styles SHALL NOT be placed in a cascade layer during the migration. Style linting SHALL enforce these rules inside the kit folder.

#### Scenario: Forbidden construct in kit CSS

- **WHEN** a kit stylesheet contains `!important`, `:global` or `margin-left`
- **THEN** style linting SHALL fail

---

### Requirement: Icon moved into the kit without API change

The `Icon` component and its `IconName` type SHALL move into the kit and SHALL remain importable from `'ketcher-react'` with unchanged props and names.

#### Scenario: Existing Icon imports keep working

- **WHEN** macromolecules code imports `Icon` and `IconName` from `'ketcher-react'` after the move
- **THEN** it SHALL compile and render identically, without changes at the call site

---

### Requirement: Tooltip pilot

A kit `Tooltip` built on the headless library SHALL replace every MUI `Tooltip` usage in `ketcher-react` and `ketcher-macromolecules`, and render pixel-identically to the current tooltips.

#### Scenario: No MUI Tooltip remains

- **WHEN** the pilot is complete
- **THEN** no source file in either UI package SHALL import `Tooltip` from `@mui/material`

#### Scenario: Pilot passes the migration gates

- **WHEN** the pilot PR is evaluated
- **THEN** it SHALL show zero story screenshot diff and pass the e2e suite with no baseline updates
