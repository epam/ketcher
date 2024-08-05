import { test } from '@playwright/test';
import { waitForPageInit } from '@utils/common';
import {
  openFileAndAddToCanvasMacro,
  selectSingleBondTool,
  takeEditorScreenshot,
} from '@utils';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';
import { bondTwoMonomers } from '@utils/macromolecules/polymerBond';

test.describe('Macromolecules connect phosphate and sugar', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test('Open file and connect phosphate and sugar', async ({ page }) => {
    await openFileAndAddToCanvasMacro(
      'KET/connection-of-phosphate-and-sugar.ket',
      page,
    );

    await selectSingleBondTool(page);

    const firstRsp = page.locator('use[href="#phosphate"]').first();
    const sugar = page.locator('use[href="#sugar"]');

    await bondTwoMonomers(page, firstRsp, sugar);

    const bondLine = page.locator('g[pointer-events="stroke"]').nth(1);

    bondLine.hover();

    await takeEditorScreenshot(page);
  });
});
