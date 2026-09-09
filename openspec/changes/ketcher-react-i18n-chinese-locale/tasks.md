> **Execution protocol (see `design.md` → Verification Protocol):** all work happens directly on branch `4384-language`. Complete a section's subtasks, run its "Code check" and "Visual check" lines, commit the section as **one commit containing only that section's files**, then **STOP and report** (commit hash, `git show --stat HEAD`, what to look at) — do not start the next section's changes until the user has reviewed and approved the commit.

## 1. Infrastructure — locale registration, language switcher, persistence, reactive `dir`

- [x] 1.1 Create `packages/ketcher-react/src/locales/zh-CN/{common,toolbar,toolbars,dialogs,components,settings}.json` skeletons (empty `{}` placeholders — content lands in Sections 2-5) and register `zh-CN` in `i18n.ts`'s `resources`
- [x] 1.2 Add persisted-language read/write to `i18n.ts`: a dedicated `localStorage` key (`ketcher-language`), read on init (fallback `en`) to pick the initial `lng`
- [x] 1.3 Add a "Language" field to `Settings.tsx`'s General tab: independent of the settings-schema/Apply-Cancel flow (see design.md Decision 2), `onChange` calls `i18n.changeLanguage()` + persists immediately; options are English/`en` and 简体中文/`zh-CN` — implemented by exporting `Label` from `form.tsx` for visual consistency with schema-backed rows
- [x] 1.4 Make `dir` reactive: add `useTranslation()` to `Editor.tsx` so it re-renders (and re-reads `i18n.dir()`) on a live language change
- [x] 1.5 **Code check:** typecheck, unit tests 403/403, circular-deps, build, prettier all green
- [x] 1.6 **Visual check:** performed live — Settings → General shows "Language" as the first field; switching to 简体中文 updates the dropdown's own label immediately, every other still-untranslated string gracefully falls back to English with zero console warnings (fallbackLng working as expected for Section 1's empty zh-CN content); reload confirms persistence; Cancel confirmed to NOT revert the language choice (per Decision 2)
- [x] 1.7 **Committed:** `0146656d16` on `4384-language`
- [ ] 1.8 **STOP — report commit hash + diff for review before starting Section 2**

## 2. Translate `common.json` + `toolbar.json` + `toolbars.json`

- [x] 2.1 Translate all `common.json` keys (13 strings: buttons, monomer types, shared errors) into `zh-CN`
- [x] 2.2 Translate all `toolbar.json` keys (88 strings: toolbar/menu action titles) into `zh-CN`
- [x] 2.3 Translate all `toolbars.json` keys (8 strings) into `zh-CN`
- [x] 2.4 **Code check:** manual key-diff (`en` vs `zh-CN` leaf keys) confirms 0 missing/0 extra for all three files; ICU placeholder preservation also verified by script; typecheck, unit tests 403/403, circular-deps, build, prettier all green
- [x] 2.5 **Visual check:** performed live — switched to 简体中文, confirmed top toolbar tooltips (清空画布/打开/另存为/复制/粘贴/剪切/撤销/重做/etc.), mode switcher (分子/大分子), zoom dropdown (缩小/放大/缩放 100%), and Settings dialog chrome (常规/取消/应用, reused from `common.json`) all render correctly with zero console warnings. Noted one pre-existing, out-of-scope limitation: bond tool titles (e.g. "Single键") mix in an untranslated English bond-type name sourced from `ketcher-core`'s `bondSchema.enumNames` — not something either this change or the foundation change can fix without touching `ketcher-core`
- [x] 2.6 **Committed:** `402b6834d3` on `4384-language`
- [ ] 2.7 **STOP — report commit hash + diff for review before starting Section 3**

## 3. Translate `dialogs.json`

