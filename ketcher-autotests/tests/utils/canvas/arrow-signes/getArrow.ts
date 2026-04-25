import { Page } from '@playwright/test';
import { CanvasArrowType } from '..';

export function getArrowLocator(
  page: Page,
  options: { arrowType?: CanvasArrowType; arrowId?: string | number } = {},
) {
  const attributes: Record<string, string> = {};

  attributes['data-testid'] = 'rxn-arrow';

  if (options.arrowType !== undefined) {
    attributes['data-arrowtype'] = String(options.arrowType);
  }
  if (options.arrowId !== undefined) {
    attributes['data-arrow-id'] = String(options.arrowId);
  }

  const attributeSelectors = Object.entries(attributes)
    .map(([key, value]) => `[${key}="${value}"]`)
    .join('');

  return page.locator(attributeSelectors);
}

export function getPlusLocator(page: Page) {
  return page.getByTestId('rxn-plus');
}
