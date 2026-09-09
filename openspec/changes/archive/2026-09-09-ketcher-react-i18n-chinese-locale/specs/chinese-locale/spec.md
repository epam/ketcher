## ADDED Requirements

### Requirement: Simplified Chinese (`zh-CN`) locale content

The system SHALL provide a `zh-CN` translation for every key present in the `en` baseline locale, registered alongside `en` in the i18n resource bundle.

#### Scenario: Every English key has a Chinese counterpart

- **WHEN** the `zh-CN` locale is loaded
- **THEN** every namespace's flattened key set SHALL exactly match its `en` counterpart — no missing keys (which would silently fall back to English or a raw key) and no orphaned keys (translated content with nothing to attach to)

#### Scenario: ICU interpolation placeholders are preserved

- **WHEN** an `en` string contains an ICU placeholder (e.g. `{name}`, `{count}`)
- **THEN** the `zh-CN` translation SHALL preserve the same placeholder name, so runtime interpolation continues to work after switching languages

### Requirement: User-facing language switcher

The system SHALL provide a control in the Settings dialog that lets the user switch the active UI language between the registered locales, taking effect immediately without requiring the dialog's Apply action.

#### Scenario: Switching language updates the UI immediately

- **WHEN** the user selects a different language from the Settings language control
- **THEN** all currently rendered translated text SHALL update to the new language without a page reload

#### Scenario: Language choice is not tied to the settings Apply/Cancel flow

- **WHEN** the user changes the language and then clicks Settings' Cancel button
- **THEN** the language change SHALL persist (Cancel only discards molecule-rendering settings changes, not the language choice)

### Requirement: Persisted language choice

The system SHALL remember the user's chosen language across page reloads.

#### Scenario: Language survives a reload

- **WHEN** the user selects a non-default language and reloads the page
- **THEN** the UI SHALL boot in the previously selected language

#### Scenario: No prior choice falls back to English

- **WHEN** no language has been previously selected (or the stored value is invalid)
- **THEN** the UI SHALL boot in English

### Requirement: Reactive `dir` on live language switch

The system SHALL update the UI-chrome root wrapper's `dir` attribute immediately when the language changes at runtime, not only on the next full page load.

#### Scenario: `dir` recomputes without a reload

- **WHEN** the active language changes at runtime
- **THEN** the UI-chrome root wrapper SHALL re-evaluate its `dir` attribute against the new language without requiring a page reload
