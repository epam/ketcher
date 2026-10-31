## Purpose

Provide a complete Spanish (`es`) translation of Ketcher's UI chrome in `ketcher-react` and `ketcher-macromolecules`, so the multi-language build can offer Spanish without any i18n code changes.

## ADDED Requirements

### Requirement: Complete Spanish locale coverage

The system SHALL provide an `es` translation for every key in the `en` baseline across all six `ketcher-react` namespaces (`common`, `toolbar`, `toolbars`, `dialogs`, `components`, `settings`) and both `ketcher-macromolecules` namespaces (`macromolecules`, `macromoleculesDialogs`).

#### Scenario: Every English key has a Spanish counterpart

- **WHEN** the `es` locale is loaded for either package
- **THEN** each namespace's flattened key set SHALL exactly match its `en` counterpart, with no missing keys and no orphaned keys

#### Scenario: Spanish is complete in both packages

- **WHEN** the locale resource generator scans `src/locales/`
- **THEN** it SHALL find every required namespace for `es` in both packages and register the locale in the multi-language build

### Requirement: ICU placeholders are preserved

The system SHALL preserve every ICU placeholder name used in the `en` baseline (`{count}`, `{shortcut}`, `{name}`, `{value}`, `{message}`, and similar) in the Spanish translation.

#### Scenario: Interpolation still works after switching to Spanish

- **WHEN** an English string contains a placeholder and the UI renders its Spanish translation
- **THEN** the Spanish string SHALL contain the same placeholder name, so runtime interpolation produces the same values

### Requirement: Spanish is offered by the multi-language build

When built with `KETCHER_MULTI_LANGUAGE_BUILD=true`, the system SHALL list Spanish in the Settings language control using its own endonym (`español`) and SHALL apply it without a page reload.

#### Scenario: Spanish appears in the language control

- **WHEN** Ketcher is built with `KETCHER_MULTI_LANGUAGE_BUILD=true`
- **THEN** the Settings language control SHALL include Spanish, labelled `español`

#### Scenario: Switching to Spanish updates the UI immediately

- **WHEN** the user selects Spanish
- **THEN** all currently rendered translated UI chrome SHALL update to Spanish without a page reload

#### Scenario: The choice survives a reload

- **WHEN** the user selects Spanish and reloads the page
- **THEN** the UI SHALL boot in Spanish

### Requirement: English-only build is unaffected

A build without `KETCHER_MULTI_LANGUAGE_BUILD=true` SHALL NOT include the Spanish resources or render the language control.

#### Scenario: Default build excludes Spanish

- **WHEN** Ketcher is built without the multi-language flag
- **THEN** the Spanish translation payload SHALL be absent from the bundle and the Settings language control SHALL NOT render

### Requirement: Chemistry vocabulary remains untranslated

Switching to Spanish SHALL NOT change chemistry data: element symbols, bond-type names as shown in the bond toolbar and context menu, MDL/SDF format codes, and numeric/valence notation SHALL remain identical to their English rendering.

#### Scenario: Structures and chemistry labels are unchanged

- **WHEN** the user switches the UI to Spanish with a structure loaded
- **THEN** the structure, element symbols, bond-type names, format codes and valence notation SHALL render exactly as before the switch
