import { test } from '@playwright/test';
import {
  waitForPageInit,
  selectTopPanelButton,
  TopPanelButton,
  openFile,
  takeEditorScreenshot,
} from '@utils';

test.describe('PPTX files', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('open pptx file', async ({ page }) => {
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFile('PPTX/pptx-with-chem-draw.pptx', page);
    await takeEditorScreenshot(page);
    await page.getByText('Structure 2').click();
    await takeEditorScreenshot(page);
  });

  test('open empty pptx file', async ({ page }) => {
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFile('PPTX/pptx-empty.pptx', page);
    await takeEditorScreenshot(page);
  });
});
