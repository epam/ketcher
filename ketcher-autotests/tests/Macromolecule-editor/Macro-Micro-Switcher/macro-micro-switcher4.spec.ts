/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import {
  chooseTab,
  Tabs,
  turnOnMacromoleculesEditor,
} from '@utils/macromolecules';
import { Page, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvasAsNewProject,
  selectClearCanvasTool,
  waitForPageInit,
} from '@utils';

let page: Page;

async function configureInitialState(page: Page) {
  await chooseTab(page, Tabs.Rna);
}

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  page = await context.newPage();

  await waitForPageInit(page);
  await turnOnMacromoleculesEditor(page);
  await configureInitialState(page);
});

test.afterEach(async () => {
  await selectClearCanvasTool(page);
});

test.afterAll(async ({ browser }) => {
  await Promise.all(browser.contexts().map((context) => context.close()));
});

test(`Verify that bond lines between atoms do not overlap in any angle in macro mode`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/5960
   * Description: Verify that bond lines between atoms do not overlap in any angle in macro mode
   *
   * Case: 1. Load ket file with structures
   *       2. Take screenshot to witness canvas was rendered correct
   */
  await openFileAndAddToCanvasAsNewProject(
    'KET/Micro-Macro-Switcher/Micro bonds on macro canvas.ket',
    page,
  );
  await takeEditorScreenshot(page);
});
