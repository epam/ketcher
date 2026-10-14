# Testing

> What is the project's testing strategy?

## Testing Levels

The project uses three levels of testing:

### 1. Unit Tests (Jest)

Each package has its own Jest configuration. Tests live in `__tests__/` directories alongside source code.

- **ketcher-core**: `packages/ketcher-core/__tests__/` and `packages/ketcher-core/src/**/__tests__/`
  - Tests domain entities, serializers, helpers, and utilities
  - Config: `packages/ketcher-core/jest.config.js`
- **ketcher-react**: `packages/ketcher-react/src/__tests__/`
  - Tests React components and editor utilities
  - Config: `packages/ketcher-react/jest.config.js`
- **ketcher-macromolecules**: `packages/ketcher-macromolecules/src/**/*.test.tsx`
  - Tests Redux slices, hooks, and components
  - Config: `packages/ketcher-macromolecules/jest.config.js`
- **ketcher-standalone**: minimal unit tests

Run all unit tests: `npm run test` (from root)
Run type checks: `npm run test:types`

### 2. End-to-End Tests (Playwright)

All E2E tests live in `ketcher-autotests/`. This is a separate npm workspace.

- **Framework**: Playwright (`@playwright/test` ^1.59.1)
- **Browser**: Chromium only (headless)
- **Config**: `ketcher-autotests/playwright.config.ts`
- **Test file naming**: `*.spec.ts`

### 3. Type Checking

TypeScript type checks run separately per package: `npm run test:types --workspaces`

---

## E2E Test Architecture

### Directory Layout

| Path                                               | Purpose                                                                                                   |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `ketcher-autotests/constants/`                     | Top-level constants: URLs, mode names, env key names                                                      |
| `tests/fixtures/fixtures.ts`                       | Merged root fixture — always import `test`/`expect` from `@fixtures`                                      |
| `tests/fixtures/coreFixtures.ts`                   | Page lifecycle: `createPage`, `closePage`, `ketcher` worker state                                         |
| `tests/fixtures/commonPageObjectFixtures.ts`       | Toolbar POMs injected as worker fixtures                                                                  |
| `tests/fixtures/utilsFixtures.ts`                  | Utility helpers (`clearLocalStorage`, `resetZoomLevelToDefault`, …) as fixtures                           |
| `tests/fixtures/canvas/moleculesCanvasFixtures.ts` | `MoleculesCanvas` (beforeEach cleanup) + `initMoleculesCanvas` (beforeAll init)                           |
| `tests/fixtures/canvas/flexCanvasFixtures.ts`      | `FlexCanvas` + `initFlexCanvas`                                                                           |
| `tests/fixtures/canvas/snakeCanvasFixtures.ts`     | `SnakeCanvas` + `initSnakeCanvas`                                                                         |
| `tests/fixtures/canvas/sequenceCanvasFixtures.ts`  | `SequenceCanvas` + `initSequenceCanvas`                                                                   |
| `tests/pages/common/`                              | Shared toolbar and dialog POMs (`CommonTopLeftToolbar`, `SaveStructureDialog`, …)                         |
| `tests/pages/macromolecules/`                      | Macromolecule editor POMs (`Library`, `MacromoleculesTopToolbar`, …)                                      |
| `tests/pages/molecules/`                           | Micromolecule editor POMs (`BottomToolbar`, `TopRightToolbar`, …)                                         |
| `tests/pages/constants/`                           | Typed enum constants per UI area (monomer names, layout modes, file formats, …)                           |
| `tests/utils/canvas/`                              | Canvas interactions: screenshots, drag-select, atom/bond locators                                         |
| `tests/utils/clicks/`                              | Mouse helpers: `clickOnCanvas`, `dragMouseTo`, coordinate utilities                                       |
| `tests/utils/common/loaders/`                      | Async wait helpers: `waitForRender`, `waitForPageInit`, `waitForIndigoToLoad`, `waitForSpinnerFinishedWork` |
| `tests/utils/files/`                               | File I/O: `openFile`, `verifyFileExport`, `saveToFile`, `receiveFileComparisonData`                       |
| `tests/utils/formats/`                             | Ketcher API wrappers: `getKet`, `getMolfile`, `getSmiles`, `setMode`, …                                   |
| `tests/utils/keyboard/`                            | Keyboard helpers: `deleteByKeyboard`, `undoByKeyboard`, `resetZoomLevelToDefault`                         |
| `tests/utils/macromolecules/`                      | Monomer/bond helpers: `getMonomerLocator`, `bondTwoMonomers`, `connectMonomersWithBonds`                  |
| `tests/utils/selectors/`                           | Structure selection utilities                                                                             |
| `tests/utils/testAnnotations/`                     | `markResetToDefaultState` / `processResetToDefaultState`                                                  |
| `tests/specs/`                                     | All test files (`*.spec.ts`)                                            |
| `tests/test-data/`                                 | Test fixture files (`.ket`, `.mol`, `.rxn`, `.png`, …); paths are relative to this dir                    |
| `tests/typings.d.ts`                               | Global type augmentation: `window.ketcher: Ketcher`                                                       |

