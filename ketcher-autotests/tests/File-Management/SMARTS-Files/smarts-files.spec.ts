import { test } from '@playwright/test';
import {
  takeEditorScreenshot,
  clickInTheMiddleOfTheScreen,
  waitForPageInit,
  pasteFromClipboardAndAddToCanvas,
  pasteFromClipboardAndOpenAsNewProject,
} from '@utils';

test.describe('Loading SMARTS files', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Loading SMARTS with custom query', async ({ page }) => {
    /*
    Test case: https://github.com/epam/Indigo/issues/1358
    Description: [!#6,!#7,!#8] should be loaded as custom query without any error
    */
    const smartsStringToPaste = '[!#6,!#7,!#8]';
    await pasteFromClipboardAndOpenAsNewProject(page, smartsStringToPaste);
  });

  test('Loading SMARTS with aromatic atom list', async ({ page }) => {
    /*
    Test case: https://github.com/epam/Indigo/issues/1332
    Description: c1-[#6]=[#6]-[#6]=[#6]-[c,n]=1 should be loaded as benzene with aromatic atom list (carbon and nitrogen)
    */
    const smartsStringToPaste = 'c1-[#6]=[#6]-[#6]=[#6]-[c,n]=1';
    await pasteFromClipboardAndAddToCanvas(page, smartsStringToPaste, false);
    await clickInTheMiddleOfTheScreen(page);
  });
});
