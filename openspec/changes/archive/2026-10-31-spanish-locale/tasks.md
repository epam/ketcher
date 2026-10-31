# Tasks

## 1. Spanish locale content

- [x] 1.1 Translate `packages/ketcher-react/src/locales/es/common.json` (21 keys)
- [x] 1.2 Translate `packages/ketcher-react/src/locales/es/toolbar.json` (101 keys) and `toolbars.json` (8 keys), without the redundant "Herramienta de" prefix
- [x] 1.3 Translate `packages/ketcher-react/src/locales/es/settings.json` (77 keys)
- [x] 1.4 Translate `packages/ketcher-react/src/locales/es/components.json` (109 keys)
- [x] 1.5 Translate `packages/ketcher-react/src/locales/es/dialogs.json` (309 keys)
- [x] 1.6 Translate `packages/ketcher-macromolecules/src/locales/es/macromolecules.json` (68 keys)
- [x] 1.7 Translate `packages/ketcher-macromolecules/src/locales/es/macromoleculesDialogs.json` (113 keys)

## 2. Locale registration

- [x] 2.1 Run `npm run i18n:generate -w ketcher-react` and confirm `es` is registered alongside `en` and `zh-CN`
- [x] 2.2 Run `npm run i18n:generate -w ketcher-macromolecules` and confirm `es` is registered

## 3. Verification

- [x] 3.1 Compare flattened key sets against `en` for all eight namespaces: 0 missing, 0 extra
- [x] 3.2 Compare ICU placeholders per key against `en`: 0 mismatches
- [x] 3.3 `prettier --check` on the eight locale files
- [x] 3.4 `tsc --noEmit` in `ketcher-react` and `ketcher-macromolecules` (the generated `satisfies` check accepts `es`)
- [x] 3.5 Load the app with `KETCHER_MULTI_LANGUAGE_BUILD=true` and `ketcher-language=es`: Settings, toolbars and the periodic table render in Spanish with no raw keys and no console errors
- [x] 3.6 Verify the periodic table geometry is identical to English (not affected by translation)

## 4. Documentation

- [x] 4.1 Update the supported-language lists in `README.md`
- [x] 4.2 Confirm `openspec/specs/localization/spec.md` needs no requirement change beyond the archived delta

## 5. Archive

- [x] 5.1 Archive the change with `openspec archive spanish-locale`, merging the `spanish-locale` spec into `openspec/specs/`
- [x] 5.2 Run `openspec validate --all --strict` and `openspec validate --archived`
- [x] 5.3 Update `.memory-bank/features/localization.md` if the archive changes any fact it owns
