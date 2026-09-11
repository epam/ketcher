# ketcher-react locales

English-only baseline today. See `openspec/changes/ketcher-react-i18n-foundation/design.md` for the full rationale — this file is the quick-reference for anyone doing an extraction task.

## Key naming convention

`<domain>.<subarea>.<element>`, e.g. `toolbar.zoom.in`, `dialogs.periodicTable.title`. Keys are nested JSON objects (i18next default `keySeparator: '.'`), not flat dotted strings — so `toolbar.zoom.in` is `{ "toolbar": { "zoom": { "in": "..." } } }` inside `toolbar.json` (the namespace prefix itself is the file, not part of the key path).

Duplicated strings (Cancel/OK/Apply, monomer-type labels, etc.) go in `common.json` and are referenced with the `common:` namespace prefix, e.g. `t('common:cancel')`.

## Namespace → file → source directory map

| Namespace    | File               | Source directory                                                                 |
| ------------ | ------------------ | --------------------------------------------------------------------------------- |
| `common`     | `common.json`      | cross-cutting duplicated strings only                                             |
| `toolbar`    | `toolbar.json`     | `script/ui/action/*`                                                              |
| `toolbars`   | `toolbars.json`    | `script/ui/views/toolbars/*`                                                      |
| `dialogs`    | `dialogs.json`     | `script/ui/views/modal/components/*` (both domain and shared dialogs)             |
| `components` | `components.json`  | `script/ui/views/components/*` (excluding text inside the `StructEditor` canvas)  |
| `settings`   | `settings.json`    | the settings panel UI components                                                  |

## Usage

```ts
import { useTranslation } from 'react-i18next';

const { t } = useTranslation('toolbar');
t('zoom.in'); // -> "Zoom In"
t('common:cancel'); // cross-namespace reference
```

## Hard rule

Never touch anything that renders inside the `StructEditor` SVG canvas (`data-testid="ketcher-canvas"` → the `editorRef` subtree). That element is explicitly pinned to `dir="ltr"` and is out of scope for text extraction — chemical structure geometry must never be affected by locale.