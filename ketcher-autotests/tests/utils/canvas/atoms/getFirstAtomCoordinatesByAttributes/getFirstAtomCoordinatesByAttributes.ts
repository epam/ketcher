import { Page } from '@playwright/test';
import { getAtomsCoordinatesByAttributes } from '@utils/canvas/atoms';
import { AtomAttributes, AtomXy } from '@utils/canvas/types';

/**
 * Get one Atom by attributes.
 * If there are no atoms after filtering throws error.
 * @param page - playwright page object
 * @param attributes - Atom attributes like type, angle, begin etc.
 * See AtomAttributes in @utils/canvas/types.ts for full list
 * @param index - number to search, starting from 0
 * @returns {AtomXy} - searched atom left object + x, y coordinates
 * returned example {type: 1, x: 123, y: 432 }
 */
export async function getFirstAtomCoordinatesByAttributes(
  page: Page,
  attrs: AtomAttributes,
): Promise<AtomXy> {
  const result = await getAtomsCoordinatesByAttributes(page, attrs);

  return result[0];
}
