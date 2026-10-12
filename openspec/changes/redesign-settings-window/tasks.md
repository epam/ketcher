## 1. Shared panel shell in `ketcher-react`

- [x] 1.1 Create `src/script/ui/views/modal/components/meta/Settings/SettingsPanel.module.less` with the mockup tokens: panel surface (`#ffffff`, 4 px radius, `shadow.mainLayoutBlocks`), fixed 340 px width, section header surface `#f3f5f7` with `#333333` label, content surface `#ffffff`, control border `#7c7c7f`, toggle on `#167782` / off `#eff2f5`, small grey hint text
- [x] 1.2 Create `SettingsPanel.tsx`: props `{ title, headerControls, groups, boundsElement, isApplyDisabled, onApply, onCancel, onClose }`; renders title row (title + `headerControls` + `✕`), scrollable body slot, pinned footer with `Cancel` / `Apply`; no Redux and no `SettingsService` imports
- [x] 1.3 Create `useSettingsPanelDrag.ts`: pointer-down on the title row starts a drag, pointer-move updates `{ left, top }`, pointer-up ends it; exposes the current rect and a `clamp(bounds)` helper
- [x] 1.4 In `useSettingsPanelDrag.ts`, implement the clamp so the panel rect satisfies `left >= bounds.left`, `top >= bounds.top`, `right <= bounds.right`, `bottom <= bounds.bottom`
- [x] 1.5 In `useSettingsPanelDrag.ts`, attach a `ResizeObserver` to the bounds element and re-apply the clamp whenever it resizes
- [x] 1.6 In `SettingsPanel.tsx`, compute the default rect on open from the bounds element: right edge = `bounds.right - gutter`, top edge = `bounds.top + gutter`, height = `min(contentHeight, bounds.height - 2 * gutter)`; reset to this rect on every open
- [x] 1.7 Add `data-testid` attributes for E2E: `settings-panel`, `settings-panel-header`, `settings-panel-close`, `settings-panel-cancel`, `settings-panel-apply`

## 2. Shared accordion and field rows

- [x] 2.1 Create `SettingsAccordion.tsx`: renders a list of `{ key, label, content }` groups; collapsed and expanded headers both use the grey surface with a chevron (down collapsed, up expanded); multi-expand; `expandedGroups` defaults to `['atoms']`
- [x] 2.2 In `SettingsAccordion.tsx`, omit the per-group `elements-group` icon and the "changed group" dot marker present in the current `Accordion` — the mockup has neither
- [x] 2.3 Keep the accordion header `data-testid` convention (`${label}-accordion`) so existing page objects keep resolving group headers
- [x] 2.4 Create `SettingsFieldRow.tsx` supporting four layouts: toggle (label left / switch right), number + unit (label left / number input + unit dropdown right), standalone dropdown (label above a full-width dropdown), colour (label left / colour swatch dropdown right)
- [x] 2.5 In `SettingsFieldRow.tsx`, add an optional `hint` prop rendered as small grey static text directly beneath the control
- [x] 2.6 Delete the old `Settings/Accordion/` component and its `.module.less` once nothing references them

## 3. Non-modal dialog mode in the micro modal container

- [x] 3.1 In `src/script/ui/views/modal/Modal.tsx`, add a `NON_MODAL_DIALOGS` set containing `'settings'` and apply a `nonModal` class to the overlay div when the active dialog is in it
- [x] 3.2 In `Modal.module.less`, add `.modalOverlay.nonModal`: no dim background, no flex centering; keep `position: absolute; inset: 0; z-index: 40` so the element still blocks pointer input to the canvas and the toolbars
- [ ] 3.3 Verify by hand that with the Settings window open the canvas renders at full opacity and canvas clicks/drags/keyboard do not alter the structure

## 4. Disable all toolbar buttons while the window is open (molecules mode)

- [x] 4.1 In `src/script/ui/state/action/index.ts`, thread an `isSettingsPanelOpen` value into `ActionParams` and apply it as a gate inside the `disabled` computation in `status()`
- [x] 4.2 Supply `isSettingsPanelOpen` from `state.modal?.name === 'settings'` wherever `buildStateWithStatuses` params are assembled, so the `UPDATE` path recomputes statuses when the dialog opens and closes
- [ ] 4.3 Confirm the top, left, bottom and right toolbars all render their buttons disabled while the window is open, and return to their normal state after it closes

