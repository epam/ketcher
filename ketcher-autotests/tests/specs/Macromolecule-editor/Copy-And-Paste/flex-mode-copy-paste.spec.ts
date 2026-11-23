import { Chem } from '@tests/pages/constants/monomers/Chem';
import { test } from '@fixtures';
import {
  takeEditorScreenshot,
  waitForPageInit,
  openFileAndAddToCanvasMacro,
  zoomWithMouseWheel,
  copyFromCanvasToClipboardByKeyboard,
  pasteFromClipboardToCanvasByKeyboard,
  moveMouseAway,
} from '@utils';
import { selectRectangleArea } from '@utils/canvas/tools/helpers';
import { getMonomerLocator } from '@utils/macromolecules/monomer';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';

const startX = 300;
const startY = 300;
const endX = 600;
const endY = 600;
test.describe('Flex mode copy&paste', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor(
      LayoutMode.Flex,
    );
    const ZOOM_OUT_VALUE = 400;

    await openFileAndAddToCanvasMacro(page, 'KET/monomers-chains.ket');
    await zoomWithMouseWheel(page, ZOOM_OUT_VALUE);
  });

  test('Copy & paste selection with rectangular tool and undo', async ({
    page,
  }) => {
    await selectRectangleArea(page, startX, startY, endX, endY);
    await copyFromCanvasToClipboardByKeyboard(page);

    await page.mouse.move(200, 300);
    await pasteFromClipboardToCanvasByKeyboard(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });

    await CommonTopLeftToolbar(page).undo();
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });

  test('Copy & paste selection with Shift + Click and undo', async ({
    page,
  }) => {
    await page.keyboard.down('Shift');

    await getMonomerLocator(page, Chem.SMCC).click();
    await getMonomerLocator(page, Chem.Test_6_Ch).first().click();

    await page.keyboard.up('Shift');
    await copyFromCanvasToClipboardByKeyboard(page);

    await page.mouse.move(startX, startY);
    await pasteFromClipboardToCanvasByKeyboard(page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });

    await CommonTopLeftToolbar(page).undo();
    await moveMouseAway(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  });
});
