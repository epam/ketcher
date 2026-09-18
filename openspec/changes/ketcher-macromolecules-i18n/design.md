## Context

`ketcher-macromolecules` (the polymer/monomer editor UI, as distinct from `ketcher-react`'s small-molecule editor) has zero translation-key coverage today: every user-facing string is hardcoded English, across:

- `components/modal/*` — RNA Builder, monomer/preset creation wizard, macromolecule properties dialogs (~135 candidate strings)
- `components/monomerLibrary/*` — search, favorites, group headers, filters (~149 candidate strings)
- `components/contextMenu/*` — monomer/bond/sequence context menus (~144 candidate strings)
- `components/shared/*` — shared building blocks reused across the above (~148 candidate strings, includes false positives from non-UI code — needs a manual pass, not a blind grep count)
- `components/menu`, `TopMenuComponent`, `LeftMenuComponent` — top-level chrome (~42 combined)
- `components/macromoleculeProperties`, `components/preview` — properties panel + hover tooltips (~33 combined)
- `components/FloatingTools`, `ZoomControls`, `Layout`, `LayoutModeButton`, `ButtonsComponents`, `SequenceTypeGroupButton`, `SequenceSyncEditModeButton`, `Ruler`, `FullscreenButton` — toolbar/controls chrome (~36 combined)
- `hooks`, `helpers` — snackbar/toast/validation message text generated outside component render (~29 combined)

(Counts are rough `grep`-based candidate scans of quoted string literals per directory, not a verified extraction inventory — each section's own inventory step will produce the real list, same as the `ketcher-react` precedent.)

The open question left by `ketcher-react-i18n-foundation`'s design.md was: *"Whether `ketcher-macromolecules` follow-up reuses the same `react-i18next` instance/namespace registry or stands up its own."* This proposal answers it: **reuse**. `packages/ketcher-react/src/Editor.tsx` renders the lazily-imported `MacromoleculesEditorComponent` **inside** the existing `<I18nextProvider i18n={i18n}>`, so `useTranslation()` called from any `ketcher-macromolecules` component already resolves against that shared instance today — the only missing piece is namespace content and the `t()`/`resolveTranslatableText` call sites. `.memory-bank/modules/i18n.md`'s current claim that macromolecules "is not wired into this i18n setup" describes the absence of content, not a technical barrier, and is stale.

`ketcher-macromolecules` uses Emotion (`@emotion/react`, `@emotion/styled`) and MUI `sx` props for styling, not the `.less` files `ketcher-react`'s RTL groundwork audited — the logical-properties conversion in this change targets Emotion template literals and `sx` objects instead.

## Goals / Non-Goals

**Goals:**

- Give `ketcher-macromolecules` its own translation-key namespace(s), loaded into the existing shared `i18next` instance.
- Extract hardcoded strings across the directories listed above into that key system.
- Author both `en` and `zh-CN` content in this same change (no separate "foundation" vs. "locale" split is needed here, since the foundation — the provider, the switcher, persistence, `dir` reactivity — already exists and is shared).
- Audit Emotion/`sx` styling for physical directional properties, excluding anything tied to canvas/sequence-rendering geometry.
- Extend the existing `i18n.test.ts` key-existence scan and its no-hardcoded-strings guard, and the `en`/`zh-CN` parity check, to cover the new namespaces and source tree.
- Provide a build-time flag that strips all non-English locale content (across both `ketcher-react`'s and `ketcher-macromolecules`'s namespaces) from the production bundle and hides the language switcher — a customer requirement to support shipping an English-only build with no translation payload.

**Non-Goals:**

- A second language switcher, a second persisted-language key, or a second `dir`-reactivity mechanism — the existing ones in `ketcher-react` already cover the shared tree this package renders into.
- Re-litigating the choice of `react-i18next`/`i18next-icu` — already decided and in place.
- `ketcher-core`, `ketcher-standalone` — unchanged, no meaningful UI surface (same finding as the foundation change).
- Any language beyond English + `zh-CN` — matches the two languages already shipped for `ketcher-react`.
- Full RTL visual QA / Playwright E2E coverage — deferred, same rationale as the foundation change (and per project rule, e2e authoring requires an explicit go-ahead plus a read of `.memory-bank/testing.md` first).
- Translating the sequence/monomer canvas rendering itself (letters, HELM/FASTA notation, monomer symbols) — chemistry/domain data, never translated, same rule as `struct-schema.ts` bond names in `ketcher-react`.

## Decisions

### Decision 1 — Reuse the existing shared `i18next` instance; do not stand up a second one

**Rationale:** `ketcher-macromolecules` is rendered inside `ketcher-react`'s `<I18nextProvider>` at runtime (verified in `Editor.tsx`). Standing up a second instance would fragment the language switcher, persistence, and `dir` state across two systems for what is, from the end user's perspective, one editor with two modes (Micro/Macro). Reuse means this package needs zero new i18next configuration — only resource bundles and call sites.

**Alternatives considered:** A fully independent i18next instance scoped to `ketcher-macromolecules` — rejected: would require its own language switcher UI (confusing next to the existing Settings-panel one), its own persistence key, and manual synchronization on every mode switch to avoid the two editors showing different languages simultaneously.

### Decision 2 — Two new namespaces: `macromolecules` and `macromoleculesDialogs`

**Rationale:** `ketcher-react` used six namespaces for a much larger surface (~370 strings); `ketcher-macromolecules`'s surface is smaller but still large enough (~600 rough candidates before inventory) that a single namespace file would be unwieldy for parallel section work. Split by usage pattern, not by directory 1:1, because several small directories (`menu`, `TopMenuComponent`, `LeftMenuComponent`, toolbars/controls) share the same "always-visible chrome" character as each other, while `modal`, `monomerLibrary`, and `contextMenu` share "opened on demand, dialog-shaped" character — mirroring how `ketcher-react` grouped `dialogs.json` separately from `toolbar.json`/`toolbars.json`.

- `macromolecules`: chrome that's part of the always-visible editor surface — top/left menu, toolbars, zoom, layout mode, fullscreen, ruler, macromolecule properties panel, preview tooltips.
- `macromoleculesDialogs`: modal dialogs, the monomer library panel, and context menus.

Cross-cutting duplicated strings (Cancel/OK/Apply/Close, generic confirmation copy) resolve through the existing `common` namespace instead of being redefined — same dedup rule as the foundation change's Decision 2.

**Alternatives considered:** One `macromolecules` namespace for everything — rejected as too large for reviewable per-section diffs once the real inventory is done, mirroring why `ketcher-react` didn't use one giant `ui.json`. A namespace per component directory (13+ namespaces) — rejected as excessive for this package's actual scale relative to `ketcher-react`'s six.

### Decision 3 — Declare `react-i18next` as an explicit dependency

**Rationale:** `ketcher-macromolecules/package.json` does not list `react-i18next` today; it is only reachable because npm workspaces hoist `ketcher-react`'s copy into the shared root `node_modules`. Importing from an undeclared dependency is fragile (breaks if hoisting behavior changes, or if `ketcher-react`'s dependency is ever removed/bumped independently). This change adds it explicitly to `packages/ketcher-macromolecules/package.json`, pinned to the same version range `ketcher-react` uses.

### Decision 4 — Author `en` and `zh-CN` content together, not as two changes

**Rationale:** The `ketcher-react` precedent split foundation (English-only) from locale content (Chinese) because the foundation itself was a large, independently-reviewable body of work (library setup, provider wiring, RTL groundwork). Here, the "foundation" is a two-line namespace registration reusing infrastructure that already exists — there's no equivalent large foundation step to isolate. Splitting into two changes here would mean re-touching every extracted file's call sites twice for no review benefit.

### Decision 5 — RTL groundwork targets Emotion `css`/`styled` templates and MUI `sx` props, not `.less` files

**Rationale:** `ketcher-macromolecules` has no `.less` files — its styling lives in `styledComponents.ts`, per-component Emotion `css`/`styled` template literals, `theming/*`, and inline MUI `sx` props. The property-for-property logical-property conversion (`left`→`inset-inline-start` etc.) is the same substitution as the foundation change's CSS audit, just applied to a different syntax surface. Canvas/sequence-rendering geometry (monomer/bond SVG positions, sequence-letter layout) is excluded, same rule as `StructEditor` in the foundation change.

### Decision 6 — Single-language build flag: compile-time constant via `@rollup/plugin-replace`, boolean, default off

**Format:** `KETCHER_SINGLE_LANGUAGE_BUILD` (boolean-like string, `'true'`/unset), injected the same way both packages' `rollup.config.mjs` already inject `process.env.NODE_ENV`/`process.env.BUILD_NUMBER` via `@rollup/plugin-replace`'s `values` map. Default is unset/off (multi-language, current behavior); set at build invocation time, e.g. `KETCHER_SINGLE_LANGUAGE_BUILD=true npm run build`.

`packages/ketcher-react/src/i18n/i18n.ts` restructures resource assembly so the non-`en` imports and their inclusion in `resources`/`SUPPORTED_LANGUAGES` sit behind `if (process.env.KETCHER_SINGLE_LANGUAGE_BUILD !== 'true') { ... }`. Because `replace()` substitutes the literal string at build time (before Rollup's own tree-shaking and Terser's dead-code elimination run), the `true`-flag build folds that branch to unreachable code, and the now-unreferenced `zh-CN`/macromolecules-non-English JSON imports become tree-shakeable as ordinary unused ES module bindings (JSON imports are side-effect-free, so this is a standard, well-supported tree-shaking case — the same pattern locale-heavy libraries like `dayjs`/`date-fns` use for their own per-locale imports). The Settings language switcher reads `SUPPORTED_LANGUAGES.length`; when it collapses to 1 (English only), the switcher SHALL be hidden rather than rendered as a single-option no-op control.

**Rationale:** Reuses an existing, already-proven mechanism in this codebase (`NODE_ENV`/`BUILD_NUMBER` replacement) rather than introducing a new build-config system (e.g. a separate Rollup entry point, a postbuild strip script, or a runtime-only toggle that ships the payload anyway). A compile-time flag is the only approach that actually removes bytes from the shipped bundle, which is what "case out all languages" means for a customer requirement — a runtime-only hide-the-switcher approach would leave the translation JSON in the bundle, technically reachable, and would not satisfy a requirement clearly motivated by bundle-size/footprint or licensing/content concerns.

**Alternatives considered:**
- A runtime `i18n.changeLanguage`-only restriction (keep all resources bundled, just prevent switching away from English) — rejected: does not reduce bundle size, which is the actual point of "case out" per the requirement's phrasing.
- A separate build target/entry point (`build:english-only`) duplicating the Rollup config — rejected: doubles build-maintenance surface for what is a single boolean toggle; the flag approach keeps one config path.
- Dynamic `import()`-based lazy-loading of each non-English locale (load `zh-CN` only if selected) — a reasonable *complementary* future optimization for the multi-language build's initial bundle size, but does not by itself satisfy "produce a build with zero non-English content," since the code path and chunk would still exist in the output; noted as a possible follow-up, not adopted here.

## Risks / Trade-offs

- **[Risk] `components/shared`'s ~148 candidate-string count is inflated by non-UI code (test IDs, CSS values, internal constants)** → Mitigation: that section's inventory step does a manual read of every match before deciding what's real UI text, same discipline the foundation change used (it explicitly called out zero-findings directories like `Spinner`/`Tooltip`).
- **[Risk] Adding `macromolecules`/`macromoleculesDialogs` resource bundles to the shared instance at the wrong load point could race with `ketcher-react`'s own six namespaces already being loaded** → Mitigation: register via the same `i18next` resource-bundle API used for the existing namespaces, in `packages/ketcher-react/src/i18n/i18n.ts`, verified by the extended `i18n.test.ts` key-scan actually resolving macromolecules keys through the real instance (not a mock).
- **[Risk] Two packages now both write into `packages/ketcher-react/src/i18n/i18n.ts`, a shared file** → Mitigation: this change touches that file only in Section 0 (namespace registration) as a single, reviewable diff; no other section needs to touch it again.
- **[Risk] Translation-key regex (`^(?:common|toolbar|toolbars|dialogs|components|settings):[A-Za-z0-9_.-]+$`) in `resolveTranslatableText` does not include the two new namespaces** → Mitigation: this regex must be extended to include `macromolecules`/`macromoleculesDialogs` in Section 0, otherwise every converted key in this package would be misdetected as literal text and rendered raw.
- **[Risk] Emotion/`sx` logical-property conversion accidentally changes LTR layout** → Mitigation: same as the foundation change — property-for-property substitution is visually identical in LTR by definition; each converted file gets a quick visual diff.
- **[Risk] Tree-shaking of the non-English imports under `KETCHER_SINGLE_LANGUAGE_BUILD=true` doesn't actually happen** (e.g. Rollup's tree-shaking doesn't reach across the `replace()`-folded branch the way expected, or a JSON import has an unexpected side effect that blocks elimination) → Mitigation: verification is not "code review looks right" — it SHALL include an actual bundle-output check (e.g. `grep` the built output for a `zh-CN`-only string, or a bundle-size diff between flagged and unflagged builds) proving the non-English payload is absent, not just unreachable.
- **[Risk] Hiding the language switcher when `SUPPORTED_LANGUAGES.length === 1` silently breaks if a future change adds a third language and someone forgets this condition exists** → Mitigation: the condition is `length === 1`, not a hardcoded check for exactly `['en']`, so it generalizes correctly regardless of how many languages the multi-language build ships; documented in the locale README from Section 0.

## Migration Plan

1. Land Section 0 (namespace registration in the shared instance, `resolveTranslatableText` regex extension, `react-i18next` explicit dependency, locale-file skeleton) — must merge before any extraction section starts.
2. Run directory/area-scoped extraction sections in the order listed in `tasks.md` (chrome areas first, then the three larger dialog/library/context-menu areas, then shared components last since they're consumed by all the others and benefit from call sites already existing to verify against).
3. Author `zh-CN` content for each namespace alongside its `en` extraction in the same section (not as a trailing pass), since both languages are in scope from the start this time.
4. Run the Emotion/`sx` logical-properties audit after extraction sections complete (independent of key content, like the foundation change's CSS audit).
5. Extend and re-run the i18n regression tests last, once all namespaces have final content.
6. No rollback complexity — additive change; hardcoded strings are replaced with keys resolving to the same English text (plus new `zh-CN` content gated behind the existing language switcher), so English-mode behavior is unchanged throughout.

## Verification Protocol

Same discipline as `ketcher-react-i18n-foundation`, all work on branch `4384-language`, no per-section worktrees:

**Code layer:**

- Each section in `tasks.md` SHALL be committed as its own commit containing only that section's files. Do not mix sections into one commit, and do not start a section's changes until the prior section's commit has been made and approved.
- On completion of a section, stop and report: the commit hash, `git show --stat HEAD`, and a summary. Do NOT start the next section until the user has reviewed and explicitly approved the commit.
- Reviewer checks: no leftover hardcoded strings in the touched directory, correct namespace/key naming per Decision 2, `en`/`zh-CN` key parity for every key added in that section, no unrelated files touched.

**Visual layer:**

- Manual verification via `cd example && npm run dev:standalone` (Vite dev server, hot-reloads from source per `DEVNOTES.md`), switching to Macromolecules mode and, where relevant, toggling the language switcher in Settings to confirm both `en` and `zh-CN` render correctly for the section's area.
- Each section in `tasks.md` states exactly which screen/menu/dialog to open. Any visible diff (English mode) or untranslated/raw-key text (Chinese mode) is a regression to fix before the section is reported ready for review.
- No automated screenshot diffing is set up for this change.

## Open Questions

- None outstanding — the one open question left by the foundation change (shared vs. separate i18next instance) is resolved by Decision 1.