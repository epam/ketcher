## Why

[Issue #10487](https://github.com/epam/ketcher/issues/10487) introduces a redesign of the Settings window, a behavioural change in how it blocks the application, and brings the window to macromolecules mode.

Today:

- **Micro mode** opens Settings as a centered modal dialog behind a dimming overlay. The whole application is greyed out, the window cannot be moved, and the user cannot see the structure the settings affect while changing them.
- **Macro mode** has a `Settings` modal component that is registered in `modalComponentList` but has **no entry point in the UI** — there is no Settings icon in the macromolecules top toolbar, so the window is unreachable. The component itself diverges visually from micro (MUI `Select`/`Switch` with inline styles rather than Ketcher's own form controls).
- The two implementations are entirely separate, so the single appearance defined by the design mockup cannot be maintained in one place.

The attached mockup is the authoritative definition of the target appearance and is the main deliverable of this change: a fixed-width floating panel anchored to the right of the canvas, with a `Settings` title + close button header, a flat accordion of setting groups (grey collapsed headers, white content), label-left/control-right rows, inline grey hint text beneath controls, and a `Cancel` / `Apply` footer.

## What Changes

### Appearance (the mockup)

- Replace the centered modal with a **fixed-width floating panel (~340 px)** anchored by default to the right of the canvas, below the top toolbar and clear of the right toolbar (micro) / monomer library (macro).
- Header: `Settings` title on the left, close (`✕`) button on the right.
- Accordion sections: collapsed and expanded headers both use the grey `#f3f5f7` surface with a chevron (down when collapsed, up when expanded); section content sits on white. The current per-group `elements-group` icon and the "changed group" dot marker are removed — the mockup shows neither.
- Field rows:
  - toggle fields → label left, switch right (on = `#167782` with a check glyph, off = `#eff2f5`)
  - number + unit fields → label left, number input + unit dropdown right
  - standalone dropdown fields → label above a full-width dropdown
  - colour fields → label left, colour swatch dropdown right
- Tooltips move **inline**: every field that has a description renders it as small grey hint text directly beneath its control instead of an `about` icon with a hover tooltip.
- Footer: `Cancel` (secondary) and `Apply` (primary) only. `Open from File`, `Save to File` and `Reset` remain as icon buttons in the header row; `Set ACS Settings` moves next to them as a header-row control.
- Content area scrolls vertically; header and footer stay pinned.

### Behaviour

- The window no longer dims the canvas. The canvas remains fully visible but is not modifiable while the window is open.
- All toolbar buttons (top, left, bottom, right in micro; top, left and library in macro) are disabled while the window is open.
- The window can be dragged by its header. Its rectangle is clamped so that it always stays fully inside the canvas area — it can never overlap the toolbars or the monomer library, nor leave the viewport. The clamp is re-applied on container resize.
- The window opens at its default anchored position every time; the dragged position is not persisted.

### Macromolecules mode

- Add a `Settings` icon to the macromolecules top toolbar, immediately to the left of `About`, with a vertical divider separating it from the Micro/Macro switcher group.
- Macro mode renders the same panel as micro mode, fed by `SettingsService` instead of the micro Redux form state.

### Group and field inventory (aligned to the mockup)

- Section order becomes: **Atoms, Bonds, Stereochemistry, Reactions & Components, General Editing & Display, Validation & Calculation, Debugging**. `Atoms` is expanded by default.
- The separate **3D Viewer** section is removed; its three fields (`Display Mode`, `Background Color`, `Label Coloring`) move to the end of **General Editing & Display**.
- The following fields are removed from the window, as they are absent from the mockup: `Language`, `Valence Mode`, `Aromatize: skip superatoms`, `Dearomatize on load`. The underlying options stay in the schema and remain settable through the public API — only the UI controls go.

### Code structure

- Build the panel **once** in `ketcher-react` as a presentational component tree (panel shell, drag behaviour, accordion, field row renderers) and export it from the package.
- Micro mode mounts it with an adapter over the existing Redux `modal.form` / `options.settings` state; macro mode mounts it with an adapter over `SettingsService`.
- Delete `ketcher-macromolecules/src/components/modal/Settings/` (its `Settings.tsx`, `SettingsAccordion`, `SettingsField`, `fieldGroups` and styles) in favour of the shared panel.

## Capabilities

### New Capabilities

- `settings-window`: The Settings window is a non-blocking, draggable floating panel available identically in molecules and macromolecules mode. It presents all editor settings in a flat accordion of named groups with inline hints, leaves the canvas visible but not modifiable, disables the toolbars while open, and applies or discards all changes as one batch.

### Modified Capabilities

<!-- No existing spec-level capability is modified; `settings-window` is the first spec to cover this area. -->

## Impact

- **`ketcher-react`** — new shared panel under `src/script/ui/views/modal/components/meta/Settings/`: panel shell with header/footer, drag-and-clamp hook, redesigned accordion, and field-row renderers for toggle / number+unit / select / colour. Exported from the package entry point for macro consumption.
- **`ketcher-react`** — `views/modal/Modal.tsx` + `Modal.module.less`: a dialog may now opt out of the dimming overlay and the centering layout; the overlay element is kept (transparent) so it still blocks pointer input to canvas and toolbars.
- **`ketcher-react`** — `state/action/index.ts`: central `disabled()` computation gains a gate that disables every action while the Settings window is open, so all toolbar buttons render in their disabled state.
- **`ketcher-react`** — `Settings.tsx`: field list re-grouped and re-ordered; 3D Viewer fields folded into General Editing & Display; `Language`, `valence-mode`, `aromatize-skip-superatoms` and `dearomatize-on-load` fields removed; tooltips converted to inline hints.
- **`ketcher-react`** — `Accordion` under `meta/Settings/`: restyled to the mockup, group icon and change marker removed, default expanded group changes from `general` to `atoms`.
- **`ketcher-macromolecules`** — `ButtonsComponents.tsx` / `Editor.tsx`: new Settings icon button left of `About` with a divider before the mode switcher group; the shared panel mounted over the canvas area.
- **`ketcher-macromolecules`** — `TopMenuComponent`, `LeftMenuComponent`, `MonomerLibrary`: disabled while the Settings window is open.
- **`ketcher-macromolecules`** — `components/modal/Settings/` deleted; `modalComponentList` entry repointed at the shared panel adapter.
- **`ketcher-react` / `ketcher-macromolecules` locales** — new keys for the inline hint strings that were previously tooltip-only; removal of keys for the dropped fields and the `3D Viewer` group title.
- **E2E** — `ketcher-autotests/tests/specs/Settings/**` and the Settings page objects need updating for the new DOM, the non-modal overlay, and the new group/field layout; new specs for drag clamping, toolbar disabling, and macro-mode parity.

## Open risks

- **Removing the `Language` field makes the shipped `zh-CN` locale unreachable from the UI.** The mockup predates the i18n work (`ketcher-react-i18n-foundation`, `ketcher-react-i18n-chinese-locale`), and no other control switches language. This change implements the mockup as decided, but the language selector should get a new home (or be kept in General Editing & Display) before release.
- The mockup draws `Text of Absolute/AND/OR/Mixed Flag` as dropdowns, but these are free-text `string` options in the schema with user-authored values. They stay as text inputs; rendering them as dropdowns would remove functionality.
- The mockup's hint wording is the pre-#9457 tooltip text. The shortened wording introduced by #9457 is kept and simply relocated inline, rather than reverting to the longer strings drawn in the image.
