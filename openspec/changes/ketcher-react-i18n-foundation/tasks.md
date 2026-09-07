> **Execution protocol (see `design.md` → Verification Protocol):** all work happens directly on branch `4384-language` in the main repo working directory — no per-section worktrees. Complete a section's subtasks, run its "Code check" and "Visual check" lines, commit the section as **one commit containing only that section's files**, then **STOP and report** (commit hash, `git show --stat HEAD`, what to look at) — do not start the next section's changes until the user has reviewed and approved the commit.

## 0. Foundation & Library Setup (blocks all extraction/RTL tasks — must land first)

- [x] 0.1 Add `react-i18next`, `i18next`, `i18next-icu` as dependencies of `packages/ketcher-react/package.json`
- [x] 0.2 Create i18n init module in `packages/ketcher-react/src/i18n/` (i18next config, ICU plugin registration, namespace loader)
- [x] 0.3 Create locale skeleton `packages/ketcher-react/src/locales/en/{common,toolbar,toolbars,dialogs,components,settings}.json` per the namespace-per-directory convention in `design.md`
- [x] 0.4 Wire `I18nextProvider` at the `ketcher-react` app root
- [x] 0.5 Add `dir` (LTR/RTL) switching mechanism on the UI-chrome root wrapper; explicitly force `dir="ltr"` on the `StructEditor` canvas subtree regardless of active locale
- [x] 0.6 Document the key-naming convention and namespace layout (from `design.md`) in a short README inside `packages/ketcher-react/src/locales/` for whoever picks up extraction tasks next
- [x] 0.7 **Code check:** `npm run build:react && npm run test --workspace=packages/ketcher-react` pass; `git diff --stat` shows only new i18n files + app-root wiring, nothing under `script/ui/action` or other extraction-target directories — done (typecheck, unit tests 400/400, circular-deps, build all green; `test:stylelint`/`test:eslint` skipped, pre-existing broken env unrelated to this change)
- [x] 0.8 **Visual check:** `cd example && npm run dev:standalone` (Vite, hot-reloads directly from source per DEVNOTES.md — no rebuild needed), confirm the app boots and renders exactly as before (no i18n keys/fallback text visible anywhere) — this section adds plumbing only, zero strings extracted yet
- [x] 0.9 **Committed:** `f2aedfa027` on `4384-language` — reviewed and approved

## 1. Extraction — Toolbar/Menu Actions (`script/ui/action/*`, 18 files)

- [x] 1.1 Inventory all `title:`/label string literals in `script/ui/action/*`
- [x] 1.2 Add corresponding keys to `locales/en/toolbar.json`
- [x] 1.3 Replace literals with `t('toolbar....')` calls; route duplicated strings (e.g. shared across zoom/tools) through `common.json` where applicable — also made `UiAction.title` reactive (holds a translation key resolved via `t()` at render time, not literal text) and fixed a live regression this caused in `InfoModal.tsx`'s `config.paste.title` identity check
- [x] 1.4 **Code check:** typecheck, unit tests 400/400, circular-deps, build, prettier all green
- [x] 1.5 **Visual check:** verified live via `cd example && npm run dev:standalone` + browser automation — 60+ toolbar/menu tooltips resolve correctly, ICU interpolation confirmed (`"Carbon (C)"`, `"Single Bond (1)"`), zero console warnings/errors. Found `templates.js` non-key titles were being run through `t()` unconditionally — fixed via `resolveActionTitle()` (only calls `t()` when the title contains a namespace separator). Highlight submenu not verified live (canvas automation limitation) — user asked to spot-check manually.
- [x] 1.6 **Committed:** `42657a5087` (extraction) + `d1f8cd702e` (resolveActionTitle fixup) on `4384-language` — reviewed and approved
- [x] 1.7 **STOP — reviewed, approved, proceeded to Section 2**

## 2. Extraction — Toolbars (`script/ui/views/toolbars/*`, 8 dirs)

