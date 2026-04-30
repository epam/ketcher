# CLAUDE.md

This file provides guidance to Claude Code (`claude.ai/code`) when working with code in this repository.

## What is Ketcher

Ketcher is an open-source **chemical structure editor** built with TypeScript and React. It renders molecules, reactions, macromolecules, and monomers using a custom MVC architecture over SVG.

## Ketcher Test Conventions

- Imports should come from aliases defined in `ketcher-autotests/tsconfig.json`: `@fixtures`, `@utils`, and `@tests/...`. Do not use deep relative imports.
- The default test entrypoint is `import { Page, test, expect } from '@fixtures';`. `@fixtures` already merges molecules, flex, snake, and sequence canvas fixtures.
- Generated autotests must reuse existing page objects from `ketcher-autotests/tests/pages` and helpers from `ketcher-autotests/tests/utils` whenever possible.
- If a required page object or helper does not exist, create a reusable file under `ketcher-autotests/tests/pages/...` or `ketcher-autotests/tests/utils/...`. Do not inline long selector chains or duplicate behavior in the spec.

### Test structure

- Prefer one `test.describe()` block per file.
- Prefer `let page: Page;` at file scope plus `test.beforeAll(async ({ initMoleculesCanvas | initFlexCanvas | initSnakeCanvas | initSequenceCanvas }) => { page = await ...(); })`.
- Close the browser page in `test.afterAll(async ({ closePage }) => { await closePage(); })`.
- Use `initMoleculesCanvas` for micro-mode tests, `initFlexCanvas` for macro flex tests, `initSnakeCanvas` for snake mode, and `initSequenceCanvas` for sequence mode.
- Do not call `waitForPageInit(page)` in tests that already use `init*Canvas` fixtures. Those fixtures create the page, open the app, and apply the canvas mode setup for you.
- Use direct `page` fixture plus `waitForPageInit(page)` mainly for API tests and low-level cases that should not use the canvas presets.

### Canvas and mode setup

- Use `CommonTopRightToolbar(page).turnOnMacromoleculesEditor()` and `turnOnMicromoleculesEditor()` instead of raw mode-switcher clicks.
- Use `MacromoleculesTopToolbar(page)` for layout and polymer switching. Existing helpers include `selectLayoutModeTool(LayoutMode.Flex | Snake | Sequence)`, `rna()`, `dna()`, and `peptides()`.
- For reload/state-persistence tests, prefer existing helpers such as `pageReload(page)`, `pageReloadMicro(page)`, and `clearLocalStorage(page)` from `@utils/common/helpers`.

### Preferred interaction helpers

- For loading structures, prefer helpers from `@utils` such as `openFileAndAddToCanvasAsNewProject`, `openFileAndAddToCanvasAsNewProjectMacro`, `pasteFromClipboardAndAddToCanvas`, and `pasteFromClipboardAndAddToMacromoleculesCanvas`.
- For canvas selection and keyboard operations, prefer `selectAllStructuresOnCanvas`, `copyToClipboardByKeyboard`, `pasteFromClipboardByKeyboard`, `undoByKeyboard`, and related helpers.
- For locating rendered objects, prefer repo helpers such as `getAtomLocator(...)`, `getMonomerLocator(...)`, `getAbbreviationLocator(...)`, and existing page objects.
- For dialogs, toolbars, context menus, and library interactions, use page objects under `tests/pages/...` rather than ad hoc locators.
- Use direct `page.evaluate(...)` only for Ketcher API calls, localStorage checks, or browser APIs that are not already wrapped by helpers.

### Assertions and snapshots

- Use standard Playwright assertions for state and text: `toBeVisible`, `toContainText`, `toHaveAttribute`, `toBeTruthy`, `toEqual`, and similar.
- Use screenshot helpers from `@utils` when the expected result is visual: `takeElementScreenshot`, `takeEditorScreenshot`, `takeTopToolbarScreenshot`, `takePageScreenshot`, and related helpers.
- Prefer state assertions over screenshots when the behavior can be checked reliably through DOM state, attributes, text, or API output.
- When using screenshots in macro mode, existing helpers already handle common details like padding, masking, hidden preview popups, and hidden scrollbars.

### Naming and comment block

- Each `test()` title must be a plain English sentence that starts with the serial number from the checklist item, for example `Case 1 - ...` or `1. ...`, matching the local style of the target file.
- Every generated autotest must include a comment block above the test body with:
    - link to the test request issue
    - description
    - scenario steps
    - milestone version

### What to avoid

- Do not introduce new libraries.
- Do not duplicate selectors that already exist in page objects or utils.
- Do not hardcode sleeps when an existing wait helper or UI state check can be used.
- Do not create new helpers for one-off behavior unless the behavior is genuinely reusable across tests.

Example:

```ts
import { Page, test, expect } from '@fixtures';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { MonomerOption } from '@tests/pages/constants/contextMenu/Constants';
import { drawBenzeneRing } from '@tests/pages/molecules/BottomToolbar';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { selectAllStructuresOnCanvas } from '@utils';

let page: Page;

test.describe('Autotests: generated example', () => {
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });

  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('Case 1 - Copy action stays enabled for selected microstructure after switching to Macro mode', async () => {
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
    await drawBenzeneRing(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await selectAllStructuresOnCanvas(page);

    const targetAtom = getAtomLocator(page, { atomLabel: 'C' }).first();
    await expect(
      ContextMenu(page, targetAtom).isOptionEnabled(MonomerOption.Copy),
    ).resolves.toBeTruthy();
  });
});
```
