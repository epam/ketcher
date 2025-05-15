/* eslint-disable no-inline-comments */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-magic-numbers */
import { Page, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  resetZoomLevelToDefault,
  pasteFromClipboardAndAddToCanvas,
  drawBenzeneRing,
  openSettings,
  openBondsSettingsSection,
  scrollToDownInSetting,
  setBondThicknessOptionUnit,
  setBondThicknessValue,
  pressButton,
} from '@utils';
import { waitForPageInit } from '@utils/common';
import { processResetToDefaultState } from '@utils/testAnnotations/resetToDefaultState';
import { TopLeftToolbar } from '@tests/pages/common/TopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/TopRightToolbar';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { MoleculesFileFormatType } from '@tests/pages/constants/fileFormats/microFileFormats';

async function setHighResolution(page: Page) {
  await page.getByText('low').click();
  await page.getByTestId('high-option').click();
}

let page: Page;

test.describe('Ketcher bugs in 2.26.0', () => {
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    await waitForPageInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: false,
      goToPeptides: false,
    });
  });

  test.afterEach(async ({ context: _ }, testInfo) => {
    await TopLeftToolbar(page).clearCanvas();
    await resetZoomLevelToDefault(page);
    await processResetToDefaultState(testInfo, page);
  });

  test.afterAll(async ({ browser }) => {
    await Promise.all(browser.contexts().map((context) => context.close()));
  });

  test('Case 1: The options for layout about smart-layout, aromatize-skip-superatoms and etc is sent as not undefined', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/ketcher/issues/5635
     * Description: The options for layout about smart-layout, aromatize-skip-superatoms and etc is sent as not undefined.
     * Scenario:
     * 1. Go to Micro
     * 2. Paste from clipboard
     * 3. Take screenshot
     */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await pasteFromClipboardAndAddToCanvas(
      page,
      'C1CC=CC=CC=CCC=CC=CC=CCC=CC=C1 |c:2,11,16,t:4,6,9,13,18|',
    );
    await takeEditorScreenshot(page);
  });

  test('Case 2: The picture is correct when image resolution high and bond thickness changing', async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6947
     * Bug: https://github.com/epam/ketcher/issues/5610
     * Description: The picture is correct when image resolution high and bond thickness changing.
     * Scenario:
     * 1. Add benzene ring to the Canvas
     * 2. Set image resolution High in the Settings
     * 3. Set bond thickness 2.6 pt in the Settings in the Bond section
     * 4. Click on Apply button
     * 5. Save to png (or svg)
     */
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await drawBenzeneRing(page);
    await openSettings(page);
    await setHighResolution(page);
    await openBondsSettingsSection(page);
    await scrollToDownInSetting(page);
    await setBondThicknessOptionUnit(page, 'px-option');
    await setBondThicknessValue(page, '2.6');
    await takeEditorScreenshot(page);
    await pressButton(page, 'Apply');
    await TopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MoleculesFileFormatType.SVGDocument,
    );
    await takeEditorScreenshot(page);
  });
});
