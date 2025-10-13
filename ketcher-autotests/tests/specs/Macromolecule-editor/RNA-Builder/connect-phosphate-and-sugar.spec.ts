import { test } from '@fixtures';
import { waitForPageInit } from '@utils/common';
import { openFileAndAddToCanvasMacro, takeEditorScreenshot } from '@utils';
import { bondTwoMonomers } from '@utils/macromolecules/polymerBond';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { MacroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { MonomerPreviewTooltip } from '@tests/pages/macromolecules/canvas/MonomerPreviewTooltip';

test.describe('Macromolecules connect phosphate and sugar', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  });

  test('Open file and connect phosphate and sugar', async ({ page }) => {
    await openFileAndAddToCanvasMacro(
      page,
      'KET/connection-of-phosphate-and-sugar.ket',
    );

    await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);

    const firstRsp = page.locator('use[href="#phosphate"]').first();
    const sugar = page.locator('use[href="#sugar"]');

    await bondTwoMonomers(page, firstRsp, sugar);

    const bondLine = page.locator('g[pointer-events="stroke"]').nth(1);

    bondLine.hover();
    await MonomerPreviewTooltip(page).waitForBecomeVisible();
    await takeEditorScreenshot(page);
  });
});
