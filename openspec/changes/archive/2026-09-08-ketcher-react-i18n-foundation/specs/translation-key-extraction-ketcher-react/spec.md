## ADDED Requirements

### Requirement: Hardcoded UI strings replaced with translation keys

All user-facing English string literals in `ketcher-react`'s toolbar/menu actions, toolbars, modal dialogs, reusable UI components, and settings panel SHALL be replaced with `t()` calls resolving against the English baseline locale, with no visible text change to the end user.

#### Scenario: Extracted UI renders identical English text

- **WHEN** a previously hardcoded string (e.g. a toolbar action title) is extracted into a translation key
- **THEN** the rendered UI SHALL show the exact same English text as before extraction

#### Scenario: Interpolated strings preserve dynamic values

- **WHEN** a string previously built via template-literal interpolation (e.g. a count like "Edit All Sugar (12)") is extracted
- **THEN** the extracted key SHALL use ICU message formatting to preserve the same dynamic value in the rendered output

---

### Requirement: Structure-rendering canvas text is out of scope

Text or labels rendered inside the `StructEditor` SVG canvas itself (as opposed to its surrounding UI chrome) SHALL NOT be extracted as part of this capability.

#### Scenario: Canvas-internal rendering is unaffected

- **WHEN** the extraction pass runs over `StructEditor`
- **THEN** only its surrounding UI chrome (toolbars, overlays) SHALL be modified; content rendered inside the chemical structure SVG canvas SHALL remain unchanged