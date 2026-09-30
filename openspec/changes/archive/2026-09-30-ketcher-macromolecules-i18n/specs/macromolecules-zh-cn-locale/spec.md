## ADDED Requirements

### Requirement: Simplified Chinese (`zh-CN`) content for `ketcher-macromolecules` namespaces

The system SHALL provide `zh-CN` translation content for every key in the `macromolecules` and `macromoleculesDialogs` namespaces, registered into the same shared `i18next` instance and reachable through the existing language switcher — no new switcher or persistence mechanism is introduced.

#### Scenario: Switching to Chinese translates the macromolecules editor

- **WHEN** the user selects Chinese via the existing Settings language switcher
- **THEN** `ketcher-macromolecules`'s toolbars, menus, dialogs, monomer library, context menus, properties panel, and preview tooltips SHALL render in Simplified Chinese

#### Scenario: Key parity between `en` and `zh-CN`

- **WHEN** the `macromolecules`/`macromoleculesDialogs` namespace files are compared between `en` and `zh-CN`
- **THEN** every key present in one SHALL be present in the other, verified by an automated regression test

### Requirement: Translation content flagged for native-speaker review

The system's `zh-CN` content for `ketcher-macromolecules` is authored by Claude and SHALL be flagged as requiring a native-speaker/professional review pass before being considered production-quality, consistent with the same caveat applied to `ketcher-react`'s `zh-CN` content.

#### Scenario: Translation quality caveat is documented

- **WHEN** this change is archived
- **THEN** the memory bank SHALL note that `ketcher-macromolecules`'s `zh-CN` content, like `ketcher-react`'s, has not received native-speaker sign-off