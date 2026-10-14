# UI-kit initiative: roadmap

Tracking: umbrella issue #12192.

This file is the long-lived plan for the whole initiative. The change it sits in (`ui-kit-foundation`) delivers sub-projects **#0** and **#1**. Every later sub-project becomes its own OpenSpec change when work on it starts, and its `proposal.md` links back here. When `ui-kit-foundation` is archived, the lasting decisions move into the memory bank as an ADR (`adr/<date>-ui-kit-and-styling-architecture.md`), `modules/ui-kit.md` and `features/theming.md`. This roadmap is then archived with the change.

## Goals of the initiative

1. One styling approach: plain CSS Modules plus `--ketcher-*` tokens. This replaces LESS + CSS Modules in `ketcher-react` and Emotion in `ketcher-macromolecules`.
2. A kit of stylised building blocks on a headless library (Base UI), with only our own styles applied and no overriding of third-party styles.
3. Step-by-step, component-by-component migration in which every step is verifiable at zero pixel diff.
4. At the end, MUI, Emotion and LESS are all removed.

Decisions and trade-offs: see `design.md` Decisions 1–15.

## Sub-projects

| #     | Sub-project                                                | Depends on          | Visual change | Issue  |
| ----- | ---------------------------------------------------------- | ------------------- | ------------- | ------ |
| 0     | Foundation (this change)                                   | —                   | none          | #12193 |
| 1     | Kit scaffold + `Icon` move + Tooltip pilot (this change)   | 0                   | none          | #12193 |
| 2     | Primitive migrations, one component per PR                 | 1                   | none (parity) | #12194 |
| 3     | Emotion → CSS Modules sweep of feature styles              | 1 (parallel with 2) | none (parity) | #12195 |
| 4     | Form system rework                                         | 2's form primitives | none (parity) | #12196 |
| 5     | Cleanup: drop MUI, Emotion and LESS; decide on `@layer`    | 2, 3, 4             | none          | #12197 |
| later | Visual refresh + Figma alignment; dark mode; accessibility | 5 (or after 3)      | intentional   | —      |

### #0 Foundation, in this change

