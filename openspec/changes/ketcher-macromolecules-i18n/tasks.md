> **Execution protocol (see `design.md` → Verification Protocol):** all work happens directly on branch `4384-language` in the main repo working directory — no per-section worktrees. Complete a section's subtasks, run its "Code check" and "Visual check" lines, commit the section as **one commit containing only that section's files**, then **STOP and report** (commit hash, `git show --stat HEAD`, what to look at) — do not start the next section's changes until the user has reviewed and approved the commit.

## Status summary

All 9 sections complete and committed on `4384-language`. Only exception: task 8.6 (Playwright E2E) was explicitly asked about and deferred by user decision — not implemented in this pass.

| Section                             | Status      | Commit                                                                        |
| ------------------------------------ | ----------- | ------------------------------------------------------------------------------ |
| 0. Foundation                        | ✅ Done     | `5862352054`                                                                    |
| 1. Always-visible chrome             | ✅ Done     | `3952bfc50e`                                                                    |
| 2. Macromolecule properties & preview| ✅ Done     | `9adf97f496`                                                                    |
| 3. Monomer library                   | ✅ Done     | `4a7275c1fe`                                                                    |
| 4. Context menus                     | ✅ Done     | `028ff2378c`                                                                    |
| 5. Modal dialogs                     | ✅ Done     | `24e803912e`                                                                    |
| 6. Shared components/hooks/helpers   | ✅ Done     | `2d9132ee81`                                                                    |
| 7. RTL groundwork (logical CSS)      | ✅ Done     | `fe5759d750`                                                                    |
| 8. Testing                           | ⚠️ Done except 8.6 | `cbccc35b61` (8.6 Playwright E2E asked about, deferred per user decision) |
| 9. Single-language build mode        | ✅ Done     | `5be0327c64`                                                                    |

## 0. Foundation — Namespace Registration (blocks all extraction tasks — must land first)

- [x] 0.1 Add `react-i18next` as an explicit dependency of `packages/ketcher-macromolecules/package.json`, matching `ketcher-react`'s version range
- [x] 0.2 Create locale skeleton `packages/ketcher-macromolecules/src/locales/{en,zh-CN}/{macromolecules,macromoleculesDialogs}.json` (empty/placeholder objects — content is authored per-section as extraction proceeds)
- [x] 0.3 Register the two new namespaces' resource bundles into the shared instance — implemented as `packages/ketcher-macromolecules/src/i18n/registerNamespaces.ts` calling `i18n.addResourceBundle(...)` on the shared instance imported from `ketcher-react`, not by editing `ketcher-react/src/i18n/i18n.ts` directly (avoids a reverse `ketcher-react -> ketcher-macromolecules` source dependency; documented in the file and in `design.md`)
- [x] 0.4 Extend `resolveTranslatableText`'s key-detection regex (`script/ui/utils/index.ts` in `ketcher-react`) to include `macromolecules`/`macromoleculesDialogs` in the anchored namespace alternation
- [x] 0.5 Document the two new namespaces (purpose, when to use which) in the existing locale README from the foundation change
- [x] 0.6 **Code check:** typecheck, unit tests, circular-deps, build all green; `git diff --stat` shows only the new locale skeleton files + the two shared-file edits (`i18n.ts`, `resolveTranslatableText`) + `package.json`, nothing under `components/`/`hooks/`/`helpers/`
- [x] 0.7 **Visual check:** `cd example && npm run dev:standalone`, confirm the app boots and Macromolecules mode renders exactly as before (no missing-key warnings, no visible text change) — this section adds plumbing only, zero strings extracted yet
- [x] 0.8 **Committed** — `5862352054`
- [x] 0.9 **STOP — report commit hash + diff for review before starting Section 1**

## 1. Extraction — Always-Visible Chrome (`components/menu`, `TopMenuComponent`, `LeftMenuComponent`, `FloatingTools`, `ZoomControls`, `Layout`, `LayoutModeButton`, `ButtonsComponents`, `SequenceTypeGroupButton`, `SequenceSyncEditModeButton`, `Ruler`, `FullscreenButton`)

