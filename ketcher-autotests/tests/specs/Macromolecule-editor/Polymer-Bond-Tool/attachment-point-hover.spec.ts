import { Peptide } from '@tests/pages/constants/monomers/Peptides';
import { test } from '@fixtures';
import { waitForPageInit, takeEditorScreenshot } from '@utils';
import { bondTwoMonomers } from '@utils/macromolecules/polymerBond';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { MacroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { Library } from '@tests/pages/macromolecules/Library';
import { getMonomerLocator } from '@utils/macromolecules/monomer';

test.describe('Check attachment point hover', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await Library(page).switchToPeptidesTab();
  });

  test('Move monomer bonded with another monomers and hover attachment points', async ({
    page,
  }) => {
    await Library(page).dragMonomerOnCanvas(Peptide.Tza, {
      x: 300,
      y: 300,
    });
    const peptide1 = getMonomerLocator(page, Peptide.Tza).nth(0);

    await Library(page).dragMonomerOnCanvas(Peptide.Tza, {
      x: 400,
      y: 400,
    });
    const peptide2 = getMonomerLocator(page, Peptide.Tza).nth(1);
    await CommonLeftToolbar(page).bondTool(MacroBondType.Single);
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