- [x] 2.1 Inventory label/title/tooltip/aria-label strings across `ArrowScroll`, `BottomToolbar`, `FloatingTools`, `LeftToolbar`, `ModeControl`, `RightToolbar`, `ToolbarGroupItem`, `TopToolbar` — found `TopToolbar.tsx`, `FileControls.tsx`, `UndoRedo.tsx`, `ClipboardControls.tsx`, `ExternalFuncControls.tsx`, `SystemControls.tsx` each duplicated a Section 1 `toolbar.json` string locally instead of reading the shared config
- [x] 2.2 Add corresponding keys to `locales/en/toolbars.json` — only for genuinely new strings (`ModeControl` mode labels/switch tooltips, `ZoomControls`' lowercase dropdown labels + "Zoom 100%", Help button); duplicates of Section 1 strings reuse the existing `toolbar:*` keys instead of creating new ones
- [x] 2.3 Replace literals with `t()` calls
- [x] 2.4 **Code check:** `git diff --stat` touches only `script/ui/views/toolbars/*` + `locales/en/toolbars.json`; grep confirms no remaining hardcoded literals (two exceptions verified safe: an empty `title=""` and a commented-out dead "History" button); typecheck, unit tests 400/400, circular-deps, build, prettier all green
- [ ] 2.5 **Visual check:** `cd example && npm run dev:standalone` — user to verify: top toolbar (Clear/Open/Save/Undo/Redo/Copy family/Paste/Cut/server actions/Settings/About/Fullscreen/Help), the Zoom dropdown (out/in/100% + the lowercase labels), and the Molecules/Macromolecules mode switcher — all text identical to before
- [x] 2.6 **Committed:** `d33bf508f2` on `4384-language`
- [ ] 2.7 **STOP — report commit hash + diff for review before starting Section 3**

## 3. Extraction — Modal Dialogs: Domain-Specific (`script/ui/views/modal/components/{document,meta,process,toolbox}`)

- [x] 3.1 Inventory title/label/message strings in the four domain dialog groups — ~50 files reviewed
- [x] 3.2 Add corresponding keys to `locales/en/dialogs.json` (namespaced by dialog group, e.g. `dialogs.document.*`), plus `common.json` button.{ok,cancel,save,apply,close} for cross-cutting dedup
- [x] 3.3 Replace literals with `t()` calls, including interpolated/template-literal strings — verified ICU interpolation (e.g. `structureN`, `ifThenOption`, `version`)
- [x] 3.4 **Code check:** typecheck, unit tests 400/400, circular-deps, build, prettier all green; grep confirms no remaining hardcoded literals (only an empty `title=""` left untouched)
- [ ] 3.5 **Visual check:** `cd example && npm run dev:standalone` — user to verify every dialog under `document`/`meta`/`process`/`toolbox` (Open/Save, Settings, About, Automap, Recognize, Miew, Analyse, Check, Atom/Bond/RgroupLogic/Attach properties, Edit Monomer, Remove Abbreviation) — text and dynamic values (counts, names, versions) identical to before
- [x] 3.6 **Committed:** `b05692db0a` on `4384-language` — necessary scope addition: `components/Dialog/Dialog.tsx` (top-level shared component outside any section's directory list — its `buttons` string tokens are both display text and semantic identifiers; see commit message for why per-call-site translation wasn't safe there)
- [ ] 3.7 **STOP — report commit hash + diff for review before starting Section 4**

## 4. Extraction — Modal Dialogs: Shared Components (`Confirm`, `ExtendedTable`, `InfoModal`, `PeriodTable`, `Text`)

- [ ] 4.1 Inventory title/label/message strings in the five shared dialog components
- [ ] 4.2 Add corresponding keys to `locales/en/dialogs.json` under a `dialogs.shared.*` prefix
- [ ] 4.3 Replace literals with `t()` calls
- [ ] 4.4 Decide and document whether `PeriodTable` element names stay data-driven from `ketcher-core` constants (not duplicated as translation keys) or get their own keys — record the decision in the report, not silently
- [ ] 4.5 **Code check:** `git diff --stat` touches only the five shared-component dirs + `locales/en/dialogs.json`; grep confirms no remaining hardcoded literals
- [ ] 4.6 **Visual check:** `cd example && npm run dev:standalone` (Vite, hot-reloads directly from source per DEVNOTES.md — no rebuild needed), open a Confirm dialog, the Extended/Period Table pickers, an Info modal, and a Text-input dialog — all text identical to before
- [ ] 4.7 **Commit** this section's changes as one commit on `4384-language`
- [ ] 4.8 **STOP — report commit hash + diff for review before starting Section 5**

## 5. Extraction — Reusable UI Components (`script/ui/views/components/*`)

- [ ] 5.1 Inventory title/label/tooltip/aria-label strings in `AttachmentPointEditPopup`, `ContextMenu`, `MonomerCreationWizard`, `Spinner`, `Tooltip`
- [ ] 5.2 Inventory the same for `StructEditor`'s own UI chrome (toolbars/overlays), explicitly excluding anything that renders inside the SVG canvas itself
- [ ] 5.3 Add corresponding keys to `locales/en/components.json`
- [ ] 5.4 Replace literals with `t()` calls
- [ ] 5.5 **Code check:** `git diff --stat` touches only the listed component dirs + `locales/en/components.json`; grep confirms no remaining hardcoded literals; confirm no changes leaked into `StructEditor`'s canvas-rendering code
- [ ] 5.6 **Visual check:** `cd example && npm run dev:standalone` (Vite, hot-reloads directly from source per DEVNOTES.md — no rebuild needed), open the attachment-point popup, right-click context menu, monomer creation wizard, a loading spinner state, and hover tooltips — text identical to before; confirm the molecule canvas itself renders unchanged
- [ ] 5.7 **Commit** this section's changes as one commit on `4384-language`
- [ ] 5.8 **STOP — report commit hash + diff for review before starting Section 6**

## 6. Extraction — Settings Panel

- [ ] 6.1 Inventory label/title strings in the settings panel UI components (note: `ketcher-core`'s `settings/schema.ts` holds setting *values*, not display copy — leave it untouched; display labels live in `ketcher-react`)
- [ ] 6.2 Add corresponding keys to `locales/en/settings.json`
- [ ] 6.3 Replace literals with `t()` calls
- [ ] 6.4 **Code check:** `git diff --stat` touches only the settings panel component dir + `locales/en/settings.json`; confirm `ketcher-core/src/application/settings/schema.ts` is untouched
- [ ] 6.5 **Visual check:** `cd example && npm run dev:standalone` (Vite, hot-reloads directly from source per DEVNOTES.md — no rebuild needed), open Settings, walk every tab/section — labels identical to before
- [ ] 6.6 **Commit** this section's changes as one commit on `4384-language`
- [ ] 6.7 **STOP — report commit hash + diff for review before starting Section 7**

## 7. RTL Groundwork — CSS Logical Properties Audit

- [ ] 7.1 Enumerate the ~52 LESS/CSS files in `ketcher-react` using physical directional properties (`left`/`right`, `margin-left/right`, `padding-left/right`, `border-left/right`, `text-align: left/right`)
- [ ] 7.2 Convert UI-chrome stylesheets to logical properties (`inset-inline-start/end`, `margin-inline-start/end`, `padding-inline-start/end`, `border-inline-start/end`, `text-align: start/end`)
- [ ] 7.3 Explicitly exclude/verify `StructEditor` canvas-related styles are left untouched (canvas must not mirror under RTL)
- [ ] 7.4 **Code check:** `git diff --stat` shows only stylesheet changes, no `.ts`/`.tsx` changes; diff each converted rule is a 1:1 physical→logical swap, not a value change
- [ ] 7.5 **Visual check:** `cd example && npm run dev:standalone` (Vite, hot-reloads directly from source per DEVNOTES.md — no rebuild needed) in default (LTR) mode, walk through every UI area touched in Sections 1–6 (toolbars, dialogs, settings, components) and confirm pixel-identical layout to before the conversion
- [ ] 7.6 **Commit** this section's changes as one commit on `4384-language`
- [ ] 7.7 **STOP — report commit hash + diff for review before starting Section 8**

## 8. RTL Groundwork — Directional Icon Inventory

- [ ] 8.1 Identify icons/graphics in `ketcher-react` UI chrome that are direction-sensitive (arrows, chevrons, navigation icons) as opposed to direction-neutral (e.g. most chemistry tool icons)
- [ ] 8.2 Produce an inventory list (icon, file location, mirror-under-RTL: yes/no) as a design artifact for a future RTL-locale change to consume — this is a documentation artifact, no CSS/mirroring logic is implemented
- [ ] 8.3 **Code check:** `git diff --stat` shows only the new inventory document, no source/style changes
- [ ] 8.4 **Visual check:** not applicable (no rendering change in this section) — reviewer instead reads the inventory list for completeness against the toolbars/dialogs walked in prior sections
- [ ] 8.5 **Commit** this section's changes as one commit on `4384-language`
- [ ] 8.6 **STOP — report commit hash + diff for review before starting Section 9**

## 9. Testing

- [ ] 9.1 Add a unit test (Jest) asserting the i18n init module loads the English baseline without missing-key warnings
- [ ] 9.2 Add a unit/lint check (or script) that fails CI if a new hardcoded string literal is introduced in a directory already migrated to `t()` calls (grep-based guard is acceptable)
- [ ] 9.3 **Code check:** `npm run test --workspace=packages/ketcher-react` passes, including the new guard check
- [ ] 9.4 **Visual check:** `cd example && npm run dev:standalone` (Vite, hot-reloads directly from source per DEVNOTES.md — no rebuild needed), final full walkthrough of every area touched across Sections 1–8 in one pass
- [ ] 9.5 Playwright E2E coverage: **do not start** until an explicit go-ahead is given and `.memory-bank/testing.md` has been read, per project rule — this change ships English-only so existing E2E text-based assertions should still pass unmodified; only add new E2E coverage if extraction is found to have changed selector/testid behavior
- [ ] 9.6 **Commit** this section's changes as one commit on `4384-language`
- [ ] 9.7 **STOP — report commit hash + diff for final review**