- [x] 1.1 Inventory title/label/tooltip/aria-label string literals across these directories
- [x] 1.2 Add corresponding keys to `locales/en/macromolecules.json`; route Cancel/OK/Apply/Close-style duplicates through the existing `common:*` namespace instead of redefining
- [x] 1.3 Author matching `locales/zh-CN/macromolecules.json` content for every key added in 1.2
- [x] 1.4 Replace literals with `t()`/`resolveTranslatableText` calls
- [x] 1.5 **Code check:** `git diff --stat` touches only these directories + `locales/{en,zh-CN}/macromolecules.json`; grep confirms no remaining hardcoded literals; typecheck, unit tests, circular-deps, build all green
- [x] 1.6 **Visual check:** `cd example && npm run dev:standalone`, Macromolecules mode — top/left menu, floating tools, zoom controls, layout-mode toggle, fullscreen button, ruler, sequence type/sync-edit-mode buttons; verify in English, then switch the language to Chinese via Settings and confirm every touched string translates (no raw keys, no English leftovers)
- [x] 1.7 **Committed** — `3952bfc50e`
- [x] 1.8 **STOP — report commit hash + diff for review before starting Section 2**

## 2. Extraction — Macromolecule Properties & Preview (`components/macromoleculeProperties`, `components/preview`)

- [x] 2.1 Inventory string literals in both directories
- [x] 2.2 Add corresponding keys to `locales/en/macromolecules.json`
- [x] 2.3 Author matching `locales/zh-CN/macromolecules.json` content
- [x] 2.4 Replace literals with `t()` calls
- [x] 2.5 **Code check:** typecheck, unit tests, circular-deps, build, grep-for-literals all green/clean
- [x] 2.6 **Visual check:** open the macromolecule properties panel and hover a monomer to trigger the preview tooltip, in both English and Chinese
- [x] 2.7 **Committed** — `9adf97f496`
- [x] 2.8 **STOP — report commit hash + diff for review before starting Section 3**

## 3. Extraction — Monomer Library (`components/monomerLibrary`)

- [x] 3.1 Inventory string literals (search placeholder, favorites, group headers, filters, empty states)
- [x] 3.2 Add corresponding keys to `locales/en/macromoleculesDialogs.json`
- [x] 3.3 Author matching `locales/zh-CN/macromoleculesDialogs.json` content
- [x] 3.4 Replace literals with `t()` calls
- [x] 3.5 **Code check:** typecheck, unit tests, circular-deps, build, grep-for-literals all green/clean
- [x] 3.6 **Visual check:** open the monomer library panel — search, favorites tab, every monomer-group header/filter, empty-search state — in English and Chinese
- [x] 3.7 **Committed** — `4a7275c1fe`
- [x] 3.8 **STOP — report commit hash + diff for review before starting Section 4**

## 4. Extraction — Context Menus (`components/contextMenu`)

