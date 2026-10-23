# Localization (i18n)

## Problem

Ketcher's UI text was originally hardcoded in English throughout `ketcher-react`. Users who prefer another language had no way to see menus, dialogs, tooltips, and settings in their own language, and there was no infrastructure to add one safely (no key convention, no guard against new hardcoded strings, no way to know a translation was incomplete).

## User interaction

- **Switch language** — open Settings → General tab → Language dropdown, and pick a language. The change applies immediately, everywhere in the UI, without a reload. This dropdown only appears at all in the multi-language build (see below) — the default build has nothing to switch between.
- **Persistence** — the chosen language is remembered (via `localStorage`) and restored automatically the next time Ketcher loads, independent of any other user structure/settings persistence.
- **Scope of what translates** — all UI chrome translates in both `ketcher-react` (small molecules) and `ketcher-macromolecules`: toolbar/toolbars, dialog titles and fields, context menus, Settings panel, component chrome (MonomerCreationWizard, context menus), the monomer library, and RNA Builder (including its group tabs — Presets/Sugars/Bases/Phosphates/Nucleotides). Chemistry **data** does not translate: element symbols, bond-type names shown in the bond toolbar/context menu, MDL/SDF format codes, and other domain vocabulary that must stay stable across languages for interoperability with chemistry file formats and vendor tooling.
- **Build-time language coverage** — Ketcher ships **English-only by default** (smallest bundle, no language switcher rendered at all). A consumer building `ketcher-react`/`ketcher-macromolecules` opts into every other supported language by setting `KETCHER_MULTI_LANGUAGE_BUILD=true` at build time; that variant includes the language switcher and every locale below.

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

#### Scenario: Default build has no language switcher

- **WHEN** Ketcher is built without `KETCHER_MULTI_LANGUAGE_BUILD=true`
- **THEN** the Settings dialog does not render a Language field at all, and the shipped bundle contains no non-English translation payload (verified by inspecting the built output, not just runtime behavior)

#### Scenario: Multi-language build offers every supported language

- **WHEN** Ketcher is built with `KETCHER_MULTI_LANGUAGE_BUILD=true`
- **THEN** the Settings dialog shows the Language dropdown with every supported language, exactly as described in the scenarios above

## Guarantees

- Switching language never alters the loaded chemical structure, file format, or any Ketcher API contract — only rendered UI text.
- Chemistry vocabulary (element symbols, bond-type names in the bond toolbar/context menu, MDL/SDF codes, valence/reacting-center notation) is deliberately never translated, even where a translated field sits right next to it — this keeps structures and their on-screen labels consistent with chemistry file formats regardless of UI language.
- Every language shipped with Ketcher covers the full set of UI strings for **both** `ketcher-react` and `ketcher-macromolecules` — there is no language that only partially translates a dialog, and no package that only some languages cover.
- The default (English-only) build and the multi-language build are functionally identical in English — the flag controls bundle content and the presence of the switcher, never English text or behavior.

## Limitations

- Only left-to-right languages are shipped today; RTL groundwork (CSS logical properties, a direction-sensitive-icon inventory) exists but no RTL locale has been added yet.
- Translation quality for non-English languages depends on who authored it; a language may be added by a non-native speaker as a functional first pass, pending a later native-speaker/professional review. This does not block the language from shipping, but content may be refined afterward without changing behavior.
- Playwright end-to-end coverage for the language switcher/localized-UI flows was explicitly deferred (product decision, not a technical blocker) and has not been added.
