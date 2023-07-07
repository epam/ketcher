import { Page } from '@playwright/test';
import { getLeftTopBarSize } from '@utils/canvas/common/getLeftTopBarSize';
import { Atom } from 'ketcher-core';
import { AtomAttributes, SORT_TYPE, AtomXy } from '@utils/canvas/types';
import { findIntersectionFields } from '@utils/canvas/common/findIntersectionFields';
import { sortItems } from '@utils/canvas/common/sortItems';
import {
  NO_STRUCTURE_AT_THE_CANVAS_ERROR,
  STRUCTURE_NOT_FOUND_ERROR,
} from '@utils/canvas/constants';

/**
 * Common helper to calculate
 * left / right / top / bottom / byindex / first atoms functions
 * Throws error NO_STRUCTURE_AT_THE_CANVAS_ERROR
 * if the are no structures on the canvas
 * Throws STRUCTURE_NOT_FOUND_ERROR if can not find any atom
 * @param page - playwright page object
 * @param attrs - Atom attributes like type, angle, begin etc.
 * @param sortBy - sort type
 * @returns sorted atoms
 */
export async function getAtomsCoordinatesByAttributes(
  page: Page,
  attrs: AtomAttributes,
  sortBy: SORT_TYPE = SORT_TYPE.ASC_X
): Promise<AtomXy[] | []> {
  const { atoms, scale } = await page.evaluate(() => {
    return {
      // eslint-disable-next-line no-unsafe-optional-chaining
      atoms: [...window.ketcher?.editor?.struct()?.atoms?.values()],
      scale: window.ketcher?.editor?.options()?.scale,
    };
  });

  if (atoms.length === 0) {
    throw new Error(NO_STRUCTURE_AT_THE_CANVAS_ERROR);
  }

  const targets: Atom[] = findIntersectionFields(attrs, atoms) as Atom[];

  if (targets.length) {
    const { leftBarWidth, topBarHeight } = await getLeftTopBarSize(page);
    const coords = targets.map((target) => {
      return {
        ...target,
        x: target.pp.x * scale + leftBarWidth,
        y: target.pp.y * scale + topBarHeight,
      };
    });

    return sortItems(sortBy, coords);
  }

  throw new Error(STRUCTURE_NOT_FOUND_ERROR);
}
