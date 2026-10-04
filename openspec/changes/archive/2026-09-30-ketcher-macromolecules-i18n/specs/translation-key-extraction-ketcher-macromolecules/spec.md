## ADDED Requirements

### Requirement: Hardcoded UI strings in `ketcher-macromolecules` resolve through translation keys

The system SHALL replace hardcoded English string literals in `packages/ketcher-macromolecules/src/**` UI code (toolbars, menus, dialogs, monomer library, context menus, properties panel, preview tooltips, shared components, hooks, helpers) with `t()`/`resolveTranslatableText` calls resolved against the `macromolecules`/`macromoleculesDialogs` namespaces.

#### Scenario: App boots with English text unchanged

- **WHEN** `ketcher-macromolecules` renders with no locale explicitly selected (English default)
- **THEN** the UI SHALL render the same English text as before extraction

#### Scenario: Missing translation key falls back visibly

- **WHEN** a `t()` call in `ketcher-macromolecules` references a key that does not exist in the loaded namespace
- **THEN** the system SHALL render a visibly identifiable fallback rather than blank text

### Requirement: Chemistry/domain data is never translated

The system SHALL leave chemistry-meaningful data untranslated in `ketcher-macromolecules`, even where it renders as visible text: monomer/HELM codes, sequence letters (A/T/G/C/U and ambiguity codes), natural-analogue codes, format identifiers (FASTA/HELM/IDT), and numeric/positional notation.

#### Scenario: Sequence letters are not routed through `t()`

- **WHEN** a nucleotide/peptide sequence renders on the canvas or in a sequence-mode view
- **THEN** the individual sequence letters SHALL remain literal characters, not translation-key lookups, regardless of active UI language

### Requirement: Module-scope schema/data-derived UI text resolves reactively

Where `ketcher-macromolecules` builds context-menu submenus or dialog content from a schema/data structure at module scope (outside a component's render), the system SHALL resolve any translatable text from that structure reactively to the active language, not frozen at first import.

#### Scenario: Language switch updates a schema-derived context menu without reload

- **WHEN** the user switches the active language and then opens a context menu whose items are derived from a module-level schema/data structure
- **THEN** the menu SHALL display text in the newly selected language without requiring a full page reload