## 5. Re-group and re-order the molecules-mode field list

- [x] 5.1 In `meta/Settings/Settings.tsx`, change the `tabs` order to `atoms, bonds, stereo, reactions, general, validation, debugging`
- [x] 5.2 Move the `miewMode`, `miewTheme` and `miewAtomLabel` fields to the end of the `general` group; delete the `threeDViewerTab` group object
- [x] 5.3 Remove the `Language` select block from the `general` group
- [x] 5.4 Remove the `valence-mode`, `aromatize-skip-superatoms` and `dearomatize-on-load` fields from the `validation` group
- [x] 5.5 Leave `options-schema.ts`, `getDefaultOptions()`, `saveSettings` and the `SettingsService` schema untouched, so all removed options remain settable through the public API
- [x] 5.6 Replace every `tooltip={...}` prop on a settings `<Field>` with the equivalent inline `hint`, reusing the existing `dialogs:meta.settings.*Tooltip` strings
- [x] 5.7 Render `bondSpacing`'s `% of Length` and `imageResolution`'s DPI note as inline hints using the existing `settings:fields.bondSpacing.extraLabel` and `imageResolutionTooltip` keys
- [ ] 5.8 Add locale keys for any field the mockup gives a hint to that has no description string today (en + zh-CN)
- [x] 5.9 Keep `absFlagLabel`, `andFlagLabel`, `orFlagLabel` and `mixedFlagLabel` as free-text inputs — the mockup draws dropdowns, but these are user-authored `string` options

## 6. Mount the shared panel in molecules mode

- [x] 6.1 Rewrite `meta/Settings/Settings.tsx` to render `SettingsPanel` + `SettingsAccordion` instead of `Dialog`, keeping the existing `Form`/`Field` body, the `formState.valid` gate and the `onOk` → `saveSettings` commit path
- [x] 6.2 Pass the micro canvas container (`App.module.less` `.canvas`) as `boundsElement`
- [x] 6.3 Move `Open from File`, `Save to File`, `Reset` and `Set ACS Settings` into `headerControls`; leave only `Cancel` and `Apply` in the footer
- [x] 6.4 Keep the existing `reactionComponentMarginSize` "apply the layout" notification on `Apply`
- [ ] 6.5 Verify Cancel and `✕` both discard staged edits and Apply persists them across a reload
- [x] 6.6 Delete `Settings.module.less` rules that only served the old centered dialog

## 7. Macromolecules-mode toolbar entry point

- [x] 7.1 In `components/ButtonsComponents/ButtonsComponents.tsx`, add a Settings `IconButton` (`iconName="settings"`, `testId="settings-button"`) immediately before the About button, dispatching `openModal('settings')`
- [x] 7.2 In `Editor.tsx`, confirm the `VerticalDivider` already placed before `ButtonsComponents` separates the Settings/About/Help group from the Micro/Macro switcher; adjust if the new button lands on the wrong side of it
- [x] 7.3 Add the `buttons.settings` title key to the `macromolecules` locale namespace (en + zh-CN)

## 8. Macromolecules-mode adapter over `SettingsService`

- [x] 8.1 Create `components/modal/Settings/SettingsPanelAdapter.tsx`: loads `settingsService.getSettings()` through `normalizeSettingsForForm` into staged local state on open and keeps the existing `settingsService.subscribe` sync
- [x] 8.2 Build the same seven group descriptors with the same field order, labels and hints as molecules mode, from the shared translation keys
- [x] 8.3 Render the shared `SettingsPanel` (imported from `ketcher-react`) with `boundsElement` = the `Layout.Main` wrapper; do **not** wrap it in `components/shared/modal`'s `Modal`, so no backdrop is drawn
- [x] 8.4 Wire `Apply` → `normalizeSettingsForCore` + `settingsService.updateSettings` + close; `Cancel`/`✕` → close without writing
- [x] 8.5 Keep the header-row `Open from File` / `Save to File` / `Reset` / `Set ACS Settings` controls backed by the existing `importSettings` / `exportSettings` / `resetToDefaults` / `loadPreset('acs')` handlers
- [x] 8.6 Repoint the `settings` entry in `modalComponentList` at the adapter
- [x] 8.7 Delete `components/modal/Settings/Settings.tsx`, `Settings.styles.ts`, `SettingsAccordion.tsx`, `SettingsAccordion.styles.ts`, `SettingsField.tsx`, `SettingsFields.tsx` and `fieldGroups.ts`
- [x] 8.8 Remove `macromoleculesDialogs` locale keys that only the deleted component used (en + zh-CN)

