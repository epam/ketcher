import { Locator, Page, expect } from '@playwright/test';
import { IndigoFunctionsToolbar } from '@tests/pages/molecules/IndigoFunctionsToolbar';

let someIndigoButton: Locator | null = null;
export const waitForIndigoToLoad = async (page: Page) => {
  if (someIndigoButton === null) {
    someIndigoButton = IndigoFunctionsToolbar(page).aromatizeButton;
  }
  await expect(someIndigoButton).toBeEnabled({ timeout: 20_000 });
};
