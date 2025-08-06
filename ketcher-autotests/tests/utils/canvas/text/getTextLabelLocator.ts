import { Page, Locator } from '@playwright/test';

type TextLabelLocatorOptions = {
  id?: string | number;
  text?: string;
};

export function getTextLabelLocator(
  page: Page,
  options: TextLabelLocatorOptions,
): Locator {
  const attributes: Record<string, string> = {};

  attributes['data-testid'] = 'text';

  if (options.id !== undefined) {
    attributes['data-text-id'] = String(options.id);
  }

  const attributeSelectors = Object.entries(attributes)
    .map(([key, value]) => `[${key}="${value}"]`)
    .join('');

  if (options.text) {
    return page.locator(`${attributeSelectors} >> text=${options.text}`);
  }

  return page.locator(attributeSelectors);
}
