# ketcher-react locales

`en` + `zh-CN` today. See `openspec/changes/archive/2026-09-08-ketcher-react-i18n-foundation/design.md` for the full rationale — this file is the quick-reference for anyone doing an extraction task.

`ketcher-macromolecules` reuses this same shared `i18next` instance (it renders inside `ketcher-react`'s `<I18nextProvider>`) but owns two of its own namespaces, `macromolecules`/`macromoleculesDialogs`, defined in `packages/ketcher-macromolecules/src/locales/<locale>/*.json` and merged in via `i18n.addResourceBundle(...)` from `packages/ketcher-macromolecules/src/i18n/registerNamespaces.ts` — not added to the `resources` object below, to avoid a reverse `ketcher-react -> ketcher-macromolecules` source dependency. See `openspec/changes/archive/2026-09-30-ketcher-macromolecules-i18n/design.md` for the full rationale.

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

Excluded, and must stay physical: anything computed from real screen/canvas coordinates at render time (`getBoundingClientRect()`-derived hover-preview positions, floating-toolbar placement, context-menu placement) and chemistry-domain values that only coincidentally read like directions (e.g. RNA Builder's 5′/3′ phosphate position, which is a structural fact independent of text direction). See `openspec/changes/archive/2026-09-30-ketcher-macromolecules-i18n/design.md` (Section 7) for the reasoning and the full file-by-file list.

## No literal-text fallback

`resolveTranslatableText`/`getSelectOptionsFromSchema` (`packages/ketcher-react/src/script/ui/utils/index.ts`) require a `t` function and always call `t(value)` — there is no pre-check that skips translation for strings that don't look like a `namespace:key` path. Every `title`/`enumNames` value passed through these helpers must be an explicit, registered translation key; a call site that passes a literal string will render whatever i18next's missing-key fallback produces instead of the literal (see `i18n.ts`'s `returnEmptyString: false`). There are no automated key-parity or hardcoded-string regression tests in this package — verify new call sites by hand against `en`/`zh-CN`.

## Single-language build is the default

English-only is the default build — the common case ships the smallest bundle, and there's no Settings language switcher since there's nothing to switch to. Setting `KETCHER_MULTI_LANGUAGE_BUILD=true` opts into every other locale instead (verified via bundle-content grep + size diff, not just code review — see design.md Section 9) and makes the Settings language switcher appear. Wired via each package's `rollup.config.mjs` (`@rollup/plugin-replace`, same mechanism as `NODE_ENV`) into `i18n.ts` and `ketcher-macromolecules/src/i18n/registerNamespaces.ts`: the non-English imports stay as plain ES imports (imports can't be conditional) but are referenced only inside a `MULTI_LANGUAGE_BUILD` branch, so Rollup's tree-shaking drops the whole branch — imports and JSON included — once the flag is replaced with a literal. Leave the env var unset (or `false`) for the default single-language build.

Set the flag either by exporting it before running either package's `npm run build`, or by copying the repo-root `.env.example` to `.env` and setting `KETCHER_MULTI_LANGUAGE_BUILD=true` there — both `rollup.config.mjs` files load the repo-root `.env` (via `dotenv`) before reading `process.env`, so a value already exported in the shell always wins over the `.env` file. `.env` is gitignored; commit changes to `.env.example` instead.

## Crowdin compatibility test (unconfigured, scoped)

The repo-root `crowdin.yml` is a scoped compatibility test, not a configured pipeline — it covers only `ketcher-react`'s `common.json` (source `en` → target `zh-CN`). Its purpose: confirm Crowdin round-trips our actual file layout — flat nested JSON, `i18next-icu` single-brace placeholders (`{count}`, `{shortcut}`, etc.) — without mangling keys or placeholders.

This matters because no single built-in Crowdin JSON type matches our format exactly:

- `i18next_json` expects i18next's default double-brace interpolation (`{{variable}}`); our `i18next-icu` plugin uses single-brace ICU syntax (`{variable}`) instead, so this type would likely fail to recognize our placeholders as protected.
- `react_intl` understands single-brace ICU syntax, but expects each key's value to be a `{ defaultMessage, description }` object, not our flat `{ "key": "string" }` shape.

`crowdin.yml` therefore uses the generic `type: "json"` and the test is **manual**: after uploading, open `common.json` in Crowdin's web editor and check whether `{count}`/`{label}`/etc. render as a highlighted, protected placeholder (not plain editable text) — that's the actual answer to "does our approach work with this platform."

To run it yourself (uses your own Crowdin project — nothing here is pre-authenticated):

```bash
export CROWDIN_PROJECT_ID=<your numeric project id>
export CROWDIN_PERSONAL_TOKEN=<your personal access token>
npx @crowdin/cli config lint      # validate crowdin.yml, no auth needed
npx @crowdin/cli upload sources   # push common.json as the source
# ...translate/pseudo-translate zh-CN in the Crowdin UI...
npx @crowdin/cli download --language zh-CN   # pull back ONLY zh-CN (project has other target languages configured, e.g. zh-TW, that aren't registered in i18n.ts)
```

## Hard rule

Never touch anything that renders inside the `StructEditor` SVG canvas (`data-testid="ketcher-canvas"` → the `editorRef` subtree). That element is explicitly pinned to `dir="ltr"` and is out of scope for text extraction — chemical structure geometry must never be affected by locale.
