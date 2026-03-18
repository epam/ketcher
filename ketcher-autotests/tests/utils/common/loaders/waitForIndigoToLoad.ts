import { Page, expect } from '@playwright/test';
export const waitForIndigoToLoad = async (page: Page) => {
  const someIndigoButton = page.getByTitle('Aromatize (Alt+A)');
  await expect(someIndigoButton).toBeEnabled({ timeout: 20_000 });
};
