import { test } from '@playwright/test';
import {
  selectTopPanelButton,
  takeEditorScreenshot,
  TopPanelButton,
  clickByLink,
} from '@utils';

test.describe('Open Ketcher', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test('About floating windows appeared', async ({ page }) => {
    /* 
    Test case: EPMLSOPKET-12191
    Description: 'About' floating window appears
    */
    await selectTopPanelButton(TopPanelButton.About, page);

    await takeEditorScreenshot(page);
  });

  test('Links in About floating window', async ({ page }) => {
    /* 
    Test case: EPMLSOPKET-12193
    Description: 'About' floating window links check
    */
    await selectTopPanelButton(TopPanelButton.About, page);

    await clickByLink(
      page,
      'https://lifescience.opensource.epam.com/ketcher/index.html'
    );
    await page.bringToFront();

    await clickByLink(
      page,
      'http://lifescience.opensource.epam.com/ketcher/#feedback'
    );
    await page.bringToFront();

    await clickByLink(page, 'http://lifescience.opensource.epam.com/');
    await page.bringToFront();

    await clickByLink(page, 'http://lifescience.opensource.epam.com/indigo/');
  });

  test('Close About floating window', async ({ page }) => {
    /* Test case: EPMLSOPKET-12192
    Description: Close 'About' window */
    await selectTopPanelButton(TopPanelButton.About, page);
    await page.getByRole('banner').getByRole('button').click();
  });
});
