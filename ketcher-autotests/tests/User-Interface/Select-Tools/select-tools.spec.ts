import { expect, test } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  RingButton,
  selectRingButton,
  selectTool,
  LeftPanelButton,
  BondType,
  waitForPageInit,
  takeEditorScreenshot,
  drawBenzeneRing,
  clickOnAtom,
  selectDropdownTool,
  openFileAndAddToCanvas,
} from '@utils';
import { getBondByIndex } from '@utils/canvas/bonds';

test.describe('Select tools tests', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('when add molecula and choose select tools and move cursor to edge it should show specific pointer', async ({
    page,
  }) => {
    await selectRingButton(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectTool(LeftPanelButton.RectangleSelection, page);
    const point = await getBondByIndex(page, { type: BondType.SINGLE }, 0);
    await page.mouse.move(point.x, point.y);

    const cursor = await page.getByTestId('canvas').getAttribute('cursor');
    expect(cursor).toBe('all-scroll');
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
    await selectDropdownTool(page, 'select-rectangle', 'select-fragment');
    const atomWithQueryFeatures = 4;
    await clickOnAtom(page, 'C', atomWithQueryFeatures);
  });

  test('Attachment points are highlited with CTRL+A', async ({ page }) => {
    /*
      Test case: https://github.com/epam/ketcher/issues/4043
      Description: Attachment points are highlited with CTRL+A
      Note: At the moment the test is not working correctly until bug is fixed. Attachment points are not fully highlited.
    */
    await openFileAndAddToCanvas('KET/chain-with-attachment-points.ket', page);
    await page.keyboard.press('Control+a');
  });
});
