import { Locator } from '@playwright/test';

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
