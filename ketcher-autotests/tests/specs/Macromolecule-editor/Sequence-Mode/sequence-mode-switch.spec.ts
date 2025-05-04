import { test, expect } from '@playwright/test';
import {
  selectSequenceLayoutModeTool,
  typeAllEnglishAlphabet,
  takeEditorScreenshot,
  takeTopToolbarScreenshot,
  waitForPageInit,
} from '@utils';
import { turnOnMacromoleculesEditor } from '@tests/pages/common/TopRightToolbar';

test.describe('Sequence edit mode', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await TopRightToolbar(page).turnOnMacromoleculesEditor();
    await selectSequenceLayoutModeTool(page);
  });

  const typingModes = [
    { buttonTestId: 'RNABtn', expectedTitle: 'RNA (Ctrl+Alt+R)', type: 'RNA' },
    { buttonTestId: 'DNABtn', expectedTitle: 'DNA (Ctrl+Alt+D)', type: 'DNA' },
    {
      buttonTestId: 'PEPTIDEBtn',
      expectedTitle: 'Peptides (Ctrl+Alt+P)',
      type: 'Peptide',
    },
  ];

  test.describe('Check New approach and UI for switching between types in sequence mode', () => {
    for (const { buttonTestId, expectedTitle, type } of typingModes) {
      test(`should switch to ${type} mode and verify UI changes`, async ({
        page,
      }) => {
        /* 
        Test case: Hotkeys https://github.com/epam/ketcher/issues/5554
        Description: Verify that clicking on ${type} button switches to the correct typing mode and displays correct title.
        */

        await takeTopToolbarScreenshot(page);

        const button = page.getByTestId(buttonTestId);
        await expect(button).toHaveAttribute('title', expectedTitle);

        await button.click();
        await takeTopToolbarScreenshot(page);

        await typeAllEnglishAlphabet(page);
        await takeEditorScreenshot(page);
      });
    }
  });
});
