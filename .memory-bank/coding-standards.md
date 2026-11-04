# Coding standards

Conventions that hold in the repo today. Each one names its evidence: a lint rule in `.oxlintrc.json`, a config value, or code that follows it. Rules that a reviewer checks are in `review-rules.md`. Patterns a reviewer must not flag are in `accepted-patterns.md`.

## Language and types

- Source is TypeScript, and `any` is a lint error in every package. Evidence: `typescript/no-explicit-any` (error) in `.oxlintrc.json`.
- Non-null assertions (`!`) are a lint error. Evidence: `typescript/no-non-null-assertion` (error) in `.oxlintrc.json`.
- The four packages compile in strict mode. Evidence: `"strict": true` in `packages/ketcher-core/tsconfig.json:20`, `packages/ketcher-macromolecules/tsconfig.json:23`, `packages/ketcher-standalone/tsconfig.json:22`, and `packages/ketcher-react/tsconfig.build.json:22`.
- Type-only imports use `import type` in ketcher-core and ketcher-react. Evidence: `typescript/consistent-type-imports` in the ketcher-react and ketcher-core overrides of `.oxlintrc.json`.
- `interface` and `type` both declare object shapes, and no lint rule or doc prefers one. Evidence: `export interface AtomProperties` in `packages/ketcher-core/src/domain/entities/CoreAtom.ts:20` and `export type Neighbor` in `packages/ketcher-core/src/domain/entities/struct.ts:52`.
- Each module is imported once. Evidence: `no-duplicate-imports` (error) in `.oxlintrc.json`.
- Object literals use property and method shorthand. Evidence: `object-shorthand` (error) in `.oxlintrc.json`.
- Browser packages do not import Node's `assert`. They use the `assert` that ketcher-core exports. Evidence: `no-restricted-imports` in the overrides of `.oxlintrc.json` for ketcher-react, ketcher-macromolecules, ketcher-standalone, and ketcher-core.
- Unused variables are a lint error unless the name starts with `_`. Evidence: `no-unused-vars` (error) with `^_` patterns in `.oxlintrc.json`.
- A signature change to a public API symbol keeps the symbol's JSDoc matching the new signature. The `index.ts` barrels are re-exports (`export *`, plus a handful of named ones) and carry none, so the JSDoc lives on the declaration, most of the public surface sitting in `packages/ketcher-core/src/application/ketcher.ts`. Evidence: the documented members of the `Ketcher` class there, `ketcher.ts:132` and `ketcher.ts:823`.

## Architecture

- ketcher-core is split into `domain/`, `application/`, `infrastructure/`, and `utilities/`. Evidence: the module table in `.memory-bank/architecture.md` (lines 40-45) and the directory layout of `packages/ketcher-core/src/`.
- Views render with SVG: Raphael for micro mode and D3 for macro mode. Evidence: `.memory-bank/architecture.md:34`.
- Model edits are operation classes built on `BaseOperation`. Evidence: 58 files under `packages/ketcher-core/src` extend `BaseOperation`.
- ketcher-react keeps state in Redux with `redux` and `redux-thunk`. `@reduxjs/toolkit` is a dependency of ketcher-macromolecules only. Evidence: `packages/ketcher-react/package.json:84,86` and `packages/ketcher-macromolecules/package.json:59`.
- All four packages depend on `lodash`. Evidence: `packages/ketcher-core/package.json:57`, `packages/ketcher-react/package.json:74`, `packages/ketcher-standalone/package.json:47`, and `packages/ketcher-macromolecules/package.json:65`.

## React and UI

- Hook rules are lint errors in the packages. Evidence: `react/exhaustive-deps` in `.oxlintrc.json`, and `react/set-state-in-effect` and `react-you-might-not-need-an-effect/no-event-handler` in its ketcher-react and ketcher-macromolecules override.
- UI components are function components. The class components that remain are listed in `accepted-patterns.md`. Evidence: `packages/ketcher-react/src/script/ui/Portal/Portal.tsx` is one of them.

## Tests

- Unit tests run on Jest. Each package has a `test:unit` script. Evidence: `"test:unit": "jest"` in `packages/ketcher-core/package.json:43`, and `jest --passWithNoTests` in the other three packages.
- E2E tests run on Playwright. Their conventions live in `.memory-bank/testing/testing.md`. Evidence: `ketcher-autotests/playwright.config.ts`.

## Tooling and process

- Prettier formatting is checked on every `npm test`, and source uses LF line endings. Evidence: the `test:prettier` script in each package's `package.json`, and Prettier's default `endOfLine` of `lf`.
- Commit and PR titles have the form `#<issue> - <title>`, with an ASCII hyphen. Evidence: 196 of the last 300 commit subjects use this form, and 37 use an en dash.
