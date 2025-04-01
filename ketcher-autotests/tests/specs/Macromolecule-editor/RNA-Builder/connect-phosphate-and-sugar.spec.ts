import { test } from '@playwright/test';
import { waitForPageInit } from '@utils/common';
import {
  openFileAndAddToCanvasMacro,
  selectMacroBond,
  takeEditorScreenshot,
} from '@utils';
import { waitForMonomerPreview } from '@utils/macromolecules';
import { bondTwoMonomers } from '@utils/macromolecules/polymerBond';
import { MacroBondTool } from '@utils/canvas/tools/selectNestedTool/types';

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

    await selectMacroBond(page, MacroBondTool.SINGLE);

    const firstRsp = page.locator('use[href="#phosphate"]').first();
    const sugar = page.locator('use[href="#sugar"]');

    await bondTwoMonomers(page, firstRsp, sugar);

    const bondLine = page.locator('g[pointer-events="stroke"]').nth(1);

    bondLine.hover();
    await waitForMonomerPreview(page);
    await takeEditorScreenshot(page);
  });
});
