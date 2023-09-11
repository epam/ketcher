import { test } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:4002/');
  await page.getByTestId('text').click();
});
