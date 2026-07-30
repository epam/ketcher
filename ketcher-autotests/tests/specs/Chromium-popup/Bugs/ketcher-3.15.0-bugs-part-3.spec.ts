import { Page, test } from '@fixtures';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { MonomerOnMicroOption } from '@tests/pages/constants/contextMenu/Constants';
import {
  MacroFileType,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  takeEditorScreenshot,
  waitForRender,
  clickInTheMiddleOfTheCanvas,
  moveMouseAway,
} from '@utils';
import { getAbbreviationLocator } from '@utils/canvas/s-group-signes/getAbbreviationLocator';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';

let page: Page;

test.describe('Autotests: ketcher-3.15.0-bugs', () => {
  test.beforeAll(async ({ initFlexCanvas }) => {
    page = await initFlexCanvas();
  });

  test.afterEach(async ({ FlexCanvas: _ }) => {});

  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('Case 1 - Monomer layout inside r-group box become corrupted if user grabs and moves bond between monomers', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9964
     * Bug: https://github.com/epam/ketcher/issues/7021
     * Description: Monomer layout inside r-group box become corrupted if user grabs and moves bond between monomers
     *
     * Scenario:
     * 1. Go to Macro - Flex mode
     * 2. Load from HELM: PEPTIDE1{A.C}$$$$V2.0
     * 3. Switch to Molecules mode
     * 4. Select the whole structure
     * 5. Grab the bond between monomers and move it aside
     * 6. Expand one or both monomers
     *
     * Expected result:
     * Monomer layout inside the R-group box remains unchanged and is not corrupted.
     *
     * Version 3.15.0
     */

    
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{A.C}$$$$V2.0',
    );

    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await waitForRender(page, async () => {});

    await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Rectangle);
    await page.keyboard.press('Control+A');
    await waitForRender(page, async () => {});

    const firstMonomer = getAbbreviationLocator(page, { id: 0 });
    const secondMonomer = getAbbreviationLocator(page, { id: 1 });

    const firstBox = await firstMonomer.boundingBox();
    const secondBox = await secondMonomer.boundingBox();

    if (firstBox && secondBox) {
      const bondX = (firstBox.x + firstBox.width / 2 + secondBox.x + secondBox.width / 2) / 2;
      const bondY = (firstBox.y + firstBox.height / 2 + secondBox.y + secondBox.height / 2) / 2;
      
      await page.mouse.move(bondX, bondY);
      await page.mouse.down();
      await page.mouse.move(bondX + 100, bondY);
      await page.mouse.up();
      await waitForRender(page, async () => {});
    }

    await moveMouseAway(page);
    await clickInTheMiddleOfTheCanvas(page);
    await waitForRender(page, async () => {});

    const firstMonomerAfterMove = getAbbreviationLocator(page, { id: 0 });
    await ContextMenu(page, firstMonomerAfterMove).click(
      MonomerOnMicroOption.ExpandMonomer,
    );
    await waitForRender(page, async () => {});

    const secondMonomerAfterMove = getAbbreviationLocator(page, { id: 1 });
    await ContextMenu(page, secondMonomerAfterMove).click(
      MonomerOnMicroOption.ExpandMonomer,
    );
    await waitForRender(page, async () => {});

    await takeEditorScreenshot(page, {
      maxDiffPixelRatio: 0.02,
    });
  });
});