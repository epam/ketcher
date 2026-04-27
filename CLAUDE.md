# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is Ketcher

Ketcher is an open-source **chemical structure editor** built with TypeScript and React. It renders molecules, reactions, macromolecules, and monomers using a custom MVC architecture over SVG.

## Monorepo Structure

npm workspaces monorepo (Node >= 24.14.1, npm >= 7):

- **packages/ketcher-core** — domain logic, rendering engine, file format parsers, chemistry algorithms
- **packages/ketcher-react** — React component library (`<Editor />`)
- **packages/ketcher-standalone** — standalone mode (no Indigo backend needed)
- **packages/ketcher-macromolecules** — macromolecule/polymer editor UI
- **example** — reference app; uses Vite for dev, react-app-rewired (Webpack) for production builds
- **example-ssr** — Next.js SSR example
- **example-separate-editors** — example with multiple editor instances
- **demo** — Create React App demo
- **ketcher-autotests** — Playwright E2E test suite

## Build & Development Commands

```bash
# Install (always from root)
npm install

# Build everything
npm run build

# Build only the packages (ketcher-core → ketcher-standalone+ketcher-react → ketcher-macromolecules)
npm run build:packages

# Build individual packages
npm run build:core
npm run build:react
npm run build:standalone
npm run build:macromolecules
```

### Development server

```bash
cd example
npm run dev:standalone   # Vite dev server, standalone mode
npm run dev:remote       # Vite dev server, remote mode (requires Indigo service)
```

**Important**: Vite is used for development, but `react-app-rewired` (Webpack) is used for production builds. Always verify behavior with react-app-rewired before creating a PR:

```bash
# Start packages in watch mode (each in its own terminal)
cd packages/ketcher-core && npm start
cd packages/ketcher-react && npm start
cd packages/ketcher-standalone && npm start

# Then start the example app
cd example && npm run start:standalone   # or start:remote
```

### Serve production builds

```bash
npm run serve:standalone   # http://127.0.0.1:4002
npm run serve:remote       # http://127.0.0.1:4001
npm run serve              # both in parallel
```

## Testing

### Unit tests

```bash
# Run all unit tests across all packages (from root)
npm test

# Run unit tests in a single package
cd packages/ketcher-core
npm run test:unit                    # run all
npm run test:unit -- <pattern>       # run matching file/test name
npm run test:unit -- --watch         # watch mode

# Type checking
npm run test:types
```

### E2E tests (Playwright)

```bash
cd ketcher-autotests
npm install
npx playwright install chromium

npm t                                        # run all tests
npm run test -- canvas                       # run tests matching "canvas"
npm run test:debug                           # run with Playwright debug UI
npm run test -- --update-snapshots           # update screenshots

# Docker-based tests (for Linux-consistent snapshots — required for CI)
npm run docker:build
npm run docker:test
npm run docker:test file_name                # specific file
npm run docker:test file_name:N              # specific test at line N
npm run docker:update file_name:N            # update snapshot for specific test
```

Playwright snapshots for Linux are committed; macOS/Windows snapshots are gitignored.

## Linting & Formatting

```bash
npm run prettier:write          # format all files (all workspaces)
npm run stylelint:fix           # fix CSS/LESS
npm run test:eslint             # check ESLint
npm run test:eslint:fix         # fix ESLint issues
```

Pre-commit hook runs `lint-staged` + `prettier:write`. Pre-push hook runs `npm test` + `npm run test:types`.

## Architecture

### ketcher-core layers

Uses domain-driven design:
- **domain/** — chemical objects: `Atom`, `Bond`, `Struct`, `SGroup`, monomers, stereo labels, reactions
- **application/** — services and business logic: structure providers, file parsers, layout algorithms, `Render` class
- **infrastructure/** — low-level utilities

TypeScript path aliases (`domain/*`, `application/*`, `infrastructure/*`) are configured in tsconfig.

### MVC rendering model

- **Model**: chemical objects with coordinates in Angstrom-like units and Ketcher internal IDs
- **View**: SVG rendering via Paper.js and Raphael; `ReStruct` (render-side struct) mirrors `Struct` for render state
- **Controller**: editor tools, user interaction, Redux actions

### State management (ketcher-react)

Redux + Redux Toolkit. Never mutate Redux state directly — use slices and actions. Use `reselect` for memoized selectors.

### Indigo service

Server-side operations (aromatization, layout, format conversion) require the Indigo Service backend. Pass it via the `apiPath` prop on `<Editor>` or the `api_path` query param. Standalone mode uses a WASM build instead.

## Code Standards

- **TypeScript strict mode** — no `any`, no unjustified non-null assertions
- **React functional components only** — no class components
- **Pure functions** for calculations and coordinate transforms
- **Immutable model objects** — only modify through Redux actions/reducers
- **No new libraries** — do not introduce MobX, RxJS, jQuery, or anything not already in the project
- Magic numbers in chemistry logic must have explanatory comments
- Do not simplify stereochemistry, valence validation, or CFG parsing logic without full understanding

## Windows-specific note

If you encounter "file name too long" errors in Git, run:
```bash
git config --global core.longpaths true
```