- [x] 3.1 Translate all `dialogs.json` keys (136 strings: document/meta/process/toolbox dialogs, Confirm/ExtendedTable/InfoModal/PeriodTable/Text) into `zh-CN`, preserving ICU interpolation placeholders (`{name}`, `{count}`, etc.) unchanged
- [x] 3.2 **Code check:** manual key-diff confirms 1:1 coverage with `en` (0 missing/0 extra) and 0 ICU placeholder mismatches; typecheck, unit tests 403/403, circular-deps, build, prettier all green
- [x] 3.3 **Visual check:** performed live — switched to 简体中文, opened Save Structure (文件名/文件格式/预览/取消/保存), Open structure (从剪贴板粘贴/从文件打开), Settings dialog chrome (设置/常规/立体化学/原子/键/服务器/3D 查看器/调试选项), About (版本/构建时间/反馈), Calculated Values (化学式/分子量/精确质量/元素分析), and Structure Check (结构检查 + all 12 checkbox labels + 上次检查/未检测到错误) — every string rendered correctly, no truncation/overflow, zero console warnings
- [x] 3.4 **Committed:** `f406b9835e` on `4384-language`
- [ ] 3.5 **STOP — report commit hash + diff for review before starting Section 4**

## 4. Translate `components.json`

- [x] 4.1 Translate all `components.json` keys (100 strings: context menus, MonomerCreationWizard, StructEditor chrome) into `zh-CN`, preserving ICU placeholders
- [x] 4.2 **Regressions found live and fixed (not in original task list, discovered during 4.3):**
  1. `ContextMenu/utils.ts`'s `formatTitle()` stripped a hardcoded 5-character suffix (English " Bond") off a resolved, translated bond-title string to get the bare type name for menu display. Worked by coincidence in English; zh-CN's 1-character "键" suffix meant the same slice cut into the type name itself (e.g. "Single键" → "Si"). Fixed by reading the type name directly from `titleParams` instead of slicing translated text — `formatTitle` deleted, replaced by `getBondTypeName` in `BondMenuItems.tsx`/`SelectionMenuItems.tsx`.
  2. A broader grep swept up 6 more files with hardcoded English as bare JSX text nodes (not `title=`/`label=` attributes, the documented blind spot of the foundation change's `noHardcodedStrings.test.ts` guard) that survived the entire foundation change: `useMakeAttachmentPointMenuItems.tsx`, `RGroupAttachmentPointMenuItems.tsx`, `AttachmentPointLabelMenuItems.tsx`, `FunctionalGroupMenuItems.tsx`, `MultitailArrowMenuItems.tsx`, and `MonomerCreationWizard.tsx`'s own wizard header ("Create Monomer") + `Notification.tsx`'s dismiss button ("OK"). Fixed all 8 strings — 3 reuse existing keys (`attachmentPointEditPopup.title`, `dialogs:toolbox.removeFG.removeAbbreviation`, `contextMenu.createMonomerItem`, `common:button.ok`), 5 are new `components.json` keys. Key parity reconfirmed at 108/108 (0 missing/extra) after the additions.
- [x] 4.3 **Code check:** manual key-diff confirms 1:1 coverage with `en` (108/108); typecheck, unit tests 403/403, circular-deps, build, prettier all green
- [x] 4.4 **Visual check:** performed live — switched to 简体中文, confirmed atom/bond/selection context menus (bond type submenu now shows full untruncated names post-fix: Single/Single Up/Single Down/.../Dative), the full MonomerCreationWizard (Type dropdown, CHEM form, Discard/Submit, wizard header now translated), and the multitail arrow's "添加新尾部" context menu item — zero console warnings
- [x] 4.5 **Committed:** `a1d6dc59af` on `4384-language`
- [ ] 4.6 **STOP — report commit hash + diff for review before starting Section 5**

## 5. Translate `settings.json`

- [x] 5.1 Translate all `settings.json` keys (73 strings incl. `language.title` added in Section 1: Settings-panel field titles/enum labels) into `zh-CN`
- [x] 5.2 **Code check:** manual key-diff confirms 1:1 coverage with `en` (73/73, 0 missing/extra); typecheck, unit tests 403/403, circular-deps, build, prettier all green
- [x] 5.3 **Visual check:** performed live — switched to 简体中文, expanded all 7 Settings tabs and dumped full text content via script: every field title and dropdown option across 常规/立体化学/原子/键/服务器/3D 查看器/调试选项 renders correctly in Chinese; data-driven enums sourced from `ketcher-core` (e.g. "Terminal and Hetero") correctly remain untranslated; zero console warnings
- [x] 5.4 **Committed:** `9338c5e448` on `4384-language`
- [ ] 5.5 **STOP — report commit hash + diff for review before starting Section 6**

## 6. Legacy `script/ui/dialog/*` + `struct-schema.ts` + `sdata-schema.js` (scope discovered mid-Section-6 walkthrough; pulled in per explicit user decision)

Discovered while doing the original Section 6 final walkthrough: right-clicking the R-Group label tool revealed an entirely untranslated dialog belonging to a legacy `script/ui/dialog/*` tree (17 files) that neither the foundation project nor this change's Sections 1-5 ever touched. That tree is backed by `struct-schema.ts` (also consumed by 4 already-complete foundation-project dialogs: `Atom.tsx`, `Bond.tsx`, `RgroupLogic.tsx`, `Attach.tsx`) and `sdata-schema.js`. User approved pulling both into this same change as a new section.

- [x] 6.1 `struct-schema.ts`: convert property-level `title` fields and word-based `enumNames` to translation keys. **Exclusions (leave untouched):** `bond.properties.type.enumNames` (shared verbatim with `tools.ts`'s `bondTypeNames`/`getBondTypeName`, neither of which resolves through `t()`); all top-level schema `.title` fields (`atom`, `bond`, `rgroupSchema`, `labelEdit`, `attachmentPoints`, `sgroup`, `rgroupLogic`, `textSchema`, `attachSchema` — inert for display, and `bond.title` also guards a `form.tsx` identity check); numeric/valence-notation `enumNames` arrays (e.g. `['', '0', 'I', 'II', ...]`). Convert `customQueryInvalidMessage()` to build its message via module-level `i18n.t()` with an ICU count param instead of raw string interpolation.
- [x] 6.2 `sdata-schema.js`: translate only `sdataCustomSchema`'s 3 rendered property titles (Context/Field name/Field value). Leave the entire deep `sData`/`sdataSchema`/`contextSchema` structure untouched (default-value lookup only, never rendered).
- [x] 6.3 Thread `t` into every `getSelectOptionsFromSchema(...)` call site not yet passing it: `form.tsx`'s internal `SelectOneOf`, `SGroupFieldset.tsx`'s `content()`, `AtomElement.tsx`, `Bond.tsx` (topology + center only — **not** the `type` call), `IfThenSelect.tsx`.
- [x] 6.4 Fix the 4 `buttonsNameMap={{ OK: 'Apply' }}` overrides that bypass `Dialog.tsx`'s automatic `common:button.*` resolution — replace with `t('common:button.apply')` — and translate each dialog's own `title` prop: `rgroup.tsx` ("R-Group"), `sgroup.tsx` ("S-Group Properties"), `labeledit.tsx` ("Label Edit"), `enhancedStereo.tsx` ("Enhanced Stereochemistry")
- [x] 6.5 `enhancedStereo.tsx`: translate remaining bare-JSX-text strings ("Add to AND"/"Group", "Add to OR"/"Group", "Create new AND Group", "Create new OR Group"); leave "ABS" untouched (universal stereo-descriptor abbreviation)
- [x] 6.6 `SDataFieldset.tsx`: translate `placeholder="Enter value"` / `placeholder="Enter name"`
- [x] 6.7 `AbbreviationLookup.constants.tsx` + `AbbreviationLookup.tsx`: translate `NO_MATCHING_RESULTS_LABEL` / `START_TYPING_NOTIFICATION_LABEL`; update `AbbreviationLookup.test.tsx`'s assertions to match
- [x] 6.8 `TemplateDialog.tsx` + `EmptySearchResult.tsx` callers: translate "Structure Library", "Click to add to canvas", "Save to SDF", the "Some templates could not be exported." snackbar, `placeholder="Search by elements..."`, the 3 `<Tab label>` values (Template Library/Functional Groups/Salts and Solvents), and the 3 `textInfo="No items found"` props. **Do not touch** the module-level `const FUNCTIONAL_GROUPS = 'Functional Groups'` data-lookup-key constant, despite the coincidental text match with the translated Tab label.
- [x] 6.9 `template-attach.tsx`: translate dialog titles ("Save to Templates"/"Template Edit"), the two-sentence storage warning (interpolate the `warningObject` var — "Templates"/"Edited templates" — via ICU `{name}`-style param rather than string concatenation), "Selected attachment points", the "Atom ID:"/"Bond ID:" labels, the Cancel/Save/Edit button text, and `placeholder="template"`
- [x] 6.10 Add every new key from 6.1-6.9 to both `en/dialogs.json` (or the appropriate existing namespace) and `zh-CN/dialogs.json`, preserving 1:1 key parity and ICU placeholders
- [x] 6.11 **Code check:** typecheck clean; unit tests 412/413 (1 pre-existing skip) all green incl. updated `AbbreviationLookup.test.tsx`; `test:circ` clean (no circular deps from the new `struct-schema.ts`/`sdata-schema.js` → `i18n.ts` import); `build:react` succeeded (same pre-existing warnings); `eslint` on all touched files: 0 errors; prettier clean
- [x] 6.12 **Visual check:** performed live under 简体中文 — R-Group dialog (R-基团 + 应用), S-Group Properties incl. all 7 type-dropdown variants (数据/重复组/SRU 聚合物/共聚物/超原子/查询组件/核苷酸组件) and nested MUL "重复次数" + SRU "聚合物标签"/"重复模式" enum options, Atom Properties' struct-schema-sourced fields (原子类型/标签/电荷/同位素/自由基 with correctly-translated enum options, Roman-numeral valence correctly left untranslated), Bond Properties (类型 correctly left in English per the shared-with-tools.ts exclusion, 拓扑/反应中心 correctly translated), the atom right-click "查询属性" submenu (AtomMenuItems.tsx — required an unplanned fix, see note below), Enhanced Stereochemistry (增强立体化学, ABS left untouched, 创建新的 AND/OR 组), and the full Structure Library dialog (结构库, search placeholder, 3 tabs, 保存为 SDF, 点击以添加到画布, "未找到任何项目" empty state) — zero console warnings throughout. **Not exercised live** (verified via unit tests / code review only): Label Edit dialog (double-click opened Atom Properties instead of Label Edit in this build; the fix mirrors the already-verified rgroup.tsx/sgroup.tsx/enhancedStereo.tsx pattern exactly) and Abbreviation Lookup's popup (hover+keypress trigger didn't fire under browser automation; covered by `AbbreviationLookup.test.tsx`'s two updated assertions instead) and `template-attach.tsx`'s Save/Edit template flow.
  **Unplanned fix required:** `AtomMenuItems.tsx` (not in the original file inventory) builds its atom right-click "Query properties" submenu directly from `struct-schema.ts`'s `atom.properties[*].title`/`.enumNames` as a **module-level constant**, bypassing `Field`/`Label`'s automatic key resolution entirely. Converting those fields to `"namespace:key"` strings would have made this submenu render raw untranslated keys in *every* language, not just zh-CN. Fixed by moving the array into a `getAtomPropertiesForSubMenu(t)` function called via `useMemo` inside the component, resolving each title/enumName through `resolveTranslatableText`.
- [x] 6.13 **Commit** this section's changes as one commit on `4384-language`
- [ ] 6.14 **STOP — report commit hash + diff for review before starting Section 7**

## 7. Key-parity regression test + final pass

- [x] 7.1 Add a Jest test (extends `i18n.test.ts` or a new sibling) asserting the flattened key set of every `zh-CN/*.json` file exactly matches its `en/*.json` counterpart (no missing keys, no orphaned keys)
- [x] 7.2 Re-run the existing `i18n.test.ts` "resolves every referenced key" check against `zh-CN` as well as `en` (switch `i18n.language` mid-test, or assert directly against the `zh-CN` resource bundle)
- [ ] 7.3 **Code check:** typecheck, unit tests, circular-deps, build, prettier all green, including the new parity test
- [ ] 7.4 **Visual check:** final full walkthrough in 简体中文 across every area touched in Sections 2-6, in one pass, with console tracking for `[i18n] Missing key` warnings
- [ ] 7.5 **Commit** this section's changes as one commit on `4384-language`
- [ ] 7.6 **STOP — report commit hash + diff for final review**

## 8. Follow-up (tracked, not blocking this change)

- [ ] 8.1 Native Mandarin-speaker / professional localization review of all `zh-CN` content (see design.md's translation-quality disclaimer) — file as a follow-up task, not a blocker for merging this change's infrastructure