### Path Aliases (tsconfig.json)

| Alias                         | Resolves to                  |
| ----------------------------- | ---------------------------- |
| `@fixtures`                   | `tests/fixtures/fixtures.ts` |
| `@utils`                      | `tests/utils/index.ts`       |
| `@utils/*`                    | `tests/utils/*`              |
| `@tests/*`                    | `tests/*`                    |
| `@constants` / `@constants/*` | `constants/`                 |

Always use these aliases. Never use relative `../../` paths from test files.

---

## How to Run E2E Tests

### Prerequisites

1. Build and serve Ketcher from repo root:
   ```sh
   npm ci
   npm run build
   npm run serve        # default port 4002
   ```

### Run Commands (from `ketcher-autotests/`)

```sh
# Run in debug mode (opens Playwright UI)
npm run test:debug -- /path-to-test-file.spec.ts
or
npm run test:debug -- /path-to-test-file.spec.ts:line-number

```

### Docker (snapshot generation)

Snapshots are OS-specific. Always generate and commit Linux snapshots via Docker:

```sh
npm run docker:build         # Build images
npm run docker:test          # Run chromium project
npm run docker:test-popup    # Run chromium-popup project
npm run docker:update file_name:N   # Regenerate single test snapshot
npm run docker:update-popup file_name:N   # Regenerate single test snapshot
```

### Local run caveats

- **Verify the served build contains the change under test** before running bug-fix E2E specs — rebase onto latest master, rebuild and re-serve. A control that is enabled but does nothing can mask a fix that isn't actually in the build.
- **Screenshot/snapshot tests only pass where Linux baselines exist.** On macOS they fail with `A snapshot doesn't exist … -darwin.png` because baselines are generated via Docker. Run the screenshot suite through Docker (or CI); don't treat local `-darwin.png` misses as real regressions.
- **`GENERATE_DATA=true` rewrites many expected files** under `tests/test-data/`. If that was unintended, restore them with `git checkout`.

### Playwright Projects

| Project name     | Test match                               | Viewport | Base URL       |
| ---------------- | ---------------------------------------- | -------- | -------------- |
| `chromium`       | everything except `**/Chromium-popup/**` | 1280×720 | full-scale URL |
| `chromium-popup` | `**/Chromium-popup/**` only              | 1280×720 | popup URL      |

Important! Always create new tests in chromium-popup project. chromium project is for legacy tests only.

---

## Fixture System

All tests import `test` and `expect` from `@fixtures`, not from `@playwright/test` directly.

```ts
import { test, expect, Page } from '@fixtures';
```

### Two Page-Sharing Patterns

#### Pattern A — shared page per suite (recommended for speed)

