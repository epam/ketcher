---
paths:
  - "packages/**/__tests__/**"
  - "packages/**/*.test.{ts,tsx,js,jsx}"
  - "packages/*/jest.config.js"
  - "packages/*/jest.setup.js"
  - "packages/*/src/setupTests.{ts,tsx}"
description: "Jest unit tests in the packages: what is collected, how to run one file, prerequisites"
---

# Unit tests (Jest)

Levels, per-package layout and commands: [.memory-bank/testing.md](../../.memory-bank/testing.md).
Writing procedure and exemplar tests: the `ketcher-unit-tests` skill.

- Run one file from its package: `npx jest <path>`; `/ketcher-verify` runs the tests related to the
  changed files. `npm test` is not a test runner here (see `CLAUDE.md`).
- What is collected: core — only `__tests__/**/*.{test,spec}.{ts,js}` (a `.tsx` test never runs);
  react and macromolecules — `src/**/*.{test,spec}.{js,jsx,ts,tsx}`. A test outside that pattern is
  silently never run: confirm the new file appears in `npx jest --listTests`.
- react and macromolecules import the built `ketcher-core`: `npm run build:core` once before running
  them. On a fresh clone core needs its KET schema compiled: `npm run ajv -w ketcher-core`.
- Every config sets `cache: false`, so each run is cold — do not loop over the whole suite.
- Test behaviour through the public surface: execute a command/action and its inverse and compare
  state, round-trip a serializer, render a component and drive it with user events. Not private
  fields.
- Update snapshots only for the file you changed (`npx jest <path> -u`) and read the snapshot diff
  before accepting it.
