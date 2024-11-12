/* eslint-disable no-self-compare */
/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import {
  chooseTab,
  Tabs,
  turnOnMacromoleculesEditor,
  turnOnMicromoleculesEditor,
} from '@utils/macromolecules';
import { Page, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvasAsNewProject,
  selectClearCanvasTool,
  waitForPageInit,
  selectEraseTool,
} from '@utils';
import { clickOnMicroBondByIndex } from '@utils/macromolecules/polymerBond';

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

  // Test should be skipped if related bug exists
  test.fixme(
    true === true,
    `That test results are wrong because of https://github.com/epam/ketcher/issues/5961 issue(s).`,
  );
});

test(`Verify that connections between monomers and molecules are maintained correctly in both micro and macro modes`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/5960
   * Description: Verify that connections between monomers and molecules are maintained correctly in both micro and macro modes
   *
   * Case: 1. Load ket file with structures
   *       2. Take screenshot to witness canvas was rendered correct at macro
   *       3. Switch to Micromolecules mode
   *       4. Take screenshot to witness canvas was rendered correct at micro
   */
  await openFileAndAddToCanvasAsNewProject(
    'KET/Micro-Macro-Switcher/All type of monomers connected to micro.ket',
    page,
  );
  await takeEditorScreenshot(page);

  await turnOnMicromoleculesEditor(page);
  await takeEditorScreenshot(page);

  await turnOnMacromoleculesEditor(page);
});

test(`Verify that switching between micro and macro modes displays molecules without structural changes`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/5960
   * Description: Verify that switching between micro and macro modes displays molecules without structural changes
   *
   * Case: 1. Load ket file with structures at Macro
   *       2. Take screenshot to witness canvas was rendered correct at macro
   *       3. Switch to Micromolecules mode
   *       4. Take screenshot to witness canvas was rendered correct at micro
   *       Canvases should be equal
   */
  await turnOnMicromoleculesEditor(page);
  await openFileAndAddToCanvasAsNewProject(
    'KET/Micro-Macro-Switcher/Complicated structures on the canvas.ket',
    page,
  );
  await takeEditorScreenshot(page);

  await turnOnMacromoleculesEditor(page);
  await takeEditorScreenshot(page);
});

test(`Verify that deleting a bond in macro mode removes the bond while maintaining the integrity of the surrounding structure`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/5960
   * Description: Verify that deleting a bond in macro mode removes the bond while maintaining the integrity of the surrounding structure
   *
   * Case: 1. Load ket file with structures at Macro
   *       2. Take screenshot to witness initial state
   *       3. Delete all bonds at the center of every molecule
   *       4. Take screenshot to witness final state
   */
  await openFileAndAddToCanvasAsNewProject(
    'KET/Micro-Macro-Switcher/All Bonds on Macro.ket',
    page,
  );
  await takeEditorScreenshot(page);

  await selectEraseTool(page);
  // removing single bond
  await clickOnMicroBondByIndex(page, 39);
  // removing double bond
  await clickOnMicroBondByIndex(page, 45);
  // removing single up bond
  await clickOnMicroBondByIndex(page, 51);
  // removing single down bond
  await clickOnMicroBondByIndex(page, 51);

  await takeEditorScreenshot(page);
});
