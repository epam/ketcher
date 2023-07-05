import { test } from '@playwright/test';
import {
  selectTopPanelButton,
  TopPanelButton,
  takeEditorScreenshot,
  openFileAndAddToCanvas,
} from '@utils';

test.describe('Open UTF-8 and save as SVG and PNG', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test('Open UTF-8 file and save as SVG', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-5252
    Description: A file with UTF-8 encoding opens and, when saved in a SVG preview, contains all characters
  */
    await openFileAndAddToCanvas('utf-8-svg-png.ket', page);

    await selectTopPanelButton(TopPanelButton.Save, page);
    await page.getByRole('button', { name: 'MDL Rxnfile V2000' }).click();
    await page.getByRole('option', { name: 'SVG Document' }).click();

    await takeEditorScreenshot(page);
  });

  test('Open UTF-8 file and save as PNG', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-5252
    Description: A file with UTF-8 encoding opens and, when saved in a PNG preview, contains all characters
  */
    await openFileAndAddToCanvas('utf-8-svg-png.ket', page);

    await selectTopPanelButton(TopPanelButton.Save, page);
    await page.getByRole('button', { name: 'MDL Rxnfile V2000' }).click();
    await page.getByRole('option', { name: 'PNG Image' }).click();

    await takeEditorScreenshot(page);
  });
});
