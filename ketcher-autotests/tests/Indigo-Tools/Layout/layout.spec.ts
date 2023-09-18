import { Page, test } from '@playwright/test';
import { selectPartOfChain } from '@tests/Structure-Creating-&-Editing/Actions-With-Structures/Rotation/utils';
import {
  selectTopPanelButton,
  TopPanelButton,
  takeEditorScreenshot,
  openFile,
  pressButton,
  waitForLoad,
  getCoordinatesOfTheMiddleOfTheScreen,
  openFileAndAddToCanvas,
  waitForPageInit,
  takeTopToolbarScreenshot,
} from '@utils';

async function openFileWithShift(filename: string, page: Page) {
  await selectTopPanelButton(TopPanelButton.Open, page);
  await openFile(filename, page);
  await waitForLoad(page, async () => {
    await pressButton(page, 'Add to Canvas');
  });
  const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
  const shift = 150;
  await page.mouse.click(x + shift, y + shift);
}

test.describe('Indigo Tools - Layout', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Layout button', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1777
    Description: 'Layout' button is always active and presents in top toolbar panel.
    */
    await takeTopToolbarScreenshot(page);
  });
});

test.describe('Indigo Tools - Layout', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Layout part of chain structures', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-1798
    Description: The action is implemented for the whole canvas.
    */
    await openFileAndAddToCanvas(
      'Molfiles-V2000/chain-with-double-bond-in-the-middle.mol',
      page,
    );
    await selectPartOfChain(page);
    await selectTopPanelButton(TopPanelButton.Layout, page);
  });

  test('Center molecule after layout', async ({ page }) => {
    // Related Github issue: https://github.com/epam/ketcher/issues/2078
    await openFileAndAddToCanvas('Molfiles-V2000/benzene-rings.mol', page);
    await selectTopPanelButton(TopPanelButton.Layout, page);
  });

  test('Stereo flag is not shifted after clicking layout multiple times', async ({
    page,
  }) => {
    // Related Github issue: https://github.com/epam/ketcher/issues/3025
    const structureWithStereoFlags = 'KET/structure-with-stereo-flags.ket';
    const numberOfIterations = 3;
    await openFileWithShift(structureWithStereoFlags, page);
    for (let i = 0; i < numberOfIterations; i++) {
      await selectTopPanelButton(TopPanelButton.Layout, page);
    }
  });

  test('After applying Layout, the structure does not disappear and can be interacted with', async ({
    page,
  }) => {
    // Related Github issue: https://github.com/epam/ketcher/issues/3208
    await openFileAndAddToCanvas(
      'Molfiles-V2000/chloro-ethylamino-dimethyl-propoxy-propan-ol.mol',
      page,
    );
    await selectTopPanelButton(TopPanelButton.Layout, page);
  });
});