Uses `initFlexCanvas` / `initMoleculesCanvas` etc. to create one page for the whole `describe` block. Canvas cleanup happens inside the canvas fixture's `afterEach`-equivalent.

```ts
let page: Page;

test.beforeAll(async ({ initFlexCanvas }) => {
  page = await initFlexCanvas();
});

test.beforeEach(async ({ FlexCanvas: _ }) => {
  // _ triggers canvas fixture: clear canvas, reset zoom, clear localStorage
});

test.afterAll(async ({ closePage }) => {
  await closePage();
});

test('some test', async () => {
  // use outer `page` variable — no page argument
});
```

**When to use**: Test suites with many tests that share the same editor mode.

#### Pattern B — per-test page (simpler, but slower)

Uses `{ page }` from Playwright fixture directly with `waitForPageInit` in `beforeEach`.

```ts
test.beforeEach(async ({ page }) => {
  await waitForPageInit(page);
  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
});

test('some test', async ({ page }) => {
  // page argument used directly
});
```

**When to use**: Small suites, isolated tests, or tests that need a fresh page each time.

**Choosing between A and B.** Pattern A reuses one page for the whole suite, so it is fast — but the canvas fixtures only reset the canvas, zoom, localStorage and settings; they do **not** fully reset the undo/redo history (some cleanup steps leave entries behind), and other subtle editor state can persist across tests. Use Pattern B when a test asserts on undo/redo stack depth or boundaries, or otherwise depends on a fully clean editor state — the extra per-test page-init cost is worth the isolation.

### Canvas Fixtures (what they do)

| Fixture           | `beforeEach` setup                                                                   | `afterEach` teardown                                                   |
| ----------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| `MoleculesCanvas` | Switch to micro editor, clear canvas, reset zoom, reset settings, clear localStorage | —                                                                      |
| `FlexCanvas`      | Switch to macro editor, select Flex layout                                           | Clear canvas, Escape, wait for banners, reset zoom, clear localStorage |
| `SnakeCanvas`     | Switch to macro editor, select Snake layout                                          | (similar to Flex)                                                      |
| `SequenceCanvas`  | Switch to macro editor, select Sequence layout                                       | (similar to Flex)                                                      |

**Caveat — history entries from fixture cleanup:** the `resetSettingsValuesToDefault` step of the canvas fixtures leaves **one entry in the undo/redo stack** (verified 2026-10-09: `clearCanvas` and `resetZoomLevelToDefault` leave none). Tests that assert undo/redo stack boundaries (e.g. "undo button disabled at history start") must account for this extra entry — loop until the button is disabled rather than hardcoding the expected undo count.

### `initXxxCanvas` Worker Fixtures

Each canvas fixture also provides an `initXxxCanvas` worker fixture that creates a fresh page already initialized in the right mode. Used only in `test.beforeAll`.

---

## Page Object Model (POM)

All UI interactions **and assertions** go through POM objects. Never use raw `page.locator` / `page.getByTestId` in test files for reusable UI elements — including state checks like `expect(page.getByTestId('undo')).toBeDisabled()`. Use the locator the POM already exposes (e.g. `expect(CommonTopLeftToolbar(page).undoButton).toBeDisabled()`).

### POM Style: factory function, not class

POMs are plain factory functions that return objects with named locators and methods:

```ts
export const CommonTopLeftToolbar = (page: Page) => {
  const locators = {
    clearCanvasButton: page
      .getByTestId('clear-canvas')
      .filter({ has: page.locator(':visible') }),
    // …
  };

  return {
    ...locators,

    async clearCanvas() {
      await locators.clearCanvasButton.click();
    },
    // …
  };
};

export type CommonTopLeftToolbarType = ReturnType<typeof CommonTopLeftToolbar>;
```

### Locator Best Practices

