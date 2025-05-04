/* eslint-disable no-magic-numbers */
import { test } from '@playwright/test';
import {
  openFileAndAddToCanvas,
  takeEditorScreenshot,
  selectAction,
  waitForPageInit,
  selectAllStructuresOnCanvas,
  drawBenzeneRing,
  copyToClipboardByKeyboard,
  pasteFromClipboardByKeyboard,
  selectRing,
  RingButton,
  clickOnCanvas,
} from '@utils';
import { selectOpenFileTool } from '@tests/pages/common/TopLeftToolbar';
import { TopPanelButton } from '@utils/selectors';
import { OpenStructureDialog } from '@tests/pages/common/OpenStructureDialog';

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
    */
    await drawBenzeneRing(page);

    await selectRing(RingButton.Benzene, page);
    await clickOnCanvas(page, 200, 200);

    await selectRing(RingButton.Benzene, page);
    await clickOnCanvas(page, 400, 400);

    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);
    await selectOpenFileTool(page);
    await OpenStructureDialog(page).pasteFromClipboard();
    await pasteFromClipboardByKeyboard(page);
    await takeEditorScreenshot(page);
  });
});
