---
paths:
  - "packages/**/*.{ts,tsx}"
description: "TypeScript rules shared by the four Ketcher packages"
---

# TypeScript in the packages

Package conventions load separately from `ketcher-core.md`, `ketcher-react.md`,
`ketcher-macromolecules.md` and `ketcher-standalone.md`. Rules that break silently are in
[.memory-bank/invariants.md](../../.memory-bank/invariants.md); cite them by ID (`A2`), do not restate.

## Lint errors that fail CI (`eslint --quiet`)

- `@typescript-eslint/no-explicit-any` and `no-non-null-assertion` — narrow the type or handle the
  null; never silence the rule.
- `prettier/prettier` — formatting is a lint error. Run `npx prettier --write <files>` on what you
  touched instead of formatting by hand.
- `consistent-type-imports` in core and react — type-only imports use `import type`.
- `no-restricted-imports` of Node's `assert` in every package — it breaks browser bundles. Use
  `assert` from `utilities` inside core and from `ketcher-core` elsewhere.
- In react and macromolecules the React Compiler rules of `react-hooks` (`set-state-in-effect`,
  `refs`, `immutability`, `use-memo`, `static-components`, …) and
  `react-you-might-not-need-an-effect` are errors, not advice.

## Code shape

- Function components only.
- Named domain constants belong in `packages/ketcher-core/src/domain/constants/`, not inline.
- Do not add a dependency for a job the stack already does: `lodash`, `d3`, `raphael`, `paper`,
  MUI with emotion, `clsx`. A second library for the same job is the change most likely to be
  rejected.

Read by range, never whole: `DrawingEntitiesManager.ts`, both `Editor.ts`, `modes/SequenceMode.ts`,
`restruct/reatom.ts`, `MonomerCreationWizard.tsx`, `entities/struct.ts` (1.8–4.9k lines each).
