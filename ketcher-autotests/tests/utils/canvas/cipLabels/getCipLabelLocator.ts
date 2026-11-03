import { Page, Locator } from '@playwright/test';

type CipLabelLocatorOptions = {
  owner: 'atom' | 'bond';
  text?: string;
};

export function getCipLabelLocator(
  page: Page,
  options: CipLabelLocatorOptions,
): Locator {
  const label = page.locator(
    `[data-testid="cip-label"][data-cip-owner="${options.owner}"]`,
  );

  return options.text === undefined
    ? label
    : label.filter({ hasText: options.text });
}
