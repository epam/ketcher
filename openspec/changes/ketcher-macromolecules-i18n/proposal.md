## Why

`ketcher-react-i18n-foundation` and `ketcher-react-i18n-chinese-locale` (both archived) built the i18n infrastructure and shipped English + Simplified Chinese (`zh-CN`) content for `ketcher-react`'s own UI chrome, but explicitly scoped `ketcher-macromolecules` out. That package still has every user-facing string hardcoded in English: the macromolecule toolbars, monomer library, context menus, modal dialogs (RNA builder, monomer/preset creation, properties), and preview tooltips.

Investigation for this proposal found a fact that changes the shape of the work: `ketcher-macromolecules` is not a standalone app — `packages/ketcher-react/src/Editor.tsx` lazily imports it and renders it **inside the same `<I18nextProvider i18n={i18n}>`** that wraps `ketcher-react`'s own UI. The shared `i18next` instance, its English/`zh-CN` resource bundles, the language switcher in Settings, persisted-language storage, and the reactive `dir` (LTR/RTL) mechanism already exist and already wrap this package's rendered tree. `.memory-bank/modules/i18n.md` currently states `ketcher-macromolecules` "is not wired into this i18n setup" — that statement is stale and will be corrected when this change archives. Because of this, this change does **not** need to repeat the foundation work (no new i18next/i18next-icu setup, no second language switcher, no second persistence mechanism) — it only needs to give `ketcher-macromolecules` its own translation-key namespace(s), extract its hardcoded strings into them, and author both `en` and `zh-CN` content for those namespaces in the same pass, since the delivery mechanism (the shared instance) is already in place.

## What Changes

- Add `react-i18next` as an explicit dependency of `packages/ketcher-macromolecules/package.json` (today it is only reachable transitively through the npm-workspace hoist of `ketcher-react`'s dependency — this change makes the dependency explicit since the package imports from it directly).
- Add two new translation-key namespaces owned by this package, following the existing `<namespace>:<key.path>` convention and loaded into the *same* shared `i18next` instance exported from `packages/ketcher-react/src/i18n/i18n.ts`:
  - `macromolecules` — toolbars/controls, zoom, layout mode, fullscreen, ruler, macromolecule properties panel, preview tooltips
  - `macromoleculesDialogs` — modal dialogs (RNA Builder, monomer/preset creation wizard, properties), the monomer library (search, favorites, filters, group headers), and context menus
  - Cross-cutting duplicated strings (Cancel/OK/Apply/Close etc.) resolve through the existing shared `common` namespace instead of being redefined, same as `ketcher-react`'s own dialogs do today.
- Extract every hardcoded English UI string under `packages/ketcher-macromolecules/src/**` into these namespaces and wire `useTranslation()`/`resolveTranslatableText` calls through the components, mirroring the extraction patterns already established (schema-driven fields, `Dialog`'s `buttonsNameMap`, module-level schema objects needing `useMemo(() => ..., [t])`).
- Author both `en` (baseline) and `zh-CN` (Simplified Chinese) locale JSON content for both new namespaces in the same pass — unlike the `ketcher-react` precedent, this is not split into a separate "foundation" and "locale" change, because there is no new foundation to build.
- Audit `ketcher-macromolecules`'s styling (Emotion `css`/`styled` templates and MUI `sx` props — this package does not use `.less` files) for physical directional properties and convert to logical properties where the existing RTL-groundwork convention applies, explicitly excluding anything tied to the canvas/sequence-rendering geometry.
- Extend the existing i18n regression tests (`packages/ketcher-react/src/i18n/i18n.test.ts` and its sibling no-hardcoded-strings guard) to also scan `packages/ketcher-macromolecules/src`, and extend the `en`/`zh-CN` key-parity check to the two new namespaces.
- Add a build-time flag (`KETCHER_SINGLE_LANGUAGE_BUILD`, injected via each package's existing `@rollup/plugin-replace` setup, same mechanism already used for `NODE_ENV`/`BUILD_NUMBER`) that, when set, strips every non-English locale namespace — across **both** `ketcher-react`'s existing six namespaces and this change's two new `ketcher-macromolecules` namespaces — from the production bundle via dead-code elimination, and hides the language switcher in Settings (a single-language build has nothing to switch to). This is a customer-driven requirement: the ability to ship an English-only build with zero non-English translation payload, without maintaining a separate code branch.

## Capabilities

### New Capabilities

- `macromolecules-i18n-integration`: `ketcher-macromolecules` declares `react-i18next` explicitly, registers its own `macromolecules`/`macromoleculesDialogs` namespaces into the existing shared `i18next` instance, and its Emotion/MUI styling is audited for RTL-safe logical properties.
- `translation-key-extraction-ketcher-macromolecules`: replacement of hardcoded English UI strings in `ketcher-macromolecules` with translation keys resolved against the English baseline.
- `macromolecules-zh-cn-locale`: Simplified Chinese (`zh-CN`) translation content for both new namespaces, keeping the existing global language switcher and persisted choice as the single source of truth (no second switcher).
- `single-language-build-mode`: a build-time flag that produces an English-only bundle with all non-English locale content tree-shaken out and the language switcher hidden, covering every namespace in both `ketcher-react` and `ketcher-macromolecules`.

### Modified Capabilities

- `i18n-infrastructure` (from `ketcher-react-i18n-foundation`): gains two more namespaces registered into the same instance; no interface changes, only additional resource bundles the instance already promised to support.

## Impact

- `packages/ketcher-react/rollup.config.mjs` and `packages/ketcher-macromolecules/rollup.config.mjs`: add a `KETCHER_SINGLE_LANGUAGE_BUILD` compile-time constant via the existing `@rollup/plugin-replace` call.
- `packages/ketcher-react/src/i18n/i18n.ts`: gate non-`en` resource construction (all six existing namespaces plus the two new ones) behind the compile-time flag so unreferenced imports are eliminated from the bundle; hide/disable the Settings language switcher when only one language is registered.
- `packages/ketcher-macromolecules/package.json`: add `react-i18next` as an explicit dependency.
- `packages/ketcher-macromolecules/src/locales/{en,zh-CN}/{macromolecules,macromoleculesDialogs}.json`: new locale files.
- `packages/ketcher-react/src/i18n/i18n.ts`: register the two new namespaces' resource bundles alongside the existing six.
- Every file under `packages/ketcher-macromolecules/src/components/**` and `src/hooks`/`src/helpers` that renders or constructs user-facing text is touched to replace literals with `t()`/`resolveTranslatableText` calls.
- `packages/ketcher-react/src/i18n/i18n.test.ts` and its no-hardcoded-strings sibling guard: scope extended to `ketcher-macromolecules/src`.
- Chemistry/domain data stays untranslated, same rule as `ketcher-react`: monomer/HELM codes, sequence letters (A/T/G/C/U etc.), natural-analogue codes, format identifiers (FASTA/HELM/IDT), and numeric notation are never routed through `t()`.
- Translation content (both `en` extraction accuracy and `zh-CN` translation quality) is authored by Claude in this change and is explicitly flagged for a native-speaker/professional review pass before shipping to production, same caveat as the `ketcher-react-i18n-chinese-locale` change.
- `ketcher-core`, `ketcher-standalone`: out of scope, unchanged.