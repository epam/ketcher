import { Page, Locator } from '@playwright/test';

type AbbreviationLocatorOptions = {
  id?: string | number;
  name?: string;
  type?: string;
};

export function getAbbreviationLocator(
  page: Page,
  options: AbbreviationLocatorOptions,
): Locator {
  const attributes: Record<string, string> = {};

  if (options.id !== undefined) {
    attributes['data-sgroup-id'] = String(options.id);
  }
  if (options.name) {
    attributes['data-sgroup-name'] = options.name;
  }
  if (options.type) {
    attributes['data-sgroup-type'] = options.type;
  }

  const attributeSelectors = Object.entries(attributes)
    .map(([key, value]) => `[${key}="${value}"]`)
    .join('');

  return page.locator(attributeSelectors);
}
