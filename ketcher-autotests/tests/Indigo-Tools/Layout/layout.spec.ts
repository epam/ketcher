import { Page, test } from '@playwright/test';
import {
  selectTopPanelButton,
  TopPanelButton,
  takeEditorScreenshot,
  openFile,
  pressButton,
  waitForLoad,
  getCoordinatesOfTheMiddleOfTheScreen,
  openFileAndAddToCanvas,
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
    await page.goto('');
  });

  test('Center molecule after layout', async ({ page }) => {
    // Related Github issue: https://github.com/epam/ketcher/issues/2078
    const anyStructure = 'benzene-rings.mol';
    await openFileWithShift(anyStructure, page);
    await selectTopPanelButton(TopPanelButton.Layout, page);
    await takeEditorScreenshot(page);
  });

  test('Stereo flag is not shifted after clicking layout multiple times', async ({
    page,
  }) => {
    // Related Github issue: https://github.com/epam/ketcher/issues/3025
    const structureWithStereoFlags = 'structure-with-stereo-flags.ket';
    await openFileWithShift(structureWithStereoFlags, page);
    await selectTopPanelButton(TopPanelButton.Layout, page);
    await selectTopPanelButton(TopPanelButton.Layout, page);
    await selectTopPanelButton(TopPanelButton.Layout, page);
    await takeEditorScreenshot(page);
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
    await takeEditorScreenshot(page);
  });
});