- **Always prefer `getByTestId`** over CSS selectors, text, or role selectors where `data-testid` attributes exist.
- Filter for visible elements: `.filter({ has: page.locator(':visible') })` when a testId can match multiple elements (e.g. dual-mode toolbars).
- Use `.nth(index)` only when there is genuinely more than one expected match.
- Avoid `page.locator('.css-class')` in new POMs — CSS classes are unstable.

### POM File Locations

| Area                  | Path                                        |
| --------------------- | ------------------------------------------- |
| Shared toolbars       | `tests/pages/common/`                       |
| Macromolecule editor  | `tests/pages/macromolecules/`               |
| Micromolecule editor  | `tests/pages/molecules/`                    |
| Typed constants/enums | `tests/pages/constants/<area>/Constants.ts` |
| Monomer enum catalogs | `tests/pages/constants/monomers/`           |

---

## Key Utility Functions

### Initialization / Loading

| Function                               | Purpose                                                                     |
| -------------------------------------- | --------------------------------------------------------------------------- |
| `waitForPageInit(page)`                | Navigate to `''`, wait for `window.ketcher`, wait for Indigo button enabled |
| `waitForKetcherInit(page)`             | Wait for `window.ketcher` to exist                                          |
| `waitForIndigoToLoad(page)`            | Wait for aromatize button to be enabled (Indigo WASM ready)                 |
| `waitForRender(page, cb)`              | Run `cb`, then wait for `renderComplete` custom event (250 ms timeout)      |
| `waitForSpinnerFinishedWork(page, cb)` | Run `cb`, wait for all loading spinners to detach, then `waitForRender`     |

### Canvas Screenshots

| Function                                                                  | Purpose                                  |
| ------------------------------------------------------------------------- | ---------------------------------------- |
| `takeEditorScreenshot(page)`                                              | Screenshot of the visible canvas element |
| `takePageScreenshot(page)`                                                | Full page screenshot                     |
| `takeElementScreenshot(page, locator)`                                    | Screenshot of a specific element         |
| `takeMonomerLibraryScreenshot(page)`                                      | Screenshot of the monomer library panel  |
| `takeEditorScreenshot(page, { hideMacromoleculeEditorScrollBars: true })` | Hides scrollbars before screenshotting   |

All screenshot functions accept `maxDiffPixelRatio` and `maxDiffPixels` options for tolerance.

### File I/O

| Function                                                       | Purpose                                                                      |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `openFileAndAddToCanvas(page, filename)`                       | Open file via dialog, add to canvas at center                                |
| `openFileAndAddToCanvasAsNewProject(page, filename)`           | Open file as new project                                                     |
| `openFileAndAddToCanvasMacro(page, filename, structureFormat)` | Open file with explicit format selection                                     |
| `verifyFileExport(page, expectedFilename, fileType)`           | Export from Ketcher API, compare to stored expected file                     |
| `receiveFileComparisonData(...)`                               | Low-level: get file content from Ketcher API + read expected file            |
| `saveToFile(filename, data)`                                   | Write expected file (only when `GENERATE_DATA=true` or `--update-snapshots`) |

All test data files live in `tests/test-data/`. Paths passed to these helpers are **relative to that directory**.

### Mouse / Keyboard

| Function                              | Purpose                                                     |
| ------------------------------------- | ----------------------------------------------------------- |
| `clickOnCanvas(page, x, y, { from })` | Click at canvas-relative coordinates; wraps `waitForRender` |
| `clickInTheMiddleOfTheCanvas(page)`   | Click at canvas center                                      |
| `dragMouseTo(page, x, y)`             | Mouse down → move → up with `waitForRender`                 |
| `copyToClipboardByKeyboard(page)`     | Ctrl+C wrapped in `waitForSpinnerFinishedWork`              |
| `pasteFromClipboardByKeyboard(page)`  | Ctrl+V wrapped in `waitForSpinnerFinishedWork`              |
| `undoByKeyboard(page)`                | Ctrl+Z wrapped in `waitForRender`                           |
| `redoByKeyboard(page)`                | Ctrl+Shift+Z wrapped in `waitForRender`                     |
| `deleteByKeyboard(page)`              | Delete key wrapped in `waitForRender`                       |
| `keyboardPressOnCanvas(page, key)`    | Generic key press wrapped in `waitForRender`                |
| `resetZoomLevelToDefault(page)`       | Ctrl+0 wrapped in `waitForRender`                           |

