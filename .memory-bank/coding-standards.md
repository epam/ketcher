# Coding standards

Conventions that hold in the repo today. Each one names its evidence: a lint rule in `eslint.config.mjs`, a config value, or code that follows it. Rules that a reviewer checks are in `review-rules.md`. Patterns a reviewer must not flag are in `accepted-patterns.md`.

## Language and types

- Source is TypeScript, and `any` is a lint error in every package. Evidence: `@typescript-eslint/no-explicit-any` (error), `eslint.config.mjs:110`.
- Non-null assertions (`!`) are a lint error. Evidence: `@typescript-eslint/no-non-null-assertion` (error), `eslint.config.mjs:109`.
- The four packages compile in strict mode. Evidence: `"strict": true` in `packages/ketcher-core/tsconfig.json:20`, `packages/ketcher-macromolecules/tsconfig.json:23`, `packages/ketcher-standalone/tsconfig.json:22`, and `packages/ketcher-react/tsconfig.build.json:22`.
- Type-only imports use `import type` in ketcher-core and ketcher-react. Evidence: `@typescript-eslint/consistent-type-imports` at `eslint.config.mjs:219` (ketcher-react) and `eslint.config.mjs:301` (ketcher-core).
- `interface` and `type` both declare object shapes, and no lint rule or doc prefers one. Evidence: `export interface AtomProperties` in `packages/ketcher-core/src/domain/entities/CoreAtom.ts:20` and `export type Neighbor` in `packages/ketcher-core/src/domain/entities/struct.ts:52`.
- Each module is imported once. Evidence: `no-duplicate-imports` (error), `eslint.config.mjs:129`.
- Object literals use property and method shorthand. Evidence: `object-shorthand` (error), `eslint.config.mjs:111`.
- Browser packages do not import Node's `assert`. They use the `assert` that ketcher-core exports. Evidence: `no-restricted-imports` at `eslint.config.mjs:194` (ketcher-react and ketcher-macromolecules) and `eslint.config.mjs:308` (ketcher-core).
- Unused variables are a lint error unless the name starts with `_`. Evidence: `@typescript-eslint/no-unused-vars` with `^_` patterns, `eslint.config.mjs:117-123`.

## Architecture

- ketcher-core is split into `domain/`, `application/`, `infrastructure/`, and `utilities/`. Evidence: the module table in `.memory-bank/architecture.md` (lines 40-45) and the directory layout of `packages/ketcher-core/src/`.
- Views render with SVG: Raphael for micro mode and D3 for macro mode. Evidence: `.memory-bank/architecture.md:34`.
- Model edits are operation classes built on `BaseOperation`. Evidence: 58 files under `packages/ketcher-core/src` extend `BaseOperation`.
- ketcher-react keeps state in Redux with `redux` and `redux-thunk`. `@reduxjs/toolkit` is a dependency of ketcher-macromolecules only. Evidence: `packages/ketcher-react/package.json:84,86` and `packages/ketcher-macromolecules/package.json:59`.
- All four packages depend on `lodash`. Evidence: `packages/ketcher-core/package.json:57`, `packages/ketcher-react/package.json:74`, `packages/ketcher-standalone/package.json:47`, and `packages/ketcher-macromolecules/package.json:65`.

## React and UI

- Hook rules are lint errors in the packages. Evidence: `react-hooks/exhaustive-deps` at `eslint.config.mjs:133`, and `react-hooks/set-state-in-effect` and `react-you-might-not-need-an-effect/no-event-handler` at `eslint.config.mjs:206` and `:213` (ketcher-react and ketcher-macromolecules).
- UI components are function components. Twelve class components remain and are listed in `accepted-patterns.md`. Evidence: `packages/ketcher-react/src/script/ui/Portal/Portal.tsx` is one of them.

## Tests

- Unit tests run on Jest. Each package has a `test:unit` script. Evidence: `"test:unit": "jest"` in `packages/ketcher-core/package.json:43`, and `jest --passWithNoTests` in the other three packages.
- E2E tests run on Playwright. Their conventions live in `.memory-bank/testing/testing.md` and are not restated here. Evidence: `ketcher-autotests/playwright.config.ts`.

## Tooling and process

- Prettier is a lint error, and source uses LF line endings. Evidence: `prettier/prettier` (error) and `linebreak-style` `unix` (error), `eslint.config.mjs:107-108`.
- Commit and PR titles have the form `#<issue> - <title>`, with an ASCII hyphen. Evidence: 196 of the last 300 commit subjects use this form, and 37 use an en dash.
- Node.js 24.20.0 or newer and npm 7 or newer are required. Evidence: `engines` in the root `package.json:70-72`.