The browser floor (#11997), shared PostCSS config, tokens, the LESS and Emotion bridges, removal of `theme.less`, and some hygiene. See `design.md`.

### #1 Kit scaffold + pilot, in this change

The `ui-kit/` folder, `KitProvider`, lint boundaries, Storybook, story screenshots, CI, metrics, the `Icon` move, and the Tooltip pilot. See `design.md`.

### #2 Primitive migrations

- **Scope:** replace every MUI-based or duplicated generic component with a kit component, one component (or one tight family) per PR, migrating call sites in **both** packages.
- **Order.** The rule is high-reuse and low-interaction first; portal-heavy, form-coupled and modal last.
  1. Button / IconButton / ActionButton (MUI `Button`, `ButtonBase`, `ButtonGroup`) / ToggleButton.
  2. Switch, Checkbox, Radio. These are used inside the legacy polymorphic `Input` without restructuring the form. Note: radio styling changed recently (#12114).
  3. Accordion / Collapse. These carry 8 `.Mui` rules in `Accordion.module.less`, plus macromolecules' RnaElementsView.
  4. Tabs: `RnaPresetTabs` and macromolecules' `shared/Tabs`, which are heavy `.Mui*` override sites.
  5. Popover + ClickAwayListener: ColorPicker (custom widget on the kit Popover), `errorPopover`, macromolecules properties.
  6. Select / Dropdown: react's `form/Select` (12 `.Mui` rules) and macromolecules' `shared/dropDown`. Verify Safari zoom issue #1521.
  7. Combobox, which replaces MUI `Autocomplete` in `combobox.tsx` and `AbbreviationLookup`.
  8. Menu / MenuList / MenuItem. Optionally evaluate replacing `react-contexify` context menus with Base UI's context menu.
  9. The remaining smaller pieces: Slider, Snackbar/Toast, Divider and others.
  10. Dialog / Modal: react's `Dialog`, `InfoModal` and macromolecules' `shared/modal`. These go last because they touch every modal and change focus handling.
- **Entry criteria:** #1 merged and the pipeline proven by the pilot.
- **Spec:** one short OpenSpec change per batch, for example `ui-kit-buttons` or `ui-kit-overlays`.

### #3 Emotion → CSS Modules sweep

- **Scope:** convert feature styles to `.module.css`, one feature folder per PR. That covers ~70 Emotion files in macromolecules and ~19 Emotion files in react.
- **First targets:** `monomerLibrary/monomerLibraryItem/styles.ts`, a runtime hotspot with ~12 prop interpolations per list item rendered for the whole library, and `RnaBuilder/RnaElementsView/styles.ts`, the largest file at 356 LOC.
- **Approach:**
  - Static `styled.x` blocks map one to one onto module classes.
  - Prop-driven styles become `data-*` attributes, or inline custom properties for truly dynamic values (for example a per-monomer colour → `style={{ '--monomer-color': … }}`).
  - `theme.ketcher.*` references become `var(--ketcher-*)`.
- **Runs in parallel with #2.** Coordinate per folder to avoid conflicts.

### #4 Form system rework

- **Scope:**
  - `script/ui/component/form/form/form.tsx`, a 733-line class component connected to Redux, using `jsonschema` with custom formats;
  - the polymorphic `Input/Input.tsx`, 468 LOC handling many input types;
  - the schema-to-widget mapping;
  - the `Label` translation-key auto-resolution and the Dialog `buttonsNameMap` behaviour.
- **Target:** Base UI `Field`, `Fieldset` and `Form` primitives, with kit inputs and an adapter layer that keeps the JSON-schema validation contract until it is deliberately replaced.
- **Entry criteria:** #2 has delivered Input, Checkbox, Radio, Select and NumberField.
- **Risk:** the highest of all sub-projects. It needs its own spec and a characterisation-test pass first, since today there is no form-level test.

### #5 Cleanup

- Remove `@mui/material`, `@emotion/*`, `@emotion/core` (a stray dev dependency) and `@emotion/babel-plugin`.
- Final LESS → CSS sweep of any remaining `.module.less` files, the `mixins.less` → utilities conversion, and removal of `less`.
- Delete the MUI/Emotion import allowlist, since the ban becomes absolute.
- Decide on `@layer` for kit and package CSS. This is host-visible and needs a changelog note.
- Memory-bank updates per CLAUDE.md archive rules.

### Later: separate initiatives

- **Visual refresh:** re-value the semantic tokens, using the token discrepancy list from #0 and Figma once it is accessible. The baselines are regenerated on purpose, in one go.
- **Figma alignment / Code Connect:** map kit components to Figma components. Needs MCP access to the Figma file (see `design.md` Open Questions).
- **Dark mode:** almost a token-only exercise once #3 is done, since everything reads semantic tokens.
- **Accessibility:** focus management and keyboard models beyond what Base UI provides.

## Per-component migration recipe (#2, and the #1 pilot)

1. **Characterise.** Write `*.legacy.stories.tsx` for the current component covering every state in use (default, hover, focus, disabled, open, selected, long text, RTL), tagged `visual`, and capture baselines in Docker. This can be a small PR of its own beforehand.
2. **Inventory.** List every call site in both packages, and every override rule targeting the component (`:global(.Mui…)`, `sx`, `classes`, `slotProps`, `PaperProps`, `!important`).
3. **Build.** Create the kit component following the contract (`design.md` Decision 12), using the same story IDs. Use the computed-styles dump helper (optional) to reproduce today's pixels.
4. **Migrate.** Replace call sites, delete the dead overrides, and keep every `data-testid` and ARIA role.
5. **Ratchet.** Remove the migrated files from the MUI/Emotion allowlist, and check that the metrics went down.
6. **Gate.** Zero story diff, e2e green with no baseline updates, a manual check of call sites without screenshot coverage, and unit tests passing.
7. **Split** when a component has more than ~15 call sites or a high e2e risk: kit component plus a legacy-API adapter first, call sites in follow-up PRs.

## Ideas backlog

These are optional and none blocks anything.

- **A `migrate-ui-component` Claude skill** in `.claude/skills/` that encodes the recipe and gates above, so every migration PR is consistent whoever (or whichever agent) writes it.
- **Codemods** (ts-morph or jscodeshift) for the mechanical parts:
  - `Icon` import rewrites;
  - LESS → CSS conversion (LESS nesting is mostly valid native nesting, and variables become `var()`);
  - static `styled.x` blocks → `.module.css`.
- **A computed-styles dump helper:** a dev-only Playwright script that opens a story and writes `getComputedStyle` for each component part to JSON, so CSS is written against real values.
- **A React 18 CI smoke job** that builds `example` with React 18 pinned.
- **Bundle-size tracking** in the metrics script output.

## Starting metrics (2026-10-13)

| Metric                        | ketcher-react | ketcher-macromolecules |
| ----------------------------- | ------------- | ---------------------- |
| Files importing `@mui/*`      | ~25           | ~22                    |
| `.Mui*` selectors             | 61 (in LESS)  | 28                     |
| `!important`                  | 74 (LESS) + 2 | 16                     |
| Emotion files                 | ~19           | ~70                    |
| `.less` files                 | 92            | 6                      |
| MUI `Tooltip` call-site files | 3             | 5                      |