### Macromolecule Utilities

| Function                                               | Purpose                                                           |
| ------------------------------------------------------ | ----------------------------------------------------------------- |
| `Library(page).dragMonomerOnCanvas(monomer, { x, y })` | Drag monomer from library to canvas coordinates                   |
| `getMonomerLocator(page, monomerOrOptions)`            | Locate monomer on canvas by alias, type, or ID                    |
| `bondTwoMonomers(page, m1, m2, ap1?, ap2?)`            | Draw a bond between two monomers; handles attachment point dialog |
| `bondTwoMonomersPointToPoint(page, m1, m2, ap1, ap2)`  | Bond with explicit attachment points                              |
| `connectMonomersWithBonds(page, names[], bondType)`    | Bond a sequence of monomers by alias                              |
| `moveMonomer(page, monomer, x, y)`                     | Select and drag a monomer                                         |

### Monomer Enum Catalogs

Monomers are defined as typed enum groups under `tests/pages/constants/monomers/`:

```ts
import { Peptide } from '@tests/pages/constants/monomers/Peptides';
import { Sugar } from '@tests/pages/constants/monomers/Sugars';
import { Base } from '@tests/pages/constants/monomers/Bases';
import { Chem } from '@tests/pages/constants/monomers/Chem';
import { Preset } from '@tests/pages/constants/monomers/Presets';

// Usage:
await Library(page).dragMonomerOnCanvas(Peptide.Tza, { x: 300, y: 300 });
const peptide1 = getMonomerLocator(page, Peptide.Tza).nth(0);
```

Each entry has `{ alias, testId }`. Always use these enums — never hardcode monomer strings.

### Editor-mode content-creation caveats

- **Micro mode — placing atoms:** use the `addAtoms(page, atom, points)` helper (`@utils/canvas/atoms/addAtoms`) — it selects the element tool once, clicks each point in turn (the tool stays active between clicks), then presses Escape and moves the mouse away. Note: typing an element symbol on the canvas does *not* place an atom; it only selects that element in the periodic-table panel.
- **Macro mode — adding monomers depends on the layout mode.** The way you place monomers/bases differs by the selected layout (`LayoutMode.Flex` / `Snake` / `Sequence`):
  - **Flex & Snake:** drag from the library with `Library(page).dragMonomerOnCanvas(monomer, { x, y })`.
  - **Sequence:** dragging from the library is not available. Add monomers by clicking on monomer card in library.

---

## Good Practices to Follow

### Async / Timing

1. **When it is needed wrap canvas-mutating actions in `waitForRender`** or use the higher-level utility functions that already do this. Never use raw `page.waitForTimeout` as a substitute.
2. **Use `waitForSpinnerFinishedWork`** whenever the action triggers a loading spinner (file open, save, structure check).
3. **Use `waitFor({ state: 'visible' })`** or `waitFor({ state: 'detached' })` to assert element presence/absence. Avoid polling with `waitForTimeout`.

### Selectors

4. **Use `getByTestId`** as the primary selector strategy. It is stable, readable, and corresponds to `data-testid` attributes in the source.
5. **Use monomer enum constants** (e.g. `Peptide.Tza`) and UI enum constants (e.g. `LayoutMode.Flex`) instead of raw strings.

### Test Structure

