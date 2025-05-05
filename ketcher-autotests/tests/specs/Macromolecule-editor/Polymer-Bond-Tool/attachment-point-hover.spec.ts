import { Peptides } from '@constants/monomers/Peptides';
import { test } from '@playwright/test';
import {
  addSingleMonomerToCanvas,
  waitForPageInit,
  takeEditorScreenshot,
} from '@utils';
import { goToPeptidesTab } from '@utils/macromolecules/library';
import { bondTwoMonomers } from '@utils/macromolecules/polymerBond';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { MacroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import { CommonTopRightToolbar } from '@tests/pages/common/TopRightToolbar';

test.describe('Check attachment point hover', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await goToPeptidesTab(page);
  });

  test('Move monomer bonded with another monomers and hover attachment points', async ({
    page,
  }) => {
    const coordinatesStart = { x: 300, y: 300 };
    const peptide1 = await addSingleMonomerToCanvas(
      page,
      Peptides.Tza,
      coordinatesStart.x,
      coordinatesStart.y,
      0,
    );
    const coordinatesEnd = { x: 400, y: 400 };
    const peptide2 = await addSingleMonomerToCanvas(
      page,
      Peptides.Tza,
      coordinatesEnd.x,
      coordinatesEnd.y,
      1,
    );

    await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
    await bondTwoMonomers(page, peptide1, peptide2);

    const bondLine = page
      .locator('g[class="drawn-structures"]')
      .locator('g')
      // eslint-disable-next-line no-magic-numbers
      .nth(2);
    const loopHoverCount = 10;
    const delta = 100;
    for (let index = 0; index < loopHoverCount; index++) {
      await bondLine.hover();
      await page.mouse.move(delta, delta);
    }
    await takeEditorScreenshot(page);
  });
});
