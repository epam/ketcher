import { Page, Locator } from '@playwright/test';

type ImageLocatorOptions = {
  id?: string | number;
  /** Only images drawn as the broken-image placeholder */
  placeholder?: boolean;
};

export function getImageLocator(
  page: Page,
  options: ImageLocatorOptions,
): Locator {
  const attributes: Record<string, string> = {};

  attributes['data-testid'] = 'image';

  if (options.id !== undefined) {
    attributes['data-image-id'] = String(options.id);
  }

  if (options.placeholder) {
    attributes['data-image-placeholder'] = 'true';
  }

  const attributeSelectors = Object.entries(attributes)
    .map(([key, value]) => `[${key}="${value}"]`)
    .join('');

  return page.locator(attributeSelectors);
}