6. **Use the shared-page pattern (`initXxxCanvas`)** for suites with more than ~5 tests — it significantly reduces test suite execution time. Prefer a per-test page (Pattern B) instead when tests assert on undo/redo stack boundaries or need a fully clean editor state, since the shared canvas fixtures do not fully reset history.
7. **One behavior per test**. Do not pack multiple unrelated assertions into one test.
8. **Add a comment block** in each test following the standard pattern — issue link, description, numbered scenario steps, and the Ketcher version the test was written for:
   ```ts
   test('Copy action stays enabled after switching to Macro mode', async () => {
     /*
      * Test task: https://github.com/epam/ketcher/issues/9999
      * Description: Copy action stays enabled for selected microstructure after switching to Macro mode
      * Scenario:
      * 1. Draw a benzene ring in Molecules mode
      * 2. Switch to Macro mode
      * 3. Select the structure on the canvas
      * 4. Verify that Copy is enabled in the context menu
      *
      * Version 3.12.0
      */
   ```
   The `Version` line is the Ketcher release the test targets (take it from `packages/ketcher-react/package.json`, dropping any `-rc.N` suffix).
9. **Use `test.describe`** to group related tests. This enables parallel workers to efficiently schedule them.

### Screenshot Testing

Prefer **structural assertions over screenshots** for editor mode and content presence where possible: the canvas exposes a `data-canvasmode` attribute, atoms/monomers/bonds have stable test ids, and toolbar buttons expose disabled state. These are deterministic and don't depend on Docker-generated Linux snapshots — reserve screenshots for genuine visual-regression checks.

10. **Use `takeEditorScreenshot`** for canvas comparisons, not `takePageScreenshot`. Canvas screenshots are more stable across viewport changes.
11. **Add `hideMacromoleculeEditorScrollBars: true`** when macromolecule editor scroll bars might appear and affect snapshots.
12. **Add `hideMonomerPreview: true`** when monomer tooltips might appear over the screenshot area.
13. Use `maxDiffPixelRatio: 0.01` (or `maxDiffPixels`) sparingly, only for genuinely noisy UI elements.

### File Comparison

14. **Use `verifyFileExport`** for format round-trip tests. The first run (with `GENERATE_DATA=true`) generates the expected file; subsequent runs compare against it.
15. **Exclude metadata lines** via `metaDataIndexes` — lines with timestamps (`$DATM`, `-INDIGO-`, `Ketcher`) are auto-filtered.

### Reset / Teardown

16. **Use `markResetToDefaultState` + `processResetToDefaultState`** only when your test leaves the editor in a non-default state (e.g., wrong tab, open dialog, different layout mode). For simple cases, write teardown inline.
17. **Prefer `clearCanvas`** over `page.reload` in teardown — reload is much slower.

### TypeScript Discipline

18. **Use direct coordinate numbers inline** in tests — do not extract canvas coordinates into named constants (e.g. `const CARBON_1_X = 400`). Inline literals keep each test self-contained and readable, and a changed constant would silently move the setup of every test that shares it:
    ```ts
    await Library(page).dragMonomerOnCanvas(Peptide.Tza, { x: 300, y: 300 });
    ```
    (The codebase heavily uses `/* eslint-disable no-magic-numbers */` as a workaround; new tests should avoid needing it.)
19. **No `as any`** — use proper types or generics.
20. **Import `Page` and `Locator` from `@fixtures`**, not from `@playwright/test`.

---

## Anti-Patterns to Avoid

### Timing Anti-Patterns

- **`await page.waitForTimeout(N)`** as a wait for an action to complete — fragile and slow. Use `waitForRender`, `waitFor({ state })`, or structural waits instead. Raw `waitForTimeout` is only acceptable in rare edge cases (e.g. after a spinner disappears, to allow animation to settle) and must have a comment explaining why.
- **Bare `await page.keyboard.press(key)`** for canvas actions — always wrap in `waitForRender` or use `keyboardPressOnCanvas`.
- **Bare `await locator.click()`** without waiting for any result — use the POM method that wraps with the appropriate wait.
- **Clicking a disabled button via a POM method** — Playwright waits for the element to become enabled, and with `actionTimeout: 0` (no timeout) this hangs forever. To check that a control is disabled, assert `toBeDisabled()`;

