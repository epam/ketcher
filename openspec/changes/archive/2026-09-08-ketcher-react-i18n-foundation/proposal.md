## Why

Ketcher has no internationalization (i18n) infrastructure today: no translation library, no locale files, and no translation-key abstraction. All user-facing UI text is hardcoded English literals baked directly into `title:`/`label:` object props, JSX text nodes, and error/warning messages (~370 string instances across ~370 files-equivalent surface in `ketcher-react` alone — see prior scoping). Before any language (e.g. Chinese) can be added, `ketcher-react` — the small-molecule editor UI — needs a translation-key foundation, an extraction pass over its hardcoded strings, and groundwork for LTR/RTL layout switching, since retrofitting RTL after the fact would require a second pass over the same CSS.

## What Changes

- Introduce `react-i18next` + `i18next-icu` into `ketcher-react` as the i18n library, with an English-only baseline locale (no other language content is authored in this change).
- Define and document a translation-key naming convention and locale file structure (`packages/ketcher-react/src/locales/en/*.json`), including a shared `common` namespace for duplicated strings (Cancel/OK/Apply/monomer-type labels etc.).
- Extract hardcoded English strings in `ketcher-react` into translation keys, wired through the new i18n provider, covering: toolbar/menu action definitions, toolbars, modal dialogs (domain-specific and shared), reusable UI components (tooltips, context menu, wizard, struct editor chrome), and the settings panel.
- Add a `dir` (LTR/RTL) switching mechanism on the UI-chrome root wrapper, explicitly excluding the structure-rendering canvas (`StructEditor`) so molecule/reaction rendering is never mirrored.
- Audit and convert CSS/LESS physical directional properties (`left`/`right`, `margin-left`/`margin-right`, etc.) to logical properties (`inset-inline-start/end`, `margin-inline-start/end`, etc.) across `ketcher-react` UI-chrome stylesheets, and inventory directional icons that will need mirroring under RTL.

## Capabilities

### New Capabilities

- `i18n-infrastructure`: react-i18next + i18next-icu setup, provider wiring, key-naming convention, locale file structure, and the LTR/RTL `dir`-switching mechanism scoped to UI chrome only.
- `translation-key-extraction-ketcher-react`: Replacement of hardcoded English UI strings in `ketcher-react` with translation keys resolved against the English baseline locale.
- `rtl-layout-foundation`: CSS logical-property conversion and directional-icon inventory in `ketcher-react`, enabling a future RTL locale to render correctly without touching the structure-rendering canvas.

### Modified Capabilities

<!-- No existing spec-level capabilities are changing in this ticket. -->

## Impact

- `ketcher-react`: new i18n init module, locale JSON files, provider wiring at app root; every file under `script/ui/action/*`, `script/ui/views/toolbars/*`, `script/ui/views/modal/components/*`, `script/ui/views/components/*`, and the settings panel is touched to replace literals with `t('key')` calls.
- `ketcher-react` stylesheets: LESS/CSS files with physical directional properties are converted to logical properties; no visual change in LTR mode is expected — this is a groundwork/audit pass, not a visual redesign.
- `ketcher-core`, `ketcher-standalone`, `ketcher-macromolecules`: **out of scope** for this change. `ketcher-core`/`ketcher-standalone` have no meaningful UI surface (verified: only one non-boilerplate string in `ketcher-core`'s settings schema). `ketcher-macromolecules` is deferred to a follow-up change. Errors surfaced from the compiled Indigo/WASM backend are vendored output, not authored TS/React, and are out of scope.
- New dependency: `react-i18next`, `i18next`, `i18next-icu` added to `packages/ketcher-react/package.json`.
- No breaking API changes; no translated (non-English) content is shipped by this change — it is a foundation + extraction pass only.