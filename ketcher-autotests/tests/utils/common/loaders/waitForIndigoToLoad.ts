import { Page, expect } from '@playwright/test';

export const waitForIndigoToLoad = async (page: Page) => {
  const someIndigoButton = page.getByTestId('Aromatize button');
  await expect(someIndigoButton).toBeEnabled({ timeout: 20_000 });
};
