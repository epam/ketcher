## Context

`ketcher-react` (the small-molecule editor UI, as distinct from `ketcher-macromolecules`) has zero i18n infrastructure: no library, no locale files, no translation-key abstraction. UI text is hardcoded across:

- `script/ui/action/*` (18 files) — toolbar/menu action `title:` definitions
- `script/ui/views/toolbars/*` (8 dirs: ArrowScroll, BottomToolbar, FloatingTools, LeftToolbar, ModeControl, RightToolbar, ToolbarGroupItem, TopToolbar)
- `script/ui/views/modal/components/*` — domain dialogs (`document`, `meta`, `process`, `toolbox`) and shared dialog components (`Confirm`, `ExtendedTable`, `InfoModal`, `PeriodTable`, `Text`)
- `script/ui/views/components/*` — reusable UI (`AttachmentPointEditPopup`, `ContextMenu`, `MonomerCreationWizard`, `Spinner`, `StructEditor`, `Tooltip`)
- Settings panel components
- ~52 LESS/CSS files carry physical directional properties (`left`/`right`, `margin-left`/`right`, etc.) that would need conversion before any RTL locale could render correctly.

The only existing string-abstraction precedent in the whole repo is a 2-function `errorMessages.ts` in `ketcher-core` (out of scope here) — there is nothing to build on inside `ketcher-react`.

Prior scoping estimated ~370 hardcoded string instances in `ketcher-react`, with meaningful duplication (Cancel/OK/Apply/monomer labels) that a shared namespace can collapse.

## Goals / Non-Goals

**Goals:**

- Stand up `react-i18next` + `i18next-icu` in `ketcher-react` with an English baseline locale.
- Establish one translation-key naming convention and locale file layout that all extraction subagents follow, to avoid key collisions when work is split across many parallel tasks/chats.
- Extract hardcoded strings across the directories listed above into that key system.
- Add a `dir` (LTR/RTL) switching mechanism, scoped to UI chrome, so a future RTL locale does not require re-plumbing.
- Convert physical CSS directional properties to logical properties in UI-chrome stylesheets; inventory icons needing mirroring.

**Non-Goals:**

