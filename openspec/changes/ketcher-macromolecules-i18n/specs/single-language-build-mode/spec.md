## ADDED Requirements

### Requirement: Build-time flag strips all non-English locale content

The system SHALL provide a compile-time flag (`KETCHER_SINGLE_LANGUAGE_BUILD`) that, when enabled at build time, excludes every non-English locale namespace — across both `ketcher-react`'s existing namespaces and `ketcher-macromolecules`'s `macromolecules`/`macromoleculesDialogs` namespaces — from the production bundle, leaving only English content.

#### Scenario: Flagged build contains no non-English payload

- **WHEN** the production bundle is built with `KETCHER_SINGLE_LANGUAGE_BUILD=true`
- **THEN** the built output SHALL contain no `zh-CN` (or any other non-English) translation string content, verified by inspecting the build output directly (not only by runtime behavior)

#### Scenario: Unflagged build is unaffected

- **WHEN** the production bundle is built without the flag set (default)
- **THEN** all languages currently shipped SHALL remain available exactly as before this requirement was added

### Requirement: Language switcher hides when only one language is available

The system SHALL hide the language switcher control in Settings when the active build registers only one language.

#### Scenario: Single-language build shows no switcher

- **WHEN** the app runs a build produced with `KETCHER_SINGLE_LANGUAGE_BUILD=true`
- **THEN** the Settings panel SHALL NOT display a language switcher control

#### Scenario: Multi-language build shows the switcher unchanged

- **WHEN** the app runs a build produced without the flag
- **THEN** the Settings panel SHALL display the language switcher exactly as before this requirement was added
