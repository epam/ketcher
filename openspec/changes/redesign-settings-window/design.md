## Context

Ketcher has two editors in one application shell:

- **Micro (molecules)** — `ketcher-react`. UI state lives in the legacy Redux store (`options`, `modal`, `actionState`, `toolbar`). Settings are a JSON-schema-driven form: `data/schema/options-schema.ts` defines every option; `component/form/form` renders `<Field name="...">` against that schema; the dialog is registered in `script/ui/dialog/index.ts` under the key `settings` and opened by `dispatchAction('settings')` → `action: { dialog: 'settings' }`. `views/modal/Modal.tsx` renders whichever dialog is active inside `.modalOverlay` — an `position: absolute; inset: 0; z-index: 40` div with a 20 % dim background that both greys and blocks the whole application.
- **Macro (macromolecules)** — `ketcher-macromolecules`. UI state is Redux Toolkit (`modalSlice`). Settings read/write `window.ketcher.settingsService` (`ketcher-core/src/application/settings/`) rather than the micro schema form. `components/modal/Settings/` implements its own accordion with MUI `Select`/`Switch` and inline styles. `modalComponentList` registers it as `settings`, but no toolbar item ever dispatches `openModal('settings')`, so it is dead UI.

Both packages already name the setting groups identically after #9457 (`Atoms`, `Bonds`, `Stereochemistry`, `Reactions & Components`, `General Editing & Display`, `Validation & Calculation`, `Debugging`, plus micro-only `3D Viewer`), so this change is about presentation, placement, blocking semantics and de-duplication — not about renaming domain concepts.

Precedent for "disable the application chrome while a mode is active" already exists: the monomer creation wizard sets `editor.isMonomerCreationWizardActive`, which individual action definitions consult in their `disabled` predicate.

## Goals / Non-Goals

**Goals**

- One presentational panel, matching the mockup, used by both modes.
- Non-blocking: canvas visible, canvas not modifiable, toolbars disabled.
- Draggable within the canvas rectangle, clamped on drag and on resize.
- Macro mode gets a toolbar entry point.
- Group/field inventory and ordering aligned to the mockup.
- Preserve the existing commit semantics in both modes: edits are staged locally and only written on `Apply`; `Cancel`/`✕` discards.

**Non-Goals**

