## Context

This change is sub-projects **#0 (Foundation)** and **#1 (Kit scaffold + pilot)** of the UI-kit initiative. The full initiative, future sub-projects and the ideas backlog live in `roadmap.md` in this folder.

### Audit snapshot (2026-10-13)

| Area              | `ketcher-react`                                                                                                              | `ketcher-macromolecules`                                                                                                                                         |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Primary styling   | CSS Modules + LESS: 92 `.less`, of which 88 are modules                                                                      | Emotion `styled`: ~70 files, 39 `*styles*.ts` files totalling ~2.7k LOC                                                                                          |
| Secondary styling | ~19 Emotion files, ~20 `sx` usages                                                                                           | 5 `.module.less` files + `theme.less`                                                                                                                            |
| Tokens            | ~104 LESS variables (`style/variables.less`) and a 464-line `mixins.less`, all compile-time; almost no CSS custom properties | JS theme `defaultTheme.ts` (297 LOC) consumed by 263 `theme.ketcher.*` refs in 46 files; `theme.less` is a manual duplicate of it as CSS vars and is barely used |
| MUI v5 surface    | ~20 distinct components in ~25 files                                                                                         | ~15 distinct components in ~24 import sites                                                                                                                      |
| Fighting MUI      | 61 `:global(.Mui*)` selectors, 74 `!important`                                                                               | 28 `.Mui*` selectors, 16 `!important`                                                                                                                            |
| Isolation         | CSS-module hashing; no reset                                                                                                 | `all: unset` global reset on the root via Emotion `<Global>`; default Emotion cache shared with react                                                            |
| Tests             | 83 test files; no Storybook                                                                                                  | 61 test files, 3 of them for shared components; no Storybook                                                                                                     |

Cross-cutting facts:

- **Package coupling.** `ketcher-react` lazily imports `ketcher-macromolecules`, and macromolecules statically imports `Icon` (26 files), `Button`, `IconButton`, `Input`, `Accordion` and others from `ketcher-react`.
- **CSS delivery.** Hosts import `ketcher-react/dist/index.css`. That file already includes `ketcher-macromolecules/dist/index.css` through rollup's PostCSS `include`. Emotion styles are injected at runtime.
- **Visual baselines.** Playwright holds ~28.5k committed screenshot baselines in 287 snapshot directories, with zero tolerance, generated in the `mcr.microsoft.com/playwright:v1.62.1-jammy` Docker image.
- **E2E selectors.** The e2e tests use **no** `.Mui*` selectors. They rely on `data-testid` (332 in react) plus ARIA roles (`option`, `listbox`, `combobox`, `dialog`, `tooltip`, `button`, `textbox`).
- **React support.** The published peer range is React `^18.2.0 || ^19.0.0`. The repo runs 19.2.
- **SSR.** `example-ssr` uses Next 16 with SSR, so the UI packages must be safe to import on the server.
- **No declared browser targets** exist for the published packages. Issue #11997 proposes Chrome/Edge 111+, Firefox 114+, Safari 16.4+.
- **Theme prop.** Macromolecules' `theme` prop (`DeepPartial<EditorTheme>`) is merged into the Emotion theme and also passed to `ketcher-core`'s canvas renderer via `createEditor({ theme })`. `ketcher-react` never passes it, and the README and docs don't mention it.
- **RTL rule.** The `.memory-bank/modules/i18n.md` RTL groundwork rule requires logical CSS properties in all new styling.
- **Build tool migration in flight.** PR #10401 (issue #10326) replaces the rollup library builds with Vite, but it is not yet merged. Master still builds with rollup 2 and `rollup-plugin-postcss`. Its follow-ups are tracked under #11974. Two of them touch this change: #11997, the browser baseline, and #12002, which replaces the Babel step with `@rolldown/plugin-emotion`.

## Goals / Non-Goals

**Goals:**

- One source of truth for UI-chrome design values (`--ketcher-*` tokens), consumed by legacy LESS, legacy Emotion and new kit components.
- A kit of headless-based components styled only by our own CSS, so no third-party styles have to be overridden.
- A component-level visual safety net that makes component-by-component migration verifiable at zero pixel diff.
- Proving the whole pipeline on one real component (`Tooltip`) used in both packages and rendered in a portal.
- No visual change and no breaking change to the published API.

