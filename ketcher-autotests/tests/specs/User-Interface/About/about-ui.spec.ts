import { test } from '@playwright/test';
import { AboutDialog } from '@tests/pages/molecules/canvas/AboutDialog';
import { TopRightToolbar } from '@tests/pages/molecules/TopRightToolbar';
import { takeEditorScreenshot, clickByLink, waitForPageInit } from '@utils';

test.describe('Open Ketcher', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('About floating windows appeared', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-12191
    Description: 'About' floating window appears
    */
    const buildVersion = AboutDialog(page).buildVersion;
    const buildTime = AboutDialog(page).buildTime;
    const buildIndigoVersion = AboutDialog(page).buildIndigoVersion;

    await TopRightToolbar(page).About();
    await takeEditorScreenshot(page, {
      mask: [buildVersion, buildTime, buildIndigoVersion],
    });
  });

  test('Links in About floating window', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-12193
    Description: 'About' floating window links check
    */
    await TopRightToolbar(page).About();

    await clickByLink(
      page,
      'https://lifescience.opensource.epam.com/ketcher/index.html',
    );
    await page.bringToFront();

    await clickByLink(
      page,
      'http://lifescience.opensource.epam.com/ketcher/#feedback',
    );
    await page.bringToFront();

    await clickByLink(page, 'http://lifescience.opensource.epam.com/');
    await page.bringToFront();

    await clickByLink(page, 'http://lifescience.opensource.epam.com/indigo/');
  });

  test('Close About floating window', async ({ page }) => {
    /* Test case: EPMLSOPKET-12192
    Description: Close 'About' window */
    await TopRightToolbar(page).About();
    await AboutDialog(page).closeByOk();
  });
});
