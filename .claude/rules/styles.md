---
paths:
  - "**/*.less"
  - "**/*.css"
  - "**/styles.ts"
  - "**/*.styles.ts"
description: "Less, CSS Modules and emotion in the Ketcher packages"
---

# Styles

- ketcher-react styles components with CSS Modules in Less (`Name.module.less`); macromolecules
  mostly with emotion `styled` in a `styles.ts` next to the component, plus `theme.less` and a few
  modules. The packages contain no plain `.css`.
- Take colours, sizes and mixins from `packages/ketcher-react/src/style/variables.less` and
  `mixins.less` (macromolecules: its theme in `src/theming/`) instead of literal values.
- Stylelint 17 with `stylelint-config-standard` and `stylelint-config-standard-less` from the root
  `.stylelintrc.json`; `src/style/` is excluded by `.stylelintignore`.
- The packages build their Less with **Less 3**; the example's Vite dev server compiles the same
  files with **Less 4**, and the two disagree on division outside parentheses. Write `(a / b)` so
  both produce the same CSS.
- CSS Module class names are hashed at build time: never let an E2E test select by class. Give a new
  interactive element a `data-testid`.
