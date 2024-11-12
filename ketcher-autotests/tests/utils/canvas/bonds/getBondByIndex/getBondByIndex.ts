import { Page } from '@playwright/test';
import { getBondsCoordinatesByAttributes } from '@utils/canvas/bonds';
import { BondAttributes, BondXy } from '@utils/canvas/types';

/**
 * Filter bonds by its attributes and then get bond by index.
 * If there are no bonds after filtering throws error.
 * If index is incorrect throws error.
 * @param page - playwright page object
 * @param attributes - Bond attributes like type, angle, begin etc.
 * See BondAttributes in @utils/canvas/types.ts for full list
 * @param index - number to search, starting from 0
 * @returns {BondXy} - searched Bond object + x, y coordinates
 * returned example {type: 1, x: 123, y: 432 }
 */
export async function getBondByIndex(
  page: Page,
  attributes: BondAttributes,
  index: number,
): Promise<BondXy> {
  const result = await getBondsCoordinatesByAttributes(page, attributes);

  if (index > result.length - 1 || index < 0) {
    throw Error(
      'Incorrect index, please be sure that you index is less than the length of the bonds',
    );
  }

  return result[index];
}
