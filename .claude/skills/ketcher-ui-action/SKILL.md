---
name: ketcher-ui-action
description: "Add or change a toolbar button, menu command or hotkey in the Ketcher micromolecules UI (ketcher-react): the UiAction entry, toolbar placement, icon, hidden/disabled state and E2E test ids. Use for any new or renamed UI command."
argument-hint: "<command to add or change>"
---

# A UI command in ketcher-react

Target: **$ARGUMENTS**. Package conventions: `.claude/rules/ketcher-react.md`.

## 1. The action — one entry drives button, hotkey and state

Actions are `UiAction` objects
(`packages/ketcher-react/src/script/ui/action/action.types.ts#interface UiAction`) collected into
`packages/ketcher-react/src/script/ui/action/index.ts#const config: Record<string, UiAction>` from the
group modules next to it (`tools.ts`, `server.ts`, `zoom.js`, `atoms.js`, `templates.js`, …). Add the
entry to the group it belongs to:

- `title` — tooltip text; `shortcut` — string or array (`'Mod+l'`); hotkeys are registered from it by
  `packages/ketcher-react/src/script/ui/state/hotkeys.ts#initHotKeys(actions)`, so check for a clash
  with an existing shortcut before choosing one.
- `action` — a `thunk` (side effects, Indigo calls via `serverTransform`), a `tool` activation, or a
  dialog; never logic in the button component.
- `disabled` / `selected` / `hidden` as booleans or functions of `(editor, server, options)`.
  `hidden: (options) => isHidden(options, '<id>')` lets an embedding app hide the button through the
  `buttons` option — keep it for anything a host might not want.
- In view-only mode every action is disabled unless it sets `enabledInViewOnly: true`
  (`packages/ketcher-react/src/script/ui/action/index.ts#updateConfigItem`).

**The key is an API.** The toolbar button's `data-testid` defaults to it
(`packages/ketcher-react/src/script/ui/views/toolbars/ToolbarGroupItem/ActionButton/ActionButton.tsx#dataTestId ?? name`),
E2E page objects select by it, and hosts hide buttons by it. Renaming a key is a breaking change:
grep `ketcher-autotests/` and the docs for it first.

## 2. Placement

Each toolbar lists its item ids in an options file next to it — for example
`packages/ketcher-react/src/script/ui/views/toolbars/LeftToolbar/leftToolbarOptions.ts#makeItems` —
and renders them with `ToolbarGroupItem`. Add the id to the right group there; order in the list is
order on screen.

## 3. Icon

Add the SVG to `packages/ketcher-react/src/assets/icons/files/` and register it in
`packages/ketcher-react/src/components/Icon/utils/iconNameToIcon.ts`; unregistered files are not
bundled. In tests an icon renders as the string `icon-<name>`.

## 4. Macromolecules mode

The macromolecules editor has its own menus (`packages/ketcher-macromolecules/src/components/`,
`TopMenuComponent`, `LeftMenuComponent`) and Redux Toolkit state; it reuses `Icon` and `IconButton`
from ketcher-react. A command that must exist in both modes is implemented twice — say so in the
plan rather than discovering it in review.

## 5. Tests

- Unit: `packages/ketcher-react/src/script/ui/action/index.test.ts` covers the config; add a case for
  new state logic.
- E2E: locate the button with `getByTestId('<id>')` through the toolbar page objects in
  `ketcher-autotests/tests/pages/`; add the locator there, not in the spec.
- Finish with `/ketcher-verify`.