### Selector Anti-Patterns

- **CSS class selectors** like `page.locator('.some-module_className__hash')` — classes are auto-generated and change with builds. Use `getByTestId` or `data-*` attributes.
- **Text-based selectors for dynamic content** — prefer `getByTestId` or attribute selectors.
- **Hardcoded monomer strings** like `page.getByTestId('A___Alanine')` — use `Peptide.A` from the constants file.
- **XPath selectors** — avoid entirely.

### Test Design Anti-Patterns

- **`beforeEach` that does too much** — in shared-page tests, `beforeEach` should only set up state that changes between tests. Heavy setup belongs in `beforeAll`.
- **`page.reload()` in `beforeEach` of a shared-page suite** — this resets the page context and loses the shared page, causing subsequent tests to fail.
- **Tests that depend on execution order** — each test in a suite must be independently executable. Use `beforeEach` / the canvas fixture for cleanup.
- **Commented-out tests or `test.skip`** left indefinitely — use `test.skip` with a comment and a tracking issue reference; do not comment out code.
- **Overly broad screenshots** — `takePageScreenshot` captures the entire page including the library panel, which is noisy. Prefer `takeEditorScreenshot` or `takeElementScreenshot`.
- **Single giant test file** (>500 lines) — split by feature or connection rule type. The `connection-rules-for-*.spec.ts` pattern is the right approach.

### Import Anti-Patterns

- **Importing directly from `@playwright/test`** in test files — always import from `@fixtures` to get the extended test object.
- **Importing POM constructors into utils** — keep a clean boundary: `utils/` contains stateless functions, `pages/` contains POMs. Utils can import from `pages/`, but POMs should not import from test files.
- **Relative imports from test files** (`../../pages/...`) — use `@tests/pages/...` aliases.

---

## Regression Testing

- E2E tests use **screenshot comparison** (`toHaveScreenshot`) for visual regressions.
- File content comparison uses `verifyFileExport` with stored reference files.
- Snapshot files: `tests/**/*.spec.ts-snapshots/<name>-chromium-linux.png`
- Snapshots are platform-specific. Linux (Docker) snapshots are committed; macOS/Windows snapshots are git-ignored.
- All PRs should run the full E2E suite against the target build via CI.

---

## Visual Regression Testing

Playwright visual comparisons (`.toHaveScreenshot()`) are used for:

- Renderer output (bond types, atom labels, S-Groups)
- Macromolecule canvas layouts (flex, snake)
- Monomer library rendering
- Dialog/panel content

Reference screenshots are stored in `ketcher-autotests/tests/**/*.spec.ts-snapshots/` directories alongside their spec files.

**Snapshot path template** (from `playwright.config.ts`):

```
{testDir}/{testFilePath}-snapshots/{arg}-{projectName}-{platform}{ext}
```

---

## Expectations for New Features

Every new feature must have e2e tests that cover:
- Basic functionality
- Undo/redo behavior (if applicable)
- File format round-trip (if applicable)
- Switching between editor modes (if applicable)

### E2E Test Plans

- Before writing a **new spec file or folder** of E2E tests, draft an E2E test plan following [e2e-test-plan-template.md](./e2e-test-plan-template.md) and get user approval before writing spec code. The template covers structure (requirements table, verified codebase facts, infrastructure, per-file test case tables, verification strategy, fixtures, phased implementation with a spike phase, open questions) and lessons learned from past planning exercises.
- **Keep `.memory-bank/testing/` current:** when you learn a reusable lesson about E2E testing or planning (a gotcha, a new helper, a pattern trade-off), add it to the right file — `testing/testing.md` for how-to-write guidance, `testing/e2e-test-plan-template.md` for planning-process lessons. Do this as you go and again when you finish writing/planning tests, so future sessions inherit the knowledge.

## Other rules to follow
- Run tests after implementation to ensure they pass and do what they are supposed to do.