- Authoring any non-English locale content (Chinese, Arabic, etc.) — this change ships English-only, wired for future locales.
- `ketcher-core`, `ketcher-standalone` — no meaningful UI surface; verified only one non-boilerplate string exists (`ketcher-core` settings schema `title: 'Settings'`).
- `ketcher-macromolecules` — deferred to a follow-up change; not touched here.
- Errors emitted by the compiled Indigo/WASM backend (`ketcher-standalone`) — vendored/compiled output, not authored TS/React source.
- Mirroring or altering the structure-rendering canvas (`StructEditor`'s molecule/reaction SVG rendering) under RTL — chemical structures must always render left-to-right regardless of UI chrome direction.
- Full RTL visual QA / Playwright E2E coverage per locale — deferred until an actual RTL locale exists; per project rule, e2e Playwright test authoring requires an explicit go-ahead and a read of `.memory-bank/testing.md` first.

## Decisions

### Decision 1 — Library: `react-i18next` + `i18next-icu`

**Rationale:** Standard, well-maintained choice for React; `i18next-icu` handles pluralization/interpolation (needed for the ~160 template-literal strings identified in scoping, e.g. counts like "Edit All \[code\] (n)") via ICU MessageFormat instead of ad-hoc string concatenation. Supports `dir` switching alongside locale switching out of the box.

**Alternatives considered:** `react-intl`/`formatjs` — heavier API surface for this codebase's needs; rejected in favor of the more common React pattern already familiar to the team.

### Decision 2 — Key naming convention: domain-scoped, dot-separated, mirrors directory grouping

Format: `<domain>.<subarea>.<element>`, e.g. `toolbar.zoom.in`, `dialog.periodicTable.title`, `wizard.monomerCreation.attachmentPoint.label`. A dedicated `common.json` namespace holds cross-cutting duplicated strings (`common.cancel`, `common.ok`, `common.apply`, monomer-type labels like `common.monomerType.sugar`).

**Rationale:** Since extraction is split across many directory-scoped subagent tasks (see Task grouping below) potentially run in separate chat sessions, a fixed, predictable convention decided upfront is required to avoid key collisions or duplicate near-identical keys being introduced independently by different tasks.

### Decision 3 — Locale file location and structure

`packages/ketcher-react/src/locales/en/<namespace>.json`, one namespace file per top-level directory group (e.g. `toolbar.json`, `toolbars.json`, `dialogs.json`, `components.json`, `settings.json`, `common.json`). Namespaces are loaded via `i18next` resource bundles at app init.

**Rationale:** Namespace-per-directory keeps each extraction task's diff self-contained to one JSON file plus the source files in its assigned directory, minimizing merge conflicts across parallel subagent work.

### Decision 4 — `dir` switching scoped to UI chrome, never the canvas

The `dir` attribute is set on a wrapper element around the toolbar/menu/dialog chrome, not on `<html>`/`<body>` and not on the `StructEditor` canvas container. The canvas subtree explicitly forces `dir="ltr"` regardless of the active UI locale.

**Rationale:** Molecule/reaction SVG rendering must never be visually mirrored by CSS direction — atom/bond geometry is chemically meaningful and must render identically regardless of UI language. This is the same reasoning already applied to numeric monomer-enumeration labels in `ketcher-core`'s renderer (existing `direction: rtl` usage there is a numeric-alignment trick, unrelated to page-level RTL, and is left untouched).

### Decision 5 — Task grouping for extraction: by directory, not by UI category

Extraction tasks are split by source directory (`script/ui/action`, `script/ui/views/toolbars`, `script/ui/views/modal/components/{document,meta,process,toolbox}`, `script/ui/views/modal/components/{Confirm,ExtendedTable,InfoModal,PeriodTable,Text}`, `script/ui/views/components/*`, settings panel), each sized for one subagent run in a separate chat session, per the chosen execution model.

**Rationale:** Directory-scoped tasks map 1:1 to a bounded, reviewable diff and a single (or few) locale namespace file(s), avoiding cross-task file contention.

## Risks / Trade-offs

- **[Risk] Naive `dir="rtl"` applied at too high a DOM level would mirror the chemical structure canvas** → Mitigation: Decision 4 forces `dir="ltr"` explicitly on the canvas subtree; add a lint/test guard if feasible during implementation.
- **[Risk] Parallel subagents in separate chats introduce duplicate or colliding translation keys** → Mitigation: fixed naming convention (Decision 2) and namespace-per-directory file split (Decision 3) decided in this design doc before any extraction task starts.
- **[Risk] ~160 template-literal/interpolated strings need ICU reformatting; a naive extraction could drop a dynamic value** → Mitigation: `i18next-icu` handles this natively; each extraction task must verify interpolated values render correctly against the English baseline (visual smoke check, not full E2E).
- **[Risk] CSS logical-property conversion accidentally changes LTR layout** → Mitigation: conversion pass is 1:1 property-for-property (`left`→`inset-inline-start` etc.), which is visually identical in LTR by definition; still worth a quick visual diff per converted file.

## Migration Plan

1. Land Foundation tasks (library install, i18n init module, provider wiring, locale/namespace skeleton, `dir`-switching mechanism) — this must merge before any extraction task starts, since extraction tasks depend on the `t()` API and namespace files existing.
2. Run directory-scoped extraction tasks (can proceed in parallel once Foundation is merged).
3. Run the CSS logical-properties audit and directional-icon inventory in parallel with extraction (independent of it).
4. No rollback complexity — additive change; hardcoded strings are replaced with keys resolving to the same English text, so behavior is unchanged until a second locale is introduced.

## Verification Protocol

All work happens directly on the single branch `4384-language` in the main repo working directory (no per-section worktrees — this was tried and reverted: worktrees required their own `node_modules`/build artifacts per section and made review harder to locate, since the user's editor stays pointed at the main repo directory). Every section in `tasks.md` follows the same two-layer checkpoint before the next section may start:

**Code layer:**

- Each section (0 through 8) SHALL be committed as its own commit on `4384-language`, containing only the files that section's tasks describe. Do not mix two sections into one commit, and do not start a section's changes until the prior section's commit has been made and approved.
- On completion of a section, stop and report: the commit hash, `git show --stat HEAD`, and a summary of changes. Do NOT start the next section's changes until the user has reviewed and explicitly approved the commit.
- The reviewer (user, or `/code-review` run against the commit) checks: no leftover hardcoded strings in the touched directory, correct namespace/key naming per Decision 2/3, no unrelated files touched.

**Visual layer:**

- Visual verification is manual: the user runs the app themselves against the current state of `4384-language` and opens the specific UI area the section touched. Use `cd example && npm run dev:standalone` (or `dev:remote`) — a Vite dev server that aliases `ketcher-react`/`ketcher-core` straight to `packages/*/src` (see `example/vite.config.js`) and hot-reloads on save, per `DEVNOTES.md`'s documented "Development" flow. Do **not** use `npm run up` for this — that script does a full clean + `npm install` + production build + a Docker-based `ketcher-autotests` build + static serve; it is a full CI-parity rebuild, not a dev loop, and does not hot-reload.
- Each section in `tasks.md` states exactly which screen/menu/dialog to open for the check (see the "Visual check" line added to each section below), since the expected outcome is "text looks identical to before extraction" — any visible diff is a regression.
- No automated screenshot diffing is set up for this change; if a section's visual check reveals a regression, fix it and amend/add a follow-up commit before the section is reported as ready for review again.

## Open Questions

- Exact list of directional icons requiring mirroring under RTL — to be produced as an inventory artifact during the RTL groundwork task, not enumerated here.
- Whether `ketcher-macromolecules` follow-up reuses the same `react-i18next` instance/namespace registry or stands up its own — deferred to that change's own design.