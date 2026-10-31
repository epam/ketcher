## Why

Ketcher ships English and Simplified Chinese, and its i18n layer makes adding a language a data-only change: drop a complete set of namespace JSON files under `src/locales/`, regenerate the resource list, and the multi-language build offers it. Spanish is the second most spoken native language and a frequent requirement for chemistry tools, yet the `es` directory does not exist today.

## What Changes

- Add a complete `es` locale for the six `ketcher-react` namespaces (`common`, `toolbar`, `toolbars`, `dialogs`, `components`, `settings`) and the two `ketcher-macromolecules` namespaces (`macromolecules`, `macromoleculesDialogs`), mirroring the `en` key structure exactly.
- Regenerate `localeResources.generated.ts` in both packages so `es` is registered automatically; no edit to `i18n.ts` or `registerNamespaces.ts`.
- Keep the translation data-only: no change to the i18n infrastructure, the build flag semantics, or the English-only default bundle.
- Update the supported-language lists in `README.md` and the localization documentation when the change archives.
- Verify key parity, ICU placeholder preservation, type-checking and the rendered UI in a multi-language build.

## Capabilities

### New Capabilities

- `spanish-locale`: complete Spanish (`es`) translation content for every UI string in `ketcher-react` and `ketcher-macromolecules`, offered by the multi-language build while chemistry vocabulary stays untranslated.

### Modified Capabilities

<!-- None: no existing requirement text changes. The localization capability already states that every shipped language covers both packages; `es` satisfies it rather than changing it. -->

## Impact

- `packages/ketcher-react/src/locales/es/{common,toolbar,toolbars,dialogs,components,settings}.json`: new locale files.
- `packages/ketcher-macromolecules/src/locales/es/{macromolecules,macromoleculesDialogs}.json`: new locale files.
- `packages/ketcher-react/src/i18n/localeResources.generated.ts` and `packages/ketcher-macromolecules/src/i18n/localeResources.generated.ts`: regenerated to include `es`.
- `README.md` and `openspec/specs/localization/spec.md`: supported-language references (at archive time).
- No public API, behaviour, file-format or bundle changes beyond the opt-in multi-language build gaining one more locale.
