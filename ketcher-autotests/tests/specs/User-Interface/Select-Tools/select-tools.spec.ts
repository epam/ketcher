import { expect, test } from '@fixtures';
import {
  clickInTheMiddleOfTheScreen,
  waitForPageInit,
  takeEditorScreenshot,
  clickOnAtom,
  openFileAndAddToCanvas,
} from '@utils';
import { selectAllStructuresOnCanvas } from '@utils/canvas/selectSelection';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import {
  BottomToolbar,
  drawBenzeneRing,
} from '@tests/pages/molecules/BottomToolbar';
import { RingButton } from '@tests/pages/constants/ringButton/Constants';
import { getBondLocator } from '@utils/macromolecules/polymerBond';

test.describe('Select tools tests', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('when add molecula and choose select tools and move cursor to edge it should show specific pointer', async ({
    page,
  }) => {
    await BottomToolbar(page).clickRing(RingButton.Benzene);
    await clickInTheMiddleOfTheScreen(page);

    await CommonLeftToolbar(page).areaSelectionTool(
      SelectionToolType.Rectangle,
    );
    const bondLocator = getBondLocator(page, { bondId: 7 });
    const box = await bondLocator.boundingBox();
    if (!box) throw new Error('Bond bounding box not found');

    const centerX = box.x + box.width / 2; // eslint-disable-line no-magic-numbers
    const centerY = box.y + box.height / 2; // eslint-disable-line no-magic-numbers
    await page.mouse.move(centerX, centerY);

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
    await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Fragment);
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
    await openFileAndAddToCanvas(page, 'KET/chain-with-attachment-points.ket');
    await selectAllStructuresOnCanvas(page);
    await takeEditorScreenshot(page);
  });
});
