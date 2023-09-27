import { test, expect } from '@playwright/test';
import { molV2000 } from '@tests/test-data/molV2000-result';
import { clickInTheMiddleOfTheScreen, waitForPageInit } from '@utils';

test('getting molV2000 from Ketcher API', async ({ page }) => {
  await waitForPageInit(page);

  await page.getByRole('button', { name: 'Benzene (T)' }).click();

  await clickInTheMiddleOfTheScreen(page);

  const [, , molFile] = (
    await page.evaluate(() => window.ketcher.getMolfile())
  ).split('\n');
  const [, , molV2000Test] = molV2000.split('\n');

  expect(molFile).toBe(molV2000Test);
});
