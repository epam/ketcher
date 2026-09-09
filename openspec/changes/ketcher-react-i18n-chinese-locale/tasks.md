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

## 6. Key-parity regression test + final pass

- [ ] 6.1 Add a Jest test (extends `i18n.test.ts` or a new sibling) asserting the flattened key set of every `zh-CN/*.json` file exactly matches its `en/*.json` counterpart (no missing keys, no orphaned keys)
- [ ] 6.2 Re-run the existing `i18n.test.ts` "resolves every referenced key" check against `zh-CN` as well as `en` (switch `i18n.language` mid-test, or assert directly against the `zh-CN` resource bundle)
- [ ] 6.3 **Code check:** typecheck, unit tests, circular-deps, build, prettier all green, including the new parity test
- [ ] 6.4 **Visual check:** final full walkthrough in 简体中文 across every area touched in Sections 2-5, in one pass, with console tracking for `[i18n] Missing key` warnings
- [ ] 6.5 **Commit** this section's changes as one commit on `4384-language`
- [ ] 6.6 **STOP — report commit hash + diff for final review**

## 7. Follow-up (tracked, not blocking this change)

- [ ] 7.1 Native Mandarin-speaker / professional localization review of all `zh-CN` content (see design.md's translation-quality disclaimer) — file as a follow-up task, not a blocker for merging this change's infrastructure
