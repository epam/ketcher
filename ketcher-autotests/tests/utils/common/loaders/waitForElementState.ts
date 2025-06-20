import { Locator, Page } from '@playwright/test';
import { TopToolbar } from '@tests/pages/molecules/TopToolbar';

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
  const copyButton = await TopToolbar(page).copyButton;
  await waitForElementEnabled(copyButton);
}
