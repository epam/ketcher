## Why

The `ketcher-react-i18n-foundation` change built the i18n infrastructure (react-i18next + i18next-icu), extracted every hardcoded UI string in `ketcher-react` into translation keys, and did RTL groundwork — but it deliberately shipped English-only: no second locale, no language switcher, no persistence of a chosen language. Chinese (Mandarin) was the original motivating use case for adding i18n at all; this change delivers it.

## What Changes

- Add a `zh-CN` (Simplified Chinese) locale: one JSON file per existing namespace (`common`, `toolbar`, `toolbars`, `dialogs`, `components`, `settings`), mirroring the English key structure exactly, registered alongside `en` in `packages/ketcher-react/src/i18n/i18n.ts`.
- Add a language switcher to the Settings dialog's General tab — a new "Language" field, independent of the settings-schema/Apply-Cancel flow (language is an app-chrome preference, not a molecule-rendering option; routing it through `ketcher-core`'s `SettingsService` would be unnecessary coupling for a field that service doesn't know about).
- Persist the chosen language (a dedicated `localStorage` key, not the settings-service persistence path) and restore it on next load, falling back to `en`.
- Make the `dir` (LTR/RTL) attribute on the UI-chrome root wrapper reactive to a live language change, not just correct on full page reload — `zh-CN` itself is LTR so this has no visible effect yet, but it's the same wrapper the RTL groundwork depends on, and the gap would silently break the next (RTL) locale added on top of this one.
- Add a translation-key-parity regression test: every key present in the `en` baseline must also exist in `zh-CN`, and vice versa (extends the existing `i18n.test.ts` guard pattern from the foundation change).

## Capabilities

### New Capabilities

- `chinese-locale`: Simplified Chinese (`zh-CN`) translation content for every `ketcher-react` namespace, a language switcher in Settings, persisted language choice, and reactive `dir` switching.

### Modified Capabilities

<!-- i18n-infrastructure (from ketcher-react-i18n-foundation) gains a second registered locale and a reactive dir mechanism; no interface changes, only behavior it already promised to support. -->

## Impact

- `packages/ketcher-react/src/locales/zh-CN/*.json`: new translated locale files (one per existing `en` namespace).
- `packages/ketcher-react/src/i18n/i18n.ts`: register `zh-CN` resources, read/write the persisted language choice.
- `packages/ketcher-react/src/script/ui/views/modal/components/meta/Settings/Settings.tsx`: new Language field in the General tab.
- `packages/ketcher-react/src/Editor.tsx`: subscribe to language changes so `dir` updates live.
- `packages/ketcher-react/src/i18n/i18n.test.ts` (or a new sibling test): key-parity guard between `en` and `zh-CN`.
- Translation content is authored by Claude in this change and is explicitly flagged for a native-speaker/professional review pass before this ships to production — this change does not claim translation-quality sign-off.
- `ketcher-core`, `ketcher-standalone`, `ketcher-macromolecules`: out of scope, same as the foundation change.
