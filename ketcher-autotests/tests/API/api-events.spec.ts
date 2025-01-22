import { expect, test } from '@playwright/test';
import { waitForPageInit, withTimeout } from '@utils';
import { setMolecule } from '@utils/formats';

test.describe('Tests for API events subscription', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Subscribe event change', async ({ page }) => {
    /* GitHub ticket: https://github.com/epam/ketcher/issues/6200
     * Description: Subscription to change event
     */
    const changePromise = page.evaluate(() => {
      return new Promise<void>((resolve) => {
        window.ketcher.editor.subscribe('change', () => {
          console.log('ketcher.editor event change fired');
          resolve();
        });
        console.log(`ketcher.editor event 'change' subscribed`);
      });
    });
    await setMolecule(page, 'c1ccccc1');
    await expect(withTimeout(changePromise)).resolves.not.toThrow();
  });
});
