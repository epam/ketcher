import { Page, expect } from '@playwright/test';
import { IndigoFunctionsToolbar } from '@tests/pages/molecules/IndigoFunctionsToolbar';

export const waitForIndigoToLoad = async (page: Page) => {
  const { aromatizeButton: someIndigoButton } = IndigoFunctionsToolbar(page);
  await expect(someIndigoButton).toBeEnabled({ timeout: 20_000 });
};
