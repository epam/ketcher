import { test } from '@playwright/test';
import {
  selectSnakeLayoutModeTool,
  takeEditorScreenshot,
  waitForPageInit,
  openFileAndAddToCanvasMacro,
  moveMouseAway,
} from '@utils';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';

test.describe('Side chain connections', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test('Open file with rna side chain connections', async ({ page }) => {
    /* 
    Github ticket: #3532 - Displaying side chain connections in snake-like mode
    Description: Open file and check how side connections look for rna chain in snake mode
    */

    await selectSnakeLayoutModeTool(page);
    await openFileAndAddToCanvasMacro(`KET/side-connections-rna.ket`, page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('Open file with peptide side chain connection', async ({ page }) => {
    /*
    Github ticket: #3532 - Displaying side chain connections in snake-like mode
    Description: Open file and check how side connections look for peptide chain in snake mode
    */

    await selectSnakeLayoutModeTool(page);
    await openFileAndAddToCanvasMacro(`KET/side-connections-peptide.ket`, page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('Open file with cycled side chain connection', async ({ page }) => {
    /*
    Github ticket: #3532 - Displaying side chain connections in snake-like mode
    Description: Open file and check how side connections look for cycled chain in snake mode
    */

    await selectSnakeLayoutModeTool(page);
    await openFileAndAddToCanvasMacro(
      `KET/side-connection-in-cycle-chain.ket`,
      page,
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });
});
