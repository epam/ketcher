import { test, expect } from '@playwright/test';
import { BottomToolbar } from '@tests/pages/molecules/BottomToolbar';
import { molV2000 } from '@tests/test-data/JSON/molV2000-result';
import { clickInTheMiddleOfTheScreen, waitForPageInit } from '@utils';

test('getting molV2000 from Ketcher API', async ({ page }) => {
  await waitForPageInit(page);
  await BottomToolbar(page).Benzene();
  await clickInTheMiddleOfTheScreen(page);
  const [, , molFile] = (
    await page.evaluate(() => window.ketcher.getMolfile())
  ).split('\n');
  const [, , molV2000Test] = molV2000.split('\n');
  expect(molFile).toBe(molV2000Test);
});