- Settings presets / "Manage Settings" (issue #10369). The footer is `Cancel` / `Apply` only; `Open from File`, `Save to File`, `Reset` and `Set ACS Settings` stay as header-row icon controls.
- Unifying micro's schema-form state with macro's `SettingsService` into one store. Each mode keeps its own data source behind an adapter.
- Resizing the panel by dragging its edge. Width is fixed; only the content area scrolls.
- Persisting the dragged position across openings or sessions.
- Changing option names, defaults, units or validation in `options-schema.ts` / `SettingsService` schema.

## Decisions

### 1. The panel lives in `ketcher-react` and is purely presentational

**Decision:** Add to `ketcher-react/src/script/ui/views/modal/components/meta/Settings/`:

| File | Responsibility |
| --- | --- |
| `SettingsPanel.tsx` | Panel shell: positioning, drag wiring, header (title + `✕` + icon controls), scrollable body slot, footer (`Cancel` / `Apply`) |
| `useSettingsPanelDrag.ts` | Pointer-drag state + clamp against a bounding element |
| `SettingsAccordion.tsx` | Group list, expand/collapse state, mockup styling |
| `SettingsFieldRow.tsx` | The four row layouts (toggle / number+unit / select / colour) plus inline hint slot |
| `SettingsPanel.module.less` | Tokens and layout for all of the above |

`SettingsPanel` takes only props — `groups`, `onApply`, `onCancel`, `onClose`, `isApplyDisabled`, `boundsElement`, header controls as a node. It holds no knowledge of Redux or `SettingsService`. It is re-exported from the `ketcher-react` package entry point so `ketcher-macromolecules` can import it (the dependency direction `ketcher-macromolecules → ketcher-react` is already established: `ButtonsComponents` imports `IconButton` and `Icon` from `ketcher-react`).

**Why not put it in `ketcher-core`?** `ketcher-core` carries no React components. **Why not a new shared package?** Disproportionate for one panel, and `ketcher-react` already serves as the shared component source for macro.

### 2. Micro keeps the existing dialog plumbing; `Modal.tsx` learns a non-modal mode

**Decision:** Keep `action: { dialog: 'settings' }`, the `dialog/index.ts` registry entry, and the existing `Dialog`/`Form` commit flow (`result`, `valid`, `onOk` → `saveSettings`). Change only how the container wraps it: `Modal.tsx` gets a set of non-modal dialog names (initially just `settings`). For a non-modal dialog, the overlay div is rendered with a `nonModal` class that

- removes the dim background and the flex centering, and
- keeps `position: absolute; inset: 0; z-index: 40` so the element still swallows pointer events over the canvas and the toolbars.

**Why keep the overlay element?** It already gives us requirement 3 ("canvas disabled for modifications") and the functional half of requirement 4 for free, without introducing a read-only editor mode. Turning on `render.options.viewOnlyMode` was rejected: it changes rendering and tool availability semantics, is persisted on the render options, and is intended for genuinely read-only embeds.

**Trade-off:** a transparent full-size overlay means the user cannot scroll or pan the canvas while the window is open. That is consistent with "disabled for any modifications" and with requirement 4, and it matches how the monomer wizard already constrains interaction.

### 3. Toolbar buttons are disabled through one central gate, not ~60 action definitions

**Decision:** Add an `isSettingsPanelOpen` input to the micro action-state computation and apply it inside `status()`/`disabled()` in `state/action/index.ts`:

```ts
disabled: isSettingsPanelOpen || disabled(actObj, params)
```

The flag is derived from the already-existing `modal` state (`state.modal?.name === 'settings'`), so no new slice is needed; the `UPDATE` action already re-runs `buildStateWithStatuses` when state changes.

**Why not copy the `isMonomerCreationWizardActive` pattern?** That pattern edits each action's own `disabled` predicate, which would mean touching every entry in `action/index.ts` and `action/tools.ts`. A single gate in the one place that computes `disabled` is equivalent and far smaller.

Macro has no equivalent registry: `TopMenuComponent` already derives `const isDisabled = isSequenceEditInRNABuilderMode`. Extend that expression with a `selectIsSettingsPanelOpen` selector and apply the same flag in `LeftMenuComponent` and `MonomerLibrary`.

### 4. Default position and drag clamping are computed from the canvas element

**Decision:** The panel is positioned absolutely inside the overlay. On open, it computes its default rect from the canvas container's bounding box:

- right edge = canvas right − gutter
- top edge = canvas top + gutter
- height = `min(contentHeight, canvasHeight − 2 × gutter)`

`useSettingsPanelDrag` tracks pointer drags on the header and clamps the resulting rect so that `left ≥ bounds.left`, `top ≥ bounds.top`, `right ≤ bounds.right`, `bottom ≤ bounds.bottom`. The same clamp runs from a `ResizeObserver` on the bounds element, so shrinking the window or opening/closing the monomer library pulls the panel back inside instead of leaving it stranded.

The bounds element differs per mode and is passed in as a prop: micro passes the canvas container (`classes.canvas` in `App.module.less`); macro passes the `Layout.Main` wrapper, whose box already excludes the top toolbar, left menu and monomer library.

**Why clamp the full rect rather than allow a partial overhang?** Chosen so the panel can never cover a toolbar or the library, which is the literal reading of requirement 5. A full-rect clamp is also the simplest to assert in E2E.

### 5. Hints render inline; tooltip markup is dropped

**Decision:** `SettingsFieldRow` takes an optional `hint` string and renders it as a `<span>` beneath the control, styled small/grey. Micro's `Field` currently forwards a `tooltip` prop that renders an `about` icon with a hover tooltip; those call sites become `hint` instead, reusing the **existing** `dialogs:meta.settings.*Tooltip` strings (post-#9457 wording). Two fields that are hint-only in the mockup and have no tooltip key today — `bondSpacing`'s `% of Length` and `imageResolution`'s DPI note — already exist as `settings:fields.bondSpacing.extraLabel` and `imageResolutionTooltip`, so no new English copy is invented beyond keys for fields the mockup gives a hint to and the code does not.

Macro's `SettingsField` tooltip rendering (`Icon name="about"` + MUI `Tooltip`) disappears with the deleted component.

### 6. Field inventory changes are UI-only

**Decision:** Removing `Language`, `valence-mode`, `aromatize-skip-superatoms` and `dearomatize-on-load` from the panel means deleting their `<Field>` entries only. Their entries in `options-schema.ts`, their defaults, and their handling in `saveSettings` / `SettingsService` stay untouched, so

- `ketcher.setSettings(...)` still accepts them,
- values already persisted in LocalStorage keep working,
- `default-settings-verification.spec.ts`-style API assertions keep passing,
- and restoring a UI control later is a one-line change.

Folding the 3D Viewer fields into General Editing & Display is likewise a move of three `<Field>` elements plus removal of the `viewer3dTab` group object and its title key.

### 7. Macro adapter shape

**Decision:** Replace `ketcher-macromolecules/src/components/modal/Settings/` with a single thin adapter, `components/modal/Settings/SettingsPanelAdapter.tsx`, that

1. reads `settingsService.getSettings()` into local staged state on open (keeping the existing `normalizeSettingsForForm` / `normalizeSettingsForCore` round-trip and the `subscribe` sync),
2. builds the same group/field descriptors the micro side builds, from the same translation keys,
3. renders the shared `SettingsPanel`,
4. on `Apply` calls `settingsService.updateSettings(...)` and closes; on `Cancel`/`✕` closes without writing.

It is still registered in `modalComponentList` under `settings` and still opened with `openModal('settings')`, so the macro `ModalContainer` plumbing is unchanged — the adapter simply does not wrap itself in `shared/modal`'s `Modal`, which is what removes the dimming backdrop on that side.

The group/field descriptors are the one piece of duplication left between the two modes, because the data sources differ (schema-driven `<Field>` vs. plain values from `SettingsService`). Unifying them is explicitly out of scope.

### 8. Appearance tokens taken from the mockup

| Element | Value |
| --- | --- |
| Panel surface | `#ffffff`, 4 px radius, `shadow.mainLayoutBlocks` |
| Panel width | 340 px fixed |
| Section header (collapsed and expanded) | `#f3f5f7`, label `#333333` |
| Section content surface | `#ffffff` |
| Toggle on / off track | `#167782` / `#eff2f5` |
| Input / dropdown border | `#7c7c7f`, 4 px radius |
| Hint text | small, grey, directly under the control |
| Footer | `Cancel` secondary, `Apply` primary (`#167782`) |

`#167782` and `#333333` are already Ketcher theme tokens; the greys map to existing surface tokens. No new colour constants are introduced where a token exists.

## Risks / Trade-offs

- **Blocked canvas panning.** The transparent overlay stops zoom/pan while the window is open (see Decision 2). If product wants live panning, the overlay must become canvas-only with per-widget disabling — a larger change deferred until asked.
- **`Language` field removal** makes the `zh-CN` locale unreachable; recorded in the proposal's open risks and worth resolving before release.
- **E2E churn.** Settings specs and page objects assume a centered modal behind `.modalOverlay` with a `3D Viewer` group. All of them need revisiting; the dropped fields also appear in `acs-style-settings.spec.ts` and `default-settings-verification.spec.ts`.
- **Shared component exported from `ketcher-react`** widens that package's public surface. Keeping `SettingsPanel` purely presentational limits the commitment to props, not to settings semantics.

## Migration Plan

1. Build the shared panel components with no consumers (nothing visible changes).
2. Switch micro to the shared panel behind the non-modal `Modal` mode, including the field re-grouping and the central disable gate. Micro is now fully on the new design.
3. Add the macro adapter, macro toolbar button and macro toolbar/library disabling; delete the old macro Settings component.
4. Update locales, unit tests, page objects and E2E specs.

No feature flag: the window is replaced in place in both modes, and both halves of the ticket (redesign + macro availability) ship together.

## Open Questions

- Should the `Language` selector be reinstated in General Editing & Display, or moved somewhere outside Settings, before this change is released?
- Should the dragged position survive re-opening within a session? Currently specified as "always reopen at the default anchored position".
