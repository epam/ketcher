import { Page, test } from '@playwright/test';
import {
  selectTopPanelButton,
  TopPanelButton,
  takeEditorScreenshot,
  openFile,
  pressButton,
  waitForLoad,
  getCoordinatesOfTheMiddleOfTheScreen,
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
});
