# Localization (i18n)

## Problem

Ketcher's UI text was originally hardcoded in English throughout `ketcher-react`. Users who prefer another language had no way to see menus, dialogs, tooltips, and settings in their own language, and there was no infrastructure to add one safely (no key convention, no guard against new hardcoded strings, no way to know a translation was incomplete).

## User interaction

- **Switch language** — open Settings → General tab → Language dropdown, and pick a language. The change applies immediately, everywhere in the UI, without a reload.
- **Persistence** — the chosen language is remembered (via `localStorage`) and restored automatically the next time Ketcher loads, independent of any other user structure/settings persistence.
- **Scope of what translates** — all UI chrome translates: toolbar/toolbars, dialog titles and fields, context menus, Settings panel, component chrome (MonomerCreationWizard, context menus). Chemistry **data** does not translate: element symbols, bond-type names shown in the bond toolbar/context menu, MDL/SDF format codes, and other domain vocabulary that must stay stable across languages for interoperability with chemistry file formats and vendor tooling.

## Expected behavior

#### Scenario: Switching language updates the UI live

- **WHEN** the user selects a different language in Settings → General
- **THEN** every currently-visible piece of translated UI chrome (toolbars, open dialogs, context menus) re-renders in the new language immediately, with no page reload

#### Scenario: Language choice survives Settings Cancel

- **WHEN** the user changes the language, then clicks Cancel on the Settings dialog
- **THEN** the language change is **not** reverted — language is a global preference independent of the dialog's Apply/Cancel form state (unlike the other Settings fields)

#### Scenario: Language choice persists across reloads

- **WHEN** the user picks a language and reloads or reopens Ketcher
- **THEN** the same language is active again, restored from `localStorage`

#### Scenario: Missing or partial translations degrade gracefully

- **WHEN** a UI string has no translation yet in the active language
- **THEN** Ketcher falls back to the English text rather than showing a raw key or blank text

## Guarantees

- Switching language never alters the loaded chemical structure, file format, or any Ketcher API contract — only rendered UI text.
- Chemistry vocabulary (element symbols, bond-type names in the bond toolbar/context menu, MDL/SDF codes, valence/reacting-center notation) is deliberately never translated, even where a translated field sits right next to it — this keeps structures and their on-screen labels consistent with chemistry file formats regardless of UI language.
- Every language shipped with Ketcher covers the full set of UI strings for the `ketcher-react` package — there is no language that only partially translates a dialog.

## Limitations

- Localization currently covers `ketcher-react` (micromolecules UI) only. The `ketcher-macromolecules` package (RNA/Peptide/CHEM library panel, sequence editor chrome) is a separate React package and is not yet covered — it remains English-only regardless of the selected language.
- Only left-to-right languages are shipped today; RTL groundwork (CSS logical properties, a direction-sensitive-icon inventory) exists but no RTL locale has been added yet.
- Translation quality for non-English languages depends on who authored it; a language may be added by a non-native speaker as a functional first pass, pending a later native-speaker/professional review. This does not block the language from shipping, but content may be refined afterward without changing behavior.