## 9. Disable macromolecules chrome while the window is open

- [x] 9.1 Add a `selectIsSettingsPanelOpen` selector to the macro modal state
- [x] 9.2 In `TopMenuComponent`, extend `isDisabled` with the new selector
- [x] 9.3 Disable the `LeftMenuComponent` buttons with the same flag
- [x] 9.4 Disable monomer library interaction with the same flag
- [x] 9.5 Render a transparent full-area capture layer over `Layout.Main` while the window is open so the macro canvas cannot be modified, without dimming it

## 10. Export the shared panel

- [x] 10.1 Export `SettingsPanel`, `SettingsAccordion`, `SettingsFieldRow` and their prop types from the `ketcher-react` package entry point
- [x] 10.2 Run `npm run test:types --workspaces` and confirm `ketcher-macromolecules` resolves the new imports

## 11. Unit tests

- [ ] 11.1 Test `useSettingsPanelDrag` clamping: a drag beyond each of the four bounds edges leaves the rect exactly at that edge
- [ ] 11.2 Test `useSettingsPanelDrag` re-clamping when the bounds element shrinks
- [ ] 11.3 Test `SettingsPanel` default rect: anchored to the bounds' right edge, below the bounds' top edge, height capped to the bounds
- [ ] 11.4 Test `SettingsAccordion`: `atoms` expanded by default, multi-expand, collapse hides content, no group icon and no change marker rendered
- [ ] 11.5 Test `SettingsFieldRow`: each of the four layouts renders its control, and `hint` renders as static text with no tooltip icon
- [ ] 11.6 Test the action-state disable gate: every action reports `disabled` while the settings dialog is open and reverts afterwards
- [ ] 11.7 Test the macro adapter: `Apply` calls `updateSettings` with the normalised staged values; `Cancel` does not call it
- [ ] 11.8 Update `packages/ketcher-react/src/__tests__/settings-integration.test.tsx` and `hooks/__tests__/useSettings.test.tsx` for the new field inventory
- [ ] 11.9 Delete or rewrite macro unit tests that covered the removed `components/modal/Settings` files

## 12. E2E tests (Playwright)

> Before starting this section, re-read `.memory-bank/testing.md`, then draft an E2E test plan from `.memory-bank/e2e-test-plan-template.md` and get it approved before writing any spec code.

- [ ] 12.1 Update the Settings page objects under `ketcher-autotests/tests/pages/` for the new DOM: panel container, header, close button, footer buttons, accordion group headers, field rows
- [ ] 12.2 Update `tests/specs/Settings/**` existing specs for the new group order, the merged General Editing & Display group and the removed fields
- [ ] 12.3 Update `tests/specs/Settings/ACS Style/acs-style-settings.spec.ts` and `tests/specs/Settings/General/default-settings-verification.spec.ts` for the moved header controls and the removed UI fields
- [ ] 12.4 New spec: window opens anchored right of the canvas in both modes and does not overlap the toolbars or the monomer library
- [ ] 12.5 New spec: canvas is not greyed out and canvas clicks/drags do not modify the structure while the window is open
- [ ] 12.6 New spec: all toolbar buttons are disabled while the window is open and re-enabled after it closes, in both modes
- [ ] 12.7 New spec: drag by the header moves the window, and drags past each edge clamp it inside the canvas area
- [ ] 12.8 New spec: macromolecules-mode Settings icon exists left of About, separated from the mode switcher by a divider, and opens the window
- [ ] 12.9 New spec: cross-mode parity — a setting applied in macro mode shows its new value when the window is opened in micro mode
- [ ] 12.10 New spec: Apply persists across reload; Cancel and `✕` discard
- [ ] 12.11 Refresh any Settings screenshot baselines affected by the redesign
