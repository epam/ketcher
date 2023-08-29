import { Page, expect } from '@playwright/test';
export const waitForIndigoToLoad = async (page: Page) => {
  const someIndigoButton = await page.getByTitle('Aromatize (Alt+A)');
  await expect(someIndigoButton).toBeEnabled();
};
