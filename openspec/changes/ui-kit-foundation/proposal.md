Tracking: #12193 (umbrella #12192).

## Why

Ketcher's two UI packages style their components in incompatible ways, and both fight their component library:

- `ketcher-react` uses CSS Modules + LESS (92 `.less` files) but also ~19 Emotion files. Its tokens are compile-time LESS variables only.
- `ketcher-macromolecules` uses Emotion CSS-in-JS (~70 files) plus a runtime JS theme, plus a hand-maintained `theme.less` copy of that theme, plus 5 `.module.less` files.
- Both build custom components on MUI v5 and then override MUI's internals: 61 `:global(.Mui*)` selectors and 74 `!important` in `ketcher-react` LESS, 28 `.Mui*` selectors and 16 `!important` in macromolecules. Every MUI upgrade or new call site risks breaking these overrides silently.
- Generic components are duplicated between the packages (Modal, Dropdown, Button, Input), and macromolecules imports primitives (`Icon`, `Button`, `Input`, `Accordion`) from `ketcher-react` ad hoc.
- There is no component-level visual safety net (no Storybook, few component tests), only the full-app Playwright screenshot suite.

This change is the first step of a multi-step initiative (see `roadmap.md`): it lays the foundation (unified tokens, browser baseline, bridges for legacy styles) and scaffolds a headless-component UI kit with its own safety net, proving the whole pipeline end-to-end on one pilot component. It is pixel-neutral by design.

## What Changes

- **Browser baseline:** declare an explicit browser floor for CSS (Chrome/Edge 111+, Firefox 114+, Safari 16.4+), aligned with issue #11997, in a shared PostCSS config that also flattens native CSS nesting. JS transpilation targets are unchanged, so no syntax change reaches host bundlers; that part stays with #11997/#11974.
- **Design tokens:** introduce `--ketcher-*` CSS custom properties as the single source of truth for UI-chrome styling (two tiers: primitive and semantic), seeded from today's LESS variables and macromolecules `defaultTheme.ts` so rendering is unchanged.
- **Legacy bridges:** point `ketcher-react`'s LESS variables and macromolecules' Emotion theme (UI-chrome keys only) at the tokens; convert LESS colour functions so they work with tokens; delete the duplicated `theme.less`.
- **Theme prop:** macromolecules' `theme` prop keeps driving the canvas palette; its UI-chrome overrides are deprecated in favour of overriding `--ketcher-*` custom properties.
- **UI kit scaffold:** a self-contained `ui-kit/` folder inside `ketcher-react` built on Base UI (`@base-ui/react`), with plain `.module.css` styling, a `KitProvider` (portal container + text direction) mounted in both editor roots, lint-enforced import boundaries, and a lint ban on new MUI/Emotion imports (with a shrinking allowlist).
- **Safety net:** Storybook 10 (Vite) in `ketcher-react` collecting stories from both UI packages; a `ui-kit` Playwright project in `ketcher-autotests` that screenshots every `visual`-tagged story at zero threshold; a CI job; a progress-metrics script.
- **First components:** move `Icon` into the kit unchanged (API-compatible), and migrate all MUI `Tooltip` usages (8 files across both packages) to a kit `Tooltip` as the pilot.
- **Hygiene:** remove the dangling `example-separate-editors` workspace entry; memoize macromolecules' merged theme object.

## Capabilities

### New Capabilities

- `browser-baseline`: The explicit supported-browser floor for published packages and how CSS is compiled for it.
- `design-tokens`: The `--ketcher-*` token model, where tokens are declared, how legacy LESS/Emotion styles consume them, and the theming API for hosts.
- `ui-kit`: The kit's location, import boundaries, providers, component contract, styling rules, and the first components (`Icon`, `Tooltip`).
- `ui-visual-regression`: Storybook, story screenshot testing, characterization stories, and the gates every UI migration PR must pass.

### Modified Capabilities

<!-- No existing spec-level capabilities are changing. -->

## Impact

- `ketcher-react`: new `src/ui-kit/` folder; new dependency `@base-ui/react`; new dev dependencies (Storybook 10, `postcss-nesting`); `variables.less` re-pointed at tokens; `Icon` moved; 3 MUI Tooltip call sites migrated; ESLint/stylelint config extended.
- `ketcher-macromolecules`: `defaultTheme.ts` UI-chrome keys re-pointed at tokens; `theme.less` deleted; `KitProvider` mounted in the editor root; 5 MUI Tooltip call sites migrated; merged theme memoized.
- `ketcher-core`: no code change; the canvas keeps reading literal theme values. The set of theme keys the canvas reads is audited.
- `ketcher-autotests`: new `ui-kit` Playwright project and baselines; existing e2e baselines must stay unchanged.
- Repo: root workspaces list, shared PostCSS config (CSS browser floor), CI workflow job, metrics script.
- **Host-visible changes (changelog):** new `--ketcher-*` custom properties declared on `:root`; UI-chrome overrides via macromolecules' `theme` prop deprecated; migrated popups (Tooltip) render inside the editor root instead of `<body>`; documented browser floor. Published packages, the host CSS import (`ketcher-react/dist/index.css`) and all `data-testid`s are unchanged.
