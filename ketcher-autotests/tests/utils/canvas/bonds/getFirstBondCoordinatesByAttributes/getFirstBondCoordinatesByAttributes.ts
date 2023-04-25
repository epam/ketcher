import { Page } from '@playwright/test';
import { getBondsCoordinatesByAttributes } from '@utils/canvas/bonds/getBondsCoordinatesByAttributes/getBondsCoordinatesByAttributes';
import { BondAttributes } from '@utils/canvas/types';
import { BondXy } from '@utils/canvas/types';

/**
 * Get one bond by attributes.
 * If there are no bonds after filtering throws error.
 * @param page - playwright page object
 * @param attributes - Bond attributes like type, angle, begin etc.
 * See BondAttributes in @utils/canvas/types.ts for full list
 * @param index - number to search, starting from 0
 * @returns {BondXy} - searched Bond left object + x, y coordinates
 * returned example {type: 1, x: 123, y: 432 }
 */
export async function getFirstBondCoordinatesByAttributes(
  page: Page,
  attrs: BondAttributes
): Promise<BondXy> {
  const result = await getBondsCoordinatesByAttributes(page, attrs);

  return result[0];
}
