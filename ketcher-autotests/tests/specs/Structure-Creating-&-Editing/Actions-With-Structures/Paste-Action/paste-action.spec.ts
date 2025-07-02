/* eslint-disable no-magic-numbers */
import { test } from '@playwright/test';
import {
  openFileAndAddToCanvas,
  takeEditorScreenshot,
  waitForPageInit,
  copyToClipboardByKeyboard,
  pasteFromClipboardByKeyboard,
  clickOnCanvas,
} from '@utils';
import { selectAllStructuresOnCanvas } from '@utils/canvas/selectSelection';
import { OpenStructureDialog } from '@tests/pages/common/OpenStructureDialog';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import {
  drawBenzeneRing,
  selectRingButton,
} from '@tests/pages/molecules/BottomToolbar';
import { TopToolbar } from '@tests/pages/molecules/TopToolbar';
import { RingButton } from '@tests/pages/constants/ringButton/Constants';

test.describe('Paste Tool', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('InfoModal with hotkey display for Paste action', async ({ page }) => {
    const anyStructure = 'Molfiles-V2000/mol-1855-to-open.mol';
    await openFileAndAddToCanvas(page, anyStructure);
    await selectAllStructuresOnCanvas(page);
    await TopToolbar(page).copy();
    await TopToolbar(page).paste();
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

    await selectRingButton(page, RingButton.Benzene);
    await clickOnCanvas(page, 200, 200);

    await selectRingButton(page, RingButton.Benzene);
    await clickOnCanvas(page, 400, 400);

    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);
    await CommonTopLeftToolbar(page).openFile();
    await OpenStructureDialog(page).pasteFromClipboard();
    await pasteFromClipboardByKeyboard(page);
    await takeEditorScreenshot(page);
  });
});
