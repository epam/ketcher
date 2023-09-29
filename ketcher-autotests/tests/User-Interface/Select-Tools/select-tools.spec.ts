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
} from '@utils';
import { getBondByIndex } from '@utils/canvas/bonds';
// import { drawReactionWithTwoBenzeneRings } from '@utils/canvas/drawStructures';

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
    // eslint-disable-next-line no-magic-numbers
    await clickOnAtom(page, 'C', 4);
  });
});
