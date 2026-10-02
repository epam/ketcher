---
name: ketcher-verify
description: "Check a Ketcher change cheaply: Prettier, ESLint, Stylelint, tsc and the Jest tests related to the changed files only, with a compact summary. Use after editing code, instead of npm test."
argument-hint: "[--base <ref>] [--files <paths...>] [--plan] [--build] [--only|--skip <steps>]"
allowed-tools: Bash(node ${CLAUDE_SKILL_DIR}/scripts/verify.mjs*) PowerShell(node ${CLAUDE_SKILL_DIR}/scripts/verify.mjs*)
---

# Verify a Ketcher change

From the Ketcher checkout root:

```sh
node ${CLAUDE_SKILL_DIR}/scripts/verify.mjs $ARGUMENTS
```

It takes the files changed against `HEAD` — tracked and untracked; `--base <ref>` adds the commits
since that ref, `--files` names files explicitly — and runs only what they need:

| Step | Runs on | Command, as CI runs it |
| --- | --- | --- |
| prettier | changed `js/jsx/ts/tsx/json` | `prettier --check` |
| eslint | changed `js/jsx/ts/tsx/mjs/cjs`, minus what `eslint.config.mjs` ignores (every test file, `__tests__/`, `testMocks/`, `.d.ts`) and example-ssr, which has its own config | `eslint --quiet` — errors only; the count of unlinted test files is reported, because linting them would pass vacuously |
| stylelint | changed `less/css` | `stylelint` |
| tsc | each workspace with a changed `.ts/.tsx`, `tsconfig*.json` or `package.json` | `tsc --noEmit` in the workspace |
| jest | changed sources and tests of core, react, macromolecules | `jest --ci --findRelatedTests` in the package |
| circ | core and react when their TypeScript changed | the package's `test:circ` (dpdm) |

One line per step — `PASS`, `FAIL` with the first lines of the tool's output and the log path,
`BLOCK` with the missing prerequisite, `SKIP` when nothing matched. Exit code 0 — all passed; 1 — a
step failed; 2 — could not run; 3 — nothing failed, but a step was blocked (so the change is **not**
verified).

## Reading the result

- `BLOCK … needs packages/ketcher-core/dist`: react and macromolecules tests and several `tsc` runs
  resolve `ketcher-core` through its build. `--build` builds what is missing (core alone takes a few
  minutes); otherwise report the block — do not call the change verified.
- The compiled KET schema (`compiledSchema.js`) is regenerated automatically when it is missing or
  older than `schema.json`.
- Prettier failures: run `npx prettier --write <files>` — formatting is an ESLint error here, so
  never fix it by hand.
- A failure excerpt is capped (`--lines`, default 30). Read the log file around the reported lines
  instead of re-running the step with more output.
- `WARN Node … older than .nvmrc`: results can differ from CI; say so when reporting.
- `--plan` prints the commands without running anything — use it to see the scope first.

## When the full pipeline is right instead

Only when asked, or when the change touches build configuration, a `package.json`, or types shared
across packages: `npm test` from the root (all four packages, several minutes of output — redirect
it to a file and read the failures from there).
