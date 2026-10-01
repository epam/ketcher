import { Page, Locator } from '@playwright/test';

type SGroupLabelLocatorOptions = {
  labelText?: string;
};

export function getSGroupLabelLocator(
  page: Page,
  options: SGroupLabelLocatorOptions,
): Locator {
  const attributes: Record<string, string> = {};

  attributes['data-testid'] = 's-group-label';

  if (options.labelText) {
    attributes['data-label-text'] = options.labelText;
  }

  const attributeSelectors = Object.entries(attributes)
    .map(([key, value]) => `[${key}="${value}"]`)
    .join('');

  return page.locator(attributeSelectors);
}
