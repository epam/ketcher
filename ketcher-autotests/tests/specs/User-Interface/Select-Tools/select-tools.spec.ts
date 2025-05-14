import { expect, test } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  BondType,
  waitForPageInit,
  takeEditorScreenshot,
  drawBenzeneRing,
  clickOnAtom,
  openFileAndAddToCanvas,
  selectAllStructuresOnCanvas,
} from '@utils';
import { getBondByIndex } from '@utils/canvas/bonds';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { selectRingButton } from '@tests/pages/molecules/BottomToolbar';

test.describe('Select tools tests', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('when add molecula and choose select tools and move cursor to edge it should show specific pointer', async ({
    page,
  }) => {
    await selectRingButton(page, 'Benzene');
    await clickInTheMiddleOfTheScreen(page);

    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    const point = await getBondByIndex(page, { type: BondType.SINGLE }, 0);
    await page.mouse.move(point.x, point.y);

    const cursor = await page.getByTestId('canvas').getAttribute('cursor');
    expect(cursor).toBe('all-scroll');
    await takeEditorScreenshot(page);
  });

  test('When the structure is pasted or dragged', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-8939
      Select 'Benzene' from Templates
      Paste it on canvas
      Select 'Benzene' from Templates and paste over 'Benzene'
      Place two 'Benzene' on the canvas and drag one onto the other
    */
    await drawBenzeneRing(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Fragment,
    );
    const atomWithQueryFeatures = 4;
    await clickOnAtom(page, 'C', atomWithQueryFeatures);
    await takeEditorScreenshot(page);
  });

  test('Attachment points are highlited with CTRL+A', async ({ page }) => {
    /*
      Test case: https://github.com/epam/ketcher/issues/4043
      Description: Attachment points are highlited with CTRL+A
      Note: At the moment the test is not working correctly until bug is fixed. Attachment points are not fully highlited.
    */
    await openFileAndAddToCanvas('KET/chain-with-attachment-points.ket', page);
    await selectAllStructuresOnCanvas(page);
    await takeEditorScreenshot(page);
  });
});
