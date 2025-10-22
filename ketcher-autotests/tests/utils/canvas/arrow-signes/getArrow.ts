import { Page } from '@playwright/test';

export function getArrowLocator(page: Page, options: { arrowType?: Arrows }) {
  const attributes: Record<string, string> = {};

  attributes['data-testid'] = 'rxn-arrow';

  if (options.arrowType !== undefined) {
    attributes['data-arrowtype'] = String(options.arrowType);
  }

  const attributeSelectors = Object.entries(attributes)
    .map(([key, value]) => `[${key}="${value}"]`)
    .join('');

  return page.locator(attributeSelectors);
}

export function getPlusLocator(page: Page) {
  return page.getByTestId('rxn-plus');
}
