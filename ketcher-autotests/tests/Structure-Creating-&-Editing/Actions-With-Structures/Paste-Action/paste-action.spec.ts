import { test } from '@playwright/test';
import {
  openFileAndAddToCanvas,
  takeEditorScreenshot,
  selectAction,
  waitForPageInit,
  selectAllStructuresOnCanvas,
  drawBenzeneRing,
  copyToClipboardByKeyboard,
  selectTopPanelButton,
  pasteFromClipboardByKeyboard,
} from '@utils';
import { TopPanelButton } from '@utils/selectors';

test.describe('Paste Tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('InfoModal with hotkey display for Paste action', async ({ page }) => {
    const anyStructure = 'Molfiles-V2000/mol-1855-to-open.mol';
    await openFileAndAddToCanvas(anyStructure, page);
    await selectAllStructuresOnCanvas(page);
    await selectAction(TopPanelButton.Copy, page);
    await selectAction(TopPanelButton.Paste, page);
    await page.getByTestId('infoModal-shortcut-for-paste').first().isVisible();
    await takeEditorScreenshot(page);
  });

  test('Canvas in Micro mode copied as MOL', async ({ page }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/6411
    Description: Canvas copied as MOL
    Case:
    1. Add Benzene ring to the canvas
    2. Copy by CTRL+C
    3. Open Paste from Canvas tool and paste by CTRL+V
    4. Check that the structure of file is MOL
    For now test working not as expected, because of the issue https://github.com/epam/ketcher/issues/6411
    After fixing the issue, the test should be updated.
    */
    await drawBenzeneRing(page);
    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);
    await selectTopPanelButton(TopPanelButton.Open, page);
    await page.getByText('Paste from clipboard').click();
    await pasteFromClipboardByKeyboard(page);
    await takeEditorScreenshot(page);
  });
});
