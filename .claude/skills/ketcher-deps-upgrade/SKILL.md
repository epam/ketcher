---
name: ketcher-deps-upgrade
description: "Upgrade, add or audit npm dependencies in the Ketcher workspaces: the version groups that must move together, peer conflicts hidden by legacy-peer-deps, nested installs, and what to rebuild and re-test."
argument-hint: "<package[@version]> | audit"
---

# Dependency work in the Ketcher monorepo

Target: **$ARGUMENTS**. Conventions: `.claude/rules/build-and-deps.md`.

## Versions that move together

Bumping one member of a group alone produces a build that installs, compiles, and then fails
somewhere far away.

| Group | Where the versions live |
| --- | --- |
| Playwright | root `package.json` (`@playwright/test`, `playwright`, `playwright-core`), `ketcher-autotests/package.json`, the image tag `mcr.microsoft.com/playwright:v<ver>-jammy` in `ketcher-autotests/Dockerfile` and `.github/workflows/run-tests*.yml` — the Linux baselines are rendered by that image |
| Node | `.nvmrc`, every `engines.node`, `node-version` in `.github/workflows/ci.yml`, `ketcher-autotests/Dockerfile-ketcher`, the `node:24` job containers |
| TypeScript | `typescript` in every workspace; `@typescript-eslint/*` accepts only `<6.1.0`; dpdm carries its own TypeScript 5.9 |
| ESLint | `eslint` pinned exactly in the root, each package and root `overrides`; `eslint-plugin-import`, `jsx-a11y` and `react` declare peers only up to ESLint 9 |
| Babel | Babel 8 in the packages; `@rollup/plugin-babel` declares a `@babel/core ^7` **peer**, `@svgr/rollup` bundles its own Babel 7 as a dependency; CRA in example/demo hoists Babel 7 to the root |
| Jest | Jest 30 in core, react and macromolecules, 29 in standalone; `ts-jest` 29; `@types/jest` 27 (example), 29 and 30; `jest-mock-extended` 2 expects Jest ≤ 29 |
| Rollup | Rollup 2.80 with plugins at majors that end at Rollup 2 (`commonjs` 16, `node-resolve` 10/15, `replace` 2/5, `rollup-plugin-typescript2` 0.31/0.37, `web-worker-loader`) — a Rollup upgrade is a project, not a bump |
| Indigo | `indigo-ketcher`, pinned exactly in `packages/ketcher-standalone/package.json`; its WASM API must contain every function the worker calls |
| React | peers `^18.2.0 \|\| ^19.0.0` in react and macromolecules; the apps run React 19 |
| Less | Less 3 in the package builds, Less 4 in the example (Vite dev) — they compile division differently |
| Stylelint | `stylelint` 17 with `stylelint-config-standard-less`, whose peer range is `^16` |

## Procedure

1. **Inventory.** Every `package.json` that declares the package (skip `node_modules`), and the
   resolved versions: `npm ls <name>` when `node_modules` exists, otherwise grep
   `package-lock.json` for `"node_modules/<name>"` with two lines of context. Never read the 1.9 MB
   lockfile whole.
2. **Peers and engines of the target.** `npm view <name>@<version> peerDependencies engines`.
   `.npmrc` sets `legacy-peer-deps=true`, so npm will not report a conflict — you have to.
3. **Change every declaration** to the same range, then install **at the root** (`npm install`).
   Never install inside a package directory. `example-ssr/` has its own lockfile and
   `ketcher-autotests/` a stale one used only by its Docker image; update them only on purpose.
4. **Look for duplicates.** `npm ls <name>` — a nested second version means a workspace still pins
   another range, or a dependency cannot accept the new one.
5. **Rebuild and test.** `npm run build:packages`, then the full `npm test` — this is the case it
   exists for — and, for anything that renders or touches the UI, an E2E smoke run in Docker (the
   `ketcher-e2e-run` skill). For a runtime dependency compare `dist` sizes before and after.
6. **Audit.** Runtime: `npm audit --omit=dev --audit-level=high`; CI gates on
   `npm audit --all --audit-level=critical`.

## Report

The declarations changed, the lockfile delta (entries added and removed), `npm ls` before and
after, peer ranges checked, test and build results, bundle size delta, and what was not verified.
A new dependency needs a sentence on why the existing stack could not do the job.
