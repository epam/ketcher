import { test } from '@playwright/test';
import { waitForPageInit } from '@utils/common';
import { openFileAndAddToCanvasMacro, takeEditorScreenshot } from '@utils';
import { waitForMonomerPreview } from '@utils/macromolecules';
import { bondTwoMonomers } from '@utils/macromolecules/polymerBond';
import { turnOnMacromoleculesEditor } from '@tests/pages/common/TopRightToolbar';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { MacroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';

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

    await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);

    const firstRsp = page.locator('use[href="#phosphate"]').first();
    const sugar = page.locator('use[href="#sugar"]');

    await bondTwoMonomers(page, firstRsp, sugar);

    const bondLine = page.locator('g[pointer-events="stroke"]').nth(1);

    bondLine.hover();
    await waitForMonomerPreview(page);
    await takeEditorScreenshot(page);
  });
});
