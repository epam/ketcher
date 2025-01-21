import { Peptides } from '@constants/monomers';
import { test } from '@playwright/test';
import {
  addSingleMonomerToCanvas,
  waitForPageInit,
  takeEditorScreenshot,
  selectMacroBond,
} from '@utils';
import { MacroBondTool } from '@utils/canvas/tools/selectNestedTool/types';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';
import { bondTwoMonomers } from '@utils/macromolecules/polymerBond';

test.describe('Check attachment point hover', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test('Move monomer bonded with another monomers and hover attachment points', async ({
    page,
  }) => {
    const MONOMER_NAME = Peptides.Tza;
    const MONOMER_ALIAS = 'Tza';
    const coordinatesStart = { x: 300, y: 300 };
    const peptide1 = await addSingleMonomerToCanvas(
      page,
      MONOMER_NAME,
      MONOMER_ALIAS,
      coordinatesStart.x,
      coordinatesStart.y,
      0,
    );
    const coordinatesEnd = { x: 400, y: 400 };
    const peptide2 = await addSingleMonomerToCanvas(
      page,
      MONOMER_NAME,
      MONOMER_ALIAS,
      coordinatesEnd.x,
      coordinatesEnd.y,
      1,
    );

    await selectMacroBond(page, MacroBondTool.SINGLE);
    await bondTwoMonomers(page, peptide1, peptide2);

    const bondLine = page
      .locator('g[class="drawn-structures"]')
      .locator('g')
      .first();
    const loopHoverCount = 10;
    const delta = 100;
    for (let index = 0; index < loopHoverCount; index++) {
      await bondLine.hover();
      await page.mouse.move(delta, delta);
    }
    await takeEditorScreenshot(page);
  });
});
