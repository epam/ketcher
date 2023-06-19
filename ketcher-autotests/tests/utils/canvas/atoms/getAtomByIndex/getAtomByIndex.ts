import { Page } from '@playwright/test';
import { getAtomsCoordinatesByAttributes } from '@utils/canvas/atoms/getAtomsCoordinatesByAttributes/getAtomsCoordinatesByAttributes';
import { AtomAttributes } from '@utils/canvas/types';
import { AtomXy } from '@utils/canvas/types';

/**
 * Filter atoms by its attributes and then get atom by index.
 * If there are no atoms after filtering throws error.
 * If index is incorrect throws error.
 * @param page - playwright page object
 * @param attributes - Atom attributes like label, charge, valence etc.
 * See AtomAttributes in @utils/canvas/types.ts for full list
 * @param index - number to search, starting from 0
 * @returns {AtomXy} - searched atom object + x, y coordinates
 * returned example {label:'C', charge: 0, valence: 1, x: 123, y: 432 }
 */
export async function getAtomByIndex(
  page: Page,
  attributes: AtomAttributes,
  index: number
): Promise<AtomXy> {
  const result = await getAtomsCoordinatesByAttributes(page, attributes);

  if (index > result.length - 1 || index < 0) {
    throw Error(
      'Incorrect index, please be sure that you index is less than the length of the atoms'
    );
  }

  return result[index];
}
