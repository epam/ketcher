---
paths:
  - "**/package.json"
  - "**/rollup.config.mjs"
  - "**/jest.config.js"
  - "**/tsconfig*.json"
  - "**/.babelrc"
  - "eslint.config.mjs"
  - ".prettierrc.js"
  - ".stylelintrc.json"
  - ".lintstagedrc.json"
  - ".npmrc"
  - ".nvmrc"
  - ".husky/**"
  - "scripts/**"
description: "Build, dependency and tooling configuration of the Ketcher monorepo"
---

# Build, dependencies and tool configuration

Upgrade procedure and the coupled versions: the `ketcher-deps-upgrade` skill.

- Node comes from `.nvmrc`. npm workspaces: install at the root only (`npm ci`), never inside a
  package. `.npmrc` sets `legacy-peer-deps=true`, which hides peer conflicts — read the peer range
  yourself before adding or bumping a package.
- Build order is `build:core` → `build:standalone` ∥ `build:react` → `build:macromolecules`
  (`package.json#build:packages`). ketcher-react lazy-imports ketcher-macromolecules without declaring
  it (`packages/ketcher-react/src/Editor.tsx#import('ketcher-macromolecules')`), so a react build
  embeds whatever macromolecules `dist` already exists — rebuild macromolecules before judging a
  react bundle.
- Packages build with Rollup 2, a TypeScript plugin (core `@rollup/plugin-typescript`, the others
  `rollup-plugin-typescript2`) and Babel. The example app builds with CRA (`react-app-rewired`) but
  runs in dev on Vite: behaviour that differs between `dev:*` and `build` is a toolchain difference
  first.
- ESLint 10 flat config (`eslint.config.mjs`) is the only lint config; there are no `.eslintrc*`
  files. Prettier 3 runs inside ESLint as the error `prettier/prettier`.
- Development-only tools go to `devDependencies`. Before adding any dependency, check that the stack
  does not already cover the job (see `typescript.md`).
- `package-lock.json` is 1.9 MB: never read it whole. Get a version with `npm ls <name>` (needs
  `node_modules`) or grep for `"node_modules/<name>"` with two lines of context.
- Git hooks (husky 8): pre-commit runs lint-staged and then `prettier:write` over every workspace;
  pre-push runs the full `npm test` and `test:types`.
