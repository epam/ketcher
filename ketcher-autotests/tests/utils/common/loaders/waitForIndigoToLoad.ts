import { Page } from '@playwright/test';
export const waitForIndigoToLoad = async (page: Page) => {
  const someIndigoButton = page.getByTitle('Aromatize (Alt+A)');
  if (someIndigoButton) {
    console.log();
  }
  // await expect(someIndigoButton).toBeEnabled({ timeout: 20_000 });
};
