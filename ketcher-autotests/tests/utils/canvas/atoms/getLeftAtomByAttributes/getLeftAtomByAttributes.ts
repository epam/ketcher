import { Page } from '@playwright/test';
import { getAtomsCoordinatesByAttributes } from '@utils/canvas/atoms/getAtomsCoordinatesByAttributes/getAtomsCoordinatesByAttributes';
import { AtomAttributes } from '@utils/canvas/types';
import { AtomXy } from '@utils/canvas/types';

/**
 * Get left atom by attributes.
 * If there are no atoms after filtering throws error.
 * @param page - playwright page object
 * @param attributes - Atom attributes like {valence: 1, charge: 2} begin etc.
 * See AtomAttributes in @utils/canvas/types.ts for full list
 * @param index - number to search, starting from 0
 * @returns {AtomXy} - searched Atom left object + x, y coordinates
 * returned example {valence: 1, x: 123, y: 432 }
 */
export async function getLeftAtomByAttributes(
  page: Page,
  attributes: AtomAttributes
): Promise<AtomXy> {
  const result = await getAtomsCoordinatesByAttributes(page, attributes);

  return result[0];
}
