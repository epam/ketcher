## ADDED Requirements

### Requirement: i18n library initialization with English baseline

The system SHALL initialize `react-i18next` with an `i18next-icu`-enabled instance and load an English baseline locale for `ketcher-react` on application start.

#### Scenario: App boots with English text unchanged

- **WHEN** `ketcher-react` starts with no locale explicitly selected
- **THEN** the UI SHALL render the same English text as before the i18n migration, resolved through the translation-key system

#### Scenario: Missing translation key falls back visibly

- **WHEN** a `t()` call references a key that does not exist in the loaded namespace
- **THEN** the system SHALL render a visibly identifiable fallback (e.g. the key itself) rather than blank text, so missing extractions are easy to spot during development

---

### Requirement: Translation-key naming convention and namespace layout

The system SHALL organize translation keys under a fixed, documented convention (`<domain>.<subarea>.<element>`) and locale files under `packages/ketcher-react/src/locales/en/<namespace>.json`, one namespace per top-level UI directory group, plus a shared `common` namespace for cross-cutting duplicated strings.

#### Scenario: Duplicated strings resolve to a single shared key

- **WHEN** the same UI text (e.g. "Cancel", "OK") is needed in more than one namespace
- **THEN** it SHALL be defined once under `common.json` and referenced from other namespaces rather than duplicated

---

### Requirement: LTR/RTL `dir` switching scoped to UI chrome only

The system SHALL provide a mechanism to set the `dir` attribute on the UI-chrome root wrapper based on the active locale, while the structure-rendering canvas (`StructEditor`) SHALL always render with `dir="ltr"` regardless of the active locale.

#### Scenario: Canvas is never mirrored

- **WHEN** the UI-chrome `dir` is set to `rtl` (in a future RTL-enabled locale)
- **THEN** the `StructEditor` canvas subtree SHALL still render with `dir="ltr"`, so molecule/reaction geometry is never visually mirrored

#### Scenario: Default direction is LTR

- **WHEN** no locale or an LTR locale (e.g. English) is active
- **THEN** the UI-chrome root wrapper SHALL have `dir="ltr"`