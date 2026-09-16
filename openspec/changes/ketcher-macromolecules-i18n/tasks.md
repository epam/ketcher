> **Execution protocol (see `design.md` → Verification Protocol):** all work happens directly on branch `4384-language` in the main repo working directory — no per-section worktrees. Complete a section's subtasks, run its "Code check" and "Visual check" lines, commit the section as **one commit containing only that section's files**, then **STOP and report** (commit hash, `git show --stat HEAD`, what to look at) — do not start the next section's changes until the user has reviewed and approved the commit.

## 0. Foundation — Namespace Registration (blocks all extraction tasks — must land first)

- [ ] 0.1 Add `react-i18next` as an explicit dependency of `packages/ketcher-macromolecules/package.json`, matching `ketcher-react`'s version range
- [ ] 0.2 Create locale skeleton `packages/ketcher-macromolecules/src/locales/{en,zh-CN}/{macromolecules,macromoleculesDialogs}.json` (empty/placeholder objects — content is authored per-section as extraction proceeds)
- [ ] 0.3 Register the two new namespaces' resource bundles into the shared instance in `packages/ketcher-react/src/i18n/i18n.ts`, alongside the existing six
- [ ] 0.4 Extend `resolveTranslatableText`'s key-detection regex (`script/ui/utils/index.ts` in `ketcher-react`) to include `macromolecules`/`macromoleculesDialogs` in the anchored namespace alternation
- [ ] 0.5 Document the two new namespaces (purpose, when to use which) in the existing locale README from the foundation change, or a `ketcher-macromolecules`-local sibling if that's cleaner
- [ ] 0.6 **Code check:** typecheck, unit tests, circular-deps, build all green; `git diff --stat` shows only the new locale skeleton files + the two shared-file edits (`i18n.ts`, `resolveTranslatableText`) + `package.json`, nothing under `components/`/`hooks/`/`helpers/`
- [ ] 0.7 **Visual check:** `cd example && npm run dev:standalone`, confirm the app boots and Macromolecules mode renders exactly as before (no missing-key warnings, no visible text change) — this section adds plumbing only, zero strings extracted yet
- [ ] 0.8 **Committed**
- [ ] 0.9 **STOP — report commit hash + diff for review before starting Section 1**

## 1. Extraction — Always-Visible Chrome (`components/menu`, `TopMenuComponent`, `LeftMenuComponent`, `FloatingTools`, `ZoomControls`, `Layout`, `LayoutModeButton`, `ButtonsComponents`, `SequenceTypeGroupButton`, `SequenceSyncEditModeButton`, `Ruler`, `FullscreenButton`)

- [ ] 1.1 Inventory title/label/tooltip/aria-label string literals across these directories
- [ ] 1.2 Add corresponding keys to `locales/en/macromolecules.json`; route Cancel/OK/Apply/Close-style duplicates through the existing `common:*` namespace instead of redefining
- [ ] 1.3 Author matching `locales/zh-CN/macromolecules.json` content for every key added in 1.2
- [ ] 1.4 Replace literals with `t()`/`resolveTranslatableText` calls
- [ ] 1.5 **Code check:** `git diff --stat` touches only these directories + `locales/{en,zh-CN}/macromolecules.json`; grep confirms no remaining hardcoded literals; typecheck, unit tests, circular-deps, build all green
- [ ] 1.6 **Visual check:** `cd example && npm run dev:standalone`, Macromolecules mode — top/left menu, floating tools, zoom controls, layout-mode toggle, fullscreen button, ruler, sequence type/sync-edit-mode buttons; verify in English, then switch the language to Chinese via Settings and confirm every touched string translates (no raw keys, no English leftovers)
- [ ] 1.7 **Committed**
- [ ] 1.8 **STOP — report commit hash + diff for review before starting Section 2**

## 2. Extraction — Macromolecule Properties & Preview (`components/macromoleculeProperties`, `components/preview`)

- [ ] 2.1 Inventory string literals in both directories
- [ ] 2.2 Add corresponding keys to `locales/en/macromolecules.json`
- [ ] 2.3 Author matching `locales/zh-CN/macromolecules.json` content
- [ ] 2.4 Replace literals with `t()` calls
- [ ] 2.5 **Code check:** typecheck, unit tests, circular-deps, build, grep-for-literals all green/clean
- [ ] 2.6 **Visual check:** open the macromolecule properties panel and hover a monomer to trigger the preview tooltip, in both English and Chinese
- [ ] 2.7 **Committed**
- [ ] 2.8 **STOP — report commit hash + diff for review before starting Section 3**

