## ADDED Requirements

### Requirement: English-only is the default build; a flag opts into every other locale

The system SHALL ship English-only content by default. A compile-time flag (`KETCHER_MULTI_LANGUAGE_BUILD`) SHALL, when enabled at build time, include every non-English locale namespace — across both `ketcher-react`'s existing namespaces and `ketcher-macromolecules`'s `macromolecules`/`macromoleculesDialogs` namespaces — in the production bundle. Without the flag, the build SHALL contain only English content.

> **Amendment:** the flag's polarity and name were flipped from the original proposal after implementation (originally `KETCHER_SINGLE_LANGUAGE_BUILD`, default multi-language, opt-in single-language) per explicit product direction: English-only must be the default build, with multi-language as the opt-in variant. All requirements/scenarios below describe the corrected, currently-implemented behavior.

#### Scenario: Default build contains no non-English payload

- **WHEN** the production bundle is built without `KETCHER_MULTI_LANGUAGE_BUILD` set (or set to anything other than `true`)
- **THEN** the built output SHALL contain no `zh-CN` (or any other non-English) translation string content, verified by inspecting the build output directly (not only by runtime behavior)

#### Scenario: Flagged build is unaffected in language coverage

- **WHEN** the production bundle is built with `KETCHER_MULTI_LANGUAGE_BUILD=true`
- **THEN** all languages currently supported (English and Simplified Chinese) SHALL be available exactly as they were before this flag existed

### Requirement: Language switcher hides when only one language is available

The system SHALL hide the language switcher control in Settings when the active build registers only one language.

#### Scenario: Default build shows no switcher

- **WHEN** the app runs the default build (no `KETCHER_MULTI_LANGUAGE_BUILD` flag)
- **THEN** the Settings panel SHALL NOT display a language switcher control

#### Scenario: Multi-language build shows the switcher

- **WHEN** the app runs a build produced with `KETCHER_MULTI_LANGUAGE_BUILD=true`
- **THEN** the Settings panel SHALL display the language switcher, offering every supported language
