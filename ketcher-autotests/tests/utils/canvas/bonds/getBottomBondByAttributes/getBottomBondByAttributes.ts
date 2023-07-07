import { Page } from '@playwright/test';
import { getBondsCoordinatesByAttributes } from '@utils/canvas/bonds';
import { BondAttributes, SORT_TYPE, BondXy } from '@utils/canvas/types';

/**
 * Get bottom bond by attributes.
 * If there are no bonds after filtering throws error.
 * @param page - playwright page object
 * @param attributes - Bond attributes like type, angle, begin etc.
 * See BondAttributes in @utils/canvas/types.ts for full list
 * @param index - number to search, starting from 0
 * @returns {BondXy} - searched Bond bottom object + x, y coordinates
 * returned example {type: 1, x: 123, y: 432 }
 */
export async function getBottomBondByAttributes(
  page: Page,
  attributes: BondAttributes,
): Promise<BondXy> {
  const result = await getBondsCoordinatesByAttributes(
    page,
    attributes,
    SORT_TYPE.DESC_Y,
  );

  return result[0];
}
