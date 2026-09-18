## Decisions

### Decision 1: Locale code — `zh-CN` (Simplified)

Mandarin is spoken across both Simplified (`zh-CN`/`zh-Hans`, mainland China, Singapore) and Traditional (`zh-TW`/`zh-Hant`, Taiwan, Hong Kong, Macao) script variants — these differ in written characters, not spoken dialect, so "Mandarin" alone doesn't pick one. Decided (user confirmed): Simplified, `zh-CN`, as it covers the largest user base and is the more common default for software localization. Traditional (`zh-TW`) is a natural, low-cost follow-up once this lands (same key structure, different translation file), but is out of scope here.

### Decision 2: Language switcher lives in Settings, outside the settings-schema/Apply-Cancel flow

The Settings dialog's existing fields are all backed by `options-schema.ts` and go through `ketcher-core`'s `SettingsService` on Apply (`saveSettings` → `settingsService.updateSettings`). Two ways to add a Language field:

1. **As a schema field** — consistent with every other Settings row, but `SettingsService`/`normalizeSettingsForCore` doesn't know about "language" as a concept (it's a `ketcher-core` molecule-rendering settings service, not an app-chrome preference store) and validates/normalizes toward its own schema. Making it accept and round-trip an unknown field would mean touching `ketcher-core`, which both this change and the foundation change explicitly keep out of scope.
2. **Independent field, same dialog, immediate effect** — visually sits in the General tab like any other row, but its `onChange` calls `i18n.changeLanguage()` + a dedicated `localStorage` write directly, bypassing `formState`/Apply/Cancel entirely.

Chose (2). Consequence: unlike every other Settings field, the Language selector takes effect immediately and is **not** reverted by clicking Settings' "Cancel" — this is a deliberate, visible difference (matches how most applications treat a language preference: an immediate, standalone action, not something you'd want undone in the middle of adjusting rendering settings).

### Decision 3: Persistence — dedicated `localStorage` key, not the settings-service path

Given Decision 2, the chosen language is written to and read from a single `localStorage` key (`ketcher-language`) owned by `packages/ketcher-react/src/i18n/i18n.ts`, independent of `SettingsService`. On init, `i18n.ts` reads this key (falling back to `en` if absent/invalid) to pick the initial `lng`.

### Decision 4: Make `dir` reactive to a live language change

`Editor.tsx` currently reads `i18n.dir()` once per render but never re-renders on a language change, because it doesn't call `useTranslation()` — only components using that hook resubscribe to react-i18next's `languageChanged` event. `zh-CN` is LTR, so this gap is invisible today, but it sits on the exact mechanism the RTL groundwork (`ketcher-react-i18n-foundation`, Sections 7-8) depends on — leaving it non-reactive would mean the first real RTL locale silently requires a full page reload to lay out correctly after a live switch. Fixed now, while the cause is fresh, by calling `useTranslation()` in `Editor.tsx` (no translated text needed there — the hook's re-render subscription is the only thing used).

## Verification Protocol

Same as the foundation change: work happens directly on branch `4384-language`, one commit per section, Code check (typecheck, unit tests, circular-deps, build, prettier) done by Claude, Visual check done live via `cd example && npm run dev:standalone` — for this change, "visual check" specifically means switching the running app to `zh-CN` via the new Settings control and confirming every namespace's strings render (no fallback-to-English gaps, no raw keys, no layout breakage from longer/shorter CJK text) before moving to the next section.

## Translation quality disclaimer

Every `zh-CN` string in this change is machine-translated by Claude, not sourced from a professional localization vendor or verified by a native Mandarin speaker. It is expected to be directionally correct and usable for review, not final. `tasks.md` tracks a follow-up native-speaker review as a required step before this locale is considered production-ready — this change's own "done" means "structurally complete and functionally wired," not "translation-signed-off."
