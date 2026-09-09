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

- [ ] 2.1 Translate all `common.json` keys (13 strings: buttons, monomer types, shared errors) into `zh-CN`
- [ ] 2.2 Translate all `toolbar.json` keys (88 strings: toolbar/menu action titles) into `zh-CN`
- [ ] 2.3 Translate all `toolbars.json` keys (8 strings) into `zh-CN`
- [ ] 2.4 **Code check:** the new key-parity test (Section 6) doesn't exist yet — instead, run a manual key-diff (`en` vs `zh-CN` leaf keys) for these three files and confirm 1:1 coverage; typecheck/build/tests still pass
- [ ] 2.5 **Visual check:** switch to 简体中文 in Settings, confirm the top toolbar, zoom controls, and mode switcher render Chinese text with no English fallback and no layout breakage
- [ ] 2.6 **Commit** this section's changes as one commit on `4384-language`
- [ ] 2.7 **STOP — report commit hash + diff for review before starting Section 3**

## 3. Translate `dialogs.json`

- [ ] 3.1 Translate all `dialogs.json` keys (136 strings: document/meta/process/toolbox dialogs, Confirm/ExtendedTable/InfoModal/PeriodTable/Text) into `zh-CN`, preserving ICU interpolation placeholders (`{name}`, `{count}`, etc.) unchanged
- [ ] 3.2 **Code check:** manual key-diff confirms 1:1 coverage with `en`; typecheck/build/tests pass
- [ ] 3.3 **Visual check:** switch to 简体中文, open Save/Open, Settings' own dialog chrome, About, Automap, Recognize, Miew, Analyse, Check, Atom/Bond/RgroupLogic/Attach, Confirm, ExtendedTable, InfoModal, PeriodTable, Text — confirm rendering, no truncation/overflow from longer or shorter CJK strings
- [ ] 3.4 **Commit** this section's changes as one commit on `4384-language`
- [ ] 3.5 **STOP — report commit hash + diff for review before starting Section 4**

## 4. Translate `components.json`

- [ ] 4.1 Translate all `components.json` keys (100 strings: context menus, MonomerCreationWizard, StructEditor chrome) into `zh-CN`, preserving ICU placeholders
- [ ] 4.2 **Code check:** manual key-diff confirms 1:1 coverage with `en`; typecheck/build/tests pass
- [ ] 4.3 **Visual check:** switch to 简体中文, walk atom/bond/selection context menus and the full MonomerCreationWizard (incl. RNA preset tabs) — confirm rendering
- [ ] 4.4 **Commit** this section's changes as one commit on `4384-language`
- [ ] 4.5 **STOP — report commit hash + diff for review before starting Section 5**

## 5. Translate `settings.json`

- [ ] 5.1 Translate all `settings.json` keys (72 strings: Settings-panel field titles/enum labels) into `zh-CN`
- [ ] 5.2 **Code check:** manual key-diff confirms 1:1 coverage with `en`; typecheck/build/tests pass
- [ ] 5.3 **Visual check:** switch to 简体中文, walk all 7 Settings tabs — confirm every field title and dropdown option renders in Chinese
- [ ] 5.4 **Commit** this section's changes as one commit on `4384-language`
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
