---
paths:
  - "packages/ketcher-react/**"
description: "ketcher-react: classic redux, micro tools, UI actions, styles, test setup"
---

# ketcher-react

Deep dives: [modules/ketcher-react.md](../../.memory-bank/modules/ketcher-react.md),
[modules/editor-engine.md](../../.memory-bank/modules/editor-engine.md).

## State — classic redux with thunks, not Redux Toolkit

- The store is built in `packages/ketcher-react/src/script/ui/state/index.js#createStore`; each
  feature folder `script/ui/state/<feature>/index.{js,ts}` keeps its reducer, action creators and
  thunks together.
- Where a feature has selectors they sit in `state/<feature>/selectors/index.ts` (`reselect` 4;
  about half the features keep them in the feature file instead); typed hooks in
  `packages/ketcher-react/src/script/ui/state/hooks.ts#useAppDispatch`.
- Side effects go into thunks, never into components; components read state through selectors.

## Where things are

| Need | Place |
| --- | --- |
| a toolbar or menu command, its hotkey, enabled/hidden state | `script/ui/action/*` — `packages/ketcher-react/src/script/ui/action/index.ts#const config: Record<string, UiAction>`; hotkeys come from each action's `shortcut` via `packages/ketcher-react/src/script/ui/state/hotkeys.ts#initHotKeys(actions)` |
| a micro canvas tool | `script/editor/tool/*`, registered in `packages/ketcher-react/src/script/editor/tool/index.ts#toolsMap` |
| micro editor, its history and selection | `script/editor/Editor.ts` — 4k lines, read by range |
| an Indigo-backed UI command | `packages/ketcher-react/src/script/ui/state/server/index.js#serverTransform`, `script/ui/action/server.ts` |
| an icon | the SVG in `src/assets/icons/files/` **and** its entry in `src/components/Icon/utils/iconNameToIcon.ts` |
| a persisted user setting | the `add-localstorage-setting` skill |

A toolbar button's `data-testid` defaults to its action key
(`packages/ketcher-react/src/script/ui/views/toolbars/ToolbarGroupItem/ActionButton/ActionButton.tsx#dataTestId ?? name`):
renaming an action breaks E2E selectors. Procedure: the `ketcher-ui-action` skill.

## Styles

CSS Modules in Less (`Name.module.less`) importing `src/style/variables.less` and `mixins.less`;
emotion and MUI only where the surrounding folder already uses them. See `styles.md`.

## Tests

Co-located `src/**/*.test.ts(x)` with React Testing Library; `.less`, `.css` and `.sdf` map to
`identity-obj-proxy`, `.svg` to the string `icon-<name>`. Prerequisites: `unit-tests.md`.
