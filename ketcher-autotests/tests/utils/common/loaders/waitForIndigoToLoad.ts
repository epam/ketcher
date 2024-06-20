import { Page, expect } from '@playwright/test';
export const waitForIndigoToLoad = async (page: Page) => {
  if (process.env.ENABLE_POLYMER_EDITOR !== 'true') {
    const someIndigoButton = await page.getByTitle('Aromatize (Alt+A)');
    await expect(someIndigoButton).toBeEnabled({ timeout: 20_000 });
  }
};
