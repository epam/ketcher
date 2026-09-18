# ketcher-react locales

`en` + `zh-CN` today. See `openspec/changes/ketcher-react-i18n-foundation/design.md` for the full rationale — this file is the quick-reference for anyone doing an extraction task.

`ketcher-macromolecules` reuses this same shared `i18next` instance (it renders inside `ketcher-react`'s `<I18nextProvider>`) but owns two of its own namespaces, `macromolecules`/`macromoleculesDialogs`, defined in `packages/ketcher-macromolecules/src/locales/<locale>/*.json` and merged in via `i18n.addResourceBundle(...)` from `packages/ketcher-macromolecules/src/i18n/registerNamespaces.ts` — not added to the `resources` object below, to avoid a reverse `ketcher-react -> ketcher-macromolecules` source dependency. See `openspec/changes/ketcher-macromolecules-i18n/design.md` for the full rationale.

## Key naming convention

`<domain>.<subarea>.<element>`, e.g. `toolbar.zoom.in`, `dialogs.periodicTable.title`. Keys are nested JSON objects (i18next default `keySeparator: '.'`), not flat dotted strings — so `toolbar.zoom.in` is `{ "toolbar": { "zoom": { "in": "..." } } }` inside `toolbar.json` (the namespace prefix itself is the file, not part of the key path).

Duplicated strings (Cancel/OK/Apply, monomer-type labels, etc.) go in `common.json` and are referenced with the `common:` namespace prefix, e.g. `t('common:cancel')`.

## Namespace → file → source directory map

| Namespace    | File              | Source directory                                                                 |
| ------------ | ----------------- | -------------------------------------------------------------------------------- |
| `common`     | `common.json`     | cross-cutting duplicated strings only                                            |
| `toolbar`    | `toolbar.json`    | `script/ui/action/*`                                                             |
| `toolbars`   | `toolbars.json`   | `script/ui/views/toolbars/*`                                                     |
| `dialogs`    | `dialogs.json`    | `script/ui/views/modal/components/*` (both domain and shared dialogs)            |
| `components` | `components.json` | `script/ui/views/components/*` (excluding text inside the `StructEditor` canvas) |
| `settings`   | `settings.json`   | the settings panel UI components                                                 |

Owned by `ketcher-macromolecules` (files live under `packages/ketcher-macromolecules/src/locales/<locale>/`, not this directory):

| Namespace               | File                         | Source directory                                                                                  |
| ----------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------- |
| `macromolecules`        | `macromolecules.json`        | always-visible chrome: menus, toolbars, zoom, layout mode, fullscreen, ruler, properties, preview |
| `macromoleculesDialogs` | `macromoleculesDialogs.json` | modal dialogs, monomer library, context menus                                                     |

## Usage

```ts
import { useTranslation } from 'react-i18next';

const { t } = useTranslation('toolbar');
t('zoom.in'); // -> "Zoom In"
t('common:cancel'); // cross-namespace reference
```

## Logical CSS properties (RTL groundwork)

New UI-chrome styling (Emotion `css`/`styled`, MUI `sx`) should use logical properties — `insetInlineStart`/`insetInlineEnd`, `marginInlineStart`/`marginInlineEnd`, `paddingInlineStart`/`paddingInlineEnd`, `borderInlineStart`/`borderInlineEnd`, `textAlign: 'start'`/`'end'` — instead of physical `left`/`right`. They're pixel-identical to their physical equivalents in the current LTR-only app, so this costs nothing today, but it's what makes a future RTL locale a data problem instead of a rewrite.

Excluded, and must stay physical: anything computed from real screen/canvas coordinates at render time (`getBoundingClientRect()`-derived hover-preview positions, floating-toolbar placement, context-menu placement) and chemistry-domain values that only coincidentally read like directions (e.g. RNA Builder's 5′/3′ phosphate position, which is a structural fact independent of text direction). See `openspec/changes/ketcher-macromolecules-i18n/design.md` (Section 7) for the reasoning and the full file-by-file list.

## Regression guards

Two Jest suites in `packages/ketcher-react/src/i18n/` enforce this scheme across **both** `ketcher-react` and `ketcher-macromolecules` (the latter scanned as a second root, without either package importing the other's source — see the comments in each file for why that matters):

- `i18n.test.ts` — collects every `t('ns:key')` literal (plus `ns`-bound bare `t('key')` calls resolved via each file's `useTranslation(ns)`), and asserts every one resolves in `en` and in `zh-CN`, that `en`/`zh-CN` have exactly the same keys per namespace, and that interpolation placeholders match between them. Known gap: a key referenced only through a variable (e.g. the Settings dialog's `t(labelKey)`) isn't a string literal at the call site, so it isn't found by this scan — verify those by hand.
- `noHardcodedStrings.test.ts` — fails if a literal `title`/`label`/`placeholder`/`tooltip`/`aria-label`/`alt` shows up in a directory that's already been migrated to `t()` calls (listed per-package at the top of the file). Extend the relevant `MIGRATED_PATHS`/`MACROMOLECULES_MIGRATED_PATHS` array when a new directory finishes extraction.

Run both with `npm run test:unit` in `packages/ketcher-react` (or `npx jest src/i18n` for just these two).

## Single-language build mode

Setting `KETCHER_SINGLE_LANGUAGE_BUILD=true` in the environment when running either package's `npm run build` strips every non-English locale payload out of the shipped bundle (verified via bundle-content grep + size diff, not just code review — see design.md Section 9) and hides the Settings language switcher entirely. Wired via each package's `rollup.config.mjs` (`@rollup/plugin-replace`, same mechanism as `NODE_ENV`) into `i18n.ts` and `ketcher-macromolecules/src/i18n/registerNamespaces.ts`: the non-English imports stay as plain ES imports (imports can't be conditional) but are referenced only inside a `!SINGLE_LANGUAGE_BUILD` branch, so Rollup's tree-shaking drops the whole branch — imports and JSON included — once the flag is replaced with a literal. Leave the env var unset (or `false`) for the normal multi-language build.

## Hard rule

Never touch anything that renders inside the `StructEditor` SVG canvas (`data-testid="ketcher-canvas"` → the `editorRef` subtree). That element is explicitly pinned to `dir="ltr"` and is out of scope for text extraction — chemical structure geometry must never be affected by locale.