**Non-Goals:**

- Migrating any component other than `Icon` (moved only) and `Tooltip`. The rest is covered by `roadmap.md` sub-projects #2–#5.
- Converting existing LESS or Emotion feature styles to `.module.css`. That is sub-project #3, plus sweeps done when files are touched.
- Reworking the form system (sub-project #4).
- Removing MUI, Emotion or LESS dependencies (sub-project #5).
- A visual refresh, dark mode, or alignment with the Figma design. These come later and need their own initiative.
- Accessibility improvements beyond what Base UI gives for free. Accessibility is a welcome side effect, not a goal.
- The canvas palette and rendering (`ketcher-core` renderer).

## Decisions

### Decision 1 — Visual policy: strict pixel parity during migration; refresh later

Every step of the migration must keep rendering pixel-identical. Tokens make a later visual refresh cheap, and that refresh is a separate initiative.

**Rationale:** the ~28.5k zero-tolerance e2e baselines make any visual change in a shared primitive regenerate thousands of screenshots, which would bury real regressions. With parity, a diff is always a signal.

**Alternatives considered:**

- _Refresh while migrating_: rejected. It turns every migration PR into a design review plus a mass baseline regeneration.
- _Parity without tokens_: rejected. It leaves the later refresh as expensive as today.

### Decision 2 — Source of truth for values: the current code

Seed values come from `ketcher-react`'s `style/variables.less` and macromolecules' `theming/defaultTheme/defaultTheme.ts`. Where the two packages disagree for the same role, both values are kept as separate tokens to preserve parity. Each disagreement is logged in a "token discrepancies" list for the refresh.

**Alternatives considered:**

- _A Figma file_: deferred. The existing Figma file ("Macromolecules (Polymer Editor) Playground") is feature-level, not a design system, and was created after the app. The Figma MCP also has no access to it at the moment (view-only). Aligning with it is an open question below.

### Decision 3 — Styling dialect: plain CSS Modules (`.module.css`) on modern CSS

New and migrated styles are plain `.module.css`:

- native nesting, flattened by PostCSS for the browser floor;
- `var(--ketcher-*)` tokens;
- `color-mix()` instead of LESS colour functions;
- `composes` and utility classes instead of LESS mixins.

Existing `.module.less` files keep working alongside and are converted when touched. LESS is removed in sub-project #5.

**Rationale:**

- Zero runtime cost, and the output is plain CSS shipped in the existing `dist/index.css`.
- CSS Modules hashing prevents our styles leaking into the host.
- It is the approach the team already prefers.
- Once tokens are runtime CSS custom properties, which option B needs for theming, LESS adds only mixins. Most of those map to `composes` and utility classes.

**Alternatives considered:**

- _Keep `.module.less`_: the least churn for react, but it keeps a preprocessor (pinned at 3.12) that adds little once tokens are runtime variables. Macromolecules would also have to move from Emotion to LESS.
- _SCSS modules_: costs the same port as plain CSS and still keeps a preprocessor.
- _vanilla-extract, Panda CSS, StyleX_: zero-runtime, but each needs a compiler or plugin in our builds, adds tooling, and StyleX is still 0.x.
- _Tailwind v4_: its preflight and utilities leak into, or conflict with, host pages. A poor fit for an embedded library.
- _Pigment CSS_: MUI has put it on hold.
- _Staying on Emotion_: it has a runtime cost, is awkward with RSC/SSR, and its default cache is shared with the host. It has had no release since 2024-12.

### Decision 4 — Headless library: Base UI (`@base-ui/react`)

Kit components wrap Base UI parts.

**Rationale:**

- Stable 1.x since 2025-12, released monthly, and maintained full-time by the MUI team (also behind Radix and Floating UI).
- Supports React 17–19 and SSR.
- Covers everything we use, including Combobox, Number Field and Field/Form primitives.
- Its `Portal` accepts any container element.
- It exposes state as `data-*` attributes, which suits CSS Modules.
- It has no built-in strings, so translated text always comes from consumers.
- It provides a direction provider for RTL and locale-aware number formatting.

**Escape hatch:** an individual component may be built on React Aria Components when Base UI can't do it well. This needs a per-component justification and stays hidden behind the kit API.

**Alternatives considered:**

- _React Aria Components_: the best accessibility and i18n, but a heavier bundle and a more opinionated API (collections, render props). Accessibility is not a goal of this initiative.
- _Radix Primitives_: mature and still released, but has no Number Field, no Combobox and no modern Field/Form. Ecosystem momentum is moving to Base UI (shadcn switched its default in 2026-07).
- _Ark UI / Zag_: broad coverage, but less familiar.
- _Headless UI_: too narrow.
- _Ariakit_: still 0.x.
- _shadcn/ui_: copy-paste plus Tailwind. Usable as a design reference, not as a library dependency.

### Decision 5 — Kit location: a folder inside `ketcher-react`, not a new package

`packages/ketcher-react/src/ui-kit/` is self-contained, with a single `index.ts` entry that `ketcher-react` re-exports. Macromolecules imports kit components from `'ketcher-react'`, exactly as it imports `Icon` today. That works because macromolecules always runs with `ketcher-react` present, which it imports statically. The result is one runtime copy of the kit and its providers.

**Rationale:** no release, versioning or publishing overhead. The boundary is enforced by lint (Decision 11). The folder can be lifted out later if that is ever wanted.

**Alternatives considered:**

- _A new published package (`ketcher-ui`)_: rejected. One more publishable package adds release and support work with no value to hosts.
- _A private workspace package bundled into `ketcher-react` and re-exported, with macromolecules' build rewriting the import to `ketcher-react`_: rejected. It needs the same workspace, alias and jest wiring as a published package plus a build-time import rewrite, all for a boundary that lint already gives us.
- _A private package bundled into both consumers_: rejected. It duplicates the JS and CSS (react's `index.css` already includes macromolecules' CSS), and having two copies of React contexts breaks portal and direction providers.

### Decision 6 — Token model and placement

`ui-kit/tokens/tokens.css` defines two tiers:

- primitives, for example `--ketcher-palette-teal-600`;
- semantic tokens, for example `--ketcher-color-accent`, `--ketcher-font-size-regular`, `--ketcher-radius-sm`.

Kit components only reference semantic tokens. Spacing tokens are added when a migrated component needs them; there is no speculative scale.

Tokens are declared on `:root`. They are prefixed, so they are inert for hosts. Hosts and individual editor instances override them on any ancestor element, and the nearest declaration wins through inheritance.

**Rationale:** legacy MUI popovers still render into `<body>`. Once LESS and Emotion are bridged to `var(--ketcher-*)`, tokens declared only on the editor roots would be undefined inside those popovers.

**Alternatives considered:**

- _Declaring tokens only on the editor roots_: breaks legacy portaled content during the migration.
- _DTCG JSON plus Style Dictionary generating the CSS_: deferred until a designer-owned source exists, for example after Figma alignment. Hand-written CSS is enough for now.

### Decision 7 — Legacy bridges

**LESS:**

- Each variable in `variables.less` becomes `@x: var(--ketcher-…)`.
- LESS colour functions can't operate on `var()`:
  - The 11 `fade(@x, N%)` calls become `color-mix(in srgb, var(--…) N%, transparent)`, which is pixel-identical.
  - The 1 `lighten()` and 1 `mix()` operate in HSL or on resolved values, which `color-mix()` doesn't reproduce exactly. Their compiled outputs become literal primitive tokens.
- LESS fails the build on any colour function left over, so a miss can't break pixels silently.

**Emotion:**

- The UI-chrome keys of `defaultTheme.ts` become `'var(--ketcher-…)'` strings, so the existing 263 `theme.ketcher.*` usages read tokens unchanged.
- Before converting, two audits run:
  - which theme keys `ketcher-core`'s canvas renderer reads. Those stay literal, because SVG presentation attributes don't resolve `var()`;
  - any JS colour maths or string manipulation applied to theme values.
- `theme.less` is deleted.

### Decision 8 — Theme prop: canvas palette only; CSS variables are the chrome theming API

The `theme` prop of macromolecules' `Editor` keeps working for the canvas palette (monomer and peptide colour schemes, and similar), which `ketcher-core` consumes as literal JS values. UI-chrome overrides passed via `theme` are **deprecated**. As components migrate, those overrides stop applying, and the changelog says so. The supported way to theme UI chrome is to override `--ketcher-*` custom properties. That also works for `ketcher-react`'s UI, which has no theming today.

**Alternatives considered:**

- _Bridging_: inject the merged `theme` object as inline `--ketcher-*` variables on the macromolecules root. This would need a mapping table between theme keys and token names, maintained until the prop is removed. Not worth it for a prop that `ketcher-react` never passes and the docs never mention.

### Decision 9 — Isolation: no `@layer` during the migration

Kit CSS is unlayered. Kit selectors are a single CSS-module class, optionally combined with `[data-*]` state attributes, for example `.root[data-variant='primary']`. Kit CSS never uses:

- element selectors;
- `:global`;
- `!important`.

Physical left/right properties are not allowed either; logical properties are used instead.

**Rationale:** layered CSS always loses to unlayered CSS. A layered kit would lose both to our own legacy rules and to any host global rule such as `button {}`, which today loses to our single-class selectors. That is a regression risk for embedding hosts.

The existing root resets (macromolecules `all: unset`, react with no reset) stay as they are for parity. Whether to adopt `@layer` gets reconsidered in sub-project #5.

### Decision 10 — Providers and portals

`KitProvider` is mounted at both editor roots (`.Ketcher-root` and `.Ketcher-polymer-editor-root`) and supplies:

1. **The portal container.** This is a dedicated `<div data-ketcher-portal-root>` rendered as a direct child of the editor root. Popups render inside the root, so they inherit the tokens and `dir`. Because no ancestor between them and the root clips, they are not clipped by `overflow: hidden` or transforms. Fullscreen works because the root sits inside the fullscreen element.
2. **The text direction.** The provider takes the direction from the consumer's `i18n.dir()` and passes it to Base UI's direction provider. The kit never imports i18next.

### Decision 11 — Enforcement and progress tracking

ESLint uses `import/no-restricted-paths` from the existing `eslint-plugin-import`:

- `ui-kit/**` may only import from `ui-kit/**`, `@base-ui/react`, `react` and `clsx`;
- code outside the kit may only import kit code through the `ui-kit` entry point.

A second ESLint rule bans new `@mui/*` and `@emotion/*` imports, with an allowlist of the files that use them today. The allowlist shrinks with every migration.

Stylelint enforces the Decision 9 selector rules inside `ui-kit/`.

A metrics script counts the remaining:

- `@mui/*` and `@emotion/*` imports;
- `.Mui*` selectors;
- `!important`;
- `.less` files;
- Emotion files;
  It prints these in CI and fails if any count increases. It also reports the `dist` size change, for information only; that never fails the build.

### Decision 12 — Component contract

- **Props.** Kit components own their props. Base UI types never appear in exported prop types.
- **Shape.** Simple components take flat props, for example `<Tooltip title placement>`. Complex ones expose the minimal set of composed parts that our call sites need.
- **Root element.** `className` is merged onto the root with `clsx`. `data-testid`, `data-*` and `aria-*` attributes pass through to the root.
- **Refs.** Components use `forwardRef`, because React 18.2 is in the peer range and passing `ref` as a prop is 19-only.
- **Variants.** `variant` and `size` props render as `data-variant` and `data-size` attributes.
- **Controlled and uncontrolled.** Form-like components support both: `value` with `onChange`, or `defaultValue`.
- **Text.** All text is passed in as `ReactNode`. The kit never translates anything.
- **SSR.** Kit modules never touch `window` or `document` at module scope.
- **Consumer customisation**, in order of preference:
  1. props;
  2. component-scoped custom properties declared by the kit, for one-off parity cases, for example `--ketcher-button-bg`;
  3. `className`, for layout only (margin, size, position). Overriding visual internals through `className` is forbidden, because two equal-specificity module classes depend on CSS order.
- **Pixel parity.** Kit CSS reproduces the computed styles that render today, measured in the running app or in a story, not MUI's source.
- **Existing exports.** `Button`, `IconButton`, `Input`, `Accordion` and `Icon` keep their names and props. They are either reimplemented on the kit or re-exported from it, so call sites can migrate gradually.

### Decision 13 — Safety net: Storybook plus story screenshots plus existing e2e

**Storybook:**

- One Storybook 10 instance using the Vite builder, configured in `ketcher-react`.
- It collects stories from both `ketcher-react/src` and `ketcher-macromolecules/src`. Package aliases are reused from `example/vite.config.js` by moving them into a shared helper.
- Decorators provide `KitProvider`, tokens and global LESS, plus the MUI and Emotion theme providers that legacy stories need.

**Characterisation stories:**

- Before a component migrates, `*.legacy.stories.tsx` stories capture the current implementation in every state we use. That includes hover, focus, disabled, open, selected, long text and RTL.
- The kit story keeps the same story IDs, so the "before" baselines become the "after" gate.

**Story screenshots:**

- A new `ui-kit` Playwright project in `ketcher-autotests` generates one test per story tagged `visual`, by reading the Storybook build's `index.json`.
- It runs in the same Docker image as e2e, at zero threshold, with animations disabled and the text cursor hidden.
- Open states are set through props such as `defaultOpen`. Hover and focus states are forced with the pseudo-states addon, or with explicit `hover()`/`focus()` calls if that addon is incompatible with Storybook 10.
- A CI job builds Storybook and runs this project on PRs that touch either UI package's `src`.

**Unit tests:** they stay on Jest + RTL; no Vitest in this change. Kit tests reuse stories as fixtures through `composeStories`.

**Gates for every migration PR:**

1. story screenshots show zero diff, or each diff is listed and justified;
2. the existing e2e suite passes with **no baseline updates**;
3. call sites without e2e screenshot coverage are listed and checked by hand, or get a new screenshot;
4. unit tests pass.

**Alternatives considered:**

- _Chromatic_: hosted and paid, and its rendering differs from our Docker baselines.
- _Vitest browser mode with the Storybook addon_: deferred to the Vite work tracked in #11974.
- _Playwright component testing_: still experimental.

### Decision 14 — Browser floor: aligned with #11997, applied to CSS only in this change

The floor is Chrome ≥ 111, Edge ≥ 111, Firefox ≥ 114 and Safari ≥ 16.4. It covers `color-mix()`, `@layer` and `:where()` natively. Native nesting needs Chrome 120 / Firefox 117 / Safari 17.2, so `postcss-nesting` flattens it.

The floor is defined once in the shared PostCSS config module and passed explicitly to autoprefixer (`overrideBrowserslist`). The README documents the supported browsers.

The issue history supports this floor:

- the only Firefox ESR report is #2997 (ESR 102, 2023, closed);
- recent Safari reports are on 18.6 and 26.x.

**JS transpilation targets are deliberately unchanged.** `ketcher-react` and `ketcher-macromolecules` use `@babel/env` with no targets, so the published JS is compiled down to ES5-level syntax. A repo-wide `.browserslistrc` would make Babel emit modern syntax (`?.`, `??`, class fields), which older host bundlers such as webpack 4 cannot parse. That is a breaking change, and it belongs to #11997/#11974, which are assessed for a breaking-change release. Until then, no `.browserslistrc` or `browserslist` field is added that Babel would pick up. On the Vite branch (#10401) the JS output already follows Vite's own default target. Once that lands, this concern is resolved by #11997 independently of this change.

### Decision 15 — Pilot component: Tooltip, after moving Icon

**`Icon`** moves into the kit as-is: inline SVGR components and the same `IconName` union. It is re-exported from `'ketcher-react'`, so its 26 macromolecules import sites don't change. This exercises the kit structure without any visual risk.

**`Tooltip`** replaces every MUI `Tooltip` import:

- react: `form.tsx`, `measure-input.tsx`, `AttachmentGroupActionMenuItem.tsx`;
- macromolecules: `RnaPresetItem.tsx`, `RnaEditorExpanded.tsx`, `MonomerItem.tsx`, `MacromoleculePropertiesWindow.tsx`, `SettingsField.tsx`.

It is used in both packages and renders in a portal, so it proves the riskiest pieces of infrastructure (portal container, tokens and direction inside the root) on a visually simple component.

The custom `script/ui/views/components/Tooltip` (LESS, not MUI) is out of scope for the pilot.

## Risks / Trade-offs

- **[Portal relocation clips or reorders popups]** → a dedicated portal root as a direct child of the editor root. The pilot explicitly covers fullscreen, scrolling panels, modals and the monomer library.
- **[Call-site overrides go dead once MUI is gone, silently changing a call site's look]** → the call-site inventory per PR, plus the e2e no-baseline-update gate.
- **[The Emotion bridge breaks JS colour maths on theme values, or the canvas reads a converted key]** → both audits run before any key becomes `var()`. Canvas keys stay literal.
- **[A browserslist config accidentally picked up by Babel would change the published JS syntax level, breaking hosts on older bundlers]** → the floor is passed explicitly to CSS tooling only, and no `.browserslistrc` or package `browserslist` field is added. A task verifies that the `dist` JS output is unchanged. The JS floor stays with #11997/#11974.
- **[Hosts styling MUI internals inside Ketcher, or relying on chrome overrides via the `theme` prop]** → a changelog note for each affected release. The ADR records the reasoning.
- **[A temporary bundle increase while Base UI and MUI coexist]** → Base UI is tree-shaken per component, and the metrics script reports the `dist` size change.
- **[The Vite migration (#10401) lands mid-way and changes the build wiring this change relies on]** → all style-build configuration lives in one shared PostCSS config module, which both rollup and Vite read. CSS Modules naming and extraction into `dist/index.css` are verified on whichever build is current when each step merges. Whichever branch merges second rebases onto the first, and that includes moving the kit's CSS `include` and the Storybook aliases.
- **[React 18 regressions while developing on 19.2]** → a CI smoke job that builds `example` with React 18 pinned.
- **[The migration stalls halfway]** → every PR leaves the codebase strictly better and consistent. The allowlist and metrics keep the remaining work visible.
- **[Story screenshots differ between local machines and CI]** → baselines are only generated in the Docker image, using the existing `docker:*` workflow.

## Migration Plan

1. **Foundation (#0)**, pixel-neutral:
   1. the CSS browser floor and the shared PostCSS config;
   2. tokens and the discrepancy list;
   3. the LESS bridge;
   4. the canvas-key and colour-maths audits, then the Emotion bridge;
   5. delete `theme.less`;
   6. hygiene: the dangling workspace entry and the memoized theme.

   Gate: the e2e suite passes with zero baseline updates.

2. **Scaffold (#1):**
   1. the `ui-kit/` folder and `KitProvider`;
   2. ESLint and stylelint rules;
   3. Storybook, the `ui-kit` Playwright project, the CI job and the metrics script.
3. **Move `Icon`** into the kit.
4. **Tooltip pilot:** characterisation stories and baselines, then the kit Tooltip, then migrate all 8 call sites.

   Gate: all of Decision 13's gates.

**Rollback:** each step is an independent PR. The bridges are plain variable re-pointing, and reverting a PR restores the previous values. The kit is additive until call sites migrate.

## Open Questions

- **Figma alignment.** Get Figma MCP access to "Macromolecules (Polymer Editor) Playground" (fileKey `MZ28kJRelnXvBodXu54UKh`, node `668:28822`), either through edit rights or a duplicate in drafts. Then cross-check the token discrepancy list against it. This feeds the refresh initiative and possible Code Connect, and doesn't block this change.
- **`@layer` adoption.** Revisit in sub-project #5, once legacy unlayered CSS is gone.
- **Ordering with the Vite migration (#10401).** Should this change wait for #10401 to merge so it only wires the Vite build, or proceed on rollup now and rebase later? The design works with either; the implementation plan assumes rollup on master.
- **Pseudo-states addon.** Check its compatibility with Storybook 10. The fallback is explicit `hover()`/`focus()` calls in Playwright.
- **Scope relative to #11997.** This change applies the floor to CSS and documents it. The JS part (Babel targets and Vite `build.target`) remains with #11997/#11974. Should #11997 be split, or should it reference this change for the CSS half?