- [x] 4.1 Inventory string literals across monomer/bond/sequence context menus, including any submenu built from a schema/data structure at module scope (flag for the `useMemo(() => ..., [t])` pattern if so, per `.memory-bank/modules/i18n.md`'s constraint on module-level schema objects)
- [x] 4.2 Add corresponding keys to `locales/en/macromoleculesDialogs.json`
- [x] 4.3 Author matching `locales/zh-CN/macromoleculesDialogs.json` content
- [x] 4.4 Replace literals with `t()` calls
- [x] 4.5 **Code check:** typecheck, unit tests, circular-deps, build, grep-for-literals all green/clean
- [x] 4.6 **Visual check:** right-click every context-menu variant (monomer, bond, sequence/selection) in English and Chinese
- [x] 4.7 **Committed** — `028ff2378c`
- [x] 4.8 **STOP — report commit hash + diff for review before starting Section 5**

## 5. Extraction — Modal Dialogs (`components/modal`)

- [x] 5.1 Inventory string literals across RNA Builder, monomer/preset creation wizard, and any other modal dialogs in this directory
- [x] 5.2 Add corresponding keys to `locales/en/macromoleculesDialogs.json`
- [x] 5.3 Author matching `locales/zh-CN/macromoleculesDialogs.json` content
- [x] 5.4 Replace literals with `t()` calls, including interpolated/template-literal strings (verify ICU interpolation renders correctly) — note: `SettingsField.tsx` resolves `labelKey`/`titleKey` values that are plain-string constants defined in `fieldGroups.ts`, not literal `t()` arguments, so they're outside what a static-literal scan (Section 8) can verify; confirmed correct via live browser QA instead
- [x] 5.5 **Code check:** typecheck, unit tests, circular-deps, build, grep-for-literals all green/clean
- [x] 5.6 **Visual check:** open every dialog under `components/modal` (RNA Builder full flow, monomer/preset creation wizard including any multi-step/tabbed parts) in English and Chinese
- [x] 5.7 **Committed** — `24e803912e`
- [x] 5.8 **STOP — report commit hash + diff for review before starting Section 6**

## 6. Extraction — Shared Components (`components/shared`, `hooks`, `helpers`)

- [x] 6.1 Inventory string literals in `components/shared` (manual read required — grep candidate count is inflated by non-UI code per `design.md` Risk), plus any UI-facing text generated in `hooks`/`helpers` (snackbar/toast/validation messages)
- [x] 6.2 Add corresponding keys to whichever namespace matches each string's actual usage context (`macromolecules` if it's chrome-shared, `macromoleculesDialogs` if it's dialog/library/menu-shared)
- [x] 6.3 Author matching `zh-CN` content for every key added
- [x] 6.4 Replace literals with `t()` calls — `helpers/getMonomerName.ts`'s plain functions had `t` threaded in as a parameter from their one call site (`ConnectionOverview.tsx`) since they have no hook access; no snackbar/toast messages requiring the module-scope-`i18n.t()`/`useMemo` pattern were found in this pass
- [x] 6.5 **Code check:** typecheck, unit tests, circular-deps, build all green; grep (narrow key-pattern + broad literal sweep) confirms no remaining hardcoded literals across all three directories; confirm no changes leaked into sequence/canvas-rendering code
- [x] 6.6 **Visual check:** exercise every shared component/hook path touched (identify from the inventory — likely includes shared buttons, confirm dialogs, form fields reused by Sections 1–5) in English and Chinese; re-check one screen from each prior section to confirm no regression from shared-component changes
- [x] 6.7 **Committed** — `2d9132ee81`
- [x] 6.8 **STOP — report commit hash + diff for review before starting Section 7**

**Deferred, flagged as a plan gap (not fixed unilaterally):** the `MonomerGroups` enum / `RnaBuilderPresetsItem` display-vs-Redux-key coupling identified during Section 3 lives in `state/library`/`state/rna-builder`, which isn't covered by any section in this file (0–9). The `_Copy` preset-name-uniqueness suffix (also flagged in Section 3) was checked for consistency in Section 6 and left untranslated as stable naming-scheme data (see Section 6 commit message for the reasoning).

## 7. RTL Groundwork — Emotion/`sx` Logical Properties Audit

- [x] 7.1 Enumerate Emotion `css`/`styled` template literals and MUI `sx` props in `ketcher-macromolecules` using physical directional properties (`left`/`right`, `marginLeft`/`marginRight`, `paddingLeft`/`paddingRight`, `borderLeft`/`borderRight`, `textAlign: 'left'/'right'`)
- [x] 7.2 Convert UI-chrome styling to logical properties (`insetInlineStart/End`, `marginInlineStart/End`, `paddingInlineStart/End`, `borderInlineStart/End`, `textAlign: 'start'/'end'`), excluding anything tied to sequence/canvas-rendering geometry — 29 files converted; one MUI `sx={{ mr: 1, ml: 1 }}` deliberately left physical (symmetric value, already RTL-safe as a no-op, and converting it risked a silent unit regression via MUI's spacing-shorthand transform — see commit message)
- [x] 7.3 Explicitly verify sequence-rendering and monomer/bond canvas-adjacent styles are left untouched — excluded: `FloatingTools`/`RnaPresetGroup`/`MonomerGroup`/`BondPreview`'s `getBoundingClientRect()`-derived dynamic hover-preview positions, `RnaEditorExpanded.tsx`'s 5′/3′ phosphate-position chemistry strings, and `MacromoleculePropertiesWindow.tsx`'s D3 chart coordinate-margin object
- [x] 7.4 **Code check:** typecheck, unit tests, build all green; `git diff --name-only` touches only styling files/props, zero unrelated logic changes; every changed declaration verified to be a pure property-name swap
- [x] 7.5 **Visual check:** `cd example && npm run dev:standalone` in default (LTR) mode, walk through every UI area touched in Sections 1–6, confirm pixel-identical layout to before the conversion
- [x] 7.6 **Committed** — `fe5759d750`
- [x] 7.7 **STOP — report commit hash + diff for review before starting Section 8**

## 8. Testing

- [x] 8.1 Extend `packages/ketcher-react/src/i18n/i18n.test.ts`'s key-existence scan to also scan `packages/ketcher-macromolecules/src` — plus an additional detection pass (`collectNamespaceBoundBareKeys`) for that package's dominant `useTranslation(ns)` + bare `t('key')` style, since the plain `ns:key` literal scan alone found zero matches there; found and verified 174 real bare-key references
- [x] 8.2 Extend the `en`/`zh-CN` key-parity check to cover `macromolecules`/`macromoleculesDialogs`
- [x] 8.3 Extend the no-hardcoded-strings guard test to cover the directories touched in Sections 1–6 — zero violations found, no exceptions list needed
- [x] 8.4 **Code check:** typecheck, unit tests (including the extended guards) all green
- [x] 8.5 **Visual check:** full walkthrough of Macromolecules mode in both English and Chinese, tracking console for `[i18n] Missing key` warnings — every dialog, menu, panel, and toolbar touched in Sections 1–7; confirmed `process.env.NODE_ENV === 'development'` so the handler was actually live; zero warnings observed
- [ ] 8.6 Playwright E2E coverage: ask before proceeding (per project rule) — do not start writing e2e tests without an explicit go-ahead, and read `.memory-bank/testing.md` first if approved. **Asked (2026-09-18) — user chose to skip for now rather than proceed. Deferred indefinitely; not a blocker for Section 9 or archiving this change.**
- [x] 8.7 **Committed** — `cbccc35b61`
- [x] 8.8 **STOP — report commit hash + diff for review before starting Section 9**

## 9. Build-Time Single-Language Mode (customer requirement)

- [x] 9.1 Add the `KETCHER_SINGLE_LANGUAGE_BUILD` compile-time constant to both `packages/ketcher-react/rollup.config.mjs` and `packages/ketcher-macromolecules/rollup.config.mjs`'s existing `@rollup/plugin-replace` `values` map, mirroring the `NODE_ENV`/`BUILD_NUMBER` pattern already there
- [x] 9.2 Restructure `packages/ketcher-react/src/i18n/i18n.ts`'s resource assembly so every non-`en` namespace import sits behind a `!SINGLE_LANGUAGE_BUILD` branch (imports themselves stay unconditional ES imports — only illegal to make conditional — but the object literal referencing them is gated so Rollup's tree-shaking drops both once the flag is replaced with a literal), and `SUPPORTED_LANGUAGES` collapses to `[{ code: 'en', label: 'English' }]` when the flag is set. **Scope extended beyond the literal task text:** also applied to `packages/ketcher-macromolecules/src/i18n/registerNamespaces.ts`, which registers that package's own `macromolecules`/`macromoleculesDialogs` zh-CN bundles independently of `i18n.ts` — without the same treatment there, the flag would have had no effect on ketcher-macromolecules' own locale payload
- [x] 9.3 Hide the Settings language switcher when `SUPPORTED_LANGUAGES.length === 1`
- [x] 9.4 **Bundle verification (not just code review):** built both packages flag-unset and flag-`true`, grepped `dist/` output for zh-CN-only strings before/after. ketcher-react: `简体中文`/`旋转步长` present unflagged, 0 occurrences flagged; `dist/index.js` 2049218→2020908 bytes, `dist/cjs/index.js` 2098238→2069928 bytes (~28.3KB off both). ketcher-macromolecules: `RNA构建器`/`隐藏库`/`按名称搜索` present unflagged, 0 flagged; `dist/index.js` 556155→544320 bytes, `dist/index.modern.js` 534186→522377 bytes (~11.8KB off both). Both rebuilt unflagged afterward to restore normal `dist/` state
- [x] 9.5 **Code check:** typecheck, unit tests, circular-deps, both build modes (flag on/off) all green; `git diff --stat` touches the two `rollup.config.mjs` files + `i18n.ts` + the Settings language-switcher component + `registerNamespaces.ts` (see 9.2's scope note for why a 5th file was necessary)
- [x] 9.6 **Visual check:** `cd example && npm run dev:standalone` with and without the flag — off: language switcher lists both languages and switches normally, exactly as before; on: switcher entirely absent from Settings, both `ketcher-react` and `ketcher-macromolecules` render English-only (no stale zh-CN from a prior stored preference), no console errors
- [x] 9.7 **Committed** — `5be0327c64`
- [x] 9.8 **STOP — report commit hash + diff for final review**