## 3. Extraction — Monomer Library (`components/monomerLibrary`)

- [ ] 3.1 Inventory string literals (search placeholder, favorites, group headers, filters, empty states)
- [ ] 3.2 Add corresponding keys to `locales/en/macromoleculesDialogs.json`
- [ ] 3.3 Author matching `locales/zh-CN/macromoleculesDialogs.json` content
- [ ] 3.4 Replace literals with `t()` calls
- [ ] 3.5 **Code check:** typecheck, unit tests, circular-deps, build, grep-for-literals all green/clean
- [ ] 3.6 **Visual check:** open the monomer library panel — search, favorites tab, every monomer-group header/filter, empty-search state — in English and Chinese
- [ ] 3.7 **Committed**
- [ ] 3.8 **STOP — report commit hash + diff for review before starting Section 4**

## 4. Extraction — Context Menus (`components/contextMenu`)

- [ ] 4.1 Inventory string literals across monomer/bond/sequence context menus, including any submenu built from a schema/data structure at module scope (flag for the `useMemo(() => ..., [t])` pattern if so, per `.memory-bank/modules/i18n.md`'s constraint on module-level schema objects)
- [ ] 4.2 Add corresponding keys to `locales/en/macromoleculesDialogs.json`
- [ ] 4.3 Author matching `locales/zh-CN/macromoleculesDialogs.json` content
- [ ] 4.4 Replace literals with `t()` calls
- [ ] 4.5 **Code check:** typecheck, unit tests, circular-deps, build, grep-for-literals all green/clean
- [ ] 4.6 **Visual check:** right-click every context-menu variant (monomer, bond, sequence/selection) in English and Chinese
- [ ] 4.7 **Committed**
- [ ] 4.8 **STOP — report commit hash + diff for review before starting Section 5**

## 5. Extraction — Modal Dialogs (`components/modal`)

- [ ] 5.1 Inventory string literals across RNA Builder, monomer/preset creation wizard, and any other modal dialogs in this directory
- [ ] 5.2 Add corresponding keys to `locales/en/macromoleculesDialogs.json`
- [ ] 5.3 Author matching `locales/zh-CN/macromoleculesDialogs.json` content
- [ ] 5.4 Replace literals with `t()` calls, including interpolated/template-literal strings (verify ICU interpolation renders correctly)
- [ ] 5.5 **Code check:** typecheck, unit tests, circular-deps, build, grep-for-literals all green/clean
- [ ] 5.6 **Visual check:** open every dialog under `components/modal` (RNA Builder full flow, monomer/preset creation wizard including any multi-step/tabbed parts) in English and Chinese
- [ ] 5.7 **Committed**
- [ ] 5.8 **STOP — report commit hash + diff for review before starting Section 6**

## 6. Extraction — Shared Components (`components/shared`, `hooks`, `helpers`)

- [ ] 6.1 Inventory string literals in `components/shared` (manual read required — grep candidate count is inflated by non-UI code per `design.md` Risk), plus any UI-facing text generated in `hooks`/`helpers` (snackbar/toast/validation messages)
- [ ] 6.2 Add corresponding keys to whichever namespace matches each string's actual usage context (`macromolecules` if it's chrome-shared, `macromoleculesDialogs` if it's dialog/library/menu-shared)
- [ ] 6.3 Author matching `zh-CN` content for every key added
- [ ] 6.4 Replace literals with `t()` calls; for any snackbar/toast message constructed outside a component's render (no `useTranslation()` available), apply the same two patterns documented in `.memory-bank/modules/i18n.md` (module-scope `i18n.t()` call vs. `useMemo(() => ..., [t])` inside the triggering component), preferring the latter for anything user-repeatable without a reload
- [ ] 6.5 **Code check:** typecheck, unit tests, circular-deps, build all green; grep (narrow key-pattern + broad literal sweep) confirms no remaining hardcoded literals across all three directories; confirm no changes leaked into sequence/canvas-rendering code
- [ ] 6.6 **Visual check:** exercise every shared component/hook path touched (identify from the inventory — likely includes shared buttons, confirm dialogs, form fields reused by Sections 1–5) in English and Chinese; re-check one screen from each prior section to confirm no regression from shared-component changes
- [ ] 6.7 **Committed**
- [ ] 6.8 **STOP — report commit hash + diff for review before starting Section 7**

## 7. RTL Groundwork — Emotion/`sx` Logical Properties Audit

- [ ] 7.1 Enumerate Emotion `css`/`styled` template literals and MUI `sx` props in `ketcher-macromolecules` using physical directional properties (`left`/`right`, `marginLeft`/`marginRight`, `paddingLeft`/`paddingRight`, `borderLeft`/`borderRight`, `textAlign: 'left'/'right'`)
- [ ] 7.2 Convert UI-chrome styling to logical properties (`insetInlineStart/End`, `marginInlineStart/End`, `paddingInlineStart/End`, `borderInlineStart/End`, `textAlign: 'start'/'end'`), excluding anything tied to sequence/canvas-rendering geometry
- [ ] 7.3 Explicitly verify sequence-rendering and monomer/bond canvas-adjacent styles are left untouched
- [ ] 7.4 **Code check:** typecheck, unit tests, build all green; `git diff --name-only` touches only styling files/props, zero unrelated logic changes; every changed declaration verified to be a pure property-name swap
- [ ] 7.5 **Visual check:** `cd example && npm run dev:standalone` in default (LTR) mode, walk through every UI area touched in Sections 1–6, confirm pixel-identical layout to before the conversion
- [ ] 7.6 **Committed**
- [ ] 7.7 **STOP — report commit hash + diff for review before starting Section 8**

## 8. Testing

- [ ] 8.1 Extend `packages/ketcher-react/src/i18n/i18n.test.ts`'s key-existence scan to also scan `packages/ketcher-macromolecules/src`
- [ ] 8.2 Extend the `en`/`zh-CN` key-parity check to cover `macromolecules`/`macromoleculesDialogs`
- [ ] 8.3 Extend the no-hardcoded-strings guard test to cover the directories touched in Sections 1–6
- [ ] 8.4 **Code check:** typecheck, unit tests (including the extended guards) all green
- [ ] 8.5 **Visual check:** full walkthrough of Macromolecules mode in both English and Chinese, tracking console for `[i18n] Missing key` warnings — every dialog, menu, panel, and toolbar touched in Sections 1–7
- [ ] 8.6 Playwright E2E coverage: ask before proceeding (per project rule) — do not start writing e2e tests without an explicit go-ahead, and read `.memory-bank/testing.md` first if approved
- [ ] 8.7 **Committed**
- [ ] 8.8 **STOP — report commit hash + diff for review before starting Section 9**

## 9. Build-Time Single-Language Mode (customer requirement)

- [ ] 9.1 Add the `KETCHER_SINGLE_LANGUAGE_BUILD` compile-time constant to both `packages/ketcher-react/rollup.config.mjs` and `packages/ketcher-macromolecules/rollup.config.mjs`'s existing `@rollup/plugin-replace` `values` map, mirroring the `NODE_ENV`/`BUILD_NUMBER` pattern already there
- [ ] 9.2 Restructure `packages/ketcher-react/src/i18n/i18n.ts`'s resource assembly so every non-`en` namespace import (all six existing namespaces plus this change's `macromolecules`/`macromoleculesDialogs`) sits behind `if (process.env.KETCHER_SINGLE_LANGUAGE_BUILD !== 'true') { ... }`, and `SUPPORTED_LANGUAGES` collapses to `[{ code: 'en', label: 'English' }]` when the flag is set
- [ ] 9.3 Hide the Settings language switcher when `SUPPORTED_LANGUAGES.length === 1`
- [ ] 9.4 **Bundle verification (not just code review):** build once with the flag unset and once with it set to `true`; confirm via a build-output check (e.g. `grep` the production bundle for a `zh-CN`-only string, or a bundle-size diff) that the non-English JSON payload is actually absent from the flagged build, not merely unreachable at runtime
- [ ] 9.5 **Code check:** typecheck, unit tests, circular-deps, both build modes (flag on/off) all green; `git diff --stat` touches only the two `rollup.config.mjs` files + `i18n.ts` + the Settings language-switcher component
- [ ] 9.6 **Visual check:** `cd example && npm run dev:standalone` (or a local flagged production build) — with the flag off, confirm the language switcher still works exactly as before across every section's touched area; with the flag on, confirm the switcher is hidden and both `ketcher-react` and `ketcher-macromolecules` render only in English with no console errors about missing resources
- [ ] 9.7 **Committed**
- [ ] 9.8 **STOP — report commit hash + diff for final review**