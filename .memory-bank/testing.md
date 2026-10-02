# Testing

> **Read when:** writing or running unit tests, type checks or lint, or deciding which test levels a
> change needs.
> **Skip when:** writing or running a Playwright spec — [testing-e2e.md](./testing-e2e.md) covers E2E.

## Testing Levels

| Level | Tool | Where | Run in CI by |
| --- | --- | --- | --- |
| Unit | Jest 30 with ts-jest, `jsdom` | per package, see below | `ci.yml` → `npm test` |
| Types | `tsc --noEmit` per workspace | every workspace | `ci.yml` (packages, example-ssr); pre-push hook (all) |
| Lint and format | ESLint 10 flat config, Prettier 3, Stylelint 17 | root configs | `ci.yml` → `npm test` |
| Circular imports | `dpdm` (`test:circ`) | core, react | `ci.yml` → `npm test` |
| End-to-end | Playwright, Chromium | `ketcher-autotests/` | `run-tests.yml`, `run-tests-popup.yml` — see [testing-e2e.md](./testing-e2e.md) |

## Unit Tests per Package

| Package | Collected files | Setup | Notes |
| --- | --- | --- | --- |
| ketcher-core | only `__tests__/**/*.{test,spec}.{ts,js}` (`jest.config.js` `testMatch`, `fixtures/` ignored): mostly the package-root `__tests__/` mirroring `src/`, plus `src/**/__tests__/` | `jest.setup.js` mocks `paper` | a `.test.tsx` never runs; `jest-mock-extended` for mocks; KET fixtures in `__tests__/domain/serializers/ket/fixtures/` |
| ketcher-react | `src/**/*.{test,spec}.{js,jsx,ts,tsx}`, co-located | `jest.setup.js` (mocks `paper`, `ResizeObserver`), `src/setupTests.ts` (jest-dom) | imports the **built** `ketcher-core`; `.less/.css/.sdf` → `identity-obj-proxy` |
| ketcher-macromolecules | `src/**/*.{test,spec}.{js,jsx,ts,tsx}`, co-located | `jest.setup.js` (mocks `paper`), `src/setupTests.tsx`: globals `withThemeProvider`, `withThemeAndStoreProvider` | imports the **built** `ketcher-core`; `ketcher-react` and `react-contexify` mocked from `src/testMocks/` |
| ketcher-standalone | none — it has no jest config | — | `jest --passWithNoTests` |

The three configs that exist set `cache: false` and `testEnvironment: 'jsdom'`, so each run is cold.

ESLint's flat config ignores `**/*.{test,spec}.*`, `**/__tests__/**`, `**/setupTests.*` and
`**/testMocks/**`: **no test file is linted**, by CI or by `/ketcher-verify`. Prettier and `tsc` do
cover them.

Prerequisites: react and macromolecules tests need `packages/ketcher-core/dist` (`npm run build:core`);
core tests that load the KET validator need the generated schema on a fresh clone
(`npm run ajv -w ketcher-core`).

## Commands

| Goal | Command |
| --- | --- |
| check what you changed | `node .claude/skills/ketcher-verify/scripts/verify.mjs` (`/ketcher-verify`): Prettier, ESLint, Stylelint, `tsc` and the related Jest tests for the changed files only |
| one test file | `npx jest <path>` from the package directory |
| update one file's snapshots | `npx jest <path> -u`, then read the snapshot diff |
| one package's CI gate | `npm test -w packages/<name>` |
| types in every workspace | `npm run test:types` |
| everything `ci.yml` runs for the packages | `npm test` from the root |

`npm test` is not "run the unit tests": each package's `test` script chains `prettier --check`,
Stylelint (react, macromolecules), `eslint --quiet`, `tsc --noEmit`, `dpdm` (core, react) and Jest.
It takes minutes and prints thousands of lines.

## Expectations for a Change

- A model change: a unit test that executes the command or action, then its inverse, and compares
  the resulting state (A2, B1).
- A serializer change: a KET round trip (B2) and a fixture for the new field.
- A user-visible feature: E2E coverage of the basic flow, undo/redo, file round trip and mode
  switching where they apply — see
  [testing-e2e.md](./testing-e2e.md#expectations-for-new-features).
- Run the tests you wrote, and report the command and its result.
