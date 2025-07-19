import { Locator, Page } from '@playwright/test';
import { MoleculesTopToolbar } from '@tests/pages/molecules/MoleculesTopToolbar';

export async function waitForElementEnabled(
  locator: Locator,
  timeout = 10000,
): Promise<void> {
  await locator
    .page()
    .waitForFunction(
      (element) => !element?.hasAttribute('disabled'),
      await locator.elementHandle(),
      { timeout },
    );
}

export async function waitForElementDisabled(
  locator: Locator,
  timeout = 10000,
): Promise<void> {
  await locator
    .page()
    .waitForFunction(
      (element) => element?.hasAttribute('disabled'),
      await locator.elementHandle(),
      { timeout },
    );
}

export async function waitForOpenButtonEnabled(page: Page) {
  const copyButton = MoleculesTopToolbar(page).copyButton;
  await waitForElementEnabled(copyButton);
}
